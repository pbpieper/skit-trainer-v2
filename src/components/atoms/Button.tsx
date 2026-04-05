import clsx from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'tab' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  active?: boolean
}

export function Button({ variant = 'primary', size = 'md', active, className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-semibold cursor-pointer transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Size
        size === 'sm' && 'px-2.5 py-1 text-[11px] rounded-md gap-1',
        size === 'md' && 'px-3.5 py-1.5 text-xs rounded-lg gap-1.5',
        size === 'lg' && 'px-5 py-2.5 text-sm rounded-xl gap-2',
        // Variant
        variant === 'primary' && 'bg-[var(--color-green-main)] text-white border-none shadow-sm hover:bg-[var(--color-green-mid)]',
        variant === 'secondary' && 'bg-[var(--color-green-faded)] text-[var(--color-green-dark)] border-2 border-[var(--color-green-main)] hover:bg-[var(--color-green-bright)]',
        variant === 'ghost' && 'bg-transparent text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-alt)]',
        variant === 'danger' && 'bg-[var(--color-incorrect)] text-white border-none hover:opacity-90',
        variant === 'tab' && [
          'border-none shrink-0',
          active
            ? 'bg-[var(--color-green-main)] text-white shadow-md'
            : 'bg-[var(--color-gray-100)] text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-200)]',
        ],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
