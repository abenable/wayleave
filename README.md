# UETCL Wayleave Monitoring System

A geospatial dashboard for monitoring transmission line wayleave encroachments in Uganda. Built for Uganda Electricity Transmission Company Limited (UETCL) to track vegetation and structure violations along 220kV transmission corridors.

---

By Able and Bruce

## What's Deployed

**[https://wayleaves.ufable.com](https://wayleaves.ufable.com)**

Two transmission lines with real GeoJSON geometry (EPSG:32636 → WGS84):
- **Bujagali–Kawanda 220kV** (71 km)
- **Kawanda–Masaka 220kV** (137 km)

27 ML-generated detections (vegetation + structures) plotted inside the 40m wayleave buffer, each tagged with realistic chainage and mock Uganda locations (district, town, village).

---

## Features

| Feature | Detail |
|---------|--------|
| **Adaptive layout** | Desktop → side-by-side; Mobile → full-screen map with slide-over details |
| **Smart date range** | "Last 30 days" / "Last 7 days" shown if data exists; falls back to "All time" when empty |
| **Quick actions** | Center map, Reset filters, Export CSV |
| **OSM base tiles** | OpenStreetMap at `maxZoom=22` |
| **Nike light UI** | `#FFFFFF` bg, `#111111` text, `#707072` secondary, `30px` pill radius, Inter font, 3D perspective CSS |
| **Stateful popups** | Popups stay open on interaction, close with ✕ button or map click-away |
| **Per-detection filtering** | By line, type (Structure/Vegetation), severity (Critical/Warning), date range, sort order |
| **Metrics** | Total length, active detections, critical count, unverified count (all reactive to filters) |

---

## Mock Data Architecture

All runtime data is served from a **single hardcoded TypeScript file** (`src/data/geoData.ts`, ~212KB) — no database queries at runtime.

```
geoData.ts → server functions → React Query → UI
```

The PostgreSQL/Prisma stack is fully configured and sitting ready in `docker-compose.yml`. When real data arrives, switch the three server functions (`src/utils/api/*.ts`) back from hardcoded arrays to `prisma.*.findMany()`.

### Detection Generation Logic

1. **Pick a line segment** weighted by length (longer segments get more detections)
2. **Interpolate** a random point along the segment
3. **Offset perpendicular** to the segment by 2–19.5 metres
4. **Guarantee**: every detection's perpendicular distance to the actual line ≤ 20m (half the 40m buffer width)

### Location Mock Data

Chainage-based realistic Uganda locations:

| Line | Chainage | District | Town | Village |
|------|----------|----------|------|---------|
| Bujagali–Kawanda | 0–10 km | Jinja | Njeru | Bujagali Village |
| Bujagali–Kawanda | 10–22 km | Buikwe | Lugazi | Kawolo Village |
| Bujagali–Kawanda | 22–35 km | Mukono | Seeta | Namanere Village |
| Bujagali–Kawanda | 35–60 km | Wakiso | Namugongo / Nabweru | Kira / Gayaza |
| Bujagali–Kawanda | 60–71 km | Wakiso | Kawanda | Kawanda Village |
| Kawanda–Masaka | 0–15 km | Wakiso | Kawanda | Budo Village |
| Kawanda–Masaka | 15–45 km | Mpigi | Mpigi / Kammengo | Bukasa / Mpenja |
| Kawanda–Masaka | 45–78 km | Gomba | Kanoni / Kyegonza | Kabulasoke / Maddu |
| Kawanda–Masaka | 78–115 km | Kalungu / Masaka | Bukulula / Nyendo | Kalisizo / Kimaanya |
| Kawanda–Masaka | 115–137 km | Masaka | Masaka | Kijjabwemi Village |

---

## Tech Stack

- **Framework**: TanStack Start (React + Vite + SSR)
- **Routing**: TanStack Router (file-based)
- **CSS**: Tailwind CSS v4
- **Map**: Leaflet + React-Leaflet (dynamically imported, browser-only)
- **DB (idle, ready)**: PostgreSQL 17 + Prisma ORM
- **Container**: Docker + Docker Compose
- **Data**: `proj4` for EPSG:32636 → EPSG:4326 projection

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

The dev server runs at `http://localhost:3000`.

---

## Production Build & Deploy

### Option A: Docker (recommended for servers)

```bash
cp env.local.example .env.local
# edit .env.local with your credentials

docker compose up -d --build
```

The `docker-entrypoint.sh` automatically runs Prisma migrations before starting the server. The app serves hardcoded data — no DB connection needed at runtime.

### Option B: Standalone build

```bash
npm run build              # client + server
node server.production.mjs # start production server
```

---

## Regenerating Mock Data from Real GeoJSON

If you update the source GeoJSON files in `public/geojson/`:

```bash
npm run ingest-geojson   # generates src/data/geoData.ts
npm run build
```

This script:
1. Reads UTM zone 36N (EPSG:32636) GeoJSON files
2. Projects all coordinates to WGS84 (EPSG:4326)
3. Generates 40m wayleave buffers with Turf.js
4. Creates realistic mock detections with perpendicular offsets and Uganda locations
5. Writes everything into `src/data/geoData.ts`

---

## Project Structure

```
├── public/
│   └── geojson/           # Source UETCL GeoJSON (EPSG:32636)
│       ├── transmission_lines_220kV.geojson
│       ├── lines_villages.geojson
│       └── lines_districts.geojson
├── prisma/
│   ├── schema.prisma      # DB schema (Detection, TransmissionLine, WayleaveBuffer)
│   ├── migrations/        # Baseline + location fields migrations
│   └── seed.ts            # DB seed script (runs with docker-entrypoint.sh)
├── src/
│   ├── components/
│   │   ├── Layout.tsx     # Sidebar + top bar + map layout
│   │   ├── MapView.tsx    # Leaflet map with GeoJSON layers
│   │   ├── ViolationCard.tsx      # Sidebar detection cards
│   │   ├── DetectionPopup.tsx     # Map popup content
│   │   ├── ViolationDetail.tsx    # Full detail slide-over panel
│   │   ├── TopBar.tsx             # Line selector + summary metrics
│   │   ├── FilterBar.tsx          # Detection filters
│   │   ├── EmptyState.tsx         # "No violations found" state
│   │   ├── NoViolationsInRange.tsx # "Select all time to view" state
│   │   └── ClientMap.tsx          # Browser-only dynamic import wrapper
│   ├── data/
│   │   └── geoData.ts     # Hardcoded mock data (~212KB)
│   ├── utils/api/
│   │   ├── lines.ts       # getLines, getLineById (hardcoded)
│   │   ├── buffers.ts     # getBuffers, getBuffersByLineId (hardcoded)
│   │   └── detections.ts  # getDetections, getDetectionById (hardcoded + filter/sort)
│   ├── routes/
│   │   └── index.tsx      # Main dashboard route
│   └── db.ts              # Prisma client (idle, ready for real data)
├── server.production.mjs  # Custom Node HTTP server (assets + SSR)
├── docker-compose.yml     # PostgreSQL + app services
├── docker-entrypoint.sh   # Generate client, migrate, seed, start
└── scripts/
    └── process-geojson.ts # CLI: GeoJSON → geoData.ts generator
```

---

## Styling Notes

- **Primary**: `#111111` (near-black) on white
- **Secondary**: `#707072` (muted gray)
- **Surface**: `#F5F5F5` (light gray backgrounds)
- **Structure accent**: `#D30005` (bright red)
- **Vegetation accent**: `#FF5000` (orange)
- **Pill radius**: `30px` on cards, `9999px` on badges
- **Font**: Inter (system fallback)
- **Map line color**: `#111111`
- **Buffer fill**: `rgba(17, 17, 17, 0.06)` with `1.5px` stroke

---

## When Real Data Arrives

Switch from hardcoded to database in three files:

1. **`src/utils/api/lines.ts`** — replace `transmissionLines.features` → `prisma.transmissionLine.findMany()`
2. **`src/utils/api/buffers.ts`** — replace `wayleaveBuffers.features` → `prisma.wayleaveBuffer.findMany()`
3. **`src/utils/api/detections.ts`** — replace `detections.features` → `prisma.detection.findMany()` with Prisma `where`/`orderBy`

The Prisma schema, migrations, seed script, and Docker entrypoint are all production-ready and waiting.

---

## License

Internal UETCL project. Not open source.
