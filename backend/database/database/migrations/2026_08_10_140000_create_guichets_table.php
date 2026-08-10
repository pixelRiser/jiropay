<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guichets', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('lieu');
            $table->enum('statut', ['actif', 'inactif'])->default('actif');
            $table->enum('zone', ['ville', 'hors_ville'])->default('ville');
            $table->unsignedInteger('montant_frais_defaut')->default(0);
            $table->unsignedInteger('montant_commission_defaut')->default(0);
            $table->unsignedInteger('solde_commission')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guichets');
    }
};
