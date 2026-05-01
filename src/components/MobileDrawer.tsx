import { useEffect } from 'react'
import { X } from 'lucide-react'

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function MobileDrawer({ open, onClose, children }: MobileDrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] md:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={
          'fixed top-0 left-0 z-50 h-full w-[85%] max-w-[320px] bg-white border-r border-[#E5E5E5] transform transition-transform duration-300 ease-out md:hidden ' +
          (open ? 'translate-x-0' : '-translate-x-full')
        }
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5]">
          <span className="text-sm font-bold tracking-wide uppercase text-[#111111]">
            Action Center
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#F5F5F5] hover:bg-[#E5E5E5] transition-colors"
          >
            <X className="w-4 h-4 text-[#111111]" />
          </button>
        </div>
        <div className="h-[calc(100%-60px)] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </>
  )
}
