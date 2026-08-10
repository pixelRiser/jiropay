<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * L'app terrain (Jirakaiky) propose Mvola + Airtel Money — on ajoute
     * airtel_money à l'énum sans retirer orange_money (cahier des charges
     * initial), les trois restent disponibles.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE paiements MODIFY methode ENUM('orange_money', 'mvola', 'airtel_money') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE paiements MODIFY methode ENUM('orange_money', 'mvola') NOT NULL");
    }
};
