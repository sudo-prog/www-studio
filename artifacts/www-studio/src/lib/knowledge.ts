/**
 * Frontend RAG client — calls api-server knowledge endpoints over HTTP.
 * The frontend does NOT import llm.ts directly (that lives in api-server).
 */

const API_BASE = import.meta.env.VITE_API_SERVER_URL || "";

export interface EmbedParams {
  content: string;
  source: string;
  sourceType: string;
  userId?: string;
}

export interface SearchParams {
  query: string;
  userId?: string;
  limit?: number;
}

export interface SearchResult {
  id: string;
  source: string;
  content: string;
  similarity: number;
}

/**
 * Embed and store content in the knowledge base.
 */
export async function embedContent(
  params: EmbedParams
): Promise<{ id: string; success: boolean }> {
  const res = await fetch(`${API_BASE}/api/knowledge/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/**
 * Search the knowledge base using vector similarity.
 */
export async function searchKnowledge(
  params: SearchParams
): Promise<SearchResult[]> {
  const res = await fetch(`${API_BASE}/api/knowledge/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await res.text());
  const { results } = await res.json();
  return results;
}

/**
 * List knowledge chunks (optionally filtered by source).
 */
export async function listKnowledge(params?: {
  source?: string;
  limit?: number;
}): Promise<
  Array<{
    id: string;
    source: string;
    section: string;
    content: string;
    metadata: Record<string, unknown>;
    createdAt: string;
  }>
> {
  const searchParams = new URLSearchParams();
  if (params?.source) searchParams.set("source", params.source);
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const res = await fetch(
    `${API_BASE}/api/knowledge/list?${searchParams.toString()}`
  );
  if (!res.ok) throw new Error(await res.text());
  const { results } = await res.json();
  return results;
}
