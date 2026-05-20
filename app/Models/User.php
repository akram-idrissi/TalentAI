<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, HasRoles, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'deactivated_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function apiTokens(): HasMany
    {
        return $this->hasMany(UserApiToken::class);
    }

    /**
     * Return a clean array of the user's permission names.
     * Used to share with the frontend via Inertia.
     */
    public function permissionNames(): array
    {
        return $this->getAllPermissions()->pluck('name')->toArray();
    }

    /**
     * Return the user's role names for the frontend.
     */
    public function roleNames(): array
    {
        return $this->getRoleNames()->toArray();
    }

    public function isDeactivated(): bool
    {
        return ! is_null($this->deactivated_at);
    }

    public function deactivate(): bool
    {
        return $this->forceFill(['deactivated_at' => now()])->save();
    }

    public function activate(): bool
    {
        return $this->forceFill(['deactivated_at' => null])->save();
    }
}
