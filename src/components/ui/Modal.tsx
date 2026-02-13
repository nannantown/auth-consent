'use client'

import { useEffect, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** Max width class. Default: 'max-w-md' */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Show close button in top-right corner */
  showClose?: boolean
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

export function Modal({
  open,
  onClose,
  children,
  size = 'md',
  showClose = false,
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
      }
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return createPortal(
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 backdrop-blur-sm"
        style={{ zIndex: 'var(--z-overlay)', background: 'var(--modal-scrim)' }}
        onClick={onClose}
      />
      {/* Container */}
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 'var(--z-modal)' }}
      >
        <div
          className={`relative w-full ${sizeMap[size]} animate-scale-in`}
          style={{
            background: 'var(--modal-bg)',
            border: '1px solid var(--modal-border)',
            borderRadius: 'var(--modal-radius)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {showClose && (
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-7 h-7 rounded-md flex items-center justify-center transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {children}
        </div>
      </div>
    </>,
    document.body
  )
}

/* Modal sub-components for consistent layout */
export function ModalHeader({ children }: { children: ReactNode }) {
  return (
    <div
      className="px-6 py-4"
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
    >
      {children}
    </div>
  )
}

export function ModalBody({ children }: { children: ReactNode }) {
  return <div className="px-6 py-4">{children}</div>
}

export function ModalFooter({ children }: { children: ReactNode }) {
  return (
    <div
      className="px-6 py-4 flex justify-end gap-3"
      style={{ borderTop: '1px solid var(--border-subtle)' }}
    >
      {children}
    </div>
  )
}
