'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { FormField } from '@/components/ui/FormField'
import { Avatar } from '@/components/ui/Avatar'
import { Divider } from '@/components/ui/Divider'
import { Spinner } from '@/components/ui/Spinner'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { Badge } from '@/components/ui/Badge'
import { StatCard } from '@/components/ui/StatCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Tabs } from '@/components/ui/Tabs'
import { Skeleton } from '@/components/ui/Skeleton'
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Stack } from '@/components/layout/Stack'
import { Grid } from '@/components/layout/Grid'
import { Section } from '@/components/layout/Section'

/* ============================================
   Design System Catalog
   ============================================ */

const catalogSections = [
  { id: 'tokens', label: 'Tokens' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'inputs', label: 'Inputs' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'data', label: 'Data Display' },
  { id: 'layout', label: 'Layout' },
  { id: 'overlays', label: 'Overlays' },
]

export default function DesignSystemPage() {
  const [activeSection, setActiveSection] = useState('tokens')

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          padding: 'var(--space-lg) var(--space-xl)',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-primary)',
          zIndex: 'var(--z-sticky)',
        }}
      >
        <div style={{ maxWidth: 'var(--container-wide)', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
            <div>
              <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, margin: 0 }}>
                Centra Design System
              </h1>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Tokens, components, and patterns
              </p>
            </div>
            <a
              href="/dashboard"
              className="btn btn-ghost btn-sm"
              style={{ textDecoration: 'none' }}
            >
              Back to app
            </a>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            {catalogSections.map((s) => (
              <button
                key={s.id}
                className={`pill-filter ${activeSection === s.id ? 'pill-filter-active' : ''}`}
                onClick={() => setActiveSection(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 'var(--container-wide)', margin: '0 auto', padding: 'var(--space-xl)' }}>
        {activeSection === 'tokens' && <TokensSection />}
        {activeSection === 'buttons' && <ButtonsSection />}
        {activeSection === 'inputs' && <InputsSection />}
        {activeSection === 'feedback' && <FeedbackSection />}
        {activeSection === 'data' && <DataDisplaySection />}
        {activeSection === 'layout' && <LayoutSection />}
        {activeSection === 'overlays' && <OverlaysSection />}
      </div>
    </div>
  )
}

/* ============================================
   Helpers
   ============================================ */

function CatalogCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-lg)',
      }}
    >
      <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, margin: 0 }}>{title}</h3>
      {children}
    </div>
  )
}

function ColorSwatch({ name, value }: { name: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 'var(--radius-sm)',
          background: value,
          border: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{name}</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {value}
        </div>
      </div>
    </div>
  )
}

/* ============================================
   Sections
   ============================================ */

function TokensSection() {
  return (
    <Stack gap="2xl">
      <Section title="Colors — Backgrounds">
        <Grid cols={3} gap="md">
          <ColorSwatch name="bg-primary" value="var(--bg-primary)" />
          <ColorSwatch name="bg-secondary" value="var(--bg-secondary)" />
          <ColorSwatch name="bg-card" value="var(--bg-card)" />
          <ColorSwatch name="bg-elevated" value="var(--bg-elevated)" />
          <ColorSwatch name="bg-surface" value="var(--bg-surface)" />
          <ColorSwatch name="bg-surface-hover" value="var(--bg-surface-hover)" />
        </Grid>
      </Section>

      <Section title="Colors — Semantic">
        <Grid cols={4} gap="md">
          <ColorSwatch name="success" value="var(--success)" />
          <ColorSwatch name="warning" value="var(--warning)" />
          <ColorSwatch name="error" value="var(--error)" />
          <ColorSwatch name="info" value="var(--info)" />
          <ColorSwatch name="accent" value="var(--accent)" />
          <ColorSwatch name="neutral" value="var(--neutral)" />
        </Grid>
      </Section>

      <Section title="Colors — Text">
        <Grid cols={3} gap="md">
          <ColorSwatch name="text-primary" value="var(--text-primary)" />
          <ColorSwatch name="text-secondary" value="var(--text-secondary)" />
          <ColorSwatch name="text-muted" value="var(--text-muted)" />
          <ColorSwatch name="text-disabled" value="var(--text-disabled)" />
          <ColorSwatch name="text-inverse" value="var(--text-inverse)" />
        </Grid>
      </Section>

      <Section title="Colors — Borders">
        <Grid cols={3} gap="md">
          <ColorSwatch name="border-subtle" value="var(--border-subtle)" />
          <ColorSwatch name="border-default" value="var(--border-default)" />
          <ColorSwatch name="border-strong" value="var(--border-strong)" />
        </Grid>
      </Section>

      <Section title="Spacing">
        <Stack gap="sm">
          {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] as const).map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <span style={{ width: 40, fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {s}
              </span>
              <div
                style={{
                  height: 12,
                  width: `var(--space-${s})`,
                  background: 'var(--accent)',
                  borderRadius: 'var(--radius-xs)',
                }}
              />
            </div>
          ))}
        </Stack>
      </Section>

      <Section title="Border Radius">
        <div style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
          {(['none', 'xs', 'sm', 'md', 'lg', 'xl', 'full'] as const).map((r) => (
            <div key={r} style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: `var(--radius-${r})`,
                }}
              />
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>
                {r}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <Stack gap="md">
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>text-3xl (32px)</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>text-2xl (24px)</div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>text-xl (20px)</div>
          <div style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>text-lg (16px)</div>
          <div style={{ fontSize: 'var(--text-md)', fontWeight: 500 }}>text-md (14px)</div>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 400 }}>text-base (13px)</div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 400, color: 'var(--text-secondary)' }}>text-sm (12px)</div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>text-xs label (10px)</div>
        </Stack>
      </Section>
    </Stack>
  )
}

