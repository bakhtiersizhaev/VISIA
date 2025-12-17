# Task List - VISIA

## Phase 1: Foundation & Setup

- [x] **Project Initialization** <!-- id: 1 -->
  - [x] Initialize Next.js 14 app with TypeScript, Tailwind, ESLint. <!-- id: 2 -->
  - [x] Install Shadcn/UI and core components (Button, Input, Card, Dialog). <!-- id: 3 -->
  - [x] Install dependencies: `framer-motion`, `lucide-react`, `zustand`, `@fal-ai/client`. <!-- id: 4 -->
  - [x] Configure `index.css` with premium variables (CSS variables for colors, radius). <!-- id: 5 -->

## Phase 2: Infrastructure & Auth

- [ ] **Supabase Setup** <!-- id: 6 -->
  - [x] Create Supabase project (User to do this). <!-- id: 7 -->
  - [x] Connect Supabase to Next.js (Env vars). <!-- id: 8 -->
  - [x] Implement Google Auth with Supabase Auth UI / Custom UI. <!-- id: 9 -->
  - [x] Create `users` table in DB (id, email, token_balance). <!-- id: 10 -->

## Phase 3: Core UI (Vibecoding)

- [x] **Layout & Navigation** <!-- id: 11 -->
  - [x] Create responsive App Shell (Sidebar for desktop, Bottom nav/Hamburger for mobile). <!-- id: 12 -->
  - [x] Implement "Token Balance" display. <!-- id: 13 -->
- [x] **Generation Interface** <!-- id: 14 -->
  - [x] Create `ModelSelector` component (Refactored into Command Center). <!-- id: 15 -->
  - [x] Create `PromptInput` component (Integrated). <!-- id: 16 -->
  - [x] Create `ImageUploader` component (Integrated). <!-- id: 17 -->
  - [x] Create `SettingsPanel` (Pills & Command Center). <!-- id: 18 -->

## Phase 4: AI Integration (fal.ai)

- [x] **Backend Proxy** <!-- id: 19 -->
  - [x] Setup Next.js API route for fal.ai proxy (`/api/fal/proxy`). <!-- id: 20 -->
- [x] **Frontend Logic** <!-- id: 21 -->
  - [x] Implement `useGeneration` hook (handles loading, error, success). <!-- id: 22 -->
  - [x] Connect `Text-to-Image` flow (Flux/SDXL). <!-- id: 23 -->
  - [x] Connect `Image-to-Image` flow. <!-- id: 24 -->

## Phase 5: Polish & Launch

- [ ] **Refinement** <!-- id: 25 -->
  - [x] Add loading skeletons and micro-animations. <!-- id: 26 -->
  - [x] Mobile responsiveness check. <!-- id: 27 -->
  - [ ] Error handling (Toasts). <!-- id: 28 -->

## Phase 6: Parallel Generation & UX Improvements

- [x] **Smart Image Grid** <!-- id: 29 -->
  - [x] Implement adaptive centering (1 image = center, 2 = side-by-side, 3+ = grid) <!-- id: 30 -->
  - [x] Add smooth animations for image appearance <!-- id: 31 -->

- [x] **Parallel Generation Queue** <!-- id: 32 -->
  - [x] Create GenerationJob interface and state management <!-- id: 33 -->
  - [x] Refactor generateImage to support multiple concurrent jobs <!-- id: 34 -->
  - [x] Implement job cards with progress indicators <!-- id: 35 -->
  - [x] Add cancel button for each running job <!-- id: 36 -->
  - [x] Set max parallel jobs limit (5) <!-- id: 37 -->

- [x] **Results Feed Gallery** <!-- id: 38 -->
  - [x] Create feed-style layout with job grouping <!-- id: 39 -->
  - [x] Show model name + prompt for each job group <!-- id: 40 -->
  - [x] Implement smooth scroll and animations <!-- id: 41 -->
  - [x] Add thumbnail previews with zoom capability <!-- id: 42 -->

- [x] **Compare Mode** <!-- id: 43 -->
  - [x] Add toggle for Compare Models mode <!-- id: 44 -->
  - [x] Implement multi-model selection with checkboxes <!-- id: 45 -->
  - [x] Generate with multiple models in single action <!-- id: 46 -->
  - [x] Display total cost for all selected models <!-- id: 47 -->

