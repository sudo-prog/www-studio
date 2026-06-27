# WWW Studio — API Server Routes

## Route Registration Order

All routes are registered in `artifacts/api-server/src/routes/index.ts`:

```
health → auth → gallery → projects → clone → editor → chat → user → generate → screenshot-to-code → export → publish → snapshots → design → design-extract → scenes → enhanced → knowledge
```

## Endpoint Documentation

### Health (`health.ts`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/healthz` | Simple liveness check — returns `{ status: "ok" }` |
| GET | `/health` | Detailed health — includes AI provider reachability (primary + Gemini Web2API) |

### Auth (`auth.ts`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/mobile` | Mobile OAuth flow — exchange authorization code |
| POST | `/auth/session` | Create session (login) |
| DELETE | `/auth/session` | Destroy session (logout) |
| GET | `/auth/user` | Get current authenticated user |

### Gallery (`gallery.ts`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/gallery` | List gallery templates (filterable by style, search, sort) |

### Projects (`projects.ts`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/projects` | List user's projects |
| GET | `/projects/recent` | Get 6 most recently updated projects |
| GET | `/projects/:id` | Get single project |
| POST | `/projects` | Create new project |
| PATCH | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Delete project |

### Clone (`clone.ts`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/clone` | Clone a website by URL — detects style, generates component tree |

### Editor (`editor.ts`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/editor/themes` | List 12 preset themes (cyberpunk, glassmorphism, brutalist, etc.) with token values |

### Chat (`chat.ts`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/chat` | AI chat with context — returns reply, code changes, suggestions |
| POST | `/chat/stream` | Streaming AI chat response |

### User (`user.ts`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/user/me` | Get current user profile + project count |

### Generate (`generate.ts`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/generate` | Generate component from natural language prompt — detects style, generates HTML/React/Tailwind code |

### Screenshot-to-Code (`screenshot-to-code.ts`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/screenshot-to-code` | Convert screenshot image → component tree using vision LLM |

### Export (`export.ts`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/export` | Render component tree to HTML and return downloadable file |

### Publish (`publish.ts`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/publish` | Publish project — generates static HTML/CSS/JS |

### Snapshots (`snapshots.ts`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/projects/:id/snapshots` | List project snapshots (last 50) |
| POST | `/projects/:id/snapshots` | Create snapshot (label + component tree + theme tokens) |
| GET | `/projects/:id/snapshots/:snapshotId` | Get single snapshot |
| POST | `/projects/:id/snapshots/:snapshotId/restore` | Restore snapshot to project |

### Design (`design.ts`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/design` | Heuristic design.md generator — detects profile from prompt, generates DesignProfile |

### Design Extract (`design-extract.ts`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/design-extract` | Start design extraction from URL/screenshot |
| GET | `/design-extract/:id` | Poll extraction status + result |
| PATCH | `/design-extract/:id/tokens` | Save edited tokens, regenerate outputs |
| POST | `/design-extract/:id/apply-to-project` | Apply extracted tokens to project |
| GET | `/design-extract/:id/download/:format` | Download extraction as file |
| GET | `/design-extract` | List user's extractions |

### Scenes (`scenes.ts`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/scenes` | List scenes (with optional filters) |
| GET | `/scenes/:id` | Get single scene |
| POST | `/scenes` | Create new scene |
| PATCH | `/scenes/:id` | Update scene |
| DELETE | `/scenes/:id` | Delete scene |
| POST | `/scenes/:id/ai` | AI-powered scene generation/modification |

### Enhanced (`enhanced.ts`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/enhanced/components` | List components (filterable by category, search, tag) |
| GET | `/enhanced/templates` | List templates |
| GET | `/enhanced/pages` | List pages |
| POST | `/enhanced/chat` | Enhanced AI chat with tool-calling |

### Knowledge (`knowledge.ts`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/knowledge/embed` | Generate embedding via Gemini embedding API, store in knowledge_chunks |
| GET | `/knowledge/search` | Vector search across knowledge chunks |
| GET | `/knowledge/chunks` | List knowledge chunks |
| DELETE | `/knowledge/chunks/:id` | Delete knowledge chunk |

---

## Middleware Stack

The API server uses:
- `cors` — Cross-origin requests
- `cookie-parser` — Cookie parsing
- `express-rate-limit` — Rate limiting
- Custom auth middleware — Session validation via `getSessionId`
- Zod validation — Request body/query validation

## Authentication

- Session-based via `SESSION_COOKIE` (httpOnly, secure, sameSite: lax)
- `SESSION_TTL` controls expiration
- `req.isAuthenticated()` checks for valid session
- Guest access available for some endpoints (uses `00000000-...` guest user ID)
