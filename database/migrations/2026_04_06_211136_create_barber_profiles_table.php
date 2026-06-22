<?php

declare(strict_types = 1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barber_profiles', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('business_name');
            $table->string('slug')->unique();
            $table->string('address_street');
            $table->string('address_number');
            $table->string('address_neighborhood');
            $table->string('address_city');
            $table->char('address_state', 2);
            $table->string('address_cep', 9)->nullable();
            $table->string('profile_photo_url')->nullable();
            $table->string('cover_photo_url')->nullable();
            $table->string('status')->default('draft');
            $table->string('onboarding_step')->default('profile');
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barber_profiles');
    }
};
