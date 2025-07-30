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
        Schema::table('submissions', function (Blueprint $table) {
            $table->decimal('max_score', 8, 2)->nullable()->after('score');
            $table->decimal('percentage', 5, 2)->nullable()->after('max_score');
            $table->json('grading_details')->nullable()->after('percentage');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropColumn(['max_score', 'percentage', 'grading_details']);
        });
    }
};
