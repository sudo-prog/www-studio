# WWW Studio

A web-based visual editor for building websites with AI assistance.

## Project Structure

```
├── artifacts/
│   ├── www-studio/      # Main web application
│   ├── mobile/          # Expo mobile app
│   ├── api-server/      # Express API server with OpenAI integration
│   └── mockup-sandbox/  # UI component sandbox
└── lib/
    ├── api-spec/          # OpenAPI spec + Orval config
    ├── api-client-react/   # Generated React Query hooks
    ├── api-zod/           # Generated Zod schemas
    ├── auth-web/          # Authentication hooks
    ├── db/                # Drizzle ORM schema
    └── integrations/
        └── gemini-web2api/ # Gemini Web2API Python proxy (OpenAI-compatible)
```

## Development

```bash
# Install dependencies
pnpm install

# Typecheck all packages
pnpm run typecheck

# Build all packages
pnpm run build

# Run main app
pnpm --filter @workspace/www-studio run dev
```

## Environment Variables

Required for API server:
- `DATABASE_URL` - PostgreSQL connection string

Optional:
- `OPENAI_API_KEY` - OpenAI API key for AI features (generation, screenshot-to-code, image generation)
- `LLM_BASE_URL` - Unified LLM base URL (default: http://localhost:11434/v1)
- `LLM_MODEL` - LLM model name
- `GEMINI_WEB2API_BASE_URL` - Gemini Web2API proxy URL (default: http://localhost:8081/v1)
- `GEMINI_WEB2API_MODEL` - Gemini model (default: gemini-2.0-flash)
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID for GitHub login
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret for GitHub login
- `EXPO_PUBLIC_DOMAIN` - Domain for mobile app API connection
- `EXPO_PUBLIC_GITHUB_CLIENT_ID` - GitHub OAuth client ID for mobile app

## Gemini Web2API Integration

WWW Studio includes a Python proxy that converts Google Gemini's web interface into an OpenAI-compatible API. This provides **free AI access** with no API keys required.

```bash
# Start the proxy (starts on localhost:8081)
bash scripts/start-gemini-proxy.sh
```

Then set the API server to use it:
```bash
LLM_BASE_URL=http://localhost:8081/v1 LLM_MODEL=gemini-2.0-flash bash artifacts/api-server/build.mjs && bash artifacts/api-server/src/index.mjs
```
