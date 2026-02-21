'use client'

import { useState, type ReactNode } from 'react'
import { useI18n } from '@/lib/i18n'
import {
  Button, Input, Textarea, Select, Toggle, FormField,
  Avatar, Divider, Spinner, ProgressRing, Badge, StatCard,
  EmptyState, Tabs, Skeleton, Modal, ModalHeader, ModalBody, ModalFooter,
  ConfirmDialog, ThemeToggle, ToolbarButton, ThemeCustomizer,
} from '@ground/ui'
import {
  SURFACE_PRESETS,
  ACCENT_PRESETS,
  generateLightSurface,
  generateDarkSurface,
  generateSecondaryAccent,
  hexToHsl,
} from '@ground/ui/theme'

/* ============================================
   Design System Catalog
   Centra — Minimal / Dark-first / High contrast
   ============================================ */

const NAV_IDS = [
  'theme', 'overview', 'colors', 'surfaces', 'typography', 'spacing',
  'buttons', 'inputs', 'data', 'feedback', 'overlays', 'layout',
] as const

export default function DesignSystemPage() {
  const [active, setActive] = useState('theme')
  const { t, language, setLanguage } = useI18n()
  const ds = t.designSystem

  const navItems = NAV_IDS.map(id => ({
    id,
    label: ds.nav[id as keyof typeof ds.nav],
  }))

  return (
    <div className="ds-root">
      <style>{`
        .ds-root {
          min-height: 100dvh;
          background: var(--bg-primary);
          display: flex;
        }

        /* --- Sidebar --- */
        .ds-sidebar {
          width: 220px;
          flex-shrink: 0;
          border-right: 1px solid var(--border-subtle);
          position: sticky;
          top: 0;
          height: 100dvh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          padding: 32px 0;
        }
        .ds-sidebar-header {
          padding: 0 24px 24px;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 16px;
        }
        .ds-sidebar-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin: 0;
        }
        .ds-sidebar-sub {
          font-size: 12px;
          color: var(--text-muted);
          margin: 4px 0 0;
          letter-spacing: 0.02em;
        }
        .ds-nav-item {
          display: block;
          width: 100%;
          padding: 7px 24px;
          font-size: 13px;
          color: var(--text-muted);
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: color 150ms ease;
          position: relative;
        }
        .ds-nav-item:hover {
          color: var(--text-secondary);
        }
        .ds-nav-item[data-active="true"] {
          color: var(--text-primary);
          font-weight: 500;
        }
        .ds-nav-item[data-active="true"]::before {
          content: '';
          position: absolute;
          left: 0;
          top: 6px;
          bottom: 6px;
          width: 2px;
          background: var(--text-primary);
          border-radius: 1px;
        }
        .ds-sidebar-footer {
          margin-top: auto;
          padding: 16px 24px 0;
          border-top: 1px solid var(--border-subtle);
        }

        /* --- Main --- */
        .ds-main {
          flex: 1;
          min-width: 0;
          overflow-y: auto;
          height: 100dvh;
        }
        .ds-content {
          max-width: 880px;
          margin: 0 auto;
          padding: 48px 48px 96px;
        }

        /* --- Section --- */
        .ds-section-title {
          font-size: 24px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin: 0 0 4px;
        }
        .ds-section-desc {
          font-size: 14px;
          color: var(--text-muted);
          margin: 0 0 40px;
          line-height: 1.6;
        }
        .ds-group {
          margin-bottom: 48px;
        }
        .ds-group:last-child {
          margin-bottom: 0;
        }
        .ds-group-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin: 0 0 16px;
        }

        /* --- Stage (component demo area) --- */
        .ds-stage {
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 32px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
        }
        .ds-stage-col {
          flex-direction: column;
          align-items: stretch;
        }
        .ds-stage-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          padding: 32px;
        }

        /* --- Swatch Grid --- */
        .ds-swatch-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
        }
        .ds-swatch {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ds-swatch-color {
          height: 64px;
          border-radius: 10px;
          border: 1px solid var(--border-subtle);
        }
        .ds-swatch-name {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary);
          line-height: 1;
        }
        .ds-swatch-value {
          font-size: 11px;
          color: var(--text-muted);
          font-family: var(--font-mono);
          line-height: 1;
        }

        /* --- Token Table --- */
        .ds-token-table {
          width: 100%;
          border-collapse: collapse;
        }
        .ds-token-table th {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          text-align: left;
          padding: 0 0 12px;
          border-bottom: 1px solid var(--border-default);
        }
        .ds-token-table td {
          font-size: 13px;
          padding: 10px 16px 10px 0;
          border-bottom: 1px solid var(--border-default);
          vertical-align: middle;
        }
        .ds-token-table tr:last-child td {
          border-bottom: none;
        }
        .ds-token-name {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--accent-light);
        }
        .ds-token-val {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-muted);
        }
        .ds-token-preview {
          display: inline-block;
          vertical-align: middle;
        }

        /* --- Inline Row --- */
        .ds-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        /* --- Responsive --- */
        @media (max-width: 768px) {
          .ds-sidebar { display: none; }
          .ds-content { padding: 24px 16px 64px; }
          .ds-stage { padding: 20px; }
          .ds-stage-grid { padding: 20px; }
          .ds-swatch-grid { grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); }
          .ds-swatch-color { height: 48px; }
        }
      `}</style>

      {/* Sidebar */}
      <nav className="ds-sidebar scrollbar-hide">
        <div className="ds-sidebar-header">
          <h1 className="ds-sidebar-title">Centra</h1>
          <p className="ds-sidebar-sub">{ds.subtitle}</p>
        </div>
        {navItems.map((item) => (
          <button
            key={item.id}
            className="ds-nav-item"
            data-active={active === item.id}
            onClick={() => {
              setActive(item.id)
              document.querySelector('.ds-main')?.scrollTo({ top: 0 })
            }}
          >
            {item.label}
          </button>
        ))}
        <div className="ds-sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <a
              href="/dashboard"
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                textDecoration: 'none',
                transition: 'color 150ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              {ds.backToApp}
            </a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ToolbarButton onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}>
                {language === 'ja' ? 'EN' : 'JA'}
              </ToolbarButton>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="ds-main">
        <div className="ds-content">
          {active === 'theme' && <ThemeSection />}
          {active === 'overview' && <OverviewSection />}
          {active === 'colors' && <ColorsSection />}
          {active === 'surfaces' && <SurfacesSection />}
          {active === 'typography' && <TypographySection />}
          {active === 'spacing' && <SpacingSection />}
          {active === 'buttons' && <ButtonsSection />}
          {active === 'inputs' && <InputsSection />}
          {active === 'data' && <DataDisplaySection />}
          {active === 'feedback' && <FeedbackSection />}
          {active === 'overlays' && <OverlaysSection />}
          {active === 'layout' && <LayoutSection />}
        </div>
      </main>
    </div>
  )
}

