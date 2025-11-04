# Local Development Setup Guide

## Overview

Your Supabase local development environment is now fully configured! This guide explains how to work with both local and production Supabase instances.

## What Was Set Up

### 1. Supabase Configuration
- **Local Instance**: Full Supabase stack running in Docker containers
- **Migrations**: Automatically applied (users table, events table, RLS policies)
- **Seed Data**: Test users and sample events pre-loaded

### 2. Environment Variables
- **`.env.development.local`**: Local Supabase credentials (auto-used in dev mode)
- **`.env.local`**: Production Supabase credentials (used for production builds)

### 3. NPM Scripts
Added convenient scripts to `package.json` for managing Supabase:

```bash
# Supabase Management
npm run supabase:start      # Start local Supabase
npm run supabase:stop       # Stop local Supabase
npm run supabase:restart    # Restart local Supabase
npm run supabase:reset      # Reset database (reapply migrations + seed)
npm run supabase:status     # Check service status

# Database Operations
npm run db:migrate          # Push migrations to database
npm run db:diff             # Generate migration from schema changes
npm run db:types            # Generate TypeScript types from database

# Development
npm run dev:local           # Start Supabase + Next.js together
```

## Local Supabase URLs

When running locally (`npm run supabase:start`), you have access to:

| Service | URL | Purpose |
|---------|-----|---------|
| **Studio** | http://127.0.0.1:54323 | Web UI for database management |
| **API** | http://127.0.0.1:54321 | REST API endpoint |
| **Database** | postgresql://postgres:postgres@127.0.0.1:54322/postgres | Direct database connection |
| **Mailpit** | http://127.0.0.1:54324 | View magic link emails (email testing) |

### Local Credentials

```bash
# These are safe to commit - they're only for local development
Publishable Key: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
Secret Key: sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
```

## Development Workflow

### Option 1: Local Development (Recommended)

Use this for day-to-day development to avoid affecting production data.

```bash
# 1. Start Supabase local services
npm run supabase:start

# 2. In a new terminal, start Next.js
npm run dev

# 3. Open your app
# - App: http://localhost:3000
# - Supabase Studio: http://127.0.0.1:54323
```

Your app will automatically use local Supabase (via `.env.development.local`).

### Option 2: Production Testing

To test with production Supabase:

```bash
# Stop local Supabase first
npm run supabase:stop

# Temporarily rename .env.development.local
mv .env.development.local .env.development.local.backup

# Start Next.js - it will use .env.local (production)
npm run dev
```

## Viewing Test Data

### Local Test Users

When running locally, these test users are available:

| Email | Name | Role |
|-------|------|------|
| dev1@example.com | Alice Developer | admin |
| dev2@example.com | Bob Tester | member |
| dev3@example.com | Charlie Smith | member |
| dev4@example.com | Diana Jones | member |

### Viewing Magic Link Emails

1. Try to log in with any test email (e.g., `dev1@example.com`)
2. Open Mailpit: http://127.0.0.1:54324
3. Click the email to see the magic link
4. Click the magic link to authenticate

### Supabase Studio

Open http://127.0.0.1:54323 to:
- Browse database tables
- Run SQL queries
- View RLS policies
- Test API endpoints
- Manage storage buckets

## Common Tasks

### Reset Database

If you need to start fresh:

```bash
npm run supabase:reset
```

This will:
- Drop all tables
- Reapply all migrations
- Reload seed data

### Add a New Migration

When you modify the database schema:

```bash
# Create a new migration file
npx supabase migration new your_migration_name

# Edit the generated file in supabase/migrations/
# Then apply it:
npm run db:migrate
```

### Generate TypeScript Types

After database changes:

```bash
npm run db:types
```

This creates `src/lib/database.types.ts` with type-safe database interfaces.

## Production Deployment

### For Your VPS

**Before deploying**, update your production Supabase project:

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Select your project**
3. **Navigate to Authentication → URL Configuration**
4. **Update**:
   - **Site URL**: `https://your-vps-domain.com` (or `http://your-vps-ip:3000`)
   - **Redirect URLs**: Add `https://your-vps-domain.com/auth/callback`

### Deploy with Docker

Your existing Docker setup should work. Just ensure:
- `.env.local` has production Supabase credentials
- Site URL is correctly configured in Supabase dashboard

## Troubleshooting

### Supabase Won't Start

```bash
# Check Docker is running
docker ps

# Stop all Supabase containers
npm run supabase:stop

# Remove old volumes (if needed)
docker volume prune

# Start fresh
npm run supabase:start
```

### Port Conflicts

If ports 54321-54324 are in use, edit `supabase/config.toml`:

```toml
[api]
port = 54321  # Change if needed

[db]
port = 54322  # Change if needed

[studio]
port = 54323  # Change if needed
```

### Magic Links Not Working

**If magic links redirect to wrong URL** (e.g., `http://127.0.0.1:54321/auth/v1/verify?` instead of `http://localhost:3000/auth/callback`):

1. Check `supabase/config.toml` has correct configuration:
   ```toml
   [auth]
   site_url = "http://localhost:3000"
   additional_redirect_urls = ["http://localhost:3000/auth/callback", "http://127.0.0.1:3000/auth/callback"]
   ```

2. Restart Supabase:
   ```bash
   npm run supabase:restart
   ```

**Local Development**:
- Check Mailpit: http://127.0.0.1:54324
- Magic links are captured locally, not sent to real emails
- Click the magic link in Mailpit - it should redirect to `http://localhost:3000/auth/callback`

**Production**:
- Verify Site URL in Supabase dashboard
- Check redirect URLs include your callback URL
- Ensure `.env.local` has correct production credentials

### Database Connection Issues

```bash
# Check Supabase status
npm run supabase:status

# View logs
docker logs supabase_db_poc-weekly-planner
```

## Next Steps

### Recommended: Use Local Dev as Default

1. Always run `npm run supabase:start` before coding
2. Test features locally first
3. Only test on production when ready to deploy

### Migration Workflow

1. **Local**: Make schema changes in migrations
2. **Local**: Test with `npm run supabase:reset`
3. **Production**: Push migrations with `npx supabase db push --db-url "your-production-url"`

## Additional Resources

- [Supabase Local Development Docs](https://supabase.com/docs/guides/cli/local-development)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

**Questions?** Check the [CLAUDE.md](../CLAUDE.md) file or open an issue!
