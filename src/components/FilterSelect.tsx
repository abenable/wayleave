import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '#/lib/utils'

interface FilterSelectProps {
  label: string
  value: string
  options: { label: string; value: string }[]
  onChange: (value: string) => void
  minWidth?: string
}

export function FilterSelect({ label, value, options, onChange, minWidth }: FilterSelectProps) {
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

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className="relative" style={minWidth ? { minWidth } : undefined}>
      {label && (
        <label className="block text-[11px] font-medium text-[#707072] mb-1.5 tracking-wide uppercase">
          {label}
        </label>
      )}
      <button
        onClick={() => setOpen((s) => !s)}
        className={cn(
          'flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium rounded-[30px] border transition-colors',
          open
            ? 'border-[#111111] bg-white'
            : 'border-[#CACACB] bg-[#F5F5F5] hover:border-[#707072]'
        )}
      >
        <span className="text-[#111111] truncate">{selected?.label}</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-[#707072] transition-transform shrink-0 ml-2',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="absolute z-[9999] mt-1.5 w-full bg-white border border-[#CACACB] rounded-[12px] shadow-sm overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className={cn(
                'block w-full text-left px-4 py-2 text-sm font-medium transition-colors border-b border-[#F5F5F5] last:border-b-0',
                opt.value === value
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
  )
}
