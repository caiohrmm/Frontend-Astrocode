/**
 * Visits API Service
 * Handles all visit-related API operations
 */

import { apiClient } from './api'

// Types
export type VisitStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

export interface Visit {
  id: string
  attendance_id: string | null
  property_id: string | null
  client_id: string
  broker_id: string
  scheduled_at: string
  status: VisitStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface VisitCreate {
  attendance_id?: string | null
  property_id?: string | null
  client_id: string
  broker_id: string
  scheduled_at: string
  status?: VisitStatus
  notes?: string | null
}

export interface VisitUpdate {
  attendance_id?: string | null
  property_id?: string | null
  client_id?: string
  broker_id?: string
  scheduled_at?: string
  status?: VisitStatus
  notes?: string | null
}

export interface VisitFilters {
  skip?: number
  limit?: number
  client_id?: string
  broker_id?: string
  property_id?: string
  attendance_id?: string
  status?: VisitStatus
  scheduled_from?: string
  scheduled_to?: string
}

class VisitsService {
  /**
   * Get all visits with optional filtering
   */
  async getVisits(filters: VisitFilters = {}): Promise<Visit[]> {
    const params = new URLSearchParams()
    
    if (filters.skip !== undefined) params.append('skip', String(filters.skip))
    if (filters.limit !== undefined) params.append('limit', String(filters.limit))
    if (filters.client_id) params.append('client_id', filters.client_id)
    if (filters.broker_id) params.append('broker_id', filters.broker_id)
    if (filters.property_id) params.append('property_id', filters.property_id)
    if (filters.attendance_id) params.append('attendance_id', filters.attendance_id)
    if (filters.status) params.append('status', filters.status)
    if (filters.scheduled_from) params.append('scheduled_from', filters.scheduled_from)
    if (filters.scheduled_to) params.append('scheduled_to', filters.scheduled_to)
    
    const queryString = params.toString()
    const endpoint = queryString ? `/visits/?${queryString}` : '/visits/'
    
    return apiClient.get<Visit[]>(endpoint)
  }

  /**
   * Get a visit by ID
   */
  async getVisitById(id: string): Promise<Visit> {
    return apiClient.get<Visit>(`/visits/${id}`)
  }

  /**
   * Create a new visit
   */
  async createVisit(data: VisitCreate): Promise<Visit> {
    return apiClient.post<Visit>('/visits/', data)
  }

  /**
   * Update an existing visit
   */
  async updateVisit(id: string, data: VisitUpdate): Promise<Visit> {
    return apiClient.put<Visit>(`/visits/${id}`, data)
  }

  /**
   * Delete a visit
   */
  async deleteVisit(id: string): Promise<void> {
    return apiClient.delete(`/visits/${id}`)
  }

  /**
   * Get visits for a specific client
   */
  async getVisitsByClient(clientId: string): Promise<Visit[]> {
    return this.getVisits({ client_id: clientId, limit: 1000 })
  }

  /**
   * Get visits for a specific broker
   */
  async getVisitsByBroker(brokerId: string): Promise<Visit[]> {
    return this.getVisits({ broker_id: brokerId, limit: 1000 })
  }

  /**
   * Get visits for a specific property
   */
  async getVisitsByProperty(propertyId: string): Promise<Visit[]> {
    return this.getVisits({ property_id: propertyId, limit: 1000 })
  }

  /**
   * Get upcoming visits (scheduled or confirmed)
   */
  async getUpcomingVisits(): Promise<Visit[]> {
    const now = new Date().toISOString()
    return this.getVisits({ scheduled_from: now, limit: 1000 })
  }
}

export const visitsService = new VisitsService()

