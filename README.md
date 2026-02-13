# Backpacking Game

A survival-based backpacking game built as a web application using Next.js, Supabase, and Three.js.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Supabase** - Authentication and PostgreSQL database
- **Three.js / React Three Fiber** - 3D globe visualization
- **Zustand** - State management
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

Copy `.env.local.example` to `.env.local` and add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/
│   ├── Globe/        # Three.js 3D globe component
│   ├── UI/           # Game UI components (resources, inventory)
│   └── Auth/         # Authentication forms
├── lib/              # Utilities and Supabase client
├── store/            # Zustand state management
└── types/            # TypeScript type definitions
```

## Features

- 🌍 Interactive 3D globe with location markers
- 🎒 Resource management (food, water, energy)
- 📦 Inventory system
- 🚶 Location-based travel mechanics
- 💾 Cloud saves with Supabase
- 🔐 User authentication

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Next Steps

1. Set up Supabase project and database schema
2. Create authentication pages
3. Build 3D globe component with location markers
4. Implement game mechanics and UI
5. Deploy to Vercel

## License

MIT
