# Quick Start Guide

Get your SEO Writer SaaS up and running in 10 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Supabase account created
- [ ] n8n instance running at `https://n8n.easyourtour.com`

## 5-Minute Setup

### 1. Install Dependencies (1 min)

```bash
cd seo-writer-app
npm install
```

### 2. Create Supabase Project (2 min)

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Name: `seo-writer`
4. Set password (save it!)OfEGii6wvH13rp7C
5. Wait ~2 minutes for setup

### 3. Run Database Schema (1 min)

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy/paste from `database/schema.sql`
4. Click **Run** (Cmd/Ctrl + Enter)
5. You should see "✅ Database schema created successfully!"

### 4. Get API Keys (1 min)

In Supabase:
1. Go to **Settings** → **API**
2. Copy these three values:
   - Project URL
   - `anon` public key  
   - `service_role` key  

### 5. Create .env.local File (1 min)

Create `.env.local` in the root directory:

```bash
# Supabase (paste your values)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# n8n (already configured)
N8N_WEBHOOK_URL=https://n8n.easyourtour.com/webhook/a51b2a16-1bd3-42c5-836e-58c090a7fbe5
N8N_WEBHOOK_SECRET=seo-writer-webhook-secret-2024

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 6. Start the App! (30 sec)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## First Steps

### Create Your Account

1. Click **"Get Started"** or **"Sign up"**
2. Enter your email and password
3. You'll be redirected to the dashboard

### Generate Your First Article

1. In the dashboard, find the "Generate New Article" form
2. Enter a topic, e.g., "How to Build a SaaS in 2024"
3. Optionally add keywords: "saas, startup, development"
4. Set word limit: 1000
5. Click **"Generate Article"**

### Watch the Magic Happen

- Status will show "Processing" (this takes 2-5 minutes)
- The page updates automatically via real-time subscriptions
- When complete, click **"View"** to see your article

### View & Export

On the article page you can:
- ✅ View the full generated content
- ✅ See SEO metadata and key takeaways
- ✅ Edit the content
- ✅ Copy to clipboard
- ✅ Export as Markdown

## Next: Configure n8n Webhook

Your app is running, but n8n needs to be configured to send results back.

See `N8N_INTEGRATION.md` for detailed instructions.

**Quick version:**

1. Open your n8n workflow
2. Add an HTTP Request node at the end
3. Configure it to POST to: `http://localhost:3000/api/webhooks/n8n`
4. Add header: `X-Webhook-Secret: seo-writer-webhook-secret-2024`
5. Send the results as JSON (see N8N_INTEGRATION.md for exact format)

## Testing Without n8n (Optional)

You can test the app without n8n by manually updating a job:

1. Create a job in the app
2. Copy the job ID from the URL or database
3. Use curl to simulate n8n callback:

```bash
curl -X POST http://localhost:3000/api/webhooks/n8n \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: seo-writer-webhook-secret-2024" \
  -d '{
    "job_id": "YOUR_JOB_ID",
    "status": "completed",
    "result": {
      "refined_title": "Test Article Title",
      "content": "This is test content...",
      "word_count": 100,
      "metadata": {
        "seo_title": "Test SEO Title",
        "meta_description": "Test description"
      }
    }
  }'
```

## Common Issues

### "Can't connect to Supabase"
- Check your `.env.local` file exists
- Verify the values are correct (no extra spaces)
- Restart the dev server: `npm run dev`

### "Job stuck in processing"
- n8n webhook hasn't been configured yet
- Check n8n is running
- Verify webhook URL is correct

### "Unauthorized" errors
- Clear browser cookies
- Sign out and sign in again
- Check Supabase RLS policies are enabled

## Production Deployment

When you're ready to deploy:

1. Push code to GitHub
2. Import to Vercel
3. Add environment variables in Vercel
4. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
5. Update n8n webhook callback URL
6. Deploy! 🚀

See `README.md` for detailed deployment instructions.

## Need Help?

- 📖 Read `SETUP.md` for detailed setup
- 🔗 Check `N8N_INTEGRATION.md` for n8n configuration
- 📝 See `README.md` for full documentation
- 🐛 Check browser console and terminal for errors

## What's Next?

- [ ] Configure n8n webhook callback
- [ ] Test end-to-end article generation
- [ ] Customize the design (it's minimalist by default!)
- [ ] Deploy to production
- [ ] Share with friends! 🎉

Happy writing! ✍️

