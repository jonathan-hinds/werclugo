# Wurcluego

**Get a clue.**

Wurcluego is a production-capable, mobile-first clue interpretation system. It includes a ceremonial navigation lock, persistent anonymous profiles, a camera-capable pseudo-AR Clue Sniffer, deterministic location-cell items, Clue Gobbler encounters, a server-authoritative economy, and a procedurally linked 45,000,000-piece collaborative puzzle.

For the canonical product intent, tone, domain rules, and guidance for future coding agents, read [`PROJECT_MANIFEST.md`](./PROJECT_MANIFEST.md).

The application is a TypeScript npm-workspace monorepo. A single Express process serves both the versioned REST API and the compiled React application in production, making it suitable for direct deployment to Render from a GitHub repository.

## Product systems

- **Ceremonial home:** `SELECT MODE` makes `CHOOSE` available; `CHOOSE` persists access to the three clue operations.
- **Clue Sniffer:** uses camera, geolocation, and device orientation when permission and browser support permit. It always has a WebGL/radar fallback.
- **Nearby clues:** deterministic HMAC-signed items are generated from coarse geographic cells and 15-minute windows. Exact coordinates are not retained.
- **Collection:** the server regenerates and verifies claims, atomically blocks duplicates, updates currency, and records activity.
- **Clue Gobbler:** persistent encounters target real nearby items. Blaster Balls stun him; server-side Spew rolls decide rewards.
- **Clue Exchange:** staged conversions use one shared economy configuration and server-side balance checks.
- **The Big Clue:** Jig documents are created only when discovered. A pan/zoom virtual field displays local pieces while MongoDB stores only materialized pieces and successful links.
- **PWA:** installable manifest, standalone metadata, application-shell caching, and a clear disconnected state. API-dependent gameplay is not represented as offline-capable.

## Architecture

```text
client/                 React + TypeScript + Vite
  src/api/              REST client and structured API errors
  src/components/       reusable UI, scanner, and puzzle components
  src/content/          randomized in-universe copy system
  src/hooks/            device/location lifecycle
  src/layouts/          application shell and navigation
  src/pages/            lazy-loaded feature routes
  src/services/         audio-effect architecture
  src/state/            Zustand profile/preferences stores
  src/styles/           centralized tokens and responsive CSS

server/                 Express + TypeScript + MongoDB/Mongoose
  src/config/           validated environment, database, logging
  src/controllers/      HTTP request/response adaptation
  src/middleware/       auth, validation, errors, security
  src/models/           users, pieces, events, claims, encounters
  src/repositories/     persistence boundaries
  src/routes/           versioned route composition
  src/services/         collection, economy, Gobbler, puzzle logic
  src/validation/       Zod request schemas

shared/                 shared domain types and economy constants
render.yaml             Render Blueprint
```

Important business rules live in domain services, not React components or route handlers. MongoDB models create collections and synchronize indexes at startup. The server also upserts application metadata, so no manual database collection or schema setup is necessary.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- MongoDB 7+ locally, or a MongoDB Atlas connection string
- A modern browser; a physical phone is recommended for camera, orientation, and geolocation behavior

## Local installation

```bash
npm install
cp .env.example .env
```

On PowerShell:

```powershell
Copy-Item .env.example .env
```

Set `MONGODB_URI`, then run:

```bash
npm run dev
```

The client runs at `http://localhost:5173` and proxies `/api` to the Express server at `http://localhost:3000`.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB or Atlas connection URI. The database can be empty. |
| `SESSION_SECRET` | No | Optional 16+ character override. When omitted in production, a stable secret is derived from `MONGODB_URI`; changing either value changes generated world items. |
| `PORT` | Render supplies it | HTTP port, default `3000`. |
| `NODE_ENV` | Yes in production | `development`, `test`, or `production`. |
| `CORS_ORIGIN` | Development only | Comma-separated client origins; defaults to `http://localhost:5173`. Production uses same-origin requests. |
| `VITE_API_URL` | Usually blank | Optional external API origin at build time. Leave blank for same-origin Render deployment. |
| `ENABLE_DEV_TOOLS` | No | Set `true` only in non-production to enable the guarded `/api/v1/dev/grant` endpoint. |

Never expose `MONGODB_URI` or `SESSION_SECRET` through a `VITE_` variable; those variables are compiled into the browser bundle.

## Commands

```bash
npm run dev       # shared build + API/client watch processes
npm run build     # shared, server, then production client
npm test          # domain behavior and unlock-state tests
npm run lint      # strict TypeScript checks for server and client
npm start         # production Express server
```

The verified production flow is:

```bash
npm install
npm run build
NODE_ENV=production npm start
```

In production, Express finds `client/dist`, serves hashed assets, and falls back to `index.html` for non-API routes. Deep links such as `/sniffer` and `/big-clue` therefore survive a direct request or browser refresh.

## Render deployment

### Blueprint method

1. Create a GitHub repository from this folder and push it.
2. In Render, choose **New → Blueprint** and select the repository.
3. Render reads `render.yaml` and creates the Node web service.
4. Add `MONGODB_URI` when prompted. A MongoDB Atlas URI is recommended.
5. Deploy. `SESSION_SECRET` is generated by the Blueprint; keep it stable between deploys.

### Manual web service

