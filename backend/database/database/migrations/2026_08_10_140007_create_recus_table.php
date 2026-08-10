<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paiement_id')->constrained('paiements');
            $table->string('numero_recu');
            $table->timestamp('date_emission')->nullable();
            $table->enum('destinataire', ['compte_client', 'compte_guichet']);
            $table->boolean('envoye')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recus');
    }
};
