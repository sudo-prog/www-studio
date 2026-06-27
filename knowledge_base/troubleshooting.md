# WWW Studio — Troubleshooting

Common issues and their fixes. Organized by symptom.

---

## Build Failures

### "Cannot find module '@/..."

**Cause:** Path alias `@` not resolved. The vite/tsconfig alias is `@` → `artifacts/www-studio/src/`.

**Fix:**
- Ensure imports use `@/...` prefix (not relative `../../`)
- The alias is defined in both `vite.config.ts` and `tsconfig.json`

### "X is not exported from '@/lib/Y'"

**Cause:** The frontend cannot import from `api-server` or other packages outside its scope.

**Fix:**
- Frontend can ONLY import from its own `src/`, `lib/*` workspace packages, and npm dependencies
- `llm.ts` lives at `artifacts/api-server/src/lib/llm.ts` — NOT accessible from frontend
- All AI calls must go through HTTP fetch to `VITE_API_SERVER_URL`

### Build fails with "outDir" not empty

**Cause:** Stale build artifacts in `dist/public/`.

**Fix:**
```bash
rm -rf artifacts/www-studio/dist/public
pnpm --filter @workspace/www-studio run build
```

### "pnpm: command not found" in CI

**Cause:** pnpm not installed in CI environment.

**Fix:**
```bash
corepack enable
corepack prepare pnpm@latest --activate
```

---

## Type Errors

### "JSX.IntrinsicElements" / "Cannot find namespace 'JSX'"

**Cause:** TypeScript can't find React type definitions, or the tsconfig doesn't include the right libs.

**Fix:**
1. Ensure `types` field in `tsconfig.json` includes React types
2. Check that `@types/react` is installed (comes with React 19)
3. If using Three.js components, ensure `@react-three/fiber` types are augmented:
   ```typescript
   // The @react-three/fiber package augments JSX.IntrinsicElements automatically
   // If this fails, check that the import isn't being tree-shaken
   ```
4. For custom elements added to JSX namespace:
   ```typescript
   declare global {
     namespace JSX {
       interface IntrinsicElements {
         "my-element": any;
       }
     }
   }
   ```

### "Property 'env' does not exist on type 'ImportMeta'"

**Cause:** Vite client types not included.

**Fix:**
- Add `/// <reference types="vite/client" />` to `vite-env.d.ts`
- Or ensure `tsconfig.json` includes `"types": ["vite/client"]`

### "Type 'X' is not assignable to type 'never'" in reducers

**Cause:** Action union type not properly discriminated.

**Fix:** Ensure all action types have a `type` discriminant and the reducer's switch covers all cases.

---

## API Connection Issues

### "Failed to fetch" / CORS errors

**Cause:** The API server URL is incorrect or CORS is not configured.

**Fix:**
1. Check `VITE_API_SERVER_URL` is set correctly in your `.env` or build environment
2. The API server uses `cors()` middleware — ensure it allows your origin
3. For local development: `VITE_API_SERVER_URL=http://localhost:8787`
4. For production: ensure the API server URL uses HTTPS

### "NetworkError when attempting to fetch resource"

**Cause:** Mixed content (HTTPS page fetching HTTP API) or API server is down.

**Fix:**
- Ensure both frontend and API server use the same protocol (both HTTPS in production)
- Check API server health: `GET /healthz` should return `{ status: "ok" }`
- For detailed health (including LLM reachability): `GET /health`

### Streaming chat not working

**Cause:** The `/chat/stream` endpoint uses Server-Sent Events (SSE). Some proxies/configuration may block this.

**Fix:**
- Ensure no proxy buffering the response
- Check that `Content-Type: text/event-stream` is being sent
- Vercel: the rewrite rule excludes `/api/` paths from SPA rewrite

### "LLM call failed" / "AI provider unreachable"

**Cause:** API server can't reach the LLM provider.

**Fix:**
1. Check `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_API_KEY` on the API server
2. Test directly: `curl $LLM_BASE_URL/chat/completions -H "Authorization: Bearer $LLM_API_KEY" -d '{"model":"...","messages":[{"role":"user","content":"test"}]}`
3. Check `GET /health` endpoint — it tests AI provider reachability

---

## Supabase Connection Issues

### "supabase is null" / "Cannot read properties of null"

**Cause:** Supabase client is null because env vars are not set.

**Fix:**
- Always guard supabase calls:
  ```typescript
  import { supabase, isSupabaseEnabled } from '@/lib/supabase';
  
  if (isSupabaseEnabled()) {
    const { data } = await supabase.from('table').select();
  }
  ```
- `supabase.ts` returns `null` when `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are missing

### "new row violates row-level security policy"

**Cause:** RLS policy blocking the operation.

**Fix:**
- Check RLS policies in Supabase Dashboard → Authentication → Policies
- For service-role operations, use the service role key (bypasses RLS)
- For anon key operations, ensure policies allow the operation for authenticated/anon users

### "Invalid API key" / "jwks_uri must be configured"

**Cause:** Supabase project keys are wrong or Auth is misconfigured.

**Fix:**
- Double-check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your env
- URL format: `https://XXXXX.supabase.co`
- Keys are found in Supabase Dashboard → Settings → API

---

## GitHub Pages 404s

### Page refreshes show 404

**Cause:** This should NOT happen with hash-based routing. If it does:

**Fix:**
- Ensure the app uses `useHashLocation` (all routes are `/#/path`)
- If you see 404s on refresh, the server might be intercepting before the hash is processed
- This is expected behavior for direct URL entry — the hash is client-side only

### Assets return 404 after deploy

**Cause:** Base path mismatch. Assets are loaded from `/www-studio/assets/...` but the server expects `/assets/...`.

**Fix:**
- Ensure `GITHUB_PAGES=true` is set during build
- Check `vite.config.ts`: `base: process.env.GITHUB_PAGES === "true" ? "/www-studio/"/ : "/"`
- Verify built HTML references `/www-studio/assets/...` paths

### Blank page after deploy

**Cause:** JavaScript not loading, or base path issue.

**Fix:**
1. Open browser DevTools → Console for errors
2. Check Network tab for 404s on JS/CSS files
3. Verify `index.html` in the deploy contains correct `<script>` and `<link>` tags with `/www-studio/` prefix
4. If using a custom domain with GitHub Pages, ensure `CNAME` file is in the deploy output

### Service Workercache issues

**Cause:** Old service worker serving stale content.

**Fix:**
- The `vercel.json` sets `Cache-Control: public, max-age=0, must-revalidate` for `sw.js`
- For GitHub Pages, users may need to manually unregister SW in DevTools → Application → Service Workers

---

## Common Fixes Checklist

| Symptom | Likely Cause | Quick Fix |
|---------|-------------|-----------|
| White/blank page | Build failed to load JS | Check console, verify base path |
| AI chat returns errors | API server unreachable | Check `VITE_API_SERVER_URL` |
| Can't save projects | GitHub token missing | Set token in localStorage |
| Supabase features crash | Env vars not set | Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
| Type errors on build | Missing types or wrong imports | Run `pnpm run typecheck` |
| Styles not applying | Tailwind not processing | Check `@tailwindcss/vite` plugin is loaded |
| 3D canvas black | WebGL not available | Check browser support, update drivers |

---

## Getting Help

1. Check the browser console for errors
2. Check the API server logs: `GET /health` and `GET /healthz`
3. Run `pnpm run typecheck` to catch type errors before building
4. Check existing knowledge base files:
   - `known-gotchas.md` — Critical facts that burn agents
   - `monorepo-structure.md` — File paths and package names
   - `api-server-routes.md` — All API endpoints
