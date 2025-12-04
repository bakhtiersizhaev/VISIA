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

### ⚠️ Known Issues & Blockers
- **UI Overlap (Z-Index):** Dropdown menus (Select/Popover) are sometimes covered by other elements or have transparency issues, making them unreadable.
- **Design Quality:** The current design feels outdated ("like an old grandpa's site") and lacks the requested premium feel (glassmorphism, glow effects, better spacing).
- **Button Visibility:** The "Generate" button was previously hard to see or missing; fixed in code but needs visual verification.
- **Prompt Input:** Input fields need better styling (glass effect) to match the premium theme.

## 4. Project Structure
- `src/app/page.tsx`: Main application logic. Handles state (model, prompt, inputs), generation flow, and renders the UI.
- `src/lib/models.ts`: Configuration file for AI models. Defines IDs, names, and specific input parameters (e.g., `image_size` for Nano Banana, `aspect_ratio` for Seedream).
- `src/components/model-selector.tsx`: Dropdown component for choosing the AI model.
- `src/components/ui/select.tsx`: Custom Select component (Shadcn/UI based) for parameters like Aspect Ratio.
- `src/app/globals.css`: Global styles, including the "Dark Emerald" color palette variables.
- `src/app/api/fal/proxy/route.ts`: Secure proxy for fal.ai API calls.

## 5. Next Steps (To-Do)
1.  **Fix UI Layering:** Ensure `z-index` for all dropdowns (Select, Popover) is set to `50` and they have a solid, non-transparent background (`bg-popover`) to prevent text overlap.
2.  **Premium Redesign:**
    - Implement true glassmorphism (`backdrop-blur`, semi-transparent backgrounds).
    - Add subtle glow effects (box-shadows) to active elements.
    - Improve typography and spacing (more "air").
3.  **Verify Inputs:** Ensure dynamic inputs (Aspect Ratio vs Image Size) render correctly for *every* model and send the correct parameters to the API.
4.  **Error Handling:** Better visual feedback for errors (toasts instead of just console logs).

## 6. Context for Next Session
We stopped while debugging the **UI overlap issue**.
- **Last Action:** Modified `model-selector.tsx` and `select.tsx` to add `z-50`, `bg-popover`, and `border-border`.
- **Immediate Goal:** Verify that the dropdowns now appear *on top* of other elements and are fully readable.
- **User Feedback:** The design needs to be significantly improved ("not like an old man's site"). Focus on aesthetics is critical.
