import { useState, useMemo, useCallback } from 'react'
import { Menu } from 'lucide-react'
import { TopBar } from './TopBar'
import { MetricsBar } from './MetricsBar'
import { SidebarContent } from './Sidebar'
import { MobileDrawer } from './MobileDrawer'
import { MapView } from './MapView'
import {
  transmissionLines,
  wayleaveBuffers,
  detections,
  totalLineKilometers,
  lineKilometers,
} from '#/data/mockGeoJSON'
import type { FeatureCollection, Point, LineString, Polygon } from 'geojson'

export function Layout() {
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [selectedViolationId, setSelectedViolationId] = useState<string | null>(null)
  const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null)
  const [flyToKey, setFlyToKey] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)

  /* -- Derived line data based on selection -- */
  const visibleLines: FeatureCollection<LineString> = useMemo(() => {
    if (selectedLineId === null) return transmissionLines
    return {
      type: 'FeatureCollection',
      features: transmissionLines.features.filter(
        (f) => f.properties!.id === selectedLineId
      ),
    }
  }, [selectedLineId])

  const visibleBuffers: FeatureCollection<Polygon> = useMemo(() => {
    if (selectedLineId === null) return wayleaveBuffers
    return {
      type: 'FeatureCollection',
      features: wayleaveBuffers.features.filter(
        (f) => f.properties!.lineId === selectedLineId
      ),
    }
  }, [selectedLineId])

  const baseDetections: FeatureCollection<Point> = useMemo(() => {
    if (selectedLineId === null) return detections
    return {
      type: 'FeatureCollection',
      features: detections.features.filter(
        (f) => (f.properties as any).lineId === selectedLineId
      ),
    }
  }, [selectedLineId])

  const filteredDetections: FeatureCollection<Point> = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: baseDetections.features.filter((f) => {
        const p = f.properties as any
        const typeMatch = typeFilter === 'all' || p.type === typeFilter
        const sevMatch = severityFilter === 'all' || p.severity === severityFilter
        return typeMatch && sevMatch
      }),
    }
  }, [baseDetections, typeFilter, severityFilter])

  const lineKm = useMemo(() => {
    if (selectedLineId === null) return totalLineKilometers()
    return lineKilometers(selectedLineId)
  }, [selectedLineId])

  const handleSelectLine = useCallback((id: string | null) => {
    setSelectedLineId(id)
    setSelectedViolationId(null)
    setFlyToCoords(null)
  }, [])

  const handleSelectViolation = useCallback(
    (id: string, coords: [number, number]) => {
      setSelectedViolationId(id)
      setFlyToCoords(coords)
      setFlyToKey((k) => k + 1)
      setDrawerOpen(false)
    },
    []
  )

  /* Fit bounds when line selection changes */
  const selectedLineBounds = useMemo(() => {
    if (selectedLineId === null) return null
    const line = transmissionLines.features.find(
      (f) => f.properties!.id === selectedLineId
    )
    if (!line) return null
    const coords = line.geometry.coordinates as [number, number][]
    const lats = coords.map((c) => c[1])
    const lngs = coords.map((c) => c[0])
    return {
      southWest: [Math.min(...lats) - 0.05, Math.min(...lngs) - 0.05] as [number, number],
      northEast: [Math.max(...lats) + 0.05, Math.max(...lngs) + 0.05] as [number, number],
    }
  }, [selectedLineId])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Branding + Navigation */}
      <TopBar
        lines={transmissionLines}
        selectedLineId={selectedLineId}
        onSelectLine={handleSelectLine}
      />

      {/* KPI Metrics */}
      <MetricsBar lineKm={lineKm} detections={baseDetections} />

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-[30%] min-w-[320px] max-w-[420px] border-r border-[#E5E5E5] bg-white">
          <SidebarContent
            detections={filteredDetections}
            selectedId={selectedViolationId}
            typeFilter={typeFilter}
            severityFilter={severityFilter}
            onTypeFilterChange={setTypeFilter}
            onSeverityFilterChange={setSeverityFilter}
            onSelectViolation={handleSelectViolation}
          />
        </aside>

        {/* Mobile Drawer */}
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <SidebarContent
            detections={filteredDetections}
            selectedId={selectedViolationId}
            typeFilter={typeFilter}
            severityFilter={severityFilter}
            onTypeFilterChange={setTypeFilter}
            onSeverityFilterChange={setSeverityFilter}
            onSelectViolation={handleSelectViolation}
          />
        </MobileDrawer>

        {/* Map Area */}
        <main className="flex-1 relative">
          <button
            onClick={() => setDrawerOpen(true)}
            className="absolute top-4 left-4 z-[1000] md:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-[#CACACB] rounded-[30px] text-sm font-medium text-[#111111]"
          >
            <Menu className="w-4 h-4" />
            Filters
          </button>

          <MapView
            lines={visibleLines}
            buffers={visibleBuffers}
            detections={filteredDetections}
            selectedId={selectedViolationId}
            flyToCoords={flyToCoords}
            flyToKey={flyToKey}
            fitBounds={selectedLineBounds}
          />
        </main>
      </div>
    </div>
  )
}
