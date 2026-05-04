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

// ── Load raw data ──
const bujagaliLineRaw = loadGeojson('Bujagali_Kawanda_220_Line_Position_New.geojson')
const bujagaliBufferRaw = loadGeojson('Bujagali_Kawanda_220_Line_Buffer_40m.geojson')
const masakaLineRaw = loadGeojson('Kawanda_Masaka_220_Line_Position.geojson')
const masakaBufferRaw = loadGeojson('Kawanda_Masaka_220_Line_Buffer_40m.geojson')

const bujagaliLineGeomRaw = getFirstLineString(bujagaliLineRaw)
// Reverse so chainage 0 starts at Bujagali (Jinja end) instead of Kawanda
bujagaliLineGeomRaw.coordinates.reverse()
const bujagaliLineGeom = projectGeometry(bujagaliLineGeomRaw)
const bujagaliBufferGeom = projectGeometry(getFirstPolygon(bujagaliBufferRaw))
const masakaLineGeom = projectGeometry(getFirstLineString(masakaLineRaw))
const masakaBufferGeom = projectGeometry(getFirstPolygon(masakaBufferRaw))

const bujagaliLine = {
  type: 'Feature' as const,
  properties: { id: 'TL-001', name: 'Bujagali–Kawanda', voltage: '220kV' },
  geometry: bujagaliLineGeom,
}

const bujagaliBuffer = {
  type: 'Feature' as const,
  properties: { id: 'WB-001', lineId: 'TL-001', bufferRadius: 40 },
  geometry: bujagaliBufferGeom,
}

const masakaLine = {
  type: 'Feature' as const,
  properties: { id: 'TL-002', name: 'Kawanda–Masaka', voltage: '220kV' },
  geometry: masakaLineGeom,
}

const masakaBuffer = {
  type: 'Feature' as const,
  properties: { id: 'WB-002', lineId: 'TL-002', bufferRadius: 40 },
  geometry: masakaBufferGeom,
}

// ── Geo helpers ──
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

/** Interpolate a point at fraction t (0–1) along segment AB */
function interpolate(a: [number, number], b: [number, number], t: number): [number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}

/** Perpendicular unit vector (CCW 90°) for segment AB, in metres */
function perpUnit(a: [number, number], b: [number, number]): [number, number] {
  // Segment direction in metres
  const lat = (a[1] + b[1]) / 2
  const dxM = (b[0] - a[0]) * (111320 * Math.cos(lat * Math.PI / 180))
  const dyM = (b[1] - a[1]) * 110540
  const len = Math.sqrt(dxM * dxM + dyM * dyM)
  if (len === 0) return [0, 0]
  // Perpendicular (-dy, dx) normalized
  const ux = -dyM / len
  const uy = dxM / len
  return [ux, uy]
}

/** Pick a random segment weighted by length, return segment index */
function pickWeightedSegment(coords: [number, number][]): number {
  const lengths = []
  let total = 0
  for (let i = 0; i < coords.length - 1; i++) {
    const d = distanceMeters(coords[i], coords[i + 1])
    lengths.push(d)
    total += d
  }
  const pick = Math.random() * total
  let acc = 0
  for (let i = 0; i < lengths.length; i++) {
    acc += lengths[i]
    if (pick <= acc) return i
  }
  return lengths.length - 1
}

// ── Mock location data based on chainage ──
interface LocationInfo {
  district: string
  town: string
  village: string
}

function bujagaliLocation(chainageKm: number): LocationInfo {
  if (chainageKm < 10) {
    return { district: 'Jinja', town: 'Njeru', village: 'Bujagali Village' }
  } else if (chainageKm < 22) {
    return { district: 'Buikwe', town: 'Lugazi', village: 'Kawolo Village' }
  } else if (chainageKm < 35) {
    return { district: 'Mukono', town: 'Seeta', village: 'Namanere Village' }
  } else if (chainageKm < 48) {
    return { district: 'Wakiso', town: 'Namugongo', village: 'Kira Village' }
  } else if (chainageKm < 60) {
    return { district: 'Wakiso', town: 'Nabweru', village: 'Gayaza Village' }
  } else {
    return { district: 'Wakiso', town: 'Kawanda', village: 'Kawanda Village' }
  }
}

