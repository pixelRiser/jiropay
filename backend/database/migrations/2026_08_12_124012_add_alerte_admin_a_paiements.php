<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * GoalPay n'expose aucun endpoint de consultation de statut — leur doc dit
     * explicitement que le webhook est "la seule source fiable". Ce champ sert
     * de garde-fou : dès qu'un paiement reste "en_attente" trop longtemps (le
     * lien GoalPay expire après ~10 min), on alerte l'admin une seule fois
     * (voir VerifierPaiementsBloquesCommand) au lieu de laisser le client sans
     * aucun retour indéfiniment.
     */
    public function up(): void
    {
        Schema::table('paiements', function (Blueprint $table) {
            $table->timestamp('alerte_admin_envoyee_at')->nullable()->after('erreur_gateway');
        });
    }

    public function down(): void
    {
        Schema::table('paiements', function (Blueprint $table) {
            $table->dropColumn('alerte_admin_envoyee_at');
        });
    }
};
