<?php

use App\Http\Controllers\Integration\ApiTokenController;
use App\Http\Controllers\Integration\IntegrationAdminController;
use Illuminate\Support\Facades\Route;

// User — personal tokens
Route::middleware('can:integrations.view')->group(function () {
    Route::get('/integrations', [ApiTokenController::class, 'index'])->name('integrations.index');
    Route::post('/integrations/test', [ApiTokenController::class, 'test'])->name('integrations.test');
});

Route::middleware('can:integrations.connect')->group(function () {
    Route::post('/integrations', [ApiTokenController::class, 'store'])->name('integrations.store');
    Route::delete('/integrations/{provider}', [ApiTokenController::class, 'destroy'])->name('integrations.destroy');
});

// Admin — catalogue management
Route::prefix('admin/integrations')->name('admin.integrations.')->middleware('can:integrations.manage')->group(function () {
    Route::get('/', [IntegrationAdminController::class, 'index'])->name('index');
    Route::post('/', [IntegrationAdminController::class, 'store'])->name('store');
    Route::put('/{integration}', [IntegrationAdminController::class, 'update'])->name('update');
    Route::delete('/{integration}', [IntegrationAdminController::class, 'destroy'])->name('destroy');
    Route::patch('/{integration}/toggle', [IntegrationAdminController::class, 'toggle'])->name('toggle');
});
