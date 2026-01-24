# Crafts & Hands Backend

Backend services for the Lithuanian Traditional Crafts & Artisan Marketplace.

## Services

- **Cron Jobs**: Scheduled tasks for ratings updates, email reminders, cart cleanup
- **Webhooks**: Stripe payment webhooks, shipping status updates
- **Email Service**: Transactional emails via Resend

## Deployment to Railway

### 1. Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project" > "Deploy from GitHub repo"
3. Select the `asaa-backend` repository
4. Railway will auto-detect the Node.js project

### 2. Set Environment Variables

In Railway dashboard, add these environment variables:

```
PORT=3001
NODE_ENV=production
SUPABASE_URL=https://blnnlwakdpuqynbylfgq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
RESEND_API_KEY=<your-resend-api-key>
EMAIL_FROM=noreply@craftsandhands.lt
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
FRONTEND_URL=https://craftsandhands.lt
```

### 3. Get Supabase Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the `service_role` key (keep this secret!)

### 4. Set Up Resend (Email)

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain
3. Create an API key
4. Add to Railway environment variables

### 5. Configure Stripe Webhooks

1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://your-railway-url.railway.app/webhooks/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

## Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your values

# Run development server
npm run dev
```

## API Endpoints

### Health Check
```
GET /health
```

### Webhooks
```
POST /webhooks/stripe - Stripe payment webhooks
POST /webhooks/shipping-update - Shipping status updates
```

## Cron Schedule

| Job | Schedule | Description |
|-----|----------|-------------|
| Update Ratings | Every 6 hours | Recalculate product ratings from reviews |
| Event Reminders | Daily 9 AM | Send reminders for tomorrow's events |
| Cart Cleanup | Daily 3 AM | Remove cart items older than 30 days |
| Abandoned Carts | Daily 10 AM, 6 PM | Send reminders for abandoned carts |
