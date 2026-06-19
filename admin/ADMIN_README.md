# Tobillion Homes Admin — Setup & Deployment Guide

## Overview

Separate Next.js 16 admin app for Tobillion Homes. Deployed on Vercel at `/admin`.

## Prerequisites

- Node.js >= 18
- Supabase project (same as main site)
- SMTP server (for password reset emails)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env.local

# 3. Fill in .env.local with your Supabase credentials

# 4. Run database migrations
#    Open your Supabase SQL Editor and run:
#    - database/admin-schema.sql
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (admin bypass RLS) |
| `ADMIN_JWT_SECRET` | Secret for signing session tokens |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port (587) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | From address for emails |
| `NEXT_PUBLIC_SITE_URL` | Main website URL |
| `NEXT_PUBLIC_ADMIN_URL` | Admin URL (e.g., https://tobillionhomes.co.ke/admin) |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms (default: 900000) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window (default: 5) |
| `MAX_UPLOAD_SIZE_MB` | Max file upload size (default: 10) |

## Creating the SuperAdmin

Run this SQL in your Supabase SQL Editor:

```sql
-- Replace with your details. Password will be hashed by bcrypt (cost 12).
-- Generate a bcrypt hash at https://bcrypt-generator.com or use a script.

-- Option 1: Hash password in your terminal
-- node -e "require('bcryptjs').hash('YourSecurePassword123!', 12).then(console.log)"

-- Option 2: Insert with a known hash (generate one first)
INSERT INTO admin_users (email, password_hash, name, role)
VALUES (
  'admin@tobillionhomes.co.ke',
  '$2a$12$...',  -- Replace with your bcrypt hash
  'Super Admin',
  'superadmin'
);
```

Or use the provided script:

```bash
node -e "
const bcrypt = require('bcryptjs');
const email = 'admin@tobillionhomes.co.ke';
const password = 'YourSecurePassword123!';
const name = 'Super Admin';
bcrypt.hash(password, 12).then(hash => {
  console.log('INSERT INTO admin_users (email, password_hash, name, role)');
  console.log(`VALUES ('\${email}', '\${hash}', '\${name}', 'superadmin');`);
});
"
```

## Development

```bash
npm run dev
# Admin available at http://localhost:3000/admin
```

## Vercel Deployment

1. Push the `admin/` directory as a separate Vercel project
2. Connect to your Git repository
3. Set build command: `cd admin && npm install && npm run build`
4. Set output directory: `admin/.next`
5. Add all environment variables from `.env.local`
6. Deploy!

### Custom Domain Setup

Route `/admin/*` to this admin app:
- **Vercel**: Use a monorepo approach or deploy as separate project with domain `admin.tobillionhomes.co.ke`

## Testing Checklist

- [ ] Login with superadmin credentials works
- [ ] Forgot password flow sends email
- [ ] Password reset with token works
- [ ] Dashboard shows correct stats
- [ ] Properties CRUD (create, read, update, delete)
- [ ] Blog posts CRUD with draft/publish
- [ ] Testimonials CRUD
- [ ] Agents CRUD
- [ ] FAQs CRUD
- [ ] Partners CRUD
- [ ] Page content editor saves and loads JSON
- [ ] Site settings editor saves SEO, contact, social
- [ ] Audit log shows all actions
- [ ] Notifications appear
- [ ] Rate limiting works (5 failed login attempts)
- [ ] Session expires after 24 hours
- [ ] Logout destroys session
- [ ] Unauthenticated users redirected to login
- [ ] All API endpoints return 401 without session

## Security

- HTTPS-only cookies with SameSite=strict
- Password hashing with bcrypt (cost 12)
- Rate limiting on auth endpoints
- Audit logging for all mutations
- CSRF protection via SameSite cookies
- 12+ character password policy
- IP-based throttling

## Adding the Admin Link to Main Site

In the main site's `src/app/layout.tsx`, add:

```tsx
<Link href="/admin/login" className="...">Admin</Link>
```

In `src/lib/constants.ts`, add to `COMPANY`:

```ts
adminUrl: process.env.NEXT_PUBLIC_ADMIN_URL || '/admin',
```
