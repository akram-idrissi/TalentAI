<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $password = Hash::make('Password123!');

        $usersByRole = [
            'super_admin' => [
                ['name' => 'Amine Benali', 'email' => 'amine.benali@talentai.test'],
                ['name' => 'Sara El Mansouri', 'email' => 'sara.elmansouri@talentai.test'],
            ],

            'admin' => [
                ['name' => 'Youssef Haddad', 'email' => 'youssef.haddad@talentai.test'],
                ['name' => 'Nadia Alaoui', 'email' => 'nadia.alaoui@talentai.test'],
            ],

            'recruiter' => [
                ['name' => 'Karim Berrada', 'email' => 'karim.berrada@talentai.test'],
                ['name' => 'Leila Tazi', 'email' => 'leila.tazi@talentai.test'],
            ],

            'hiring_manager' => [
                ['name' => 'Mehdi Idrissi', 'email' => 'mehdi.idrissi@talentai.test'],
                ['name' => 'Imane Cherkaoui', 'email' => 'imane.cherkaoui@talentai.test'],
            ],

            'viewer' => [
                ['name' => 'Omar Saidi', 'email' => 'omar.saidi@talentai.test'],
                ['name' => 'Hajar Bennani', 'email' => 'hajar.bennani@talentai.test'],
            ],
        ];

        foreach ($usersByRole as $roleName => $users) {
            $role = Role::where('name', $roleName)
                ->where('guard_name', 'web')
                ->firstOrFail();

            foreach ($users as $userData) {
                $user = User::updateOrCreate(
                    ['email' => $userData['email']],
                    [
                        'name' => $userData['name'],
                        'password' => $password,
                        'email_verified_at' => now(),
                    ]
                );

                $user->syncRoles([$role]);
            }
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
