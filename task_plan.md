# Task Plan: AI Browser Agent + Password Login + Vercel Deploy + Git Push

## Goal
Add browser-based AI agent (agent-browser integration), URL-to-library import, password-only login with local persistence, Vercel CLI build verification, and push to git with updated agent_notes.md.

## Current Phase
Phase 1

## Phases

### Phase 1: Agent Browser Integration
- [ ] Install @agent-native/browser package
- [ ] Create AI browser tool (browse URL, extract page elements, take screenshots)
- [ ] Add "Import from URL" feature to extract page elements into the library
- [ ] Wire into AiChatWidget as a new tool
- **Status:** in_progress

### Phase 2: Password-Only Login
- [ ] Add password-only login endpoint to api-server
- [ ] Add "save password" local persistence (localStorage)
- [ ] Wire into use-auth.ts with password-only flow
- [ ] Add login UI component
- **Status:** pending

### Phase 3: Vercel Build Verification
- [ ] Load Vercel skills
- [ ] Run Vercel CLI to confirm build
- **Status:** pending

### Phase 4: Documentation & Git
- [ ] Update agent_notes.md with all changes
- [ ] Git add, commit, push
- **Status:** pending

## Key Questions
1. Should agent-browser run client-side or via api-server proxy? (Client-side for direct browser access)
2. Password storage: localStorage with encryption or plain? (localStorage with basic obfuscation)
3. Vercel CLI: is it installed? (Check and install if needed)

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| agent-browser runs client-side | Direct browser access for page extraction |
| Password stored in localStorage | Simple, no backend needed for auth persistence |
| Password-only login via api-server | Reuses existing session infrastructure |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
</write_to_file>
</write_to_file>