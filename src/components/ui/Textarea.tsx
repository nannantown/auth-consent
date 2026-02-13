'use client'

import {
  forwardRef,
  useCallback,
  useRef,
  useEffect,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/lib/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Show error styling */
  error?: boolean
  /** Auto-resize to fit content */
  autosize?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, autosize, className, onChange, ...props }, ref) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null)

    const resize = useCallback(() => {
      const el = innerRef.current
      if (!el || !autosize) return
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }, [autosize])

    useEffect(() => {
      resize()
    }, [resize, props.value])

    return (
      <textarea
        ref={(node) => {
          innerRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        className={cn('textarea', error && 'input-error', className)}
        style={autosize ? { overflow: 'hidden', resize: 'none' } : undefined}
        onChange={(e) => {
          onChange?.(e)
          resize()
        }}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'
