'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { exportUserDataAsJsonLD } from '@/lib/data-export-jsonld'

interface ExportJsonLdButtonProps {
  userId: string
}

export function ExportJsonLdButton({ userId }: ExportJsonLdButtonProps) {
  const { t } = useI18n()
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const data = await exportUserDataAsJsonLD(userId)
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/ld+json' })
      const url = URL.createObjectURL(blob)
      const date = new Date().toISOString().split('T')[0]

      const a = document.createElement('a')
      a.href = url
      a.download = `centra-export-${date}.jsonld`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('JSON-LD export failed:', error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors disabled:opacity-40"
      style={{ color: 'var(--text-secondary)' }}
    >
      {exporting ? (
        <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      )}
      {exporting ? t.data.exporting : t.data.exportJsonLd}
    </button>
  )
}
