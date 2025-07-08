import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

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
    pivot?: {
        enrolled_as: 'student' | 'instructor' | 'admin';
        created_at: string;
        updated_at: string;
    };
    [key: string]: unknown;
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
    created_at: string;
    updated_at: string;
    creator?: User;
    enrolled_users?: User[];
    modules?: CourseModule[];
    assignments?: Assignment[];
    assessments?: Assessment[];
    announcements?: Announcement[];
    discussions?: Discussion[];
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
    question_number: number;
    points: number;
    type: 'MCQ' | 'Essay' | 'TrueFalse';
    auto_graded: boolean;
    choices?: Record<string, string>;
    answer?: string;
    keywords?: string[];
    created_at: string;
    updated_at: string;
}

export interface Submission {
    id: number;
    user_id: number;
    course_id: number;
    assessment_id?: number;
    assignment_id?: number;
    answers: Record<string, unknown>;
    submitted_at?: string;
    plagiarism_status: string;
    auto_grading_status: string;
    score?: number;
    created_at: string;
    updated_at: string;
    user?: User;
    course?: Course;
    assessment?: Assessment;
    assignment?: Assignment;
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
}

export interface CourseModuleItemEditPageProps extends PageProps {
    course: Course;
    module: CourseModule;
    item: CourseModuleItem;
}
