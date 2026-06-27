# WWW Studio — State Management

Overview of all state management patterns: Zustand stores, React Context, useReducer, and React Query.

---

## Architecture Summary

The app uses **4 state management layers**:

| Layer | Technology | Scope |
|-------|-----------|-------|
| Global server state | TanStack React Query | API data (projects, scenes, gallery) |
| 3D scene editor | Zustand (`useSceneStore`) | Single scene editing state |
| Freeform editor | `useReducer` + `dispatch` | Freeform page editing state |
| Structured editor | `useReducer` (local page state) | Editor UI state |
| Design extraction | `useReducer` (local page state) | Extraction state machine |
| Theme | React Context (`ThemeProvider`) | Light/dark mode |
| UI primitives | React Context (internal) | Sidebar, form, chart, etc. |

---

## Zustand Stores

### `useSceneStore` (`lib/sceneStore.ts`)

The only Zustand store in the project. Manages the 3D/scroll scene editor state.

**State:**
```typescript
interface SceneEditorState {
  scene: SceneData;          // The scene being edited (elements, canvas size, tokens, etc.)
  selectedId: string | null; // Currently selected element ID
  isDirty: boolean;          // Unsaved changes flag
  timelinePlayhead: number;  // Animation timeline position (0-100)
  isPlaying: boolean;        // Animation playback state
  debugOverlay: boolean;     // ScrollTrigger debug overlay toggle
  lenisEnabled: boolean;     // Smooth scroll (Lenis) toggle
}
```

**Actions:**
```typescript
interface SceneEditorActions {
  loadScene: (s: SceneData) => void;           // Load a scene from server
  setName: (name: string) => void;             // Rename the scene
  addElement: (el: SceneElement) => void;      // Add single element (auto-assigns zIndex)
  addElements: (els: SceneElement[]) => void;  // Add multiple elements
  updateElement: (id, updates) => void;        // Partial update of element props
  deleteElement: (id: string) => void;         // Remove element
  moveElement: (id, x, y) => void;             // Position update
  reorderUp: (id: string) => void;             // Move element up in z-order
  reorderDown: (id: string) => void;           // Move element down in z-order
  select: (id: string | null) => void;         // Set selection
  setTimelinePlayhead: (t: number) => void;    // Set animation time
  setIsPlaying: (p: boolean) => void;          // Toggle playback
  toggleDebugOverlay: () => void;              // Toggle debug markers
  toggleLenis: () => void;                     // Toggle smooth scroll
  resetDirty: () => void;                      // Mark as saved
}
```

**Usage pattern:**
```typescript
import { useSceneStore } from "@/lib/sceneStore";

// Select specific state (causes re-render only on change)
const debugOverlay = useSceneStore((s) => s.debugOverlay);
const toggleDebugOverlay = useSceneStore((s) => s.toggleDebugOverlay);
```

**Components that use this store:**
- `ScrollDebugOverlay.tsx` — reads `debugOverlay`, calls `toggleDebugOverlay`
- `scene-editor.tsx` — uses local reducer for most state, but the store is available for shared state

**Note:** The scene-editor page (`pages/scene-editor.tsx`) actually uses its own local `useReducer` for the main editing state, not the Zustand store. The Zustand store appears to be an alternative/shared state mechanism used by specific components.

---

## React useReducer Patterns

### Freeform Editor State (`lib/freeformStore.ts`)

Uses `useReducer` with a custom `freeformReducer` function.

**State shape:**
```typescript
interface FreeformState {
  page: FreeformPage;          // The page being edited (elements, background, tokens, etc.)
  selectedId: string | null;   // Selected element ID
  past: FreeformPage[];        // Undo history (max 30 entries)
  future: FreeformPage[];      // Redo history
  isDirty: boolean;            // Unsaved changes
  snapGrid: boolean;           // Snap-to-grid enabled
  gridSize: number;            // Grid size in px
  showGuides: boolean;         // Alignment guides visible
  zoom: number;                // Canvas zoom level
  activeArtboardId: string | null; // Active artboard
  showRulers: boolean;         // Rulers visible
}
```

**Action types (27 total):**
- `LOAD_PAGE`, `SET_NAME`, `SET_BACKGROUND`
- `ADD_ELEMENT`, `UPDATE_ELEMENT`, `DELETE_ELEMENT`, `DUPLICATE_ELEMENT`
- `MOVE_ELEMENT`, `RESIZE_ELEMENT`, `ROTATE_ELEMENT`, `SET_ZINDEX`
- `SEND_FORWARD`, `SEND_BACKWARD`
- `SELECT`, `UNDO`, `REDO`
- `TOGGLE_SNAP`, `TOGGLE_GUIDES`, `TOGGLE_RULERS`
- `SET_ZOOM`, `CANVAS_SIZE`
- `SET_CUSTOM_CSS`, `SET_CUSTOM_JS`
- `CLEAR_DIRTY`
- `ADD_ARTBOARD`, `DELETE_ARTBOARD`, `SET_ACTIVE_ARTBOARD`, `UPDATE_ARTBOARD`
- `SET_TOKENS`, `UPDATE_TOKEN`
- `ADD_COMPONENT`, `DELETE_COMPONENT`, `ADD_VARIANT`, `SYNC_INSTANCE`

**History management:**
- `pushHistory()` keeps max 30 entries (slices from the end)
- Every mutating action pushes current state to `past` and clears `future`
- `UNDO`: pops from `past`, pushes to `future`
- `REDO`: pops from `future`, pushes to `past`

