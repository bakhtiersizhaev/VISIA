# Task List - VISIA

## Phase 1: Foundation & Setup

- [x] **Project Initialization** <!-- id: 1 -->
  - [x] Initialize Next.js 14 app with TypeScript, Tailwind, ESLint. <!-- id: 2 -->
  - [x] Install Shadcn/UI and core components (Button, Input, Card, Dialog). <!-- id: 3 -->
  - [x] Install dependencies: `framer-motion`, `lucide-react`, `zustand`, `@fal-ai/client`. <!-- id: 4 -->
  - [x] Configure `index.css` with premium variables (CSS variables for colors, radius). <!-- id: 5 -->

## Phase 2: Infrastructure & Auth

- [ ] **Supabase Setup** <!-- id: 6 -->
  - [ ] Create Supabase project (User to do this). <!-- id: 7 -->
  - [ ] Connect Supabase to Next.js (Env vars). <!-- id: 8 -->
  - [ ] Implement Google Auth with Supabase Auth UI / Custom UI. <!-- id: 9 -->
  - [ ] Create `users` table in DB (id, email, token_balance). <!-- id: 10 -->

## Phase 3: Core UI (Vibecoding)

- [ ] **Layout & Navigation** <!-- id: 11 -->
  - [ ] Create responsive App Shell (Sidebar for desktop, Bottom nav/Hamburger for mobile). <!-- id: 12 -->
  - [ ] Implement "Token Balance" display. <!-- id: 13 -->
- [ ] **Generation Interface** <!-- id: 14 -->
  - [x] Create `ModelSelector` component (Visual cards for models). <!-- id: 15 -->
  - [x] Create `PromptInput` component (Textarea with auto-resize). <!-- id: 16 -->
  - [ ] Create `ImageUploader` component (Drag & drop, preview). <!-- id: 17 -->
  - [ ] Create `SettingsPanel` (Aspect ratio, count). <!-- id: 18 -->

## Phase 4: AI Integration (fal.ai)

- [x] **Backend Proxy** <!-- id: 19 -->
  - [x] Setup Next.js API route for fal.ai proxy (`/api/fal/proxy`). <!-- id: 20 -->
- [ ] **Frontend Logic** <!-- id: 21 -->
  - [x] Implement `useGeneration` hook (handles loading, error, success). <!-- id: 22 -->
  - [x] Connect `Text-to-Image` flow (Flux/SDXL). <!-- id: 23 -->
  - [ ] Connect `Image-to-Image` flow. <!-- id: 24 -->

## Phase 5: Polish & Launch

- [ ] **Refinement** <!-- id: 25 -->
  - [ ] Add loading skeletons and micro-animations. <!-- id: 26 -->
  - [ ] Mobile responsiveness check. <!-- id: 27 -->
  - [ ] Error handling (Toasts). <!-- id: 28 -->
