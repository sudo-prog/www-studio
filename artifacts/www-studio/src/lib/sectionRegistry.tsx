/**
 * Section Registry — maps section type strings to their components.
 *
 * The 3D Studio module registers the '3d-scene' type here.
 * Stub components are replaced with full implementations in Phase 1+.
 */

import type { ComponentType } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SectionComponentProps {
  sceneConfig: import("@/types/three").ThreeDSceneConfig;
  onConfigChange: (config: Partial<import("@/types/three").ThreeDSceneConfig>) => void;
  isEditing?: boolean;
}

export interface PropertiesPanelProps {
  sceneConfig: import("@/types/three").ThreeDSceneConfig;
  onConfigChange: (config: Partial<import("@/types/three").ThreeDSceneConfig>) => void;
}

export interface SectionEntry {
  type: string;
  label: string;
  description: string;
  icon: string;
  SectionComponent: ComponentType<SectionComponentProps>;
  PropertiesPanel: ComponentType<PropertiesPanelProps>;
}

// ── Stub Components ───────────────────────────────────────────────────────────

function ThreeDSectionStub({ sceneConfig }: SectionComponentProps) {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px] bg-gradient-to-br from-[#0a0a0f] to-[#12121a] rounded-lg border border-border/50">
      <div className="text-center space-y-3 p-8">
        <div className="text-4xl">🎬</div>
        <h3 className="text-lg font-semibold text-foreground">
          3D Studio — {sceneConfig.name || "Untitled"}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          3D scene editor coming soon. Add objects, materials, lighting, and
          animations with the full React Three Fiber pipeline.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
          <span className="px-2 py-0.5 bg-muted rounded">Phase 0</span>
          <span>•</span>
          <span>Stub Component</span>
        </div>
      </div>
    </div>
  );
}

function ThreeDPropertiesPanelStub({ sceneConfig, onConfigChange }: PropertiesPanelProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-foreground">3D Scene Properties</h3>
        <p className="text-xs text-muted-foreground">
          Configure your 3D scene. Full 12-tab panel coming in Phase 9.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Scene Name</label>
          <input
            type="text"
            value={sceneConfig.name}
            onChange={(e) => onConfigChange({ name: e.target.value })}
            className="w-full px-3 py-1.5 text-sm bg-muted rounded border border-border text-foreground"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Environment</label>
          <select
            value={sceneConfig.envPreset}
            onChange={(e) =>
              onConfigChange({
                envPreset: e.target.value as import("@/types/three").EnvPreset,
              })
            }
            className="w-full px-3 py-1.5 text-sm bg-muted rounded border border-border text-foreground"
          >
            <option value="studio">Studio</option>
            <option value="city">City</option>
            <option value="sunset">Sunset</option>
            <option value="dawn">Dawn</option>
            <option value="night">Night</option>
            <option value="warehouse">Warehouse</option>
            <option value="forest">Forest</option>
            <option value="apartment">Apartment</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Status</label>
          <div className="flex gap-2">
            <button
              onClick={() => onConfigChange({ status: "draft" })}
              className={`flex-1 px-3 py-1.5 text-xs rounded border ${
                sceneConfig.status === "draft"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              Draft
            </button>
            <button
              onClick={() => onConfigChange({ status: "published" })}
              className={`flex-1 px-3 py-1.5 text-xs rounded border ${
                sceneConfig.status === "published"
                  ? "border-green-500 bg-green-500/10 text-green-400"
                  : "border-border text-muted-foreground"
              }`}
            >
              Published
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <p className="text-[10px] text-muted-foreground/50 text-center">
          Phase 0 stub — full panel in Phase 9
        </p>
      </div>
    </div>
  );
}

// ── Registry ──────────────────────────────────────────────────────────────────

const sectionRegistry: Map<string, SectionEntry> = new Map();

// Register built-in section types
sectionRegistry.set("3d-scene", {
  type: "3d-scene",
  label: "3D Scene",
  description: "Interactive 3D scene with React Three Fiber",
  icon: "🎬",
  SectionComponent: ThreeDSectionStub,
  PropertiesPanel: ThreeDPropertiesPanelStub,
});

// ── Public API ────────────────────────────────────────────────────────────────

export function getSectionEntry(type: string): SectionEntry | undefined {
  return sectionRegistry.get(type);
}

export function getAllSections(): SectionEntry[] {
  return Array.from(sectionRegistry.values());
}

export function registerSection(entry: SectionEntry): void {
  sectionRegistry.set(entry.type, entry);
}

export function hasSection(type: string): boolean {
  return sectionRegistry.has(type);
}

export default sectionRegistry;
