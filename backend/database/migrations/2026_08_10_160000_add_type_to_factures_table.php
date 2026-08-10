<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Deux façons de payer JIRAMA, deux jeux de champs distincts (voir l'app
     * terrain Jirakaiky) :
     * - 'facture'  : facture postpayée classique — référence facture + nom
     *                du titulaire inscrit dessus.
     * - 'carte'    : achat de crédit prépayé ("facture carte") — référence
     *                client + n° compteur, comme un rechargement de crédit
     *                téléphonique. Le compteur rechargé n'est pas forcément
     *                celui du client connecté.
     */
    public function up(): void
    {
        Schema::table('factures', function (Blueprint $table) {
            $table->enum('type', ['facture', 'carte'])->default('facture')->after('client_id');
            $table->string('numero_compteur')->nullable()->after('nom_titulaire');
        });
    }

    public function down(): void
    {
        Schema::table('factures', function (Blueprint $table) {
            $table->dropColumn(['type', 'numero_compteur']);
        });
    }
};
