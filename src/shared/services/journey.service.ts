/**
 * AI Journey Service
 * Handles client journey analysis, timeline, and AI-powered insights
 */

import { apiClient } from './api'

// Types
export type TimelineEventType =
  | 'CLIENT_CREATED'
  | 'CLIENT_UPDATED'
  | 'STATUS_CHANGED'
  | 'AGENT_ASSIGNED'
  | 'ATTENDANCE_STARTED'
  | 'ATTENDANCE_COMPLETED'
  | 'VISIT_SCHEDULED'
  | 'VISIT_CONFIRMED'
  | 'VISIT_COMPLETED'
  | 'VISIT_CANCELLED'
  | 'VISIT_NO_SHOW'
  | 'AI_INSIGHT_GENERATED'
  | 'AI_SUGGESTION_APPLIED'
  | 'AI_PROPERTY_RECOMMENDED'
  | 'PROPOSAL_SENT'
  | 'PROPOSAL_ACCEPTED'
  | 'PROPOSAL_REJECTED'
  | 'PRICE_NEGOTIATION'
  | 'NOTE_ADDED'
  | 'DOCUMENT_UPLOADED'
  | 'CONTACT_ATTEMPT'

export interface TimelineEvent {
  id: string
  client_id: string
  event_type: TimelineEventType
  title: string
  description: string | null
  event_data: Record<string, any> | null
  related_attendance_id: string | null
  related_visit_id: string | null
  related_property_id: string | null
  created_by_id: string | null
  ai_generated: boolean
  importance: number
  created_at: string
}

export interface JourneyInsights {
  engagement_score: number
  relationship_health: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'AT_RISK' | 'UNKNOWN'
  sentiment_trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'UNKNOWN'
  lead_score_trend: 'IMPROVING' | 'STABLE' | 'DECLINING'
  avg_ai_lead_score: number | null
  days_since_contact: number | null
  total_attendances: number
  completed_attendances: number
  total_visits: number
  completed_visits: number
  no_show_visits: number
  most_common_intent: string | null
  journey_stage: string
}

export interface NextAction {
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  action: string
  title: string
  description: string
  suggested_channel?: string | null
  properties?: string[] | null
}

export interface JourneyAnalysis {
  analysis: string
  context_summary?: {
    engagement_score: number
    relationship_health: string
    journey_stage: string
    sentiment_trend: string
  } | null
  next_actions: NextAction[]
}

export interface ClientContext {
  client: Record<string, any>
  attendances: Array<Record<string, any>>
  ai_summaries: Array<Record<string, any>>
  visits: Array<Record<string, any>>
  properties_of_interest: Array<Record<string, any>>
  timeline_summary: {
    total_events: number
    recent_events: Array<{
      event_type: string
      title: string
      created_at: string
    }>
  }
  insights: JourneyInsights
}

export interface TimelineEventCreate {
  event_type: TimelineEventType
  title: string
  description?: string | null
  event_data?: Record<string, any> | null
  related_attendance_id?: string | null
  related_visit_id?: string | null
  related_property_id?: string | null
  importance?: number
}

class JourneyService {
  /**
   * Get complete client context for AI analysis
   */
  async getClientContext(clientId: string): Promise<ClientContext> {
    return apiClient.get<ClientContext>(`/ai/journey/context/${clientId}`)
  }

  /**
   * Get AI-generated journey analysis
   */
  async getJourneyAnalysis(clientId: string): Promise<JourneyAnalysis> {
    return apiClient.get<JourneyAnalysis>(`/ai/journey/analysis/${clientId}`)
  }

  /**
   * Get AI-suggested next actions
   */
  async getNextActions(clientId: string): Promise<NextAction[]> {
    return apiClient.get<NextAction[]>(`/ai/journey/next-actions/${clientId}`)
  }

  /**
   * Get client timeline events
   */
  async getTimeline(
    clientId: string,
    options?: { limit?: number; eventTypes?: TimelineEventType[] }
  ): Promise<TimelineEvent[]> {
    const params = new URLSearchParams()
    if (options?.limit) params.append('limit', String(options.limit))
    if (options?.eventTypes) {
      options.eventTypes.forEach(type => params.append('event_types', type))
    }
    const queryString = params.toString()
    const endpoint = queryString
      ? `/ai/journey/timeline/${clientId}?${queryString}`
      : `/ai/journey/timeline/${clientId}`
    return apiClient.get<TimelineEvent[]>(endpoint)
  }

  /**
   * Create a timeline event
   */
  async createTimelineEvent(clientId: string, event: TimelineEventCreate): Promise<TimelineEvent> {
    return apiClient.post<TimelineEvent>(`/ai/journey/timeline/${clientId}`, event)
  }

  /**
   * Get journey insights
   */
  async getInsights(clientId: string): Promise<JourneyInsights> {
    return apiClient.get<JourneyInsights>(`/ai/journey/insights/${clientId}`)
  }
}

export const journeyService = new JourneyService()

