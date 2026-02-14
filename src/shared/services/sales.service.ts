/**
 * Sales Service
 * Handles all sales/rentals-related API calls.
 */

import { apiClient } from './api'

// Enums
export enum SaleType {
  SALE = 'SALE',
  RENT = 'RENT',
}

export enum SaleStatus {
  PENDING = 'PENDING',
  DOCUMENTATION = 'DOCUMENTATION',
  CONTRACT = 'CONTRACT',
  SIGNED = 'SIGNED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  FINANCING = 'FINANCING',
  INSTALLMENTS = 'INSTALLMENTS',
  MIXED = 'MIXED',
}

// Interfaces
export interface PaymentMethodItem {
  method: PaymentMethod
  value: number
  description?: string | null
}

export interface Sale {
  id: string
  client_id: string
  property_id: string | null
  broker_id: string | null
  sale_type: SaleType
  status: SaleStatus
  sale_value: number
  commission_percentage: number | null
  commission_value: number | null
  down_payment: number | null
  payment_method: PaymentMethod | null // Legacy, deprecated
  payment_methods: PaymentMethodItem[] | null // New: multiple payment methods
  rent_duration_months: number | null
  rent_start_date: string | null
  proposal_date: string | null
  contract_date: string | null
  completion_date: string | null
  notes: string | null
  ai_analysis: string | null
  ai_success_factors: string | null
  created_at: string
  updated_at: string
  // Enriched fields
  client_name: string | null
  property_title: string | null
  broker_name: string | null
}

export interface SaleWithDetails extends Sale {
  client_phone: string | null
  client_email: string | null
  property_address: string | null
  property_city: string | null
}

export interface SaleCreate {
  client_id: string
  property_id?: string | null
  broker_id?: string | null
  sale_type: SaleType
  sale_value: number
  commission_percentage?: number | null
  down_payment?: number | null
  payment_method?: PaymentMethod | null // Legacy, deprecated
  payment_methods?: PaymentMethodItem[] | null // New: multiple payment methods
  rent_duration_months?: number | null
  rent_start_date?: string | null
  proposal_date?: string | null
  notes?: string | null
}

export interface SaleUpdate {
  property_id?: string | null
  broker_id?: string | null
  status?: SaleStatus
  sale_value?: number
  commission_percentage?: number | null
  commission_value?: number | null
  down_payment?: number | null
  payment_method?: PaymentMethod | null // Legacy, deprecated
  payment_methods?: PaymentMethodItem[] | null // New: multiple payment methods
  rent_duration_months?: number | null
  rent_start_date?: string | null
  proposal_date?: string | null
  contract_date?: string | null
  completion_date?: string | null
  notes?: string | null
  ai_analysis?: string | null
  ai_success_factors?: string | null
}

export interface SaleStats {
  total_sales: number
  total_value: number
  total_commission: number
  sales_count: number
  rent_count: number
  pending_count: number
  completed_count: number
  avg_sale_value: number
  avg_commission: number
}

export interface SalesListParams {
  skip?: number
  limit?: number
  client_id?: string
  property_id?: string
  broker_id?: string
  sale_type?: SaleType
  sale_status?: SaleStatus
}

export interface SalesStatsParams {
  broker_id?: string
  start_date?: string
  end_date?: string
}

class SalesService {
  /**
   * Create a new sale
   */
  async createSale(data: SaleCreate): Promise<Sale> {
    return apiClient.post<Sale>('/sales/', data)
  }

  /**
   * List all sales with optional filters
   */
  async listSales(params?: SalesListParams): Promise<Sale[]> {
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
    if (params?.property_id) {
      queryParams.append('property_id', params.property_id)
    }
    if (params?.broker_id) {
      queryParams.append('broker_id', params.broker_id)
    }
    if (params?.sale_type) {
      queryParams.append('sale_type', params.sale_type)
    }
    if (params?.sale_status) {
      queryParams.append('sale_status', params.sale_status)
    }

    const queryString = queryParams.toString()
    const endpoint = `/sales${queryString ? `?${queryString}` : ''}`
    return apiClient.get<Sale[]>(endpoint)
  }

