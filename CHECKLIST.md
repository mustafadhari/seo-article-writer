# Setup Checklist

Use this checklist to get your SEO Writer SaaS up and running!

## Phase 1: Initial Setup (10 minutes)

### Install Dependencies
- [ ] Navigate to project: `cd seo-writer-app`
- [ ] Run: `npm install`
- [ ] Wait for installation to complete

### Create Supabase Project
- [ ] Go to [app.supabase.com](https://app.supabase.com)
- [ ] Click "New Project"
- [ ] Name: `seo-writer` (or your choice)
- [ ] Set a strong database password
- [ ] Choose a region close to you
- [ ] Wait ~2 minutes for project creation

### Set Up Database
- [ ] In Supabase, go to **SQL Editor**
- [ ] Click **New Query**
- [ ] Open `database/schema.sql` in your code editor
- [ ] Copy the entire SQL content
- [ ] Paste into Supabase SQL Editor
- [ ] Click **Run** (or press Cmd/Ctrl + Enter)
- [ ] Verify you see "✅ Database schema created successfully!"

### Get API Keys
- [ ] In Supabase, go to **Settings** → **API**
- [ ] Copy **Project URL** (looks like: `https://xxxxx.supabase.co`)
- [ ] Copy **anon public** key (starts with `eyJ...`)
- [ ] Copy **service_role** key (starts with `eyJ...`)
- [ ] Keep these safe - you'll need them next!

### Create Environment File
- [ ] In project root, create file: `.env.local`
- [ ] Copy template from below
- [ ] Paste your Supabase values
- [ ] Save the file

```bash
# Supabase - REPLACE WITH YOUR VALUES
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# n8n - ALREADY CONFIGURED
N8N_WEBHOOK_URL=https://n8n.easyourtour.com/webhook/a51b2a16-1bd3-42c5-836e-58c090a7fbe5
N8N_WEBHOOK_SECRET=seo-writer-webhook-secret-2024

# App - KEEP AS IS FOR NOW
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Start the App
- [ ] Run: `npm run dev`
- [ ] Wait for "Ready" message
- [ ] Open browser to [http://localhost:3000](http://localhost:3000)
- [ ] You should see the landing page!

## Phase 2: Test the App (5 minutes)

### Create Account
- [ ] Click "Get Started" or "Sign up"
- [ ] Enter your email
- [ ] Enter a password (min 6 characters)
- [ ] Enter your full name
- [ ] Click "Create account"
- [ ] You should be redirected to dashboard

### Test Dashboard
- [ ] Verify you see "SEO Article Generator" heading
- [ ] See the "Generate New Article" form
- [ ] See empty article list (you haven't created any yet)

### Create Test Job (Without n8n)
- [ ] Enter topic: "Test Article"
- [ ] Enter keywords: "test, demo"
- [ ] Word limit: 500
- [ ] Click "Generate Article"
- [ ] You should see success message
- [ ] Article appears in list with "Processing" status

**Note:** It will stay "Processing" until we configure n8n!

## Phase 3: Configure n8n (15 minutes)

### Open n8n Workflow
- [ ] Go to your n8n instance
- [ ] Open "SEO Writer Engine" workflow
- [ ] Make sure it's not currently executing

### Add Webhook Trigger (If Not Already There)
- [ ] Check if webhook node exists with path `a51b2a16-1bd3-42c5-836e-58c090a7fbe5`
- [ ] If not, add new **Webhook** node
- [ ] Set path to: `a51b2a16-1bd3-42c5-836e-58c090a7fbe5`
- [ ] Set method: POST
- [ ] Set response mode: "When Last Node Finishes"

### Add Input Processing Node
- [ ] Add **Set** node after webhook
- [ ] Name it: "Process Webhook Input"
- [ ] Add these fields:
  - `job_id` = `{{ $json.body.job_id }}`
  - `topic` = `{{ $json.body.topic }}`
  - `keywords` = `{{ $json.body.keywords }}`
  - `word_limit` = `{{ $json.body.word_limit }}`

### Add Callback Node (CRITICAL!)
- [ ] Go to the END of your workflow
- [ ] Add new **HTTP Request** node
- [ ] Name it: "Send Results to App"
- [ ] Method: POST
- [ ] URL: `{{ $env.APP_WEBHOOK_URL }}/api/webhooks/n8n`
- [ ] Enable "Send Headers"
- [ ] Add header: `Content-Type` = `application/json`
- [ ] Add header: `X-Webhook-Secret` = `{{ $env.WEBHOOK_SECRET }}`
- [ ] Enable "Send Body"
- [ ] Body type: JSON
- [ ] Copy body structure from `N8N_INTEGRATION.md`

### Set Environment Variables in n8n
- [ ] In n8n settings, add environment variables:
  - `APP_WEBHOOK_URL` = `http://localhost:3000`
  - `WEBHOOK_SECRET` = `seo-writer-webhook-secret-2024`

### Save and Test
- [ ] Save the workflow
- [ ] Activate the workflow
- [ ] Test with manual execution

## Phase 4: End-to-End Test (5 minutes)

### Generate Real Article
- [ ] Go back to your app dashboard
- [ ] Create new article with topic: "How to Test Webhooks"
- [ ] Keywords: "webhooks, testing, n8n"
- [ ] Word limit: 500
- [ ] Click "Generate Article"

### Monitor Progress
- [ ] Watch status change from "Pending" to "Processing"
- [ ] Check n8n execution logs
- [ ] Wait 2-5 minutes for completion
- [ ] Status should change to "Completed"

### View Article
- [ ] Click "View" button
- [ ] Verify you see:
  - [ ] Refined title
  - [ ] SEO metadata
  - [ ] Key takeaways
  - [ ] Full article content
  - [ ] Word count

### Test Features
- [ ] Click "Edit" - verify you can edit content
- [ ] Click "Save" - verify changes persist
- [ ] Click "Copy" - verify content copies to clipboard
- [ ] Click "Export Markdown" - verify file downloads
- [ ] Verify filename is correct
- [ ] Open downloaded file - verify content is formatted

### Test Real-time Updates
- [ ] Create another article
- [ ] Keep dashboard open
- [ ] Watch status update automatically (no refresh needed!)

## Phase 5: Production Deployment (Optional)

### Prepare for Production
- [ ] Push code to GitHub
- [ ] Create Vercel account (if needed)
- [ ] Import project to Vercel

### Configure Vercel
- [ ] Add all environment variables in Vercel dashboard
- [ ] Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
- [ ] Deploy!

### Update n8n
- [ ] In n8n environment variables, update:
  - `APP_WEBHOOK_URL` = `https://your-app.vercel.app`
- [ ] Save workflow
- [ ] Test production deployment

### Final Production Test
- [ ] Visit your Vercel URL
- [ ] Sign up with new account
- [ ] Generate test article
- [ ] Verify everything works

## Troubleshooting Checklist

### App Won't Start
- [ ] Check Node.js version (18+)
- [ ] Delete `node_modules` and run `npm install` again
- [ ] Check for port conflicts (3000)

### Can't Connect to Supabase
- [ ] Verify `.env.local` exists
- [ ] Check environment variables are correct
- [ ] No extra spaces in values
- [ ] Restart dev server

### Authentication Issues
- [ ] Check Supabase project is active
- [ ] Verify RLS policies were created (run schema.sql)
- [ ] Clear browser cookies
- [ ] Try incognito mode

### Job Stuck in Processing
- [ ] Check n8n workflow is active
- [ ] Verify callback node is configured
- [ ] Check n8n execution logs
- [ ] Verify webhook secret matches
- [ ] Check app API logs

### n8n Callback Not Working
- [ ] Verify `APP_WEBHOOK_URL` in n8n
- [ ] Check webhook secret matches
- [ ] Verify app is running and accessible
- [ ] Check firewall/network settings
- [ ] Look at n8n HTTP Request node logs

## Success Criteria

You're done when:

✅ App starts without errors  
✅ You can sign up and log in  
✅ Dashboard loads correctly  
✅ You can create article jobs  
✅ n8n receives webhook requests  
✅ n8n processes articles  
✅ Callback updates job status  
✅ Articles show as "Completed"  
✅ You can view full articles  
✅ You can edit and save changes  
✅ You can export to Markdown  
✅ Real-time updates work  

## Need Help?

- 📖 Read `QUICKSTART.md` for quick setup
- 🔧 Check `N8N_INTEGRATION.md` for n8n details
- 📚 See `README.md` for full documentation
- 📋 Review `PROJECT_SUMMARY.md` for overview

## Congratulations! 🎉

When all items are checked, you have a fully functional AI-powered SaaS!

Start generating amazing SEO-optimized articles! ✍️

