/**
 * Utility functions for input masks and formatting
 */

/**
 * Format currency value to Brazilian Real format
 * @param value - Number or string value
 * @returns Formatted string (e.g., "1.234,56")
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (!value && value !== 0) return ''
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) : value
  if (isNaN(numValue as number)) return ''
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue as number)
}

/**
 * Parse currency string to number
 * @param value - Formatted currency string (e.g., "R$ 1.234,56") or plain number string
 * @returns Number value or null
 */
export function parseCurrency(value: string | null | undefined): number | null {
  if (!value) return null
  // Remove currency symbols, spaces, and dots (thousand separators), replace comma with dot
  const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

/**
 * Format currency for input - allows natural typing
 * Only removes non-digits, keeps the value as-is for natural typing
 * @param value - String being typed
 * @returns String with only digits (for natural typing experience)
 */
export function formatCurrencyInput(value: string): string {
  if (!value) return ''
  // Remove all non-digits - user types naturally, we just clean it
  return value.replace(/\D/g, '')
}

/**
 * Format currency input in real-time (like banking apps)
 * Formats as the user types: "1234567" -> "12.345,67"
 * Treats input as natural number entry, last 2 digits are cents
 * @param value - String being typed (can be formatted or raw)
 * @returns Formatted currency string in real-time (without R$ prefix)
 */
export function formatCurrencyInputRealTime(value: string): string {
  if (!value) return ''
  
  // Remove all non-digits to get raw number
  const digits = value.replace(/\D/g, '')
  
  if (digits === '') return ''
  
  // Convert to number treating last 2 digits as cents
  // Example: "1234567" -> 12345.67 (user typed 1234567, we interpret as 12345,67)
  const numValue = parseInt(digits, 10) / 100
  
  // Format with Brazilian currency format (without currency symbol)
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue)
}

/**
 * Parse real-time formatted currency input back to number
 * Handles the formatted string and converts back to number
 * @param value - Formatted currency string (e.g., "12.345,67")
 * @returns Number value or null
 */
export function parseCurrencyInputRealTime(value: string): number | null {
  if (!value) return null
  
  // Remove all formatting (dots, commas, spaces, R$, etc)
  // Dots are thousand separators, comma is decimal separator
  const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.')
  const parsed = parseFloat(cleaned)
  
  return isNaN(parsed) ? null : parsed
}

/**
 * Check if a string looks like a phone number (contains mostly digits)
 * @param value - String to check
 * @returns True if it looks like a phone number
 */
function isPhoneNumber(value: string): boolean {
  if (!value) return false
  // If it contains @, it's likely an email
  if (value.includes('@')) return false
  // Count digits
  const digits = value.replace(/\D/g, '')
  // If it has 8 or more digits, it's likely a phone
  return digits.length >= 8
}

/**
 * Format phone number to Brazilian format
 * @param value - Phone number string
 * @returns Formatted string (e.g., "(11) 98765-4321" or "(11) 3456-7890")
 */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return ''
  // If it doesn't look like a phone, return as is (might be email)
  if (!isPhoneNumber(value)) return value
  // Remove all non-digits
  const digits = value.replace(/\D/g, '')
  
  if (digits.length <= 10) {
    // Landline: (11) 3456-7890
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  } else {
    // Mobile: (11) 98765-4321
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
}

/**
 * Format phone number while typing (applies mask in real-time)
 * @param value - Phone number string being typed
 * @returns Formatted string with mask applied
 */
export function formatPhoneInput(value: string): string {
  if (!value) return ''
  
  // Remove all non-digits
  const digits = value.replace(/\D/g, '')
  
  // Apply mask based on length
  if (digits.length <= 2) {
    return digits
  } else if (digits.length <= 6) {
    // (11) 3456
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  } else if (digits.length <= 10) {
    // (11) 3456-7890 (landline)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  } else {
    // (11) 98765-4321 (mobile)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }
}

/**
 * Parse phone number to digits only (or return original if it's not a phone)
 * @param value - Formatted phone string
 * @returns Digits only string or original if it's not a phone (e.g., email)
 */
export function parsePhone(value: string | null | undefined): string {
  if (!value) return ''
  // If it doesn't look like a phone, return as is (might be email)
  if (!isPhoneNumber(value)) return value
  return value.replace(/\D/g, '')
}

/**
 * Apply currency mask on input
 * @param event - Input event
 * @returns Formatted value
 */
export function applyCurrencyMask(event: Event): string {
  const target = event.target as HTMLInputElement
  const value = target.value
  const parsed = parseCurrency(value)
  if (parsed === null) return ''
  return formatCurrency(parsed)
}

/**
 * Apply phone mask on input
 * @param event - Input event
 * @returns Formatted value
 */
export function applyPhoneMask(event: Event): string {
  const target = event.target as HTMLInputElement
  const value = target.value
  return formatPhone(value)
}

