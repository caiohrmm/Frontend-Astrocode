/**
 * API Service - HTTP client using native fetch
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export interface ApiError {
  detail: string
}

export class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    // Try to load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token')
  }

  setToken(token: string | null): void {
    this.token = token
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  getToken(): string | null {
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    // Check if body is FormData - if so, don't set Content-Type (browser will set it with boundary)
    const isFormData = options.body instanceof FormData
    
    const headers: HeadersInit = {
      ...(options.headers as HeadersInit),
    }
    
    // Only set Content-Type for non-FormData requests
    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }

    // Add authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)

      // Handle non-JSON responses (like redirects)
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        if (response.ok) {
          return response as unknown as T
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!response.ok) {
        const error: ApiError = data
        // Create a more detailed error message
        // FastAPI 422 errors may have a different structure
        let errorMessage = error.detail || `HTTP error! status: ${response.status}`
        
        // Handle FastAPI validation errors (422)
        if (response.status === 422 && Array.isArray(data.detail)) {
          const validationErrors = data.detail.map((err: any) => {
            return `${err.loc?.join('.')}: ${err.msg}`
          }).join(', ')
          errorMessage = `Erro de validação: ${validationErrors}`
        }
        
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          detail: error.detail,
          data: data
        })
        throw new Error(errorMessage)
      }

      return data as T
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unexpected error occurred')
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    // Check if data is FormData - if so, don't stringify and don't set Content-Type
    const isFormData = data instanceof FormData
    
    // Prepare headers - explicitly exclude Content-Type for FormData
    const headers: HeadersInit = { ...(options?.headers as HeadersInit) }
    
    // Only set Content-Type for JSON, not for FormData
    // For FormData, browser will set Content-Type automatically with boundary
    if (isFormData) {
      // Remove Content-Type if it exists (browser will set it)
      if ('Content-Type' in headers) {
        delete (headers as any)['Content-Type']
      }
      if ('content-type' in headers) {
        delete (headers as any)['content-type']
      }
    } else if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }
    
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      headers,
      body: isFormData ? data as BodyInit : (data ? JSON.stringify(data) : undefined),
    })
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()


