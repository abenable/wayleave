import { FilterSelect } from './FilterSelect'
import { ViolationCard } from './ViolationCard'
import { SlidersHorizontal } from 'lucide-react'
import type { FeatureCollection, Point } from 'geojson'

interface SidebarProps {
  detections: FeatureCollection<Point>
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
  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="px-5 pt-5 pb-4 border-b border-[#E5E5E5]">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="w-4 h-4 text-[#707072]" />
          <span className="text-sm font-bold text-[#111111] uppercase tracking-wide">
            Filters
          </span>
        </div>

        <div className="space-y-3">
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
