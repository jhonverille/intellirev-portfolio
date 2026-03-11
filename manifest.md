# Project Manifest: Jhon Verille Portfolio Expansion

## 1. Project Goal
Transition the portfolio from a static-data frontend to a dynamic, CMS-driven platform with full project case studies, an admin dashboard, and expanded content sections (About, Testimonials). Resolve SSL/Security issues for the custom domain.

## 2. Actionable Task List

### Phase 1: Foundation & UI Redesign (LOCKED)
- [x] Redesign Contact Section (Let's Talk)
- [x] Redesign Project Grid (Our Digital Creations)
- [x] Verification & Polish
- [x] 3D Web Experience Upgrades

### Phase 2: Dynamic Content & Backend Integration
- [x] **Firestore Service Implementation**
- [x] Create `src/lib/projects.ts` for project fetching/management.
- [x] Create `src/lib/testimonials.ts` for dynamic testimonial retrieval.
- [x] **Dynamic Project Routing**
- [x] Implement `src/app/projects/[id]/page.tsx` (Deep-dive case study).
- [x] Update `ProjectGrid.tsx` to fetch live Firestore data with clickable cards.
- [x] **Content Expansion**
- [x] Add **About / Expertise** section with terminal-inspired typography.
- [x] Add **Testimonials** section with glassmorphic cards.
- [x] **UI Polish & Alignment**
- [x] Standardize section padding, max-width, and header hierarchy across all homepage sections.
- [x] **Visual Content Creation**
- [x] Integrate project mockups (Manually managed by user).

### Phase 3: Admin Suite (CMS)
- [x] **Authentication Layer**
- [x] Implement Firebase Auth logic for admin login.
- [x] Create `/admin/login` page.
- [x] **Dashboard Implementation**
- [x] Create `/admin/dashboard` main layout.
- [x] Implement Project Management (CRUD capabilities).
- [x] Implement Inquiry Management (Read/Archive incoming messages).
- [x] Implement Site Details Management (Update Contact Info, Hero texts, etc.).
- [x] Implement Testimonials Management (CRUD for user feedback).

### Phase 4: Maintenance & Optimization
- [x] **Codebase Optimization & Cleanup**
- [x] Remove temporary/scratch files and stale build artifacts.
- [x] Refactor redundant code and duplicate interfaces.
- [x] Clean up unused/duplicate GSAP plugin registrations.
- [x] Validate directory structure and maintainability.
- [x] **Firebase Hosting Setup**
- [x] Initialize Firebase Hosting config for Static Export (`out` directory).
- [x] Add convenience `deploy` script to `package.json`.
- [x] Configure single-page-app rewrites to support client-side routing.
- [x] **SSL & Domain Security**
    - [x] Diagnose "Not Secure" warning for `portfolio.intellirev.space`. (Verified: Local Cache issue)
    - [x] Verify DNS records for the custom domain.
    - [x] Check Firebase Hosting SSL provisioning status.
- [x] **UI Branding & Standardization**
    - [x] Create `SectionHeader` component (monochrome gradient title + mono subtitle).
    - [x] Standardize all section headers (Expertise, Projects, Testimonials, Contact).
    - [x] Standardize Hero section header text design (Left-aligned as requested).
    - [x] Fix Navigation Links scrolling (Added scroll-offset and smooth-scroll handler).
    - [x] Standardize highlighted text globally (Hero, Expertise, Projects, Contact).

### Phase 5: Refinements & Admin Features
- [x] Fix initial headline flashing before new headline loads from CMS
- [x] Add "PHILIPPINES" text with a custom Philippines flag design to the Hero headline
- [x] Add an admin toggle to show/hide the "PHILIPPINES" custom text.
- [x] Change navigation bar name from JH_V_ALT to JHON VERILLE ALTERADO.
- [x] Update site logo and favicon with the provided image.
- [x] Audit and optimize the entire site for responsive mobile viewing.

## 3. Dependency Map
- Phase 2 relies on Firebase Storage for image hosting (or external links).
- Admin Suite depends on Auth and Firestore rules security.
- Project Details page depends on dynamic route params matching Firestore document IDs.

## 4. Contingency Plan (Plan B)
- If full Admin Auth is too complex for immediate needs, use a specialized `isAdmin` flag or temporary environment-locked access.
- If dynamic images load slowly, implement BlurHash/LQD placeholders.

## 5. Self-Healing Protocol
- **Error Detection**: 
    - Check for `FirebaseError` during data fetching.
    - Validate route parameters for 404 handling.
- **Recovery**: 
    - fallback to hardcoded `PROJECTS` if Firestore fetch fails (graceful degradation).
- **Validation**:
    - [ ] Project page renders correct data for specific IDs.
    - [ ] Admin dashboard successfully updates Firestore.

---

## 6. Error Log
- **Task ID**: SSL_SECURITY_PHANTOM
- **Error**: `portfolio.intellirev.space` reports "Not Secure" on user's local machine.
- **Root Cause**: Local cache of previous non-SSL sessions. External verification (SSL Labs) confirms A+ security.
- **Resolution**: Instructions provided to user to clear cache. Marking as **Verified External**.

- **Task ID**: FIREBASE_PERMISSION_DENIED
- **Error**: `FirebaseError: Missing or insufficient permissions` when fetching testimonials.
- **Root Cause**: Missing `allow read: if true;` for `testimonials` collection in `firestore.rules`.
- **Resolution**: Added explicit read rules for the collection. **Resolved**.
