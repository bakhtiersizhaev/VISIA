# VISIA Project Status & Documentation

**Date:** 2025-12-04
**Status:** Alpha / Active Development

## 1. Project Overview
VISIA is a premium AI image generation platform built with Next.js and fal.ai. It aims to provide a high-end, "vibecoding" experience with a dark emerald aesthetic.

## 2. Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI (Radix Primitives)
- **AI Provider:** fal.ai (Nano Banana, Seedream, ImagineArt)
- **Icons:** Lucide React
- **State Management:** React `useState` (Local)

## 3. Current Status
### ✅ Working Features
- **Project Setup:** Next.js app initialized, dependencies installed.
- **AI Integration:** `fal.ai` proxy set up (`/api/fal/proxy`), generation works via API.
- **Model Selection:** `ModelSelector` component allows switching between Nano Banana, Seedream, etc.
- **Dynamic Inputs:** UI automatically adapts to show relevant parameters (Aspect Ratio, Image Size) based on the selected model configuration in `models.ts`.
- **Dark Theme:** Global "Dark Emerald" theme implemented (`globals.css`), forced dark mode in `layout.tsx`.
- **Premium UI:** Glassmorphism, glow effects, and gradient backgrounds implemented.
- **UI Fixes:** Dropdown menus (Model & Aspect Ratio) are now fully functional with solid opaque black backgrounds and correct cursor styles. Selection issues resolved.

### ⚠️ Known Issues & Blockers
- **History:** Generated images are lost on refresh. Need to implement local storage or database persistence.
- **Error Handling:** Still relies on console logs. Needs UI toasts.

## 4. Project Structure
- `src/app/page.tsx`: Main application logic. Handles state (model, prompt, inputs), generation flow, and renders the UI.
- `src/lib/models.ts`: Configuration file for AI models. Defines IDs, names, and specific input parameters (e.g., `image_size` for Nano Banana, `aspect_ratio` for Seedream).
- `src/components/model-selector.tsx`: Dropdown component for choosing the AI model.
- `src/components/ui/select.tsx`: Custom Select component (Shadcn/UI based) for parameters like Aspect Ratio.
- `src/app/globals.css`: Global styles, including the "Dark Emerald" color palette variables.
- `src/app/api/fal/proxy/route.ts`: Secure proxy for fal.ai API calls.

## 5. Next Steps (To-Do)
1.  **Image History:** Implement a gallery to save and view previously generated images.
2.  **Image Upload:** Implement drag-and-drop upload for Image-to-Image models (Nano Banana Edit, Seedream Edit).
3.  **Error Toasts:** Add `sonner` or `react-hot-toast` for better error feedback.
4.  **Mobile Responsiveness:** Verify and tweak UI for mobile devices.

## 6. Context for Next Session
We successfully fixed the **UI overlap** and implemented the **Premium Redesign**.
- **Last Action:** Verified generation of a "cute robot" image with the new UI.
- **Immediate Goal:** Start working on **Image Upload** or **History**.
- **User Feedback:** The design is now much better ("not like an old man's site").

