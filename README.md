# SEO Writer SaaS

A minimalist AI-powered SaaS application for generating SEO-optimized articles using n8n automation workflows.

## Features

- 🤖 **AI-Powered Content Generation** - Multiple AI agents for research, outlining, and writing
- 🎯 **SEO Optimization** - Automatic title refinement, meta descriptions, and keyword integration
- ✍️ **Edit & Export** - Edit generated content and export to Markdown
- 🔄 **Real-time Updates** - Live status updates as articles are being generated
- 🔐 **Secure Authentication** - User authentication with Supabase
- 📊 **Usage Tracking** - Monitor your article generation history

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Engine**: n8n workflow automation
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([sign up here](https://app.supabase.com))
- An n8n instance with the SEO Writer workflow running

### 1. Clone and Install

```bash
cd seo-writer-app
npm install
```

### 2. Set Up Supabase

1. Create a new project at [https://app.supabase.com](https://app.supabase.com)
2. Go to **Settings** → **API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (keep this secret!)

3. Go to **SQL Editor** and run the schema from `database/schema.sql`

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# n8n
N8N_WEBHOOK_URL=https://n8n.easyourtour.com/webhook/a51b2a16-1bd3-42c5-836e-58c090a7fbe5
N8N_WEBHOOK_SECRET=seo-writer-webhook-secret-2024

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Configure n8n Webhook Response

In your n8n "SEO Writer Engine" workflow, add an HTTP Request node at the end:

**Configuration:**
- **URL**: `http://localhost:3000/api/webhooks/n8n` (or your production URL)
- **Method**: POST
- **Headers**:
  - `Content-Type`: `application/json`
  - `X-Webhook-Secret`: `seo-writer-webhook-secret-2024`
- **Body**:

```json
{
  "job_id": "{{ $node['Webhook'].json.job_id }}",
  "status": "completed",
  "result": {
    "refined_title": "{{ $node['Set Post New Title'].json.new_title }}",
    "title_reasoning": "{{ $node['Set Post New Title'].json.reasoning }}",
    "key_takeaways": "{{ $node['Set Key Takeaways'].json.key_takeaways }}",
    "outline": "{{ $node['Set Post Outline'].json.post_outline }}",
    "content": "{{ $node['Set Draft Post'].json.post_draft_body }}",
    "word_count": "{{ $node['Set Draft Post'].json.post_draft_body.length }}",
    "metadata": {
      "seo_title": "{{ $node['Set Post Metadata'].json.title }}",
      "meta_description": "{{ $node['Set Post Metadata'].json.description }}",
      "image_url": "{{ $node['Get New Image URL'].json.image }}",
      "image_prompt": "{{ $node['Set Post Metadata'].json.image_prompt }}"
    },
    "research": "{{ $node['Perplexity Research'].json.research }}"
  }
}
```

## Project Structure

```
seo-writer-app/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   ├── jobs/            # Job management endpoints
│   │   │   └── webhooks/        # n8n webhook handler
│   │   ├── dashboard/           # Dashboard pages
│   │   ├── login/               # Login page
│   │   ├── signup/              # Signup page
│   │   └── page.tsx             # Landing page
│   │
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── layout/              # Layout components
│   │   └── dashboard/           # Dashboard-specific components
│   │
│   ├── lib/                     # Utilities
│   │   ├── supabase/           # Supabase clients
│   │   └── types/              # TypeScript types
│   │
│   └── middleware.ts            # Auth middleware
│
├── database/
│   └── schema.sql              # Database schema
│
├── SETUP.md                    # Detailed setup guide
└── README.md                   # This file
```

## How It Works

1. **User submits a topic** on the dashboard
2. **API creates a job** in the database with status "pending"
3. **n8n webhook is triggered** with job details
4. **n8n workflow executes**:
   - Key Takeaways Agent analyzes the topic
   - Title Refiner optimizes the title
   - Outline Agent creates article structure
   - Perplexity AI conducts research
   - Content Writer generates the article
   - Meta Agent creates SEO metadata
5. **n8n calls back** to the app with results
6. **Job status updates** to "completed" with full content
7. **User views/edits/exports** the generated article

## API Endpoints

### Jobs
- `POST /api/jobs` - Create new article generation job
- `GET /api/jobs` - List all jobs (with filtering)
- `GET /api/jobs/[id]` - Get specific job details
- `PATCH /api/jobs/[id]` - Update job (edit content)
- `DELETE /api/jobs/[id]` - Delete job

### Webhooks
- `POST /api/webhooks/n8n` - Receive results from n8n (requires secret)

## Database Schema

See `database/schema.sql` for the complete schema. Main tables:

- **profiles** - User profiles and subscription info
- **jobs** - Article generation jobs and results
- **usage_logs** - Usage tracking for analytics
- **user_settings** - User preferences

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Update n8n Webhook URL

After deployment, update the webhook URL in your `.env` and n8n workflow:

```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

And in n8n, change the callback URL to:
```
https://your-app.vercel.app/api/webhooks/n8n
```

## Troubleshooting

### Can't connect to Supabase
- Verify environment variables are correct
- Check Supabase project is active
- Ensure RLS policies are enabled

### n8n webhook not working
- Verify webhook secret matches in both places
- Check n8n workflow has HTTP Request node configured
- Look at n8n execution logs for errors

### Articles stuck in "processing"
- Check n8n workflow is running
- Verify n8n can reach your webhook URL
- Check API logs for webhook errors

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## License

MIT

## Support

For issues or questions, please check the `SETUP.md` file or create an issue in the repository.
