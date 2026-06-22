<?php

declare(strict_types = 1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('availability_slots');
    }

    public function down(): void
    {
        // availability_slots was a stub table; no rollback needed
    }
};
