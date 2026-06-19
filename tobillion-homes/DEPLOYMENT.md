# Tobillion Homes — Deployment Guide

## 🚀 Vercel Deployment (Recommended)

### Prerequisites
- A Vercel account (vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)

### Steps

1. **Push to Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Tobillion Homes website"
   git remote add origin https://github.com/your-org/tobillion-homes.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Framework preset: Next.js (auto-detected)

3. **Environment Variables**
   Add these in Vercel Dashboard → Project Settings → Environment Variables:

   ```
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token
   NEXT_PUBLIC_HUBSPOT_PORTAL_ID=your_portal_id
   HUBSPOT_API_KEY=your_hubspot_api_key
   NEXTAUTH_SECRET=your_generated_secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Generate NEXTAUTH_SECRET**
   ```bash
   openssl rand -base64 32
   ```

5. **Deploy**
   - Vercel auto-deploys on every push to main branch
   - Or click "Deploy" from the Vercel dashboard

### Custom Domain
- Add your domain in Vercel Dashboard → Domains
- Update DNS records (CNAME to `cname.vercel-dns.com`)
- Wait for propagation (5-30 minutes)

---

## 🐳 Docker Deployment (Alternative)

### Dockerfile
```dockerfile
FROM node:20-alpine AS base
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### Build & Run
```bash
docker build -t tobillion-homes .
docker run -p 3000:3000 --env-file .env.production tobillion-homes
```

---

## 🗄️ Database Setup (Supabase)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Copy contents of `database/schema.sql` and run
4. Copy your project URL and anon key to environment variables

## 🖼️ CMS Setup (Sanity.io) — Optional

1. Run `npx sanity init` in the project root
2. Select "Create new project" or use existing
3. Copy `database/sanity-schema.js` to `/sanity/schemas/property.js`
4. Deploy the Sanity studio: `npx sanity deploy`
5. Copy project ID and dataset to environment variables

## ✅ Post-Deployment Checklist

- [ ] Test all pages render correctly
- [ ] Verify Mapbox map loads with pins
- [ ] Submit a HubSpot form → confirm in HubSpot dashboard
- [ ] Check SEO meta tags render in page source
- [ ] Verify sitemap at /sitemap.xml
- [ ] Test mobile responsiveness
- [ ] Run Lighthouse audit (target: 90+ on all metrics)
- [ ] Set up Vercel Analytics
- [ ] Configure 301 redirects if needed
