<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('factures', function (Blueprint $table) {
            // Référence facture JIRAMA (saisie ou scannée par le client) — voir
            // l'app Jirakaiky utilisée par les guichets, ex: "106 260 626 103 856".
            $table->string('reference_facture')->nullable()->after('client_id');
            // Le titulaire du compteur inscrit sur la facture n'est pas toujours
            // le client qui paie (facture réglée pour un tiers) — on l'enregistre
            // tel quel, séparément de client.numero_abonne_jirama.
            $table->string('nom_titulaire')->nullable()->after('reference_facture');
        });
    }

    public function down(): void
    {
        Schema::table('factures', function (Blueprint $table) {
            $table->dropColumn(['reference_facture', 'nom_titulaire']);
        });
    }
};
