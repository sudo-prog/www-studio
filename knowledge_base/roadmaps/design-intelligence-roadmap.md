# Design Intelligence Roadmap

**Note:** The design intelligence roadmap exists as `DESIGN_INTELLIGENCE_ROADMAP.pdf` in the project root (binary PDF format). The authoritative text version is embedded in `dev_roadmap.md`. This knowledge base entry summarizes the module status.

## Source Files
- `DESIGN_INTELLIGENCE_ROADMAP.pdf` — Full specification (PDF, binary)
- `dev_roadmap.md` — Contains Phase 5 description

## Branch: `feature/design-intelligence`

## Phase A: API Foundation ✅
- [x] Database schema (design_extractions table)
- [x] Screenshot service (`lib/screenshot.ts`)
- [x] Intent parser (`lib/intentParser.ts`)
- [x] Prompts (`lib/designPrompts.ts`)
- [x] API routes (`routes/design-extract.ts`)

## Phase B: Frontend ✅
- [x] Design Extract page (`pages/DesignExtractPage.tsx`)
- [x] Token editor (`components/design-extract/DesignTokenEditor.tsx`)
- [x] Export panel (`components/design-extract/ExportPanel.tsx`)

## Phase C: UI Polish ✅
- [x] Color swatch editor (`components/design-extract/ColorSwatchEditor.tsx`)
- [x] Typography editor (`components/design-extract/TypographyEditor.tsx`)
- [x] Spacing editor (`components/design-extract/SpacingEditor.tsx`)
- [x] Reference upload panel (`components/design-extract/ReferenceUploadPanel.tsx`)
- [x] Google Fonts integration (`lib/googleFonts.ts`)

## Phase D: RAG & Context ✅
- [x] RAG integration (`lib/ragIngest.ts`)
- [x] Design context in AI chat
- [x] Version history
- [x] Public gallery

## Phase E: Advanced Features ✅
- [x] Batch extraction
- [x] Comparison (`pages/DesignExtractCompare.tsx`)
- [x] Figma import (`lib/figmaTokenImporter.ts`)
- [x] CSS paste (`lib/cssTokenParser.ts`)
- [x] Design critique
- [x] Color harmony generator (`lib/colorHarmony.ts`)
- [x] Token linter (`lib/tokenLinter.ts`)
- [x] Claude export

## Phase F: Testing & QA ✅
- [x] 7 test files covering tokenLinter, colorHarmony, and other modules

## Key Components

| Component | Path |
|-----------|------|
| Design Extract Page | `pages/DesignExtractPage.tsx` |
| Design Extract Gallery | `pages/DesignExtractGallery.tsx` |
| Design Extract Compare | `pages/DesignExtractCompare.tsx` |
| Reference Upload | `components/design-extract/ReferenceUploadPanel.tsx` |
| Reference Item | `components/design-extract/ReferenceItem.tsx` |
| Extraction History | `components/design-extract/ExtractionHistory.tsx` |
| Extraction Progress | `components/design-extract/ExtractionProgress.tsx` |
| Design Token Editor | `components/design-extract/DesignTokenEditor.tsx` |
| Design MD Preview | `components/design-extract/DesignMdPreview.tsx` |
| Design Extract Input | `components/design-extract/DesignExtractInput.tsx` |
| Color Swatch Editor | `components/design-extract/ColorSwatchEditor.tsx` |
| Typography Editor | `components/design-extract/TypographyEditor.tsx` |
| Spacing Editor | `components/design-extract/SpacingEditor.tsx` |
| Export Panel | `components/design-extract/ExportPanel.tsx` |

## Key Library Files

| Library | Path |
|---------|------|
| Design Extract Client | `lib/designExtractClient.ts` |
| Figma Token Importer | `lib/figmaTokenImporter.ts` |
| CSS Token Parser | `lib/cssTokenParser.ts` |
| Color Harmony | `lib/colorHarmony.ts` |
| Token Linter | `lib/tokenLinter.ts` |
| Token Types | `lib/tokenTypes.ts` |
| Google Fonts | `lib/googleFonts.ts` |
| Knowledge | `lib/knowledge.ts` |
| Section Registry | `lib/sectionRegistry.tsx` |

## API Endpoints (Design Extract)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/design-extract` | Start extraction from URL/screenshot |
| GET | `/design-extract/:id` | Poll status + result |
| PATCH | `/design-extract/:id/tokens` | Save edits, regenerate |
| POST | `/design-extract/:id/apply-to-project` | Apply tokens to project |
| GET | `/design-extract/:id/download/:format` | Download file |
| GET | `/design-extract` | List user's extractions |
