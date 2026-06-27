-- WWW Studio Supabase Schema
-- Includes pgvector extension for RAG embedding search
-- Run this in Supabase SQL Editor to set up the database

-- ── Extensions ─────────────────────────────────────────────────────────────
create extension if not exists vector with schema public;
create extension if not exists "uuid-ossp" with schema public;

-- ── Knowledge Chunks Table (for RAG) ───────────────────────────────────────
create table if not exists public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  source text not null,
  source_id text,
  section text,
  content text not null,
  embedding vector(1536),  -- Gemini text-embedding-004 produces 1536 dimensions
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- Indexes for vector search
create index if not exists idx_knowledge_chunks_embedding
  on public.knowledge_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists idx_knowledge_chunks_source
  on public.knowledge_chunks(source);

create index if not exists idx_knowledge_chunks_project
  on public.knowledge_chunks(project_id);

create index if not exists idx_knowledge_chunks_created
  on public.knowledge_chunks(created_at desc);

-- ── Match function for vector similarity search ────────────────────────────
create or replace function match_knowledge_chunks(
  query_embedding    vector(1536),
  match_threshold    float     default 0.7,
  match_count        int       default 5,
  filter_project_id uuid      default null
)
returns table (
  id uuid,
  source text,
  section text,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql as $$
begin
  return query
  select
    kc.id,
    kc.source,
    kc.section,
    kc.content,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) as similarity
  from public.knowledge_chunks kc
  where kc.embedding is not null
    and 1 - (kc.embedding <=> query_embedding) > match_threshold
    and (filter_project_id is null or kc.project_id = filter_project_id or kc.project_id is null)
  order by kc.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- ── Row Level Security ─────────────────────────────────────────────────────
alter table public.knowledge_chunks enable row level security;

-- Policies: allow read for anon, full access for authenticated
create policy "knowledge_read"
  on public.knowledge_chunks for select using (true);

create policy "knowledge_write"
  on public.knowledge_chunks for all using (auth.role() = 'authenticated');
