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
        Schema::table('user_progress', function (Blueprint $table) {
            // Composite indexes to speed up common aggregations
            $table->index(['user_id', 'course_id', 'status'], 'idx_user_course_status');
            $table->index(['course_id', 'status'], 'idx_course_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_progress', function (Blueprint $table) {
            $table->dropIndex('idx_user_course_status');
            $table->dropIndex('idx_course_status');
        });
    }
};
