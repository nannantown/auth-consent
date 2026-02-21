'use client'

import {
  SpatialDemos, GridDemos, SliderDemos, GestureDemos,
  CardDemos, PhysicsDemos, SemanticDemos, AmbientDemos,
} from '@ground/ui/interactions'

const SECTIONS = [
  { id: 'spatial', title: 'Spatial', titleJa: '空間系', component: SpatialDemos },
  { id: 'grid', title: 'Grid', titleJa: 'グリッド系', component: GridDemos },
  { id: 'slider', title: 'Slider', titleJa: 'スライダー系', component: SliderDemos },
  { id: 'gesture', title: 'Gesture', titleJa: 'ジェスチャー系', component: GestureDemos },
  { id: 'card', title: 'Card', titleJa: 'カード系', component: CardDemos },
  { id: 'physics', title: 'Physics', titleJa: '物理系', component: PhysicsDemos },
  { id: 'semantic', title: 'Semantic', titleJa: 'セマンティック系', component: SemanticDemos },
  { id: 'ambient', title: 'Ambient', titleJa: '環境系', component: AmbientDemos },
] as const

export default function InteractionsPage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            2-Value Interaction Patterns
          </h1>
          <p
            style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              margin: '4px 0 0',
            }}
          >
            40 ways to capture two values from a single interaction
          </p>
        </div>
        <a
          href="/design-system"
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid var(--border-subtle)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-default)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          Design System
        </a>
      </header>

      {/* Section Nav */}
      <nav
        style={{
          position: 'sticky',
          top: 57,
          zIndex: 9,
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '10px 24px',
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
        }}
        className="scrollbar-hide"
      >
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--text-muted)',
              textDecoration: 'none',
              padding: '5px 12px',
              borderRadius: 20,
              border: '1px solid var(--border-subtle)',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-surface-hover)'
              e.currentTarget.style.borderColor = 'var(--border-default)'
              e.currentTarget.style.color = 'var(--text-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'var(--border-subtle)'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            {s.title}
          </a>
        ))}
      </nav>

      {/* Content */}
      <main style={{ padding: '32px 24px 96px', maxWidth: 1200, margin: '0 auto' }}>
        {SECTIONS.map((section) => {
          const Component = section.component
          return (
            <section key={section.id} id={section.id} style={{ marginBottom: 64 }}>
              <div style={{ marginBottom: 24 }}>
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {section.title}
                </h2>
                <span
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                  }}
                >
                  {section.titleJa}
                </span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: 16,
                }}
              >
                <Component />
              </div>
            </section>
          )
        })}
      </main>
    </div>
  )
}
