<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Simply add Laravel notification compatibility to existing table
        Schema::table('notifications', function (Blueprint $table) {
            // Add notifiable columns for Laravel compatibility
            if (!Schema::hasColumn('notifications', 'notifiable_type')) {
                $table->string('notifiable_type')->default('App\\Models\\User')->after('user_id');
            }
            
            if (!Schema::hasColumn('notifications', 'notifiable_id')) {
                $table->unsignedBigInteger('notifiable_id')->after('notifiable_type');
            }

            // Add index for Laravel notifications
            if (!$this->indexExists('notifications', 'notifications_notifiable_index')) {
                $table->index(['notifiable_type', 'notifiable_id'], 'notifications_notifiable_index');
            }
        });

        // Copy user_id to notifiable_id for existing records
        DB::statement('UPDATE notifications SET notifiable_id = user_id WHERE notifiable_id IS NULL OR notifiable_id = 0');
    }

    /**
     * Check if index exists
     */
    private function indexExists(string $table, string $index): bool
    {
        $indexes = DB::select("SELECT indexname FROM pg_indexes WHERE tablename = ? AND indexname = ?", [$table, $index]);
        return count($indexes) > 0;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('notifications_notifiable_index');
            $table->dropColumn(['notifiable_type', 'notifiable_id', 'uuid_id']);
        });
    }
};
