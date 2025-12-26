# Setup Guide - SEO Writer SaaS

## 1. Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Name it: `seo-writer`
4. Set a strong database password (save it!)
5. Choose a region close to you
6. Wait for project to be ready (~2 minutes)

## 2. Get Supabase Credentials

From your Supabase project dashboard:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`)

## 3. Create Environment Variables

Create a file `.env.local` in the root of this project:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...your-service-role-key

# n8n Webhook Configuration
N8N_WEBHOOK_URL=https://n8n.easyourtour.com/webhook/a51b2a16-1bd3-42c5-836e-58c090a7fbe5
N8N_WEBHOOK_SECRET=seo-writer-webhook-secret-2024

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 4. Run Database Migration

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the SQL from `database/schema.sql`
4. Click **Run** (or press Cmd/Ctrl + Enter)

## 5. Install Dependencies & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 6. Configure n8n Webhook Response

In your n8n workflow, add an HTTP Request node at the end to call back:

- **URL:** `http://localhost:3000/api/webhooks/n8n` (or your production URL)
- **Method:** POST
- **Headers:** 
  - `Content-Type`: `application/json`
  - `X-Webhook-Secret`: `seo-writer-webhook-secret-2024`
- **Body:**
```json
{
  "job_id": "{{ $node['Webhook'].json.job_id }}",
  "status": "completed",
  "result": {
    "refined_title": "...",
    "content": "...",
    "metadata": {}
  }
}
```

## Troubleshooting

- **Can't connect to Supabase?** Check your environment variables
- **n8n webhook not working?** Verify the webhook secret matches
- **Database errors?** Make sure you ran the schema.sql

