import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export type Level = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    username?: string;
    photo?: string;
    mobile?: string;
    role: 'admin' | 'instructor' | 'student';
    is_active: boolean;
    is_email_registered: boolean;
    last_seen_at?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    enrollments?: Course[];
    pivot?: {
        enrolled_as: 'student' | 'instructor' | 'admin';
        created_at: string;
        updated_at: string;
    };
    [key: string]: unknown;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
}

export interface Course {
    id: number;
    name: string;
    description?: string;
    created_by?: number;
    image?: string;
    background_color?: string;
    status: 'draft' | 'published' | 'archived';
    files?: string[];
    category_id?: number;
    level?: string;
    duration?: number; // Duration in hours
    created_at: string;
    updated_at: string;
    creator?: User;
    category?: Category;
    enrolled_users?: User[];
    modules?: CourseModule[];
    assignments?: Assignment[];
    assessments?: Assessment[];
    announcements?: Announcement[];
    discussions?: Discussion[];
    pivot?: {
        enrolled_as: 'student' | 'instructor' | 'admin';
        created_at: string;
        updated_at: string;
    };
    [key: string]: unknown;
}

export interface CourseModule {
    id: number;
    course_id: number;
    title: string;
    description?: string;
    order: number;
    is_published: boolean;
    created_at: string;
    updated_at: string;
    items?: CourseModuleItem[];
    moduleItems?: CourseModuleItem[];
    module_items?: CourseModuleItem[];
    itemsCount?: number;
    module_items_count?: number;
}

export interface CourseModuleItem {
    id: number;
    course_module_id: number;
    title: string;
    description?: string;
    content_json?: string;
    content_html?: string;
    itemable_id: number;
    itemable_type: string;
    itemable?: Lecture | Assessment | Assignment;
    order: number;
    is_required: boolean;
    status: 'draft' | 'published';
    view_count: number;
    last_viewed_at?: string;
    created_at: string;
    updated_at: string;
    // Helper computed properties
    item_type_name?: 'lecture' | 'assessment' | 'assignment' | 'unknown';
    duration?: number;
    formatted_duration?: string;
}

export interface Lecture {
    id: number;
    title: string;
    description?: string;
    content?: string;
    content_json?: string;
    content_html?: string;
    video_url?: string;
    youtube_id?: string;
    duration?: number;
    metadata?: Record<string, unknown>;
    course_id: number;
    course_module_id?: number;
    created_by?: number;
    order: number;
    is_published: boolean;
    view_count: number;
    created_at: string;
    updated_at: string;
    creator?: User;
    course?: Course;
    courseModule?: CourseModule;
    likes?: Like[];
    comments?: Comment[];
    bookmarks?: Bookmark[];
    moduleItem?: CourseModuleItem;
    // Computed properties
    formatted_duration?: string;
    youtube_embed_url?: string;
    youtube_thumbnail?: string;
}

export interface Assignment {
    id: number;
    course_id: number;
    title: string;
    description?: string;
    content_json?: Record<string, unknown>;
    content_html?: string | null;
    instructions?: Record<string, unknown>;
    instructions_html?: string | null;
    rubric?: Record<string, unknown>;
    rubric_html?: string | null;
    assignment_type?: string;
    total_points?: number;
    status: 'coming-soon' | 'open' | 'ended';
    visibility: boolean;
    started_at?: string;
    expired_at?: string;
    created_by?: number;
    questions?: Question[];
    created_at: string;
    updated_at: string;
    creator?: User;
    course?: Course;
    submissions?: Submission[];
    likes?: Like[];
    comments?: Comment[];
    bookmarks?: Bookmark[];
    moduleItem?: CourseModuleItem;
    // Computed properties
    points?: number; // Alias for total_points
    due_date?: string; // Alias for expired_at
}

export interface Assessment {
    id: number;
    course_id: number;
    title: string;
    type: 'quiz' | 'exam' | 'project';
    max_score?: number;
    weight?: number;
    questions_type?: string;
    submission_type?: string;
    visibility: 'published' | 'unpublished';
    content_json?: Record<string, unknown>;
    content_html?: string | null;
    instructions?: Record<string, unknown>;
    instructions_html?: string | null;
    time_limit?: number;
    randomize_questions?: boolean;
    show_results?: boolean;
    available_from?: string;
    available_until?: string;
    created_by?: number;
    files?: string[];
    created_at: string;
    updated_at: string;
    creator?: User;
    course?: Course;
    questions?: Question[];
    submissions?: Submission[];
    likes?: Like[];
    comments?: Comment[];
    bookmarks?: Bookmark[];
    moduleItem?: CourseModuleItem;
    // Computed properties
    total_points?: number; // Alias for max_score
    duration?: number;
}

