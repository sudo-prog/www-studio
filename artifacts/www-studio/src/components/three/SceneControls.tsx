/**
 * SceneControls — 3D scene control panel overlay.
 *
 * Floating UI panel for controlling 3D scene settings:
 * - Grid visibility toggle
 * - Wireframe mode toggle
 * - Environment preset selector
 * - Background color picker
 * - Camera reset button
 */

import React, { useState, useCallback } from 'react';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { ThreeDSceneConfig, EnvPreset } from '@/types/three';

// ── Types ────────────────────────────────────────────────────────────────────

export interface SceneControlsProps {
  /** Current scene config */
  config: ThreeDSceneConfig;
  /** Callback when config changes */
  onConfigChange: (config: Partial<ThreeDSceneConfig>) => void;
  /** Whether the panel is collapsed */
  collapsed?: boolean;
  /** Additional className for the panel */
  className?: string;
}

// ── Environment Presets ──────────────────────────────────────────────────────

const ENV_PRESETS: { value: EnvPreset | string; label: string; icon: string }[] = [
  { value: 'sunset', label: 'Sunset', icon: '🌅' },
  { value: 'dawn', label: 'Dawn', icon: '🌄' },
  { value: 'night', label: 'Night', icon: '🌙' },
  { value: 'warehouse', label: 'Warehouse', icon: '🏭' },
  { value: 'forest', label: 'Forest', icon: '🌲' },
  { value: 'apartment', label: 'Apartment', icon: '🏠' },
  { value: 'studio', label: 'Studio', icon: '💡' },
  { value: 'city', label: 'City', icon: '🏙️' },
  { value: 'park', label: 'Park', icon: '🌳' },
  { value: 'lobby', label: 'Lobby', icon: '🏢' },
];

// ── Toggle Button ────────────────────────────────────────────────────────────

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-xs text-zinc-300 group-hover:text-white transition-colors">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors ${
          checked ? 'bg-indigo-500' : 'bg-zinc-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function SceneControls({
  config,
  onConfigChange,
  collapsed = false,
  className = '',
}: SceneControlsProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const controlsRef = React.useRef<OrbitControlsImpl>(null);

  const handleGridToggle = useCallback(
    (enabled: boolean) => {
      onConfigChange({
        settings: { ...config.settings, gridEnabled: enabled },
      });
    },
    [config.settings, onConfigChange]
  );

  const handleWireframeToggle = useCallback(
    (_enabled: boolean) => {
      // Wireframe mode is handled by parent via globalShader override
      onConfigChange({
        globalShader: {
          ...config.globalShader,
          wireframe: _enabled,
        },
      });
    },
    [config.globalShader, onConfigChange]
  );

  const handleEnvPreset = useCallback(
    (preset: string) => {
      onConfigChange({ envPreset: preset as EnvPreset });
    },
    [onConfigChange]
  );

  const handleBgColor = useCallback(
    (color: string) => {
      onConfigChange({
        settings: { ...config.settings, backgroundColor: color },
      });
    },
    [config.settings, onConfigChange]
  );

  const handleCameraReset = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, []);

  return (
    <>
      {/* OrbitControls with ref for camera reset */}
      <OrbitControls ref={controlsRef} />

      {/* Floating Panel */}
      <div
        className={`absolute top-3 right-3 z-10 ${className}`}
        style={{ pointerEvents: 'auto' }}
      >
        {/* Toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mb-2 ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/90 backdrop-blur-md border border-zinc-700/50 rounded-lg text-xs text-zinc-300 hover:text-white hover:border-zinc-600 transition-all"
        >
          <span className="text-sm">⚙</span>
          <span>{isCollapsed ? 'Show Controls' : 'Hide Controls'}</span>
        </button>

        {/* Panel */}
        {!isCollapsed && (
          <div className="w-64 bg-zinc-900/90 backdrop-blur-md border border-zinc-700/50 rounded-xl p-4 space-y-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-700/50">
              <span className="text-sm">🎮</span>
              <h3 className="text-sm font-semibold text-white">Scene Controls</h3>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <Toggle
                label="Show Grid"
                checked={config.settings.gridEnabled}
                onChange={handleGridToggle}
              />
              <Toggle
                label="Wireframe Mode"
                checked={config.globalShader?.wireframe ?? false}
                onChange={handleWireframeToggle}
              />
            </div>

            {/* Environment Preset */}
            <div>
              <label className="text-xs text-zinc-400 mb-2 block">
                Environment
              </label>
              <div className="grid grid-cols-2 gap-1">
                {ENV_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handleEnvPreset(preset.value)}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-xs transition-all ${
                      config.envPreset === preset.value
                        ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-500/50'
                        : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60 border border-transparent'
                    }`}
                  >
                    <span className="text-xs">{preset.icon}</span>
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="text-xs text-zinc-400 mb-2 block">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.settings.backgroundColor}
                  onChange={(e) => handleBgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-zinc-600 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={config.settings.backgroundColor}
                  onChange={(e) => handleBgColor(e.target.value)}
                  className="flex-1 px-2 py-1.5 bg-zinc-800/60 border border-zinc-700 rounded-md text-xs text-zinc-300 font-mono"
                />
              </div>
            </div>

            {/* Camera Reset */}
            <button
              onClick={handleCameraReset}
              className="w-full px-3 py-2 bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700/50 rounded-lg text-xs text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span>📷</span>
              <span>Reset Camera</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
