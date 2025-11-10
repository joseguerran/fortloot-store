/**
 * Sistema de logging condicional
 * Solo muestra logs en modo desarrollo para mantener la consola limpia en producción
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  /**
   * Log informativo - solo en desarrollo
   */
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  /**
   * Log de advertencia - solo en desarrollo
   */
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },

  /**
   * Log de error - siempre se muestra (incluso en producción)
   */
  error: (...args: unknown[]) => {
    console.error(...args)
  },

  /**
   * Log de información - solo en desarrollo
   */
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },

  /**
   * Log de debug - solo en desarrollo
   */
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug(...args)
    }
  },

  /**
   * Tabla - solo en desarrollo
   */
  table: (data: unknown) => {
    if (isDevelopment) {
      console.table(data)
    }
  }
}
