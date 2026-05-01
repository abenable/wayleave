import { useState, useEffect, type ComponentType } from 'react'
import type { FeatureCollection, LineString, Polygon, Point } from 'geojson'

interface MapViewProps {
  lines: FeatureCollection<LineString>
  buffers: FeatureCollection<Polygon>
  detections: FeatureCollection<Point>
  selectedId: string | null
  flyToCoords: [number, number] | null
  flyToKey?: number
  fitBounds?: { southWest: [number, number]; northEast: [number, number] } | null
}

export function ClientMap(props: MapViewProps) {
  const [MapViewComponent, setMapViewComponent] = useState<ComponentType<MapViewProps> | null>(null)

  useEffect(() => {
    let cancelled = false
    import('./MapView').then((mod) => {
      if (!cancelled) setMapViewComponent(() => mod.MapView)
    })
    return () => { cancelled = true }
  }, [])

  if (!MapViewComponent) {
    return (
      <div className="w-full h-full bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-[#707072]">Loading map...</p>
        </div>
      </div>
    )
  }

  return <MapViewComponent {...props} />
}
