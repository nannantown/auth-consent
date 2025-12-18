'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export default function PrivacyPage() {
  const { t, language } = useI18n()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
      <div className="bg-white/95 rounded-2xl shadow-2xl p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {t.privacy.title}
        </h1>
        <p className="text-rose-500 text-center mb-2">{t.privacy.serviceName}</p>
        <p className="text-sm text-gray-500 text-center mb-8">
          {t.privacy.lastUpdated}: 2024-12-18
        </p>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {t.privacy.intro}
        </p>

        {/* Section 1 - Data Collection */}
        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-rose-500">
          {t.privacy.section1.title}
        </h2>
        <p className="text-gray-600 mb-2 leading-relaxed">{t.privacy.section1.intro}</p>
        <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
          {t.privacy.section1.items.map((item, index) => (
            <li key={index} className="leading-relaxed">
              <strong>{item.label}</strong>: {item.description}
            </li>
          ))}
        </ul>

        {/* Section 2 - Purpose */}
        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-rose-500">
          {t.privacy.section2.title}
        </h2>
        <p className="text-gray-600 mb-2 leading-relaxed">{t.privacy.section2.intro}</p>
        <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
          {t.privacy.section2.items.map((item, index) => (
            <li key={index} className="leading-relaxed">{item}</li>
          ))}
        </ul>

        {/* Section 3 - Third Party */}
        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-rose-500">
          {t.privacy.section3.title}
        </h2>
        <p className="text-gray-600 mb-2 leading-relaxed">{t.privacy.section3.intro}</p>
        <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
          {t.privacy.section3.items.map((item, index) => (
            <li key={index} className="leading-relaxed">{item}</li>
          ))}
        </ul>

        {/* Section 4 - Data Storage */}
        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-rose-500">
          {t.privacy.section4.title}
        </h2>
        <p className="text-gray-600 mb-4 leading-relaxed">
          {t.privacy.section4.content}
        </p>

        {/* Section 5 - User Rights */}
        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-rose-500">
          {t.privacy.section5.title}
        </h2>
        <p className="text-gray-600 mb-2 leading-relaxed">{t.privacy.section5.intro}</p>
        <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
          {t.privacy.section5.items.map((item, index) => (
            <li key={index} className="leading-relaxed">
              <strong>{item.label}</strong>: {item.description}
            </li>
          ))}
        </ul>

        {/* Section 6 - Cookies */}
        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-rose-500">
          {t.privacy.section6.title}
        </h2>
        <p className="text-gray-600 mb-4 leading-relaxed">
          {t.privacy.section6.content}
        </p>

        {/* Section 7 - Children */}
        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-rose-500">
          {t.privacy.section7.title}
        </h2>
        <p className="text-gray-600 mb-4 leading-relaxed">
          {t.privacy.section7.content}
        </p>

        {/* Section 8 - Changes */}
        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-rose-500">
          {t.privacy.section8.title}
        </h2>
        <p className="text-gray-600 mb-4 leading-relaxed">
          {t.privacy.section8.content}
        </p>

        {/* Contact */}
        <div className="bg-gray-100 rounded-lg p-5 mt-8">
          <h3 className="font-bold text-gray-900 mb-3">{t.privacy.contact.title}</h3>
          <p className="text-gray-600 mb-2">{t.privacy.contact.description}</p>
          <p className="text-gray-600">
            {t.privacy.contact.email}:{' '}
            <a href="mailto:info@mindbrew.jp" className="text-rose-500 hover:underline">
              info@mindbrew.jp
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 pt-5 border-t border-gray-200">
          <p className="text-sm text-gray-500">&copy; 2024 MindBrew Auth. All rights reserved.</p>
          <Link href="/signup" className="text-sm text-rose-500 hover:underline mt-2 inline-block">
            {t.privacy.backToSignup}
          </Link>
        </div>
      </div>
    </div>
  )
}
