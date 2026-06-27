-- WWW Studio Full Application Schema (0003)
-- Complete PostgreSQL schema covering all application tables
-- Compatible with Supabase + pgvector
-- Tables: users, sessions, projects, pages, scenes, scene_elements, components,
--         knowledge_chunks, templates, gallery_templates, chat_messages,
--         project_snapshots, design_extractions, assets, exports, api_keys

-- ── Extensions ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- ── 1. USERS TABLE ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id            VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE,
  first_name    VARCHAR(255),
  last_name     VARCHAR(255),
  profile_image_url TEXT,
  password_hash VARCHAR(255),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created ON public.users(created_at DESC);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read"    ON public.users FOR SELECT USING (true);
CREATE POLICY "users_write"   ON public.users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "users_self"    ON public.users FOR ALL USING (auth.uid() = id);

-- ── 2. SESSIONS TABLE ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sessions (
  sid     VARCHAR(255) PRIMARY KEY,
  sess    JSONB NOT NULL,
  expire  TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_expire ON public.sessions(expire);

-- ── 3. PROJECTS TABLE ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id                          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     VARCHAR(255) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name                        TEXT NOT NULL,
  slug                        VARCHAR(255) NOT NULL,
  status                      VARCHAR(50) NOT NULL DEFAULT 'draft',
  thumbnail_url               TEXT,
  source_url                  TEXT,
  component_tree              TEXT,
  theme_tokens                TEXT,
  active_design_extraction_id UUID,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_user ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_created ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON public.projects(user_id, status);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_read" ON public.projects FOR SELECT USING (true);
CREATE POLICY "projects_write" ON public.projects FOR ALL USING (
  auth.role() = 'authenticated' AND auth.uid() = user_id
);

-- ── 4. PAGES TABLE ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pages (
  id         VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(36) NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  slug       VARCHAR(255) NOT NULL,
  elements   TEXT NOT NULL DEFAULT '[]',
  styles     TEXT NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pages_project ON public.pages(project_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_created ON public.pages(created_at DESC);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pages_read"  ON public.pages FOR SELECT USING (true);
CREATE POLICY "pages_write" ON public.pages FOR ALL USING (auth.role() = 'authenticated');

-- ── 5. SCENES TABLE (3D Studio) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.scenes (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  description     TEXT,
  tags            TEXT,            -- JSON: string[]
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  thumbnail_url   TEXT,
  canvas_width    INTEGER NOT NULL DEFAULT 1440,
  canvas_height   INTEGER NOT NULL DEFAULT 900,
  elements        TEXT,            -- JSON: SceneElement[]
  animations      TEXT,            -- JSON: AnimationConfig[]
  theme_tokens    TEXT,            -- JSON: wellness color tokens
  linked_project_id TEXT,
  likes           INTEGER NOT NULL DEFAULT 0,
  view_count      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scenes_user ON public.scenes(user_id);
CREATE INDEX IF NOT EXISTS idx_scenes_status ON public.scenes(status);
CREATE INDEX IF NOT EXISTS idx_scenes_slug ON public.scenes(slug);
CREATE INDEX IF NOT EXISTS idx_scenes_likes ON public.scenes(likes DESC);
CREATE INDEX IF NOT EXISTS idx_scenes_views ON public.scenes(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_scenes_updated ON public.scenes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_scenes_user_status ON public.scenes(user_id, status);

ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scenes_read"  ON public.scenes FOR SELECT USING (true);
CREATE POLICY "scenes_write" ON public.scenes FOR ALL USING (
  auth.role() = 'authenticated' AND auth.uid() = user_id
);

-- ── 6. SCENE ELEMENTS TABLE (normalized element storage) ───────────────────
CREATE TABLE IF NOT EXISTS public.scene_elements (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id      TEXT NOT NULL REFERENCES public.scenes(id) ON DELETE CASCADE,
  element_type  TEXT NOT NULL,           -- 'circle', 'rect', 'text', 'image', 'svg'
  name          TEXT,
  x             DOUBLE PRECISION DEFAULT 0,
  y             DOUBLE PRECISION DEFAULT 0,
  width         DOUBLE PRECISION DEFAULT 100,
  height        DOUBLE PRECISION DEFAULT 100,
  fill          TEXT,
  fill_opacity  DOUBLE PRECISION DEFAULT 1,
  stroke        TEXT,
  stroke_width  DOUBLE PRECISION DEFAULT 0,
  stroke_opacity DOUBLE PRECISION DEFAULT 1,
  opacity       DOUBLE PRECISION DEFAULT 1,
  rotation      DOUBLE PRECISION DEFAULT 0,
  blur          DOUBLE PRECISION DEFAULT 0,
  z_index       INTEGER DEFAULT 0,
  visible       BOOLEAN DEFAULT TRUE,
  locked        BOOLEAN DEFAULT FALSE,
  text          TEXT,
  font_size     DOUBLE PRECISION,
  svg_path      TEXT,
  src           TEXT,
  mix_blend_mode TEXT DEFAULT 'normal',
  backdrop_blur DOUBLE PRECISION DEFAULT 0,
  animation     JSONB DEFAULT '{}',     -- { preset, duration, delay, easing, loop }
  tags          JSONB DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scene_elements_scene ON public.scene_elements(scene_id);
CREATE INDEX IF NOT EXISTS idx_scene_elements_type ON public.scene_elements(element_type);
CREATE INDEX IF NOT EXISTS idx_scene_elements_zindex ON public.scene_elements(scene_id, z_index);

ALTER TABLE public.scene_elements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scene_elements_read"  ON public.scene_elements FOR SELECT USING (true);
CREATE POLICY "scene_elements_write" ON public.scene_elements FOR ALL USING (auth.role() = 'authenticated');

-- ── 7. COMPONENTS TABLE ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.components (
  id           VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  category     VARCHAR(100) NOT NULL,
  tags         TEXT NOT NULL DEFAULT '[]',
  code         TEXT NOT NULL,
  thumbnail_url TEXT,
  source_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_components_category ON public.components(category);
CREATE INDEX IF NOT EXISTS idx_components_created ON public.components(created_at DESC);

ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "components_read"  ON public.components FOR SELECT USING (true);
CREATE POLICY "components_write" ON public.components FOR ALL USING (auth.role() = 'authenticated');

-- ── 8. KNOWLEDGE CHUNKS TABLE (RAG with pgvector) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id         VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  source     TEXT NOT NULL,
  source_id  TEXT,
  section    TEXT,
  content    TEXT NOT NULL,
  embedding  VECTOR(1536),  -- Gemini text-embedding-004 produces 1536 dimensions
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vector similarity search index (IVFFlat)
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding
  ON public.knowledge_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_source ON public.knowledge_chunks(source);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_project ON public.knowledge_chunks(project_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_created ON public.knowledge_chunks(created_at DESC);

ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "knowledge_read"  ON public.knowledge_chunks FOR SELECT USING (true);
CREATE POLICY "knowledge_write" ON public.knowledge_chunks FOR ALL USING (auth.role() = 'authenticated');

-- ── 9. TEMPLATES TABLE ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.templates (
  id           VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  code         TEXT NOT NULL,
  tags         TEXT NOT NULL DEFAULT '[]',
  thumbnail_url TEXT,
  user_id      VARCHAR(255) REFERENCES public.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_user ON public.templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_created ON public.templates(created_at DESC);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "templates_read"  ON public.templates FOR SELECT USING (true);
CREATE POLICY "templates_write" ON public.templates FOR ALL USING (auth.role() = 'authenticated');

-- ── 10. GALLERY TEMPLATES TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gallery_templates (
  id           VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  style        VARCHAR(100) NOT NULL,
  creator      VARCHAR(255) NOT NULL,
  likes        INTEGER NOT NULL DEFAULT 0,
  tags         TEXT NOT NULL DEFAULT '[]',
  source_url   TEXT NOT NULL,
  description  TEXT,
  is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_templates_style ON public.gallery_templates(style);
CREATE INDEX IF NOT EXISTS idx_gallery_templates_likes ON public.gallery_templates(likes DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_templates_featured ON public.gallery_templates(is_featured);
CREATE INDEX IF NOT EXISTS idx_gallery_templates_created ON public.gallery_templates(created_at DESC);

ALTER TABLE public.gallery_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gallery_read"  ON public.gallery_templates FOR SELECT USING (true);
CREATE POLICY "gallery_write" ON public.gallery_templates FOR ALL USING (auth.role() = 'authenticated');

-- ── 11. CHAT MESSAGES TABLE ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id         VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(36) REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id    VARCHAR(255) REFERENCES public.users(id) ON DELETE SET NULL,
  role       VARCHAR(20) NOT NULL,    -- 'user', 'assistant', 'system'
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_project ON public.chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at DESC);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_read"  ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "chat_write" ON public.chat_messages FOR ALL USING (auth.role() = 'authenticated');

-- ── 12. PROJECT SNAPSHOTS TABLE (undo/redo) ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.project_snapshots (
  id              VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      VARCHAR(36) NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id         VARCHAR(255) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  label           TEXT NOT NULL DEFAULT 'Auto-save',
  component_tree  TEXT,
  theme_tokens    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snapshots_project ON public.project_snapshots(project_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_user ON public.project_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_created ON public.project_snapshots(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_project_created
  ON public.project_snapshots(project_id, created_at DESC);

ALTER TABLE public.project_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "snapshots_read"  ON public.project_snapshots FOR SELECT USING (true);
CREATE POLICY "snapshots_write" ON public.project_snapshots FOR ALL USING (auth.role() = 'authenticated');

-- ── 13. DESIGN EXTRACTIONS TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.design_extractions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               TEXT NOT NULL DEFAULT 'guest',
  project_id            UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  primary_url           TEXT NOT NULL,
  references            JSONB NOT NULL DEFAULT '[]',
  status                TEXT NOT NULL DEFAULT 'pending',
  error                 TEXT,
  processing_time_ms    INTEGER,
  output_design_md      TEXT,
  output_tailwind_config TEXT,
  output_tokens_css     TEXT,
  output_design_tokens_json TEXT,
  extracted_tokens      JSONB DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  saved_to_kb           BOOLEAN DEFAULT FALSE,
  token_history         JSONB DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_design_extractions_user ON public.design_extractions(user_id);
CREATE INDEX IF NOT EXISTS idx_design_extractions_project ON public.design_extractions(project_id);
CREATE INDEX IF NOT EXISTS idx_design_extractions_status ON public.design_extractions(status);
CREATE INDEX IF NOT EXISTS idx_design_extractions_created ON public.design_extractions(created_at DESC);

ALTER TABLE public.design_extractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "design_extractions_read"  ON public.design_extractions FOR SELECT USING (true);
CREATE POLICY "design_extractions_write" ON public.design_extractions FOR ALL USING (auth.role() = 'authenticated');

-- ── 14. ASSETS TABLE (uploaded files/images) ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assets (
  id           VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      VARCHAR(255) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id   VARCHAR(36) REFERENCES public.projects(id) ON DELETE SET NULL,
  filename     TEXT NOT NULL,
  original_name TEXT,
  mime_type    VARCHAR(255),
  size_bytes   BIGINT DEFAULT 0,
  url          TEXT NOT NULL,
  thumbnail_url TEXT,
  width        INTEGER,
  height       INTEGER,
  alt_text     TEXT,
  metadata     JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_user ON public.assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_project ON public.assets(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_mime ON public.assets(mime_type);
CREATE INDEX IF NOT EXISTS idx_assets_created ON public.assets(created_at DESC);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assets_read"  ON public.assets FOR SELECT USING (true);
CREATE POLICY "assets_write" ON public.assets FOR ALL USING (auth.role() = 'authenticated');

-- ── 15. EXPORTS TABLE (export history/jobs) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.exports (
  id           VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      VARCHAR(255) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id   VARCHAR(36) NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  format       VARCHAR(50) NOT NULL DEFAULT 'html',  -- 'html', 'svg', 'react-framer', 'lottie', 'cursor-prompt'
  status       VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  file_url     TEXT,
  file_size    INTEGER,
  error        TEXT,
  metadata     JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exports_user ON public.exports(user_id);
CREATE INDEX IF NOT EXISTS idx_exports_project ON public.exports(project_id);
CREATE INDEX IF NOT EXISTS idx_exports_status ON public.exports(status);
CREATE INDEX IF NOT EXISTS idx_exports_created ON public.exports(created_at DESC);

ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exports_read"  ON public.exports FOR SELECT USING (true);
CREATE POLICY "exports_write" ON public.exports FOR ALL USING (auth.role() = 'authenticated');

-- ── 16. API KEYS TABLE ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.api_keys (
  id           VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      VARCHAR(255) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  key_hash     VARCHAR(255) NOT NULL UNIQUE,
  key_prefix   VARCHAR(10),            -- first few chars for identification
  scopes       TEXT NOT NULL DEFAULT '[]',  -- JSON array of permission scopes
  last_used_at TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON public.api_keys(key_prefix);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_keys_read"  ON public.api_keys FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "api_keys_write" ON public.api_keys FOR ALL USING (auth.role() = 'authenticated');

-- ── 17. SESSION HISTORY TABLE (undo/redo snapshots) ────────────────────────
CREATE TABLE IF NOT EXISTS public.session_history (
  id           VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      VARCHAR(255) NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id   VARCHAR(36) NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  action       TEXT NOT NULL,           -- 'create', 'update', 'delete', 'move', 'style'
  target_type  VARCHAR(50),             -- 'element', 'page', 'project', 'scene'
  target_id    TEXT,
  before_state JSONB,
  after_state  JSONB,
  metadata     JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_history_user ON public.session_history(user_id);
CREATE INDEX IF NOT EXISTS idx_session_history_project ON public.session_history(project_id);
CREATE INDEX IF NOT EXISTS idx_session_history_created ON public.session_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_history_project_created
  ON public.session_history(project_id, created_at DESC);

ALTER TABLE public.session_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_history_read"  ON public.session_history FOR SELECT USING (true);
CREATE POLICY "session_history_write" ON public.session_history FOR ALL USING (auth.role() = 'authenticated');

-- ── FUNCTIONS ──────────────────────────────────────────────────────────────

-- Vector similarity search function (if not already created in 0002)
CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(
  query_embedding    VECTOR(1536),
  match_threshold    FLOAT     DEFAULT 0.7,
  match_count        INT       DEFAULT 5,
  filter_project_id UUID      DEFAULT NULL
)
RETURNS TABLE (
  id         VARCHAR(36),
  project_id UUID,
  source     TEXT,
  source_id  TEXT,
  section    TEXT,
  content    TEXT,
  metadata   JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.project_id,
    kc.source,
    kc.source_id,
    kc.section,
    kc.content,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_chunks kc
  WHERE kc.embedding IS NOT NULL
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold
    AND (filter_project_id IS NULL OR kc.project_id = filter_project_id OR kc.project_id IS NULL)
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at (applied to tables that have updated_at)
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'users', 'projects', 'pages', 'scenes', 'scene_elements',
      'design_extractions', 'assets', 'exports', 'api_keys'
    ])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated_at ON public.%I;
       CREATE TRIGGER trg_%s_updated_at
         BEFORE UPDATE ON public.%I
         FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();',
      t, t, t, t
    );
  END LOOP;
END;
$$;

-- ── COMMENTS ───────────────────────────────────────────────────────────────
COMMENT ON TABLE public.users IS 'User profiles and authentication data';
COMMENT ON TABLE public.sessions IS 'Express session store for authentication';
COMMENT ON TABLE public.projects IS 'Website/canvas projects being edited in WWW Studio';
COMMENT ON TABLE public.pages IS 'Multi-page support within a project';
COMMENT ON TABLE public.scenes IS '3D scenes configured in the wellness scene studio';
COMMENT ON TABLE public.scene_elements IS 'Normalized canvas elements for scenes';
COMMENT ON TABLE public.components IS 'Reusable HTML/Tailwind component library';
COMMENT ON TABLE public.knowledge_chunks IS 'RAG embedding storage for design intelligence';
COMMENT ON TABLE public.templates IS 'User-created templates';
COMMENT ON TABLE public.gallery_templates IS 'Community gallery templates';
COMMENT ON TABLE public.chat_messages IS 'AI chat conversation history';
COMMENT ON TABLE public.project_snapshots IS 'Project state snapshots for undo/redo';
COMMENT ON TABLE public.design_extractions IS 'Design intelligence extraction results';
COMMENT ON TABLE public.assets IS 'Uploaded images, files, and thumbnails';
COMMENT ON TABLE public.exports IS 'Export history and job tracking';
COMMENT ON TABLE public.api_keys IS 'User API keys for programmatic access';
COMMENT ON TABLE public.session_history IS 'Undo/redo action history for sessions';
COMMENT ON COLUMN public.knowledge_chunks.embedding IS 'Vector embedding (1536 dimensions, Gemini text-embedding-004)';
