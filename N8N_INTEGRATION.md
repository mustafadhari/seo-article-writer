# n8n Integration Guide

This guide explains how to integrate your existing "SEO Writer Engine" n8n workflow with the web application.

## Current Workflow Overview

Your n8n workflow currently:
1. Reads topics from Google Sheets
2. Processes them through multiple AI agents
3. Writes results back to Google Sheets

## Integration Strategy

We'll **ADD** a webhook trigger to your workflow (keeping Google Sheets for batch operations) so it can:
- Accept individual requests from the web app
- Process them through the same AI pipeline
- Send results back to the web app

## Step-by-Step Integration

### Step 1: Understand Your Workflow Structure

Your current workflow has these key nodes:
- **Get post titles** (Google Sheets) - Current entry point
- **Set Key Takeaways** - Processes key points
- **Key Takeaways AI Agent** - Extracts key information
- **Outline Agent** - Creates article structure
- **Refine the Title** - Optimizes the title
- **Set Post New Title** - Stores refined title
- **Set Post Outline** - Stores outline
- **Perplexity Research** - Conducts research
- **Post Content Writer Agent** - Generates article
- **Post Meta Agent** - Creates SEO metadata
- **Set Post Metadata** - Stores metadata
- **Set Draft Post** - Final content storage
- **Get New Image URL** - Image generation

### Step 2: Add Webhook Trigger

1. **Open your workflow** in n8n
2. **Add a new Webhook node** at the beginning (parallel to Google Sheets)
3. **Configure the Webhook node**:
   - **Webhook URLs**: Production URL
   - **HTTP Method**: POST
   - **Path**: Use your existing path `a51b2a16-1bd3-42c5-836e-58c090a7fbe5`
   - **Response Mode**: "When Last Node Finishes"
   - **Response Code**: 200

### Step 3: Add Input Processing Node

After the webhook, add a **Set** node to structure the incoming data:

**Node Name**: "Process Webhook Input"

**Fields to Set**:
```
job_id = {{ $json.body.job_id }}
topic = {{ $json.body.topic }}
keywords = {{ $json.body.keywords }}
word_limit = {{ $json.body.word_limit }}
```

### Step 4: Connect to Existing Pipeline

Connect the "Process Webhook Input" node to your first AI agent node (likely "Key Takeaways AI Agent").

**Update all subsequent nodes** to reference the webhook data:
- Replace `{{ $node["Get post titles"].json["topic"] }}` 
- With `{{ $node["Process Webhook Input"].json["topic"] }}`

### Step 5: Add Callback Node (CRITICAL!)

At the **END** of your workflow, add an **HTTP Request** node to send results back:

**Node Name**: "Send Results to App"

**Configuration**:
- **Method**: POST
- **URL**: `{{ $env.APP_WEBHOOK_URL }}/api/webhooks/n8n`
- **Authentication**: None (we use headers)
- **Send Headers**: ON
  - Header 1: `Content-Type` = `application/json`
  - Header 2: `X-Webhook-Secret` = `{{ $env.WEBHOOK_SECRET }}`
- **Send Body**: ON
- **Body Content Type**: JSON
- **Specify Body**: Using Fields Below

**Body Fields**:
```json
{
  "job_id": "{{ $node['Process Webhook Input'].json.job_id }}",
  "status": "completed",
  "result": {
    "original_topic": "{{ $node['Process Webhook Input'].json.topic }}",
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

**Note**: Adjust the node names in `{{ }}` to match your actual node names!

### Step 6: Add Error Handling

Create an **Error Workflow** to handle failures:

1. **Create new workflow**: "SEO Writer Error Handler"
2. **Add Error Trigger node**
3. **Add HTTP Request node** with same config as above, but:

**Body**:
```json
{
  "job_id": "{{ $json.job_id }}",
  "status": "failed",
  "error": "{{ $json.error.message }}"
}
```

4. **Link error workflow**: In your main workflow settings, set "Error Workflow" to "SEO Writer Error Handler"

### Step 7: Set Environment Variables in n8n

In your n8n instance settings, add these environment variables:

```bash
APP_WEBHOOK_URL=http://localhost:3000
WEBHOOK_SECRET=seo-writer-webhook-secret-2024
```

**For production**, update to:
```bash
APP_WEBHOOK_URL=https://your-app.vercel.app
WEBHOOK_SECRET=seo-writer-webhook-secret-2024
```

### Step 8: Test the Integration

#### Test Webhook Trigger

Use curl to test the webhook:

```bash
curl -X POST https://n8n.easyourtour.com/webhook/a51b2a16-1bd3-42c5-836e-58c090a7fbe5 \
  -H "Content-Type: application/json" \
  -d '{
    "job_id": "test-123",
    "topic": "How to Test n8n Webhooks",
    "keywords": "n8n, testing, webhooks",
    "word_limit": 500
  }'
