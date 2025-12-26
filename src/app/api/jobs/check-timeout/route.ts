import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET /api/jobs/check-timeout - Check for timed out jobs
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Find jobs that have been processing for more than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    const { data: timedOutJobs, error } = await supabase
      .from('jobs')
      .select('*')
      .in('status', ['pending', 'processing'])
      .lt('created_at', tenMinutesAgo);

    if (error) {
      console.error('Error checking timeouts:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to check timeouts' },
        { status: 500 }
      );
    }

    if (timedOutJobs && timedOutJobs.length > 0) {
      // Update timed out jobs to failed
      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          status: 'failed',
          error_message: 'Job timed out after 10 minutes',
        })
        .in('id', timedOutJobs.map(job => job.id));

      if (updateError) {
        console.error('Error updating timed out jobs:', updateError);
      }

      return NextResponse.json({
        success: true,
        message: `Marked ${timedOutJobs.length} jobs as failed`,
        count: timedOutJobs.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'No timed out jobs found',
      count: 0,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

