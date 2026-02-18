/**
 * AI Chat Service
 * Handles all AI chat-related API calls
 */

import { apiClient } from './api'

export interface ChatContext {
  client_id?: string | null
  property_id?: string | null
  attendance_id?: string | null
}

export interface ChatRequest {
  message: string
  context?: ChatContext | null
  include_dashboard?: boolean
}

export interface ChatResponse {
  answer: string
  error: string | null
}

export class AiChatService {
  /**
   * Send a chat message to the AI endpoint
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    return apiClient.post<ChatResponse>('/ai/chat', request)
  }
}

// Export singleton instance
export const aiChatService = new AiChatService()

