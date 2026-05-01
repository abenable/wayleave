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
    <header className="grid grid-cols-3 items-center px-6 py-3.5 bg-white border-b border-[#E5E5E5]">
      {/* Left spacer */}
      <div />

      {/* Branding — centered */}
      <div className="text-center">
        <h1 className="text-[1.75rem] font-bold tracking-tight text-[#111111] uppercase leading-none">
          UETCL Wayleave Monitor
        </h1>
        <p className="text-[11px] font-medium text-[#707072] uppercase tracking-wider mt-0.5">
          Geospatial + ML Analytics
        </p>
      </div>

      {/* Line Selector Dropdown — right */}
      <div ref={ref} className="relative z-[9999] justify-self-end">
        <label className="block text-[11px] font-medium text-[#707072] mb-1 uppercase tracking-wider">
          Inspecting
        </label>
        <button
          onClick={() => setOpen((s) => !s)}
          className={cn(
            'flex items-center justify-between gap-6 pl-5 pr-4 py-2.5 text-sm font-medium rounded-[30px] border min-w-[280px] transition-colors',
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
          <div className="absolute right-0 z-50 mt-1.5 w-full bg-white border border-[#CACACB] rounded-[12px] overflow-hidden shadow-sm">
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
