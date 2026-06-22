<?php

declare(strict_types = 1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barber_profiles', function (Blueprint $table): void {
            $table->unsignedInteger('link_visits')->default(0)->after('onboarding_step');
        });
    }

    public function down(): void
    {
        Schema::table('barber_profiles', function (Blueprint $table): void {
            $table->dropColumn('link_visits');
        });
    }
};
