import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// date formatter
export function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Safe data access utilities
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  try {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue
  } catch {
    return defaultValue
  }
}

export function safeString(value: any): string {
  if (typeof value === 'string') return value
  if (value == null) return ''
  return String(value)
}

export function safeNumber(value: any): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}
