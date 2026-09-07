// ─── registryMap.ts ─────────────────────────────────────────────────────────
// Maps named component exports (e.g. 'RareUIAnimatedCounter') to their
// actual React component implementations. This is the single source of truth
// for the live component registry.
//
// To add a new component:
//   1. Place the source file in src/components/registry/rare-ui/
//   2. Add it to this map
//   3. Add a corresponding entry in component-library.ts with kind='react'
//      and component='RareUI{name}'
import * as React from 'react';

export type RegistryMap = {
  // RareUI components
  RareUIAnimatedCounter: React.ComponentType<Record<string, unknown>>;
  RareUIBounceSidebar: React.ComponentType<Record<string, unknown>>;
  RareUICodeBlock: React.ComponentType<Record<string, unknown>>;
  RareUIDeleteButton: React.ComponentType<Record<string, unknown>>;
  RareUIDurationPicker: React.ComponentType<Record<string, unknown>>;
  RareUIEmojiReaction: React.ComponentType<Record<string, unknown>>;
  RareUIFamilyDrawer: React.ComponentType<Record<string, unknown>>;
  RareUIFluidOrb: React.ComponentType<Record<string, unknown>>;
  RareUIFolderComponent: React.ComponentType<Record<string, unknown>>;
  RareUIGithubActivity: React.ComponentType<Record<string, unknown>>;
  RareUIGooeyNav: React.ComponentType<Record<string, unknown>>;
  RareUIGravityLetters: React.ComponentType<Record<string, unknown>>;
  RareUIGridReveal: React.ComponentType<Record<string, unknown>>;
  RareUIHookSidebar: React.ComponentType<Record<string, unknown>>;
  RareUINotificationBell: React.ComponentType<Record<string, unknown>>;
  RareUIOtpInput: React.ComponentType<Record<string, unknown>>;
  RareUIProximitySidebar: React.ComponentType<Record<string, unknown>>;
  RareUIScrollProgress: React.ComponentType<Record<string, unknown>>;
  RareUIStepPlayer: React.ComponentType<Record<string, unknown>>;
};

type ComponentName = keyof RegistryMap;

// Lazy component registry — loaded only when a component is actually requested.
const componentCache = new Map<ComponentName, React.ComponentType<Record<string, unknown>>>();

// ── RareUI components ──────────────────────────────────────────────────────
const RareUIAnimatedCounter = React.lazy(() =>
  import('./rare-ui/animated-counter').then(m => ({ default: m.AnimatedCounter as React.ComponentType<Record<string, unknown>> }))
);
const RareUIBounceSidebar = React.lazy(() =>
  import('./rare-ui/bounce-sidebar').then(m => ({ default: m.BounceSidebar as React.ComponentType<Record<string, unknown>> }))
);
const RareUICodeBlock = React.lazy(() =>
  import('./rare-ui/code-block').then(m => ({ default: m.CodeBlock as React.ComponentType<Record<string, unknown>> }))
);
const RareUIDeleteButton = React.lazy(() =>
  import('./rare-ui/delete-button').then(m => ({ default: m.DeleteButton as React.ComponentType<Record<string, unknown>> }))
);
const RareUIDurationPicker = React.lazy(() =>
  import('./rare-ui/duration-picker').then(m => ({ default: m.DurationPicker as React.ComponentType<Record<string, unknown>> }))
);
const RareUIEmojiReaction = React.lazy(() =>
  import('./rare-ui/emoji-reaction').then(m => ({ default: m.EmojiReaction as React.ComponentType<Record<string, unknown>> }))
);
const RareUIFamilyDrawer = React.lazy(() =>
  import('./rare-ui/family-drawer').then(m => ({ default: m.default as unknown as React.ComponentType<Record<string, unknown>> }))
);
const RareUIFluidOrb = React.lazy(() =>
  import('./rare-ui/fluid-orb').then(m => ({ default: m.FluidOrb as React.ComponentType<Record<string, unknown>> }))
);
const RareUIFolderComponent = React.lazy(() =>
  import('./rare-ui/folder-component').then(m => ({ default: m.FolderComponent as React.ComponentType<Record<string, unknown>> }))
);
const RareUIGithubActivity = React.lazy(() =>
  import('./rare-ui/github-activity').then(m => ({ default: m.RareUIGitHubActivity as React.ComponentType<Record<string, unknown>> }))
);
const RareUIGooeyNav = React.lazy(() =>
  import('./rare-ui/gooey-nav').then(m => ({ default: m.GooeyNav as React.ComponentType<Record<string, unknown>> }))
);
const RareUIGravityLetters = React.lazy(() =>
  import('./rare-ui/gravity-letters').then(m => ({ default: m.GravityLetters as React.ComponentType<Record<string, unknown>> }))
);
const RareUIGridReveal = React.lazy(() =>
  import('./rare-ui/grid-reveal').then(m => ({ default: m.GridReveal as React.ComponentType<Record<string, unknown>> }))
);
const RareUIHookSidebar = React.lazy(() =>
  import('./rare-ui/hook-sidebar').then(m => ({ default: m.HookSidebar as React.ComponentType<Record<string, unknown>> }))
);
const RareUINotificationBell = React.lazy(() =>
  import('./rare-ui/notification-bell').then(m => ({ default: m.NotificationBell as React.ComponentType<Record<string, unknown>> }))
);
const RareUIOtpInput = React.lazy(() =>
  import('./rare-ui/otp-input').then(m => ({ default: m.OtpInput as React.ComponentType<Record<string, unknown>> }))
);
const RareUIProximitySidebar = React.lazy(() =>
  import('./rare-ui/proximity-sidebar').then(m => ({ default: m.ProximitySidebar as React.ComponentType<Record<string, unknown>> }))
);
const RareUIScrollProgress = React.lazy(() =>
  import('./rare-ui/scroll-progress').then(m => ({ default: m.ScrollProgress as React.ComponentType<Record<string, unknown>> }))
);
const RareUIStepPlayer = React.lazy(() =>
  import('./rare-ui/step-player').then(m => ({ default: m.StepPlayer as React.ComponentType<Record<string, unknown>> }))
);

const REGISTRY: Partial<RegistryMap> = {
  RareUIAnimatedCounter,
  RareUIBounceSidebar,
  RareUICodeBlock,
  RareUIDeleteButton,
  RareUIDurationPicker,
  RareUIEmojiReaction,
  RareUIFamilyDrawer,
  RareUIFluidOrb,
  RareUIFolderComponent,
  RareUIGithubActivity,
  RareUIGooeyNav,
  RareUIGravityLetters,
  RareUIGridReveal,
  RareUIHookSidebar,
  RareUINotificationBell,
  RareUIOtpInput,
  RareUIProximitySidebar,
  RareUIScrollProgress,
  RareUIStepPlayer,
};

/**
 * Resolve a named component export to its lazy component.
 * Returns undefined if the component name is not in the registry.
 */
export function getRegistryComponent(name: ComponentName): React.ComponentType<Record<string, unknown>> | undefined {
  return REGISTRY[name];
}

/**
 * Returns all registered component names (for discovery/debugging).
 */
export function getRegistryNames(): string[] {
  return Object.keys(REGISTRY);
}
