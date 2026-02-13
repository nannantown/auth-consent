'use client'

import { cn } from '@/lib/cn'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  /** Accessible label */
  label?: string
  className?: string
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
  className,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-disabled={disabled}
      disabled={disabled}
      className={cn(
        'toggle-switch',
        checked && 'active',
        className
      )}
      onClick={() => {
        if (!disabled) onChange(!checked)
      }}
    />
  )
}
