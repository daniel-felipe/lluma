<?php

declare(strict_types = 1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('barber_profile_id')->constrained('barber_profiles')->cascadeOnDelete();
            $table->foreignUuid('service_id')->constrained('services')->cascadeOnDelete();
            $table->string('client_name', 255);
            $table->string('client_phone', 20);
            $table->datetime('starts_at');
            $table->datetime('ends_at');
            $table->string('status')->default('pending');
            $table->datetime('locked_until')->nullable();
            $table->string('cancellation_reason')->nullable();
            $table->string('cancelled_by')->nullable();
            $table->timestamps();

            $table->index(['barber_profile_id', 'starts_at']);
            $table->index(['barber_profile_id', 'status', 'starts_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
