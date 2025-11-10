/**
 * API Client Base
 * Configuración centralizada para todas las llamadas a la API del backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public data?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class APIClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useApiSecret: boolean = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Usar API_SECRET para endpoints que requieren autenticación de admin
    // o token de sesión para endpoints de cliente
    if (useApiSecret) {
      const apiSecret = process.env.NEXT_PUBLIC_API_SECRET
      if (apiSecret) {
        console.log('🔐 Using API_SECRET for authentication:', apiSecret.substring(0, 20) + '...')
        defaultHeaders['Authorization'] = `Bearer ${apiSecret}`
      } else {
        console.warn('⚠️ API_SECRET not found in environment variables')
      }
    } else if (typeof window !== 'undefined') {
      const sessionToken = localStorage.getItem('fortloot_session_token')
      if (sessionToken) {
        defaultHeaders['Authorization'] = `Bearer ${sessionToken}`
      }
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)

      // Intentar parsear la respuesta como JSON
      let data: APIResponse<T>
      try {
        data = await response.json()
      } catch (e) {
        throw new APIError(
          response.status,
          response.statusText,
          'Error parsing response'
        )
      }

      if (!response.ok) {
        throw new APIError(
          response.status,
          response.statusText,
          data.error || data.message || 'Request failed',
          data
        )
      }

      return data.data as T
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError(
        500,
        'Internal Error',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }

  async get<T>(endpoint: string, options?: RequestInit, useApiSecret?: boolean): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' }, useApiSecret)
  }

  async post<T>(endpoint: string, body?: any, options?: RequestInit, useApiSecret?: boolean): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }, useApiSecret)
  }

  async put<T>(endpoint: string, body?: any, options?: RequestInit, useApiSecret?: boolean): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }, useApiSecret)
  }

  async patch<T>(endpoint: string, body?: any, options?: RequestInit, useApiSecret?: boolean): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }, useApiSecret)
  }

  async delete<T>(endpoint: string, options?: RequestInit, useApiSecret?: boolean): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' }, useApiSecret)
  }

  /**
   * Upload de archivos con FormData
   */
  async upload<T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const headers: HeadersInit = {}

    // Agregar token de sesión si existe
    if (typeof window !== 'undefined') {
      const sessionToken = localStorage.getItem('fortloot_session_token')
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`
      }
    }

    const config: RequestInit = {
      ...options,
      method: 'POST',
      body: formData,
      headers: {
        ...headers,
        ...options?.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      const data: APIResponse<T> = await response.json()

      if (!response.ok) {
        throw new APIError(
          response.status,
          response.statusText,
          data.error || data.message || 'Upload failed',
          data
        )
      }

      return data.data as T
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError(
        500,
        'Internal Error',
        error instanceof Error ? error.message : 'Unknown error'
      )
    }
  }
}

export const apiClient = new APIClient(API_BASE_URL)
