# Deployment Guide

Complete deployment guide for Crafts & Hands marketplace.

## Architecture Overview

```
                    ┌─────────────────┐
                    │   Vercel        │
                    │   (Frontend)    │
                    │   React/Vite    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │  Supabase   │  │  Supabase   │  │  Railway    │
    │  Database   │  │  Edge Funcs │  │  Backend    │
    │  PostgreSQL │  │  (Deno)     │  │  (Node.js)  │
    └─────────────┘  └─────────────┘  └─────────────┘
```

## 1. Frontend Deployment (Vercel)

### Prerequisites
- GitHub account with frontend code
- Vercel account (free tier works)

### Steps

1. **Push to GitHub**
   ```bash
   # Ensure you're in the frontend project root
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/aurimas13/asaa-frontend.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects Vite configuration

3. **Set Environment Variables**
   In Vercel project settings, add:
   ```
   VITE_SUPABASE_URL=https://blnnlwakdpuqynbylfgq.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```

4. **Deploy**
   - Click Deploy
   - Vercel builds and deploys automatically

5. **Custom Domain (Optional)**
   - Go to Settings > Domains
   - Add `craftsandhands.lt`
   - Update DNS records as instructed

## 2. Backend Deployment (Railway)

### Prerequisites
- GitHub account with backend code
- Railway account

### Steps

1. **Push Backend to GitHub**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend commit"
   git remote add origin https://github.com/aurimas13/asaa-backend.git
   git push -u origin main
   ```

2. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" > "Deploy from GitHub repo"
   - Select `asaa-backend`

3. **Set Environment Variables**
   ```
   PORT=3001
   NODE_ENV=production
   SUPABASE_URL=https://blnnlwakdpuqynbylfgq.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   RESEND_API_KEY=<resend-api-key>
   EMAIL_FROM=noreply@craftsandhands.lt
   STRIPE_WEBHOOK_SECRET=<stripe-webhook-secret>
   FRONTEND_URL=https://craftsandhands.lt
   ```

4. **Get Service Role Key**
   - Supabase Dashboard > Settings > API
   - Copy `service_role` key (KEEP SECRET!)

## 3. Supabase Configuration

Edge Functions are already deployed. To redeploy:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref blnnlwakdpuqynbylfgq

# Deploy function
supabase functions deploy <function-name>
```

### Deployed Functions
- `send-email` - Email notifications
- `process-image` - Image upload handling
- `process-order` - Order checkout
- `background-jobs` - Scheduled tasks
- `ai-listing-helper` - AI product descriptions

## 4. Required External Services

### Resend (Email Service)
1. Sign up at [resend.com](https://resend.com)
2. Add and verify domain: `craftsandhands.lt`
3. Create API key
4. Add to Railway: `RESEND_API_KEY`

### Stripe (Payments - Future)
1. Create Stripe account
2. Get API keys from Dashboard > Developers > API keys
3. Set up webhooks pointing to Railway backend
4. Add keys to environment variables

## 5. DNS Configuration

For custom domain `craftsandhands.lt`:

| Type | Name | Value |
|------|------|-------|
| A | @ | 76.76.21.21 (Vercel) |
| CNAME | www | cname.vercel-dns.com |
| TXT | @ | v=spf1 include:resend.com ~all |
| CNAME | resend._domainkey | <from Resend dashboard> |

## 6. Post-Deployment Checklist

- [ ] Frontend loads at custom domain
- [ ] Supabase connection works (products display)
- [ ] User registration/login works
- [ ] Cart functionality works
- [ ] Checkout flow completes
- [ ] Backend health check passes: `GET /health`
- [ ] Emails send correctly
- [ ] Cookie consent appears

## 7. Monitoring

### Vercel
- Analytics in dashboard
- Build logs for errors
- Function invocation logs

### Railway
- Real-time logs in dashboard
- Metrics for CPU/Memory
- Set up alerts for failures

### Supabase
- Database metrics
- Edge Function logs
- API usage stats

## Files to Copy to Backend Repo

Copy these files/folders to `asaa-backend`:

```
backend/
├── package.json
├── tsconfig.json
├── railway.json
├── Dockerfile
├── .env.example
├── .gitignore
├── README.md
└── src/
    ├── index.ts
    ├── config/
    │   └── supabase.ts
    ├── routes/
    │   ├── health.ts
    │   └── webhooks.ts
    ├── cron/
    │   ├── scheduler.ts
    │   └── jobs/
    │       ├── updateRatings.ts
    │       ├── eventReminders.ts
    │       ├── cleanupCarts.ts
    │       └── abandonedCarts.ts
    └── services/
        └── email.ts
```

## Troubleshooting

### Frontend not loading
- Check Vercel build logs
- Verify environment variables
- Check browser console for errors

### Database connection failed
- Verify Supabase URL and key
- Check if project is active
- Review RLS policies

### Emails not sending
- Verify Resend API key
- Check domain verification
- Review email logs in Resend dashboard

### Backend cron not running
- Check Railway logs
- Verify environment variables
- Test health endpoint
