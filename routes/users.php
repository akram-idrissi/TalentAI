<?php

use App\Http\Controllers\RoleManagementController;
use Illuminate\Support\Facades\Route;

Route::get('/users', [RoleManagementController::class, 'usersIndex'])
    ->name('users.index')
    ->middleware('can:users.view');

Route::post('/users', [RoleManagementController::class, 'usersCreate'])
    ->name('users.create')
    ->middleware('can:users.create');

Route::put('/users/{user}/roles', [RoleManagementController::class, 'usersUpdateRole'])
    ->name('users.update-role')
    ->middleware('can:users.edit')
    ->withTrashed();

Route::delete('/users/{user}', [RoleManagementController::class, 'usersDelete'])
    ->name('users.delete')
    ->middleware('can:users.delete');

Route::patch('/users/{user}/deactivate', [RoleManagementController::class, 'usersDeactivate'])
    ->name('users.deactivate')
    ->middleware('can:users.edit');

Route::patch('/users/{user}/activate', [RoleManagementController::class, 'usersActivate'])
    ->name('users.activate')
    ->middleware('can:users.edit')
    ->withTrashed();
