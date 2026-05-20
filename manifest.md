<!-- Phase 17 — Reverted Expertise scrollbar [COMPLETE] -->
<!-- Fix: Removed max-height/overflow from .terminalBody in Expertise.module.css per user request -->
<!-- Deployed hosting only. Build: clean. Exit code: 0 -->

## 1. Project Goal
Resolve inconsistencies in the RAG-powered chatbot by refining retrieval logic and system prompts. Implement the "Explore All Projects" gallery page to provide a cohesive browsing experience for all dynamic content.

## 2. Actionable Task List

### Phase 1-7: COMPLETED (See legacy manifest for details)
- [x] Foundation & UI Redesign
- [x] Dynamic Content & Backend Integration
- [x] Admin Suite (CMS)
- [x] Maintenance & Optimization
- [x] ChatBot API Migration & Enhancement
- [x] RAG-Powered ChatBot Implementation
- [x] Node.js 22 Upgrade

### Phase 8: RAG Refinement & Diagnostics
- [x] **RAG Logic Optimization**
    - [x] Increase `limit` in `findNearest` for more comprehensive retrieval.
    - [x] Refine `buildSystemPrompt` to be stricter about context usage and hallucination prevention.
    - [x] Implement source attribution in chatbot responses (e.g., "[Source: Project X]").
- [x] **Context Verification & Diagnostics**
    - [x] Update `chatWithRAG` function to return context chunks when `debug: true`.
    - [x] Add a "Diagnostic Mode" toggle in the ChatBot UI to view retrieved chunks.
    - [x] Verify `embeddedText` consistency across all collections.

### Phase 9: Project Gallery Implementation
- [x] **Gallery Page Development**
    - [x] Create `src/app/projects/page.tsx`.
    - [x] Implement a full-width grid layout optimized for large project lists.
    - [x] Add filtering/sorting capabilities (by category).
    - [x] Ensure consistent styling with the main `ProjectGrid`.
- [x] **Navigation & Routing Improvements**
    - [x] Update `Header.tsx` to include an explicit "Gallery" link.
    - [x] Verify `router.push('/projects')` calls in `ProjectGrid.tsx`.
    - [x] Add search functionality to the Gallery page (UI is there, ensure logic is robust).

### Phase 10: Final Deployment & Verification
- [x] **Build & Validation**
    - [x] Run `npm run build` in root to verify frontend integrity.
    - [x] Run `npm run build` in `functions` to verify backend integrity.
- [x] **Firebase Deployment**
    - [x] Deploy hosting and functions using `firebase deploy`.
- [ ] **Live Verification**
    - [ ] Verify the Gallery page is accessible at `/projects`.
    - [ ] Test ChatBot source citations and diagnostic mode on the live site.

### Phase 11: ChatBot UI Refinements
- [x] **Simplify Interface**
    - [x] Remove "Minimize" button from ChatBot header.
    - [x] Remove model selection dropdown from ChatBot UI.
    - [x] Hardcode model to `openai/gpt-4o-mini`.
- [x] **Cleanup & Maintenance**
    - [x] Fix code corruption/duplication in `ChatBot.tsx`.
    - [x] Remove unused model constants.

### Phase 12: ChatBot Contact Info Integration
- [x] **System Prompt Update**
    - [x] Add dynamic contact information to the system prompt.
    - [x] Instruct the AI to provide contact details (Email, Phone, Socials) when requested.
- [x] **Backend Integration**
    - [x] Fetch `site_settings/general` in `chatWithRAG` Cloud Function.
    - [x] Pass real-time contact data to the prompt builder.

### Phase 13: ChatBot Vouching & Expertise Logic
- [x] **Prompts Refinement**
    - [x] Add operational rule to "vouch" for Jhon when asked about his competence.
    - [x] Instruct AI to use contextually retrieved projects/skills as evidence.
- [x] **Deployment**
    - [x] Re-deploy Cloud Functions with updated system prompt logic.

### Phase 15: AI Configuration Management
- [x] **Admin Dashboard Integration**
    - [x] Create `src/components/admin/AIConfigManager` component.
    - [x] Add controls for:
        - ChatBot Model selection.
        - System Prompt Personality/Instructions (Custom Overrides).
    - [x] Add "AI Bot" tab to `src/app/admin/dashboard/page.tsx`.
- [x] **Data Persistence**
    - [x] Save configuration to `site_settings/ai` document in Firestore.
- [x] Create AI configuration interface in Admin Dashboard
- [x] Update Cloud Function `chatWithRAG` to fetch and apply AI settings
- [x] Refine ChatBot UI: Remove minimize button from header
- [x] Refine AI Behavioral Rules in system prompt (vouching/contact info/bias handling)
- [ ] Perform final live validation of AI behavior

## 3. Dependency Map
- Gallery page depends on `src/lib/projects.ts` for data fetching.
- RAG refinement depends on Firebase Cloud Functions deployment.

## 4. Fallback Plan
- If vector search remains inconsistent, implement a keyword-based fallback or hybrid search.
- If gallery filtering is complex, start with a basic chronologically ordered grid.

## 5. Validation Criteria
- [ ] Chatbot answers accurately reflect Firestore content.
- [ ] Chatbot explicitly cites its sources or admits if info is missing.
- [x] `/projects` page loads and displays all available projects from Firestore.
- [x] Filtering on the gallery page works correctly.
- [x] Chatbot diagnostic mode correctly displays retrieved context.

