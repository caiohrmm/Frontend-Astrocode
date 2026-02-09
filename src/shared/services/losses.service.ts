/**
 * Losses Service
 * Handles all loss-related API calls for tracking and analyzing lost deals.
 */

import { apiClient } from './api'

// Enums
export enum LossReason {
  PRICE_TOO_HIGH = 'PRICE_TOO_HIGH',
  BUDGET_INSUFFICIENT = 'BUDGET_INSUFFICIENT',
  BETTER_OFFER_COMPETITOR = 'BETTER_OFFER_COMPETITOR',
  PROPERTY_NOT_SUITABLE = 'PROPERTY_NOT_SUITABLE',
  LOCATION_NOT_IDEAL = 'LOCATION_NOT_IDEAL',
  NO_MATCHING_PROPERTY = 'NO_MATCHING_PROPERTY',
  CLIENT_CHANGED_MIND = 'CLIENT_CHANGED_MIND',
  CLIENT_NOT_READY = 'CLIENT_NOT_READY',
  CLIENT_UNRESPONSIVE = 'CLIENT_UNRESPONSIVE',
  CLIENT_FINANCING_DENIED = 'CLIENT_FINANCING_DENIED',
  SLOW_RESPONSE = 'SLOW_RESPONSE',
  POOR_SERVICE = 'POOR_SERVICE',
  ECONOMIC_FACTORS = 'ECONOMIC_FACTORS',
  PERSONAL_REASONS = 'PERSONAL_REASONS',
  OTHER = 'OTHER',
}

export enum LossStage {
  INITIAL_CONTACT = 'INITIAL_CONTACT',
  QUALIFICATION = 'QUALIFICATION',
  VISIT_SCHEDULED = 'VISIT_SCHEDULED',
  VISIT_COMPLETED = 'VISIT_COMPLETED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CONTRACT = 'CONTRACT',
}

// Interfaces
export interface Loss {
  id: string
  client_id: string
  property_id: string | null
  broker_id: string | null
  loss_reason: LossReason
  loss_stage: LossStage
  detailed_reason: string | null
  client_feedback: string | null
  competitor_info: string | null
  could_have_been_prevented: boolean | null
  lessons_learned: string | null
  ai_analysis: string | null
  ai_recommendations: string | null
  lost_at: string
  created_at: string
  // Enriched fields
  client_name: string | null
  property_title: string | null
  broker_name: string | null
}

export interface LossCreate {
  client_id: string
  property_id?: string | null
  broker_id?: string | null
  loss_reason: LossReason
  loss_stage: LossStage
  detailed_reason?: string | null
  client_feedback?: string | null
  competitor_info?: string | null
  could_have_been_prevented?: boolean | null
  lessons_learned?: string | null
}

export interface LossUpdate {
  loss_reason?: LossReason
  loss_stage?: LossStage
  detailed_reason?: string | null
  client_feedback?: string | null
  competitor_info?: string | null
  could_have_been_prevented?: boolean | null
  lessons_learned?: string | null
}

export interface LossStats {
  total_losses: number
  losses_by_reason: Record<string, number>
  losses_by_stage: Record<string, number>
  preventable_count: number
  avg_days_to_loss: number
  monthly_losses: Array<{ month: string; count: number }>
}

export interface LossPatternAnalysis {
  total_losses: number
  period_analyzed: string
  top_reasons: Array<{ reason: string; count: number; percentage: number }>
  critical_stages: Array<{ stage: string; count: number; percentage: number }>
  patterns_detected: string[]
  recommendations: string[]
  risk_factors: string[]
  success_vs_loss_insights: string | null
  summary: string
}

export interface LossesListParams {
  skip?: number
  limit?: number
  client_id?: string
  broker_id?: string
  loss_reason?: LossReason
  loss_stage?: LossStage
  start_date?: string
  end_date?: string
}

class LossesService {
  /**
   * Create a new loss record
   */
  async createLoss(data: LossCreate): Promise<Loss> {
    return apiClient.post<Loss>('/losses/', data)
  }

  /**
   * List all losses with optional filters
   */
  async listLosses(params?: LossesListParams): Promise<Loss[]> {
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
    if (params?.broker_id) {
      queryParams.append('broker_id', params.broker_id)
    }
    if (params?.loss_reason) {
      queryParams.append('loss_reason', params.loss_reason)
    }
    if (params?.loss_stage) {
      queryParams.append('loss_stage', params.loss_stage)
    }
    if (params?.start_date) {
      queryParams.append('start_date', params.start_date)
    }
    if (params?.end_date) {
      queryParams.append('end_date', params.end_date)
    }

    const queryString = queryParams.toString()
    const endpoint = `/losses${queryString ? `?${queryString}` : ''}`
    return apiClient.get<Loss[]>(endpoint)
  }

