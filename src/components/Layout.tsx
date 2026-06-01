import { useState, useMemo, useCallback } from 'react'
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { TopBar } from './TopBar'
import { MetricsBar } from './MetricsBar'
import { SidebarContent } from './Sidebar'
import { MobileDrawer } from './MobileDrawer'
import { ClientMap } from './ClientMap'
import { useLines, useBuffersByLineId, useDetections, useViolationMasks } from '#/hooks/useWayleaveData'
import { kawandaVegetationHeatmap } from '#/data/kawandaVegetation'
import type { DetectionFilters } from '#/utils/api/detections'
import type { FeatureCollection, Point, LineString, Polygon } from 'geojson'

export function Layout() {
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [dateRangeFilter, setDateRangeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedViolationId, setSelectedViolationId] = useState<string | null>(null)
  const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null)
  const [flyToKey, setFlyToKey] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  /* -- Fetch data from server -- */
  const { data: linesData, isLoading: linesLoading } = useLines()
  const { data: buffersData } = useBuffersByLineId(selectedLineId)

  const detectionFilters: DetectionFilters = useMemo(
    () => ({
      lineId: selectedLineId,
      type: typeFilter,
      severity: severityFilter,
      dateRange: dateRangeFilter,
      sortBy,
    }),
    [selectedLineId, typeFilter, severityFilter, dateRangeFilter, sortBy]
  )

  const { data: detectionsData } = useDetections(detectionFilters)
  const { data: masksData } = useViolationMasks(selectedLineId)

  /* -- Build GeoJSON FeatureCollections for the map -- */
  const allLinesFc: FeatureCollection<LineString> = useMemo(() => {
    if (!linesData) return { type: 'FeatureCollection', features: [] }
    return {
      type: 'FeatureCollection',
      features: linesData.map((l) => ({
        type: 'Feature' as const,
        properties: { id: l.id, name: l.name, voltage: l.voltage },
        geometry: l.geometry,
      })),
    }
  }, [linesData])

  const linesFc: FeatureCollection<LineString> = useMemo(() => {
    if (!linesData) return { type: 'FeatureCollection', features: [] }
    if (selectedLineId === null) {
      return allLinesFc
    }
    const line = linesData.find((l) => l.id === selectedLineId)
    return {
      type: 'FeatureCollection',
      features: line
        ? [
            {
              type: 'Feature' as const,
              properties: { id: line.id, name: line.name, voltage: line.voltage },
              geometry: line.geometry,
            },
          ]
        : [],
    }
  }, [linesData, selectedLineId, allLinesFc])

  const buffersFc: FeatureCollection<Polygon> = useMemo(() => {
    if (!buffersData) return { type: 'FeatureCollection', features: [] }
    return {
      type: 'FeatureCollection',
      features: buffersData.map((b) => ({
        type: 'Feature' as const,
        properties: { id: b.id, lineId: b.lineId, bufferRadius: b.bufferRadius },
        geometry: b.geometry,
      })),
    }
  }, [buffersData])

  const detectionsFc: FeatureCollection<Point> = useMemo(() => {
    if (!detectionsData) return { type: 'FeatureCollection', features: [] }
    return {
      type: 'FeatureCollection',
      features: detectionsData.map((d) => ({
        type: 'Feature' as const,
        properties: {
          id: d.id,
          type: d.type,
          severity: d.severity,
          confidence_score: d.confidenceScore,
          date_detected: d.dateDetected,
          lineId: d.lineId,
          transmission_line: d.transmissionLineName,
          status: d.status,
          distance_to_centerline: d.distanceToCenterline,
          chainage: d.chainage,
          coordinates: d.coordinates,
          village: d.village,
          district: d.district,
        },
        geometry: d.geometry,
      })),
    }
  }, [detectionsData])

  const masksFc: FeatureCollection<Polygon> = useMemo(() => {
    if (!masksData) return { type: 'FeatureCollection', features: [] }
    return masksData
  }, [masksData])

  /* -- Metrics (based on topbar selection + all detections for that line) -- */
  const lineKm = useMemo(() => {
    if (!linesData) return 0
    const km =
      selectedLineId === null
        ? linesData.reduce((sum, l) => sum + l.lengthKm, 0)
        : (linesData.find((l) => l.id === selectedLineId)?.lengthKm ?? 0)
    return Math.round(km * 10) / 10
  }, [linesData, selectedLineId])

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
  const heatmapPoints = useMemo(() => {
    // Show vegetation heatmap for Kawanda-Masaka when that line or all lines are selected
    if (selectedLineId === 'TL-002' || selectedLineId === null) {
      return kawandaVegetationHeatmap
    }
    return undefined
  }, [selectedLineId])

  const selectedLineBounds = useMemo(() => {
    if (selectedLineId === null || !linesData) return null
    const line = linesData.find((l) => l.id === selectedLineId)
    if (!line) return null
    const coords = line.geometry.coordinates as [number, number][]
    const lats = coords.map((c) => c[1])
    const lngs = coords.map((c) => c[0])
    return {
      southWest: [Math.min(...lats) - 0.05, Math.min(...lngs) - 0.05] as [number, number],
      northEast: [Math.max(...lats) + 0.05, Math.max(...lngs) + 0.05] as [number, number],
    }
  }, [selectedLineId, linesData])

  /* Loading state */
  if (linesLoading) {
    return (
      <div className="flex items-center justify-center h-[100dvh] bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#4270a8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-[#707072]">Loading wayleave data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-white">
      {/* Branding + Navigation */}
      <TopBar
        lines={allLinesFc}
        selectedLineId={selectedLineId}
        onSelectLine={handleSelectLine}
      />

      {/* KPI Metrics */}
      <MetricsBar lineKm={lineKm} detections={detectionsFc} />

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:flex flex-col border-r border-[#E5E5E5] bg-white overflow-hidden transition-all duration-300 ease-in-out min-w-0 ${
            sidebarOpen ? 'w-[28%] min-w-[320px] max-w-[400px] opacity-100 flex-shrink-0' : 'w-0 max-w-0 opacity-0 border-r-0'
          }`}
        >
          <div className="w-full h-full">
            <SidebarContent
              detections={detectionsFc}
              masks={masksFc}
              selectedId={selectedViolationId}
              typeFilter={typeFilter}
              severityFilter={severityFilter}
              transmissionLineFilter={selectedLineId ?? 'all'}
              dateRangeFilter={dateRangeFilter}
              sortBy={sortBy}
              onTypeFilterChange={setTypeFilter}
              onSeverityFilterChange={setSeverityFilter}
              onTransmissionLineFilterChange={(id) => handleSelectLine(id === 'all' ? null : id)}
              onDateRangeFilterChange={setDateRangeFilter}
              onSortByChange={setSortBy}
              onSelectViolation={handleSelectViolation}
            />
          </div>
        </aside>

        {/* Mobile Drawer */}
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <SidebarContent
            detections={detectionsFc}
            masks={masksFc}
            selectedId={selectedViolationId}
            typeFilter={typeFilter}
            severityFilter={severityFilter}
            transmissionLineFilter={selectedLineId ?? 'all'}
            dateRangeFilter={dateRangeFilter}
            sortBy={sortBy}
            onTypeFilterChange={setTypeFilter}
            onSeverityFilterChange={setSeverityFilter}
            onTransmissionLineFilterChange={(id) => handleSelectLine(id === 'all' ? null : id)}
            onDateRangeFilterChange={setDateRangeFilter}
            onSortByChange={setSortBy}
            onSelectViolation={handleSelectViolation}
          />
        </MobileDrawer>

        {/* Map Area */}
        <main className="flex-1 relative">
          {/* Desktop sidebar toggle */}
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="absolute top-3 left-3 z-[1000] hidden md:flex items-center justify-center w-9 h-9 bg-white/95 backdrop-blur-sm border border-[#E5E5E5] rounded-[10px] text-[#707072] shadow-sm hover:border-[#CACACB] hover:text-[#111111] transition-colors"
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>

          {/* Mobile drawer toggle */}
          {!drawerOpen && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="absolute bottom-6 left-4 z-[30] md:hidden flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-sm border border-[#CACACB] rounded-[30px] text-sm font-medium text-[#111111] shadow-lg"
            >
              <Menu className="w-4 h-4" />
              Filters
            </button>
          )}

          <ClientMap
            lines={linesFc}
            buffers={buffersFc}
            detections={detectionsFc}
            masks={masksFc}
            heatmap={heatmapPoints}
            selectedId={selectedViolationId}
            flyToCoords={flyToCoords}
            flyToKey={flyToKey}
            fitBounds={selectedLineBounds}
            sidebarOpen={sidebarOpen}
          />
        </main>
      </div>
    </div>
  )
}
