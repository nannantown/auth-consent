'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CATEGORY_ICONS, FALLBACK_ICON } from './category-icons'

interface MobileNavCategory {
  slug: string
  name: string
  nameEn?: string
  name_en?: string
  color?: string
}

interface MobileNavProps {
  categories: MobileNavCategory[]
  avatarUrl: string | null
  displayName: string | null
  email: string
  onAddSpace: () => void
}

export function MobileNav({ categories, avatarUrl, displayName, email, onAddSpace }: MobileNavProps) {
  const pathname = usePathname()
  const name = displayName || email.split('@')[0]
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <nav className="mobile-nav md:hidden">
      <div className="mobile-nav-inner">
        {/* Core Nav: Home, Search, Graph */}
        <Link
          href="/dashboard"
          className={`mobile-nav-item ${pathname === '/dashboard' ? 'mobile-nav-item-active' : ''}`}
        >
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </Link>
        <Link
          href="/dashboard/search"
          className={`mobile-nav-item ${pathname === '/dashboard/search' ? 'mobile-nav-item-active' : ''}`}
        >
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </Link>
        <Link
          href="/dashboard/graph"
          className={`mobile-nav-item ${pathname === '/dashboard/graph' ? 'mobile-nav-item-active' : ''}`}
        >
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="6" r="3" />
            <circle cx="18" cy="18" r="3" />
            <circle cx="18" cy="6" r="3" />
            <line x1="8.5" y1="7.5" x2="15.5" y2="16.5" />
            <line x1="15.5" y1="7.5" x2="8.5" y2="16.5" />
          </svg>
        </Link>

        {/* Divider */}
        <div className="mobile-nav-divider" />

        {/* Space Icons */}
        {categories.map((cat) => {
          const color = cat.color || '#6366f1'
          const icon = CATEGORY_ICONS[cat.slug] || FALLBACK_ICON

          return (
            <Link
              key={cat.slug}
              href={`/dashboard/${cat.slug}`}
              className="mobile-nav-item"
              style={{
                background: `${color}15`,
                color: color,
              }}
            >
              <div style={{ width: 18, height: 18 }} className="[&>svg]:w-full [&>svg]:h-full">
                {icon}
              </div>
            </Link>
          )
        })}

        {/* Add Button */}
        <button
          onClick={onAddSpace}
          className="mobile-nav-item"
          style={{
            border: '1.5px dashed var(--border-default)',
            color: 'var(--text-muted)',
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Profile Avatar */}
        <Link
          href="/dashboard/profile"
          className="mobile-nav-item overflow-hidden"
          style={{ background: 'var(--active-bg)' }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="sidebar-user-avatar-text">
              {initials}
            </span>
          )}
        </Link>
      </div>
    </nav>
  )
}
