# WWW Studio — Component Catalog

Major UI components grouped by feature area. All paths relative to `artifacts/www-studio/src/components/`.

---

## Freeform Editor

### `freeform/FreeformCanvas.tsx`
The main drag-and-drop canvas for the freeform page builder.
- **Props:** `elements`, `selectedId`, `canvasWidth`, `canvasHeight`, `background`, `zoom`, `snapGrid`, `showGuides`, `showRulers`, `layoutMode`, `artboards`, `activeArtboardId`, `isInfiniteCanvas`, `onSelect`, `onMove`, `onResize`
- **Features:** Drag-to-move, resize handles, alignment guides, grid snapping, pan/zoom, rulers, artboard support, form element rendering
- **Used in:** `pages/freeform-editor.tsx`

### `freeform/FreeformToolbar.tsx`
Top toolbar for the freeform editor.
- **Props:** Various tool selections, zoom controls, undo/redo, snap toggle, guide toggle
- **Used in:** `pages/freeform-editor.tsx`

### `freeform/FreeformPropertiesPanel.tsx`
Right-side panel showing properties of the selected element.
- **Props:** `element`, `onUpdate`, `dispatch`
- **Features:** Position, size, rotation, opacity, color, font, layout controls
- **Used in:** `pages/freeform-editor.tsx`

### `freeform/FreeformAIChat.tsx`
AI chat panel for the freeform canvas.
- **Props:** `elements`, `canvasWidth`, `canvasHeight`, `dispatch`, `onClose`
- **Features:** Local fallback AI, Gemini API integration, action execution (add/update/delete/style/layout), critique, self-edit, tool-calling
- **Used in:** `pages/freeform-editor.tsx`

### `freeform/PublishButton.tsx`
Publishes freeform page to GitHub Pages.
- **Props:** `page: FreeformPage`, `onPublish?: (url: string) => void`
- **Features:** Custom domain settings, status tracking (idle/publishing/published/error), URL copying
- **Used in:** `pages/freeform-editor.tsx`

### `freeform/GitHubSaveButton.tsx`
Saves project backup to GitHub as JSON.
- **Props:** `page: FreeformPage`, `userId`, `onSaved?: () => void`
- **Features:** Uses `saveFreeformProject()` from `lib/github-storage.ts`, requires GitHub PAT
- **Used in:** `pages/freeform-editor.tsx`

### `freeform/ScreenshotToFreeform.tsx`
Converts a screenshot image into freeform elements.
- **Props:** `onElementsCreated: (elements: FreeformElement[]) => void`
- **Features:** Image upload, heuristic moodboard layout generation
- **Used in:** `pages/freeform-editor.tsx`

### `freeform/CustomCodePanel.tsx`
Custom CSS/JS editor for freeform pages.
- **Props:** `customCss`, `customJs`, `onCssChange`, `onJsChange`
- **Used in:** `pages/freeform-editor.tsx`

### `freeform/VersionHistory.tsx`
Snapshot history for freeform pages.
- **Props:** `snapshots`, `onRestore`, `onCreateSnapshot`
- **Used in:** `pages/freeform-editor.tsx`

### `freeform/BackgroundPicker.tsx`
Background color/gradient/image picker.
- **Props:** `background`, `onChange`
- **Used in:** `pages/freeform-editor.tsx`

### `freeform/FreehandDraw.tsx`
Freehand drawing tool.
- **Props:** `onComplete: (path: string) => void`
- **Used in:** `pages/freeform-editor.tsx`

### `freeform/FormElementRenderer.tsx`
Renders form elements (input, textarea, select, button) on the canvas.
- **Props:** `element: FreeformElement`, `isSelected`, `onSelect`, `onChange`
- **Used in:** `FreeformCanvas.tsx`

### `freeform/CodeInspector.tsx`
Shows HTML/CSS code for the selected element.
- **Props:** `element`
- **Used in:** `pages/freeform-editor.tsx`

### `freeform/ChaosMonkeyV2.tsx`
Randomly modifies elements for creative exploration.
- **Props:** `elements`, `onChange`
- **Used in:** `pages/freeform-editor.tsx`

---

## Structured Editor

### `editor/SortableLayers.tsx`
Sortable layer panel using @dnd-kit.
- **Props:** `layers: Layer[]`, `selectedId`, `onSelect`, `onReorder`, `onToggleVisibility`, `onToggleLock`, `onDelete`
- **Features:** Drag-to-reorder, visibility/lock toggles, layer deletion
- **Used in:** `pages/editor.tsx`

