'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Job } from '@/lib/types/database';
import Link from 'next/link';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJob();
  }, [params.id]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setJob(data.data.job);
      } else {
        setError(data.error || 'Failed to load article');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInfo = async () => {
    if (!job?.output_data) return;

    const info = `Original Topic: ${job.output_data.original_topic}
Original Keywords: ${job.output_data.original_keywords || 'N/A'}
New Title: ${job.output_data.refined_title}
SEO Title: ${job.output_data.seo_title}
SEO Description: ${job.output_data.seo_description}
Image URL: ${job.output_data.image_url || 'N/A'}
Document Link: ${job.output_data.doc_link || 'N/A'}`;

    try {
      await navigator.clipboard.writeText(info);
      alert('Information copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    }
  };

  const handleDelete = async () => {
    if (!job) return;
    
    if (!confirm('Are you sure you want to delete this article?')) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError('Failed to delete article');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    }
  };


  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-neutral-500">
              Loading article...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-12">
            <Alert variant="destructive">
              <AlertDescription>{error || 'Article not found'}</AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Button asChild variant="outline">
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">← Back</Link>
        </Button>
        
        <div className="flex items-center gap-2">
          {job.status === 'completed' && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyInfo}
            >
              Copy Info
            </Button>
          )}
          <Badge variant={job.status === 'completed' ? 'outline' : 'secondary'}>
            {job.status}
          </Badge>
        </div>
      </div>

      {/* Article Info */}
      <Card>
        <CardHeader>
          <CardTitle>
            {job.output_data?.refined_title || job.input_data.topic}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-neutral-500">Original Topic:</span>
              <p className="font-medium">{job.output_data?.original_topic || job.input_data.topic}</p>
            </div>
            {job.output_data?.original_keywords && (
              <div>
                <span className="text-neutral-500">Original Keywords:</span>
                <p className="font-medium">{job.output_data.original_keywords}</p>
              </div>
            )}
            <div>
              <span className="text-neutral-500">New Title:</span>
              <p className="font-medium">{job.output_data?.refined_title || 'N/A'}</p>
            </div>
            <div>
              <span className="text-neutral-500">SEO Title:</span>
              <p className="font-medium">{job.output_data?.seo_title || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-neutral-500">SEO Description:</span>
              <p className="text-sm mt-1">{job.output_data?.seo_description || 'N/A'}</p>
            </div>
            {job.output_data?.image_url && (
              <div className="md:col-span-2">
                <span className="text-neutral-500">Image URL:</span>
                <a 
                  href={job.output_data.image_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all block mt-1"
                >
                  {job.output_data.image_url}
                </a>
              </div>
            )}
            {job.output_data?.doc_link && (
              <div className="md:col-span-2">
                <span className="text-neutral-500">Document Link:</span>
                <a 
                  href={job.output_data.doc_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all block mt-1"
                >
                  {job.output_data.doc_link}
                </a>
              </div>
            )}
          </div>

          {job.status === 'failed' && job.error_message && (
            <Alert variant="destructive">
              <AlertDescription>{job.error_message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            Delete Article
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

