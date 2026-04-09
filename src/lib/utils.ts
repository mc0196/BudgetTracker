import { clsx, type ClassValue } from 'clsx'
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns'

// ─── CSS class merging ────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

// ─── ID generation ────────────────────────────────────────────────────────────

/** Generates a URL-safe random ID (no external dependency). */
export function randomId(): string {
  return crypto.randomUUID()
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** 'YYYY-MM-DD' → Date object */
export function parseDate(dateStr: string): Date {
  return parseISO(dateStr)
}

/** Date → 'YYYY-MM-DD' */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'yyyy-MM-dd')
}

/** Date → 'YYYY-MM' */
export function formatMonth(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'yyyy-MM')
}

/** 'YYYY-MM' → human label, e.g. "April 2026" */
export function monthLabel(month: string): string {
  return format(parseISO(`${month}-01`), 'MMMM yyyy')
}

/** Returns current month as 'YYYY-MM' */
export function currentMonth(): string {
  return formatMonth(new Date())
}

/** Returns 'YYYY-MM-DD' range for a given 'YYYY-MM' month string */
export function monthDateRange(month: string): { start: string; end: string } {
  const d = parseISO(`${month}-01`)
  return {
    start: formatDate(startOfMonth(d)),
    end: formatDate(endOfMonth(d)),
  }
}

// ─── Number formatting ────────────────────────────────────────────────────────

const EUR = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
})

/** Format a number as Euro currency, e.g. "€1.234,56" */
export function formatCurrency(amount: number): string {
  return EUR.format(amount)
}

/** Compact format for large numbers: 1234 → "1,2K" */
export function formatCompact(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)
}

// ─── String helpers ───────────────────────────────────────────────────────────

/** Truncate string with ellipsis */
export function truncate(str: string, maxLength: number): string {
  return str.length > maxLength ? `${str.slice(0, maxLength - 1)}…` : str
}

/** Normalize a bank category string: trim, title-case */
export function normalizeCategory(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
}

// ─── Colour helpers ───────────────────────────────────────────────────────────

/** A fixed palette for category charts */
export const CHART_COLORS = [
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#84cc16', // lime
  '#06b6d4', // cyan
  '#a78bfa', // purple
]

export function categoryColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length]
}