### `editor/ElementInspector.tsx`
Property inspector for the selected DOM element in the iframe preview.
- **Props:** `element: ElementInfo | null`, `onUpdate`, `onDelete`, `onDuplicate`, `onMove`
- **Features:** Text content, styles, classes, attributes editing
- **Used in:** `pages/editor.tsx`

### `editor/ThemeCustomizer.tsx`
Design token editor for the project.
- **Props:** `projectId`, `tokens`, `onTokensChange`
- **Features:** Color picker, font selector, spacing scale, border radius, shadow editor
- **Used in:** `pages/editor.tsx`

### `editor/PageManager.tsx`
Multi-page project manager.
- **Props:** `pages: Page[]`, `activePageId`, `onSelect`, `onCreate`, `onDelete`, `onRename`, `onDuplicate`
- **Used in:** `pages/editor.tsx`

### `editor/DesignPanel.tsx`
Design system panel showing tokens and their usage.
- **Props:** `projectId`
- **Used in:** `pages/editor.tsx`

### `editor/layer-utils.ts`
Utility functions for parsing HTML to layers and reordering.
- **Exports:** `parseHtmlLayers(html: string): Layer[]`, `reorderHtml(html: string, oldIndex: number, newIndex: number): string`

---

## Scenes

### `scenes/SceneCanvas.tsx`
SVG-based canvas for scene editing.
- **Props:** `elements`, `selectedId`, `canvasWidth`, `canvasHeight`, `background`, `onSelect`, `onMove`, `onDropNew`
- **Features:** Drag-to-move, drop new elements from library, SVG shape rendering (circle, rect, triangle, hexagon, diamond, star, text)
- **Used in:** `pages/scene-editor.tsx`

### `scenes/SceneChat.tsx`
AI chat for scene editing.
- **Props:** `elements`, `onAction`, `onClose`
- **Features:** Local fallback (wellness palette), add/update/delete actions, suggestion chips
- **Used in:** `pages/scene-editor.tsx`

### `scenes/SceneExport.tsx`
Export scene as standalone HTML or embed code.
- **Props:** `scene: SceneData`
- **Used in:** `pages/scene-editor.tsx`

### `scenes/SceneEnhancer.tsx`
AI-powered scene enhancement panel.
- **Props:** `scene`, `onUpdate`
- **Used in:** `pages/scene-editor.tsx`

### `scenes/WellnessLibrary.tsx`
Library of pre-built wellness-themed elements and templates.
- **Used in:** `pages/scene-editor.tsx`

### `scenes/AnimationPresets.tsx`
Animation preset picker for scene elements.
- **Props:** `onSelect`, `currentPreset`
- **Presets:** gentle-float, gradient-breathe, scale-pulse, fade-in-out, spin-slow, drift
- **Used in:** `pages/scene-editor.tsx`

### `scenes/AnimationTimeline.tsx`
Timeline-based animation editor.
- **Props:** `elements`, `playhead`, `isPlaying`, `onPlayheadChange`, `onPlayToggle`, `onUpdateElement`
- **Used in:** `pages/scene-editor.tsx`

### `scenes/ScrollTriggerConfig.tsx`
GSAP ScrollTrigger configuration panel.
- **Props:** `config: ScrollConfig`, `onChange`, `elementId`
- **Used in:** `pages/scene-editor.tsx`

### `scenes/CommandPalette.tsx`
Keyboard-driven command palette (Cmd/Ctrl+K).
- **Props:** `onCommand`, `elements`
- **Used in:** `pages/scene-editor.tsx`

### `scenes/KeyboardShortcuts.tsx`
Keyboard shortcuts help overlay.
- **Used in:** `pages/scene-editor.tsx`

### `scenes/OnboardingTour.tsx`
First-time user onboarding tour.
- **Props:** `onComplete`
- **Hook:** `useOnboarding()` — manages onboarding state
- **Used in:** `pages/scene-editor.tsx`

### `scenes/VersionHistory.tsx`
Scene snapshot/restore panel.
- **Props:** `snapshots`, `onRestore`, `onCreate`
- **Used in:** `pages/scene-editor.tsx`

### `scenes/SceneEmbedCode.tsx`
Generates embed code for scenes.
- **Props:** `sceneId`
- **Used in:** `pages/scene-editor.tsx`