- Runtime: **Node**
- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Health check path: `/api/health`
- Environment: `NODE_ENV=production`, `MONGODB_URI=...`. `SESSION_SECRET` is optional.

No separate static site or frontend service is required. Render supplies `PORT`, and the server listens on `0.0.0.0`.

For Atlas, allow Render network access according to your Atlas project policy and create a least-privileged database user. On first boot, Wurcluego connects, synchronizes indexes, creates collections as documents are first written, and initializes the `world` metadata record.

## Browser permissions and mobile behavior

Camera and precise geolocation APIs generally require a secure origin. `localhost` is treated as secure for development; Render provides HTTPS in production.

- Camera permission is requested only when **ENABLE OPTICAL SNIFF** is pressed.
- Geolocation is requested when entering the scanner. If denied or unsupported, the application uses a documented simulated district so gameplay remains usable.
- iOS motion/orientation permission may require the **CALIBRATE** button and a deliberate tap.
- Camera tracks, device-orientation listeners, and animation lifecycles are cleaned up when the scanner unmounts.
- Vibration and Web Audio are enhancement-only. Audio starts after user interaction and can be muted.

True WebXR support varies significantly between devices and browsers, especially mobile Safari. Wurcluego does not depend on WebXR. It combines an optional rear-camera feed with device orientation, DOM targets, a lightweight React Three Fiber signal field, and a radar fallback. It should be understood as an AR-style browser experience rather than a promise of native spatial anchoring.

## MongoDB data model

- `users`: anonymous device hash, balances, unlock progression, and aggregate statistics
- `bigcluepieces`: materialized Jig pieces, procedural connectors, ownership, and link state
- `clueactivities`: TTL event history for collections, exchanges, Gobbler activity, and links
- `collecteditems`: signed-item duplicate claims with a seven-day TTL matching the short-lived generated world
- `gobblerencounters`: short-lived server records with expiry indexes
- `appmetadatas`: schema/world metadata initialized on startup

Device IDs are generated locally and sent in the `x-device-id` header. Only a SHA-256 hash is stored. The structure intentionally leaves an authentication boundary where a conventional identity provider can later replace the anonymous middleware.

## API overview

All game endpoints are under `/api/v1`:

```text
GET  /profile
POST /profile/select-mode
POST /profile/choose
GET  /sniffer/nearby
POST /sniffer/collect
POST /exchange
POST /gobbler/start
POST /gobbler/fire
POST /gobbler/gobble
POST /gobbler/spew
GET  /big-clue/status
GET  /big-clue/pieces
POST /big-clue/link
```

Payloads are validated with Zod. Errors have a stable structure:

```json
{
  "error": {
    "code": "CLUE_ALREADY_COLLECTED",
    "message": "This clue has already been collected, interpreted, or bureaucratically absorbed."
  }
}
```

Helmet, JSON size limits, same-origin production behavior, endpoint rate limiting, hashed device identifiers, server-side balance filters, and centralized error logging are enabled.

## Development controls

Set both:

```env
NODE_ENV=development
ENABLE_DEV_TOOLS=true
```

This enables a non-production-only currency grant endpoint for testing. The scanner already guarantees one deterministic Jig in each cell/time window, making core collection and Gobbler paths testable without a hidden production menu. The route is not mounted at all in production.

## Testing

`npm test` covers:

- Clue Coin → Puzzle Point conversion
- both destructive Jicker Jig conversions
- deterministic Gobbler loot branches
- collection duplicate rejection
- Big Clue connector adjacency
- the `SELECT MODE → CHOOSE → unlocked routes` state machine

The tests emphasize domain rules instead of component snapshots. `npm run build` also performs strict TypeScript checks before Vite emits assets.

## Troubleshooting

**Startup logs `MongoDB connection failed`:** verify the URI, user/password escaping, Atlas IP/network access, and database-user permissions. The server intentionally does not start without persistence.

**The page loads but reports `CLUE NETWORK DISCONNECTED`:** open `/api/health`, then inspect the Render service logs for the database connection or environment validation message.

**Camera unavailable:** use HTTPS, verify browser/site permissions, close other apps using the camera, and press **ENABLE OPTICAL SNIFF** again. The synthetic scanner remains fully interactive.

**Location appears simulated:** allow location access at the browser and operating-system levels. Location is used only to derive nearby generation cells and is not written to user history.

**A deploy shows an old shell:** clear the installed PWA/site data once after a major shell-version change. Hashed JS/CSS assets are otherwise cache-safe.

**A deep link returns an API-style 404:** confirm Render is using `npm start` from this repository and that `npm run build` produced `client/dist` before startup.

## Generated artwork

The bundled Clue Citizen sprite sheet at `client/public/assets/clue-citizens.png` was generated specifically for this project with the built-in OpenAI image-generation tool. It has no runtime API dependency; adding another citizen only requires an additional local asset and a corresponding billboard/crop definition.

## Operational limitations

- The anti-cheat model is appropriate for a small game: claims are signed, regenerated, rate-limited, and duplicate-protected, but the browser still reports its own approximate location.
- Generated items rotate in time windows. The immediately previous window remains claimable to tolerate boundary timing.
- Big Clue adjacency is procedural, not an underlying image reveal.
- Offline mode preserves the cached UI shell and device preferences but cannot collect or transact without MongoDB/API connectivity.
