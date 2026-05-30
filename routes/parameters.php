<?php

use App\Http\Controllers\ParameterGroupController;
use Illuminate\Support\Facades\Route;

Route::get('parameters', [ParameterGroupController::class, 'index'])->name('parameters.index')->middleware('can:parameters.view');
Route::get('parameters/create', [ParameterGroupController::class, 'create'])->name('parameters.create')->middleware('can:parameters.create');
Route::post('parameters', [ParameterGroupController::class, 'store'])->name('parameters.store')->middleware('can:parameters.create');
Route::get('parameters/{group}', [ParameterGroupController::class, 'show'])->name('parameters.show')->middleware('can:parameters.view');
Route::get('parameters/{group}/edit', [ParameterGroupController::class, 'edit'])->name('parameters.edit')->middleware('can:parameters.edit');
Route::put('parameters/{group}', [ParameterGroupController::class, 'update'])->name('parameters.update')->middleware('can:parameters.edit');
Route::delete('parameters/{group}', [ParameterGroupController::class, 'destroy'])->name('parameters.destroy')->middleware('can:parameters.delete');

Route::post('parameters/{group}/values', [ParameterGroupController::class, 'storeValue'])->name('parameters.values.store')->middleware('can:parameters.edit');
Route::put('parameters/{group}/values/{value}', [ParameterGroupController::class, 'updateValue'])->name('parameters.values.update')->middleware('can:parameters.edit');
Route::delete('parameters/{group}/values/{value}', [ParameterGroupController::class, 'destroyValue'])->name('parameters.values.destroy')->middleware('can:parameters.delete');
Route::patch('parameters/{group}/values/reorder', [ParameterGroupController::class, 'reorderValues'])->name('parameters.values.reorder')->middleware('can:parameters.edit');
Route::patch('parameters/{group}/values/{value}/toggle', [ParameterGroupController::class, 'toggleValue'])->name('parameters.values.toggle')->middleware('can:parameters.edit');
