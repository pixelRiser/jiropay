<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

/**
 * Notification in-app — à créer systématiquement en plus de chaque email
 * envoyé à un admin ou un user (frontend/README.md). Toujours appelé dans un
 * try/catch côté appelant : une notification ratée ne doit jamais bloquer le
 * flux métier principal (email, création de ticket, etc.).
 */
class NotificationService
{
    public static function pour(User $user, string $type, string $title, string $message, ?string $href = null): Notification
    {
        return Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'href' => $href,
        ]);
    }

    /**
     * Pour les événements qui concernent tous les admins (ex : nouvelle
     * demande d'agent) — une notification par admin, pas de diffusion
     * partagée (chacun peut la lire/acquitter indépendamment).
     */
    public static function pourAdmins(string $type, string $title, string $message, ?string $href = null): void
    {
        User::where('role', 'admin')->get()->each(
            fn (User $admin) => self::pour($admin, $type, $title, $message, $href)
        );
    }
}
