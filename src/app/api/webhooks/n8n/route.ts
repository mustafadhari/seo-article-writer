import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { JobOutputData } from '@/lib/types/database';

// POST /api/webhooks/n8n - Receive results from n8n
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const webhookSecret = request.headers.get('x-webhook-secret');
    
    if (webhookSecret !== process.env.N8N_WEBHOOK_SECRET) {
      console.error('Invalid webhook secret');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { job_id, status, result, error } = body;

    // Validate required fields
    if (!job_id || !status) {
      return NextResponse.json(
        { success: false, error: 'job_id and status are required' },
        { status: 400 }
      );
    }

    // Use service client to bypass RLS
    const supabase = createServiceClient();

    // Get the job to verify it exists
    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', job_id)
      .single();

    if (fetchError || !existingJob) {
      console.error('Job not found:', job_id);
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Calculate processing time
    const createdAt = new Date(existingJob.created_at);
    const completedAt = new Date();
    const processingTimeMs = completedAt.getTime() - createdAt.getTime();
    const processingTime = `${Math.floor(processingTimeMs / 1000)} seconds`;

    // Update job based on status
    if (status === 'completed' && result) {
      // Parse and validate result data (simplified)
      const outputData: JobOutputData = {
        original_topic: result.original_topic || existingJob.input_data.topic,
        original_keywords: result.original_keywords || existingJob.input_data.keywords,
        refined_title: result.refined_title || result.new_title || 'Untitled',
        seo_title: result.seo_title || result.metadata?.seo_title || '',
        seo_description: result.seo_description || result.metadata?.meta_description || result.description || '',
        image_url: result.image_url || result.metadata?.image_url || result.image || '',
        doc_link: result.doc_link || result.document_link || '',
      };

      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          status: 'completed',
          output_data: outputData,
          processing_time: processingTime,
          completed_at: completedAt.toISOString(),
        })
        .eq('id', job_id);

      if (updateError) {
        console.error('Error updating job:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update job' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Job completed successfully',
      });
    } else if (status === 'failed') {
      // Update job as failed
      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          status: 'failed',
          error_message: error || 'Unknown error occurred',
          processing_time: processingTime,
        })
        .eq('id', job_id);

      if (updateError) {
        console.error('Error updating job:', updateError);
        return NextResponse.json(
          { success: false, error: 'Failed to update job' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Job marked as failed',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in webhook handler:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

