import type { ValidationError } from '@/types/validation'
import type { CreateMilkEntryInput } from '@/types'

export interface MilkEntryValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

/**
 * Validate milk entry input
 * FAT: 0-15, SNF: 0-15, liters: > 0
 */
export function validateMilkEntry(input: Partial<CreateMilkEntryInput>): MilkEntryValidationResult {
  const errors: ValidationError[] = []

  // Validate FAT
  if (input.fat === undefined || input.fat === null) {
    errors.push({ field: 'fat', message: 'FAT is required', code: 'REQUIRED' })
  } else if (typeof input.fat !== 'number' || isNaN(input.fat)) {
    errors.push({ field: 'fat', message: 'FAT must be a number', code: 'INVALID_TYPE' })
  } else if (input.fat < 0 || input.fat > 15) {
    errors.push({ field: 'fat', message: 'FAT must be between 0 and 15', code: 'INVALID_FAT' })
  }

  // Validate SNF
  if (input.snf === undefined || input.snf === null) {
    errors.push({ field: 'snf', message: 'SNF is required', code: 'REQUIRED' })
  } else if (typeof input.snf !== 'number' || isNaN(input.snf)) {
    errors.push({ field: 'snf', message: 'SNF must be a number', code: 'INVALID_TYPE' })
  } else if (input.snf < 0 || input.snf > 15) {
    errors.push({ field: 'snf', message: 'SNF must be between 0 and 15', code: 'INVALID_SNF' })
  }

  // Validate liters
  if (input.liters === undefined || input.liters === null) {
    errors.push({ field: 'liters', message: 'Liters is required', code: 'REQUIRED' })
  } else if (typeof input.liters !== 'number' || isNaN(input.liters)) {
    errors.push({ field: 'liters', message: 'Liters must be a number', code: 'INVALID_TYPE' })
  } else if (input.liters <= 0) {
    errors.push({ field: 'liters', message: 'Liters must be greater than 0', code: 'INVALID_LITERS' })
  }

  // Validate customer_id
  if (!input.customer_id) {
    errors.push({ field: 'customer_id', message: 'Customer is required', code: 'REQUIRED' })
  }

  // Validate date
  if (!input.date) {
    errors.push({ field: 'date', message: 'Date is required', code: 'REQUIRED' })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
