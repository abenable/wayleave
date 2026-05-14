import { useState, useMemo } from 'react'
import { FilterSelect } from './FilterSelect'
import { ViolationCard } from './ViolationCard'
import { SlidersHorizontal, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '#/lib/utils'
import type { FeatureCollection, Point, Polygon } from 'geojson'

interface SidebarProps {
  detections: FeatureCollection<Point>
  masks: FeatureCollection<Polygon>
  selectedId: string | null
  typeFilter: string
  severityFilter: string
  transmissionLineFilter: string
  dateRangeFilter: string
  sortBy: string
  onTypeFilterChange: (v: string) => void
  onSeverityFilterChange: (v: string) => void
  onTransmissionLineFilterChange: (v: string) => void
  onDateRangeFilterChange: (v: string) => void
  onSortByChange: (v: string) => void
  onSelectViolation: (id: string, coords: [number, number]) => void
}

const typeOptions = [
  { label: 'All Types', value: 'all' },
  { label: 'Structure', value: 'Structure' },
  { label: 'Vegetation', value: 'Vegetation' },
]

const severityOptions = [
  { label: 'All Severities', value: 'all' },
  { label: 'Critical', value: 'Critical' },
  { label: 'Warning', value: 'Warning' },
]

const transmissionLineOptions = [
  { label: 'All Lines', value: 'all' },
  { label: 'Bujagali–Kawanda', value: 'TL-001' },
  { label: 'Kawanda–Masaka', value: 'TL-002' },
]

const dateRangeOptions = [
  { label: 'All Time', value: 'all' },
  { label: 'Last 7 Days', value: '7' },
  { label: 'Last 30 Days', value: '30' },
]

const sortByOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Highest Confidence', value: 'confidence' },
  { label: 'Most Critical', value: 'critical' },
]

export function SidebarContent({
  detections,
  masks,
  selectedId,
  typeFilter,
  severityFilter,
  transmissionLineFilter,
  dateRangeFilter,
  sortBy,
  onTypeFilterChange,
  onSeverityFilterChange,
  onTransmissionLineFilterChange,
  onDateRangeFilterChange,
  onSortByChange,
  onSelectViolation,
}: SidebarProps) {
  const [filtersOpen, setFiltersOpen] = useState(true)

  const maskById = useMemo(() => {
    const map = new Map<string, any>()
    masks.features.forEach((f) => {
      const id = (f.properties as any)?.id
      if (id) map.set(id, f)
    })
    return map
  }, [masks])

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="px-5 pt-5 pb-4 border-b border-[#E5E5E5]">
        <button
          onClick={() => setFiltersOpen((s) => !s)}
          className="flex items-center justify-between w-full mb-4"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#707072]" />
            <span className="text-sm font-bold text-[#111111] uppercase tracking-wide">
              Filters
            </span>
          </div>
          {filtersOpen ? (
            <ChevronUp className="w-4 h-4 text-[#707072]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#707072]" />
          )}
        </button>

        <div
          className={cn(
            'space-y-3 overflow-hidden transition-all duration-300 ease-out',
            filtersOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="grid grid-cols-2 gap-3">
            <FilterSelect
              label="Type"
              value={typeFilter}
              options={typeOptions}
              onChange={onTypeFilterChange}
            />
            <FilterSelect
              label="Severity"
              value={severityFilter}
              options={severityOptions}
              onChange={onSeverityFilterChange}
            />
          </div>

          <FilterSelect
            label="Transmission Line"
            value={transmissionLineFilter}
            options={transmissionLineOptions}
            onChange={onTransmissionLineFilterChange}
          />

          <div className="grid grid-cols-2 gap-3">
            <FilterSelect
              label="Date Range"
              value={dateRangeFilter}
              options={dateRangeOptions}
              onChange={onDateRangeFilterChange}
            />
            <FilterSelect
              label="Sort By"
              value={sortBy}
              options={sortByOptions}
              onChange={onSortByChange}
            />
          </div>
        </div>
      </div>

      {/* Violation Feed */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-[#111111] uppercase tracking-wide">
            Violation Feed
          </span>
          <span className="text-xs font-medium text-[#707072]">
            {detections.features.length} results
          </span>
        </div>
        <div className="space-y-3">
          {detections.features.map((f) => {
            const p = f.properties as any
            return (
              <ViolationCard
                key={p.id}
                feature={f}
                maskFeature={maskById.get(p.id)}
                isSelected={selectedId === p.id}
                onClick={() =>
                  onSelectViolation(
                    p.id,
                    (f.geometry.coordinates as [number, number]).slice().reverse() as [number, number]
                  )
                }
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
