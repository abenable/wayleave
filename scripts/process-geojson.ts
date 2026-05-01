import fs from 'fs'
import path from 'path'
import proj4 from 'proj4'

const projector = proj4(
  '+proj=utm +zone=36 +datum=WGS84 +units=m +no_defs',
  '+proj=longlat +datum=WGS84 +no_defs'
)

function projectCoord(x: number, y: number): [number, number] {
  return projector.forward([x, y]) as [number, number]
}

const geojsonDir = path.join(process.cwd(), 'public', 'geojson')
const outputDir = path.join(process.cwd(), 'src', 'data')

function loadGeojson(filename: string) {
  const p = path.join(geojsonDir, filename)
  return JSON.parse(fs.readFileSync(p, 'utf-8'))
}

// Robust projection for any geojson geometry
function projectGeometry(geometry: any): any {
  if (!geometry || !geometry.coordinates) return geometry

  const walk = (coords: any): any => {
    if (Array.isArray(coords) && coords.length === 2 && typeof coords[0] === 'number') {
      return projectCoord(coords[0], coords[1])
    }
    return coords.map(walk)
  }

  return {
    type: geometry.type,
    coordinates: walk(geometry.coordinates),
  }
}

function getFirstLineString(geojson: any): any {
  const feat = geojson.features[0]
  if (feat.geometry.type === 'MultiLineString') {
    return {
      type: 'LineString',
      coordinates: feat.geometry.coordinates[0],
    }
  }
  if (feat.geometry.type === 'LineString') {
    return feat.geometry
  }
  throw new Error(`Unexpected geometry type: ${feat.geometry.type}`)
}

function getFirstPolygon(geojson: any): any {
  const feat = geojson.features[0]
  if (feat.geometry.type === 'MultiPolygon') {
    return {
      type: 'Polygon',
      coordinates: feat.geometry.coordinates[0],
    }
  }
  if (feat.geometry.type === 'Polygon') {
    return feat.geometry
  }
  throw new Error(`Unexpected buffer geometry type: ${feat.geometry.type}`)
}

// --- Load raw data ---
const bujagaliLineRaw = loadGeojson('Bujagali_Kawanda_220_Line_Position_New.geojson')
const bujagaliBufferRaw = loadGeojson('Bujagali_Kawanda_220_Line_Buffer_40m.geojson')
const masakaLineRaw = loadGeojson('Kawanda_Masaka_220_Line_Position.geojson')
const masakaBufferRaw = loadGeojson('Kawanda_Masaka_220_Line_Buffer_40m.geojson')

// --- Project geometries ---
const bujagaliLineGeom = projectGeometry(getFirstLineString(bujagaliLineRaw))
const bujagaliBufferGeom = projectGeometry(getFirstPolygon(bujagaliBufferRaw))
const masakaLineGeom = projectGeometry(getFirstLineString(masakaLineRaw))
const masakaBufferGeom = projectGeometry(getFirstPolygon(masakaBufferRaw))

// --- Build feature objects ---
const bujagaliLine = {
  type: 'Feature',
  properties: { id: 'TL-001', name: 'Bujagali–Kawanda', voltage: '220kV' },
  geometry: bujagaliLineGeom,
}

const bujagaliBuffer = {
  type: 'Feature',
  properties: { id: 'WB-001', lineId: 'TL-001', bufferRadius: 40 },
  geometry: bujagaliBufferGeom,
}

const masakaLine = {
  type: 'Feature',
  properties: { id: 'TL-002', name: 'Kawanda–Masaka', voltage: '220kV' },
  geometry: masakaLineGeom,
}

const masakaBuffer = {
  type: 'Feature',
  properties: { id: 'WB-002', lineId: 'TL-002', bufferRadius: 40 },
  geometry: masakaBufferGeom,
}

