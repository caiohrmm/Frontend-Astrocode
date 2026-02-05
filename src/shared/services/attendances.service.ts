/**
 * Attendances Service
 * Handles all attendance-related API calls.
 */

import { apiClient } from './api'

// Enums matching backend
export type AttendanceChannel = 'WHATSAPP' | 'SITE' | 'PHONE' | 'EMAIL' | 'IN_PERSON'

export type AttendanceStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'PAUSED'

/**
 * Client status update (from attendance)
 */
export interface ClientStatusUpdate {
  current_status?: string | null
  current_interest_type?: string | null
  current_property_type?: string | null
}

/**
 * Attendance interface matching backend AttendanceResponse schema
 */
export interface Attendance {
  id: string
  client_id: string
  agent_id: string
  property_id: string | null
  channel: AttendanceChannel
  started_at: string
  ended_at: string | null
  duration: number | null
  raw_content: string
  ai_summary: string | null
  ai_next_steps: string | null
  status: AttendanceStatus
  updated_client_status: ClientStatusUpdate | null
  scheduled_visit_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Attendance creation data (AttendanceCreate schema)
 */
export interface AttendanceCreate {
  client_id: string
  agent_id: string
  property_id?: string | null
  channel: AttendanceChannel
  started_at: string
  ended_at?: string | null
  raw_content: string
  ai_summary?: string | null
  ai_next_steps?: string | null
  status?: AttendanceStatus
  updated_client_status?: ClientStatusUpdate | null
  scheduled_visit_at?: string | null
}

/**
 * Attendance update data (AttendanceUpdate schema)
 */
export interface AttendanceUpdate {
  client_id?: string | null
  agent_id?: string | null
  property_id?: string | null
  channel?: AttendanceChannel | null
  started_at?: string | null
  ended_at?: string | null
  raw_content?: string | null
  ai_summary?: string | null
  ai_next_steps?: string | null
  status?: AttendanceStatus | null
  updated_client_status?: ClientStatusUpdate | null
  scheduled_visit_at?: string | null
}

/**
 * List attendances query parameters
 */
export interface ListAttendancesParams {
  skip?: number
  limit?: number
  client_id?: string | null
  agent_id?: string | null
  property_id?: string | null
  channel?: AttendanceChannel | null
  status?: AttendanceStatus | null
  started_from?: string | null
  started_to?: string | null
}

class AttendancesService {
  /**
   * Get all attendances with optional filtering and pagination
   */
  async getAttendances(params?: ListAttendancesParams): Promise<Attendance[]> {
    const queryParams = new URLSearchParams()
    if (params?.skip !== undefined) {
      queryParams.append('skip', params.skip.toString())
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString())
    }
    if (params?.client_id) {
      queryParams.append('client_id', params.client_id)
    }
    if (params?.agent_id) {
      queryParams.append('agent_id', params.agent_id)
    }
    if (params?.property_id) {
      queryParams.append('property_id', params.property_id)
    }
    if (params?.channel) {
      queryParams.append('channel', params.channel)
    }
    if (params?.status) {
      queryParams.append('status', params.status)
    }
    if (params?.started_from) {
      queryParams.append('started_from', params.started_from)
    }
    if (params?.started_to) {
      queryParams.append('started_to', params.started_to)
    }

    const queryString = queryParams.toString()
    const endpoint = `/attendances${queryString ? `?${queryString}` : ''}`

    return apiClient.get<Attendance[]>(endpoint)
  }

  /**
   * Get a single attendance by ID
   */
  async getAttendanceById(attendanceId: string): Promise<Attendance> {
    return apiClient.get<Attendance>(`/attendances/${attendanceId}`)
  }

  /**
   * Create a new attendance
   */
  async createAttendance(attendanceData: AttendanceCreate): Promise<Attendance> {
    return apiClient.post<Attendance>('/attendances', attendanceData)
  }

  /**
   * Update an attendance
   */
  async updateAttendance(
    attendanceId: string,
    attendanceData: AttendanceUpdate
  ): Promise<Attendance> {
    return apiClient.put<Attendance>(`/attendances/${attendanceId}`, attendanceData)
  }

  /**
   * Delete an attendance
   */
  async deleteAttendance(attendanceId: string): Promise<void> {
    return apiClient.delete<void>(`/attendances/${attendanceId}`)
  }
}

export const attendancesService = new AttendancesService()

