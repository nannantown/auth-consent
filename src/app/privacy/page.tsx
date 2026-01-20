'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export default function PrivacyPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--background)' }}>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--centra-primary) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-1/2 -left-40 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--centra-secondary) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--centra-primary), var(--centra-primary-dark))',
                boxShadow: '0 4px 20px -5px var(--centra-primary)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="white" strokeWidth="2" fill="none"/>
                <circle cx="16" cy="16" r="4" fill="white"/>
              </svg>
            </div>
            <span
              className="text-2xl font-bold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, var(--centra-primary), var(--centra-secondary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Centra
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            {t.privacy.title}
          </h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            {t.privacy.lastUpdated}: 2025-01-15
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <p className="leading-relaxed mb-8" style={{ color: 'var(--foreground-muted)' }}>
            {t.privacy.intro}
          </p>

          {/* Section 1 */}
          <section className="mb-8">
            <h2
              className="text-lg font-bold mb-4 pb-2"
              style={{
                color: 'var(--foreground)',
                borderBottom: '2px solid var(--centra-primary)',
              }}
            >
              {t.privacy.section1.title}
            </h2>
            <p className="mb-3" style={{ color: 'var(--foreground-muted)' }}>{t.privacy.section1.intro}</p>
            <ul className="space-y-2">
              {t.privacy.section1.items.map((item, index) => (
                <li key={index} className="flex gap-2" style={{ color: 'var(--foreground-muted)' }}>
                  <span style={{ color: 'var(--centra-primary)' }}>•</span>
                  <span><strong style={{ color: 'var(--foreground)' }}>{item.label}</strong>: {item.description}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 2 */}
          <section className="mb-8">
            <h2
              className="text-lg font-bold mb-4 pb-2"
              style={{
                color: 'var(--foreground)',
                borderBottom: '2px solid var(--centra-primary)',
              }}
            >
              {t.privacy.section2.title}
            </h2>
            <p className="mb-3" style={{ color: 'var(--foreground-muted)' }}>{t.privacy.section2.intro}</p>
            <ul className="space-y-2">
              {t.privacy.section2.items.map((item, index) => (
                <li key={index} className="flex gap-2" style={{ color: 'var(--foreground-muted)' }}>
                  <span style={{ color: 'var(--centra-primary)' }}>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 3 */}
          <section className="mb-8">
            <h2
              className="text-lg font-bold mb-4 pb-2"
              style={{
                color: 'var(--foreground)',
                borderBottom: '2px solid var(--centra-primary)',
              }}
            >
              {t.privacy.section3.title}
            </h2>
            <p className="mb-3" style={{ color: 'var(--foreground-muted)' }}>{t.privacy.section3.intro}</p>
            <ul className="space-y-2">
              {t.privacy.section3.items.map((item, index) => (
                <li key={index} className="flex gap-2" style={{ color: 'var(--foreground-muted)' }}>
                  <span style={{ color: 'var(--centra-primary)' }}>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 4 */}
          <section className="mb-8">
            <h2
              className="text-lg font-bold mb-4 pb-2"
              style={{
                color: 'var(--foreground)',
                borderBottom: '2px solid var(--centra-primary)',
              }}
            >
              {t.privacy.section4.title}
            </h2>
            <p style={{ color: 'var(--foreground-muted)' }}>{t.privacy.section4.content}</p>
          </section>

          {/* Section 5 */}
          <section className="mb-8">
            <h2
              className="text-lg font-bold mb-4 pb-2"
              style={{
                color: 'var(--foreground)',
                borderBottom: '2px solid var(--centra-primary)',
              }}
            >
              {t.privacy.section5.title}
            </h2>
            <p className="mb-3" style={{ color: 'var(--foreground-muted)' }}>{t.privacy.section5.intro}</p>
            <ul className="space-y-2">
              {t.privacy.section5.items.map((item, index) => (
                <li key={index} className="flex gap-2" style={{ color: 'var(--foreground-muted)' }}>
                  <span style={{ color: 'var(--centra-primary)' }}>•</span>
                  <span><strong style={{ color: 'var(--foreground)' }}>{item.label}</strong>: {item.description}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 6 */}
          <section className="mb-8">
            <h2
              className="text-lg font-bold mb-4 pb-2"
              style={{
                color: 'var(--foreground)',
                borderBottom: '2px solid var(--centra-primary)',
              }}
            >
              {t.privacy.section6.title}
            </h2>
            <p style={{ color: 'var(--foreground-muted)' }}>{t.privacy.section6.content}</p>
          </section>

          {/* Section 7 */}
          <section className="mb-8">
            <h2
              className="text-lg font-bold mb-4 pb-2"
              style={{
                color: 'var(--foreground)',
                borderBottom: '2px solid var(--centra-primary)',
              }}
            >
              {t.privacy.section7.title}
            </h2>
            <p style={{ color: 'var(--foreground-muted)' }}>{t.privacy.section7.content}</p>
          </section>

          {/* Section 8 */}
          <section className="mb-8">
            <h2
              className="text-lg font-bold mb-4 pb-2"
              style={{
                color: 'var(--foreground)',
                borderBottom: '2px solid var(--centra-primary)',
              }}
            >
              {t.privacy.section8.title}
            </h2>
            <p style={{ color: 'var(--foreground-muted)' }}>{t.privacy.section8.content}</p>
          </section>

          {/* Contact */}
          <div
            className="rounded-xl p-5 mb-8"
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            }}
          >
            <h3 className="font-bold mb-3" style={{ color: 'var(--foreground)' }}>{t.privacy.contact.title}</h3>
            <p className="mb-2" style={{ color: 'var(--foreground-muted)' }}>{t.privacy.contact.description}</p>
            <p style={{ color: 'var(--foreground-muted)' }}>
              {t.privacy.contact.email}:{' '}
              <a href="mailto:support@centra-auth.com" style={{ color: 'var(--centra-primary)' }} className="hover:underline">
                support@centra-auth.com
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm mb-3" style={{ color: 'var(--foreground-muted)' }}>
            &copy; 2025 Centra. All rights reserved.
          </p>
          <Link
            href="/signup"
            className="text-sm hover:underline"
            style={{ color: 'var(--centra-primary)' }}
          >
            {t.privacy.backToSignup}
          </Link>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div
        className="fixed bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--centra-primary), var(--centra-secondary), var(--centra-accent), transparent)',
        }}
      />
    </div>
  )
}
