// Database types for TypeScript

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type ActionType = 'article_generated' | 'export' | 'api_call';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: SubscriptionTier;
  monthly_quota: number;
  monthly_usage: number;
  quota_reset_date: string;
  created_at: string;
  updated_at: string;
}

export interface JobInputData {
  topic: string;
  keywords?: string;
  word_limit?: number;
}

export interface JobOutputData {
  original_topic: string;
  original_keywords?: string;
  refined_title: string;
  seo_title: string;
  seo_description: string;
  image_url?: string;
  doc_link?: string;
}

export interface Job {
  id: string;
  user_id: string;
  status: JobStatus;
  input_data: JobInputData;
  output_data: JobOutputData | null;
  error_message: string | null;
  processing_time: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface UsageLog {
  id: string;
  user_id: string;
  job_id: string | null;
  action_type: ActionType;
  credits_used: number;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  default_word_limit: number;
  default_tone: string;
  auto_export_format: string;
  notification_preferences: {
    email: boolean;
    in_app: boolean;
  };
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface JobListResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
}

