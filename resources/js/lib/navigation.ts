import { type NavItem } from '@/types';
import { BookOpen, Folder, GraduationCap, LayoutGrid, Users, ClipboardList, FileText } from 'lucide-react';

export const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Courses',
        href: '/courses',
        icon: BookOpen,
    },
];

export const adminNavItems: NavItem[] = [
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Courses',
        href: '/admin/courses',
        icon: GraduationCap,
    },
    {
        title: 'Submissions',
        href: '/submissions',
        icon: FileText,
    },
    {
        title: 'Enrollments',
        href: '/admin/enrollment-requests',
        icon: ClipboardList,
    },
    {
        title: 'Categories',
        href: '/admin/categories',
        icon: Folder,
    },
];

export const footerNavItems: NavItem[] = [

];

export const rightNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export const settingsNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: '/settings/profile',
        icon: null,
    },
    {
        title: 'Password',
        href: '/settings/password',
        icon: null,
    },
    {
        title: 'Appearance',
        href: '/settings/appearance',
        icon: null,
    },
];
