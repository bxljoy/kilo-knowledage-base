# Supabase Database Setup

## Running Migrations

### Option 1: SQL Editor (Recommended for now)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/cuywqmztclwrbaffwnlk
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `migrations/001_initial_schema.sql`
5. Paste into the SQL Editor
6. Click **Run** or press `Cmd/Ctrl + Enter`
7. Verify success message

### Option 2: Supabase CLI (Future)

```bash
npx supabase db push
```

## What Gets Created

This migration creates:

### Tables:
- **knowledge_bases** - User's knowledge base collections
- **files** - PDF files uploaded to knowledge bases
- **chat_sessions** - Chat conversation sessions
- **chat_messages** - Individual messages in chats

### Features:
- ✅ UUID primary keys
- ✅ Foreign key constraints
- ✅ Check constraints for data validation
- ✅ Automatic timestamps (created_at, updated_at)
- ✅ Performance indexes
- ✅ User usage stats view

### Limits Enforced:
- Max 5 knowledge bases per user
- Max 10MB per file
- Max 200 pages per PDF
- Valid file statuses: uploading, processing, ready, failed

## Next Steps

After running the migration, proceed to configure Row Level Security (RLS) policies.
