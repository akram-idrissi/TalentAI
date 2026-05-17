<?php

use App\Http\Controllers\RoleManagementController;
use Illuminate\Support\Facades\Route;

// Roles list + permission editing
Route::get('/roles', [RoleManagementController::class, 'rolesIndex'])
    ->name('roles.index')
    ->middleware('can:roles.view');

Route::put('/roles/{role}/permissions', [RoleManagementController::class, 'rolesUpdate'])
    ->name('roles.update')
    ->middleware('can:roles.manage');