### `scenes/SendToCursor.tsx`
Send scene to Cursor IDE.
- **Props:** `scene`
- **Used in:** `pages/scene-editor.tsx`

### `scenes/ScrollDebugOverlay.tsx`
Debug overlay for ScrollTrigger markers.
- Uses: `useSceneStore` for `debugOverlay` state
- **Used in:** `pages/scene-editor.tsx`

### `scenes/PerformanceAuditor.tsx`
Scene performance analysis.
- **Props:** `elements`
- **Used in:** `pages/scene-editor.tsx`

### `scenes/InfoTab.tsx`
Scene metadata/info panel.
- **Props:** `scene`
- **Used in:** `pages/scene-editor.tsx`

---

## 3D Studio (Three.js / React Three Fiber)

### `three/ThreeDSection.tsx`
Main 3D canvas wrapper using `@react-three/fiber`.
- **Props:** `sceneConfig: ThreeDSceneConfig`, `onConfigChange`, `isEditing`
- **Features:** Configurable camera, shadows, DPR, antialiasing, editing chrome overlay, text overlay
- **Used in:** 3D scene creation flows

### `three/SceneContent.tsx`
Renders the actual 3D scene from configuration.
- **Props:** `config: ThreeDSceneConfig`
- **Used in:** `ThreeDSection.tsx`

### `three/ThreeDTemplateGallery.tsx`
Gallery of pre-built 3D scene templates.
- **Used in:** 3D scene creation

### `three/ThreeDAssetLibrary.tsx`
3D asset management library.
- **Features:** Upload assets to Supabase storage, browse/manage library
- **Used in:** 3D scene creation

### `three/ThreeDPropertiesPanel.tsx`
Properties panel for 3D objects.
- **Props:** `selectedObject`, `onChange`
- **Used in:** 3D scene creation

### `three/ThreeDTimelineEditor.tsx`
Animation timeline for 3D scenes.
- **Used in:** 3D scene creation

### `three/ThreeDMultiObjectComposer.tsx`
Compose multiple 3D objects in a scene.
- **Used in:** 3D scene creation

### `three/ThreeDPerformanceMonitor.tsx`
3D performance metrics overlay.
- **Used in:** 3D scene creation

### `three/primitives/TypeTool.tsx`
3D text tool.
- **Used in:** 3D scene creation

### `three/primitives/ShapeTool.tsx`
3D shape primitives tool.
- **Used in:** 3D scene creation

### `three/primitives/ObjectTool.tsx`
3D object placement tool.
- **Used in:** 3D scene creation

### `three/primitives/CoverTool.tsx`
Video/image cover tool for 3D surfaces.
- **Used in:** 3D scene creation

### `three/supabaseAssets.ts`
Types and helpers for 3D assets stored in Supabase.
- **Exports:** `SupabaseAsset` type, asset CRUD helpers

---

## Design Extraction

### `design-extract/DesignExtractInput.tsx`
URL/image input for design extraction.
- **Exports:** `Reference` type
- **Features:** URL input, image upload, reference annotations, intent detection
- **Used in:** `pages/DesignExtractPage.tsx`

### `design-extract/ExtractionProgress.tsx`
Progress indicator during extraction.
- **Props:** `status`, `progress`
- **Used in:** `pages/DesignExtractPage.tsx`

### `design-extract/DesignTokenEditor.tsx`
Editor for extracted design tokens.
- **Exports:** `TokenData` type
- **Props:** `tokens`, `onChange`, `onReset`
- **Features:** Edit colors, typography, spacing, radius, shadow, animation, components
- **Used in:** `pages/DesignExtractPage.tsx`

### `design-extract/ColorSwatchEditor.tsx`
Visual color palette editor.
- **Props:** `colors`, `onChange`
- **Used in:** `DesignTokenEditor.tsx`

### `design-extract/TypographyEditor.tsx`
Font and typography editor.
- **Props:** `typography`, `onChange`
- **Used in:** `DesignTokenEditor.tsx`

### `design-extract/SpacingEditor.tsx`
Spacing scale editor.
- **Props:** `spacing`, `onChange`
- **Used in:** `DesignTokenEditor.tsx`

### `design-extract/DesignMdPreview.tsx`
Preview of generated design.md.
- **Props:** `markdown`
- **Used in:** `pages/DesignExtractPage.tsx`

