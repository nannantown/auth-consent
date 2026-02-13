'use client'

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Show error styling */
  error?: boolean
  /** Icon or element on the left side */
  leftIcon?: ReactNode
  /** Icon or element on the right side */
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, leftIcon, rightIcon, className, style, ...props }, ref) => {
    if (!leftIcon && !rightIcon) {
      return (
        <input
          ref={ref}
          className={cn('input', error && 'input-error', className)}
          {...props}
        />
      )
    }

    return (
      <div
        className={cn('input', error && 'input-error', className)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          padding: 0,
          ...style,
        }}
      >
        {leftIcon && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              color: 'var(--text-muted)',
              paddingLeft: '12px',
            }}
          >
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'inherit',
            fontSize: 'inherit',
            padding: leftIcon ? '10px 0' : '10px 0 10px 12px',
            paddingRight: rightIcon ? '0' : '12px',
            width: '100%',
            minWidth: 0,
          }}
          {...props}
        />
        {rightIcon && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              color: 'var(--text-muted)',
              paddingRight: '12px',
            }}
          >
            {rightIcon}
          </span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