  /**
   * Get loss statistics
   */
  async getStats(params?: { broker_id?: string; start_date?: string; end_date?: string }): Promise<LossStats> {
    const queryParams = new URLSearchParams()
    if (params?.broker_id) {
      queryParams.append('broker_id', params.broker_id)
    }
    if (params?.start_date) {
      queryParams.append('start_date', params.start_date)
    }
    if (params?.end_date) {
      queryParams.append('end_date', params.end_date)
    }

    const queryString = queryParams.toString()
    const endpoint = `/losses/stats${queryString ? `?${queryString}` : ''}`
    return apiClient.get<LossStats>(endpoint)
  }

  /**
   * Analyze loss patterns using AI
   */
  async analyzePatterns(params?: { broker_id?: string; days?: number }): Promise<LossPatternAnalysis> {
    const queryParams = new URLSearchParams()
    if (params?.broker_id) {
      queryParams.append('broker_id', params.broker_id)
    }
    if (params?.days !== undefined) {
      queryParams.append('days', params.days.toString())
    }

    const queryString = queryParams.toString()
    const endpoint = `/losses/patterns${queryString ? `?${queryString}` : ''}`
    return apiClient.get<LossPatternAnalysis>(endpoint)
  }

  /**
   * Get a single loss by ID
   */
  async getLoss(lossId: string): Promise<Loss> {
    return apiClient.get<Loss>(`/losses/${lossId}`)
  }

  /**
   * Update a loss record
   */
  async updateLoss(lossId: string, data: LossUpdate): Promise<Loss> {
    return apiClient.put<Loss>(`/losses/${lossId}`, data)
  }

  /**
   * Delete a loss record
   */
  async deleteLoss(lossId: string): Promise<void> {
    return apiClient.delete<void>(`/losses/${lossId}`)
  }

  /**
   * Get losses for a specific client
   */
  async getClientLosses(clientId: string): Promise<Loss[]> {
    return this.listLosses({ client_id: clientId })
  }
}

// Export singleton instance
export const lossesService = new LossesService()

// Helper functions
export const getLossReasonLabel = (reason: LossReason | string): string => {
  const labels: Record<string, string> = {
    [LossReason.PRICE_TOO_HIGH]: 'Preço muito alto',
    [LossReason.BUDGET_INSUFFICIENT]: 'Orçamento insuficiente',
    [LossReason.BETTER_OFFER_COMPETITOR]: 'Melhor oferta da concorrência',
    [LossReason.PROPERTY_NOT_SUITABLE]: 'Imóvel não adequado',
    [LossReason.LOCATION_NOT_IDEAL]: 'Localização não ideal',
    [LossReason.NO_MATCHING_PROPERTY]: 'Nenhum imóvel compatível',
    [LossReason.CLIENT_CHANGED_MIND]: 'Cliente mudou de ideia',
    [LossReason.CLIENT_NOT_READY]: 'Cliente não está pronto',
    [LossReason.CLIENT_UNRESPONSIVE]: 'Cliente não responde',
    [LossReason.CLIENT_FINANCING_DENIED]: 'Financiamento negado',
    [LossReason.SLOW_RESPONSE]: 'Resposta lenta',
    [LossReason.POOR_SERVICE]: 'Atendimento ruim',
    [LossReason.ECONOMIC_FACTORS]: 'Fatores econômicos',
    [LossReason.PERSONAL_REASONS]: 'Motivos pessoais',
    [LossReason.OTHER]: 'Outro motivo',
  }
  return labels[reason] || reason
}

export const getLossStageLabel = (stage: LossStage | string): string => {
  const labels: Record<string, string> = {
    [LossStage.INITIAL_CONTACT]: 'Contato inicial',
    [LossStage.QUALIFICATION]: 'Qualificação',
    [LossStage.VISIT_SCHEDULED]: 'Visita agendada',
    [LossStage.VISIT_COMPLETED]: 'Visita realizada',
    [LossStage.PROPOSAL]: 'Proposta',
    [LossStage.NEGOTIATION]: 'Negociação',
    [LossStage.CONTRACT]: 'Contrato',
  }
  return labels[stage] || stage
}

