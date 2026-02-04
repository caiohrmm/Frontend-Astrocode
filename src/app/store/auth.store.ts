/**
 * Authentication Store (Pinia)
 * Manages authentication state and actions
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/shared/services/auth.service'
import { authService, type LoginRequest } from '@/shared/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => {
    return token.value !== null && user.value !== null
  })

  const userRoles = computed(() => {
    return user.value?.roles.map(role => role.name) || []
  })

  const hasRole = computed(() => {
    return (roleName: string) => {
      return userRoles.value.includes(roleName)
    }
  })

  // Actions
  async function login(credentials: LoginRequest): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const tokenResponse = await authService.login(credentials)
      token.value = tokenResponse.access_token

      // Fetch user information
      await fetchCurrentUser()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      token.value = null
      user.value = null
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCurrentUser(): Promise<void> {
    try {
      // Ensure token is set in API client if we have one
      if (token.value) {
        const { apiClient } = await import('@/shared/services/api')
        apiClient.setToken(token.value)
      }
      
      user.value = await authService.getCurrentUser()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch user'
      user.value = null
      token.value = null
      throw err
    }
  }
  
  function setToken(newToken: string): void {
    token.value = newToken
    // Also set in API client
    import('@/shared/services/api').then(({ apiClient }) => {
      apiClient.setToken(newToken)
    })
  }

  async function logout(): Promise<void> {
    authService.logout()
    token.value = null
    user.value = null
    error.value = null
  }

  function clearError(): void {
    error.value = null
  }

  // Initialize: Check if user is already authenticated
  async function initialize(): Promise<void> {
    const storedToken = authService.getToken()
    if (storedToken) {
      token.value = storedToken
      try {
        await fetchCurrentUser()
      } catch {
        // Token might be invalid, clear it
        await logout()
      }
    }
  }

  return {
    // State
    user,
    token,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    userRoles,
    hasRole,
    // Actions
    login,
    logout,
    fetchCurrentUser,
    clearError,
    initialize,
    setToken,
  }
})

