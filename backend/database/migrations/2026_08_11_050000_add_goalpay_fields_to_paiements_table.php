<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Intégration GoalPay : la création d'une commande GoalPay ne prend pas
     * de paramètre "méthode" (le client choisit Orange Money/Telma sur la
     * page GoalPay elle-même) — 'methode' devient donc facultatif. On stocke
     * l'URL de checkout à laquelle rediriger le client, et un message
     * d'erreur éventuel renvoyé par le webhook (payment.failed/expired).
     * 'reference_mobile_money' est réutilisée pour stocker l'order_reference
     * GoalPay (ex: REF_...), qui sert à retrouver le paiement au webhook.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE paiements MODIFY methode ENUM('orange_money', 'mvola', 'airtel_money') NULL");

        Schema::table('paiements', function (Blueprint $table) {
            $table->text('checkout_url')->nullable()->after('reference_mobile_money');
            $table->string('erreur_gateway')->nullable()->after('statut_mobile_money');
        });
    }

    public function down(): void
    {
        Schema::table('paiements', function (Blueprint $table) {
            $table->dropColumn(['checkout_url', 'erreur_gateway']);
        });

        DB::statement("ALTER TABLE paiements MODIFY methode ENUM('orange_money', 'mvola', 'airtel_money') NOT NULL");
    }
};
