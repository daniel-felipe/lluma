<?php

declare(strict_types = 1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sms_verifications', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('phone')->index();
            $table->string('code');
            $table->string('purpose');
            $table->timestamp('expires_at');
            $table->timestamp('verified_at')->nullable();
            $table->unsignedSmallInteger('attempt_count')->default(0);
            $table->timestamps();

            $table->index(['phone', 'purpose', 'verified_at', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sms_verifications');
    }
};
