'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { formatMessage } from '@/lib/i18n/context'
import { ConsentButtons } from './consent-buttons'
import { addRecentAccount } from '@/lib/account-history'

interface ConsentContentProps {
  authorizationId: string
  userEmail?: string
  userName?: string
  sharedSpacesCount?: number
  sharedItemsCount?: number
}

export function ConsentContent({ authorizationId, userEmail, userName, sharedSpacesCount = 0, sharedItemsCount = 0 }: ConsentContentProps) {
  const { t } = useI18n()

  useEffect(() => {
    if (userEmail) {
      addRecentAccount(userEmail, userName)
    }
  }, [userEmail, userName])

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div
        className="max-w-md w-full opacity-0 animate-scale-in p-6"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-4">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" className="mx-auto">
              <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="var(--text-secondary)" strokeWidth="1.5" fill="none"/>
              <circle cx="16" cy="16" r="3" fill="var(--text-secondary)"/>
            </svg>
          </Link>
          <h1 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{t.consent.title}</h1>
        </div>

        {/* Client Info */}
        <div className="mb-5">
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            {t.consent.requestAccess}
          </p>
        </div>

        {/* Current Logged-in User */}
        {userEmail && (
          <div className="mb-4">
            <div
              className="p-3"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium flex-shrink-0"
                  style={{ background: 'var(--active-bg)', color: 'var(--text-secondary)' }}
                >
                  {(userName || userEmail).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  {userName && (
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{userName}</p>
                  )}
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{userEmail}</p>
                </div>
                <svg className="w-4 h-4" style={{ color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Section */}
        <div
          className="mb-5 p-3"
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <p className="label mb-2">
            {t.consent.permissions}
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {t.consent.emailAccess}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {t.consent.usernameAccess}
              </span>
            </li>
          </ul>
        </div>

        {/* Data Sharing Preview */}
        {(sharedSpacesCount > 0 || sharedItemsCount > 0) && (
          <div
            className="mb-5 p-3"
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <p className="label mb-2">
              {t.consent.dataPreview}
            </p>
            <div className="space-y-1.5">
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {formatMessage(t.consent.spacesShared, { count: String(sharedSpacesCount) })}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {formatMessage(t.consent.itemsAccessible, { count: String(sharedItemsCount) })}
              </p>
            </div>
            <Link
              href="/dashboard/sharing"
              target="_blank"
              className="inline-block mt-2 text-[10px] transition-colors"
              style={{ color: 'var(--info)' }}
            >
              {t.consent.manageSharingSettings}
            </Link>
          </div>
        )}

        {/* Client-side consent buttons */}
        <ConsentButtons authorizationId={authorizationId} />

        {/* Footer */}
        <p className="text-[10px] text-center mt-4" style={{ color: 'var(--text-muted)' }}>
          {t.consent.footer}
        </p>
      </div>
    </div>
  )
}

export function ConsentError({ message }: { message?: string }) {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
      <div
        className="max-w-md w-full opacity-0 animate-scale-in p-6"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div className="text-center">
          <svg className="w-6 h-6 mx-auto mb-3" style={{ color: 'var(--error)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{t.consent.error}</h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{message || t.consent.noAuthorizationId}</p>
        </div>
      </div>
    </div>
  )
}
