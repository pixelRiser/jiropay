<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['client', 'agent', 'admin'])->default('client')->after('email');
            $table->string('phone')->nullable()->after('role');
            $table->foreignId('guichet_id')->nullable()->after('phone')->constrained('guichets')->nullOnDelete();
            // Seule l'inscription d'un agent force ce champ à 'pending' — clients et
            // admins restent toujours 'approved'. Un agent 'pending'/'rejected' ne
            // peut pas se connecter (voir AuthController::login()).
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('approved')->after('guichet_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('guichet_id');
            $table->dropColumn(['role', 'phone', 'status']);
        });
    }
};
