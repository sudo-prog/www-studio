-- WWW Studio Enhanced Schema Migration
-- Phase 0-3: Components, Knowledge Chunks, Templates, Pages

-- Components table
CREATE TABLE IF NOT EXISTS components (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  code TEXT NOT NULL,
  thumbnail_url TEXT,
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_components_category ON components(category);
CREATE INDEX IF NOT EXISTS idx_components_created ON components(created_at DESC);

-- Knowledge chunks table (for RAG)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding TEXT, -- JSON array of floats (use pgvector extension for production)
  metadata JSONB DEFAULT '{}',
  source VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_source ON knowledge_chunks(source);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_created ON knowledge_chunks(created_at DESC);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  thumbnail_url TEXT,
  user_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_user ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_created ON templates(created_at DESC);

-- Pages table (multi-page support)
CREATE TABLE IF NOT EXISTS pages (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(36) NOT NULL,
  title TEXT NOT NULL,
  slug VARCHAR(255) NOT NULL,
  elements TEXT NOT NULL DEFAULT '[]',
  styles TEXT NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pages_project ON pages(project_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);

-- Row Level Security
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Policies (allow read for anon, full access for authenticated)
CREATE POLICY "components_read" ON components FOR SELECT USING (true);
CREATE POLICY "components_write" ON components FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "knowledge_read" ON knowledge_chunks FOR SELECT USING (true);
CREATE POLICY "knowledge_write" ON knowledge_chunks FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "templates_read" ON templates FOR SELECT USING (true);
CREATE POLICY "templates_write" ON templates FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "pages_read" ON pages FOR SELECT USING (true);
CREATE POLICY "pages_write" ON pages FOR ALL USING (auth.role() = 'authenticated');
