'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ArticleSubmitFormProps {
  onJobCreated: () => void;
}

export default function ArticleSubmitForm({ onJobCreated }: ArticleSubmitFormProps) {
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [wordLimit, setWordLimit] = useState('1000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          keywords: keywords.trim() || undefined,
          word_limit: parseInt(wordLimit) || 1000,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to create article job');
        return;
      }

      setSuccess(true);
      setTopic('');
      setKeywords('');
      setWordLimit('1000');
      onJobCreated();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate New Article</CardTitle>
        <CardDescription>
          Enter a topic and optional keywords to generate an SEO-optimized article
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>
                Article generation started! Check the list below for progress.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="topic">Article Topic *</Label>
            <Textarea
              id="topic"
              placeholder="e.g., How to Build a SaaS in 2024"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              disabled={loading}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (optional)</Label>
              <Input
                id="keywords"
                type="text"
                placeholder="e.g., saas, startup, development"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wordLimit">Word Limit</Label>
              <Input
                id="wordLimit"
                type="number"
                min="500"
                max="5000"
                step="100"
                value={wordLimit}
                onChange={(e) => setWordLimit(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !topic.trim()}
          >
            {loading ? 'Creating...' : 'Generate Article'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

