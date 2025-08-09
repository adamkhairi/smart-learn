export interface UserProgress {
    id: number;
    user_id: number;
    course_id: number;
    course_module_id?: number;
    course_module_item_id?: number;
    status: 'not_started' | 'in_progress' | 'completed' | 'failed';
    started_at?: string;
    completed_at?: string;
    last_accessed_at?: string;
    time_spent_seconds: number;
    view_count: number;
    score?: number;
    max_score?: number;
    is_graded: boolean;
    metadata?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface ProgressSummary {
    total_items: number;
    completed_items: number;
    in_progress_items: number;
    not_started_items: number;
    completion_percentage: number;
    total_time_spent: number;
}

// New: per-module progress summary
export interface ModuleProgressSummary extends ProgressSummary {
    module_id: number;
}

export interface CourseProgress {
    course: Course;
    progress: ProgressSummary;
}

export interface ProgressRecord {
    id: number;
    course_module?: CourseModule;
    course_module_item?: CourseModuleItem;
    status: string;
    time_spent_seconds: number;
    view_count: number;
    score?: number;
    max_score?: number;
    is_graded: boolean;
    started_at?: string;
    completed_at?: string;
    last_accessed_at?: string;
}

export interface StudentProgress {
    student: User;
    progress: ProgressSummary;
}

// Re-export existing types for convenience
export interface Course {
    id: number;
    name: string;
    description?: string;
    created_by: number;
    image?: string;
    background_color?: string;
    status: string;
    modules?: CourseModule[];
    creator?: User;
}

export interface CourseModule {
    id: number;
    title: string;
    description?: string;
    course_id: number;
    order: number;
    is_published: boolean;
    moduleItems?: CourseModuleItem[];
}

export interface CourseModuleItem {
    id: number;
    title: string;
    description?: string;
    course_module_id: number;
    itemable_id: number;
    itemable_type: string;
    order: number;
    is_required: boolean;
    status: string;
    view_count: number;
    last_viewed_at?: string;
    itemable?: Lecture | Assessment | Assignment;
}

export interface User {
    id: number;
    name: string;
    email: string;
    username: string;
    role: string;
    photo?: string;
}

export interface Lecture {
    id: number;
    title: string;
    description?: string;
    video_url?: string;
    duration?: number;
    content_json?: Record<string, unknown>;
    content_html?: string;
}

export interface Assessment {
    id: number;
    title: string;
    type: string;
    max_score: number;
    content_json?: Record<string, unknown>;
    content_html?: string;
}

export interface Assignment {
    id: number;
    title: string;
    assignment_type: string;
    total_points: number;
    content_json?: Record<string, unknown>;
    content_html?: string;
}