function ButtonsSection() {
  return (
    <Stack gap="2xl">
      <CatalogCard title="Button Variants">
        <Stack direction="horizontal" gap="md" wrap>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </Stack>
      </CatalogCard>

      <CatalogCard title="Button Sizes">
        <Stack direction="horizontal" gap="md" align="center" wrap>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Stack>
      </CatalogCard>

      <CatalogCard title="Button States">
        <Stack direction="horizontal" gap="md" wrap>
          <Button>Default</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </Stack>
      </CatalogCard>

      <CatalogCard title="Icon Buttons">
        <Stack direction="horizontal" gap="md" align="center">
          <Button icon size="sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14" /></svg>
          </Button>
          <Button icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14" /></svg>
          </Button>
          <Button icon size="lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14" /></svg>
          </Button>
        </Stack>
      </CatalogCard>

      <CatalogCard title="With Icons">
        <Stack direction="horizontal" gap="md" wrap>
          <Button
            leftIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14" /></svg>}
          >
            Add item
          </Button>
          <Button
            variant="secondary"
            rightIcon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-4-4l4 4-4 4" /></svg>}
          >
            Continue
          </Button>
        </Stack>
      </CatalogCard>
    </Stack>
  )
}

function InputsSection() {
  const [toggle1, setToggle1] = useState(false)
  const [toggle2, setToggle2] = useState(true)

  return (
    <Stack gap="2xl">
      <CatalogCard title="Input">
        <Grid cols={2} gap="lg">
          <Input placeholder="Default input" />
          <Input placeholder="Error state" error />
          <Input placeholder="Disabled" disabled />
          <Input type="password" placeholder="Password" />
        </Grid>
      </CatalogCard>

      <CatalogCard title="Textarea">
        <Grid cols={2} gap="lg">
          <Textarea placeholder="Default textarea" />
          <Textarea placeholder="Autosize textarea — try typing multiple lines" autosize />
        </Grid>
      </CatalogCard>

      <CatalogCard title="Select">
        <Grid cols={2} gap="lg">
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
        </Grid>
      </CatalogCard>

      <CatalogCard title="Toggle">
        <Stack direction="horizontal" gap="xl" align="center">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <Toggle checked={toggle1} onChange={setToggle1} label="Toggle off" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Off</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <Toggle checked={toggle2} onChange={setToggle2} label="Toggle on" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>On</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <Toggle checked={false} onChange={() => {}} disabled label="Disabled" />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Disabled</span>
          </div>
        </Stack>
      </CatalogCard>

      <CatalogCard title="FormField">
        <Grid cols={2} gap="lg">
          <FormField label="Email" htmlFor="email-demo" required>
            <Input id="email-demo" type="email" placeholder="you@example.com" />
          </FormField>
          <FormField label="Password" htmlFor="pw-demo" error="Password must be at least 8 characters">
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
        </Grid>
      </CatalogCard>
    </Stack>
  )
}

function FeedbackSection() {
  return (
    <Stack gap="2xl">
      <CatalogCard title="Spinner">
        <Stack direction="horizontal" gap="xl" align="center">
          <Spinner size={16} />
          <Spinner size={20} />
          <Spinner size={28} />
          <Spinner size={36} />
        </Stack>
      </CatalogCard>

      <CatalogCard title="Progress Ring">
        <Stack direction="horizontal" gap="xl" align="center">
          <ProgressRing value={0} showLabel />
          <ProgressRing value={25} showLabel color="var(--info)" />
          <ProgressRing value={50} showLabel color="var(--warning)" />
          <ProgressRing value={75} showLabel color="var(--accent)" />
          <ProgressRing value={100} showLabel />
        </Stack>
      </CatalogCard>

      <CatalogCard title="Skeleton">
        <div style={{ maxWidth: 400 }}>
          <Skeleton variant="title" />
          <Skeleton variant="text" count={3} />
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <Skeleton variant="card" />
          </div>
        </div>
      </CatalogCard>

      <CatalogCard title="Empty State">
        <EmptyState
          icon={
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m4-5l5-5 5 5m-5-5v12" />
            </svg>
          }
          title="No items yet"
          description="Start by adding your first item."
          action={<Button size="sm">Add item</Button>}
        />
      </CatalogCard>
    </Stack>
  )
}

