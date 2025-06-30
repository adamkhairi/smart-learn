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
    status: 'published' | 'archived';
    files?: any[];
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
    type: 'video' | 'document' | 'link' | 'quiz' | 'assignment';
    url?: string;
    content?: string;
    order: number;
    duration?: number;
    is_required: boolean;
    created_at: string;
    updated_at: string;
}

export interface Assignment {
    id: number;
    course_id: number;
    title: string;
    description?: string;
    due_date?: string;
    points?: number;
    created_at: string;
    updated_at: string;
}

export interface Assessment {
    id: number;
    course_id: number;
    title: string;
    description?: string;
    type: 'quiz' | 'exam' | 'project';
    duration?: number;
    total_points?: number;
    created_at: string;
    updated_at: string;
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
    //
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
