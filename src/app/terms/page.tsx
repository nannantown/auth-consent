'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

export default function TermsPage() {
  const { t, language } = useI18n()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-10 px-4">
      <div className="bg-white/95 rounded-2xl shadow-2xl p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {t.terms.title}
        </h1>
        <p className="text-rose-500 text-center mb-2">{t.terms.serviceName}</p>
        <p className="text-sm text-gray-500 text-center mb-8">
          {t.terms.lastUpdated}: 2024-12-18
        </p>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {t.terms.intro}
        </p>

        {/* Section 1 */}
        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-rose-500">
          {t.terms.section1.title}
        </h2>
        <p className="text-gray-600 mb-4 leading-relaxed">
          {t.terms.section1.content}
        </p>

        {/* Section 2 */}
        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-rose-500">
          {t.terms.section2.title}
        </h2>
        <ol className="list-decimal list-inside text-gray-600 mb-4 space-y-2">
          {t.terms.section2.items.map((item, index) => (
            <li key={index} className="leading-relaxed">{item}</li>
          ))}
        </ol>

        {/* Section 3 */}
        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-rose-500">
          {t.terms.section3.title}
        </h2>
        <ol className="list-decimal list-inside text-gray-600 mb-4 space-y-2">
          {t.terms.section3.items.map((item, index) => (
            <li key={index} className="leading-relaxed">{item}</li>
          ))}
        </ol>

        {/* Section 4 */}
        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-rose-500">
          {t.terms.section4.title}
        </h2>
        <p className="text-gray-600 mb-2 leading-relaxed">{t.terms.section4.intro}</p>
        <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
          {t.terms.section4.items.map((item, index) => (
            <li key={index} className="leading-relaxed">{item}</li>
          ))}
        </ul>

        {/* Section 5 */}
        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-rose-500">
          {t.terms.section5.title}
        </h2>
        <ol className="list-decimal list-inside text-gray-600 mb-4 space-y-2">
          {t.terms.section5.items.map((item, index) => (
            <li key={index} className="leading-relaxed">{item}</li>
          ))}
        </ol>

        {/* Section 6 */}
        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-rose-500">
          {t.terms.section6.title}
        </h2>
        <ol className="list-decimal list-inside text-gray-600 mb-4 space-y-2">
          {t.terms.section6.items.map((item, index) => (
            <li key={index} className="leading-relaxed">{item}</li>
          ))}
        </ol>

        {/* Section 7 */}
        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-rose-500">
          {t.terms.section7.title}
        </h2>
        <p className="text-gray-600 mb-4 leading-relaxed">
          {t.terms.section7.content}
        </p>

        {/* Section 8 */}
        <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4 pb-2 border-b-2 border-rose-500">
          {t.terms.section8.title}
        </h2>
        <p className="text-gray-600 mb-4 leading-relaxed">
          {t.terms.section8.content}
        </p>

        {/* Contact */}
        <div className="bg-gray-100 rounded-lg p-5 mt-8">
          <h3 className="font-bold text-gray-900 mb-3">{t.terms.contact.title}</h3>
          <p className="text-gray-600 mb-2">{t.terms.contact.description}</p>
          <p className="text-gray-600">
            {t.terms.contact.email}:{' '}
            <a href="mailto:info@mindbrew.jp" className="text-rose-500 hover:underline">
              info@mindbrew.jp
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 pt-5 border-t border-gray-200">
          <p className="text-sm text-gray-500">&copy; 2024 MindBrew Auth. All rights reserved.</p>
          <Link href="/signup" className="text-sm text-rose-500 hover:underline mt-2 inline-block">
            {t.terms.backToSignup}
          </Link>
        </div>
      </div>
    </div>
  )
}
