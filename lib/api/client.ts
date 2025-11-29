/**
 * API Client Base
 * Client-side HTTP client for calling Next.js API routes
 * All calls now go through /api/* routes (server-side) which handle backend communication
 *
 * Authentication is handled via httpOnly cookies for security (XSS protection)
 * The session token is stored server-side in a cookie, not in localStorage
 */

const API_BASE_URL = '' // Empty string = same origin, calls /api/* routes

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
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // No longer adding Authorization header from localStorage
    // Session token is now sent via httpOnly cookie automatically

    const config: RequestInit = {
      ...options,
      credentials: 'include', // Include cookies in requests for session authentication
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

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async patch<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  /**
   * Upload de archivos con FormData
   * Session token is sent via httpOnly cookie automatically
   */
  async upload<T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    // No longer adding Authorization header from localStorage
    // Session token is now sent via httpOnly cookie automatically

    const config: RequestInit = {
      ...options,
      method: 'POST',
      body: formData,
      credentials: 'include', // Include cookies in requests for session authentication
      headers: {
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
