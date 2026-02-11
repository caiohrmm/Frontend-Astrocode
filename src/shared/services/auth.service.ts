/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClient } from './api'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface User {
  id: string
  email: string
  full_name: string
  is_active: boolean
  roles: Array<{
    id: string
    name: string
    description: string
  }>
  created_at: string
  updated_at: string
}

class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>(
      '/auth/login',
      credentials
    )
    
    // Store token in API client
    apiClient.setToken(response.access_token)
    
    return response
  }

  /**
   * Register a new user (public registration)
   * All users registered via this endpoint are automatically assigned the 'atendente' role
   */
  async register(data: RegisterRequest): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>(
      '/auth/public/register',
      data
    )
    
    // Store token in API client
    apiClient.setToken(response.access_token)
    
    return response
  }

  /**
   * Get current authenticated user information
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me')
  }

  /**
   * Logout (clear token)
   */
  logout(): void {
    apiClient.setToken(null)
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return apiClient.getToken() !== null
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return apiClient.getToken()
  }

  /**
   * Get Google OAuth login URL
   * Note: This redirects to Google, so we return the URL
   */
  getGoogleLoginUrl(): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    return `${baseUrl}/auth/google/login`
  }

  /**
   * Handle Google OAuth callback
   * This is called after Google redirects back with a code
   */
  async handleGoogleCallback(code: string, state?: string): Promise<TokenResponse> {
    const queryParams = new URLSearchParams({ code })
    if (state) {
      queryParams.append('state', state)
    }
    
    const response = await apiClient.get<TokenResponse>(
      `/auth/google/callback?${queryParams.toString()}`
    )
    
    // Store token in API client
    apiClient.setToken(response.access_token)
    
    return response
  }
}

export const authService = new AuthService()

