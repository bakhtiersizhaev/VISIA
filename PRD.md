# Product Requirements Document (PRD) - VISIA

## 1. Product Overview

VISIA is a premium, mobile-responsive AI image generation platform. It serves as a unified interface for top-tier generative models (via fal.ai), allowing users to create and edit images (inpainting/outpainting) with ease.

**Key Philosophy**: "Vibecoding" — The interface must be stunning, fluid, and intuitive. No complex professional tools; just upload, prompt, and get results.

## 2. Core Features

### 2.1 Image Generation (Text-to-Image)

- **Model Selection**: Users can choose between different models (e.g., Flux Pro, Stable Diffusion 3, Mystic).
- **Prompting**: Text area for positive prompts.
- **Settings**: Aspect ratio selection, Number of images (Batch size).
- **Output**: High-quality preview with download option.

### 2.2 Image Editing (Image-to-Image / Inpainting)

- **Reference Upload**: Simple drag-and-drop or file selection for reference images.
- **Workflow**: Upload Image -> (Optional) Masking/Settings -> Prompt -> Generate.
- **Mobile First**: The upload and edit flow must be touch-friendly.

### 2.3 User System & Tokenomics

- **Authentication**: Google Login only (via Supabase Auth).
- **Token System**:
  - Users have a token balance.
  - Each generation deducts tokens based on model cost.
  - Simple "Top Up" placeholder UI for now.
- **Privacy**: Private workspace. No public gallery.
- **Ephemeral Storage**: Images are not permanently stored on the server. If the user leaves the session without downloading, the images are lost.

## 3. Technical Stack (Budget & Portfolio Friendly)

### 3.1 Frontend

- **Framework**: **Next.js 14** (App Router) - The industry standard for React apps.
- **Language**: **TypeScript** - For type safety and clean code.
- **Styling**: **Tailwind CSS** - For rapid, custom styling.
- **UI Library**: **Shadcn/UI** - For accessible, premium-looking components.
- **Animations**: **Framer Motion** - To add the "wow" factor.
- **State Management**: **Zustand** - Lightweight state for managing generation settings.

### 3.2 Backend & Infrastructure

- **BaaS (Backend-as-a-Service)**: **Supabase** (Free Tier).
  - **Auth**: Google OAuth provider.
  - **Database**: PostgreSQL for User profiles and Token balances.
- **AI Provider**: **fal.ai**.
  - Uses `@fal-ai/client` for frontend interactions (via proxy).
  - Uses `@fal-ai/server-proxy` in Next.js API routes to secure keys.
- **Hosting**: **Vercel** (Free Tier) - Native support for Next.js.

## 4. User Flow

1.  **Landing**: Beautiful hero section explaining the tool -> "Login with Google".
2.  **Workspace (Main App)**:
    - Sidebar/Header: Token balance, Model selector.
    - Main Area:
      - **Input**: Prompt box, Image uploader (if needed), Settings (Aspect Ratio, Count).
      - **Output**: Grid of generated images.
    - **Action**: "Generate" button (shows cost in tokens).
3.  **Result**:
    - Loading skeleton/animation while generating.
    - Images appear. User can click to expand and Download.

## 5. Future Proofing

- The architecture allows easily swapping AI models (just changing the fal.ai endpoint ID).
- Supabase allows scaling to millions of users if needed.