function DataDisplaySection() {
  const [activeTab, setActiveTab] = useState('tab1')

  return (
    <Stack gap="2xl">
      <CatalogCard title="Badge">
        <Stack direction="horizontal" gap="sm" wrap>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="neutral">Neutral</Badge>
          <Badge color="#a855f7">Custom</Badge>
        </Stack>
      </CatalogCard>

      <CatalogCard title="Stat Card">
        <Grid cols={3} gap="md">
          <StatCard label="Total Items" value="1,234" />
          <StatCard label="Growth" value="+12%" trend="up" />
          <StatCard label="Errors" value="3" trend="down" />
        </Grid>
      </CatalogCard>

      <CatalogCard title="Avatar">
        <Stack direction="horizontal" gap="md" align="center">
          <Avatar name="John Doe" size="sm" />
          <Avatar name="Jane Smith" size="md" />
          <Avatar name="Bob" size="lg" />
          <Avatar name="Alice Wonderland" size="xl" />
          <Avatar size="md" />
        </Stack>
      </CatalogCard>

      <CatalogCard title="Tabs — Pill variant">
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
      </CatalogCard>

      <CatalogCard title="Tabs — Underline variant">
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
      </CatalogCard>

      <CatalogCard title="Divider">
        <Stack gap="md">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Content above</p>
          <Divider />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Content below</p>
        </Stack>
        <Stack direction="horizontal" gap="md" align="center" style={{ height: 40 }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Left</span>
          <Divider direction="vertical" />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Right</span>
        </Stack>
      </CatalogCard>
    </Stack>
  )
}

function LayoutSection() {
  return (
    <Stack gap="2xl">
      <CatalogCard title="Stack — Vertical">
        <Stack gap="sm">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                padding: 'var(--space-md)',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
              }}
            >
              Item {i}
            </div>
          ))}
        </Stack>
      </CatalogCard>

      <CatalogCard title="Stack — Horizontal">
        <Stack direction="horizontal" gap="sm" wrap>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                padding: 'var(--space-sm) var(--space-lg)',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--text-sm)',
              }}
            >
              Item {i}
            </div>
          ))}
        </Stack>
      </CatalogCard>

      <CatalogCard title="Grid — 3 columns">
        <Grid cols={3} gap="md">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              style={{
                padding: 'var(--space-lg)',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                fontSize: 'var(--text-sm)',
              }}
            >
              Cell {i}
            </div>
          ))}
        </Grid>
      </CatalogCard>

      <CatalogCard title="Grid — Auto-fit (resize browser)">
        <Grid minColWidth={150} gap="md">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                padding: 'var(--space-lg)',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                fontSize: 'var(--text-sm)',
              }}
            >
              Auto {i}
            </div>
          ))}
        </Grid>
      </CatalogCard>

      <CatalogCard title="Section component">
        <Section
          title="Section Title"
          description="Optional description text"
          action={<Button size="sm" variant="secondary">Action</Button>}
        >
          <div
            style={{
              padding: 'var(--space-xl)',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
            }}
          >
            Section content goes here
          </div>
        </Section>
      </CatalogCard>
    </Stack>
  )
}

function OverlaysSection() {
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <Stack gap="2xl">
      <CatalogCard title="Modal">
        <Button onClick={() => setModalOpen(true)} variant="secondary">
          Open Modal
        </Button>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} showClose>
          <ModalHeader>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, margin: 0 }}>Modal Title</h3>
          </ModalHeader>
          <ModalBody>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', margin: 0 }}>
              This is a modal dialog with header, body, and footer sections.
              Press ESC or click outside to close.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setModalOpen(false)}>Confirm</Button>
          </ModalFooter>
        </Modal>
      </CatalogCard>

      <CatalogCard title="Confirm Dialog">
        <Stack direction="horizontal" gap="md">
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Delete item
          </Button>
        </Stack>
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={async () => {
            await new Promise((r) => setTimeout(r, 1000))
            setConfirmOpen(false)
          }}
          title="Delete this item?"
          description="This action cannot be undone. The item and all its data will be permanently removed."
          confirmLabel="Delete"
          variant="danger"
        />
      </CatalogCard>

      <CatalogCard title="Toast">
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Wrap your app with {'<ToastProvider>'} and use the useToast() hook.
          Toasts appear in the bottom-right corner and auto-dismiss after 3.5s.
        </p>
      </CatalogCard>
    </Stack>
  )
}