export interface Question {
    id: number;
    assessment_id: number;
    assignment_id?: number;
    question_number: number;
    points: number;
    type: 'MCQ' | 'Essay' | 'TrueFalse';
    question_text: string;
    auto_graded: boolean;
    choices?: Record<string, string>;
    answer?: string;
    keywords?: string[];
    text_match?: boolean;
    created_at: string;
    updated_at: string;
}

export interface QuestionFormData {
    id: string;
    type: 'MCQ' | 'Essay';
    question_text: string;
    points: number;
    choices?: Record<string, string>;
    answer?: string;
    keywords?: string[];
}

export interface Submission {
    id: number;
    user_id: number;
    course_id: number;
    assessment_id?: number;
    assignment_id?: number;
    files?: string[];
    plagiarism_status?: string;
    auto_grading_status?: string;
    finished: boolean;
    score?: number;
    feedback?: string;
    graded_at?: string;
    graded_by?: number;
    submitted_at: string;
    number_of_exam_joins?: number;
    answers?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    grade?: Grade;
    user?: User;
    assignment?: Assignment;
    assessment?: Assessment;
}

export interface Grade {
    id: number;
    user_id: number;
    submission_id: number;
    score: number;
    feedback?: string;
    created_at: string;
    updated_at: string;
}

// Polymorphic relationship interfaces
export interface Like {
    id: number;
    user_id: number;
    likeable_id: number;
    likeable_type: string;
    created_at: string;
    updated_at: string;
    user?: User;
    likeable?: Article | Lecture | Assessment | Assignment | Comment;
}

export interface Comment {
    id: number;
    content: string;
    user_id: number;
    commentable_id: number;
    commentable_type: string;
    parent_id?: number;
    created_at: string;
    updated_at: string;
    user?: User;
    commentable?: Article | Lecture | Assessment | Assignment;
    parent?: Comment;
    replies?: Comment[];
    likes?: Like[];
}

export interface Bookmark {
    id: number;
    user_id: number;
    bookmarkable_id: number;
    bookmarkable_type: string;
    created_at: string;
    updated_at: string;
    user?: User;
    bookmarkable?: Article | Lecture | Assessment | Assignment;
}

export interface Article {
    id: number;
    title: string;
    text?: string;
    lang?: string;
    content_type?: string;
    url?: string;
    content_id?: number;
    created_by: number;
    created_at: string;
    updated_at: string;
    creator?: User;
    likes?: Like[];
    comments?: Comment[];
    bookmarks?: Bookmark[];
    // Computed properties
    likes_count?: number;
    is_liked_by_user?: boolean;
    is_bookmarked_by_user?: boolean;
}

export interface Announcement {
    id: number;
    course_id: number;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
}

export interface Discussion {
    id: number;
    course_id: number;
    title: string;
    content: string;
    created_by: number;
    created_at: string;
    updated_at: string;
}

export interface UserEnrollment {
    id: number;
    user_id: number;
    course_id: number;
    enrolled_as: 'student' | 'instructor' | 'admin';
    created_at: string;
    updated_at: string;
    completed_module_items?: number[];
}

export interface PageProps<T extends Record<string, unknown> = Record<string, unknown>> extends T {
    auth: Auth;
}

export interface CoursesPageProps extends PageProps {
    courses: Course[];
    userRole: string;
}

export interface CourseShowPageProps extends PageProps {
    course: Course;
    userEnrollment?: UserEnrollment;
    userRole: string;
}

export interface CourseCreatePageProps extends PageProps {
    instructors?: User[];
}

export interface CourseEditPageProps extends PageProps {
    course: Course;
}

export interface CourseModulesPageProps extends PageProps {
    course: Course;
    modules: CourseModule[];
}

export interface CourseModuleCreatePageProps extends PageProps {
    course: Course;
    nextOrder: number;
}

export interface CourseModuleShowPageProps extends PageProps {
    course: Course;
    module: CourseModule;
    item: CourseModuleItem;
    userSubmission?: Submission;
    completedItems?: number[];
}

export interface CourseModuleEditPageProps extends PageProps {
    course: Course;
    module: CourseModule;
}

export interface CourseModuleItemCreatePageProps extends PageProps {
    course: Course;
    module: CourseModule;
    nextOrder: number;
}

export interface CourseModuleItemShowPageProps extends PageProps {
    course: Course;
    module: CourseModule;
    item: CourseModuleItem;
    userSubmission?: Submission;
}

export interface CourseModuleItemEditPageProps extends PageProps {
    course: Course;
    module: CourseModule;
    item: CourseModuleItem;
}

// Pagination interfaces
export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationMeta {
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

// Laravel paginated response structure (when using ->paginate())
export interface PaginatedResponse<T> {
    data: T[];
    links: PaginationLink[];
    meta: PaginationMeta;
}

// Simple pagination structure (when manually building pagination)
export interface SimplePaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}