### Phase 16: Expertise Section Overflow Fix [SUPERSEDED]
- [x] **Layout Constraint**
    - [x] Add `max-height: 480px` + `overflow-y: auto` to `.terminalBody` so the terminal window never expands beyond the viewport when many skills are added.
    - [x] Add a styled cyan scrollbar (thin, theme-matching) for the terminal aesthetic.
    - [x] Merge the separate prompt-line `<div>` into the main grid body so `grid-column: 1 / -1` correctly spans full width.
    - [x] Set `grid-template-columns: 1fr` on mobile to prevent column squishing.

### Phase 17: Expertise Layout Restoration
- [x] **Revert Scrolling**
    - [x] Remove `max-height` and `overflow-y` from `.terminalBody`.
    - [x] Remove custom scrollbar styles.
- [x] **Deployment**
    - [x] Run `npm run deploy` to update the live site.

### Phase 18: Multiple Flexible Project Images
- [x] **Data Structure**
    - [x] Update `Project` interface to include `imageUrls: string[]`.
    - [x] Maintain backwards compatibility with `imageUrl: string`.
- [x] **Admin Project Upload**
    - [x] Update `ProjectsManager.tsx` to accept multiple files natively.
    - [x] Upload all selected images to Firebase storage.
    - [x] Save `imageUrls` array to Firestore project document.
- [x] **Project Detail Gallery**
    - [x] Update `ProjectDetailClient.tsx` to iterate through and render all images.
    - [x] Update `ProjectDetail.module.css` to use `height: auto` and `object-fit: contain` for flexible sizing that preserves aspect ratio instead of cropping.
- [x] **Deployment**
    - [x] Run `npm run deploy` to update the live site.

### Phase 19: Profile Section & Branding Refactor (Completed)
- Goal: Create a dedicated Profile section and update the Navbar branding.
- Tasks:
  - Remove logo image from Navbar and add a sleek CSS-based monogram.
  - Create `Profile.tsx` to display personal information.
  - Insert Profile component as the second section on the main page.
  - Build `ProfileConfigManager` in the Admin Dashboard for dynamic updates.
- Validation: The Profile section appears correctly, and content can be updated from the Admin Dashboard.
- Output: Updated frontend and admin components, deployed to live site.

### Phase 20: Remove Name from Navbar (Completed)
- Goal: Remove Jhon's name from the header/navbar, leaving only the monogram.
- Tasks:
  - [x] Remove `Jhon Verille` `<h1 className={styles.nameHeader}>Jhon Verille</h1>` from `src/components/layout/Header.tsx`.
  - [x] Verify that header styling and monogram remain intact and look premium.
  - [x] Run next.js build to verify there are no compilation errors.
  - [x] Deploy to live using `npm run deploy`.
- Validation:
  - [x] Jhon's name is completely removed from the navbar.
  - [x] The monogram (JV logo) and links remain, aligned properly.
  - [x] Build is clean without errors.
  - [x] Deployment is successful and the live site reflects changes.

### Phase 21: Remove 3D Components Except Black Hole (Completed)
- Goal: Remove the 3D components (`DataCoreObject`, `NetworkObject`, `HoloCubeObject`, `PulseSphereObject`) from each section, keeping only the black hole (`AbyssObject`).
- Tasks:
  - [x] Remove imports and usage of `DataCoreObject`, `NetworkObject`, `HoloCubeObject`, and `PulseSphereObject` from `src/components/3d/Scene.tsx`.
  - [x] Verify that only `AbyssObject` (the black hole) remains in the scene.
  - [x] Run next.js build to verify that everything compiles cleanly.
  - [x] Deploy live to production.
- Validation:
  - [x] Only the black hole 3D component is rendered on the site.
  - [x] No compilation errors.
  - [x] Deploy is successful.

### Phase 22: CMS Image Uploads & UI Polishing (Completed)
- Goal: Improve admin dashboard inputs and enhance frontend scroll animations.
- Tasks:
  - [x] Update `ProfileConfigManager` to support direct image upload for Profile Picture.
  - [x] Update `ProfileConfigManager` to support direct file upload for Resume.
  - [x] Update `ProfileConfigManager` to gracefully handle `linkedinUrl` and `githubUrl` without strict browser validation blocking (auto-append `https://`).
  - [x] Update `TestimonialsManager` to support direct image upload for Avatar.
  - [x] Fix duplicate "Overview" description rendering in `ProjectDetailClient.tsx` hero section.
  - [x] Add GSAP `ScrollTrigger` fade-in animations to `Profile` and `ContactForm` frontend sections.
- Validation:
  - [x] All file uploads work and save URLs to Firestore properly.
  - [x] Duplicate descriptions are removed.
  - [x] Frontend animations fire correctly on scroll.
  - [x] Run next.js build to verify there are no compilation errors.
  - [ ] Deploy live to production.

## 6. Error Log
- **Task ID**: EXPLORE_PROJECTS_FUNCTION_MISSING
- **Error**: "Explore All Projects" button navigates to a non-existent or empty page.
- **Root Cause**: `src/app/projects/page.tsx` was never implemented.
- **Resolution**: Implementation completed in Phase 9.

- **Task ID**: EXPERTISE_TERMINAL_OVERFLOW
- **Error**: Adding more skills/technologies caused the Expertise terminal window to grow beyond the visible viewport.
- **Root Cause**: `.terminalBody` had no height constraint, so it expanded indefinitely with content.
- **Resolution**: Added `max-height` + `overflow-y: auto` with a themed scrollbar in Phase 16.
