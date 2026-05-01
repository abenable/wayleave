import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '#/lib/utils'
import type { FeatureCollection, LineString } from 'geojson'

interface TopBarProps {
  lines: FeatureCollection<LineString>
  selectedLineId: string | null
  onSelectLine: (id: string | null) => void
}

export function TopBar({ lines, selectedLineId, onSelectLine }: TopBarProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const lineInfos = lines.features.map((f) => ({
    id: f.properties!.id as string,
    name: f.properties!.name as string,
    voltage: f.properties!.voltage as string,
  }))

  const selectedLabel =
    selectedLineId === null
      ? 'All Transmission Lines'
      : lineInfos.find((l) => l.id === selectedLineId)?.name ?? 'All Lines'

  const options = [
    { label: 'All Transmission Lines', value: null as string | null },
    ...lineInfos.map((l) => ({
      label: `${l.name}  ·  ${l.voltage}`,
      value: l.id,
    })),
  ]

  return (
    <header className="flex flex-col md:grid md:grid-cols-3 items-start md:items-center gap-3 md:gap-0 px-4 md:px-6 py-3.5 bg-white border-b border-[#E5E5E5]">
      {/* Left spacer (desktop only) */}
      <div className="hidden md:block" />

      {/* Branding — centered on desktop, full width on mobile */}
      <div className="text-left md:text-center w-full md:w-auto">
        <h1 className="text-xl md:text-[1.75rem] font-bold tracking-tight text-[#111111] uppercase leading-none">
          UETCL Wayleave Monitor
        </h1>
        <p className="text-[11px] font-medium text-[#707072] uppercase tracking-wider mt-0.5">
          Geospatial + ML Analytics
        </p>
      </div>

      {/* Line Selector Dropdown — right on desktop, full width on mobile */}
      <div ref={ref} className="relative z-[9999] w-full md:w-auto md:justify-self-end">
        <label className="hidden md:block text-[11px] font-medium text-[#707072] mb-1 uppercase tracking-wider">
          Inspecting
        </label>
        <button
          onClick={() => setOpen((s) => !s)}
          className={cn(
            'flex items-center justify-between gap-4 md:gap-6 pl-4 md:pl-5 pr-4 py-2.5 text-sm font-medium rounded-[30px] border w-full md:min-w-[280px] md:w-auto transition-colors',
            open
              ? 'border-[#111111] bg-white'
              : 'border-[#CACACB] bg-[#F5F5F5] hover:border-[#707072]'
          )}
        >
          <span className="text-[#111111] truncate">{selectedLabel}</span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-[#707072] transition-transform shrink-0',
              open && 'rotate-180'
            )}
          />
        </button>

        {open && (
          <div className="absolute left-0 md:right-0 md:left-auto z-50 mt-1.5 w-full md:w-full min-w-0 md:min-w-[280px] bg-white border border-[#CACACB] rounded-[12px] overflow-hidden shadow-sm">
            {options.map((opt) => (
              <button
                key={opt.value ?? 'all'}
                onClick={() => {
                  onSelectLine(opt.value)
                  setOpen(false)
                }}
                className={cn(
                  'block w-full text-left px-5 py-2.5 text-sm font-medium transition-colors border-b border-[#F5F5F5] last:border-b-0',
                  opt.value === selectedLineId
                    ? 'bg-[#F5F5F5] text-[#111111]'
                    : 'text-[#111111] hover:bg-[#F5F5F5]'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