/* ============================================
   Helpers
   ============================================ */

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <>
      <h2 className="ds-section-title">{title}</h2>
      <p className="ds-section-desc">{desc}</p>
    </>
  )
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="ds-group">
      <h3 className="ds-group-label">{label}</h3>
      {children}
    </div>
  )
}

function Stage({ children, col, style }: { children: ReactNode; col?: boolean; style?: React.CSSProperties }) {
  return (
    <div className={`ds-stage ${col ? 'ds-stage-col' : ''}`} style={style}>
      {children}
    </div>
  )
}

function Swatch({ name, cssVar }: { name: string; cssVar: string }) {
  return (
    <div className="ds-swatch">
      <div className="ds-swatch-color" style={{ background: `var(${cssVar})` }} />
      <span className="ds-swatch-name">{name}</span>
      <span className="ds-swatch-value">{cssVar}</span>
    </div>
  )
}

/* ============================================
   Sections
   ============================================ */

function ThemeSection() {
  const { t, language } = useI18n()
  const ds = t.designSystem.theme
  return (
    <>
      <SectionHeader title={ds.title} desc={ds.desc} />
      <ThemeCustomizer language={language as 'ja' | 'en'} />
    </>
  )
}

function OverviewSection() {
  const { t } = useI18n()
  const ds = t.designSystem.overview
  return (
    <>
      <SectionHeader title={ds.title} desc={ds.desc} />

      <Group label={ds.principles}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            { title: ds.minimal, desc: ds.minimalDesc },
            { title: ds.darkFirst, desc: ds.darkFirstDesc },
            { title: ds.highContrast, desc: ds.highContrastDesc },
            { title: ds.refined, desc: ds.refinedDesc },
          ].map((p) => (
            <div
              key={p.title}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                padding: '20px 24px',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{p.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </Group>

      <Group label={ds.tokenArchitecture}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { layer: ds.primitive, desc: ds.primitiveDesc, example: '--p-gray-800: #1a1a1a' },
            { layer: ds.semantic, desc: ds.semanticDesc, example: '--bg-elevated: var(--p-gray-800)' },
            { layer: ds.component, desc: ds.componentDesc, example: '--card-bg: var(--bg-card)' },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                padding: '16px 20px',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{item.layer}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
              <code
                style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--accent-light)',
                  background: 'var(--p-white-5)',
                  padding: '4px 8px',
                  borderRadius: 6,
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                {item.example}
              </code>
            </div>
          ))}
        </div>
      </Group>
    </>
  )
}