// --- Detection generation ---
const statuses = ['Unverified', 'Dispatched', 'Resolved'] as const
const types = ['Structure', 'Vegetation'] as const

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function distanceMeters(a: [number, number], b: [number, number]): number {
  const R = 6371000
  const toRad = Math.PI / 180
  const dLat = (b[1] - a[1]) * toRad
  const dLon = (b[0] - a[0]) * toRad
  const lat1 = a[1] * toRad
  const lat2 = b[1] * toRad
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

function chainageKm(coords: [number, number][], idx: number): number {
  let d = 0
  for (let i = 1; i <= idx && i < coords.length; i++) {
    d += distanceMeters(coords[i - 1], coords[i])
  }
  return Math.round(d / 100) / 10
}

function generateDetections(
  lineFeat: any,
  lineName: string,
  count: number,
  offset: number
): any[] {
  const coords = lineFeat.geometry.coordinates as [number, number][]
  const results: any[] = []
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(randBetween(10, coords.length - 10))
    const [lon, lat] = coords[idx]
    const offsetAngle = Math.random() * 2 * Math.PI
    const offsetDist = randBetween(5, 38)
    const dLon = (offsetDist * Math.cos(offsetAngle)) / (111320 * Math.cos(lat * Math.PI / 180))
    const dLat = (offsetDist * Math.sin(offsetAngle)) / 110540
    const pointCoords: [number, number] = [lon + dLon, lat + dLat]

    const status = pick(statuses)
    const severity = status === 'Unverified'
      ? (Math.random() > 0.3 ? 'Critical' : 'Warning')
      : (Math.random() > 0.6 ? 'Critical' : 'Warning')
    const type = pick(types)
    const confidence = Math.round(randBetween(0.45, 0.98) * 100) / 100
    const distToCenter = Math.round(randBetween(8, 39))
    const ch = chainageKm(coords, idx)

    const daysAgo = Math.floor(randBetween(1, 45))
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    const dateStr = date.toISOString().split('T')[0]

    results.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: pointCoords },
      properties: {
        id: `V-${String(offset + i + 1).padStart(3, '0')}`,
        type,
        severity,
        confidence_score: confidence,
        date_detected: dateStr,
        lineId: lineFeat.properties.id,
        transmission_line: `${lineName} ${lineFeat.properties.voltage}`,
        status,
        distance_to_centerline: `${distToCenter} m`,
        chainage: `CH ${ch.toFixed(1)} km`,
        coordinates: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
      },
    })
  }
  return results
}

const bujagaliDetections = generateDetections(bujagaliLine, 'Bujagali–Kawanda', 15, 0)
const masakaDetections = generateDetections(masakaLine, 'Kawanda–Masaka', 12, 15)
const allDetections = [...bujagaliDetections, ...masakaDetections]

// --- Stats ---
function lineLengthKm(coords: [number, number][]): number {
  let d = 0
  for (let i = 1; i < coords.length; i++) {
    d += distanceMeters(coords[i - 1], coords[i])
  }
  return Math.round((d / 1000) * 10) / 10
}

const lineKm: Record<string, number> = {
  'TL-001': lineLengthKm(bujagaliLine.geometry.coordinates),
  'TL-002': lineLengthKm(masakaLine.geometry.coordinates),
}

const totalKm = Math.round((lineKm['TL-001'] + lineKm['TL-002']) * 10) / 10

// --- Build FeatureCollections ---
const transmissionLines = {
  type: 'FeatureCollection',
  features: [bujagaliLine, masakaLine],
}

const wayleaveBuffers = {
  type: 'FeatureCollection',
  features: [bujagaliBuffer, masakaBuffer],
}

const detectionsFc = {
  type: 'FeatureCollection',
  features: allDetections,
}

// --- Write output ---
const output = `import type { FeatureCollection, LineString, Polygon, Point } from 'geojson'

/* ------------------------------------------------------------------ */
/*  Real UETCL Transmission Line Data (Projected to WGS84)            */
/*  Source: public/geojson/                                           */
/*  CRS: EPSG:32636 -> EPSG:4326                                      */
/* ------------------------------------------------------------------ */

export const transmissionLines: FeatureCollection<LineString> = ${JSON.stringify(transmissionLines, null, 2)} as FeatureCollection<LineString>

export const wayleaveBuffers: FeatureCollection<Polygon> = ${JSON.stringify(wayleaveBuffers, null, 2)} as FeatureCollection<Polygon>

export const detections: FeatureCollection<Point> = ${JSON.stringify(detectionsFc, null, 2)} as FeatureCollection<Point>

export const lineKilometers: Record<string, number> = ${JSON.stringify(lineKm, null, 2)}

export function totalLineKilometers(): number {
  return ${totalKm}
}

export function getLineName(lineId: string): string {
  const map: Record<string, string> = {
    'TL-001': 'Bujagali–Kawanda 220kV',
    'TL-002': 'Kawanda–Masaka 220kV',
  }
  return map[lineId] ?? lineId
}
`

fs.writeFileSync(path.join(outputDir, 'geoData.ts'), output)
console.log('✅ Written src/data/geoData.ts')
console.log(`   TL-001: ${lineKm['TL-001']} km (${bujagaliLine.geometry.coordinates.length} pts)`)
console.log(`   TL-002: ${lineKm['TL-002']} km (${masakaLine.geometry.coordinates.length} pts)`)
console.log(`   Detections: ${allDetections.length}`)
