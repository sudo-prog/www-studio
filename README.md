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
    ├── api-spec/        # OpenAPI spec + Orval config
    ├── api-client-react/ # Generated React Query hooks
    ├── api-zod/         # Generated Zod schemas
    ├── auth-web/        # Authentication hooks
    └── db/              # Drizzle ORM schema
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
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID for GitHub login
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret for GitHub login
- `EXPO_PUBLIC_DOMAIN` - Domain for mobile app API connection
- `EXPO_PUBLIC_GITHUB_CLIENT_ID` - GitHub OAuth client ID for mobile app
