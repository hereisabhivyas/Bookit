# Copilot Instructions for vibe-weaver-main

## Project Overview
- **Frontend**: Vite + React + TypeScript, using shadcn-ui and Tailwind CSS for UI components and styling.
- **Backend/API**: Node.js (see `api/index.js`).
- **Data/Integrations**: Supabase integration in `src/integrations/supabase/`.

## Key Architecture & Patterns
- **Component Structure**: UI components are modularized under `src/components/ui/`, with feature-specific components in subfolders (e.g., `cards/`, `home/`, `layout/`).
- **Pages**: Route-level components are in `src/pages/` (e.g., `Auth.tsx`, `Events.tsx`).
- **Hooks**: Custom React hooks live in `src/hooks/`.
- **Data**: Mock data is in `src/data/mockData.ts`.
- **Utilities**: Shared helpers in `src/lib/utils.ts`.
- **Supabase**: Connection and types in `src/integrations/supabase/`.

## Developer Workflows
- **Install dependencies**: `npm i` (in `vibe-weaver-main/` and `api/` if needed)
- **Start frontend**: `npm run dev` (in `vibe-weaver-main/`)
- **API server**: Run `node index.js` in `api/` (if using backend)
- **Build for production**: `npm run build`
- **Styling**: Tailwind config in `tailwind.config.ts`, PostCSS in `postcss.config.js`
- **TypeScript**: Configured via `tsconfig*.json`

## Project-Specific Conventions
- **UI**: Use shadcn-ui primitives for new UI elements. See `src/components/ui/` for examples.
- **State**: Prefer React hooks for state and effects. Custom hooks are encouraged for shared logic.
- **Data Fetching**: Use Supabase client from `src/integrations/supabase/client.ts` for backend data.
- **Routing**: Page components in `src/pages/` are entry points for routes.
- **Mocking**: Use `src/data/mockData.ts` for local development/testing data.

## Integration Points
- **Supabase**: All backend communication should use the client in `src/integrations/supabase/client.ts`.
- **API**: If using the Node.js API, endpoints are defined in `api/index.js`.

## Examples
- To create a new card UI, add a component to `src/components/cards/` and use shadcn-ui primitives.
- For a new page, add a file to `src/pages/` and register it in the router (see `main.tsx`).
- For new backend calls, extend `src/integrations/supabase/client.ts` or add endpoints in `api/index.js`.

## References
- [README.md](../vibe-weaver-main/README.md) for setup and deployment
- `src/components/ui/` for UI patterns
- `src/integrations/supabase/` for backend integration
- `tailwind.config.ts` and `postcss.config.js` for styling

---
**Update this file if major architectural changes are made.**
