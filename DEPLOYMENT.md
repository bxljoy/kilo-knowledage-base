# Production Deployment Guide

This guide will help you deploy the Kilo Knowledge Base application to production on Vercel.

## Prerequisites

Before deploying, ensure you have:

1. A [Vercel account](https://vercel.com/signup)
2. A [Supabase project](https://supabase.com) set up
3. A [Google Cloud Platform account](https://console.cloud.google.com) with Gemini API enabled
4. Google OAuth credentials configured

## Environment Variables

The following environment variables must be configured in your Vercel project settings:

### Supabase Configuration

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these from: Supabase Dashboard > Project Settings > API

### Google Gemini API

```bash
GEMINI_API_KEY=your-gemini-api-key
```

Get this from: https://aistudio.google.com/app/apikey

### Google OAuth Credentials

```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Get these from: https://console.cloud.google.com/apis/credentials

**Important:** Add your Vercel deployment URL to the Authorized redirect URIs:
- Development: `http://localhost:3000/auth/callback`
- Production: `https://yourdomain.com/auth/callback`

## Database Setup

### 1. Run Migrations

Execute all migration files in order:

```bash
# Navigate to your Supabase project SQL Editor
# Run each file in order:
supabase/migrations/001_knowledge_bases.sql
supabase/migrations/002_files.sql
supabase/migrations/003_enable_rls.sql
supabase/migrations/004_usage_tracking.sql
```

### 2. Configure Storage Bucket

1. Go to Supabase Dashboard > Storage
2. Create a new bucket named `files`
3. Set the bucket to **private**
4. Configure the following storage policies:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'files');

-- Allow users to read their own files
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'files');

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'files');
```

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

### Option 2: Deploy via GitHub Integration

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables (see above)
6. Click "Deploy"

## Post-Deployment Configuration

### 1. Update Google OAuth Redirect URIs

Add your Vercel production URL to Google OAuth:
1. Go to Google Cloud Console > APIs & Credentials
2. Select your OAuth 2.0 Client ID
3. Add to Authorized redirect URIs:
   - `https://your-vercel-domain.vercel.app/auth/callback`
   - Your custom domain if configured

### 2. Update Supabase Authentication

1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Add your Vercel URL to Site URL and Redirect URLs

### 3. Verify Security Headers

Check that security headers are properly set:
```bash
curl -I https://your-domain.com
```

You should see headers like:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy: ...`

## Monitoring & Health Checks

### Health Check Endpoint

Monitor application health:
```bash
GET https://your-domain.com/api/health
```

Response:
```json
{
  "timestamp": "2025-11-16T12:00:00.000Z",
  "status": "healthy",
  "checks": {
    "database": {
      "status": "healthy",
      "message": "Database connection successful"
    },
    "api": {
      "status": "healthy",
      "message": "API is responsive"
    }
  }
}
```

### Metrics Endpoint

View application metrics:
```bash
GET https://your-domain.com/api/metrics
```

## Usage Limits

The application enforces the following limits:

- **Knowledge Bases:** 5 per user
- **Files:** 10 per knowledge base
- **File Size:** 10MB per file
- **Daily Queries:** 100 per user
- **Total Storage:** 100MB per user

These limits are configured in `src/lib/quota-enforcement.ts`

## Common Issues

### Database Connection Errors

If you see database connection errors:
1. Check that SUPABASE_SERVICE_ROLE_KEY is correct
2. Verify database migrations have been run
3. Check Supabase project is not paused

### File Upload Failures

If file uploads fail:
1. Verify storage bucket `files` exists
2. Check storage policies are configured
3. Verify GEMINI_API_KEY is valid

### OAuth Login Issues

If Google login doesn't work:
1. Verify redirect URIs match exactly
2. Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
3. Ensure OAuth consent screen is published

## Performance Optimization

### Recommended Vercel Configuration

Create `vercel.json`:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["iad1"]
}
```

### Database Connection Pooling

For production, enable connection pooling in Supabase:
1. Go to Database Settings > Connection Pooling
2. Enable pooling with mode: Transaction
3. Use pooled connection string in production

## Maintenance

### Backup Strategy

1. **Database:** Supabase provides automatic backups
2. **Files:** Files are stored in Supabase Storage with redundancy
3. **Environment Variables:** Keep a secure backup of all secrets

### Monitoring

Set up monitoring for:
- `/api/health` endpoint (every 5 minutes)
- Error rates in Vercel dashboard
- Database performance in Supabase dashboard
- Usage metrics via `/api/metrics`

## Scaling Considerations

As your application grows:

1. **Database:** Consider upgrading Supabase plan for more connections
2. **File Storage:** Monitor storage usage and upgrade as needed
3. **API Rate Limits:** Implement Gemini API rate limiting if needed
4. **Vercel Functions:** Monitor function execution time and memory usage

## Support

For issues or questions:
- Check [Next.js Documentation](https://nextjs.org/docs)
- Visit [Supabase Documentation](https://supabase.com/docs)
- Review [Vercel Documentation](https://vercel.com/docs)