function masakaLocation(chainageKm: number): LocationInfo {
  if (chainageKm < 15) {
    return { district: 'Wakiso', town: 'Kawanda', village: 'Budo Village' }
  } else if (chainageKm < 30) {
    return { district: 'Mpigi', town: 'Mpigi', village: 'Bukasa Village' }
  } else if (chainageKm < 45) {
    return { district: 'Mpigi', town: 'Kammengo', village: 'Mpenja Village' }
  } else if (chainageKm < 60) {
    return { district: 'Gomba', town: 'Kanoni', village: 'Kabulasoke Village' }
  } else if (chainageKm < 78) {
    return { district: 'Gomba', town: 'Kyegonza', village: 'Maddu Village' }
  } else if (chainageKm < 95) {
    return { district: 'Kalungu', town: 'Bukulula', village: 'Kalisizo Village' }
  } else if (chainageKm < 115) {
    return { district: 'Masaka', town: 'Nyendo', village: 'Kimaanya Village' }
  } else {
    return { district: 'Masaka', town: 'Masaka', village: 'Kijjabwemi Village' }
  }
}

// ── Detection generation ──
const statuses = ['Unverified', 'Dispatched', 'Resolved'] as const
const types = ['Structure', 'Vegetation'] as const

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function chainageKm(coords: [number, number][], idx: number): number {
  let d = 0
  for (let i = 1; i <= idx && i < coords.length; i++) {
    d += distanceMeters(coords[i - 1], coords[i])
  }
  return d / 1000
}

function generateDetections(
  lineFeat: any,
  lineName: string,
  count: number,
  offset: number,
  locationFn: (ch: number) => LocationInfo
): any[] {
  const coords = lineFeat.geometry.coordinates as [number, number][]
  const results: any[] = []
  let attempts = 0
  const maxAttempts = count * 200

  while (results.length < count && attempts < maxAttempts) {
    attempts++

    // 1. Pick a weighted random segment
    const segIdx = pickWeightedSegment(coords)
    const a = coords[segIdx]
    const b = coords[segIdx + 1]

    // 2. Pick random point along segment
    const t = Math.random()
    const pointOnLine = interpolate(a, b, t)

    // 3. Get perpendicular unit vector
    const [ux, uy] = perpUnit(a, b)
    if (ux === 0 && uy === 0) continue

    // 4. Offset perpendicular by random distance up to 20m (buffer radius / 2)
    //   Random side: left or right of the line
    const side = Math.random() > 0.5 ? 1 : -1
    const offsetDist = randBetween(2, 19.5) // 2m to just under 20m

    // Convert metres back to degrees
    const lat = pointOnLine[1]
    const dLon = (ux * offsetDist * side) / (111320 * Math.cos(lat * Math.PI / 180))
    const dLat = (uy * offsetDist * side) / 110540
    const pointCoords: [number, number] = [pointOnLine[0] + dLon, pointOnLine[1] + dLat]

    // 5. Compute actual perpendicular distance for the property
    const actualDist = Math.round(offsetDist)

    // 6. Chainage
    const chKm = chainageKm(coords, segIdx) + distanceMeters(a, pointOnLine) / 1000
    const ch = `CH ${chKm.toFixed(1)} km`

    // 7. Location info
    const loc = locationFn(chKm)

    // 8. Other properties
    const status = pick(statuses)
    const severity = status === 'Unverified'
      ? (Math.random() > 0.3 ? 'Critical' : 'Warning')
      : (Math.random() > 0.6 ? 'Critical' : 'Warning')
    const type = pick(types)
    const confidence = Math.round(randBetween(0.45, 0.98) * 100) / 100

    const daysAgo = Math.floor(randBetween(1, 45))
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    const dateStr = date.toISOString().split('T')[0]

    results.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: pointCoords },
      properties: {
        id: `V-${String(offset + results.length + 1).padStart(3, '0')}`,
        type,
        severity,
        confidence_score: confidence,
        date_detected: dateStr,
        lineId: lineFeat.properties.id,
        transmission_line: `${lineName} ${lineFeat.properties.voltage}`,
        status,
        distance_to_centerline: `${actualDist} m`,
        chainage: ch,
        coordinates: `${pointCoords[1].toFixed(5)}, ${pointCoords[0].toFixed(5)}`,
        nearest_town: loc.town,
        village: loc.village,
        district: loc.district,
      },
    })
  }

  if (results.length < count) {
    console.warn(`⚠️  Only generated ${results.length}/${count} detections`)
  }
  return results
}

const bujagaliDetections = generateDetections(bujagaliLine, 'Bujagali–Kawanda', 15, 0, bujagaliLocation)
const masakaDetections = generateDetections(masakaLine, 'Kawanda–Masaka', 12, 15, masakaLocation)
const allDetections = [...bujagaliDetections, ...masakaDetections]

// ── Stats ──
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

// ── Build FeatureCollections ──
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

// ── Write output ──
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
