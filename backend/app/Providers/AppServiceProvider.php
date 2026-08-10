<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Le lien de réinitialisation doit pointer vers le frontend jiropay
        // (SPA/SSR séparé) — pas vers une route/vue Blade côté backend. Aussi
        // utilisé pour l'activation de compte (client créé par un guichet, voir
        // AuthController::createClientByStaff()) — même lien, même écran.
        ResetPassword::createUrlUsing(function (User $user, string $token) {
            return config('app.url') . '/reinitialiser-mot-de-passe?token=' . $token . '&email=' . urlencode($user->email);
        });
    }
}
