'use client'

import { useEffect, useState, useCallback, createContext, useContext, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/* ============================================
   Types
   ============================================ */

type ToastVariant = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextType {
  toast: (message: string, variant?: ToastVariant) => void
}

/* ============================================
   Context
   ============================================ */

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

/* ============================================
   Provider
   ============================================ */

const AUTO_DISMISS_MS = 3500

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setToasts((prev) => [...prev, { id, message, variant }])
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {typeof window !== 'undefined' &&
        toasts.length > 0 &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              bottom: 'var(--space-xl)',
              right: 'var(--space-xl)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-sm)',
              zIndex: 'var(--z-toast)',
              pointerEvents: 'none',
            }}
          >
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  )
}

/* ============================================
   Toast Item
   ============================================ */

const variantStyles: Record<ToastVariant, { bg: string; border: string; color: string }> = {
  success: { bg: 'var(--success-bg)', border: 'var(--success-border)', color: 'var(--success)' },
  error: { bg: 'var(--error-bg)', border: 'var(--error-border)', color: 'var(--error)' },
  warning: { bg: 'var(--warning-bg)', border: 'var(--warning-border)', color: 'var(--warning)' },
  info: { bg: 'var(--info-bg)', border: 'var(--info-border)', color: 'var(--info)' },
}

const icons: Record<ToastVariant, string> = {
  success: 'M20 6L9 17l-5-5',
  error: 'M6 18L18 6M6 6l12 12',
  warning: 'M12 9v4m0 4h.01M12 3l9 16H3L12 3z',
  info: 'M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z',
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false)
  const style = variantStyles[toast.variant]

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), AUTO_DISMISS_MS - 300)
    const removeTimer = setTimeout(() => onDismiss(toast.id), AUTO_DISMISS_MS)
    return () => {
      clearTimeout(timer)
      clearTimeout(removeTimer)
    }
  }, [toast.id, onDismiss])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        padding: '10px 16px',
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 'var(--radius-md)',
        backdropFilter: 'blur(12px)',
        pointerEvents: 'auto',
        animation: exiting ? 'fade-out 0.3s ease forwards' : 'slide-up 0.3s ease forwards',
        fontSize: 'var(--text-base)',
        color: 'var(--text-primary)',
        maxWidth: '360px',
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={style.color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <path d={icons[toast.variant]} />
      </svg>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '2px',
          flexShrink: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
