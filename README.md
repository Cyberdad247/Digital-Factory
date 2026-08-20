# Camelot-OS PWA & Hydra Loop Architecture

## Quickstart
1. `npm install`
2. `npm run dev`

## Deployment
- Vercel/Netlify: Ensure `npm run build` is called and `dist/server.cjs` is set as the runtime entry point if custom server functionality is required. 
- Environment: 8GB edge-node hardware ceiling.

## Architecture
- Frontend: Next.js/Tailwind CSS
- Backend: Express API (mimicking loop-engineering)
- Persistence: JSON Provenance Ledger (`data/ledger.json`)
