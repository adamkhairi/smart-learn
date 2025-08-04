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
            // Only add columns that don't exist yet
            if (!Schema::hasColumn('submissions', 'submission_text')) {
                $table->text('submission_text')->nullable()->after('files');
            }
            if (!Schema::hasColumn('submissions', 'submission_data')) {
                $table->json('submission_data')->nullable()->after('submission_text');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            // Only drop columns that exist
            if (Schema::hasColumn('submissions', 'submission_text')) {
                $table->dropColumn('submission_text');
            }
            if (Schema::hasColumn('submissions', 'submission_data')) {
                $table->dropColumn('submission_data');
            }
        });
    }
};
