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

const detectionsFeatures = []
const maskFeatures = []

for (const f of geojson.features) {
  const p = f.properties

  // Only treat actual severe encroachments as violations.
  // Minor/Moderate polygons form a density heatmap and shouldn't
  // flood the sidebar / metrics as individual alerts.
  if (p.tdiLevelName !== 'Severe') continue

  const ring = f.geometry.coordinates[0]
  const [cx, cy] = polygonCentroid(ring)

  // Detection as Point (centroid)
  detectionsFeatures.push({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [cx, cy]
    },
    properties: {
      id: p.id,
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
      mask_id: p.id,
      area_m2: p.area_m2 ?? 0,
      class_name: 'vegetation intrusion',
      dist_to_line_m: null,
    }
  })

  // Mask as original Polygon
  maskFeatures.push({
    type: 'Feature',
    geometry: f.geometry,
    properties: {
      id: p.id,
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
      mask_id: p.id,
      area_m2: p.area_m2 ?? 0,
      class_name: 'vegetation intrusion',
      dist_to_line_m: null,
    }
  })
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
`

fs.writeFileSync(path.join(__dirname, '../src/data/kawandaVegetation.ts'), ts, 'utf8')
console.log(`Wrote ${detectionsFeatures.length} detections + ${maskFeatures.length} masks to src/data/kawandaVegetation.ts`)
