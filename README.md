# VISIA - AI Imagination Studio

![VISIA Banner](https://via.placeholder.com/1200x400?text=VISIA+AI+Studio)

VISIA is a next-generation AI image generation platform built with **Next.js 14**, **Tailwind CSS**, and **fal.ai**. It features a premium, glassmorphic UI and supports multiple state-of-the-art AI models including Flux, SDXL, and more.

## ✨ Features

- **Multi-Model Support**: Switch seamlessly between Nano Banana, Seedream, and ImagineArt models.
- **Real-time Generation**: Lightning-fast inference via fal.ai serverless GPUs.
- **Premium UI/UX**: Glassmorphism design, smooth animations (Framer Motion), and responsive layout.
- **Secure Architecture**: Server-side proxy for API keys using Next.js API Routes.
- **Type-Safe**: Built with TypeScript and strict type checking.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
- **AI Inference**: [fal.ai](https://fal.ai/)
- **State Management**: React Hooks / Zustand
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- A [fal.ai](https://fal.ai) API key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/visia.git
   cd visia
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Copy the example env file and add your fal.ai key:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:

   ```env
   FAL_KEY=your_fal_ai_key_here
   ```

4. **Run the Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
src/
├── app/              # Next.js App Router pages and API routes
├── components/       # React components
│   ├── ui/           # Reusable UI components (Buttons, Inputs, etc.)
│   └── ...           # Feature-specific components
├── lib/              # Utilities, hooks, and constants
└── ...
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
