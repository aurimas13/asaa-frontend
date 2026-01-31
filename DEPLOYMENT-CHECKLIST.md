# Deployment Checklist: Products/Makers Not Displaying Fix

## Database Status (VERIFIED)
- 121 products (all with `status = 'active'`)
- 61 makers
- 15 categories
- RLS policies configured for public SELECT access

## Root Cause
The deployed site at https://craftsandhands.com needs the correct Supabase credentials and latest code.

---

## Step 1: Update Environment Variables on Vercel

In your Vercel dashboard (https://vercel.com):

1. Go to your project settings
2. Navigate to **Settings > Environment Variables**
3. Add or update these variables:

```
VITE_SUPABASE_URL=https://blnnlwakdpuqynbylfgq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbm5sd2FrZHB1cXluYnlsZmdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyODAzMjEsImV4cCI6MjA4NDg1NjMyMX0.B257rv-BqRqPW2aY97ZEXEny3AFVXHXXWJPNd-UTnCQ
```

---

## Step 2: Files to Sync to GitHub (asaa-frontend)

Copy these files from this local project to your GitHub repository:

### Critical Files (must match exactly)

| Local Path | Purpose |
|------------|---------|
| `src/lib/supabase.ts` | Supabase client configuration |
| `src/pages/Home.tsx` | Homepage with products/makers display |
| `src/pages/Makers.tsx` | Makers listing with translations |
| `src/pages/MakerDetail.tsx` | Maker detail with translations |
| `src/pages/Products.tsx` | Products listing (queries `status = 'active'`) |
| `src/pages/ProductDetail.tsx` | Product detail page |
| `src/i18n/config.ts` | i18n setup (Lithuanian default) |
| `src/i18n/locales/lt.json` | Lithuanian translations |
| `src/i18n/locales/en.json` | English translations |
| `src/i18n/locales/fr.json` | French translations |

### Commands to copy files:

```bash
# From this project directory, copy to your asaa-frontend repo
cp src/lib/supabase.ts /path/to/asaa-frontend/src/lib/
cp src/pages/Home.tsx /path/to/asaa-frontend/src/pages/
cp src/pages/Makers.tsx /path/to/asaa-frontend/src/pages/
cp src/pages/MakerDetail.tsx /path/to/asaa-frontend/src/pages/
cp src/pages/Products.tsx /path/to/asaa-frontend/src/pages/
cp src/pages/ProductDetail.tsx /path/to/asaa-frontend/src/pages/
cp -r src/i18n /path/to/asaa-frontend/src/
```

---

## Step 3: Verify package.json Dependencies

Your asaa-frontend `package.json` must include:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.45.4",
    "i18next": "^25.8.0",
    "i18next-browser-languagedetector": "^8.2.0",
    "react-i18next": "^16.5.3"
  }
}
```

If missing, run:
```bash
npm install @supabase/supabase-js i18next i18next-browser-languagedetector react-i18next
```

---

## Step 4: Deploy and Verify

1. **Commit and push changes to GitHub:**
   ```bash
   cd /path/to/asaa-frontend
   git add .
   git commit -m "Sync Supabase integration and translations"
   git push origin main
   ```

2. **Trigger Vercel redeploy** (or wait for automatic deploy)

3. **Clear browser cache and localStorage:**
   - Open https://craftsandhands.com
   - Open DevTools (F12)
   - Go to **Application > Local Storage**
   - Delete `i18nextLng` key
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

---

## Step 5: Troubleshooting

### If products/makers still don't appear:

1. **Check browser console** for errors (F12 > Console)

2. **Verify API calls** in Network tab:
   - Look for requests to `blnnlwakdpuqynbylfgq.supabase.co`
   - Check response status (should be 200)
   - Verify data is returned

3. **Test Supabase connection directly:**
   Open browser console and run:
   ```javascript
   // This should return data if configured correctly
   fetch('https://blnnlwakdpuqynbylfgq.supabase.co/rest/v1/makers?select=id,business_name&limit=5', {
     headers: {
       'apikey': 'YOUR_ANON_KEY_HERE',
       'Authorization': 'Bearer YOUR_ANON_KEY_HERE'
     }
   }).then(r => r.json()).then(console.log)
   ```

4. **Common issues:**
   - Environment variable names are case-sensitive (`VITE_SUPABASE_URL` not `VITE_SUPABASE_Url`)
   - Variables must start with `VITE_` to be exposed to the frontend
   - Old cached build - trigger a fresh deploy

---

## Key Code Patterns

### How Makers are fetched (`src/pages/Makers.tsx:63-79`):
```typescript
const loadMakers = async () => {
  let query = supabase
    .from('makers')
    .select('id, business_name, description, description_lt, description_fr, cover_image, country, city, verified, rating, total_sales')
    .order('rating', { ascending: false })

  const { data, error } = await query.limit(50)
  if (error) console.error('Error:', error)
  if (data) setMakers(data)
}
```

### How Products are fetched (`src/pages/Products.tsx:44-72`):
```typescript
const loadProducts = async () => {
  let query = supabase
    .from('products')
    .select('id, title, description, price, images, rating, category_id, makers(business_name), categories(name)')
    .eq('status', 'active')  // Only active products

  const { data, error } = await query.limit(24)
}
```

---

## Summary

1. Add correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel
2. Sync the listed files from this project to asaa-frontend
3. Push to GitHub and redeploy
4. Clear browser localStorage and refresh
