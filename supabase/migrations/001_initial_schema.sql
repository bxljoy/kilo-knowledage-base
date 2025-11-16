-- =====================================================
-- Kilo Knowledge Base - Initial Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Table: knowledge_bases
-- Stores knowledge base metadata for each user
-- =====================================================
CREATE TABLE IF NOT EXISTS public.knowledge_bases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    gemini_store_id TEXT, -- Gemini FileSearchStore ID
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT knowledge_bases_name_not_empty CHECK (length(trim(name)) > 0)
);

-- =====================================================
-- Table: files
-- Stores file metadata for knowledge bases
-- =====================================================
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    knowledge_base_id UUID NOT NULL REFERENCES public.knowledge_bases(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    page_count INTEGER,
    gemini_file_id TEXT NOT NULL, -- Gemini API file ID
    status TEXT NOT NULL DEFAULT 'uploading',
    error_message TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT files_status_check CHECK (status IN ('uploading', 'processing', 'ready', 'failed')),
    CONSTRAINT files_size_check CHECK (file_size > 0 AND file_size <= 10485760), -- 10MB max
    CONSTRAINT files_page_count_check CHECK (page_count IS NULL OR (page_count > 0 AND page_count <= 200))
);

-- =====================================================
-- Table: chat_sessions
-- Stores chat session metadata
-- =====================================================
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    knowledge_base_id UUID NOT NULL REFERENCES public.knowledge_bases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- Table: chat_messages
-- Stores individual chat messages
-- =====================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER, -- User feedback: 1 (thumbs up), -1 (thumbs down)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chat_messages_role_check CHECK (role IN ('user', 'assistant')),
    CONSTRAINT chat_messages_rating_check CHECK (rating IS NULL OR rating IN (-1, 1)),
    CONSTRAINT chat_messages_content_not_empty CHECK (length(trim(content)) > 0)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Knowledge bases: Query by user
CREATE INDEX IF NOT EXISTS idx_knowledge_bases_user_id
    ON public.knowledge_bases(user_id);

-- Files: Query by knowledge base and status
CREATE INDEX IF NOT EXISTS idx_files_knowledge_base_id
    ON public.files(knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_files_status
    ON public.files(status);

-- Chat sessions: Query by knowledge base and user
CREATE INDEX IF NOT EXISTS idx_chat_sessions_knowledge_base_id
    ON public.chat_sessions(knowledge_base_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id
    ON public.chat_sessions(user_id);

-- Chat messages: Query by session, ordered by time
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id
    ON public.chat_messages(session_id, created_at DESC);

-- =====================================================
-- Functions for auto-updating timestamps
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Function to enforce knowledge base limit (5 per user)
-- =====================================================

CREATE OR REPLACE FUNCTION check_knowledge_base_limit()
RETURNS TRIGGER AS $$
DECLARE
    kb_count INTEGER;
BEGIN
    -- Count existing knowledge bases for this user
    SELECT COUNT(*) INTO kb_count
    FROM public.knowledge_bases
    WHERE user_id = NEW.user_id;

    -- Prevent creation if limit reached (only on INSERT)
    IF TG_OP = 'INSERT' AND kb_count >= 5 THEN
        RAISE EXCEPTION 'Knowledge base limit reached. Maximum 5 knowledge bases per user.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_knowledge_bases_updated_at
    BEFORE UPDATE ON public.knowledge_bases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for knowledge base limit
CREATE TRIGGER enforce_knowledge_base_limit
    BEFORE INSERT ON public.knowledge_bases
    FOR EACH ROW
    EXECUTE FUNCTION check_knowledge_base_limit();

-- =====================================================
-- Usage Tracking View (for analytics)
-- =====================================================

CREATE OR REPLACE VIEW public.user_usage_stats AS
SELECT
    u.id as user_id,
    u.email,
    COUNT(DISTINCT kb.id) as knowledge_base_count,
    COUNT(DISTINCT f.id) as total_files,
    COALESCE(SUM(f.file_size), 0) as total_storage_bytes,
    COUNT(DISTINCT cs.id) as total_chat_sessions,
    COUNT(DISTINCT cm.id) as total_messages,
    COUNT(DISTINCT CASE WHEN cm.created_at > NOW() - INTERVAL '1 day' THEN cm.id END) as messages_today
FROM
    auth.users u
    LEFT JOIN public.knowledge_bases kb ON u.id = kb.user_id
    LEFT JOIN public.files f ON kb.id = f.knowledge_base_id
    LEFT JOIN public.chat_sessions cs ON kb.id = cs.knowledge_base_id
    LEFT JOIN public.chat_messages cm ON cs.id = cm.session_id
GROUP BY u.id, u.email;
