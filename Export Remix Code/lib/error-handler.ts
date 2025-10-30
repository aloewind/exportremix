/**
 * Centralized error handling utility for ExportRemix
 * Provides consistent error logging and user-friendly messages
 */

export interface AppError {
  message: string
  code?: string
  details?: any
  userMessage: string
}

/**
 * Handles errors consistently across the app
 */
export function handleError(error: unknown, context: string): AppError {
  console.error(`[v0] Error in ${context}:`, error)

  // Database errors
  if (error && typeof error === "object" && "code" in error) {
    const dbError = error as { code: string; message: string; details?: string }

    // RLS policy violations
    if (dbError.code === "42501" || dbError.message?.includes("row-level security")) {
      return {
        message: dbError.message,
        code: dbError.code,
        details: dbError.details,
        userMessage:
          "Database security error. Please make sure the database is properly initialized. See DATABASE_SETUP.md for instructions.",
      }
    }

    // Table doesn't exist
    if (dbError.code === "42P01" || dbError.message?.includes("does not exist")) {
      return {
        message: dbError.message,
        code: dbError.code,
        details: dbError.details,
        userMessage:
          "Database table missing. Please run the initialization script. See DATABASE_SETUP.md for instructions.",
      }
    }

    // Duplicate key
    if (dbError.code === "23505") {
      return {
        message: dbError.message,
        code: dbError.code,
        details: dbError.details,
        userMessage: "This record already exists.",
      }
    }

    // Foreign key violation
    if (dbError.code === "23503") {
      return {
        message: dbError.message,
        code: dbError.code,
        details: dbError.details,
        userMessage: "Related record not found.",
      }
    }
  }

  // Standard Error objects
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error.stack,
      userMessage: error.message,
    }
  }

  // Unknown errors
  return {
    message: String(error),
    userMessage: "An unexpected error occurred. Please try again.",
  }
}

/**
 * Checks if an error is a database initialization error
 */
export function isDatabaseInitError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false

  const errorObj = error as { code?: string; message?: string }

  return (
    Boolean(
      errorObj.code === "42501" || // RLS violation
        errorObj.code === "42P01" || // Table doesn't exist
        errorObj.message?.includes("row-level security") ||
        errorObj.message?.includes("does not exist"),
    ) ?? false
  )
}

/**
 * Gets a user-friendly error message
 */
export function getUserErrorMessage(error: unknown): string {
  return handleError(error, "getUserErrorMessage").userMessage
}
