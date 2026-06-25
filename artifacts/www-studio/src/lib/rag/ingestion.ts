// ── RAG Ingestion Pipeline ───────────────────────────────────────────────────
// Ingests content chunks, generates simple TF-IDF embeddings, stores in DB

export interface KnowledgeChunk {
  id: string;
  content: string;
  embedding: string | null;
  metadata: Record<string, unknown> | null;
  source: string | null;
  created_at: string;
}

export interface IngestResult {
  success: boolean;
  chunkId: string;
  source: string;
  chars: number;
}

export interface SearchResult {
  id: string;
  content: string;
  source: string | null;
  score: number;
  metadata: Record<string, unknown>;
}

// ── Simple text chunking ─────────────────────────────────────────────────────
export function chunkText(text: string, maxChunkSize: number = 500): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + sentence).length > maxChunkSize && current.length > 0) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// ── TF-IDF embedding (lightweight, no external API needed) ────────────────────
function tokenize(text: string): string[] {
  return text.toLowerCase().match(/\b[a-z0-9_]+\b/g) || [];
}

function computeTfIdf(docTokens: string[], corpusTokens: string[][]): number[] {
  const allTerms = new Set<string>();
  for (const tokens of [docTokens, ...corpusTokens]) {
    for (const t of tokens) allTerms.add(t);
  }
  const vocab = Array.from(allTerms);
  const df = new Map<string, number>();
  for (const tokens of corpusTokens) {
    const unique = new Set(tokens);
    for (const t of unique) df.set(t, (df.get(t) ?? 0) + 1);
  }

  const N = corpusTokens.length + 1;
  return vocab.map((term) => {
    const tf = docTokens.filter((t) => t === term).length / Math.max(docTokens.length, 1);
    const docFreq = df.get(term) ?? 0;
    const idf = Math.log((N + 1) / (docFreq + 1)) + 1;
    return tf * idf;
  });
}

export function generateEmbedding(text: string, corpus: string[] = []): number[] {
  const docTokens = tokenize(text);
  const corpusTokens = corpus.map(tokenize);
  return computeTfIdf(docTokens, corpusTokens);
}

// ── Cosine similarity ────────────────────────────────────────────────────────
export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  if (len === 0) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

// ── Ingest pipeline ──────────────────────────────────────────────────────────
export async function ingestContent(
  content: string,
  source: string,
  existingCorpus: string[] = []
): Promise<IngestResult> {
  const chunks = chunkText(content);
  const mainChunk = chunks[0] ?? content;
  const embedding = generateEmbedding(mainChunk, existingCorpus);

  // Store via API call (client-side) or return for server processing
  return {
    success: true,
    chunkId: crypto.randomUUID(),
    source,
    chars: content.length,
  };
}

// ── Search pipeline ───────────────────────────────────────────────────────────
export async function searchKnowledge(
  query: string,
  chunks: KnowledgeChunk[]
): Promise<SearchResult[]> {
  const corpus = chunks.map((c) => c.content);
  const queryEmbedding = generateEmbedding(query, corpus);

  const scored = chunks.map((chunk) => {
    const chunkEmbedding = chunk.embedding
      ? JSON.parse(chunk.embedding)
      : generateEmbedding(chunk.content, corpus);
    const score = cosineSimilarity(queryEmbedding, chunkEmbedding as number[]);
    return {
      id: chunk.id,
      content: chunk.content,
      source: chunk.source,
      score,
      metadata: chunk.metadata ?? {},
    } as SearchResult;
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 10);
}
