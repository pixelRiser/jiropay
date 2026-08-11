<?php

use App\Http\Controllers\API\Admin\AgentController;
use App\Http\Controllers\API\Admin\CommissionController;
use App\Http\Controllers\API\Admin\GuichetController;
use App\Http\Controllers\API\Admin\PaiementController as AdminPaiementController;
use App\Http\Controllers\API\Admin\PaiementJiramaController;
use App\Http\Controllers\API\ClientController;
use App\Http\Controllers\API\FactureController;
use App\Http\Controllers\API\GuichetController as MyGuichetController;
use App\Http\Controllers\API\PaiementController;
use App\Http\Controllers\API\PaymentWebhookController;
use App\Http\Controllers\API\PublicGuichetController;
use App\Http\Controllers\API\RecuController;
use Illuminate\Support\Facades\Route;

Route::middleware('api')->group(base_path('routes/auth.php'));

Route::get('public/guichets', [PublicGuichetController::class, 'index']);

// Passerelle de paiement (GoalPay) — pas de middleware auth, vérifié par signature HMAC dans le controller.
Route::post('webhooks/payment', [PaymentWebhookController::class, 'handle']);

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('guichets', [GuichetController::class, 'index']);
    Route::get('guichets/{guichet}', [GuichetController::class, 'show']);
    Route::post('guichets', [GuichetController::class, 'store']);
    Route::patch('guichets/{guichet}', [GuichetController::class, 'update']);
    Route::delete('guichets/{guichet}', [GuichetController::class, 'destroy']);

    Route::get('agents', [AgentController::class, 'index']);
    Route::get('agents/pending', [AgentController::class, 'pending']);
    Route::get('agents/{agent}', [AgentController::class, 'show']);
    Route::patch('agents/{agent}', [AgentController::class, 'update']);
    Route::delete('agents/{agent}', [AgentController::class, 'destroy']);
    Route::post('agents/{user}/approve', [AgentController::class, 'approve']);
    Route::post('agents/{user}/reject', [AgentController::class, 'reject']);

    Route::get('paiements-jirama/en-attente', [PaiementJiramaController::class, 'enAttente']);
    Route::get('paiements-jirama/traites', [PaiementJiramaController::class, 'traites']);
    Route::post('paiements/{paiement}/ticket-jirama', [PaiementJiramaController::class, 'store']);

    Route::get('paiements', [AdminPaiementController::class, 'index']);
    Route::get('paiements/{paiement}', [AdminPaiementController::class, 'show']);
    Route::patch('paiements/{paiement}/statut', [AdminPaiementController::class, 'updateStatut']);
    Route::delete('paiements/{paiement}', [AdminPaiementController::class, 'destroy']);

    Route::get('commissions', [CommissionController::class, 'index']);
    Route::get('commissions/{commission}', [CommissionController::class, 'show']);
    Route::post('commissions/{commission}/reverser', [CommissionController::class, 'reverser']);

    Route::get('clients/{client}', [ClientController::class, 'show']);
    Route::patch('clients/{client}', [ClientController::class, 'update']);
    Route::delete('clients/{client}', [ClientController::class, 'destroy']);
    Route::patch('clients/{client}/guichet', [ClientController::class, 'updateGuichet']);
});

Route::middleware(['auth:sanctum', 'role:admin,agent'])->group(function () {
    Route::get('clients', [ClientController::class, 'index']);
    Route::post('clients', [ClientController::class, 'store']);
});

Route::middleware(['auth:sanctum', 'role:agent'])->group(function () {
    Route::get('mon-guichet', [MyGuichetController::class, 'mine']);
    Route::get('mes-paiements', [MyGuichetController::class, 'mesPaiements']);
});

Route::middleware(['auth:sanctum', 'role:client'])->group(function () {
    Route::get('factures', [FactureController::class, 'mine']);
    Route::post('factures', [FactureController::class, 'store']);
    Route::delete('factures/{facture}', [FactureController::class, 'destroy']);
    Route::post('paiements', [PaiementController::class, 'initier']);
    Route::get('factures/{facture}/recu', [RecuController::class, 'telecharger']);
});
