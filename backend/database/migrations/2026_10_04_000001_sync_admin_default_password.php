<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $admin = User::where('email', 'admin@gsluxury.vn')->first();
        if ($admin) {
            $admin->password = Hash::make('Admin@123456');
            $admin->role = 'admin';
            $admin->save();
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