  /**
   * Get sales statistics
   */
  async getStats(params?: SalesStatsParams): Promise<SaleStats> {
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
    const endpoint = `/sales/stats${queryString ? `?${queryString}` : ''}`
    return apiClient.get<SaleStats>(endpoint)
  }

  /**
   * Get a single sale by ID with full details
   */
  async getSale(saleId: string): Promise<SaleWithDetails> {
    return apiClient.get<SaleWithDetails>(`/sales/${saleId}`)
  }

  /**
   * Update a sale
   */
  async updateSale(saleId: string, data: SaleUpdate): Promise<Sale> {
    return apiClient.put<Sale>(`/sales/${saleId}`, data)
  }

  /**
   * Delete a sale
   */
  async deleteSale(saleId: string): Promise<void> {
    return apiClient.delete<void>(`/sales/${saleId}`)
  }

  /**
   * Mark a sale as completed
   */
  async completeSale(saleId: string): Promise<Sale> {
    return apiClient.post<Sale>(`/sales/${saleId}/complete`)
  }

  /**
   * Cancel a sale
   */
  async cancelSale(saleId: string, reason?: string): Promise<Sale> {
    const queryString = reason ? `?reason=${encodeURIComponent(reason)}` : ''
    return apiClient.post<Sale>(`/sales/${saleId}/cancel${queryString}`)
  }

  /**
   * Get sales for a specific client
   */
  async getClientSales(clientId: string): Promise<Sale[]> {
    return this.listSales({ client_id: clientId })
  }

  /**
   * Get sales for a specific property
   */
  async getPropertySales(propertyId: string): Promise<Sale[]> {
    return this.listSales({ property_id: propertyId })
  }
}

// Export singleton instance
export const salesService = new SalesService()

// Helper functions
export const getSaleTypeLabel = (type: SaleType | string): string => {
  const labels: Record<string, string> = {
    [SaleType.SALE]: 'Venda',
    [SaleType.RENT]: 'Aluguel',
  }
  return labels[type] || type
}

export const getSaleStatusLabel = (status: SaleStatus | string): string => {
  const labels: Record<string, string> = {
    [SaleStatus.PENDING]: 'Aguardando',
    [SaleStatus.DOCUMENTATION]: 'Documentação',
    [SaleStatus.CONTRACT]: 'Contrato',
    [SaleStatus.SIGNED]: 'Assinado',
    [SaleStatus.COMPLETED]: 'Concluído',
    [SaleStatus.CANCELLED]: 'Cancelado',
  }
  return labels[status] || status
}

export const getSaleStatusColor = (status: SaleStatus | string): string => {
  const colors: Record<string, string> = {
    [SaleStatus.PENDING]: 'warning',
    [SaleStatus.DOCUMENTATION]: 'info',
    [SaleStatus.CONTRACT]: 'primary',
    [SaleStatus.SIGNED]: 'secondary',
    [SaleStatus.COMPLETED]: 'success',
    [SaleStatus.CANCELLED]: 'error',
  }
  return colors[status] || 'grey'
}

export const getSaleStatusIcon = (status: SaleStatus | string): string => {
  const icons: Record<string, string> = {
    [SaleStatus.PENDING]: 'mdi-clock-outline',
    [SaleStatus.DOCUMENTATION]: 'mdi-file-document-outline',
    [SaleStatus.CONTRACT]: 'mdi-file-sign',
    [SaleStatus.SIGNED]: 'mdi-check-circle',
    [SaleStatus.COMPLETED]: 'mdi-trophy',
    [SaleStatus.CANCELLED]: 'mdi-close-circle',
  }
  return icons[status] || 'mdi-help-circle'
}

export const getPaymentMethodLabel = (method: PaymentMethod | string): string => {
  const labels: Record<string, string> = {
    [PaymentMethod.CASH]: 'À Vista',
    [PaymentMethod.FINANCING]: 'Financiamento',
    [PaymentMethod.INSTALLMENTS]: 'Parcelado',
    [PaymentMethod.MIXED]: 'Misto',
  }
  return labels[method] || method
}

export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
