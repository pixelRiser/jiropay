<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Le reçu client doit reproduire à l'identique le vrai "TICKET D'ACQUIT"
     * JIRAMA/JIRAKAIKY — l'admin transcrit manuellement les champs du ticket
     * physique/TPE après avoir traité le paiement JIRAMA (workflow TPE mis de
     * côté en phase 2, repris ici).
     *
     * Seuls les champs qui varient réellement d'un ticket à l'autre sont
     * stockés ici. Tout ce qui est identique sur tous les tickets — logo,
     * "JIRO sy RANO MALAGASY", "TICKET D'ACQUIT", "AGENCE : JIRAKAIKY -
     * ANKORONDRANO", les deux codes caisse (999EQ / EQ-0177), et les messages
     * de pied de ticket (qui diffèrent selon le type facture/carte, mais sont
     * fixes POUR un type donné) — est codé en dur dans les vues Blade
     * (recus.ticket-facture / recus.ticket-carte), pas saisi par l'admin.
     *
     * Deux jeux de champs selon factures.type : 'facture'
     * (ref_facture/mois_facture/montant_facture) ou 'carte'
     * (installation/compteur/quantité/taxes/jeton) — les champs de paiement
     * (mvola, ref_transaction...) sont communs aux deux mais restent saisis
     * à chaque fois (données de transaction réelles, jamais fixes).
     *
     * numero_transaction_tpe/montant_tpe (ancien schéma minimal, jamais
     * utilisés en donnée réelle) sont remplacés par ces champs plus précis.
     */
    public function up(): void
    {
        Schema::table('paiements_jirama', function (Blueprint $table) {
            $table->dropColumn(['numero_transaction_tpe', 'montant_tpe']);

            // En-tête variable du ticket (le reste est fixe, voir vues Blade)
            $table->string('numero_ticket')->nullable()->after('paiement_id');
            $table->timestamp('date_operation')->nullable()->after('numero_ticket');
            $table->string('nom_client')->nullable()->after('date_operation');

            // Spécifique type 'facture'
            $table->string('ref_client')->nullable()->after('nom_client');
            $table->string('ref_facture')->nullable()->after('ref_client');
            $table->string('mois_facture')->nullable()->after('ref_facture');
            $table->unsignedInteger('montant_facture')->nullable()->after('mois_facture');

            // Spécifique type 'carte'
            $table->string('installation')->nullable()->after('montant_facture');
            $table->string('commune_code')->nullable()->after('installation');
            $table->string('compteur')->nullable()->after('commune_code');
            $table->string('type_prepaye')->nullable()->after('compteur');
            $table->string('quantite_achetee')->nullable()->after('type_prepaye');
            $table->unsignedInteger('mont_cons')->nullable()->after('quantite_achetee');
            $table->unsignedInteger('prime_fixe')->nullable()->after('mont_cons');
            $table->unsignedInteger('redevance')->nullable()->after('prime_fixe');
            $table->unsignedInteger('total_jirama')->nullable()->after('redevance');
            $table->unsignedInteger('taxe_comm')->nullable()->after('total_jirama');
            $table->unsignedInteger('sur_taxe_comm')->nullable()->after('taxe_comm');
            $table->unsignedInteger('fne')->nullable()->after('sur_taxe_comm');
            $table->unsignedInteger('tva')->nullable()->after('fne');
            $table->unsignedInteger('total_taxes')->nullable()->after('tva');
            $table->string('jeton')->nullable()->after('total_taxes');

            // Bloc paiement, commun aux deux types (toujours variable)
            $table->unsignedInteger('a_payer')->nullable()->after('jeton');
            $table->string('methode_paiement_libelle')->nullable()->after('a_payer');
            $table->string('ref_transaction')->nullable()->after('methode_paiement_libelle');
            $table->string('numero_payeur')->nullable()->after('ref_transaction');
            $table->string('operateur')->nullable()->after('numero_payeur');
            $table->string('id_interne')->nullable()->after('operateur');
            $table->unsignedInteger('frais_jirakaiky')->nullable()->after('id_interne');
            $table->unsignedInteger('frais_operateur')->nullable()->after('frais_jirakaiky');
        });
    }

    public function down(): void
    {
        Schema::table('paiements_jirama', function (Blueprint $table) {
            $table->dropColumn([
                'numero_ticket', 'date_operation', 'nom_client',
                'ref_client', 'ref_facture', 'mois_facture', 'montant_facture',
                'installation', 'commune_code', 'compteur', 'type_prepaye', 'quantite_achetee',
                'mont_cons', 'prime_fixe', 'redevance', 'total_jirama', 'taxe_comm', 'sur_taxe_comm',
                'fne', 'tva', 'total_taxes', 'jeton',
                'a_payer', 'methode_paiement_libelle', 'ref_transaction', 'numero_payeur',
                'operateur', 'id_interne', 'frais_jirakaiky', 'frais_operateur',
            ]);
            $table->string('numero_transaction_tpe')->nullable();
            $table->unsignedInteger('montant_tpe')->nullable();
        });
    }
};
