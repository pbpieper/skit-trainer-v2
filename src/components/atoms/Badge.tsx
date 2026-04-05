import clsx from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'pink' | 'gray' | 'yellow'
}

export function Badge({ children, variant = 'gray' }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold',
      variant === 'green' && 'bg-[var(--color-green-faded)] text-[var(--color-green-dark)]',
      variant === 'pink' && 'bg-[var(--color-pink-faded)] text-[var(--color-pink-dark)]',
      variant === 'gray' && 'bg-[var(--color-gray-100)] text-[var(--color-gray-500)]',
      variant === 'yellow' && 'bg-amber-100 text-amber-800',
    )}>
      {children}
    </span>
  )
}
