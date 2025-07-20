import React, { useState } from 'react';
import { PageProps } from '@/types';
import { Link, useForm, Head } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PageHeader } from '@/components/ui/page-header';
import { SearchFilterBar } from '@/components/ui/search-filter-bar';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { MessageSquare, Plus, User, Calendar, MessageCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Discussion {
  id: number;
  title: string;
  content: string;
  user: {
    id: number;
    name: string;
    photo?: string;
  };
  created_at: string;
  comments_count: number;
  is_pinned?: boolean;
  is_locked?: boolean;
}

interface Discussionable {
  type: string;
  id: number;
  title: string;
}

interface IndexProps extends PageProps {
  discussions: {
    data: Discussion[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  discussionable: Discussionable;
}

const Index: React.FC<IndexProps> = ({ discussions, discussionable }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pinned' | 'locked'>('all');
  const isMobile = useIsMobile();

  const { data, setData, post, processing, errors, reset } = useForm({
    title: '',
    content: '',
    course_id: discussionable?.id,
  });

  // Safety check for required props
  if (!discussionable || !discussions) {
    return (
      <AppLayout>
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 lg:gap-6 lg:p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('courses.discussions.store', { course: discussionable.id }), {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        reset();
      },
    });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Courses',
      href: '/courses',
    },
    {
      title: discussionable.title,
      href: route('courses.show', { course: discussionable.id }),
    },
    {
      title: 'Discussions',
      href: '#',
    },
  ];

  // Filter discussions based on search and status
  const filteredDiscussions = (discussions.data || []).filter((discussion) => {
    if (!discussion) return false;
    const matchesSearch = (discussion.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (discussion.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'pinned' && discussion.is_pinned) ||
                         (statusFilter === 'locked' && discussion.is_locked);
    return matchesSearch && matchesStatus;
  });

  const searchFilterOptions = [
    { value: 'all', label: 'All Discussions' },
    { value: 'pinned', label: 'Pinned' },
    { value: 'locked', label: 'Locked' },
  ];

  const pageHeaderActions = (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Start Discussion
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Start a New Discussion</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <Input
              id="title"
              value={data.title}
              onChange={e => setData('title', e.target.value)}
              placeholder="Enter discussion title..."
              required
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title}</p>
            )}
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              Description
            </label>
            <Textarea
              id="content"
              value={data.content}
              onChange={e => setData('content', e.target.value)}
              placeholder="Describe what you'd like to discuss..."
              rows={4}
            />
            {errors.content && (
              <p className="text-sm text-red-600 mt-1">{errors.content}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? 'Creating...' : 'Create Discussion'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Discussions - ${discussionable.title}`} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 lg:gap-6 lg:p-6">
        {/* Page Header */}
        <PageHeader
          title="Discussions"
          description={`${discussionable.title} • ${discussions.total} discussions`}
          backUrl={route('courses.show', { course: discussionable.id })}
          backLabel={isMobile ? 'Back' : 'Back to Course'}
          actions={pageHeaderActions}
          stats={[
            {
              label: 'Total',
              value: discussions.total,
              icon: <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />,
            },
            {
              label: 'Pinned',
              value: discussions.data.filter(d => d.is_pinned).length,
              icon: <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />,
            },
          ]}
        />

        {/* Search and Filter Bar */}
        {(discussions.data.length > 0) || searchQuery || statusFilter !== 'all' ? (
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search discussions..."
            filters={[
              {
                key: 'status',
                value: statusFilter,
                label: 'Status',
                options: searchFilterOptions,
                onChange: (value) => setStatusFilter(value as 'all' | 'pinned' | 'locked'),
              },
            ]}
            showClearButton={true}
            onClear={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
          />
        ) : null}

        {/* Discussions List */}
        <div className="space-y-4">
          {filteredDiscussions.length > 0 ? (
            filteredDiscussions.map((discussion) => (
              <Card key={discussion.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Link
                          href={route('courses.discussions.show', {
                            course: discussionable.id,
                            discussion: discussion.id
                          })}
                          className="text-lg font-semibold hover:text-blue-600 transition-colors"
                        >
                          {discussion.title}
                        </Link>
                        {discussion.is_pinned && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pinned
                          </span>
                        )}
                        {discussion.is_locked && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Locked
                          </span>
                        )}
                      </div>

                      {discussion.content && (
                        <p className="text-muted-foreground mb-3 line-clamp-2">
                          {discussion.content}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {discussion.user?.name || 'Unknown User'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(discussion.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {discussion.comments_count} comments
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No discussions found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Be the first to start a discussion in this course!'
                  }
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Start First Discussion
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {discussions.last_page > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              {Array.from({ length: discussions.last_page }, (_, i) => i + 1).map((page) => (
                <Link
                  key={page}
                  href={route('courses.discussions.index', {
                    course: discussionable.id,
                    page
                  })}
                  className={`px-3 py-2 rounded-md text-sm ${
                    page === discussions.current_page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Index;
