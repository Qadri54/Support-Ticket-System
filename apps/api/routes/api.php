<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\TicketResponseController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('login', [AuthController::class, 'login']);

    // Public: reading and creating tickets requires no authentication.
    Route::get('tickets', [TicketController::class, 'index']);
    Route::post('tickets', [TicketController::class, 'store']);
    Route::get('tickets/{ticket}', [TicketController::class, 'show']);

    // Authenticated endpoints (any logged-in user).
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);

        // Admin-only: enforced by TicketPolicy.
        Route::patch('tickets/{ticket}/status', [TicketController::class, 'updateStatus']);
        Route::post('tickets/{ticket}/responses', [TicketResponseController::class, 'store']);
    });
});
