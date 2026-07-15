import { apiFetch } from "@/lib/apiFetch";

// ── MCP (Model Context Protocol) Integration ─────────────────────────────────
// Integrates codebase-memory-mcp and other MCP tools

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface McpResult {
  content: string;
  isError?: boolean;
}

// ── MCP Tool Registry ────────────────────────────────────────────────────────
export class McpRegistry {
  private tools: Map<string, McpTool> = new Map();
  private handlers: Map<string, (args: any) => Promise<McpResult>> = new Map();

  register(tool: McpTool, handler: (args: any) => Promise<McpResult>): void {
    this.tools.set(tool.name, tool);
    this.handlers.set(tool.name, handler);
  }

  async call(toolName: string, args: any): Promise<McpResult> {
    const handler = this.handlers.get(toolName);
    if (!handler) {
      return { content: `Unknown tool: ${toolName}`, isError: true };
    }
    try {
      return await handler(args);
    } catch (err: any) {
      return { content: `Error: ${err.message}`, isError: true };
    }
  }

  listTools(): McpTool[] {
    return Array.from(this.tools.values());
  }

  getTool(name: string): McpTool | undefined {
    return this.tools.get(name);
  }
}

// ── Global MCP instance ──────────────────────────────────────────────────────
export const mcpRegistry = new McpRegistry();

// ── Register built-in tools ──────────────────────────────────────────────────
mcpRegistry.register(
  {
    name: "codebase_search",
    description: "Search the codebase for relevant files and patterns",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        limit: { type: "number", description: "Max results", default: 5 },
      },
      required: ["query"],
    },
  },
  async (args) => {
    // Client-side implementation: search via API
    const res = await apiFetch(`/api/mcp/search?q=${encodeURIComponent(args.query)}&limit=${args.limit ?? 5}`);
    const data = await res.json();
    return { content: JSON.stringify(data) };
  }
);

mcpRegistry.register(
  {
    name: "memory_search",
    description: "Search indexed memory/knowledge for context",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Memory search query" },
      },
      required: ["query"],
    },
  },
  async (args) => {
    const res = await apiFetch(`/api/rag/search?q=${encodeURIComponent(args.query)}`);
    const data = await res.json();
    return { content: JSON.stringify(data) };
  }
);

mcpRegistry.register(
  {
    name: "component_lookup",
    description: "Look up a component from the library",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Component name" },
        category: { type: "string", description: "Optional category filter" },
      },
      required: ["name"],
    },
  },
  async (args) => {
    const params = new URLSearchParams({ name: args.name });
    if (args.category) params.set("category", args.category);
    const res = await apiFetch(`/api/components?${params}`);
    const data = await res.json();
    return { content: JSON.stringify(data) };
  }
);
