/**
 * Attendances Service
 * Handles all attendance-related API calls.
 */

import { apiClient } from './api'

// Enums matching backend
export type AttendanceStatus = 'ACTIVE' | 'COMPLETED' | 'LOST' | 'ABANDONED'

export type CycleAction = 'NEW_CYCLE_CREATED' | 'CYCLE_UPDATED' | 'PREVIOUS_CYCLE_CLOSED'

/**
 * Client status update (from attendance)
 */
export interface ClientStatusUpdate {
  current_status?: string | null
  current_interest_type?: string | null
  current_property_type?: string | null
}

/**
 * Detected visit information from AI analysis
 */
export interface DetectedVisitInfo {
  detected: boolean
  scheduled_at?: string | null
  date?: string | null
  time?: string | null
  confidence?: number | null
  extracted_text?: string | null
  property_id?: string | null
  notes?: string | null
}

/**
 * Attendance interface matching backend AttendanceResponse schema
 */
export interface Attendance {
  id: string
  client_id: string
  agent_id: string
  property_id: string | null
  objective: string | null // Clear objective of this interaction cycle
  raw_content: string // Accumulated conversations within the same cycle
  ai_summary: string | null
  ai_next_steps: string | null
  status: AttendanceStatus
  updated_client_status: ClientStatusUpdate | null
  scheduled_visit_at: string | null
  created_at: string
  updated_at: string
  cycle_action?: CycleAction | null // Action taken: NEW_CYCLE_CREATED, CYCLE_UPDATED, or PREVIOUS_CYCLE_CLOSED
  previous_cycle_id?: string | null // ID of the previous cycle that was closed (if any)
  detected_visit?: DetectedVisitInfo | null // Visit intent detected by AI from raw_content
  detected_loss?: DetectedLossInfo | null // Loss intent detected by AI from raw_content
  detected_sale?: DetectedSaleInfo | null // Sale intent detected by AI from raw_content
}

/**
 * Detected loss information from AI analysis
 */
export interface DetectedLossInfo {
  detected: boolean
  loss_reason?: string | null // LossReason enum value
  loss_stage?: string | null // LossStage enum value
  confidence?: number | null // Confidence score (0-1)
  extracted_text?: string | null // Text that indicated loss intent
  detailed_reason?: string | null // Detailed explanation extracted from content
  client_feedback?: string | null // Client feedback extracted from content
}

/**
 * Detected sale information from AI analysis
 */
export interface DetectedSaleInfo {
  detected: boolean
  sale_type?: string | null // SALE or RENT
  sale_value?: number | null // Extracted sale value
  property_id?: string | null // Property from attendance or linked visit (for pre-filling sale modal)
  confidence?: number | null // Confidence score (0-1)
  extracted_text?: string | null // Text that indicated sale intent
  payment_method?: string | null // Payment method mentioned (CASH, FINANCING, etc.)
  notes?: string | null // Additional information extracted from content
}

/**
 * Attendance creation data (AttendanceCreate schema)
 */
export interface AttendanceCreate {
  client_id: string
  agent_id: string
  property_id?: string | null
  objective?: string | null // Optional: will be auto-detected from raw_content if not provided
  raw_content: string // New conversation content (will be accumulated if updating existing cycle)
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
  objective?: string | null // Updating objective may trigger new cycle creation
  raw_content?: string | null // New content will be appended to existing cycle
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
  status?: AttendanceStatus | null
  /** If true, only attendances that can receive a new visit (no pending visit) */
  available_for_visit?: boolean
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
    if (params?.status) {
      queryParams.append('status', params.status)
    }
    if (params?.available_for_visit === true) {
      queryParams.append('available_for_visit', 'true')
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

  /**
   * Get the active attendance for a specific client
   * 
   * Returns the currently active attendance cycle for the client.
   * If no active attendance exists, returns 404.
   * 
   * @param clientId - Client UUID
   * @returns Active attendance or throws 404 if not found
   */
  async getActiveAttendanceByClient(clientId: string): Promise<Attendance> {
    return apiClient.get<Attendance>(`/attendances/active/client/${clientId}`)
  }
}

export const attendancesService = new AttendancesService()

