<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Guichet;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password as PasswordBroker;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|string|email|max:255|unique:users,email',
            'password'   => ['required', 'confirmed', Password::min(8)],
            'phone'      => 'required|string|max:30',
            'role'       => 'nullable|string|in:client,agent',
            'guichet_id' => ['required', 'integer', 'exists:guichets,id'],
            // Client uniquement
            'numero_abonne_jirama' => 'required_if:role,client|nullable|string|max:100',
            'adresse'              => 'nullable|string|max:255',
        ], [
            'name.required'       => 'Le nom est obligatoire.',
            'email.required'      => "L'email est obligatoire.",
            'email.email'         => 'Adresse email invalide.',
            'email.unique'        => 'Un compte existe déjà avec cet email.',
            'password.required'   => 'Le mot de passe est obligatoire.',
            'password.confirmed'  => 'La confirmation ne correspond pas au mot de passe.',
            'phone.required'      => 'Le téléphone est obligatoire.',
            'guichet_id.required' => 'Le guichet est obligatoire.',
            'guichet_id.exists'   => 'Guichet introuvable.',
            'numero_abonne_jirama.required_if' => "Le numéro d'abonné JIRAMA est obligatoire.",
        ]);

        $role = $validated['role'] ?? 'client';
        $guichet = Guichet::where('id', $validated['guichet_id'])->where('statut', 'actif')->firstOrFail();

        $user = DB::transaction(function () use ($validated, $role, $guichet) {
            $user = User::create([
                'name'       => $validated['name'],
                'email'      => $validated['email'],
                'password'   => $validated['password'],
                'phone'      => $validated['phone'],
                'role'       => $role,
                // Un agent est en attente d'approbation admin ; client/admin restent 'approved'.
                'status'     => $role === 'agent' ? 'pending' : 'approved',
                'guichet_id' => $role === 'agent' ? $guichet->id : null,
            ]);

            if ($role === 'client') {
                Client::create([
                    'user_id'              => $user->id,
                    'adresse'              => $validated['adresse'] ?? null,
                    'numero_abonne_jirama' => $validated['numero_abonne_jirama'],
                    'guichet_referent_id'  => $guichet->id,
                ]);
            }

            return $user;
        });

        // Pas de connexion automatique — le compte doit d'abord être vérifié par
        // email avant de pouvoir se connecter (voir login() ci-dessous).
        $user->sendEmailVerificationNotification();

        $message = $role === 'agent'
            ? 'Compte créé. Vérifiez votre boîte mail pour activer votre compte, puis attendez la validation d\'un administrateur avant de pouvoir vous connecter.'
            : 'Compte créé. Vérifiez votre boîte mail pour activer votre compte.';

        return response()->json(['success' => true, 'message' => $message], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ], [
            'email.required'    => "L'email est obligatoire.",
            'email.email'       => 'Adresse email invalide.',
            'password.required' => 'Le mot de passe est obligatoire.',
        ]);

        if (!Auth::attempt($validated)) {
            return response()->json([
                'success' => false,
                'message' => 'Email ou mot de passe incorrect.',
            ], 422);
        }

        $user = Auth::user();

        if (!$user->hasVerifiedEmail()) {
            Auth::logout();
            return response()->json([
                'success'     => false,
                'reason_code' => 'EMAIL_NOT_VERIFIED',
                'message'     => "Votre email n'est pas encore vérifié. Consultez votre boîte mail ou demandez un nouvel envoi.",
            ], 403);
        }

        if ($user->role === 'agent' && $user->status !== 'approved') {
            Auth::logout();
            $reason = $user->status === 'rejected' ? 'AGENT_REJECTED' : 'AGENT_PENDING_APPROVAL';
            $message = $user->status === 'rejected'
                ? "Votre demande de compte agent a été rejetée. Contactez l'administrateur."
                : "Votre compte agent est en attente de validation par un administrateur.";

            return response()->json([
                'success'     => false,
                'reason_code' => $reason,
                'message'     => $message,
            ], 403);
        }

        $request->session()->regenerate();

        return response()->json(['success' => true, 'data' => $this->userPayload($user)]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['success' => true]);
    }

    public function me(Request $request): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json(['success' => false, 'message' => 'Non authentifié.'], 401);
        }

        return response()->json(['success' => true, 'data' => $this->userPayload(Auth::user())]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password'         => ['required', 'confirmed', Password::min(8)],
        ], [
            'current_password.required'         => 'Le mot de passe actuel est obligatoire.',
            'current_password.current_password' => "Le mot de passe actuel est incorrect.",
            'password.required'                 => 'Le nouveau mot de passe est obligatoire.',
            'password.confirmed'                => 'La confirmation ne correspond pas au nouveau mot de passe.',
        ]);

        $request->user()->update(['password' => $validated['password']]);

        return response()->json(['success' => true, 'message' => 'Mot de passe mis à jour.']);
    }

    /**
     * Envoie un email avec un lien de réinitialisation. Retourne toujours le
     * même message générique, que l'email existe ou non (anti-énumération
     * de comptes) — sauf en cas de throttle réel, où on informe l'attente.
     * Réutilisé tel quel pour l'activation d'un compte client créé par un
     * guichet (voir createClientByStaff()) — pas de mécanisme séparé.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|string|email',
        ], [
            'email.required' => "L'email est obligatoire.",
            'email.email'    => 'Adresse email invalide.',
        ]);

        $status = PasswordBroker::sendResetLink($request->only('email'));

        if ($status === PasswordBroker::RESET_THROTTLED) {
            return response()->json([
                'success' => false,
                'message' => 'Une demande a déjà été envoyée récemment. Vérifiez votre boîte mail ou réessayez dans quelques minutes.',
            ], 429);
        }

        return response()->json([
            'success' => true,
            'message' => 'Si un compte existe avec cet email, un lien de réinitialisation vient d\'être envoyé.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token'    => 'required|string',
            'email'    => 'required|string|email',
            'password' => ['required', 'confirmed', Password::min(8)],
        ], [
            'token.required'     => 'Lien de réinitialisation invalide.',
            'email.required'     => "L'email est obligatoire.",
            'email.email'        => 'Adresse email invalide.',
            'password.required'  => 'Le nouveau mot de passe est obligatoire.',
            'password.confirmed' => 'La confirmation ne correspond pas au nouveau mot de passe.',
        ]);

        $status = PasswordBroker::reset(
            $validated,
            function (User $user, string $password) {
                $user->update(['password' => $password]);
                // Un compte créé par un guichet (email_verified_at = null) est
                // implicitement activé au moment où il définit son mot de passe —
                // pas d'email de vérification séparé pour ce chemin.
                if (!$user->hasVerifiedEmail()) {
                    $user->markEmailAsVerified();
                }
                event(new PasswordReset($user));
            },
        );

        if ($status !== PasswordBroker::PASSWORD_RESET) {
            return response()->json([
                'success' => false,
                'message' => 'Ce lien de réinitialisation est invalide ou a expiré. Refaites une demande.',
            ], 422);
        }

        return response()->json(['success' => true, 'message' => 'Mot de passe réinitialisé — vous pouvez vous connecter.']);
    }

    public function verifyEmail(Request $request, string $id, string $hash): \Illuminate\Http\RedirectResponse
    {
        $user = User::findOrFail($id);

        if (!hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            abort(403, 'Lien de vérification invalide.');
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        return redirect(config('app.url') . '/auth?verified=1');
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|string|email',
        ], [
            'email.required' => "L'email est obligatoire.",
            'email.email'    => 'Adresse email invalide.',
        ]);

        $user = User::where('email', $request->input('email'))->first();

        if ($user && !$user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();
        }

        return response()->json([
            'success' => true,
            'message' => "Si ce compte existe et n'est pas encore vérifié, un nouvel email vient d'être envoyé.",
        ]);
    }

    /**
     * Un guichet/admin enregistre un client sans que celui-ci n'ait encore
     * défini de mot de passe : mot de passe aléatoire inutilisable + email
     * non vérifié, puis réutilisation du flux "mot de passe oublié" existant
     * pour que le client active son compte lui-même.
     */
    public function createClientByStaff(array $data, int $guichetId): User
    {
        $user = DB::transaction(function () use ($data, $guichetId) {
            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => Str::random(40),
                'phone'    => $data['phone'] ?? null,
                'role'     => 'client',
                'status'   => 'approved',
            ]);

            Client::create([
                'user_id'              => $user->id,
                'adresse'              => $data['adresse'] ?? null,
                'numero_abonne_jirama' => $data['numero_abonne_jirama'],
                'guichet_referent_id'  => $guichetId,
            ]);

            return $user;
        });

        PasswordBroker::sendResetLink(['email' => $user->email]);

        return $user;
    }

    private function userPayload(User $user): array
    {
        return [
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'role'       => $user->role,
            'phone'      => $user->phone,
            'guichet_id' => $user->guichet_id,
            'status'     => $user->status,
        ];
    }
}
