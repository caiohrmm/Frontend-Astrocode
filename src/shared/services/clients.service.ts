/**
 * Clients Service
 * Handles all client-related API calls.
 */

import { apiClient } from './api'

// Enums matching backend
export type LeadSource = 'WHATSAPP' | 'SITE' | 'PHONE'

export type ClientStatus =
  | 'NEW_LEAD'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'VISIT_SCHEDULED'
  | 'VISITING'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATING'
  | 'WON'
  | 'LOST'
  | 'INACTIVE'

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'IMMEDIATE'

export type InterestType = 'BUY' | 'RENT' | 'SELL' | 'INVEST'

export type PropertyType = 'HOUSE' | 'APARTMENT' | 'LAND' | 'COMMERCIAL' | 'RURAL'

/**
 * Client interface matching backend ClientResponse schema
 */
export interface Client {
  id: string
  name: string
  phone: string
  email: string | null
  lead_source: LeadSource
  current_status: ClientStatus | null
  current_lead_score: number | null
  current_urgency_level: UrgencyLevel | null
  assigned_agent_id: string | null
  current_interest_type: InterestType | null
  current_property_type: PropertyType | null
  current_budget_min: string | null
  current_budget_max: string | null
  current_city_interest: string | null
  first_contact_at: string | null
  last_contact_at: string | null
  next_follow_up_at: string | null
  summary_notes: string | null
  // State Derivation Tracking (for visibility/transparency)
  last_state_derivation_at: string | null // Timestamp of last automatic state derivation
  state_derivation_count: number // Number of times state was automatically derived
  state_derived_from_attendances_count: number | null // Number of attendances used in last derivation
  created_at: string
  updated_at: string
}

/**
 * AI Lead Classification Result
 */
export interface LeadClassificationResult {
  lead_score: number
  urgency_level: UrgencyLevel
  interest_type: InterestType | null
  property_type: PropertyType | null
  suggested_status: ClientStatus
  classification_reason: string
  key_indicators: string[]
  recommended_actions: string[]
  confidence: number
}

/**
 * Client with AI classification
 */
export interface ClientWithClassification extends Client {
  ai_classification: LeadClassificationResult | null
}

/**
 * Client creation data (ClientCreate schema)
 */
export interface ClientCreate {
  name: string
  phone: string
  email: string | null
  lead_source: LeadSource
  initial_message?: string | null
  use_ai_classification?: boolean
  current_status?: ClientStatus | null
  current_lead_score?: number | null
  current_urgency_level?: UrgencyLevel | null
  assigned_agent_id?: string | null
  current_interest_type?: InterestType | null
  current_property_type?: PropertyType | null
  current_budget_min?: string | null
  current_budget_max?: string | null
  current_city_interest?: string | null
  first_contact_at?: string | null
  last_contact_at?: string | null
  next_follow_up_at?: string | null
  summary_notes?: string | null
}

/**
 * Client update data (ClientUpdate schema)
 */
export interface ClientUpdate {
  name?: string | null
  phone?: string | null
  email?: string | null
  lead_source?: LeadSource | null
  current_status?: ClientStatus | null
  current_lead_score?: number | null
  current_urgency_level?: UrgencyLevel | null
  assigned_agent_id?: string | null
  current_interest_type?: InterestType | null
  current_property_type?: PropertyType | null
  current_budget_min?: string | null
  current_budget_max?: string | null
  current_city_interest?: string | null
  first_contact_at?: string | null
  last_contact_at?: string | null
  next_follow_up_at?: string | null
  summary_notes?: string | null
}

/**
 * List clients query parameters
 */
export interface ListClientsParams {
  skip?: number
  limit?: number
  lead_source?: LeadSource | null
  search?: string | null
}

class ClientsService {
  /**
   * Get all clients with optional filtering and pagination
   */
  async getClients(params?: ListClientsParams): Promise<Client[]> {
    const queryParams = new URLSearchParams()
    if (params?.skip !== undefined) {
      queryParams.append('skip', params.skip.toString())
    }
    if (params?.limit !== undefined) {
      queryParams.append('limit', params.limit.toString())
    }
    if (params?.lead_source) {
      queryParams.append('lead_source', params.lead_source)
    }
    if (params?.search) {
      queryParams.append('search', params.search)
    }

    const queryString = queryParams.toString()
    const endpoint = `/clients${queryString ? `?${queryString}` : ''}`

    return apiClient.get<Client[]>(endpoint)
  }

  /**
   * Get a single client by ID
   */
  async getClientById(clientId: string): Promise<Client> {
    return apiClient.get<Client>(`/clients/${clientId}`)
  }

  /**
   * Create a new client with AI classification
   */
  async createClient(clientData: ClientCreate): Promise<ClientWithClassification> {
    return apiClient.post<ClientWithClassification>('/clients', clientData)
  }

  /**
   * Update a client
   */
  async updateClient(clientId: string, clientData: ClientUpdate): Promise<Client> {
    return apiClient.put<Client>(`/clients/${clientId}`, clientData)
  }

  /**
   * Delete a client
   */
  async deleteClient(clientId: string): Promise<void> {
    return apiClient.delete<void>(`/clients/${clientId}`)
  }

  /**
   * Classify or reclassify a lead using AI
   */
  async classifyLead(clientId: string, context?: { initial_message?: string; notes?: string }): Promise<LeadClassificationResult> {
    return apiClient.post<LeadClassificationResult>(`/clients/${clientId}/classify`, context || {})
  }

  /**
   * Apply AI classification to a client
   */
  async applyClassification(clientId: string, classification: LeadClassificationResult): Promise<Client> {
    return apiClient.post<Client>(`/clients/${clientId}/apply-classification`, classification)
  }
}

export const clientsService = new ClientsService()

