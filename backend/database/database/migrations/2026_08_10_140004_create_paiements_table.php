<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('facture_id')->constrained('factures');
            $table->foreignId('client_id')->constrained('clients');
            // Copié depuis clients.guichet_referent_id au moment du paiement — jamais
            // recalculé après coup, pour garder un historique fiable même si le
            // rattachement du client change plus tard (voir clients.guichet_referent_id).
            $table->foreignId('guichet_referent_id')->constrained('guichets');
            $table->enum('initiateur', ['client', 'guichet']);
            $table->enum('methode', ['orange_money', 'mvola']);
            $table->unsignedInteger('montant');
            $table->string('reference_mobile_money')->nullable();
            $table->enum('statut_mobile_money', ['en_attente', 'confirme', 'echoue'])->default('en_attente');
            $table->timestamp('date_paiement')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiements');
    }
};
