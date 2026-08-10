<?php

use App\Http\Controllers\API\Admin\AgentController;
use App\Http\Controllers\API\Admin\GuichetController;
use App\Http\Controllers\API\ClientController;
use App\Http\Controllers\API\PublicGuichetController;
use Illuminate\Support\Facades\Route;

Route::middleware('api')->group(base_path('routes/auth.php'));

Route::get('public/guichets', [PublicGuichetController::class, 'index']);

Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('guichets', [GuichetController::class, 'index']);
    Route::post('guichets', [GuichetController::class, 'store']);
    Route::patch('guichets/{guichet}', [GuichetController::class, 'update']);

    Route::get('agents/pending', [AgentController::class, 'pending']);
    Route::post('agents/{user}/approve', [AgentController::class, 'approve']);
    Route::post('agents/{user}/reject', [AgentController::class, 'reject']);
});

Route::middleware(['auth:sanctum', 'role:admin,agent'])->group(function () {
    Route::get('clients', [ClientController::class, 'index']);
    Route::post('clients', [ClientController::class, 'store']);
});
