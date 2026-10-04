<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('products') && !Schema::hasColumn('products', 'sold_count')) {
            Schema::table('products', function (Blueprint $table) {
                $table->integer('sold_count')->default(0)->after('stock_quantity');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('products') && Schema::hasColumn('products', 'sold_count')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('sold_count');
            });
        }
    }
};
