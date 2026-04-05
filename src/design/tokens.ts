export const colors = {
  white: '#FFFFFF',
  bg: '#FAFBFC',

  greenDark: '#064E3B',
  greenMain: '#059669',
  greenMid: '#10B981',
  greenLight: '#34D399',
  greenBright: '#6EE7B7',
  greenFaded: '#D1FAE5',
  greenPale: '#ECFDF5',

  pink: '#EC4899',
  pinkLight: '#FDF2F8',
  pinkMid: '#F472B6',
  pinkDark: '#BE185D',
  pinkFaded: '#FCE7F3',

  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray900: '#111827',

  correct: '#059669',
  incorrect: '#EF4444',
} as const

export type ColorToken = keyof typeof colors

export const radii = {
  sm: '6px',
  md: '8px',
  lg: '10px',
  xl: '12px',
  '2xl': '14px',
  full: '9999px',
} as const

export const fontSize = {
  xs: '9px',
  sm: '11px',
  base: '12px',
  md: '13px',
  lg: '16px',
  xl: '20px',
  '2xl': '22px',
} as const

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 2px 8px rgba(0,0,0,0.1)',
  glow: (color: string) => `0 0 12px ${color}60`,
  glowSm: (color: string) => `0 2px 8px ${color}40`,
} as const
