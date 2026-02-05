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
 * @param value - Formatted currency string (e.g., "R$ 1.234,56")
 * @returns Number value or null
 */
export function parseCurrency(value: string | null | undefined): number | null {
  if (!value) return null
  // Remove currency symbols and spaces, replace comma with dot
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

