export interface ValidationError {
  field: string
  code: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Error codes
export const ERROR_CODES = {
  // Validation errors
  INVALID_FAT: 'INVALID_FAT',
  INVALID_SNF: 'INVALID_SNF',
  INVALID_LITERS: 'INVALID_LITERS',
  MISSING_RATE: 'MISSING_RATE',
  CUSTOMER_NOT_FOUND: 'CUSTOMER_NOT_FOUND',
  INVALID_CUSTOMER_NAME: 'INVALID_CUSTOMER_NAME',
  
  // Auth errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // Database errors
  DUPLICATE_CUSTOMER: 'DUPLICATE_CUSTOMER',
  DUPLICATE_RATE: 'DUPLICATE_RATE',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

// Error messages
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  INVALID_FAT: 'FAT must be between 0.0 and 15.0',
  INVALID_SNF: 'SNF must be between 0.0 and 15.0',
  INVALID_LITERS: 'Liters must be greater than 0',
  MISSING_RATE: 'No rate configured for this FAT/SNF combination',
  CUSTOMER_NOT_FOUND: 'Customer not found',
  INVALID_CUSTOMER_NAME: 'Customer name is required',
  INVALID_CREDENTIALS: 'Invalid email or password',
  SESSION_EXPIRED: 'Session expired, please log in again',
  UNAUTHORIZED: 'You do not have permission to access this resource',
  DUPLICATE_CUSTOMER: 'A customer with this name already exists',
  DUPLICATE_RATE: 'A rate for this FAT/SNF combination already exists',
  CONSTRAINT_VIOLATION: 'Operation failed due to data constraints',
}
