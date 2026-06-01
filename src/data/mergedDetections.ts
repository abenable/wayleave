import type { FeatureCollection, Point, Polygon } from 'geojson'
import { detections as originalDetections, violationMasks as originalMasks } from './detectionsData'
import { kawandaVegetationDetections, kawandaVegetationMasks } from './kawandaVegetation'

export const detections: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: [
    ...originalDetections.features,
    ...kawandaVegetationDetections.features,
  ],
}

export const violationMasks: FeatureCollection<Polygon> = {
  type: 'FeatureCollection',
  features: [
    ...originalMasks.features,
    ...kawandaVegetationMasks.features,
  ],
}
