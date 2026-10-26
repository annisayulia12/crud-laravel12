
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('transactions_tabel') &&
            !Schema::hasTable('transactions')) {
            Schema::rename('transactions_tabel', 'transactions');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('transactions') &&
            !Schema::hasTable('transactions_tabel')) {
            Schema::rename('transactions', 'transactions_tabel');
        }
    }
};