```

#### Test Callback

Check your app logs to see if it receives the callback:

```bash
# In your app directory
npm run dev

# Watch for webhook POST to /api/webhooks/n8n
```

## Workflow Diagram

```
┌─────────────────────┐
│  Google Sheets      │ ← Keep for batch processing
│  (Trigger)          │
└──────────┬──────────┘
           │
           ├─────────────────────┐
           │                     │
┌──────────▼──────────┐ ┌───────▼────────┐
│  Webhook Trigger    │ │  Manual Trigger│
│  (Web App)          │ │  (Testing)     │
└──────────┬──────────┘ └───────┬────────┘
           │                     │
           └──────────┬──────────┘
                      │
           ┌──────────▼──────────┐
           │ Process Input       │
           │ (Set Node)          │
           └──────────┬──────────┘
                      │
           ┌──────────▼──────────┐
           │ Key Takeaways Agent │
           └──────────┬──────────┘
                      │
           ┌──────────▼──────────┐
           │ Outline Agent       │
           └──────────┬──────────┘
                      │
           ┌──────────▼──────────┐
           │ Title Refiner       │
           └──────────┬──────────┘
                      │
           ┌──────────▼──────────┐
           │ Perplexity Research │
           └──────────┬──────────┘
                      │
           ┌──────────▼──────────┐
           │ Content Writer      │
           └──────────┬──────────┘
                      │
           ┌──────────▼──────────┐
           │ Meta Agent          │
           └──────────┬──────────┘
                      │
           ┌──────────▼──────────┐
           │ Image Generation    │
           └──────────┬──────────┘
                      │
           ┌──────────▼──────────┐
           │ Send Results to App │
           │ (HTTP Request)      │
           └─────────────────────┘
```

## Troubleshooting

### Webhook not receiving requests
- Check webhook URL is correct
- Verify n8n instance is accessible from your app
- Check firewall/network settings

### Callback not working
- Verify `APP_WEBHOOK_URL` environment variable
- Check `WEBHOOK_SECRET` matches in both places
- Look at n8n execution logs for HTTP Request errors
- Verify your app is running and accessible

### Node reference errors
- Double-check node names in `{{ }}` expressions
- Use n8n's expression editor to verify paths
- Test with manual execution first

### Data not mapping correctly
- Check the structure of data coming from each node
- Use n8n's "View Data" feature to inspect
- Adjust field names in the callback body

## Advanced: Dual Mode Operation

Your workflow now supports TWO modes:

### Mode 1: Batch Processing (Google Sheets)
- Runs on schedule or manual trigger
- Processes multiple topics from spreadsheet
- Writes results back to spreadsheet

### Mode 2: Real-time (Web App)
- Triggered by webhook from web app
- Processes single topic
- Sends results back to web app

Both modes use the **same AI pipeline**, just different entry/exit points!

## Next Steps

1. ✅ Add webhook trigger
2. ✅ Add input processing
3. ✅ Update node references
4. ✅ Add callback node
5. ✅ Set environment variables
6. ✅ Test with curl
7. ✅ Test end-to-end with web app
8. ✅ Deploy to production
9. ✅ Update production URLs

## Support

If you encounter issues:
1. Check n8n execution logs
2. Check app API logs
3. Verify webhook secret matches
4. Test each component separately
5. Use n8n's manual execution for debugging

