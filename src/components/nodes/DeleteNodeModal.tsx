'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n'

interface DeleteNodeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  nodeTitle: string
}

export function DeleteNodeModal({ isOpen, onClose, onConfirm, nodeTitle }: DeleteNodeModalProps) {
  const { t } = useI18n()
  const [deleting, setDeleting] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Failed to delete node:', error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/70"
        onClick={() => !deleting && onClose()}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-sm animate-scale-in"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div className="p-6">
            <h3
              className="text-sm font-medium text-center mb-2"
              style={{ color: 'var(--error)' }}
            >
              {t.nodes.deleteConfirm}
            </h3>
            <p
              className="text-xs text-center mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {nodeTitle}
            </p>
            <p
              className="text-xs text-center mb-5"
              style={{ color: 'var(--text-muted)' }}
            >
              {t.nodes.deleteConfirmMessage}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => !deleting && onClose()}
                disabled={deleting}
                className="btn btn-secondary flex-1 text-sm"
              >
                {t.nodes.cancel}
              </button>
              <button
                onClick={handleConfirm}
                disabled={deleting}
                className="btn btn-danger flex-1 text-sm disabled:opacity-40"
              >
                {deleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t.nodes.deleting}
                  </span>
                ) : (
                  t.nodes.delete
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
