/**
 * AI Summaries Service
 * Handles all AI summary-related API calls.
 */

import { apiClient } from './api'

// Enums matching backend
export type AISummaryStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REPROCESSING'

export type DetectedIntent =
  | 'INFORMATION_REQUEST'
  | 'PROPERTY_SEARCH'
  | 'SCHEDULE_VISIT'
  | 'PRICE_NEGOTIATION'
  | 'DOCUMENTATION_REQUEST'
  | 'GENERAL_INQUIRY'
  | 'COMPLAINT'
  | 'SALE_COMPLETED'   // Venda ou aluguel concretizado
  | 'LOSS_REGISTERED'  // Perda registrada

export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'MIXED'

/**
 * AI Summary interface matching backend AISummaryResponse schema
 */
export interface AISummary {
  id: string
  attendance_id: string
  client_id: string
  summary_text: string
  key_points: {
    topics?: string[]
    requirements?: string[]
    mentions?: string[]
    city?: string
    property_type?: string
  } | null
  detected_intent: DetectedIntent | null
  interest_type_detected: string | null
  budget_min_detected: number | null
  budget_max_detected: number | null
  urgency_level_detected: string | null
  lead_score_suggested: number | null
  sentiment: Sentiment | null
  recommended_properties: string[] | null
  model_used: string | null
  prompt_version: string | null
  confidence_score: number | null
  status: AISummaryStatus
  error_message: string | null
  created_at: string
}

class AISummariesService {
  /**
   * Get AI summary by attendance ID
   */
  async getSummaryByAttendanceId(attendanceId: string): Promise<AISummary | null> {
    try {
      return await apiClient.get<AISummary>(`/ai/summaries/attendance/${attendanceId}`)
    } catch (error: any) {
      // Return null if not found (404) instead of throwing
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  }

  /**
   * Get AI summary by ID
   */
  async getSummaryById(summaryId: string): Promise<AISummary> {
    return apiClient.get<AISummary>(`/ai/summaries/${summaryId}`)
  }

  /**
   * Get all AI summaries for a client
   */
  async getSummariesByClientId(
    clientId: string,
    skip?: number,
    limit?: number
  ): Promise<AISummary[]> {
    const queryParams = new URLSearchParams()
    if (skip !== undefined) queryParams.append('skip', skip.toString())
    if (limit !== undefined) queryParams.append('limit', limit.toString())

    const queryString = queryParams.toString()
    const endpoint = `/ai/summaries/client/${clientId}${queryString ? `?${queryString}` : ''}`

    try {
      return await apiClient.get<AISummary[]>(endpoint)
    } catch (error: any) {
      // Return empty array if not found (404) instead of throwing
      if (error.response?.status === 404) {
        return []
      }
      throw error
    }
  }
}

export const aiSummariesService = new AISummariesService()

