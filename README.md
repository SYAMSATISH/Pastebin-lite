# Pastebin Lite

A fast and secure pastebin application built with Next.js 15.

## Features

- *Create Pastes*: Share text snippets easily.
- *Ephemeral Storage*: Set expiration time (TTL) for pastes.
- *View Limits*: Set a maximum number of views before the paste disappears (Burn-after-reading).
- *Secure*: Pastes are rendered safely without executing scripts.

## Running Locally

1. Install dependencies: npm install

2. Run the development server: npm run dev

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Persistence Layer

This application supports two persistence modes:

1. **Vercel KV (Redis)**: Recommended for production deployments on Vercel. 
   - Enabled automatically if `KV_REST_API_URL` and `KV_REST_API_TOKEN` environment variables are present.
   - Provides durable, scalable storage.

2. **Local File System (JSON)**: Used for local development (fallback).
   - Stores pastes in `data/store.json` in the project root.
   - Persists across restarts in a local environment.
   - Not suitable for serverless functions (use Redis instead).

## Design Decisions

- **Deterministic Testing**: The application supports `TEST_MODE=1` and `x-test-now-ms` header to simulate time travel for validating expiry logic.
- **Atomic-ish View Counting**: View counts are updated upon fetch. For high-concurrency production usage, Redis atomic increment is recommended, but the current implementation uses a read-modify-write approach which is sufficient for "Lite" usage and consistent across both storage adapters.
- **Next.js App Router**: Utilizes Server Components for optimal performance and SEO.
- **Tailwind CSS**: Used for modern, responsive, and dark-themed UI.

## API Endpoints

- `GET /api/healthz` - Health check.
- `POST /api/pastes` - Create a paste.
- `GET /api/pastes/:id` - Fetch a paste (consumes specific view count).
