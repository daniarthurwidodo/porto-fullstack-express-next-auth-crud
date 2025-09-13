# Frontend - Next.js + TypeScript + Radix UI

A modern frontend application built with Next.js 14, TypeScript, Radix UI, and Lucide icons.

## Features

- **Next.js 14** - App Router with React Server Components
- **TypeScript** - Full type safety and IntelliSense
- **Radix UI** - Headless, accessible UI components
- **Lucide React** - Beautiful, customizable icons
- **Tailwind CSS** - Utility-first CSS framework
- **Dark Mode** - Built-in theme support

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with CSS Variables
- **Components**: Radix UI Primitives
- **Icons**: Lucide React
- **Utils**: class-variance-authority, clsx, tailwind-merge

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles with CSS variables
│   │   ├── layout.tsx           # Root layout component
│   │   └── page.tsx             # Home page
│   ├── components/
│   │   └── ui/                  # Reusable UI components
│   │       ├── button.tsx       # Button component
│   │       ├── card.tsx         # Card components
│   │       ├── badge.tsx        # Badge component
│   │       └── separator.tsx    # Separator component
│   └── lib/
│       └── utils.ts             # Utility functions
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## Components

### UI Components

All UI components are built with Radix UI primitives and styled with Tailwind CSS:

- **Button** - Multiple variants (default, outline, ghost, etc.)
- **Card** - Flexible card layout with header, content, footer
- **Badge** - Status indicators and labels
- **Separator** - Visual dividers

### Icons

Uses Lucide React for consistent, beautiful icons:

```tsx
import { User, Shield, Database } from 'lucide-react'

<User className="h-5 w-5" />
```

## Styling

### Tailwind CSS

The project uses Tailwind CSS with a custom configuration that includes:

- CSS variables for theming
- Dark mode support
- Custom color palette
- Radix UI compatible animations

### Theme System

Built-in light/dark theme support using CSS variables:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

## Development

### Adding New Components

1. Create component in `src/components/ui/`
2. Use Radix UI primitives when possible
3. Style with Tailwind CSS classes
4. Export from component file

### Type Safety

The project uses strict TypeScript configuration:

- All components are fully typed
- Props interfaces defined
- Path aliases configured (`@/` for `src/`)

## Building for Production

```bash
npm run build
npm start
```

The build is optimized for performance with:

- Static generation where possible
- Code splitting
- Image optimization
- CSS optimization

## Integration with Backend

The frontend is designed to work with the Express.js backend:

- API calls to `http://localhost:4001`
- JWT token authentication
- User management features
- CORS configured for development

## Contributing

1. Follow TypeScript best practices
2. Use Radix UI components for accessibility
3. Maintain consistent styling with Tailwind
4. Add proper type definitions
5. Test components thoroughly
