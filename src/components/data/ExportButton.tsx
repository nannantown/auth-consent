'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { exportUserData } from '@/lib/data-export'

interface ExportButtonProps {
  userId: string
}

export function ExportButton({ userId }: ExportButtonProps) {
  const { t } = useI18n()
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const data = await exportUserData(userId)
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const date = new Date().toISOString().split('T')[0]

      const a = document.createElement('a')
      a.href = url
      a.download = `centra-export-${date}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )}
      {exporting ? t.data.exporting : t.data.export}
    </button>
  )
}
