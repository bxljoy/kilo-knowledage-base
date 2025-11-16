-- =====================================================
-- Row Level Security (RLS) Policies
-- Ensures users can only access their own data
-- =====================================================

-- =====================================================
-- Enable RLS on all tables
-- =====================================================

ALTER TABLE public.knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- knowledge_bases policies
-- Users can only access their own knowledge bases
-- =====================================================

-- SELECT: Users can view their own knowledge bases
CREATE POLICY "Users can view their own knowledge bases"
  ON public.knowledge_bases
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can create their own knowledge bases
CREATE POLICY "Users can create their own knowledge bases"
  ON public.knowledge_bases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own knowledge bases
CREATE POLICY "Users can update their own knowledge bases"
  ON public.knowledge_bases
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own knowledge bases
CREATE POLICY "Users can delete their own knowledge bases"
  ON public.knowledge_bases
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- files policies
-- Users can only access files in their knowledge bases
-- =====================================================

-- SELECT: Users can view files in their knowledge bases
CREATE POLICY "Users can view files in their knowledge bases"
  ON public.files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.knowledge_bases kb
      WHERE kb.id = files.knowledge_base_id
      AND kb.user_id = auth.uid()
    )
  );

-- INSERT: Users can upload files to their knowledge bases
CREATE POLICY "Users can upload files to their knowledge bases"
  ON public.files
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.knowledge_bases kb
      WHERE kb.id = knowledge_base_id
      AND kb.user_id = auth.uid()
    )
  );

-- UPDATE: Users can update files in their knowledge bases
CREATE POLICY "Users can update files in their knowledge bases"
  ON public.files
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.knowledge_bases kb
      WHERE kb.id = files.knowledge_base_id
      AND kb.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.knowledge_bases kb
      WHERE kb.id = knowledge_base_id
      AND kb.user_id = auth.uid()
    )
  );

-- DELETE: Users can delete files from their knowledge bases
CREATE POLICY "Users can delete files from their knowledge bases"
  ON public.files
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.knowledge_bases kb
      WHERE kb.id = files.knowledge_base_id
      AND kb.user_id = auth.uid()
    )
  );

-- =====================================================
-- chat_sessions policies
-- Users can only access their own chat sessions
-- =====================================================

-- SELECT: Users can view their own chat sessions
CREATE POLICY "Users can view their own chat sessions"
  ON public.chat_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can create chat sessions in their knowledge bases
CREATE POLICY "Users can create chat sessions in their knowledge bases"
  ON public.chat_sessions
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.knowledge_bases kb
      WHERE kb.id = knowledge_base_id
      AND kb.user_id = auth.uid()
    )
  );

-- UPDATE: Users can update their own chat sessions
CREATE POLICY "Users can update their own chat sessions"
  ON public.chat_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own chat sessions
CREATE POLICY "Users can delete their own chat sessions"
  ON public.chat_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- chat_messages policies
-- Users can only access messages from their sessions
-- =====================================================

-- SELECT: Users can view messages from their sessions
CREATE POLICY "Users can view messages from their sessions"
  ON public.chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions cs
      WHERE cs.id = chat_messages.session_id
      AND cs.user_id = auth.uid()
    )
  );

-- INSERT: Users can create messages in their sessions
CREATE POLICY "Users can create messages in their sessions"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions cs
      WHERE cs.id = session_id
      AND cs.user_id = auth.uid()
    )
  );

-- UPDATE: Users can update messages in their sessions (for ratings)
CREATE POLICY "Users can update messages in their sessions"
  ON public.chat_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions cs
      WHERE cs.id = chat_messages.session_id
      AND cs.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions cs
      WHERE cs.id = session_id
      AND cs.user_id = auth.uid()
    )
  );

-- DELETE: Users can delete messages from their sessions
CREATE POLICY "Users can delete messages from their sessions"
  ON public.chat_messages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions cs
      WHERE cs.id = chat_messages.session_id
      AND cs.user_id = auth.uid()
    )
  );

-- =====================================================
-- Service role bypass
-- Allows service role to access all data for admin operations
-- =====================================================

-- This is automatically handled by Supabase
-- Service role key bypasses RLS policies
