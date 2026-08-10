<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Compte admin par défaut — vérifié automatiquement (contrairement aux
        // comptes client/agent qui doivent toujours passer par la vérification
        // email, et pour un agent, l'approbation admin).
        if (! User::where('email', 'jiropay@admin.com')->exists()) {
            $admin = User::create([
                'name'     => 'Admin JiroPay',
                'email'    => 'jiropay@admin.com',
                'password' => 'JiroPay@2026',
                'role'     => 'admin',
                'status'   => 'approved',
            ]);
            $admin->markEmailAsVerified();
        }
    }
}