export const getLossReasonColor = (reason: LossReason | string): string => {
  const priceReasons = [LossReason.PRICE_TOO_HIGH, LossReason.BUDGET_INSUFFICIENT, LossReason.BETTER_OFFER_COMPETITOR]
  const propertyReasons = [LossReason.PROPERTY_NOT_SUITABLE, LossReason.LOCATION_NOT_IDEAL, LossReason.NO_MATCHING_PROPERTY]
  const clientReasons = [LossReason.CLIENT_CHANGED_MIND, LossReason.CLIENT_NOT_READY, LossReason.CLIENT_UNRESPONSIVE, LossReason.CLIENT_FINANCING_DENIED]
  const serviceReasons = [LossReason.SLOW_RESPONSE, LossReason.POOR_SERVICE]

  if (priceReasons.includes(reason as LossReason)) return 'warning'
  if (propertyReasons.includes(reason as LossReason)) return 'info'
  if (clientReasons.includes(reason as LossReason)) return 'secondary'
  if (serviceReasons.includes(reason as LossReason)) return 'error'
  return 'grey'
}

export const getLossReasonIcon = (reason: LossReason | string): string => {
  const icons: Record<string, string> = {
    [LossReason.PRICE_TOO_HIGH]: 'mdi-currency-usd-off',
    [LossReason.BUDGET_INSUFFICIENT]: 'mdi-wallet-outline',
    [LossReason.BETTER_OFFER_COMPETITOR]: 'mdi-account-switch',
    [LossReason.PROPERTY_NOT_SUITABLE]: 'mdi-home-remove',
    [LossReason.LOCATION_NOT_IDEAL]: 'mdi-map-marker-off',
    [LossReason.NO_MATCHING_PROPERTY]: 'mdi-home-search',
    [LossReason.CLIENT_CHANGED_MIND]: 'mdi-head-question',
    [LossReason.CLIENT_NOT_READY]: 'mdi-clock-alert',
    [LossReason.CLIENT_UNRESPONSIVE]: 'mdi-phone-off',
    [LossReason.CLIENT_FINANCING_DENIED]: 'mdi-bank-off',
    [LossReason.SLOW_RESPONSE]: 'mdi-timer-sand',
    [LossReason.POOR_SERVICE]: 'mdi-emoticon-sad',
    [LossReason.ECONOMIC_FACTORS]: 'mdi-chart-line-variant',
    [LossReason.PERSONAL_REASONS]: 'mdi-account-heart',
    [LossReason.OTHER]: 'mdi-help-circle',
  }
  return icons[reason] || 'mdi-help-circle'
}

// Loss reason options for selects
export const lossReasonOptions = [
  { title: 'Preço muito alto', value: LossReason.PRICE_TOO_HIGH, category: 'Preço' },
  { title: 'Orçamento insuficiente', value: LossReason.BUDGET_INSUFFICIENT, category: 'Preço' },
  { title: 'Melhor oferta da concorrência', value: LossReason.BETTER_OFFER_COMPETITOR, category: 'Preço' },
  { title: 'Imóvel não adequado', value: LossReason.PROPERTY_NOT_SUITABLE, category: 'Imóvel' },
  { title: 'Localização não ideal', value: LossReason.LOCATION_NOT_IDEAL, category: 'Imóvel' },
  { title: 'Nenhum imóvel compatível', value: LossReason.NO_MATCHING_PROPERTY, category: 'Imóvel' },
  { title: 'Cliente mudou de ideia', value: LossReason.CLIENT_CHANGED_MIND, category: 'Cliente' },
  { title: 'Cliente não está pronto', value: LossReason.CLIENT_NOT_READY, category: 'Cliente' },
  { title: 'Cliente não responde', value: LossReason.CLIENT_UNRESPONSIVE, category: 'Cliente' },
  { title: 'Financiamento negado', value: LossReason.CLIENT_FINANCING_DENIED, category: 'Cliente' },
  { title: 'Resposta lenta', value: LossReason.SLOW_RESPONSE, category: 'Atendimento' },
  { title: 'Atendimento ruim', value: LossReason.POOR_SERVICE, category: 'Atendimento' },
  { title: 'Fatores econômicos', value: LossReason.ECONOMIC_FACTORS, category: 'Externo' },
  { title: 'Motivos pessoais', value: LossReason.PERSONAL_REASONS, category: 'Externo' },
  { title: 'Outro motivo', value: LossReason.OTHER, category: 'Outro' },
]

export const lossStageOptions = [
  { title: 'Contato inicial', value: LossStage.INITIAL_CONTACT },
  { title: 'Qualificação', value: LossStage.QUALIFICATION },
  { title: 'Visita agendada', value: LossStage.VISIT_SCHEDULED },
  { title: 'Visita realizada', value: LossStage.VISIT_COMPLETED },
  { title: 'Proposta', value: LossStage.PROPOSAL },
  { title: 'Negociação', value: LossStage.NEGOTIATION },
  { title: 'Contrato', value: LossStage.CONTRACT },
]

