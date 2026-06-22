<?php

declare(strict_types = 1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barber_schedule_days', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('barber_schedule_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week');
            $table->boolean('is_open')->default(false);
            $table->time('opens_at')->nullable();
            $table->time('closes_at')->nullable();
            $table->time('break_starts_at')->nullable();
            $table->time('break_ends_at')->nullable();
            $table->timestamps();

            $table->unique(['barber_schedule_id', 'day_of_week']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barber_schedule_days');
    }
};