### `design-extract/ExportPanel.tsx`
Multi-format export panel.
- **Props:** `tokens`, `url`
- **Features:** Download as md, tailwind, css, json
- **Used in:** `pages/DesignExtractPage.tsx`

### `design-extract/ExtractionHistory.tsx`
Past extraction history list.
- **Exports:** `ExtractionSummary` type
- **Props:** `history`, `onLoad`
- **Used in:** `pages/DesignExtractPage.tsx`

### `design-extract/ReferenceUploadPanel.tsx`
Upload panel for reference images.
- **Used in:** `DesignExtractInput.tsx`

### `design-extract/ReferenceItem.tsx`
Single reference item display.
- **Used in:** `DesignExtractInput.tsx`

---

## AI

### `AiChatWidget.tsx`
Global floating AI assistant widget.
- **Features:** Gemini API integration, localStorage for API key, model selector, suggestion chips, minimize/maximize
- **Used in:** Available across all pages
- **Models supported:** gemini-2.0-flash, gemini-2.5-flash, gemini-1.5-pro, etc.

---

## Layout

### `layout/Navbar.tsx`
Top navigation bar.
- **Props:** `user`, `onLogout`
- **Used in:** All pages

---

## Global

### `ErrorBoundary.tsx`
React error boundary for graceful error handling.
- **Used in:** `App.tsx` (wraps entire app)

### `theme-provider.tsx`
Theme context provider (light/dark mode).
- **Exports:** `ThemeProvider` component, `useTheme()` hook
- **Used in:** `App.tsx`

---

## UI Primitives (`ui/`)

All standard shadcn/ui components. Each is a composable React component:

| Component | Purpose |
|-----------|---------|
| `accordion.tsx` | Collapsible accordion sections |
| `alert.tsx` | Alert banners with variants |
| `alert-dialog.tsx` | Modal alert dialogs |
| `aspect-ratio.tsx` | Fixed aspect ratio container |
| `avatar.tsx` | User avatar with fallback |
| `badge.tsx` | Status/tag badge |
| `breadcrumb.tsx` | Navigation breadcrumbs |
| `button.tsx` | Button with variants (default, destructive, outline, secondary, ghost, link) |
| `button-group.tsx` | Grouped buttons |
| `calendar.tsx` | Date calendar picker |
| `card.tsx` | Card container with header/content/footer |
| `carousel.tsx` | Carousel/slider |
| `chart.tsx` | Chart wrapping recharts |
| `checkbox.tsx` | Checkbox with label |
| `collapsible.tsx` | Collapsible content section |
| `command.tsx` | Command palette input |
| `context-menu.tsx` | Right-click context menu |
| `dialog.tsx` | Modal dialog |
| `drawer.tsx` | Slide-out drawer |
| `dropdown-menu.tsx` | Dropdown menu |
| `empty.tsx` | Empty state placeholder |
| `field.tsx` | Form field wrapper |
| `form.tsx` | Form with react-hook-form + zod |
| `hover-card.tsx` | Hover card/popover |
| `input.tsx` | Text input |
| `input-group.tsx` | Input with addons |
| `input-otp.tsx` | OTP code input |
| `item.tsx` | Generic list item |
| `kbd.tsx` | Keyboard key display |
| `label.tsx` | Form label |
| `menubar.tsx` | Menu bar |
| `navigation-menu.tsx` | Navigation menu |
| `pagination.tsx` | Pagination controls |
| `popover.tsx` | Popover overlay |
| `progress.tsx` | Progress bar |
| `radio-group.tsx` | Radio button group |
| `resizable.tsx` | Resizable panel (panelsplitter) |
| `scroll-area.tsx` | Custom scrollable area |
| `select.tsx` | Select dropdown |
| `separator.tsx` | Visual separator |
| `sheet.tsx` | Bottom/side sheet |
| `sidebar.tsx` | Sidebar with collapsible states |
| `skeleton.tsx` | Loading skeleton placeholder |
| `slider.tsx` | Range slider |
| `sonner.tsx` | Sonner toast integration |
| `spinner.tsx` | Loading spinner |
| `switch.tsx` | Toggle switch |
| `table.tsx` | Data table |
| `tabs.tsx` | Tab navigation |
| `textarea.tsx` | Multi-line text input |
| `toast.tsx` | Toast notification |
| `toaster.tsx` | Toast container |
| `toggle.tsx` | Toggle button |
| `toggle-group.tsx` | Toggle button group |
| `tooltip.tsx` | Tooltip overlay |
