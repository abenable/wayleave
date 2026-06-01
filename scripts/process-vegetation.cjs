const fs = require('fs')
const path = require('path')

// Read the raw geojson
const raw = fs.readFileSync(path.join(__dirname, '../public/kawanda_masaka_detections.geojson'), 'utf8')
const geojson = JSON.parse(raw)

function polygonCentroid(coords) {
  let x = 0, y = 0, area = 0
  const n = coords.length - 1
  for (let i = 0; i < n; i++) {
    const [x1, y1] = coords[i]
    const [x2, y2] = coords[i + 1]
    const a = x1 * y2 - x2 * y1
    area += a
    x += (x1 + x2) * a
    y += (y1 + y2) * a
  }
  area *= 0.5
  const f = 1 / (6 * area)
  return [f * x, f * y]
}

// Existing highest ID is V-120.
let nextId = 121

const detectionsFeatures = []
const maskFeatures = []
const heatmapPoints = [] // [lat, lng, intensity] for leaflet.heat

for (const f of geojson.features) {
  const p = f.properties

  const ring = f.geometry.coordinates[0]
  const [cx, cy] = polygonCentroid(ring)

  // Heatmap gets EVERY vegetation polygon weighted by tdiScore
  const weight = Math.max(0.1, Math.min(1, p.tdiScore ?? 0.5))
  heatmapPoints.push([cy, cx, weight])

  // Only Severe get turned into violation cards / markers
  const isSevere = p.tdiLevelName === 'Severe'

  if (isSevere) {
    const vId = `V-${String(nextId).padStart(3, '0')}`
    nextId++

    detectionsFeatures.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [cx, cy]
      },
      properties: {
        id: vId,
        type: 'Vegetation',
        severity: p.severity,
        confidence_score: p.tdiScore ?? 0.5,
        date_detected: p.detectedAt.split('T')[0],
        lineId: 'TL-002',
        transmission_line: 'Kawanda–Masaka 220kV',
        status: 'Unverified',
        distance_to_centerline: '—',
        chainage: `CH ${p.chainage_km} km`,
        coordinates: `${cy.toFixed(5)}, ${cx.toFixed(5)}`,
        village: null,
        district: null,
        mask_id: vId,
        area_m2: p.area_m2 ?? 0,
        class_name: 'vegetation intrusion',
        dist_to_line_m: null,
      }
    })

    maskFeatures.push({
      type: 'Feature',
      geometry: f.geometry,
      properties: {
        id: vId,
        type: 'Vegetation',
        severity: p.severity,
        confidence_score: p.tdiScore ?? 0.5,
        date_detected: p.detectedAt.split('T')[0],
        lineId: 'TL-002',
        transmission_line: 'Kawanda–Masaka 220kV',
        status: 'Unverified',
        distance_to_centerline: '—',
        chainage: `CH ${p.chainage_km} km`,
        coordinates: `${cy.toFixed(5)}, ${cx.toFixed(5)}`,
        village: null,
        district: null,
        mask_id: vId,
        area_m2: p.area_m2 ?? 0,
        class_name: 'vegetation intrusion',
        dist_to_line_m: null,
      }
    })
  }
}

// Write detections module
const ts = `import type { FeatureCollection, Point, Polygon } from 'geojson'

export const kawandaVegetationDetections: FeatureCollection<Point> = ${JSON.stringify({
  type: 'FeatureCollection',
  features: detectionsFeatures
}, null, 2)}

export const kawandaVegetationMasks: FeatureCollection<Polygon> = ${JSON.stringify({
  type: 'FeatureCollection',
  features: maskFeatures
}, null, 2)}

// Heatmap data: [lat, lng, intensity] for all vegetation polygons
export const kawandaVegetationHeatmap: [number, number, number][] = ${JSON.stringify(heatmapPoints, null, 2)}
`

fs.writeFileSync(path.join(__dirname, '../src/data/kawandaVegetation.ts'), ts, 'utf8')
console.log(`Wrote ${detectionsFeatures.length} detections + ${maskFeatures.length} masks + ${heatmapPoints.length} heatmap points to src/data/kawandaVegetation.ts`)
