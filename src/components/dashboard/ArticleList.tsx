'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import type { Job } from '@/lib/types/database';

interface ArticleListProps {
  jobs: Job[];
  loading: boolean;
  filter: string;
  onFilterChange: (filter: string) => void;
}

export default function ArticleList({ jobs, loading, filter, onFilterChange }: ArticleListProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      processing: 'default',
      completed: 'outline',
      failed: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const filterJobs = (status?: string) => {
    if (!status || status === 'all') return jobs;
    return jobs.filter(job => job.status === status);
  };

  const counts = {
    all: jobs.length,
    completed: jobs.filter(j => j.status === 'completed').length,
    processing: jobs.filter(j => j.status === 'processing').length,
    pending: jobs.filter(j => j.status === 'pending').length,
    failed: jobs.filter(j => j.status === 'failed').length,
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-neutral-500">
            Loading articles...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Articles</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={onFilterChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({counts.completed})</TabsTrigger>
            <TabsTrigger value="processing">Processing ({counts.processing})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
            {counts.failed > 0 && (
              <TabsTrigger value="failed">Failed ({counts.failed})</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value={filter} className="space-y-3">
            {filterJobs(filter === 'all' ? undefined : filter).length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <p className="mb-2">No articles found</p>
                <p className="text-sm">Generate your first article using the form above</p>
              </div>
            ) : (
              filterJobs(filter === 'all' ? undefined : filter).map((job) => (
                <div
                  key={job.id}
                  className="border rounded-lg p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(job.status)}
                        <span className="text-xs text-neutral-500">
                          {formatDate(job.created_at)}
                        </span>
                      </div>
                      
                      <h3 className="font-medium mb-1 truncate">
                        {job.output_data?.refined_title || job.input_data.topic}
                      </h3>
                      
                      <p className="text-sm text-neutral-600 line-clamp-2">
                        {job.input_data.topic}
                      </p>

                      {job.input_data.keywords && (
                        <p className="text-xs text-neutral-500 mt-2">
                          Keywords: {job.input_data.keywords}
                        </p>
                      )}

                      {job.error_message && (
                        <p className="text-xs text-red-600 mt-2">
                          Error: {job.error_message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {job.status === 'completed' && (
                        <Button asChild size="sm">
                          <Link href={`/dashboard/articles/${job.id}`}>
                            View
                          </Link>
                        </Button>
                      )}
                      
                      {(job.status === 'pending' || job.status === 'processing') && (
                        <Button size="sm" variant="outline" disabled>
                          Processing...
                        </Button>
                      )}

                      {job.status === 'failed' && (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/dashboard/articles/${job.id}`}>
                            Details
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

