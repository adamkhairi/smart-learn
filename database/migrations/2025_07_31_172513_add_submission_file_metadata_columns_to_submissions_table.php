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
            if (!Schema::hasColumn('submissions', 'file_path')) {
                $table->string('file_path')->nullable()->after('submission_data');
            }
            if (!Schema::hasColumn('submissions', 'original_filename')) {
                $table->string('original_filename')->nullable()->after('file_path');
            }
            if (!Schema::hasColumn('submissions', 'file_size')) {
                $table->unsignedBigInteger('file_size')->nullable()->after('original_filename');
            }
            if (!Schema::hasColumn('submissions', 'file_type')) {
                $table->string('file_type')->nullable()->after('file_size');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            if (Schema::hasColumn('submissions', 'file_path')) {
                $table->dropColumn('file_path');
            }
            if (Schema::hasColumn('submissions', 'original_filename')) {
                $table->dropColumn('original_filename');
            }
            if (Schema::hasColumn('submissions', 'file_size')) {
                $table->dropColumn('file_size');
            }
            if (Schema::hasColumn('submissions', 'file_type')) {
                $table->dropColumn('file_type');
            }
        });
    }
};
