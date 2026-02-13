'use client'

import { useState } from 'react'
import { Modal } from './Modal'
import { useI18n } from '@/lib/i18n'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
}: ConfirmDialogProps) {
  const { language } = useI18n()
  const [loading, setLoading] = useState(false)

  const defaultConfirm = variant === 'danger'
    ? (language === 'en' ? 'Delete' : '削除')
    : (language === 'en' ? 'Confirm' : '確認')
  const defaultCancel = language === 'en' ? 'Cancel' : 'キャンセル'

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="p-6 text-center">
        {variant === 'danger' && (
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--error-bg-strong)' }}
          >
            <svg className="w-6 h-6" style={{ color: 'var(--error)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        )}

        {title && (
          <h3
            className="text-base font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </h3>
        )}

        <p className="text-sm mb-6" style={{ color: 'var(--text-primary)' }}>
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn btn-secondary flex-1 text-sm py-2.5"
          >
            {cancelLabel || defaultCancel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 text-sm py-2.5 btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
          >
            {loading ? (
              <div
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
              />
            ) : (
              confirmLabel || defaultConfirm
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