function ColorsSection() {
  const { t } = useI18n()
  const ds = t.designSystem.colors
  return (
    <>
      <SectionHeader title={ds.title} desc={ds.desc} />

      <Group label={ds.backgrounds}>
        <div className="ds-swatch-grid">
          <Swatch name="Primary" cssVar="--bg-primary" />
          <Swatch name="Secondary" cssVar="--bg-secondary" />
          <Swatch name="Card" cssVar="--bg-card" />
          <Swatch name="Elevated" cssVar="--bg-elevated" />
          <Swatch name="Surface" cssVar="--bg-surface" />
          <Swatch name="Surface Hover" cssVar="--bg-surface-hover" />
        </div>
      </Group>

      <Group label={ds.text}>
        <div className="ds-swatch-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
          {[
            { name: 'Primary', cssVar: '--text-primary' },
            { name: 'Secondary', cssVar: '--text-secondary' },
            { name: 'Muted', cssVar: '--text-muted' },
            { name: 'Disabled', cssVar: '--text-disabled' },
          ].map((c) => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: `var(${c.cssVar})`,
                  border: '1px solid var(--border-subtle)',
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{c.cssVar}</div>
              </div>
            </div>
          ))}
        </div>
      </Group>

      <Group label={ds.borders}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { name: 'Subtle', cssVar: '--border-subtle' },
            { name: 'Default', cssVar: '--border-default' },
            { name: 'Strong', cssVar: '--border-strong' },
          ].map((b) => (
            <div key={b.name} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 80,
                  height: 48,
                  borderRadius: 10,
                  background: 'var(--bg-secondary)',
                  border: `2px solid var(${b.cssVar})`,
                  marginBottom: 8,
                }}
              />
              <div style={{ fontSize: 12, fontWeight: 500 }}>{b.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{b.cssVar}</div>
            </div>
          ))}
        </div>
      </Group>

      <Group label={ds.semantic}>
        <div className="ds-swatch-grid">
          <Swatch name="Success" cssVar="--success" />
          <Swatch name="Warning" cssVar="--warning" />
          <Swatch name="Error" cssVar="--error" />
          <Swatch name="Info" cssVar="--info" />
          <Swatch name="Accent" cssVar="--accent" />
          <Swatch name="Neutral" cssVar="--neutral" />
        </div>
      </Group>

      <Group label={ds.semanticExtended}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {['success', 'warning', 'error', 'info'].map((name) => (
            <div
              key={name}
              style={{
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ height: 6, background: `var(--${name})` }} />
              <div
                style={{
                  padding: '12px 14px',
                  background: `var(--${name}-bg)`,
                  fontSize: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <span style={{ fontWeight: 600, color: `var(--${name})`, textTransform: 'capitalize' }}>{name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  bg / border / glow
                </span>
              </div>
            </div>
          ))}
        </div>
      </Group>
    </>
  )
}

function SurfacesSection() {
  const { t } = useI18n()
  const ds = t.designSystem.surfaces

  const matrixAccents = ACCENT_PRESETS.filter(a =>
    ['sky', 'ember', 'violet', 'emerald', 'rose'].includes(a.id)
  )

  return (
    <>
      <SectionHeader title={ds.title} desc={ds.desc} />

      {/* Surface Presets */}
      <Group label={ds.surfacePresets}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {SURFACE_PRESETS.map((preset) => {
            const light = generateLightSurface(preset.hue, preset.tintStrength, preset.lightnessBase)
            const dark = generateDarkSurface(preset.hue, preset.tintStrength)

            const lightBgs = [
              { label: 'secondary', hex: light['--bg-secondary'] },
              { label: 'primary', hex: light['--bg-primary'] },
              { label: 'card', hex: light['--bg-card'] },
              { label: 'elevated', hex: light['--bg-elevated'] },
            ]
            const darkBgs = [
              { label: 'secondary', hex: dark['--bg-secondary'] },
              { label: 'primary', hex: dark['--bg-primary'] },
              { label: 'card', hex: dark['--bg-card'] },
              { label: 'elevated', hex: dark['--bg-elevated'] },
            ]

            const lightTexts = [
              { label: 'Primary', hex: light['--text-primary'] },
              { label: 'Secondary', hex: light['--text-secondary'] },
              { label: 'Muted', hex: light['--text-muted'] },
              { label: 'Disabled', hex: light['--text-disabled'] },
            ]
            const darkTexts = [
              { label: 'Primary', hex: dark['--text-primary'] },
              { label: 'Secondary', hex: dark['--text-secondary'] },
              { label: 'Muted', hex: dark['--text-muted'] },
              { label: 'Disabled', hex: dark['--text-disabled'] },
            ]

            return (
              <div
                key={preset.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  padding: 24,
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{preset.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{preset.nameJa}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-disabled)', fontFamily: 'var(--font-mono)', marginBottom: 20 }}>
                  {ds.hue}: {preset.hue} &middot; {ds.tint}: {preset.tintStrength} &middot; {ds.lightnessBase}: {preset.lightnessBase}
                </div>

                {/* BG Hierarchy */}
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>
                  {ds.bgHierarchy}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  {/* Light mode BG */}
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-disabled)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{ds.lightMode}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {lightBgs.map((bg) => (
                        <div key={bg.label} style={{ flex: 1, textAlign: 'center' }}>
                          <div
                            style={{
                              height: 40,
                              borderRadius: 8,
                              background: bg.hex,
                              border: '1px solid var(--border-subtle)',
                              marginBottom: 4,
                            }}
                          />
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{bg.label}</div>
                          <div style={{ fontSize: 9, color: 'var(--text-disabled)', fontFamily: 'var(--font-mono)' }}>{bg.hex}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dark mode BG */}
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-disabled)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{ds.darkMode}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {darkBgs.map((bg) => (
                        <div key={bg.label} style={{ flex: 1, textAlign: 'center' }}>
                          <div
                            style={{
                              height: 40,
                              borderRadius: 8,
                              background: bg.hex,
                              border: '1px solid rgba(255,255,255,0.1)',
                              marginBottom: 4,
                            }}
                          />
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{bg.label}</div>
                          <div style={{ fontSize: 9, color: 'var(--text-disabled)', fontFamily: 'var(--font-mono)' }}>{bg.hex}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Text Hierarchy */}
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>
                  {ds.textHierarchy}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* Light text */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {lightTexts.map((tx) => (
                      <div key={tx.label} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            background: tx.hex,
                            border: '1px solid var(--border-subtle)',
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{tx.label}</div>
                          <div style={{ fontSize: 9, color: 'var(--text-disabled)', fontFamily: 'var(--font-mono)' }}>{tx.hex}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Dark text */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {darkTexts.map((tx) => (
                      <div key={tx.label} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            background: tx.hex,
                            border: '1px solid rgba(255,255,255,0.1)',
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{tx.label}</div>
                          <div style={{ fontSize: 9, color: 'var(--text-disabled)', fontFamily: 'var(--font-mono)' }}>{tx.hex}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Group>

      {/* Surface x Accent Matrix */}
      <Group label={ds.surfaceAccentMatrix}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.5 }}>
          {ds.surfaceAccentMatrixDesc}
        </p>
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            padding: 24,
            overflowX: 'auto',
          }}
        >
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'left', padding: '0 12px 12px 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Surface
                </th>
                {matrixAccents.map((a) => (
                  <th key={a.id} style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center', padding: '0 8px 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {a.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SURFACE_PRESETS.map((surface) => {
                const dark = generateDarkSurface(surface.hue, surface.tintStrength)
                const light = generateLightSurface(surface.hue, surface.tintStrength, surface.lightnessBase)
                return (
                  <tr key={surface.id}>
                    <td style={{ fontSize: 12, fontWeight: 500, padding: '8px 12px 8px 0', color: 'var(--text-secondary)' }}>
                      {surface.name}
                    </td>
                    {matrixAccents.map((accent) => (
                      <td key={accent.id} style={{ padding: '6px 8px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                          {/* Dark surface cell */}
                          <div
                            style={{
                              width: 36,
                              height: 28,
                              borderRadius: 6,
                              background: dark['--bg-primary'],
                              border: '1px solid rgba(255,255,255,0.08)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: accent.color }} />
                          </div>
                          {/* Light surface cell */}
                          <div
                            style={{
                              width: 36,
                              height: 28,
                              borderRadius: 6,
                              background: light['--bg-primary'],
                              border: '1px solid rgba(0,0,0,0.08)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: accent.color }} />
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Group>

      {/* Secondary Accent */}
      <Group label={ds.secondaryAccent}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px', lineHeight: 1.5 }}>
          {ds.secondaryAccentDesc}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {ACCENT_PRESETS.slice(0, 6).map((accent) => {
            const secondary = generateSecondaryAccent(accent.color)
            const primaryHsl = hexToHsl(accent.color)
            const secondaryHsl = hexToHsl(secondary)

            return (
              <div
                key={accent.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{accent.name}</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  {/* Primary swatch */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        height: 32,
                        borderRadius: 6,
                        background: accent.color,
                        marginBottom: 4,
                      }}
                    />
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ds.primaryLabel}</div>
                    <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-disabled)' }}>{accent.color}</div>
                  </div>
                  {/* Arrow */}
                  <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-disabled)', fontSize: 14 }}>
                    &rarr;
                  </div>
                  {/* Secondary swatch */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        height: 32,
                        borderRadius: 6,
                        background: secondary,
                        marginBottom: 4,
                      }}
                    />
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ds.secondaryLabel}</div>
                    <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-disabled)' }}>{secondary}</div>
                  </div>
                </div>
                <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-disabled)' }}>
                  {ds.hueShift}: {Math.round(primaryHsl.h)} &rarr; {Math.round(secondaryHsl.h)} (+60)
                </div>
              </div>
            )
          })}
        </div>
      </Group>
    </>
  )
}

function TypographySection() {
  const { t } = useI18n()
  const ds = t.designSystem.typography
  return (
    <>
      <SectionHeader title={ds.title} desc={ds.desc} />

      <Group label={ds.typeScale}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { token: '--text-3xl', size: '32px', weight: 700, text: 'Display heading' },
            { token: '--text-2xl', size: '24px', weight: 700, text: 'Page heading' },
            { token: '--text-xl', size: '20px', weight: 600, text: 'Section title' },
            { token: '--text-lg', size: '16px', weight: 600, text: 'Card heading' },
            { token: '--text-md', size: '14px', weight: 500, text: 'Body emphasis' },
            { token: '--text-base', size: '13px', weight: 400, text: 'Default body text used across the interface' },
            { token: '--text-sm', size: '12px', weight: 400, text: 'Secondary text and descriptions' },
            { token: '--text-xs', size: '10px', weight: 500, text: 'LABELS AND CAPTIONS', transform: 'uppercase' as const },
          ].map((item) => (
            <div
              key={item.token}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 24,
                padding: '14px 0',
                borderBottom: '1px solid var(--border-default)',
              }}
            >
              <code
                style={{
                  width: 100,
                  flexShrink: 0,
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                }}
              >
                {item.size}
              </code>
              <span
                style={{
                  fontSize: item.size,
                  fontWeight: item.weight,
                  letterSpacing: item.token.includes('3xl') || item.token.includes('2xl') ? '-0.02em' : undefined,
                  textTransform: item.transform,
                  color: item.token === '--text-sm' || item.token === '--text-xs' ? 'var(--text-secondary)' : undefined,
                  lineHeight: 1.3,
                }}
              >
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </Group>

      <Group label={ds.fontFamilies}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 14 }}>Noto Sans JP / System</span>
            <code style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>--font-family</code>
          </div>
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 10,
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 14, fontFamily: 'var(--font-mono)' }}>SF Mono / Fira Code</span>
            <code style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>--font-mono</code>
          </div>
        </div>
      </Group>
    </>
  )
}

function SpacingSection() {
  const { t } = useI18n()
  const ds = t.designSystem.spacingRadius
  return (
    <>
      <SectionHeader title={ds.title} desc={ds.desc} />

      <Group label={ds.spacingScale}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { token: 'xs', value: '4px' },
            { token: 'sm', value: '8px' },
            { token: 'md', value: '12px' },
            { token: 'lg', value: '16px' },
            { token: 'xl', value: '24px' },
            { token: '2xl', value: '32px' },
            { token: '3xl', value: '48px' },
            { token: '4xl', value: '64px' },
          ].map((s) => (
            <div
              key={s.token}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '10px 0',
                borderBottom: '1px solid var(--border-default)',
              }}
            >
              <code
                style={{
                  width: 60,
                  flexShrink: 0,
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                }}
              >
                {s.token}
              </code>
              <div
                style={{
                  height: 8,
                  width: s.value,
                  background: 'var(--accent)',
                  borderRadius: 4,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </Group>

      <Group label={ds.borderRadius}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[
            { token: 'none', value: '0', px: '0px' },
            { token: 'xs', value: '2px', px: '2px' },
            { token: 'sm', value: '4px', px: '4px' },
            { token: 'md', value: '8px', px: '8px' },
            { token: 'lg', value: '12px', px: '12px' },
            { token: 'xl', value: '16px', px: '16px' },
            { token: 'full', value: '9999px', px: '9999px' },
          ].map((r) => (
            <div key={r.token} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: r.px,
                  marginBottom: 8,
                }}
              />
              <div style={{ fontSize: 12, fontWeight: 500 }}>{r.token}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{r.value}</div>
            </div>
          ))}
        </div>
      </Group>
    </>
  )
}

function ButtonsSection() {
  const { t } = useI18n()
  const ds = t.designSystem.buttons
  return (
    <>
      <SectionHeader title={ds.title} desc={ds.desc} />

      <Group label={ds.variants}>
        <Stage>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </Stage>
      </Group>

      <Group label={ds.sizes}>
        <Stage style={{ alignItems: 'center' }}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Stage>
      </Group>

      <Group label={ds.states}>
        <Stage>
          <Button>Default</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </Stage>
      </Group>

      <Group label={ds.iconButtons}>
        <Stage style={{ alignItems: 'center' }}>
          <Button icon size="sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14" /></svg>
          </Button>
          <Button icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14" /></svg>
          </Button>
          <Button icon size="lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14" /></svg>
          </Button>
        </Stage>
      </Group>

      <Group label={ds.withIcons}>
        <Stage>
          <Button
            leftIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14" /></svg>}
          >
            {ds.addItem}
          </Button>
          <Button
            variant="secondary"
            rightIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-4-4l4 4-4 4" /></svg>}
          >
            {ds.continue}
          </Button>
        </Stage>
      </Group>
    </>
  )
}

function InputsSection() {
  const [toggle1, setToggle1] = useState(false)
  const [toggle2, setToggle2] = useState(true)
  const { t } = useI18n()
  const ds = t.designSystem.inputs

  return (
    <>
      <SectionHeader title={ds.title} desc={ds.desc} />

      <Group label={ds.textInput}>
        <div className="ds-stage-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <Input placeholder="Default input" />
          <Input placeholder="Error state" error />
          <Input placeholder="Disabled" disabled />
          <Input type="password" placeholder="Password" />
        </div>
      </Group>

      <Group label={ds.textarea}>
        <div className="ds-stage-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <Textarea placeholder="Default textarea" />
          <Textarea placeholder="Autosize — try typing" autosize />
        </div>
      </Group>

      <Group label={ds.select}>
        <div className="ds-stage-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <Select
            placeholder="Choose option..."
            options={[
              { value: '1', label: 'Option 1' },
              { value: '2', label: 'Option 2' },
              { value: '3', label: 'Option 3' },
            ]}
          />
          <Select error placeholder="Error state">
            <option value="a">Option A</option>
            <option value="b">Option B</option>
          </Select>
        </div>
      </Group>

      <Group label={ds.toggle}>
        <Stage>
          <div className="ds-row">
            <Toggle checked={toggle1} onChange={setToggle1} label="Toggle off" />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Off</span>
          </div>
          <div className="ds-row">
            <Toggle checked={toggle2} onChange={setToggle2} label="Toggle on" />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>On</span>
          </div>
          <div className="ds-row">
            <Toggle checked={false} onChange={() => {}} disabled label="Disabled" />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Disabled</span>
          </div>
        </Stage>
      </Group>

      <Group label={ds.formField}>
        <div className="ds-stage-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <FormField label="Email" htmlFor="email-demo" required>
            <Input id="email-demo" type="email" placeholder="you@example.com" />
          </FormField>
          <FormField label="Password" htmlFor="pw-demo" error="Must be at least 8 characters">
            <Input id="pw-demo" type="password" placeholder="Enter password" error />
          </FormField>
          <FormField label="Bio" htmlFor="bio-demo" hint="Max 200 characters">
            <Textarea id="bio-demo" placeholder="Tell us about yourself" autosize />
          </FormField>
          <FormField label="Role" htmlFor="role-demo" required>
            <Select
              id="role-demo"
              placeholder="Select role..."
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'user', label: 'User' },
                { value: 'viewer', label: 'Viewer' },
              ]}
            />
          </FormField>
        </div>
      </Group>
    </>
  )
}

function DataDisplaySection() {
  const [activeTab, setActiveTab] = useState('tab1')
  const { t } = useI18n()
  const ds = t.designSystem.dataDisplay

  return (
    <>
      <SectionHeader title={ds.title} desc={ds.desc} />

      <Group label={ds.badge}>
        <Stage>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="neutral">Neutral</Badge>
          <Badge color="#a855f7">Custom</Badge>
        </Stage>
      </Group>

      <Group label={ds.statCard}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <StatCard label="Total Items" value="1,234" />
          <StatCard label="Growth" value="+12%" trend={{ value: "+12%", direction: "up" }} />
          <StatCard label="Errors" value="3" trend={{ value: "-2", direction: "down" }} />
        </div>
      </Group>

      <Group label={ds.avatar}>
        <Stage style={{ alignItems: 'center' }}>
          <Avatar name="John Doe" size="sm" />
          <Avatar name="Jane Smith" size="md" />
          <Avatar name="Bob" size="lg" />
          <Avatar name="Alice W" size="xl" />
          <Avatar size="md" />
        </Stage>
      </Group>

      <Group label={ds.tabsPill}>
        <Stage col>
          <Tabs
            variant="pill"
            value={activeTab}
            onChange={setActiveTab}
            items={[
              { value: 'tab1', label: 'Overview' },
              { value: 'tab2', label: 'Details', count: 5 },
              { value: 'tab3', label: 'Settings' },
            ]}
          />
        </Stage>
      </Group>

      <Group label={ds.tabsUnderline}>
        <Stage col>
          <Tabs
            variant="underline"
            value={activeTab}
            onChange={setActiveTab}
            items={[
              { value: 'tab1', label: 'Overview' },
              { value: 'tab2', label: 'Details', count: 5 },
              { value: 'tab3', label: 'Settings' },
            ]}
          />
        </Stage>
      </Group>

      <Group label={ds.divider}>
        <Stage col style={{ gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Content above</p>
          <Divider />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Content below</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 32 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Left</span>
            <Divider direction="vertical" />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Right</span>
          </div>
        </Stage>
      </Group>
    </>
  )
}

function FeedbackSection() {
  const { t } = useI18n()
  const ds = t.designSystem.feedback
  return (
    <>
      <SectionHeader title={ds.title} desc={ds.desc} />

      <Group label={ds.spinner}>
        <Stage style={{ alignItems: 'center' }}>
          <Spinner size={16} />
          <Spinner size={20} />
          <Spinner size={28} />
          <Spinner size={36} />
        </Stage>
      </Group>

      <Group label={ds.progressRing}>
        <Stage style={{ alignItems: 'center', gap: 24 }}>
          <ProgressRing value={0} showLabel />
          <ProgressRing value={25} showLabel color="var(--info)" />
          <ProgressRing value={50} showLabel color="var(--warning)" />
          <ProgressRing value={75} showLabel color="var(--accent)" />
          <ProgressRing value={100} showLabel />
        </Stage>
      </Group>

      <Group label={ds.skeleton}>
        <Stage col style={{ maxWidth: 400 }}>
          <Skeleton variant="title" />
          <Skeleton variant="text" count={3} />
          <div style={{ marginTop: 12 }}>
            <Skeleton variant="card" />
          </div>
        </Stage>
      </Group>

      <Group label={ds.emptyState}>
        <Stage col>
          <EmptyState
            icon={
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5-5 5 5m-5-5v12" />
              </svg>
            }
            title={ds.noItemsYet}
            description={ds.addFirstItem}
            action={<Button size="sm">{ds.addItem}</Button>}
          />
        </Stage>
      </Group>
    </>
  )
}

function OverlaysSection() {
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { t } = useI18n()
  const ds = t.designSystem.overlays

  return (
    <>
      <SectionHeader title={ds.title} desc={ds.desc} />

      <Group label={ds.modal}>
        <Stage>
          <Button onClick={() => setModalOpen(true)} variant="secondary">
            {ds.openModal}
          </Button>
        </Stage>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} showClose>
          <ModalHeader>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{ds.modalTitle}</h3>
          </ModalHeader>
          <ModalBody>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              {ds.modalBody}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>{ds.cancel}</Button>
            <Button onClick={() => setModalOpen(false)}>{ds.confirm}</Button>
          </ModalFooter>
        </Modal>
      </Group>

      <Group label={ds.confirmDialog}>
        <Stage>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            {ds.deleteItem}
          </Button>
        </Stage>
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={async () => {
            await new Promise((r) => setTimeout(r, 1000))
            setConfirmOpen(false)
          }}
          title={ds.deleteTitle}
          description={ds.deleteDesc}
          confirmLabel={ds.delete}
          variant="danger"
        />
      </Group>

      <Group label={ds.toast}>
        <Stage col>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            {ds.toastDesc}
          </p>
        </Stage>
      </Group>
    </>
  )
}

function LayoutSection() {
  const { t } = useI18n()
  const ds = t.designSystem.layout
  return (
    <>
      <SectionHeader title={ds.title} desc={ds.desc} />

      <Group label={ds.stackVertical}>
        <Stage col>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                padding: '12px 16px',
                background: 'var(--bg-surface)',
                borderRadius: 8,
                fontSize: 13,
                color: 'var(--text-secondary)',
              }}
            >
              Stack item {i}
            </div>
          ))}
        </Stage>
      </Group>

      <Group label={ds.stackHorizontal}>
        <Stage>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                padding: '8px 20px',
                background: 'var(--bg-surface)',
                borderRadius: 8,
                fontSize: 13,
                color: 'var(--text-secondary)',
              }}
            >
              Item {i}
            </div>
          ))}
        </Stage>
      </Group>

      <Group label={ds.grid3Columns}>
        <div className="ds-stage-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              style={{
                padding: 16,
                background: 'var(--bg-surface)',
                borderRadius: 8,
                textAlign: 'center',
                fontSize: 13,
                color: 'var(--text-secondary)',
              }}
            >
              Cell {i}
            </div>
          ))}
        </div>
      </Group>

      <Group label={ds.gridAutoFit}>
        <div className="ds-stage-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                padding: 16,
                background: 'var(--bg-surface)',
                borderRadius: 8,
                textAlign: 'center',
                fontSize: 13,
                color: 'var(--text-secondary)',
              }}
            >
              Auto {i}
            </div>
          ))}
        </div>
      </Group>
    </>
  )
}
