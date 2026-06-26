# Design Intelligence Module — QA Checklist

## Cross-Browser Manual Testing

### Desktop Browsers

| Browser | Platform | Test | Status |
|---------|----------|------|--------|
| Chrome 125+ | Desktop (Win/Mac/Linux) | Full flow works | ⬜ |
| Safari 17+ | Desktop (macOS) | Download works | ⬜ |
| Firefox 126+ | Desktop (Win/Mac/Linux) | Color picker works | ⬜ |

### Mobile & Tablet

| Browser | Platform | Test | Status |
|---------|----------|------|--------|
| iOS Safari 17 | iPhone/iPad | File upload works, download shows share sheet | ⬜ |
| Android Chrome 125 | Phone/Tablet | File upload works, camera option appears | � |
| iPad Safari | iPadOS | Two-column layout renders correctly | � |

### PWA

| Scenario | Test | Status |
|----------|------|--------|
| PWA (installed) | Page accessible offline shows "Extraction requires network" | � |

---

## Functional Test Checklist

### Extraction Flow

- [ ] Upload a single screenshot → extraction completes within 30s
- [ ] Enter a URL → screenshot taken → extraction completes
- [ ] Upload multiple references with annotations → parsed intent reflected in output
- [ ] Extraction failure shows clear error message

### Download Formats

- [ ] `GET /:id/download/md` → returns `text/markdown` content-type
- [ ] `GET /:id/download/tailwind` → returns `text/typescript` content-type
- [ ] `GET /:id/download/css` → returns `text/css` content-type
- [ ] `GET /:id/download/json` → returns `application/json` content-type

### Token Editing

- [ ] Edit a color in the token editor → preview updates in real-time
- [ ] PATCH /:id/tokens → updates DB and regenerates all 4 outputs
- [ ] Undo button restores previous token state
- [ ] History stack is preserved (max 20 entries)

### Design Outputs

- [ ] Design MD includes all 8 sections (Brand, Colors, Typography, Spacing, Radius, Shadow, Animation, Components)
- [ ] Tailwind config is valid TypeScript (can be copy-pasted into a project)
- [ ] CSS custom properties use `--color-*`, `--font-*`, `--spacing-*` naming
- [ ] DTCG JSON includes `$schema` field

### Color Harmony

- [ ] Complementary color is visibly different from primary
- [ ] Analogous colors share the same hue family
- [ ] Surface/neutral colors have low saturation

### Token Linter

- [ ] WCAG AA failures are flagged with correct contrast ratio
- [ ] >2 font families trigger a warning
- [ ] Near-duplicate colors are detected

### Batch & Comparison

- [ ] Batch extraction (up to 5 URLs) processes in parallel
- [ ] Comparison view shows 2 extractions side-by-side
- [ ] Differences are highlighted

### Figma Import

- [ ] Paste Figma design tokens → token editor populates
- [ ] Invalid JSON shows error feedback

### RAG & Chat

- [ ] Extraction is ingested into knowledge base
- [ ] Chat messages reference extracted design context
- [ ] Public gallery shows saved extractions

### Error States

- [ ] Network error on extraction shows retry button
- [ ] Invalid URL shows validation error
- [ ] Empty upload shows helpful message
- [ ] Rate limit (if configured) shows appropriate message

---

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| First extraction | < 30s | � |
| Token update + regenerate | < 5s | � |
| Download response | < 500ms | ⬜ |
| Batch 5 URLs | < 60s | ⬜ |

---

## Accessibility

- [ ] All interactive elements are keyboard navigable
- [ ] Color picker has visible focus ring
- [ ] Screen reader announces extraction status changes
- [ ] Download buttons have descriptive labels

---

## Known Limitations

- Vision extraction requires network access (no offline mode)
- Screenshot service must be running for URL-based extraction
- Maximum 5 URLs per batch extraction

---

*Last updated: June 26, 2026*
