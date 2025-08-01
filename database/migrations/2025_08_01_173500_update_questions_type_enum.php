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
        // For PostgreSQL, we need to drop the existing constraint and recreate it
        
        // Drop the existing check constraint
        DB::statement("ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_type_check");
        
        // Modify the column to accept the new enum values
        DB::statement("ALTER TABLE questions ALTER COLUMN type TYPE VARCHAR(20)");
        
        // Add the new constraint with all supported question types
        DB::statement("ALTER TABLE questions ADD CONSTRAINT questions_type_check CHECK (type IN ('MCQ', 'TrueFalse', 'ShortAnswer'))");
        
        // Set default value
        DB::statement("ALTER TABLE questions ALTER COLUMN type SET DEFAULT 'MCQ'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to only MCQ
        DB::statement("ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_type_check");
        DB::statement("ALTER TABLE questions ADD CONSTRAINT questions_type_check CHECK (type IN ('MCQ'))");
    }
};
