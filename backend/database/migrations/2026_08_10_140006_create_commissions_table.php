<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paiement_id')->constrained('paiements');
            $table->foreignId('guichet_id')->constrained('guichets');
            // Montants figés au moment du paiement (valeurs du guichet référent à
            // cet instant) — un changement ultérieur des tarifs du guichet ne doit
            // jamais modifier une commission déjà enregistrée.
            $table->unsignedInteger('montant_facture');
            $table->unsignedInteger('montant_frais');
            $table->unsignedInteger('part_plateforme');
            $table->unsignedInteger('montant_commission');
            $table->enum('statut', ['creditee', 'reversee'])->default('creditee');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commissions');
    }
};