**Initialization:**
```typescript
export function createInitialFreeformState(page?: Partial<FreeformPage>): FreeformState
```
Called in `pages/freeform-editor.tsx` via:
```typescript
const [state, dispatch] = useReducer(freeformReducer, {}, () =>
  createInitialFreeformState(projectId ? { id: projectId, slug: projectId } : undefined)
);
```

### Scene Editor State (`pages/scene-editor.tsx`)

Local `useReducer` defined inline in the page component.

**State shape:**
```typescript
interface EditorState {
  scene: SceneData;
  selectedId: string | null;
  past: SceneData[];
  future: SceneData[];
  isDirty: boolean;
}
```

**Action types (14 total):**
- `LOAD_SCENE`, `RESTORE_SCENE`, `SET_NAME`
- `ADD_ELEMENT`, `ADD_ELEMENTS`, `UPDATE_ELEMENT`, `DELETE_ELEMENT`
- `MOVE_ELEMENT`, `REORDER_UP`, `REORDER_DOWN`
- `SELECT`, `REPLACE_ELEMENTS`
- `UNDO`, `REDO`

Same history pattern as freeform (max 30 entries).

### Design Extraction State (`pages/DesignExtractPage.tsx`)

State machine: `input → processing → complete | error`

**State shape:**
```typescript
interface State {
  phase: Phase;               // "input" | "processing" | "complete" | "error"
  extractionId: string | null;
  url: string;
  tokens: TokenData | null;
  markdown: string | null;
  error: string | null;
  errorType: "url_fetch" | "llm" | "screenshot" | "general";
  references: Reference[];
  history: ExtractionSummary[];
}
```

**Action types (6):**
- `SUBMIT`, `POLL_RESULT`, `SET_ERROR`, `RESET`, `LOAD_EXISTING`, `UPDATE_HISTORY`

---

## React Context

### Theme Provider (`components/theme-provider.tsx`)
```typescript
const ThemeProviderContext = createContext<ThemeProviderState>(initialState);
export const useTheme = () => { ... };
```
- Provides: `theme`, `setTheme`
- Default: `"dark"` mode
- Storage key: `"www-studio-theme"` (localStorage)

### UI Component Contexts
Several shadcn/ui components use internal React Context for compound component patterns:
- `SidebarContext` — sidebar state (collapsed, mobile)
- `FormFieldContext` / `FormItemContext` — form field registration
- `CarouselContext` — carousel navigation state
- `ToggleGroupContext` — toggle group selection
- `ChartContext` — chart configuration
- `OTPInputContext` — OTP input state

---

## TanStack React Query

Used for all server communication. Configured in `App.tsx`:
```typescript
const queryClient = new QueryClient();
<QueryClientProvider client={queryClient}>...</QueryClientProvider>
```

### API Client Hooks (from `@workspace/api-client-react`)

**Project hooks:**
- `useGetProject(projectId)` — fetch single project
- `useUpdateProject(projectId)` — mutation for updates
- `usePublishProject(projectId)` — mutation for publishing
- `useListSnapshots(projectId)` — fetch project snapshots
- `useRestoreSnapshot(projectId)` — restore a snapshot

**Scene hooks:**
- `useGetScenes()` — list all scenes
- `useCreateScene()` — create new scene
- `useUpdateScene(sceneId)` — update scene
- `useDeleteScene(sceneId)` — delete scene
- `useAiGenerateScene(sceneId)` — AI-powered scene generation

**Chat/generation hooks:**
- `useSendChatMessage()` — send chat message to AI
- `useGenerateImage()` — generate image
- `useCloneFromUrl()` — clone website by URL
- `useGenerateFromPrompt()` — generate from prompt
- `useScreenshotToCode()` — convert screenshot to code

### Query Invalidation
Components use `useQueryClient()` to invalidate related queries after mutations:
```typescript
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
queryClient.invalidateQueries({ queryKey: getListSnapshotsQueryKey(projectId) });
```

---

## Store Interactions

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ QueryClientProvider (TanStack React Query)            │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ ThemeProvider (React Context)                   │  │   │
│  │  │  ┌──────────────────────────────────────────┐  │  │   │
│  │  │  │ TooltipProvider                           │  │  │   │
│  │  │  │  ┌────────────────────────────────────┐  │  │  │   │
│  │  │  │  │ ErrorBoundary                       │  │  │  │   │
│  │  │  │  │  ┌──────────────────────────────┐  │  │  │  │   │
│  │  │  │  │  │ WouterRouter (hash-based)     │  │  │  │  │   │
│  │  │  │  │  │  ┌────────────────────────┐  │  │  │  │  │   │
│  │  │  │  │  │  │ Pages use:             │  │  │  │  │  │   │
│  │  │  │  │  │  │ - useReducer (local)   │  │  │  │  │  │   │
│  │  │  │  │  │  │ - Zustand (sceneStore) │  │  │  │  │  │   │
│  │  │  │  │  │  │ - React Query (server) │  │  │  │  │  │   │
│  │  │  │  │  │  └────────────────────────┘  │  │  │  │  │   │
│  │  │  │  │  └──────────────────────────────┘  │  │  │  │   │
│  │  │  │  └────────────────────────────────────┘  │  │  │   │
│  │  │  └──────────────────────────────────────────┘  │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Data flow:**
1. User action → local state update (useReducer/Zustand) for immediate UI feedback
2. API call via React Query mutation
3. On success: invalidate related queries → server state refetched
4. On error: show toast, local state may rollback (undo)
