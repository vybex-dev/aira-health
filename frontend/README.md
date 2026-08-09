# Aira — frontend

React 19 + TypeScript + Vite + Tailwind CSS v4, with a Three.js-based signature
"orb" UI element via `@react-three/fiber`.

See the [root README](../README.md) for full setup, architecture, and deployment
instructions. Quick start:

```bash
npm install
cp .env.example .env    # fill in your Firebase web app config
npm run dev              # http://localhost:5173
```

## Scripts

- `npm run dev` — start the Vite dev server (proxies `/api` to `localhost:8787`)
- `npm run build` — type-check and build for production into `dist/`
- `npm run preview` — serve the production build locally
- `npm run lint` — run oxlint

## Structure

```
src/
├── components/
│   ├── three/       AiraOrb (signature 3D element) + ambient background field
│   ├── layout/       Navbar, Footer, AppShell, ProtectedRoute, ErrorBoundary
│   ├── landing/       Marketing page sections
│   └── ui/            Small shared primitives (badges, etc.)
├── pages/             Route-level page components
├── hooks/             useAuthSync — syncs Firebase auth + profile into store
├── store/             Zustand stores (auth, orb visual state)
├── lib/               firebase.ts, firestore.ts, api.ts (backend client)
└── types/             Shared TypeScript types
```
