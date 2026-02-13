'use client'

interface Tab {
  id: string
  label: string
  count?: number
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
  variant?: 'pill' | 'underline'
}

export function Tabs({ tabs, activeTab, onChange, variant = 'pill' }: TabsProps) {
  if (variant === 'underline') {
    return (
      <div
        className="flex gap-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="px-4 py-2.5 text-sm font-medium transition-colors relative"
              style={{
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                background: 'transparent',
              }}
            >
              <span className="flex items-center gap-1.5">
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className="text-xs px-1.5 rounded-full"
                    style={{
                      background: isActive ? 'var(--p-white-12)' : 'var(--p-white-6)',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </span>
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: 'var(--text-primary)' }}
                />
              )}
            </button>
          )
        })}
      </div>
    )
  }

  // Pill variant
  return (
    <div className="flex gap-2 flex-wrap">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`pill-filter ${isActive ? 'pill-filter-active' : ''}`}
          >
            <span className="flex items-center gap-1.5">
              {tab.label}
              {tab.count !== undefined && (
                <span className="text-xs opacity-70">
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
