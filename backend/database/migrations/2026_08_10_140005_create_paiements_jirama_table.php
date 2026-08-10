<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Flux sortant — paiement manuel de JIRAMA par l'admin via TPE physique
        // (équivalent de l'ancien "transactions_tpe").
        Schema::create('paiements_jirama', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paiement_id')->constrained('paiements');
            $table->string('numero_transaction_tpe')->nullable();
            $table->unsignedInteger('montant_tpe')->nullable();
            $table->foreignId('saisi_par_admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('date_saisie')->nullable();
            $table->enum('statut_validation', ['en_attente', 'validee', 'rejetee'])->default('en_attente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiements_jirama');
    }
};
