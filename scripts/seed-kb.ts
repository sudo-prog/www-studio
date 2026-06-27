/**
 * RAG Knowledge Base Seed Script
 *
 * Reads markdown/code files from the repo and sends them to the
 * api-server's /api/knowledge/embed endpoint for vector storage.
 *
 * Usage: API_SERVER_URL=http://localhost:3001 pnpm kb:seed
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, extname } from "path";

const API_URL = process.env.API_SERVER_URL || "http://localhost:3001";

const CHUNK_SIZE = 2000;
const OVERLAP = 200;

async function ingestChunk(
  content: string,
  source: string,
  sourceType: string
): Promise<void> {
  const res = await fetch(`${API_URL}/api/knowledge/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, source, sourceType }),
  });
  if (!res.ok) {
    console.error(`  ✗ Failed: ${source} —`, await res.text());
    return;
  }
  console.log(`  ✓ Embedded: ${source}`);
  // Rate limit: 120ms between requests
  await new Promise((r) => setTimeout(r, 120));
}

async function ingestFile(filePath: string, sourceType: string): Promise<void> {
  const content = readFileSync(filePath, "utf-8").trim();
  if (content.length < 50) return;

  if (content.length <= CHUNK_SIZE) {
    await ingestChunk(content, filePath, sourceType);
    return;
  }

  let start = 0;
  let chunkIndex = 0;
  while (start < content.length) {
    await ingestChunk(
      content.slice(start, start + CHUNK_SIZE),
      `${filePath}#${chunkIndex}`,
      sourceType
    );
    start += CHUNK_SIZE - OVERLAP;
    chunkIndex++;
  }
}

async function ingestDir(
  dir: string,
  sourceType: string,
  exts = [".md", ".ts", ".tsx", ".json", ".txt"]
): Promise<void> {
  if (!existsSync(dir)) return;
  for (const file of readdirSync(dir)) {
    const full = join(dir, file);
    if (statSync(full).isDirectory()) {
      await ingestDir(full, sourceType, exts);
    } else if (exts.includes(extname(file))) {
      await ingestFile(full, sourceType);
    }
  }
}

async function main(): Promise<void> {
  console.log("🚀 Seeding RAG knowledge base...\n");

  // Knowledge base docs
  if (existsSync("knowledge_base") && statSync("knowledge_base").isDirectory()) {
    console.log("📁 knowledge_base/");
    await ingestDir("knowledge_base", "doc");
  }

  // Monorepo root docs
  const rootDocs = ["README.md", "CLAUDE.md", "package.json"];
  for (const doc of rootDocs) {
    if (existsSync(doc)) {
      console.log(`📄 ${doc}`);
      await ingestFile(doc, "doc");
    }
  }

  // Shared types (great for AI to know the data shapes)
  console.log("\n📁 lib/db/src/schema/");
  await ingestDir("lib/db/src/schema", "code");

  // Frontend lib files
  console.log("📁 artifacts/www-studio/src/lib/");
  await ingestDir("artifacts/www-studio/src/lib", "code");

  // API server lib files
  console.log("📁 artifacts/api-server/src/lib/");
  await ingestDir("artifacts/api-server/src/lib", "code");

  // 3D system
  console.log("📁 artifacts/www-studio/src/components/three/");
  await ingestDir("artifacts/www-studio/src/components/three", "three-d");

  console.log("\n✅ Done!");
}

main().catch(console.error);
