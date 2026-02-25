'use client'

import { useI18n } from '@/lib/i18n'

interface AddAppIconProps {
  onClick: () => void
}

export function AddAppIcon({ onClick }: AddAppIconProps) {
  const { t } = useI18n()

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 md:gap-2 group focus-visible:outline-2 focus-visible:outline-offset-2 rounded-lg"
    >
      <div
        className="w-16 h-16 md:w-[88px] md:h-[88px] rounded-2xl md:rounded-[20px] flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-hover:border-[rgba(255,255,255,0.25)] group-active:scale-95"
        style={{
          border: '1.5px dashed rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.4)',
        }}
      >
        <div className="w-6 h-6 md:w-7 md:h-7">
          <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </div>
      <span
        className="text-[10px] md:text-[11px] leading-tight text-center font-medium w-[72px] md:w-[100px]"
        style={{ color: 'var(--text-muted)' }}
      >
        {t.dashboard.addSpace}
      </span>
    </button>
  )
}