// Helper functions for UI
export const getEventTypeLabel = (eventType: TimelineEventType): string => {
  const labels: Record<TimelineEventType, string> = {
    CLIENT_CREATED: 'Cliente criado',
    CLIENT_UPDATED: 'Cliente atualizado',
    STATUS_CHANGED: 'Status alterado',
    AGENT_ASSIGNED: 'Corretor atribuído',
    ATTENDANCE_STARTED: 'Atendimento iniciado',
    ATTENDANCE_COMPLETED: 'Atendimento concluído',
    VISIT_SCHEDULED: 'Visita agendada',
    VISIT_CONFIRMED: 'Visita confirmada',
    VISIT_COMPLETED: 'Visita concluída',
    VISIT_CANCELLED: 'Visita cancelada',
    VISIT_NO_SHOW: 'Cliente não compareceu',
    AI_INSIGHT_GENERATED: 'Insight de IA gerado',
    AI_SUGGESTION_APPLIED: 'Sugestão de IA aplicada',
    AI_PROPERTY_RECOMMENDED: 'Imóvel recomendado pela IA',
    PROPOSAL_SENT: 'Proposta enviada',
    PROPOSAL_ACCEPTED: 'Proposta aceita',
    PROPOSAL_REJECTED: 'Proposta rejeitada',
    PRICE_NEGOTIATION: 'Negociação de preço',
    NOTE_ADDED: 'Nota adicionada',
    DOCUMENT_UPLOADED: 'Documento enviado',
    CONTACT_ATTEMPT: 'Tentativa de contato',
  }
  return labels[eventType] || eventType
}

export const getEventTypeIcon = (eventType: TimelineEventType): string => {
  const icons: Record<TimelineEventType, string> = {
    CLIENT_CREATED: 'mdi-account-plus',
    CLIENT_UPDATED: 'mdi-account-edit',
    STATUS_CHANGED: 'mdi-flag',
    AGENT_ASSIGNED: 'mdi-account-tie',
    ATTENDANCE_STARTED: 'mdi-phone-incoming',
    ATTENDANCE_COMPLETED: 'mdi-phone-check',
    VISIT_SCHEDULED: 'mdi-calendar-clock',
    VISIT_CONFIRMED: 'mdi-calendar-check',
    VISIT_COMPLETED: 'mdi-home-check',
    VISIT_CANCELLED: 'mdi-calendar-remove',
    VISIT_NO_SHOW: 'mdi-account-off',
    AI_INSIGHT_GENERATED: 'mdi-robot',
    AI_SUGGESTION_APPLIED: 'mdi-check-circle',
    AI_PROPERTY_RECOMMENDED: 'mdi-home-search',
    PROPOSAL_SENT: 'mdi-email-send',
    PROPOSAL_ACCEPTED: 'mdi-handshake',
    PROPOSAL_REJECTED: 'mdi-close-circle',
    PRICE_NEGOTIATION: 'mdi-currency-usd',
    NOTE_ADDED: 'mdi-note-text',
    DOCUMENT_UPLOADED: 'mdi-file-upload',
    CONTACT_ATTEMPT: 'mdi-phone-outgoing',
  }
  return icons[eventType] || 'mdi-circle'
}

export const getEventTypeColor = (eventType: TimelineEventType): string => {
  const colors: Record<TimelineEventType, string> = {
    CLIENT_CREATED: 'primary',
    CLIENT_UPDATED: 'info',
    STATUS_CHANGED: 'warning',
    AGENT_ASSIGNED: 'secondary',
    ATTENDANCE_STARTED: 'info',
    ATTENDANCE_COMPLETED: 'success',
    VISIT_SCHEDULED: 'info',
    VISIT_CONFIRMED: 'primary',
    VISIT_COMPLETED: 'success',
    VISIT_CANCELLED: 'error',
    VISIT_NO_SHOW: 'error',
    AI_INSIGHT_GENERATED: 'purple',
    AI_SUGGESTION_APPLIED: 'success',
    AI_PROPERTY_RECOMMENDED: 'purple',
    PROPOSAL_SENT: 'info',
    PROPOSAL_ACCEPTED: 'success',
    PROPOSAL_REJECTED: 'error',
    PRICE_NEGOTIATION: 'warning',
    NOTE_ADDED: 'grey',
    DOCUMENT_UPLOADED: 'grey',
    CONTACT_ATTEMPT: 'info',
  }
  return colors[eventType] || 'grey'
}

export const getRelationshipHealthColor = (health: string): string => {
  const colors: Record<string, string> = {
    EXCELLENT: 'success',
    GOOD: 'info',
    NEEDS_ATTENTION: 'warning',
    AT_RISK: 'error',
    UNKNOWN: 'grey',
  }
  return colors[health] || 'grey'
}

export const getRelationshipHealthLabel = (health: string): string => {
  const labels: Record<string, string> = {
    EXCELLENT: 'Excelente',
    GOOD: 'Bom',
    NEEDS_ATTENTION: 'Precisa de Atenção',
    AT_RISK: 'Em Risco',
    UNKNOWN: 'Desconhecido',
  }
  return labels[health] || health
}

export const getJourneyStageLabel = (stage: string): string => {
  const labels: Record<string, string> = {
    NEW_LEAD: 'Novo Lead',
    INITIAL_CONTACT: 'Contato Inicial',
    QUALIFIED: 'Qualificado',
    VISITING: 'Em Visitas',
    DECISION_MAKING: 'Tomando Decisão',
    PROPOSAL: 'Proposta Enviada',
    NEGOTIATING: 'Negociando',
    CLOSED_WON: 'Fechado (Ganho)',
    CLOSED_LOST: 'Fechado (Perdido)',
    UNKNOWN: 'Desconhecido',
  }
  return labels[stage] || stage
}

export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    HIGH: 'error',
    MEDIUM: 'warning',
    LOW: 'info',
  }
  return colors[priority] || 'grey'
}

