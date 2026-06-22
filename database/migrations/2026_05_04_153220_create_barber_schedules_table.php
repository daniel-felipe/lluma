<?php

declare(strict_types = 1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barber_schedules', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('barber_profile_id')
                ->unique()
                ->constrained()
                ->cascadeOnDelete();
            $table->unsignedTinyInteger('buffer_minutes')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barber_schedules');
    }
};
