'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarCategory {
  slug: string
  name: string
  nameEn?: string
  name_en?: string
  color?: string
}

interface SidebarProps {
  categories: SidebarCategory[]
  language: string
  avatarUrl: string | null
  displayName: string | null
  email: string
  onAddSpace: () => void
}

function SidebarItem({
  href,
  icon,
  label,
  isActive,
}: {
  href: string
  icon: React.ReactNode
  label: string
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
    >
      <span className="sidebar-item-icon [&>svg]:w-full [&>svg]:h-full">
        {icon}
      </span>
      {label}
    </Link>
  )
}

export function Sidebar({ categories, language, avatarUrl, displayName, email, onAddSpace }: SidebarProps) {
  const pathname = usePathname()
  const name = displayName || email.split('@')[0]
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const isActive = (path: string) => pathname === path

  return (
    <aside className="sidebar hidden md:flex">
      {/* Logo */}
      <Link href="/dashboard" className="sidebar-logo">
        <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
          <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="var(--text-primary)" strokeWidth="1.5" fill="none"/>
          <circle cx="16" cy="16" r="3" fill="var(--text-primary)"/>
        </svg>
        <span className="sidebar-logo-text">Centra</span>
      </Link>

      {/* Core Navigation */}
      <nav className="sidebar-nav">
        <SidebarItem
          href="/dashboard"
          isActive={isActive('/dashboard')}
          label={language === 'en' ? 'Home' : 'ホーム'}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          }
        />
        <SidebarItem
          href="/dashboard/search"
          isActive={isActive('/dashboard/search')}
          label={language === 'en' ? 'Search' : '検索'}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          }
        />
        <SidebarItem
          href="/dashboard/graph"
          isActive={isActive('/dashboard/graph')}
          label={language === 'en' ? 'Graph' : 'グラフ'}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="3" />
              <circle cx="18" cy="18" r="3" />
              <circle cx="18" cy="6" r="3" />
              <line x1="8.5" y1="7.5" x2="15.5" y2="16.5" />
              <line x1="15.5" y1="7.5" x2="8.5" y2="16.5" />
            </svg>
          }
        />
      </nav>

      {/* Spaces Section */}
      <div className="sidebar-section">
        {language === 'en' ? 'Spaces' : 'スペース'}
      </div>
      <div className="sidebar-spaces">
        {categories.map((cat) => {
          const color = cat.color || '#6366f1'
          const catName = language === 'en'
            ? (cat.nameEn || cat.name_en || cat.name)
            : cat.name
          const catPath = `/dashboard/${cat.slug}`
          const active = isActive(catPath)

          return (
            <Link
              key={cat.slug}
              href={catPath}
              className={`sidebar-item ${active ? 'sidebar-item-active' : ''}`}
            >
              <span
                className="sidebar-dot"
                style={{ background: color }}
              />
              {catName}
            </Link>
          )
        })}

        {/* Add Space Button */}
        <button
          onClick={onAddSpace}
          className="sidebar-item"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg className="sidebar-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>{language === 'en' ? 'Add space' : 'スペースを追加'}</span>
        </button>
      </div>

      {/* Utilities */}
      <div className="sidebar-utils">
        <SidebarItem
          href="/dashboard/sharing"
          isActive={isActive('/dashboard/sharing')}
          label={language === 'en' ? 'Sharing' : '共有設定'}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          }
        />
        <SidebarItem
          href="/dashboard/settings"
          isActive={isActive('/dashboard/settings')}
          label={language === 'en' ? 'Settings' : '設定'}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
      </div>

      {/* User Card */}
      <div className="px-3 pb-4">
        <Link
          href="/dashboard/profile"
          className={`sidebar-user ${isActive('/dashboard/profile') ? 'sidebar-user-active' : ''}`}
        >
          <div className="sidebar-user-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} />
            ) : (
              <span className="sidebar-user-avatar-text">
                {initials}
              </span>
            )}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{name}</p>
            <p className="sidebar-user-email">{email}</p>
          </div>
        </Link>
      </div>
    </aside>
  )
}
