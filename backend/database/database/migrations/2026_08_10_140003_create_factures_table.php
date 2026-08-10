<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('factures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients');
            $table->date('mois_facture');
            // Ariary — toujours un entier, jamais de float (même convention que pixel-rise).
            $table->unsignedInteger('montant_du');
            $table->enum('statut', ['en_attente', 'paye_plateforme', 'paye_jirama', 'valide'])->default('en_attente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('factures');
    }
};
