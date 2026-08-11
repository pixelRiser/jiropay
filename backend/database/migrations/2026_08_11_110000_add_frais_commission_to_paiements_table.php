<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Le client paie facture.montant_du + des frais de service (montant fixe
     * du guichet référent, guichets.montant_frais_defaut) — pas juste
     * montant_du comme avant. Ces deux valeurs sont figées à l'initiation du
     * paiement (jamais recalculées après coup, même si les tarifs du guichet
     * changent ensuite) — voir PaiementController::initier() et le
     * commentaire équivalent sur la table commissions.
     */
    public function up(): void
    {
        Schema::table('paiements', function (Blueprint $table) {
            $table->unsignedInteger('montant_frais')->nullable()->after('montant');
            $table->unsignedInteger('montant_commission')->nullable()->after('montant_frais');
        });
    }

    public function down(): void
    {
        Schema::table('paiements', function (Blueprint $table) {
            $table->dropColumn(['montant_frais', 'montant_commission']);
        });
    }
};
