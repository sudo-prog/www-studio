# MOBILE-UI-STANDARD (the anti-"builds pass but broken on mobile" bible)

> **READ THIS before building/editing ANY UI in this repo.** This is the shared mobile
> correctness standard for all Superpower Studio web apps (React/Vite/Tailwind PWAs on
> Vercel). It exists because we shipped "builds pass" three times while the phone still
> showed broken layouts. The root cause was always weak verification. This standard +
> the verification loop below makes a false pass impossible.
>
> Full skill with runnable harness: `mobile-ui-standards-bible` (Hermes profile
> `quality/mobile-ui-standards-bible/SKILL.md`). Research backing: iOS HIG, WCAG,
> thedaviddias/Front-End-Checklist, shadcn/ui.

## IRON RULES (what does NOT work — proven the hard way)
1. **git push ≠ prod deploy.** Verify the LIVE url, never localhost, never the git commit.
   `vercel deploy` from a subdir FAILS (no lockfile) — deploy from the repo root.
2. **Page-level overflow check is NOT enough.** `scrollWidth<=innerWidth+1` PASSED while
   398 elements overflowed. Scan PER-ELEMENT and exclude elements inside an
   `overflow-x:auto/scroll/hidden` ancestor (scrollable tables are correct, not bugs).
3. **Screenshots from a text-only model are unreliable.** Verify via DOM state, not pixels.
   Use OmniParser detection-only (YOLO+OCR) at `/home/thinkpad/Data/OmniParser/omni_detect.py`
   (Florence captioner needs CUDA `flash_attn` — bypassed on CPU).
4. **`waitUntil:'networkidle'` never fires on SPAs with SSE/AI.** Use `domcontentloaded` +
   a fixed 2.5s settle wait.
5. **Never trust a subagent's "success" report.** Re-run the build + verification yourself.
6. **Extend this repo's OWN tokens. Never import a foreign design system's CSS**
   (Material/antd-mobile/Ionic/Mantine/Chakra raw) — it causes token/z-index wars.
7. **`width:max-content` on tables is a mobile trap.** Use `display:block;width:100%;
   overflow-x:auto` so the table self-scrolls, capped to the viewport.
8. **Tailwind v4 + older mobile browsers drop oklab/color-mix colors.** Downlevel oklab/
   oklch/color-mix → rgb()/rgba() for prod (iOS <16.4, Android Chrome <113).

## MEASURABLE STANDARDS (every build must satisfy these)
**Touch & targets**
- T-1 Tap target ≥ 44×44px hit area (iOS HIG; WCAG 2.5.5). Prefer 48px. Visible control
  AND transparent hit area must meet it.
- T-2 No tap-swallow: when a menu/sheet is open, `elementFromPoint(center)` must resolve to
  the menu, not the toolbar.
- T-3 Touch parity: every desktop right-click action needs long-press (≥500ms) or a button.

**Safe area / viewport**
- S-1 Bottom-docked UI uses `env(safe-area-inset-bottom)` (+top/left/right), never bare
  `bottom:0`. Need `viewport-fit=cover`. Test at 390×844 (notched).
- S-2 New content renders within `[0,390]×[0,844]`. Never spawn at hardcoded desktop coords.
- S-3 Mobile menus = bottom sheet at ≤767px (full width, scrim, above toolbar z-index).
- S-4 Use `100dvh`, not `100vh` (dynamic mobile toolbars).

**Layout / overflow**
- L-1 No horizontal overflow PER ELEMENT: every in-flow element's `right ≤ 390+1` on a
  390px viewport, EXCLUDING elements inside an `overflow-x:auto/scroll/hidden` ancestor.
- L-2 Wide `<table>`s: self-scroll OR card/stacked layout. Never `width:max-content`
  without a scroll wrapper.
- L-3 Flex rows wrap (`flex-wrap`) or stack to column at ≤640px.
- L-4 No fixed min-width / hardcoded px widths wider than the viewport on mobile.
- L-5 Content fits 320px (WCAG 1.4.10 reflow).

**Color / contrast**
- C-1 Downlevel oklab/color-mix for prod (Iron Rule 8).
- C-2 Contrast ≥ 4.5:1 text (WCAG 1.4.3); ≥3:1 large text/UI.
- C-3 Don't rely on color alone to convey state (WCAG 1.4.1).

**PWA / install**
- P-1 iOS Safari has NO inline install prompt (`beforeinstallprompt` never fires). Detect
  `isIOSSafari` and show "Share → Add to Home Screen" instead of a (disabled) install button.

## DESIGN SYSTEMS — what to use
- **Component base: shadcn/ui (+Radix)** — copy-in, AI-Ready, Tailwind-native, no foreign
  tokens. `Sheet side="bottom"` + vaul Drawer = native bottom sheets.
- **Styling: Tailwind** responsive + container queries + `env(safe-area-inset-*)`.
- **Reference patterns only (do NOT npm i raw):** Material 3, Ant Design Mobile, Ionic
  (bottom sheet, FAB, swipe, pull-to-refresh, safe-area).
- **Rejected for a Tailwind PWA:** Mantine, Chakra (dual styling engines = token-war trap).
- **Verification gate backbone:** thedaviddias/Front-End-Checklist (385 rules, ships MCP
  `mcp.frontendchecklist.io`) — pair with the loop below.

## VERIFICATION LOOP (run BEFORE any "fixed" claim)
1. Edit → 2. **commit + push** → 3. **deploy from repo root** (or git-push auto-deploy) →
4. **run the per-element Playwright harness against the LIVE url** (see the
   `mobile-ui-standards-bible` skill §2 for the full script: all routes, PIN unlock,
   scroll-container exclusion, touch-target ≥44px, SSE-aware wait, single JSON PASS/FAIL
   gate) → 5. if any gate fails, fix root cause, rebuild, redeploy, re-verify.
6. Only THEN claim fixed — with the harness PASS output as evidence.

**Gate assertions (all must pass):** `docOverflow ≤ 2`; `realOff === 0`; `consoleErrs === 0`;
`smallTaps === 0`.

---
*Adopted 2026-07-16 from the `mobile-ui-standards-bible` initiative (kanban board
`mobile-ui-standards-bible`). Sources: iOS HIG, WCAG 2.5.5/1.4.10, web.dev responsive,
thedaviddias/Front-End-Checklist, shadcn/ui, awesome-design-md.*
