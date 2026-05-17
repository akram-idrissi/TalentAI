<?php

use App\Http\Controllers\RoleManagementController;
use Illuminate\Support\Facades\Route;

Route::get('/roles', [RoleManagementController::class, 'rolesIndex'])
    ->name('roles.index')
    ->middleware('can:roles.view');

Route::post('/roles', [RoleManagementController::class, 'rolesStore'])
    ->name('roles.store')
    ->middleware('can:roles.manage');

Route::get('/roles/{role}/edit', [RoleManagementController::class, 'rolesEdit'])
    ->name('roles.edit')
    ->middleware('can:roles.manage');

Route::put('/roles/{role}/permissions', [RoleManagementController::class, 'rolesUpdate'])
    ->name('roles.update')
    ->middleware('can:roles.manage');

Route::delete('/roles/{role}/users/{user}', [RoleManagementController::class, 'rolesRemoveUser'])
    ->name('roles.users.remove')
    ->middleware('can:roles.manage');
