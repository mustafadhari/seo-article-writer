'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import ArticleSubmitForm from '@/components/dashboard/ArticleSubmitForm';
import ArticleList from '@/components/dashboard/ArticleList';
import type { Job } from '@/lib/types/database';

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const supabase = createClient();

  const fetchJobs = async () => {
    try {
      // Check for timed out jobs first
      await fetch('/api/jobs/check-timeout');
      
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.set('status', filter);
      }
      params.set('limit', '50');

      const response = await fetch(`/api/jobs?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setJobs(data.data.jobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Set up real-time subscription
    const channel = supabase
      .channel('jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
        },
        () => {
          // Refetch jobs when changes occur
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  const handleJobCreated = () => {
    fetchJobs();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">SEO Article Generator</h1>
        <p className="text-neutral-600">
          Generate SEO-optimized articles with AI
        </p>
      </div>

      <ArticleSubmitForm onJobCreated={handleJobCreated} />

      <ArticleList
        jobs={jobs}
        loading={loading}
        filter={filter}
        onFilterChange={setFilter}
      />
    </div>
  );
}

