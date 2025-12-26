import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { JobInputData } from '@/lib/types/database';

// GET /api/jobs - List all jobs for authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: jobs, error, count } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        jobs: jobs || [],
        total: count || 0,
        page: Math.floor(offset / limit) + 1,
        limit,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create new article generation job
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { topic, keywords, word_limit } = body;

    // Validate input
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Topic is required' },
        { status: 400 }
      );
    }

    if (!keywords || typeof keywords !== 'string' || keywords.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Keywords are required' },
        { status: 400 }
      );
    }

    // Check user quota (optional for personal use, but good to have)
    const { data: profile } = await supabase
      .from('profiles')
      .select('monthly_quota, monthly_usage')
      .eq('id', user.id)
      .single();

    if (profile && profile.monthly_usage >= profile.monthly_quota) {
      return NextResponse.json(
        {
          success: false,
          error: 'Monthly quota exceeded',
          details: {
            current_usage: profile.monthly_usage,
            quota: profile.monthly_quota,
          },
        },
        { status: 429 }
      );
    }

    // Create job input data
    const inputData: JobInputData = {
      topic: topic.trim(),
      keywords: keywords.trim(),
      word_limit: word_limit || 1000,
    };

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        user_id: user.id,
        status: 'pending',
        input_data: inputData,
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating job:', jobError);
      return NextResponse.json(
        { success: false, error: 'Failed to create job' },
        { status: 500 }
      );
    }

    // Trigger n8n webhook
    try {
      const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: job.id,
          topic: inputData.topic,
          keywords: inputData.keywords,
          word_limit: inputData.word_limit,
        }),
      });

      if (!n8nResponse.ok) {
        console.error('n8n webhook failed:', await n8nResponse.text());
        // Update job status to failed
        await supabase
          .from('jobs')
          .update({
            status: 'failed',
            error_message: 'Failed to trigger n8n workflow',
          })
          .eq('id', job.id);

        return NextResponse.json(
          { success: false, error: 'Failed to start article generation' },
          { status: 500 }
        );
      }

      // Update job status to processing
      await supabase
        .from('jobs')
        .update({ status: 'processing' })
        .eq('id', job.id);

      // Update usage count
      if (profile) {
        await supabase
          .from('profiles')
          .update({ monthly_usage: profile.monthly_usage + 1 })
          .eq('id', user.id);
      }

      // Log usage
      await supabase.from('usage_logs').insert({
        user_id: user.id,
        job_id: job.id,
        action_type: 'article_generated',
        credits_used: 1,
      });

      return NextResponse.json({
        success: true,
        data: {
          job: {
            ...job,
            status: 'processing',
          },
        },
      });
    } catch (n8nError) {
      console.error('Error calling n8n webhook:', n8nError);
      
      // Update job status to failed
      await supabase
        .from('jobs')
        .update({
          status: 'failed',
          error_message: 'Failed to connect to generation service',
        })
        .eq('id', job.id);

      return NextResponse.json(
        { success: false, error: 'Failed to start article generation' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

