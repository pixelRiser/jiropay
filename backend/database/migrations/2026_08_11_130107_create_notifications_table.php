<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Notifications in-app — complément systématique de chaque email envoyé
     * à un admin ou un user, pour les cas fréquents où l'email n'est pas
     * consulté immédiatement mais l'utilisateur est déjà présent dans
     * l'application (frontend/README.md — même principe que le système
     * pixel-rise). Table volontairement simple (pas de morph
     * notifiable_type/notifiable_id) : les destinataires de JiroPay sont
     * toujours un `User` précis.
     */
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type');
            $table->string('title');
            $table->text('message');
            $table->string('href')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
