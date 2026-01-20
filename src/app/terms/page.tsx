'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export default function TermsPage() {
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
            {t.terms.title}
          </h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            {t.terms.lastUpdated}: 2025-01-15
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
            {t.terms.intro}
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
              {t.terms.section1.title}
            </h2>
            <p style={{ color: 'var(--foreground-muted)' }}>{t.terms.section1.content}</p>
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
              {t.terms.section2.title}
            </h2>
            <ol className="space-y-2 list-decimal list-inside">
              {t.terms.section2.items.map((item, index) => (
                <li key={index} style={{ color: 'var(--foreground-muted)' }}>{item}</li>
              ))}
            </ol>
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
              {t.terms.section3.title}
            </h2>
            <ol className="space-y-2 list-decimal list-inside">
              {t.terms.section3.items.map((item, index) => (
                <li key={index} style={{ color: 'var(--foreground-muted)' }}>{item}</li>
              ))}
            </ol>
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
              {t.terms.section4.title}
            </h2>
            <p className="mb-3" style={{ color: 'var(--foreground-muted)' }}>{t.terms.section4.intro}</p>
            <ul className="space-y-2">
              {t.terms.section4.items.map((item, index) => (
                <li key={index} className="flex gap-2" style={{ color: 'var(--foreground-muted)' }}>
                  <span style={{ color: 'var(--centra-primary)' }}>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
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
              {t.terms.section5.title}
            </h2>
            <ol className="space-y-2 list-decimal list-inside">
              {t.terms.section5.items.map((item, index) => (
                <li key={index} style={{ color: 'var(--foreground-muted)' }}>{item}</li>
              ))}
            </ol>
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
              {t.terms.section6.title}
            </h2>
            <ol className="space-y-2 list-decimal list-inside">
              {t.terms.section6.items.map((item, index) => (
                <li key={index} style={{ color: 'var(--foreground-muted)' }}>{item}</li>
              ))}
            </ol>
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
              {t.terms.section7.title}
            </h2>
            <p style={{ color: 'var(--foreground-muted)' }}>{t.terms.section7.content}</p>
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
              {t.terms.section8.title}
            </h2>
            <p style={{ color: 'var(--foreground-muted)' }}>{t.terms.section8.content}</p>
          </section>

          {/* Contact */}
          <div
            className="rounded-xl p-5 mb-8"
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            }}
          >
            <h3 className="font-bold mb-3" style={{ color: 'var(--foreground)' }}>{t.terms.contact.title}</h3>
            <p className="mb-2" style={{ color: 'var(--foreground-muted)' }}>{t.terms.contact.description}</p>
            <p style={{ color: 'var(--foreground-muted)' }}>
              {t.terms.contact.email}:{' '}
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
            {t.terms.backToSignup}
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
