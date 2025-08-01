import { ModuleNavigation } from '@/components/module-navigation';
import { useAuth } from '@/hooks/use-auth';
import { useProgressTracking } from '@/hooks/use-progress';
import AppLayout from '@/layouts/app-layout';
import { Assessment, Assignment, CourseModuleItemShowPageProps, Lecture } from '@/types';
import { Head } from '@inertiajs/react';
import { AlertCircle, FileText } from 'lucide-react';
import { useEffect } from 'react';

// Import new components
import AssessmentContent from '@/components/course-item/AssessmentContent';
import AssignmentContent from '@/components/course-item/AssignmentContent';
import GradingStatus from '@/components/course-item/GradingStatus';
import ItemContentCard from '@/components/course-item/ItemContentCard';
import ItemHeader from '@/components/course-item/ItemHeader';
import ItemNavigation from '@/components/course-item/ItemNavigation';
import LectureContent from '@/components/course-item/LectureContent';

interface ShowProps extends CourseModuleItemShowPageProps {
    completedItems?: number[];
}

function Show({ course, module, item, userSubmission, completedItems = [] }: ShowProps) {
    const { canManageCourse } = useAuth();
    const isInstructor = canManageCourse(course.created_by);

    // Progress tracking for students
    const { markAsStarted, markAsCompleted } = useProgressTracking({
        courseId: course.id,
        moduleId: module.id,
        itemId: item.id,
    });

    // Track when user starts viewing content
    useEffect(() => {
        if (!isInstructor) {
            markAsStarted().catch(console.error);
        }
    }, [isInstructor, markAsStarted]);

    // Check if current item is completed
    const isCompleted = completedItems.includes(item.id);

    // Navigation items for breadcrumb
    const navigationItems = [
        { title: 'Courses', href: '/courses' },
        { title: course.name, href: `/courses/${course.id}` },
        { title: 'Modules', href: `/courses/${course.id}/modules` },
        { title: module.title, href: `/courses/${course.id}/modules/${module.id}` },
        { title: item.title, href: '#', isActive: true },
    ];

    // Find previous and next items for navigation
    const items = module.moduleItems || [];
    const currentIndex = items.findIndex((i) => i.id === item.id);

    // Helper function to get item type from polymorphic relationship
    const getItemType = (): 'lecture' | 'assessment' | 'assignment' | 'unknown' => {
        if (item.item_type_name) return item.item_type_name;

        if (item.itemable_type?.includes('Lecture')) return 'lecture';
        if (item.itemable_type?.includes('Assessment')) return 'assessment';
        if (item.itemable_type?.includes('Assignment')) return 'assignment';

        return 'unknown';
    };

    const itemType = getItemType();

    // Handle completion marking
    const handleMarkComplete = () => {
        if (!isInstructor) {
            markAsCompleted().catch(console.error);
        }
    };

    // Get duration for display
    const getDuration = () => {
        if (itemType === 'lecture' && item.itemable) {
            return (item.itemable as Lecture).duration;
        }
        return undefined;
    };

    const renderContent = () => {
        if (!item.itemable) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium">Content Not Available</h3>
                    <p className="text-muted-foreground">The content for this item could not be loaded at this time.</p>
                </div>
            );
        }

        switch (itemType) {
            case 'lecture': {
                const lecture = item.itemable as Lecture;
                return <LectureContent lecture={lecture} isCompleted={isCompleted} isInstructor={isInstructor} onMarkComplete={handleMarkComplete} />;
            }

            case 'assessment': {
                const assessment = item.itemable as Assessment;
                return (
                    <AssessmentContent
                        assessment={assessment}
                        courseId={course.id}
                        userSubmission={userSubmission}
                        isCompleted={isCompleted}
                        isInstructor={isInstructor}
                        onMarkComplete={handleMarkComplete}
                    />
                );
            }

            case 'assignment': {
                const assignment = item.itemable as Assignment;
                return (
                    <AssignmentContent
                        assignment={assignment}
                        userSubmission={userSubmission}
                        isCompleted={isCompleted}
                        isInstructor={isInstructor}
                        onMarkComplete={handleMarkComplete}
                        courseId={course.id}
                    />
                );
            }

            default:
                return (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="mb-2 text-lg font-medium">Unsupported Content Type</h3>
                        <p className="text-muted-foreground">This type of content is not yet supported by the platform.</p>
                    </div>
                );
        }
    };

    return (
        <AppLayout breadcrumbs={navigationItems}>
            <Head title={`${item.title} - ${module.title} - ${course.name}`} />

            <div className="px-4 py-6">
                {/* Page Header */}
                <ItemHeader
                    course={course}
                    module={module}
                    item={item}
                    itemType={itemType}
                    currentIndex={currentIndex}
                    totalItems={items.length}
                    isCompleted={isCompleted}
                    isInstructor={isInstructor}
                    duration={getDuration()}
                    className="mb-8"
                />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                    {/* Main Content Area */}
                    <div className="space-y-6 lg:col-span-3">
                        {/* Grading Status for Students - Moved to top, only after submission */}
                        {!isInstructor && userSubmission && (itemType === 'assignment' || itemType === 'assessment') && (
                            <GradingStatus 
                                userSubmission={userSubmission} 
                                itemType={itemType}
                                maxScore={itemType === 'assessment' ? (item.itemable as Assessment)?.max_score : undefined}
                            />
                        )}

                        {/* Content Card */}
                        <ItemContentCard item={item} itemType={itemType} duration={getDuration()}>
                            {renderContent()}
                        </ItemContentCard>

                        {/* Navigation */}
                        <ItemNavigation course={course} module={module} currentItem={item} items={items} className="mt-8" />
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <ModuleNavigation course={course} module={module} currentItem={item} completedItems={completedItems} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default Show;
