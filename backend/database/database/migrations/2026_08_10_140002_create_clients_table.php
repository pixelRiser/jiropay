<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('adresse')->nullable();
            $table->string('numero_abonne_jirama');
            // Requis même pour une inscription directe en ligne — le rattachement
            // est fixé à l'inscription et ne peut être changé que par un admin.
            $table->foreignId('guichet_referent_id')->constrained('guichets');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
