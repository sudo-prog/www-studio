export interface ComponentItem {
  id: string;
  name: string;
  category: string;
  tags: string[];
  code: string;
}

export const CATEGORIES = [
  "All",
  "Loading UI",
  "Buttons",
  "Cards",
  "Forms",
  "Tooltips",
  "Navigation",
  "Badges",
  "Modals",
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
