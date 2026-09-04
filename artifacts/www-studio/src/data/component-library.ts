export interface ComponentItem {
  id: string;
  name: string;
  category: string;
  tags: string[];
  code: string;
  /** Optional external source URL (for catalog-only entries without runnable code). */
  sourceUrl?: string;
  /** Optional longer description for catalog-only entries. */
  description?: string;
}

import componentsJsonCatalog from "./components-json-catalog.json";

export const CATEGORIES = [
  "All",
  "3D",
  "Animation",
  "Backgrounds",
  "Badges",
  "Buttons",
  "Cards",
  "Effects",
  "Forms",
  "Inputs",
  "Loading UI",
  "Modals",
  "Navigation",
  "Shaders",
  "Tooltips",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const COMPONENT_LIBRARY: ComponentItem[] = [
  // ─────────── LOADING UI ───────────
  {
    id: "spinner-ring",
    name: "Ring Spinner",
    category: "Loading UI",
    tags: ["spinner", "loading", "animated"],
    code: `<div class="flex items-center justify-center">
  <div class="w-10 h-10 rounded-full border-4 border-zinc-700 border-t-blue-500 animate-spin"></div>
</div>`,
  },
  {
    id: "spinner-dots",
    name: "Bouncing Dots",
    category: "Loading UI",
    tags: ["dots", "loading", "animated"],
    code: `<div class="flex items-center gap-1.5">
  <div class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]"></div>
  <div class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]"></div>
  <div class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce"></div>
</div>`,
  },
  {
    id: "skeleton-card",
    name: "Skeleton Card",
    category: "Loading UI",
    tags: ["skeleton", "loading", "placeholder"],
    code: `<div class="w-64 rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-3 animate-pulse">
  <div class="h-32 w-full rounded-xl bg-zinc-800"></div>
  <div class="h-4 w-3/4 rounded bg-zinc-800"></div>
  <div class="h-3 w-1/2 rounded bg-zinc-800"></div>
  <div class="flex gap-2 pt-1">
    <div class="h-8 w-20 rounded-lg bg-zinc-800"></div>
    <div class="h-8 w-20 rounded-lg bg-zinc-800"></div>
  </div>
</div>`,
  },
  {
    id: "progress-bar",
    name: "Gradient Progress Bar",
    category: "Loading UI",
    tags: ["progress", "bar", "loading"],
    code: `<div class="w-64 space-y-2">
  <div class="flex justify-between text-xs text-zinc-400 mb-1">
    <span>Uploading...</span>
    <span>72%</span>
  </div>
  <div class="h-2 w-full rounded-full bg-zinc-800">
    <div class="h-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all" style="width:72%"></div>
  </div>
</div>`,
  },
  {
    id: "pulse-circle",
    name: "Pulse Indicator",
    category: "Loading UI",
    tags: ["pulse", "indicator", "status", "animated"],
    code: `<div class="flex items-center gap-3">
  <span class="relative flex h-3 w-3">
    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
    <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
  </span>
  <span class="text-sm text-zinc-300">System Online</span>
</div>`,
  },
  {
    id: "shimmer-text",
    name: "Shimmer Text",
    category: "Loading UI",
    tags: ["shimmer", "loading", "text", "animated"],
    code: `<p class="text-2xl font-bold bg-gradient-to-r from-zinc-700 via-zinc-400 to-zinc-700 bg-[length:200%_100%] bg-clip-text text-transparent animate-[shimmer_1.5s_linear_infinite]">
  Loading your content...
</p>
<style>
  @keyframes shimmer { to { background-position: -200% center; } }
</style>`,
  },

  // ─────────── BUTTONS ───────────
  {
    id: "btn-gradient",
    name: "Gradient Button",
    category: "Buttons",
    tags: ["button", "gradient", "animated"],
    code: `<button class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold text-sm hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
  Get Started
</button>`,
  },
  {
    id: "btn-glow",
    name: "Glow Button",
    category: "Buttons",
    tags: ["button", "glow", "animated", "neon"],
    code: `<button class="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] active:scale-95">
  ✨ Launch App
</button>`,
  },
  {
    id: "btn-glass",
    name: "Glassmorphism Button",
    category: "Buttons",
    tags: ["button", "glass", "glassmorphism"],
    code: `<button class="px-6 py-2.5 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-all active:scale-95">
  Learn More
</button>`,
  },
  {
    id: "btn-3d",
    name: "3D Push Button",
    category: "Buttons",
    tags: ["button", "3d", "interactive"],
    code: `<button class="px-6 py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-sm border-b-4 border-violet-800 hover:border-b-2 hover:translate-y-0.5 transition-all active:border-b-0 active:translate-y-1">
  Click Me
</button>`,
  },
  {
    id: "btn-outline-animated",
    name: "Animated Outline Button",
    category: "Buttons",
    tags: ["button", "outline", "animated", "border"],
    code: `<button class="relative px-6 py-2.5 rounded-xl text-white font-semibold text-sm group overflow-hidden border border-zinc-600 hover:border-blue-500 transition-colors">
  <span class="relative z-10">View Docs</span>
  <span class="absolute inset-0 bg-blue-500/10 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
</button>`,
  },
  {
    id: "btn-icon",
    name: "Icon Button Group",
    category: "Buttons",
    tags: ["button", "icon", "group"],
    code: `<div class="inline-flex rounded-xl border border-zinc-700 overflow-hidden">
  <button class="px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border-r border-zinc-700">Edit</button>
  <button class="px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border-r border-zinc-700">Clone</button>
  <button class="px-4 py-2 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-colors">Delete</button>
</div>`,
  },

  // ─────────── CARDS ───────────
  {
    id: "card-glass",
    name: "Glassmorphism Card",
    category: "Cards",
    tags: ["card", "glass", "glassmorphism", "blur"],
    code: `<div class="w-64 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-6 shadow-xl">
  <div class="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
    <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
  </div>
  <h3 class="text-white font-semibold mb-1">Fast Deploy</h3>
  <p class="text-zinc-400 text-sm">Ship to production in seconds with zero config needed.</p>
</div>`,
  },
  {
    id: "card-stats",
    name: "Stats Card",
    category: "Cards",
    tags: ["card", "stats", "metric", "dashboard"],
    code: `<div class="w-56 rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
  <div class="flex items-center justify-between mb-3">
    <span class="text-xs text-zinc-500 uppercase tracking-widest">Revenue</span>
    <span class="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">+12.5%</span>
  </div>
  <p class="text-3xl font-bold text-white mb-1">$48,295</p>
  <p class="text-xs text-zinc-500">vs $42,900 last month</p>
</div>`,
  },
  {
    id: "card-pricing",
    name: "Pricing Card",
    category: "Cards",
    tags: ["card", "pricing", "plan", "saas"],
    code: `<div class="w-60 rounded-2xl bg-gradient-to-b from-blue-950 to-zinc-900 border border-blue-800/50 p-6">
  <span class="text-xs font-semibold text-blue-400 uppercase tracking-wider">Pro</span>
  <div class="my-3">
    <span class="text-4xl font-bold text-white">$29</span>
    <span class="text-zinc-400 text-sm">/mo</span>
  </div>
  <ul class="space-y-2 mb-5 text-sm text-zinc-300">
    <li class="flex items-center gap-2"><span class="text-blue-400">✓</span> Unlimited projects</li>
    <li class="flex items-center gap-2"><span class="text-blue-400">✓</span> Custom domains</li>
    <li class="flex items-center gap-2"><span class="text-blue-400">✓</span> Priority support</li>
  </ul>
  <button class="w-full py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors">Get Pro</button>
</div>`,
  },
  {
    id: "card-testimonial",
    name: "Testimonial Card",
    category: "Cards",
    tags: ["card", "testimonial", "review", "quote"],
    code: `<div class="w-72 rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
  <div class="flex mb-3">
    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
    <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
  </div>
  <p class="text-zinc-300 text-sm mb-4">"This tool saved us weeks of development time. Absolutely incredible."</p>
  <div class="flex items-center gap-3">
    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">JD</div>
    <div>
      <p class="text-white text-sm font-medium">Jane Doe</p>
      <p class="text-zinc-500 text-xs">CTO @ Acme Inc</p>
    </div>
  </div>
</div>`,
  },
  {
    id: "card-feature",
    name: "Feature Card with Icon",
    category: "Cards",
    tags: ["card", "feature", "icon", "landing"],
    code: `<div class="w-64 rounded-2xl bg-zinc-900 border border-zinc-800 p-6 group hover:border-violet-500/50 transition-colors">
  <div class="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
    <svg class="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
  </div>
  <h3 class="text-white font-semibold mb-2">Secure by Default</h3>
  <p class="text-zinc-400 text-sm leading-relaxed">End-to-end encryption with zero-knowledge architecture ensures your data stays yours.</p>
</div>`,
  },

  // ─────────── FORMS ───────────
  {
    id: "form-input-float",
    name: "Floating Label Input",
    category: "Forms",
    tags: ["form", "input", "label", "animated"],
    code: `<div class="relative w-64">
  <input id="email" type="email" placeholder=" " class="peer w-full px-4 pt-5 pb-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm outline-none focus:border-blue-500 transition-colors"/>
  <label for="email" class="absolute left-4 top-3.5 text-zinc-500 text-sm transition-all peer-placeholder-shown:top-3.5 peer-focus:-top-0 peer-focus:text-xs peer-focus:text-blue-400 peer-[&:not(:placeholder-shown)]:-top-0 peer-[&:not(:placeholder-shown)]:text-xs">Email address</label>
</div>`,
  },
  {
    id: "form-toggle",
    name: "Custom Toggle Switch",
    category: "Forms",
    tags: ["form", "toggle", "switch", "checkbox"],
    code: `<label class="flex items-center gap-3 cursor-pointer w-fit">
  <div class="relative">
    <input type="checkbox" class="sr-only peer" checked/>
    <div class="w-11 h-6 bg-zinc-700 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
    <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
  </div>
  <span class="text-sm text-zinc-300">Enable notifications</span>
</label>`,
  },
  {
    id: "form-search",
    name: "Search Input",
    category: "Forms",
    tags: ["form", "search", "input", "icon"],
    code: `<div class="relative w-64">
  <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
  <input type="search" placeholder="Search components..." class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"/>
  <kbd class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 border border-zinc-700 rounded px-1.5 py-0.5">⌘K</kbd>
</div>`,
  },
  {
    id: "form-select",
    name: "Styled Select",
    category: "Forms",
    tags: ["form", "select", "dropdown"],
    code: `<div class="relative w-56">
  <select class="w-full appearance-none px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer">
    <option>React + Tailwind</option>
    <option>Vue + Tailwind</option>
    <option>Svelte + Tailwind</option>
    <option>Vanilla HTML</option>
  </select>
  <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
</div>`,
  },
  {
    id: "form-otp",
    name: "OTP Input",
    category: "Forms",
    tags: ["form", "otp", "code", "verification"],
    code: `<div class="flex gap-2">
  <input maxlength="1" type="text" class="w-12 h-12 text-center text-lg font-semibold rounded-xl bg-zinc-900 border-2 border-zinc-700 text-white focus:border-blue-500 focus:outline-none transition-colors" value="4"/>
  <input maxlength="1" type="text" class="w-12 h-12 text-center text-lg font-semibold rounded-xl bg-zinc-900 border-2 border-zinc-700 text-white focus:border-blue-500 focus:outline-none transition-colors" value="2"/>
  <input maxlength="1" type="text" class="w-12 h-12 text-center text-lg font-semibold rounded-xl bg-zinc-900 border-2 border-blue-500 text-white focus:border-blue-500 focus:outline-none transition-colors"/>
  <input maxlength="1" type="text" class="w-12 h-12 text-center text-lg font-semibold rounded-xl bg-zinc-900 border-2 border-zinc-700 text-white focus:border-blue-500 focus:outline-none transition-colors"/>
</div>`,
  },

  // ─────────── TOOLTIPS ───────────
  {
    id: "tooltip-dark",
    name: "Dark Tooltip",
    category: "Tooltips",
    tags: ["tooltip", "dark", "hover"],
    code: `<div class="relative inline-block group">
  <button class="px-4 py-2 rounded-lg bg-zinc-800 text-white text-sm hover:bg-zinc-700 transition-colors">Hover me</button>
  <div class="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-zinc-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
    Helpful tooltip text
    <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-700"></div>
  </div>
</div>`,
  },
  {
    id: "tooltip-colored",
    name: "Colored Tooltip",
    category: "Tooltips",
    tags: ["tooltip", "color", "info"],
    code: `<div class="relative inline-block group">
  <button class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 transition-colors">Info tooltip</button>
  <div class="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
    Powered by AI ✨
    <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-blue-600"></div>
  </div>
</div>`,
  },
  {
    id: "tooltip-left",
    name: "Side Tooltip",
    category: "Tooltips",
    tags: ["tooltip", "side", "left"],
    code: `<div class="relative inline-flex items-center group">
  <button class="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  </button>
  <div class="absolute left-10 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-zinc-700 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
    More information here
    <div class="absolute top-1/2 right-full -translate-y-1/2 border-4 border-transparent border-r-zinc-700"></div>
  </div>
</div>`,
  },

  // ─────────── NAVIGATION ───────────
  {
    id: "nav-pills",
    name: "Pill Tabs",
    category: "Navigation",
    tags: ["navigation", "tabs", "pills", "active"],
    code: `<div class="inline-flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
  <button class="px-4 py-1.5 rounded-lg bg-zinc-700 text-white text-sm font-medium">Overview</button>
  <button class="px-4 py-1.5 rounded-lg text-zinc-400 text-sm font-medium hover:text-white transition-colors">Analytics</button>
  <button class="px-4 py-1.5 rounded-lg text-zinc-400 text-sm font-medium hover:text-white transition-colors">Reports</button>
  <button class="px-4 py-1.5 rounded-lg text-zinc-400 text-sm font-medium hover:text-white transition-colors">Settings</button>
</div>`,
  },
  {
    id: "nav-breadcrumb",
    name: "Breadcrumb",
    category: "Navigation",
    tags: ["navigation", "breadcrumb", "path"],
    code: `<nav class="flex items-center gap-1.5 text-sm">
  <a href="#" class="text-zinc-500 hover:text-white transition-colors">Home</a>
  <svg class="w-3 h-3 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
  <a href="#" class="text-zinc-500 hover:text-white transition-colors">Projects</a>
  <svg class="w-3 h-3 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
  <span class="text-white font-medium">Editor</span>
</nav>`,
  },
  {
    id: "nav-sidebar-mini",
    name: "Mini Sidebar",
    category: "Navigation",
    tags: ["navigation", "sidebar", "icons", "vertical"],
    code: `<div class="flex flex-col gap-1 w-14 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 py-3">
  <button class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white mx-auto"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg></button>
  <button class="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 mx-auto transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg></button>
  <button class="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 mx-auto transition-colors"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg></button>
</div>`,
  },

  // ─────────── BADGES ───────────
  {
    id: "badge-status",
    name: "Status Badges",
    category: "Badges",
    tags: ["badge", "status", "pill"],
    code: `<div class="flex flex-wrap gap-2">
  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
    <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>Active
  </span>
  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
    <span class="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>Pending
  </span>
  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
    <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span>Failed
  </span>
  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
    <span class="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>Archived
  </span>
</div>`,
  },
  {
    id: "badge-gradient",
    name: "Gradient Badges",
    category: "Badges",
    tags: ["badge", "gradient", "colorful"],
    code: `<div class="flex flex-wrap gap-2">
  <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-violet-600 text-white">New</span>
  <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-rose-600 to-pink-600 text-white">Hot</span>
  <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white">Sale</span>
  <span class="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white">Free</span>
</div>`,
  },

  // ─────────── MODALS ───────────
  {
    id: "modal-confirm",
    name: "Confirm Dialog",
    category: "Modals",
    tags: ["modal", "dialog", "confirm", "alert"],
    code: `<div class="w-80 rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
  <div class="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
    <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
  </div>
  <h3 class="text-white font-semibold mb-1">Delete project?</h3>
  <p class="text-zinc-400 text-sm mb-5">This action cannot be undone. All files will be permanently removed.</p>
  <div class="flex gap-3">
    <button class="flex-1 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800 transition-colors">Cancel</button>
    <button class="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors">Delete</button>
  </div>
</div>`,
  },
  {
    id: "modal-notification",
    name: "Notification Toast",
    category: "Modals",
    tags: ["toast", "notification", "alert", "success"],
    code: `<div class="w-72 rounded-xl bg-zinc-900 border border-zinc-800 p-4 flex items-start gap-3 shadow-xl">
  <div class="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
    <svg class="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
  </div>
  <div class="flex-1">
    <p class="text-white text-sm font-medium">Changes saved!</p>
    <p class="text-zinc-400 text-xs mt-0.5">Your project has been updated.</p>
  </div>
  <button class="text-zinc-500 hover:text-white transition-colors">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
  </button>
</div>`,
  },
  // ─────────── NEW HAND-CRAFTED COMPONENTS ───────────
  {
    id: "loader-wave-bars",
    name: "Wave Bars Loader",
    category: "Loading UI",
    tags: ["loader", "wave", "animated", "bars"],
    code: `<div class="flex items-end gap-1 h-10">
  <div class="w-1.5 bg-blue-500 rounded-full animate-[wave_1s_ease-in-out_infinite]" style="height:100%;animation-delay:-1.2s"></div>
  <div class="w-1.5 bg-blue-500 rounded-full animate-[wave_1s_ease-in-out_infinite]" style="height:100%;animation-delay:-1.1s"></div>
  <div class="w-1.5 bg-blue-500 rounded-full animate-[wave_1s_ease-in-out_infinite]" style="height:100%;animation-delay:-1.0s"></div>
  <div class="w-1.5 bg-blue-500 rounded-full animate-[wave_1s_ease-in-out_infinite]" style="height:100%;animation-delay:-0.9s"></div>
  <div class="w-1.5 bg-blue-500 rounded-full animate-[wave_1s_ease-in-out_infinite]" style="height:100%;animation-delay:-0.8s"></div>
</div>
<style>@keyframes wave{0%,100%{height:10%}50%{height:100%}}</style>`,
  },
  {
    id: "loader-orbit-dots",
    name: "Orbit Dots",
    category: "Loading UI",
    tags: ["loader", "orbit", "rotating", "dots"],
    code: `<div class="relative w-12 h-12">
  <div class="absolute inset-0 animate-spin">
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-500"></div>
    <div class="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-500"></div>
    <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-pink-500"></div>
    <div class="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500"></div>
  </div>
  <div class="absolute inset-3 rounded-full bg-zinc-900 border border-zinc-700"></div>
</div>`,
  },
  {
    id: "loader-progress-bar",
    name: "Indeterminate Progress",
    category: "Loading UI",
    tags: ["progress", "bar", "indeterminate"],
    code: `<div class="w-64 h-1 bg-zinc-800 rounded-full overflow-hidden">
  <div class="h-full w-1/3 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full animate-[indeterminate_1.5s_ease-in-out_infinite]"></div>
</div>
<style>@keyframes indeterminate{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}</style>`,
  },
  {
    id: "loader-pulse-circle",
    name: "Pulse Circle",
    category: "Loading UI",
    tags: ["pulse", "loader", "minimal"],
    code: `<div class="relative w-12 h-12">
  <div class="absolute inset-0 rounded-full bg-blue-500/30 animate-ping"></div>
  <div class="absolute inset-2 rounded-full bg-blue-500 animate-pulse"></div>
</div>`,
  },
  {
    id: "button-shimmer",
    name: "Shimmer Button",
    category: "Buttons",
    tags: ["button", "shimmer", "shiny", "animated"],
    code: `<button class="relative overflow-hidden px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-medium">
  <span class="relative z-10">Shimmer Button</span>
  <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
</button>
<style>@keyframes shimmer{100%{transform:translateX(200%)}}</style>`,
  },
  {
    id: "button-ripple",
    name: "Ripple Effect Button",
    category: "Buttons",
    tags: ["button", "ripple", "click", "material"],
    code: `<button class="relative overflow-hidden px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors">
  Click Me
  <span class="absolute inset-0 rounded-xl bg-white/20 opacity-0 hover:opacity-100 transition-opacity"></span>
</button>`,
  },
  {
    id: "button-gradient-border",
    name: "Gradient Border Button",
    category: "Buttons",
    tags: ["button", "gradient", "border", "animated"],
    code: `<button class="relative p-[1px] rounded-xl overflow-hidden group">
  <span class="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-[spin_3s_linear_infinite]"></span>
  <span class="relative block px-6 py-3 rounded-xl bg-zinc-900 text-white font-medium">Gradient Border</span>
</button>`,
  },
  {
    id: "button-icon-morph",
    name: "Icon Morph Button",
    category: "Buttons",
    tags: ["button", "icon", "morph", "menu"],
    code: `<button class="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white hover:bg-zinc-800 transition-all group">
  <svg class="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
  </svg>
</button>`,
  },
  {
    id: "card-3d-hover",
    name: "3D Hover Card",
    category: "Cards",
    tags: ["card", "3d", "hover", "perspective"],
    code: `<div class="group w-72 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 transition-transform duration-500 hover:[transform:rotateY(10deg)_rotateX(5deg)]" style="transform-style:preserve-3d">
  <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
    <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
  </div>
  <h3 class="text-white font-semibold mb-2">3D Hover Card</h3>
  <p class="text-zinc-400 text-sm">Hover to see the 3D perspective tilt in action.</p>
</div>`,
  },
  {
    id: "card-glassmorphism",
    name: "Glassmorphism Card",
    category: "Cards",
    tags: ["card", "glass", "blur", "frosted"],
    code: `<div class="w-72 p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
  <h3 class="text-white font-semibold mb-2">Glassmorphism</h3>
  <p class="text-zinc-300 text-sm">Frosted glass effect with backdrop blur and subtle border.</p>
</div>`,
  },
  {
    id: "card-gradient-glow",
    name: "Gradient Glow Card",
    category: "Cards",
    tags: ["card", "gradient", "glow", "neon"],
    code: `<div class="relative w-72 p-6 rounded-2xl bg-zinc-900 overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20"></div>
  <div class="absolute -inset-px rounded-2xl bg-gradient-to-br from-blue-500/50 via-purple-500/50 to-pink-500/50 opacity-50 blur-xl"></div>
  <div class="relative">
    <h3 class="text-white font-semibold mb-2">Gradient Glow</h3>
    <p class="text-zinc-300 text-sm">Soft glow effect from a vibrant gradient.</p>
  </div>
</div>`,
  },
  {
    id: "input-floating-label",
    name: "Floating Label Input",
    category: "Inputs",
    tags: ["input", "floating", "label", "form"],
    code: `<div class="relative w-72">
  <input type="text" id="floating" placeholder=" " class="peer w-full px-4 pt-5 pb-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:border-blue-500 focus:outline-none transition-colors">
  <label for="floating" class="absolute left-4 top-4 text-zinc-500 text-sm transition-all peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-400 peer-[:not(:placeholder-shown)]:top-1 peer-[:not(:placeholder-shown)]:text-xs">Email address</label>
</div>`,
  },
  {
    id: "input-search-icon",
    name: "Search Input",
    category: "Inputs",
    tags: ["input", "search", "icon"],
    code: `<div class="relative w-72">
  <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
  <input type="text" placeholder="Search..." class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none">
</div>`,
  },
  {
    id: "input-toggle",
    name: "Toggle Switch",
    category: "Inputs",
    tags: ["input", "toggle", "switch", "animated"],
    code: `<label class="relative inline-flex items-center cursor-pointer">
  <input type="checkbox" class="sr-only peer">
  <div class="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
</label>`,
  },
  {
    id: "input-checkbox",
    name: "Custom Checkbox",
    category: "Inputs",
    tags: ["input", "checkbox", "custom"],
    code: `<label class="flex items-center gap-2 cursor-pointer">
  <input type="checkbox" class="sr-only peer">
  <div class="w-5 h-5 rounded border-2 border-zinc-700 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors flex items-center justify-center">
    <svg class="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
  </div>
  <span class="text-white text-sm">Accept terms</span>
</label>`,
  },
  {
    id: "badge-status-online",
    name: "Status Badge",
    category: "Badges",
    tags: ["badge", "status", "online", "indicator"],
    code: `<div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
  <span class="relative flex w-2 h-2">
    <span class="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
    <span class="relative inline-flex w-2 h-2 rounded-full bg-green-500"></span>
  </span>
  <span class="text-white text-sm">Online</span>
</div>`,
  },
  {
    id: "badge-gradient-pill",
    name: "Gradient Pill Badge",
    category: "Badges",
    tags: ["badge", "gradient", "pill", "new"],
    code: `<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white">
  New Feature
</span>`,
  },
  {
    id: "badge-count",
    name: "Count Badge",
    category: "Badges",
    tags: ["badge", "count", "notification"],
    code: `<div class="relative inline-block">
  <button class="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
  </button>
  <span class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">3</span>
</div>`,
  },
  {
    id: "effect-text-gradient",
    name: "Gradient Text",
    category: "Effects",
    tags: ["text", "gradient", "animated"],
    code: `<h1 class="text-5xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
  Gradient Text
</h1>`,
  },
  {
    id: "effect-text-shimmer",
    name: "Shimmer Text",
    category: "Effects",
    tags: ["text", "shimmer", "animated"],
    code: `<h1 class="text-5xl font-bold bg-gradient-to-r from-zinc-700 via-white to-zinc-700 bg-[length:200%_100%] bg-clip-text text-transparent animate-[shimmer-text_2s_linear_infinite]">
  Shimmer Text
</h1>
<style>@keyframes shimmer-text{0%{background-position:200% 0}100%{background-position:-200% 0}}</style>`,
  },
  {
    id: "effect-glass-blur",
    name: "Glass Blur",
    category: "Effects",
    tags: ["glass", "blur", "frosted"],
    code: `<div class="relative w-72 h-40 rounded-2xl overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500"></div>
  <div class="absolute inset-0 backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl flex items-center justify-center">
    <span class="text-white font-semibold">Frosted Glass</span>
  </div>
</div>`,
  },
  {
    id: "effect-noise",
    name: "Noise Texture",
    category: "Effects",
    tags: ["noise", "texture", "grain"],
    code: `<div class="relative w-72 h-40 rounded-2xl bg-zinc-900 overflow-hidden">
  <div class="absolute inset-0 opacity-50" style="background-image:url('data:image/svg+xml;utf8,<svg viewBox=\\'0 0 200 200\\' xmlns=\\'http://www.w3.org/2000/svg\\'><filter id=\\'noiseFilter\\'><feTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.85\\' numOctaves=\\'3\\' stitchTiles=\\'stitch\\'/></filter><rect width=\\'100%25\\' height=\\'100%25\\' filter=\\'url(%23noiseFilter)\\'/></svg>')"></div>
  <div class="relative h-full flex items-center justify-center">
    <span class="text-white font-semibold">Noise Texture</span>
  </div>
</div>`,
  },
  {
    id: "effect-glow-border",
    name: "Glow Border",
    category: "Effects",
    tags: ["border", "glow", "neon", "animated"],
    code: `<div class="relative p-px rounded-2xl overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-[spin_4s_linear_infinite]"></div>
  <div class="relative w-72 h-32 rounded-2xl bg-zinc-900 flex items-center justify-center">
    <span class="text-white font-semibold">Animated Glow Border</span>
  </div>
</div>`,
  },
  {
    id: "nav-tabs",
    name: "Tab Bar",
    category: "Navigation",
    tags: ["tabs", "nav", "segment"],
    code: `<div class="inline-flex p-1 rounded-xl bg-zinc-900 border border-zinc-800">
  <button class="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium">Active</button>
  <button class="px-4 py-1.5 rounded-lg text-zinc-400 text-sm hover:text-white transition-colors">Inactive</button>
  <button class="px-4 py-1.5 rounded-lg text-zinc-400 text-sm hover:text-white transition-colors">Inactive</button>
</div>`,
  },
  {
    id: "nav-breadcrumb",
    name: "Breadcrumb",
    category: "Navigation",
    tags: ["breadcrumb", "nav", "path"],
    code: `<nav class="flex items-center gap-2 text-sm">
  <a href="#" class="text-zinc-400 hover:text-white transition-colors">Home</a>
  <svg class="w-3 h-3 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
  <a href="#" class="text-zinc-400 hover:text-white transition-colors">Projects</a>
  <svg class="w-3 h-3 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
  <span class="text-white">Current</span>
</nav>`,
  },
  {
    id: "nav-pagination",
    name: "Pagination",
    category: "Navigation",
    tags: ["pagination", "nav", "page"],
    code: `<nav class="inline-flex items-center gap-1">
  <button class="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center justify-center">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
  </button>
  <button class="w-9 h-9 rounded-lg bg-blue-600 text-white text-sm font-medium">1</button>
  <button class="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-sm transition-colors">2</button>
  <button class="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-sm transition-colors">3</button>
  <button class="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center justify-center">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
  </button>
</nav>`,
  },
  {
    id: "modal-drawer",
    name: "Side Drawer",
    category: "Modals",
    tags: ["modal", "drawer", "side", "panel"],
    code: `<div class="w-64 h-80 rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex">
  <div class="w-64 p-6 bg-zinc-900 border-r border-zinc-800">
    <h3 class="text-white font-semibold mb-4">Drawer</h3>
    <nav class="space-y-2">
      <a class="block px-3 py-2 rounded-lg bg-blue-600/10 text-blue-400 text-sm">Dashboard</a>
      <a class="block px-3 py-2 rounded-lg text-zinc-400 text-sm hover:bg-zinc-800">Projects</a>
      <a class="block px-3 py-2 rounded-lg text-zinc-400 text-sm hover:bg-zinc-800">Settings</a>
    </nav>
  </div>
</div>`,
  },
  {
    id: "modal-popover",
    name: "Popover",
    category: "Modals",
    tags: ["modal", "popover", "tooltip"],
    code: `<div class="relative">
  <button class="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium">Click me</button>
  <div class="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm whitespace-nowrap shadow-xl">
    Popover content
    <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-zinc-900 border-l border-t border-zinc-800"></div>
  </div>
</div>`,
  },
  {
    id: "tooltip-hover",
    name: "Hover Tooltip",
    category: "Tooltips",
    tags: ["tooltip", "hover", "info"],
    code: `<div class="relative inline-block group">
  <button class="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm">Hover me</button>
  <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-zinc-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
    Helpful info
  </div>
</div>`,
  },
  {
    id: "form-newsletter",
    name: "Newsletter Form",
    category: "Forms",
    tags: ["form", "newsletter", "subscribe"],
    code: `<form class="flex gap-2 p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 w-80">
  <input type="email" placeholder="Enter your email" class="flex-1 px-3 py-2 bg-transparent text-white placeholder-zinc-500 focus:outline-none text-sm">
  <button class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">Subscribe</button>
</form>`,
  },
  {
    id: "form-contact",
    name: "Contact Form",
    category: "Forms",
    tags: ["form", "contact", "input"],
    code: `<form class="w-80 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
  <div>
    <label class="block text-zinc-300 text-sm mb-1.5">Name</label>
    <input type="text" class="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:border-blue-500 focus:outline-none text-sm">
  </div>
  <div>
    <label class="block text-zinc-300 text-sm mb-1.5">Message</label>
    <textarea rows="3" class="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:border-blue-500 focus:outline-none text-sm"></textarea>
  </div>
  <button class="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors">Send</button>
</form>`,
  },
  {
    id: "nav-sidebar-mini-v2",
    name: "Icon Sidebar",
    category: "Navigation",
    tags: ["sidebar", "nav", "icon", "vertical"],
    code: `<div class="w-16 h-80 rounded-2xl bg-zinc-900 border border-zinc-800 p-2 flex flex-col items-center gap-2">
  <button class="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
  </button>
  <button class="w-12 h-12 rounded-xl hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
  </button>
  <button class="w-12 h-12 rounded-xl hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
  </button>
</div>`,
  },
  {
    id: "animation-marquee",
    name: "Marquee Text",
    category: "Animation",
    tags: ["marquee", "scroll", "text", "infinite"],
    code: `<div class="overflow-hidden w-72 rounded-xl bg-zinc-900 border border-zinc-800 p-3">
  <div class="flex gap-8 animate-[marquee_8s_linear_infinite] whitespace-nowrap">
    <span class="text-white">Build faster</span>
    <span class="text-zinc-500">•</span>
    <span class="text-white">Ship quality</span>
    <span class="text-zinc-500">•</span>
    <span class="text-white">Iterate often</span>
    <span class="text-zinc-500">•</span>
    <span class="text-white">Build faster</span>
    <span class="text-zinc-500">•</span>
    <span class="text-white">Ship quality</span>
  </div>
</div>
<style>@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}</style>`,
  },
  {
    id: "animation-fade-in",
    name: "Fade In Stagger",
    category: "Animation",
    tags: ["fade", "stagger", "entrance"],
    code: `<div class="space-y-2 w-64">
  <div class="h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center px-3 text-white text-sm animate-[fadeIn_0.5s_ease-out]" style="animation-delay:0s">Item 1</div>
  <div class="h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center px-3 text-white text-sm animate-[fadeIn_0.5s_ease-out]" style="animation-delay:0.1s">Item 2</div>
  <div class="h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center px-3 text-white text-sm animate-[fadeIn_0.5s_ease-out]" style="animation-delay:0.2s">Item 3</div>
</div>
<style>@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}</style>`,
  },
  {
    id: "shader-aurora",
    name: "Aurora Gradient",
    category: "Shaders",
    tags: ["aurora", "gradient", "animated", "background"],
    code: `<div class="relative w-72 h-40 rounded-2xl overflow-hidden bg-zinc-900">
  <div class="absolute inset-0" style="background:linear-gradient(125deg,#0ea5e9 0%,#8b5cf6 50%,#ec4899 100%);filter:blur(40px);opacity:0.7"></div>
  <div class="absolute inset-0" style="background:radial-gradient(circle at 30% 50%,#06b6d4 0%,transparent 50%),radial-gradient(circle at 70% 50%,#a855f7 0%,transparent 50%);filter:blur(30px);animation:aurora 6s ease-in-out infinite alternate"></div>
  <div class="relative h-full flex items-center justify-center">
    <span class="text-white font-semibold">Aurora</span>
  </div>
</div>
<style>@keyframes aurora{0%{transform:translate(-20%,0) rotate(0deg)}100%{transform:translate(20%,0) rotate(15deg)}}</style>`,
  },
  {
    id: "shader-mesh-gradient",
    name: "Mesh Gradient",
    category: "Shaders",
    tags: ["mesh", "gradient", "colorful", "background"],
    code: `<div class="relative w-72 h-40 rounded-2xl overflow-hidden" style="background-color:#1e1b4b">
  <div class="absolute top-0 -left-20 w-60 h-60 rounded-full" style="background:radial-gradient(circle,#ec4899 0%,transparent 70%);filter:blur(30px)"></div>
  <div class="absolute top-0 -right-20 w-60 h-60 rounded-full" style="background:radial-gradient(circle,#3b82f6 0%,transparent 70%);filter:blur(30px)"></div>
  <div class="absolute -bottom-20 left-1/3 w-60 h-60 rounded-full" style="background:radial-gradient(circle,#a855f7 0%,transparent 70%);filter:blur(30px)"></div>
  <div class="relative h-full flex items-center justify-center">
    <span class="text-white font-semibold">Mesh Gradient</span>
  </div>
</div>`,
  },
  {
    id: "background-grid",
    name: "Grid Background",
    category: "Backgrounds",
    tags: ["grid", "pattern", "background"],
    code: `<div class="w-72 h-40 rounded-2xl bg-zinc-900 border border-zinc-800 relative overflow-hidden" style="background-image:linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px);background-size:24px 24px">
  <div class="absolute inset-0 flex items-center justify-center">
    <span class="text-white font-semibold">Grid Pattern</span>
  </div>
</div>`,
  },
  {
    id: "background-dots",
    name: "Dot Pattern",
    category: "Backgrounds",
    tags: ["dots", "pattern", "background"],
    code: `<div class="w-72 h-40 rounded-2xl bg-zinc-900 border border-zinc-800 relative overflow-hidden" style="background-image:radial-gradient(rgba(255,255,255,0.1) 1px,transparent 1px);background-size:16px 16px">
  <div class="absolute inset-0 flex items-center justify-center">
    <span class="text-white font-semibold">Dot Pattern</span>
  </div>
</div>`,
  },
  {
    id: "3d-card-tilt",
    name: "3D Tilt Card",
    category: "3D",
    tags: ["3d", "tilt", "card", "perspective"],
    code: `<div class="w-72 h-40 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-6 flex items-end shadow-2xl" style="transform:perspective(1000px) rotateX(15deg) rotateY(-15deg);transform-style:preserve-3d">
  <div>
    <h3 class="text-white font-bold text-xl">3D Tilt Card</h3>
    <p class="text-white/80 text-sm">Real CSS perspective</p>
  </div>
</div>`,
  },
  {
    id: "3d-cube",
    name: "3D Cube",
    category: "3D",
    tags: ["3d", "cube", "spinning"],
    code: `<div class="w-32 h-32" style="perspective:600px">
  <div class="w-full h-full relative animate-[spin3d_8s_linear_infinite]" style="transform-style:preserve-3d">
    <div class="absolute inset-0 bg-red-500/80 border border-white/30 flex items-center justify-center text-white text-xs" style="transform:translateZ(64px)">Front</div>
    <div class="absolute inset-0 bg-green-500/80 border border-white/30 flex items-center justify-center text-white text-xs" style="transform:rotateY(180deg) translateZ(64px)">Back</div>
    <div class="absolute inset-0 bg-blue-500/80 border border-white/30 flex items-center justify-center text-white text-xs" style="transform:rotateY(90deg) translateZ(64px)">Right</div>
    <div class="absolute inset-0 bg-yellow-500/80 border border-white/30 flex items-center justify-center text-white text-xs" style="transform:rotateY(-90deg) translateZ(64px)">Left</div>
    <div class="absolute inset-0 bg-purple-500/80 border border-white/30 flex items-center justify-center text-white text-xs" style="transform:rotateX(90deg) translateZ(64px)">Top</div>
    <div class="absolute inset-0 bg-pink-500/80 border border-white/30 flex items-center justify-center text-white text-xs" style="transform:rotateX(-90deg) translateZ(64px)">Bottom</div>
  </div>
</div>
<style>@keyframes spin3d{0%{transform:rotateX(0) rotateY(0)}100%{transform:rotateX(360deg) rotateY(360deg)}}</style>`,
  },
  {
    id: "3d-sphere",
    name: "3D Sphere Gradient",
    category: "3D",
    tags: ["3d", "sphere", "gradient"],
    code: `<div class="w-40 h-40 rounded-full" style="background:radial-gradient(circle at 30% 30%,#fff,#3b82f6 30%,#1e3a8a 100%);box-shadow:inset -20px -20px 50px rgba(0,0,0,0.5),0 20px 40px rgba(0,0,0,0.3)"></div>`,
  },
  {
    id: "3d-flip-card",
    name: "3D Flip Card",
    category: "3D",
    tags: ["3d", "flip", "card"],
    code: `<div class="w-64 h-40 [perspective:1000px] group">
  <div class="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
    <div class="absolute inset-0 rounded-2xl bg-zinc-900 border border-zinc-800 p-6 [backface-visibility:hidden]">
      <h3 class="text-white font-semibold">Front</h3>
      <p class="text-zinc-400 text-sm mt-2">Hover to flip</p>
    </div>
    <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
      <h3 class="text-white font-semibold">Back</h3>
      <p class="text-white/80 text-sm mt-2">Revealed!</p>
    </div>
  </div>
</div>`,
  },
  {
    id: "3d-prism",
    name: "3D Prism Bar",
    category: "3D",
    tags: ["3d", "prism", "bar"],
    code: `<div class="w-32 h-32" style="perspective:500px">
  <div class="w-full h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600" style="transform:rotateY(-25deg) rotateX(15deg);box-shadow:20px 20px 40px rgba(0,0,0,0.4)"></div>
</div>`,
  },
  {
    id: "animation-marquee-v2",
    name: "Marquee Logos",
    category: "Animation",
    tags: ["marquee", "logos", "scroll"],
    code: `<div class="w-72 overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 p-4">
  <div class="flex gap-6 animate-[scroll_8s_linear_infinite] whitespace-nowrap">
    <span class="text-zinc-400 text-lg font-semibold">ACME</span>
    <span class="text-zinc-400 text-lg font-semibold">Globex</span>
    <span class="text-zinc-400 text-lg font-semibold">Initech</span>
    <span class="text-zinc-400 text-lg font-semibold">Umbrella</span>
    <span class="text-zinc-400 text-lg font-semibold">Hooli</span>
    <span class="text-zinc-400 text-lg font-semibold">ACME</span>
  </div>
</div>
<style>@keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}</style>`,
  },
  {
    id: "animation-slide-in",
    name: "Slide In From Right",
    category: "Animation",
    tags: ["slide", "entrance", "right"],
    code: `<div class="w-64 space-y-2">
  <div class="h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center px-3 text-blue-300 text-sm animate-[slideInRight_0.5s_ease-out]">Slide 1</div>
  <div class="h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center px-3 text-blue-300 text-sm animate-[slideInRight_0.5s_ease-out]" style="animation-delay:0.15s">Slide 2</div>
  <div class="h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center px-3 text-blue-300 text-sm animate-[slideInRight_0.5s_ease-out]" style="animation-delay:0.3s">Slide 3</div>
</div>
<style>@keyframes slideInRight{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}</style>`,
  },
  {
    id: "animation-pulse-scale",
    name: "Pulse Scale",
    category: "Animation",
    tags: ["pulse", "scale", "heartbeat"],
    code: `<div class="w-20 h-20 rounded-full bg-rose-500 animate-[pulseScale_1.2s_ease-in-out_infinite] flex items-center justify-center text-white text-2xl">♥</div>
<style>@keyframes pulseScale{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}</style>`,
  },
  {
    id: "animation-flip",
    name: "Coin Flip",
    category: "Animation",
    tags: ["flip", "rotate", "coin"],
    code: `<div class="w-24 h-24 animate-[coinFlip_2s_ease-in-out_infinite]" style="transform-style:preserve-3d">
  <div class="w-full h-full rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-2xl font-bold text-yellow-900 [backface-visibility:hidden]">$</div>
</div>
<style>@keyframes coinFlip{0%{transform:rotateY(0)}50%{transform:rotateY(180deg) scaleY(-1)}100%{transform:rotateY(360deg)}}</style>`,
  },
  {
    id: "animation-rotate-x",
    name: "Rotate X Wiggle",
    category: "Animation",
    tags: ["rotate", "wiggle", "3d"],
    code: `<div class="w-20 h-20 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 animate-[wiggleX_2s_ease-in-out_infinite]" style="transform-style:preserve-3d"></div>
<style>@keyframes wiggleX{0%,100%{transform:rotateX(0)}25%{transform:rotateX(20deg)}75%{transform:rotateX(-20deg)}}</style>`,
  },
  {
    id: "animation-bounce-in",
    name: "Bounce In",
    category: "Animation",
    tags: ["bounce", "entrance", "spring"],
    code: `<div class="w-20 h-20 rounded-full bg-emerald-500 animate-[bounceIn_1s_ease-out]"></div>
<style>@keyframes bounceIn{0%{opacity:0;transform:scale(0.3)}50%{transform:scale(1.1)}70%{transform:scale(0.95)}100%{opacity:1;transform:scale(1)}}</style>`,
  },
  {
    id: "animation-typing",
    name: "Typing Dots",
    category: "Animation",
    tags: ["typing", "dots", "loading"],
    code: `<div class="flex gap-1 px-4 py-2 rounded-2xl bg-zinc-900 border border-zinc-800">
  <div class="w-2 h-2 rounded-full bg-zinc-500 animate-[typingBounce_1.2s_ease-in-out_infinite]"></div>
  <div class="w-2 h-2 rounded-full bg-zinc-500 animate-[typingBounce_1.2s_ease-in-out_infinite]" style="animation-delay:0.2s"></div>
  <div class="w-2 h-2 rounded-full bg-zinc-500 animate-[typingBounce_1.2s_ease-in-out_infinite]" style="animation-delay:0.4s"></div>
</div>
<style>@keyframes typingBounce{0%,60%,100%{transform:translateY(0);opacity:0.4}30%{transform:translateY(-8px);opacity:1}}</style>`,
  },
  {
    id: "shader-noise",
    name: "Noise Texture",
    category: "Shaders",
    tags: ["noise", "texture", "grain"],
    code: `<div class="w-72 h-40 rounded-2xl bg-zinc-900 relative overflow-hidden">
  <div class="absolute inset-0 opacity-50" style="background-image:url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.85\" numOctaves=\"3\" stitchTiles=\"stitch\"/></filter><rect width=\"100%25\" height=\"100%25\" filter=\"url(%23n)\" opacity=\"0.6\"/></svg>')"></div>
  <div class="relative h-full flex items-center justify-center">
    <span class="text-white font-semibold">Noise</span>
  </div>
</div>`,
  },
  {
    id: "shader-plasma",
    name: "Plasma Gradient",
    category: "Shaders",
    tags: ["plasma", "gradient", "colorful"],
    code: `<div class="w-72 h-40 rounded-2xl overflow-hidden relative" style="background:#0f172a">
  <div class="absolute inset-0" style="background:conic-gradient(from 0deg at 50% 50%,#06b6d4,#a855f7,#ec4899,#f59e0b,#06b6d4);filter:blur(40px);animation:plasma 6s linear infinite"></div>
  <div class="relative h-full flex items-center justify-center">
    <span class="text-white font-semibold">Plasma</span>
  </div>
</div>
<style>@keyframes plasma{0%{transform:rotate(0) scale(1)}50%{transform:rotate(180deg) scale(1.3)}100%{transform:rotate(360deg) scale(1)}}</style>`,
  },
  {
    id: "shader-rainbow",
    name: "Rainbow Wave",
    category: "Shaders",
    tags: ["rainbow", "wave", "animated"],
    code: `<div class="w-72 h-40 rounded-2xl overflow-hidden relative bg-zinc-900">
  <div class="absolute inset-0" style="background:linear-gradient(90deg,#ef4444,#f59e0b,#eab308,#22c55e,#06b6d4,#3b82f6,#a855f7,#ec4899,#ef4444);background-size:200% 100%;animation:rainbow 3s linear infinite"></div>
  <div class="relative h-full flex items-center justify-center">
    <span class="text-white font-semibold drop-shadow-lg">Rainbow</span>
  </div>
</div>
<style>@keyframes rainbow{0%{background-position:0% 50%}100%{background-position:200% 50%}}</style>`,
  },
  {
    id: "shader-noise-grain",
    name: "Film Grain",
    category: "Shaders",
    tags: ["grain", "film", "noise"],
    code: `<div class="w-72 h-40 rounded-2xl bg-zinc-900 relative overflow-hidden">
  <div class="absolute inset-0 animate-[grain_0.5s_steps(3)_infinite]" style="background-image:url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><filter id=\"n\"><feTurbulence baseFrequency=\"0.9\"/></filter><rect width=\"100%25\" height=\"100%25\" filter=\"url(%23n)\" opacity=\"0.7\"/></svg>')"></div>
  <div class="relative h-full flex items-center justify-center">
    <span class="text-white font-semibold">Film Grain</span>
  </div>
</div>
<style>@keyframes grain{0%{transform:translate(0,0)}33%{transform:translate(-5%,5%)}66%{transform:translate(5%,-5%)}100%{transform:translate(0,0)}}</style>`,
  },
  {
    id: "background-lines",
    name: "Diagonal Lines",
    category: "Backgrounds",
    tags: ["lines", "diagonal", "pattern"],
    code: `<div class="w-72 h-40 rounded-2xl bg-zinc-900 relative overflow-hidden" style="background-image:repeating-linear-gradient(45deg,transparent,transparent 10px,rgba(255,255,255,0.05) 10px,rgba(255,255,255,0.05) 20px)">
  <div class="absolute inset-0 flex items-center justify-center">
    <span class="text-white font-semibold">Diagonal Lines</span>
  </div>
</div>`,
  },
  {
    id: "background-checker",
    name: "Checker Pattern",
    category: "Backgrounds",
    tags: ["checker", "pattern", "background"],
    code: `<div class="w-72 h-40 rounded-2xl border border-zinc-800 relative overflow-hidden" style="background-image:conic-gradient(#27272a 25%,#18181b 0 50%,#27272a 0 75%,#18181b 0);background-size:20px 20px">
  <div class="absolute inset-0 bg-zinc-900/60 flex items-center justify-center">
    <span class="text-white font-semibold">Checker</span>
  </div>
</div>`,
  },
  {
    id: "background-circuit",
    name: "Circuit Pattern",
    category: "Backgrounds",
    tags: ["circuit", "tech", "pattern"],
    code: `<div class="w-72 h-40 rounded-2xl bg-zinc-900 border border-zinc-800 relative overflow-hidden">
  <svg class="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 60">
    <line x1="0" y1="30" x2="40" y2="30" stroke="#22d3ee" stroke-width="0.3"/>
    <line x1="40" y1="30" x2="40" y2="10" stroke="#22d3ee" stroke-width="0.3"/>
    <line x1="40" y1="30" x2="40" y2="50" stroke="#22d3ee" stroke-width="0.3"/>
    <line x1="60" y1="30" x2="100" y2="30" stroke="#22d3ee" stroke-width="0.3"/>
    <circle cx="40" cy="30" r="1.5" fill="#22d3ee"/>
    <circle cx="60" cy="30" r="1.5" fill="#22d3ee"/>
    <circle cx="40" cy="10" r="1" fill="#22d3ee"/>
    <circle cx="40" cy="50" r="1" fill="#22d3ee"/>
  </svg>
  <div class="relative h-full flex items-center justify-center">
    <span class="text-white font-semibold">Circuit</span>
  </div>
</div>`,
  },
  {
    id: "background-stars",
    name: "Star Field",
    category: "Backgrounds",
    tags: ["stars", "space", "animated"],
    code: `<div class="w-72 h-40 rounded-2xl bg-zinc-950 border border-zinc-800 relative overflow-hidden">
  <div class="absolute w-1 h-1 rounded-full bg-white animate-[twinkle_2s_ease-in-out_infinite]" style="top:10%;left:20%"></div>
  <div class="absolute w-1 h-1 rounded-full bg-white animate-[twinkle_2s_ease-in-out_infinite]" style="top:30%;left:60%;animation-delay:0.5s"></div>
  <div class="absolute w-1 h-1 rounded-full bg-white animate-[twinkle_2s_ease-in-out_infinite]" style="top:60%;left:30%;animation-delay:1s"></div>
  <div class="absolute w-1 h-1 rounded-full bg-white animate-[twinkle_2s_ease-in-out_infinite]" style="top:80%;left:75%;animation-delay:1.5s"></div>
  <div class="absolute w-0.5 h-0.5 rounded-full bg-white animate-[twinkle_2s_ease-in-out_infinite]" style="top:50%;left:50%"></div>
  <div class="relative h-full flex items-center justify-center">
    <span class="text-white font-semibold">Stars</span>
  </div>
</div>
<style>@keyframes twinkle{0%,100%{opacity:0.3}50%{opacity:1}}</style>`,
  },
  {
    id: "badge-pulse",
    name: "Pulsing Badge",
    category: "Badges",
    tags: ["badge", "pulse", "notification"],
    code: `<div class="relative inline-flex">
  <button class="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm">Inbox</button>
  <span class="absolute -top-1 -right-1 flex h-3 w-3">
    <span class="absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75 animate-ping"></span>
    <span class="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
  </span>
</div>`,
  },
  {
    id: "badge-gradient",
    name: "Gradient Badge",
    category: "Badges",
    tags: ["badge", "gradient", "pill"],
    code: `<span class="px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500">New Feature</span>`,
  },
  {
    id: "badge-dot",
    name: "Status Dot",
    category: "Badges",
    tags: ["badge", "status", "dot"],
    code: `<div class="flex gap-3">
  <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
    <span class="text-xs text-zinc-300">Online</span>
  </div>
  <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
    <span class="w-2 h-2 rounded-full bg-amber-500"></span>
    <span class="text-xs text-zinc-300">Away</span>
  </div>
  <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
    <span class="w-2 h-2 rounded-full bg-zinc-500"></span>
    <span class="text-xs text-zinc-300">Offline</span>
  </div>
</div>`,
  },
  {
    id: "badge-count",
    name: "Count Badge",
    category: "Badges",
    tags: ["badge", "count", "number"],
    code: `<div class="flex gap-4">
  <div class="relative">
    <button class="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-white">M</button>
    <span class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">3</span>
  </div>
  <div class="relative">
    <button class="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-white">N</button>
    <span class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">12</span>
  </div>
</div>`,
  },
  {
    id: "tooltip-arrow",
    name: "Tooltip with Arrow",
    category: "Tooltips",
    tags: ["tooltip", "arrow", "hover"],
    code: `<div class="relative inline-block group">
  <button class="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm">Hover me</button>
  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 rounded-lg bg-zinc-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
    Tooltip text
    <div class="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-800 rotate-45 -mt-1"></div>
  </div>
</div>`,
  },
  {
    id: "tooltip-light",
    name: "Light Tooltip",
    category: "Tooltips",
    tags: ["tooltip", "light", "minimal"],
    code: `<div class="relative inline-block group">
  <span class="px-3 py-1 rounded-md bg-zinc-100 text-zinc-900 text-sm">Hover</span>
  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-white text-zinc-900 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
    Light tooltip
  </div>
</div>`,
  },
  {
    id: "tooltip-bubble",
    name: "Speech Bubble",
    category: "Tooltips",
    tags: ["tooltip", "bubble", "speech"],
    code: `<div class="relative max-w-xs px-4 py-3 rounded-2xl bg-blue-500 text-white">
  <p class="text-sm">This is a speech bubble tooltip</p>
  <div class="absolute bottom-0 left-6 w-3 h-3 bg-blue-500 translate-y-1/2 rotate-45"></div>
</div>`,
  },
  {
    id: "modal-confirm",
    name: "Confirm Modal",
    category: "Modals",
    tags: ["modal", "confirm", "dialog"],
    code: `<div class="w-80 rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
  <div class="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
    <svg class="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
  </div>
  <h3 class="text-white font-semibold text-lg">Delete item?</h3>
  <p class="text-zinc-400 text-sm mt-2">This action cannot be undone.</p>
  <div class="flex gap-2 mt-6">
    <button class="flex-1 px-4 py-2 rounded-lg bg-zinc-800 text-white text-sm hover:bg-zinc-700">Cancel</button>
    <button class="flex-1 px-4 py-2 rounded-lg bg-rose-500 text-white text-sm hover:bg-rose-600">Delete</button>
  </div>
</div>`,
  },
  {
    id: "modal-drawer",
    name: "Side Drawer",
    category: "Modals",
    tags: ["modal", "drawer", "side"],
    code: `<div class="w-72 h-80 rounded-2xl bg-zinc-900 border border-zinc-800 flex overflow-hidden">
  <div class="w-64 p-6 border-r border-zinc-800">
    <h3 class="text-white font-semibold">Drawer</h3>
    <p class="text-zinc-400 text-sm mt-2">Slides from side</p>
  </div>
</div>`,
  },
  {
    id: "modal-sheet",
    name: "Bottom Sheet",
    category: "Modals",
    tags: ["modal", "sheet", "bottom"],
    code: `<div class="w-80 rounded-t-2xl bg-zinc-900 border border-zinc-800 border-b-0 p-6 shadow-2xl">
  <div class="w-12 h-1 rounded-full bg-zinc-700 mx-auto mb-4"></div>
  <h3 class="text-white font-semibold">Bottom Sheet</h3>
  <p class="text-zinc-400 text-sm mt-2">Mobile-friendly modal</p>
</div>`,
  },
  {
    id: "input-floating",
    name: "Floating Label Input",
    category: "Inputs",
    tags: ["input", "floating", "label"],
    code: `<div class="relative w-72">
  <input type="text" id="floating" placeholder=" " class="peer w-full px-4 pt-5 pb-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors">
  <label for="floating" class="absolute left-4 top-1 text-xs text-zinc-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-500 peer-focus:top-1 peer-focus:text-xs peer-focus:text-blue-400">Email address</label>
</div>`,
  },
  {
    id: "input-search",
    name: "Search Input",
    category: "Inputs",
    tags: ["input", "search", "icon"],
    code: `<div class="relative w-72">
  <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
  <input type="text" placeholder="Search..." class="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-blue-500">
</div>`,
  },
  {
    id: "input-toggle",
    name: "Toggle Switch",
    category: "Inputs",
    tags: ["input", "toggle", "switch"],
    code: `<div class="flex items-center gap-3">
  <label class="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" class="sr-only peer">
    <div class="w-11 h-6 bg-zinc-800 rounded-full peer peer-checked:bg-blue-500 peer-focus:ring-2 peer-focus:ring-blue-500/20 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-5"></div>
  </label>
  <span class="text-sm text-zinc-300">Toggle me</span>
</div>`,
  },
  {
    id: "input-checkbox",
    name: "Custom Checkbox",
    category: "Inputs",
    tags: ["input", "checkbox", "custom"],
    code: `<div class="space-y-2">
  <label class="flex items-center gap-3 cursor-pointer group">
    <div class="relative w-5 h-5 rounded border-2 border-zinc-700 group-hover:border-zinc-500 transition-colors">
      <input type="checkbox" class="peer absolute inset-0 opacity-0 cursor-pointer">
      <svg class="absolute inset-0 w-full h-full text-blue-500 opacity-0 peer-checked:opacity-100" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
    </div>
    <span class="text-sm text-zinc-300">Accept terms</span>
  </label>
</div>`,
  },
  {
    id: "form-floating",
    name: "Login Form",
    category: "Forms",
    tags: ["form", "login", "auth"],
    code: `<form class="w-72 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
  <h3 class="text-white font-semibold text-lg">Sign in</h3>
  <div>
    <label class="text-xs text-zinc-400 block mb-1">Email</label>
    <input type="email" class="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-blue-500">
  </div>
  <div>
    <label class="text-xs text-zinc-400 block mb-1">Password</label>
    <input type="password" class="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-white text-sm focus:outline-none focus:border-blue-500">
  </div>
  <button type="button" class="w-full py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600">Sign in</button>
</form>`,
  },
  {
    id: "form-search",
    name: "Search Form",
    category: "Forms",
    tags: ["form", "search", "filter"],
    code: `<form class="w-72 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex gap-2">
  <input type="text" placeholder="Search anything..." class="flex-1 px-3 py-2 rounded-lg bg-zinc-950 text-white text-sm focus:outline-none">
  <button type="button" class="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600">Go</button>
</form>`,
  },
  {
    id: "form-newsletter-v2",
    name: "Inline Newsletter",
    category: "Forms",
    tags: ["form", "newsletter", "inline"],
    code: `<form class="w-72 p-1 rounded-full bg-zinc-900 border border-zinc-800 flex items-center">
  <input type="email" placeholder="your@email.com" class="flex-1 px-4 py-2 bg-transparent text-white text-sm focus:outline-none">
  <button type="button" class="px-4 py-2 rounded-full bg-blue-500 text-white text-sm font-medium hover:bg-blue-600">Subscribe</button>
</form>`,
  },
  {
    id: "nav-tabs",
    name: "Tab Navigation",
    category: "Navigation",
    tags: ["nav", "tabs", "menu"],
    code: `<div class="w-72 p-1 rounded-xl bg-zinc-900 border border-zinc-800 flex gap-1">
  <button class="flex-1 py-2 rounded-lg bg-zinc-800 text-white text-sm font-medium">Overview</button>
  <button class="flex-1 py-2 rounded-lg text-zinc-400 text-sm hover:text-white">Analytics</button>
  <button class="flex-1 py-2 rounded-lg text-zinc-400 text-sm hover:text-white">Settings</button>
</div>`,
  },
  {
    id: "nav-breadcrumb",
    name: "Breadcrumb",
    category: "Navigation",
    tags: ["nav", "breadcrumb", "path"],
    code: `<nav class="flex items-center gap-2 text-sm">
  <a href="#" class="text-zinc-400 hover:text-white">Home</a>
  <span class="text-zinc-600">/</span>
  <a href="#" class="text-zinc-400 hover:text-white">Products</a>
  <span class="text-zinc-600">/</span>
  <span class="text-white">Details</span>
</nav>`,
  },
  {
    id: "nav-pagination",
    name: "Pagination",
    category: "Navigation",
    tags: ["nav", "pagination", "pages"],
    code: `<nav class="flex items-center gap-1">
  <button class="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm hover:text-white">‹</button>
  <button class="w-9 h-9 rounded-lg bg-blue-500 text-white text-sm font-medium">1</button>
  <button class="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm hover:text-white">2</button>
  <button class="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm hover:text-white">3</button>
  <button class="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm hover:text-white">›</button>
</nav>`,
  },
  {
    id: "nav-dots",
    name: "Dot Navigator",
    category: "Navigation",
    tags: ["nav", "dots", "indicator"],
    code: `<div class="flex items-center gap-2">
  <div class="w-6 h-2 rounded-full bg-blue-500"></div>
  <div class="w-2 h-2 rounded-full bg-zinc-700"></div>
  <div class="w-2 h-2 rounded-full bg-zinc-700"></div>
  <div class="w-2 h-2 rounded-full bg-zinc-700"></div>
  <div class="w-2 h-2 rounded-full bg-zinc-700"></div>
</div>`,
  },
  {
    id: "effect-glass",
    name: "Glass Effect",
    category: "Effects",
    tags: ["glass", "blur", "frosted"],
    code: `<div class="w-72 h-40 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden">
  <div class="absolute inset-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
    <span class="text-white font-semibold">Glass Effect</span>
  </div>
</div>`,
  },
  {
    id: "effect-gradient-text",
    name: "Gradient Text",
    category: "Effects",
    tags: ["text", "gradient", "animated"],
    code: `<h2 class="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Gradient Text</h2>`,
  },
  {
    id: "effect-glow",
    name: "Glow Border",
    category: "Effects",
    tags: ["glow", "border", "neon"],
    code: `<div class="w-72 h-32 rounded-2xl bg-zinc-900 border border-blue-500/50 flex items-center justify-center" style="box-shadow:0 0 20px rgba(59,130,246,0.3),inset 0 0 20px rgba(59,130,246,0.1)">
  <span class="text-blue-300 font-semibold">Glow Effect</span>
</div>`,
  },
  {
    id: "effect-blur-bg",
    name: "Blur Background",
    category: "Effects",
    tags: ["blur", "background", "depth"],
    code: `<div class="relative w-72 h-40 rounded-2xl overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-rose-500 via-amber-500 to-emerald-500"></div>
  <div class="absolute top-4 left-4 w-16 h-16 rounded-full bg-blue-500 blur-2xl opacity-70"></div>
  <div class="absolute bottom-4 right-4 w-20 h-20 rounded-full bg-purple-500 blur-2xl opacity-70"></div>
  <div class="relative h-full flex items-center justify-center">
    <span class="text-white font-semibold">Blur Depth</span>
  </div>
</div>`,
  },
  // ─────────── EXTRACTED CATALOG (real code from upstream sources) ───────────
   ...componentsJsonCatalog,
 ];

export function makePreviewHtml(code: string): string {
  return `<!DOCTYPE html>
<html class="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={darkMode:'class'}</script>
<style>body{margin:0;background:#09090b;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;box-sizing:border-box;}</style>
</head>
<body>${code}</body>
</html>`;
}
