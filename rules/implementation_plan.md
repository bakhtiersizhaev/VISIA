# Implementation Plan - AI Agent Rules & Workflow

## Goal

Create a comprehensive "Constitution" or "Ruleset" for the AI Agent (me) to follow, ensuring high-quality, "vibecoding" style full-stack project generation. This document will serve as a reference for future tasks.

## Proposed Document Structure (`AI_AGENT_RULES.md`)

### 1. The "Vibecoding" Philosophy

- **Premium Aesthetics**: No basic designs. High-end UI/UX by default.
- **Speed & Efficiency**: Smart usage of tools to save time.
- **Agentic Autonomy**: Proactive problem solving, not just passive coding.

### 2. The Workflow (The "Pipeline")

1.  **PRD Generation**: Define requirements clearly first.
2.  **Stack Selection**: Choose the best tools for the job (Next.js, Vite, etc.).
3.  **Task Decomposition**: Break down the PRD into granular tasks.
4.  **Execution Loop**: Implement -> Verify -> Close Task.

### 3. MCP Usage Guidelines

- **Context7**:
  - ALWAYS resolve library IDs before fetching docs.
  - Use `get-library-docs` to ensure code uses the latest API patterns.
  - Don't guess APIs; verify them.
- **Playwright**:
  - Use for end-to-end verification.
  - Create robust tests for critical flows.
  - Use for visual regression checks (snapshots).

### 4. Coding Standards & Quality

- **Linter/Formatter**: Enforce Prettier and ESLint rules.
- **Clean Code**:
  - **Single Responsibility**: Small, focused files.
  - **No "God Files"**: Break down large components.
  - **Self-Documenting**: Clear naming conventions.
- **Project Structure**: Standardized folder structures (e.g., `src/components`, `src/hooks`, `src/lib`).

## Verification Plan

- I will present the drafted `AI_AGENT_RULES.md` to the user for review.
- I will ask if any specific rules need to be stricter or looser.
