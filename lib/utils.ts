import { format, parseISO } from 'date-fns'

// Format currency in PKR
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Format date
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'dd MMM yyyy')
}

// Format date for input
export const formatDateForInput = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'yyyy-MM-dd')
}

// Calculate discount amount
export const calculateDiscount = (
  amount: number,
  discountPercent: number
): number => {
  return (amount * discountPercent) / 100
}

// Calculate net amount after discount
export const calculateNetAmount = (
  amount: number,
  discountPercent: number
): number => {
  const discount = calculateDiscount(amount, discountPercent)
  return amount - discount
}

// Generate bill number
export const generateBillNumber = (): string => {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, '0')
  return `WT${year}${month}${day}${random}`
}

// Format unit display
export const formatUnit = (
  unitType: string,
  unitValue?: number | null
): string => {
  if (!unitValue) return unitType
  return `${unitValue}${unitType}`
}

// Calculate profit percentage
export const calculateProfitPercent = (
  sellingPrice: number,
  costPrice: number
): number => {
  if (costPrice === 0) return 0
  return ((sellingPrice - costPrice) / costPrice) * 100
}

// Truncate text
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

// Class names utility
export const cn = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ')
}

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Format phone number
export const formatPhone = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')
  
  // Format as: 0300-1234567
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`
  }
  
  return phone
}

// Validate phone number
export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 11 && cleaned.startsWith('0')
}

// Calculate total from items
export const calculateTotal = (
  items: Array<{ quantity: number; price: number; discount?: number }>
): number => {
  return items.reduce((total, item) => {
    const itemTotal = item.quantity * item.price
    const discount = item.discount || 0
    const itemNet = itemTotal - (itemTotal * discount) / 100
    return total + itemNet
  }, 0)
}

// Status badge colors
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    delivered: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// Payment type badge colors
export const getPaymentTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    cash: 'bg-green-100 text-green-800',
    credit: 'bg-orange-100 text-orange-800',
    advance: 'bg-blue-100 text-blue-800',
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

// Low stock check
export const isLowStock = (
  currentStock: number,
  minStockLevel: number
): boolean => {
  return currentStock <= minStockLevel
}

// Format number with commas
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num)
}

// Calculate percentage
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0
  return (value / total) * 100
}

// Round to 2 decimal places
export const round = (num: number): number => {
  return Math.round(num * 100) / 100
}
