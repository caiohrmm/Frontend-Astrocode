/**
 * Users Service
 * Handles all user management API calls (manager only)
 */

import { apiClient } from './api'

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

export interface UpdateUserRolesRequest {
  role_names: string[]
}

export interface UpdateUserRequest {
  email?: string
  full_name?: string
  is_active?: boolean
}

class UsersService {
  /**
   * List all users (manager only)
   */
  async listUsers(skip: number = 0, limit: number = 100): Promise<User[]> {
    return apiClient.get<User[]>(`/users?skip=${skip}&limit=${limit}`)
  }

  /**
   * Get user by ID (manager only)
   */
  async getUserById(userId: string): Promise<User> {
    return apiClient.get<User>(`/users/${userId}`)
  }

  /**
   * Update user information (manager only)
   */
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<User> {
    return apiClient.put<User>(`/users/${userId}`, userData)
  }

  /**
   * Update user roles (manager only)
   */
  async updateUserRoles(userId: string, roleNames: string[]): Promise<User> {
    return apiClient.put<User>(`/users/${userId}/roles`, roleNames)
  }

  /**
   * Get users with corretor role (for agent assignment)
   * This endpoint is accessible to any authenticated user
   */
  async getCorretores(): Promise<User[]> {
    try {
      console.log('Fetching corretores from /users/corretores')
      const data = await apiClient.get<User[]>('/users/corretores')
      console.log('Received corretores:', data)
      return data || []
    } catch (error) {
      console.error('Could not fetch corretores:', error)
      // Re-throw to let the caller handle it
      throw error
    }
  }
}

export const usersService = new UsersService()

