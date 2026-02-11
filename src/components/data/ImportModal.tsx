'use client'

import { useState, useRef } from 'react'
import { useI18n } from '@/lib/i18n'
import { importUserData } from '@/lib/data-import'
import type { CentraExportData } from '@/lib/data-export'

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onImported: () => void
}

type ImportState = 'idle' | 'preview' | 'importing' | 'success' | 'error'

export function ImportModal({ isOpen, onClose, userId, onImported }: ImportModalProps) {
  const { t } = useI18n()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<ImportState>('idle')
  const [data, setData] = useState<CentraExportData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ categories: number; nodes: number; edges: number } | null>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (!parsed.version || !Array.isArray(parsed.categories) || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
          setError(t.data.invalidFile)
          setState('error')
          return
        }
        setData(parsed)
        setState('preview')
        setError(null)
      } catch {
        setError(t.data.invalidFile)
        setState('error')
      }
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!data) return
    setState('importing')
    try {
      const importResult = await importUserData(userId, data)
      setResult(importResult)
      setState('success')
      onImported()
    } catch (err) {
      setError(err instanceof Error ? err.message : t.data.invalidFile)
      setState('error')
    }
  }

  const handleClose = () => {
    setState('idle')
    setData(null)
    setError(null)
    setResult(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={state !== 'importing' ? handleClose : undefined}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md animate-scale-in"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div className="p-6">
          <h3
            className="text-sm font-medium text-center mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            {t.data.import}
          </h3>

          {/* Idle: file select */}
          {(state === 'idle' || state === 'error') && (
            <div className="space-y-4">
              <div
                className="flex flex-col items-center justify-center py-8 rounded-md cursor-pointer transition-colors"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px dashed var(--border-default)',
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <svg
                  className="w-8 h-8 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {t.data.selectFile}
                </p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  .json
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              {error && (
                <div
                  className="p-3 text-xs text-center rounded"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: 'var(--error)',
                  }}
                >
                  {error}
                </div>
              )}

              <button
                onClick={handleClose}
                className="btn btn-secondary w-full text-xs"
              >
                {t.data.cancel}
              </button>
            </div>
          )}

          {/* Preview */}
          {state === 'preview' && data && (
            <div className="space-y-4">
              <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                {t.data.importPreview}
              </p>

              <div className="space-y-2">
                <div
                  className="flex items-center justify-between px-3 py-2 rounded"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {t.data.categoriesCount.replace('{count}', String(data.categories.length))}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between px-3 py-2 rounded"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {t.data.nodesCount.replace('{count}', String(data.nodes.length))}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between px-3 py-2 rounded"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {t.data.edgesCount.replace('{count}', String(data.edges.length))}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="btn btn-secondary flex-1 text-xs"
                >
                  {t.data.cancel}
                </button>
                <button
                  onClick={handleImport}
                  className="btn btn-primary flex-1 text-xs"
                >
                  {t.data.confirm}
                </button>
              </div>
            </div>
          )}

          {/* Importing */}
          {state === 'importing' && (
            <div className="flex flex-col items-center py-8">
              <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mb-3"
                style={{ borderColor: 'var(--text-muted)', borderTopColor: 'transparent' }}
              />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {t.data.importing}
              </p>
            </div>
          )}

          {/* Success */}
          {state === 'success' && result && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <svg
                  className="w-10 h-10 mx-auto mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: 'var(--success)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                  {t.data.importSuccess}
                </p>
              </div>

              <div className="space-y-2">
                <div
                  className="flex items-center justify-between px-3 py-2 rounded"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {t.data.categoriesCount.replace('{count}', String(result.categories))}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between px-3 py-2 rounded"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {t.data.nodesCount.replace('{count}', String(result.nodes))}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between px-3 py-2 rounded"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {t.data.edgesCount.replace('{count}', String(result.edges))}
                  </span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="btn btn-primary w-full text-xs"
              >
                {t.data.confirm}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
