/**
 * Real-time AI Assistant Service
 * 
 * Provides real-time analysis during attendances:
 * - Detection of client information (budget, location, preferences)
 * - Property suggestions based on detected interests
 * - Suggested questions for the attendant
 * - Alerts about important information
 */

import api from './api'

// Types
export interface DetectedInfo {
  field: string
  value: string
  confidence: number
  original_text: string
}

export interface PropertySuggestion {
  property_id: string
  title: string
  city: string
  price: number
  property_type: string
  match_reason: string
  match_score: number
}

export interface SuggestedQuestion {
  question: string
  reason: string
  priority: number // 1 = high, 2 = medium, 3 = low
  category: 'qualification' | 'interest' | 'objection' | 'closing'
}

export interface RealTimeAnalysisResult {
  detected_info: DetectedInfo[]
  property_suggestions: PropertySuggestion[]
  suggested_questions: SuggestedQuestion[]
  alerts: string[]
  summary: string
  detected_intent: string | null
}

export interface RealTimeAnalysisRequest {
  text: string
  client_id?: string
  include_properties?: boolean
}

// Service
class RealTimeAIService {
  private debounceTimeout: NodeJS.Timeout | null = null
  private lastText: string = ''
  private lastResult: RealTimeAnalysisResult | null = null

  /**
   * Analyze attendance text in real-time
   */
  async analyzeText(request: RealTimeAnalysisRequest): Promise<RealTimeAnalysisResult> {
    const response = await api.post<RealTimeAnalysisResult>('/ai/realtime/analyze', request)
    this.lastText = request.text
    this.lastResult = response.data
    return response.data
  }

  /**
   * Analyze with debounce to avoid excessive API calls
   * @param request Analysis request
   * @param debounceMs Debounce delay in milliseconds (default: 500)
   * @param onResult Callback when result is ready
   */
  analyzeWithDebounce(
    request: RealTimeAnalysisRequest,
    debounceMs: number = 500,
    onResult: (result: RealTimeAnalysisResult) => void,
    onError?: (error: any) => void
  ): void {
    // Clear previous timeout
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout)
    }

    // Skip if text hasn't changed significantly
    if (this.lastText && this.lastResult) {
      const textDiff = Math.abs(request.text.length - this.lastText.length)
      // Only re-analyze if there's significant change (more than 20 chars or 3+ new words)
      if (textDiff < 20 && !this.hasSignificantChange(this.lastText, request.text)) {
        return
      }
    }

    // Set new timeout
    this.debounceTimeout = setTimeout(async () => {
      try {
        const result = await this.analyzeText(request)
        onResult(result)
      } catch (error) {
        if (onError) {
          onError(error)
        }
        console.error('Real-time analysis error:', error)
      }
    }, debounceMs)
  }

  /**
   * Quick analysis without client context (faster)
   */
  async quickAnalyze(text: string): Promise<Omit<RealTimeAnalysisResult, 'property_suggestions'>> {
    const response = await api.post<Omit<RealTimeAnalysisResult, 'property_suggestions'>>(
      '/ai/realtime/quick-analysis',
      null,
      { params: { text } }
    )
    return response.data
  }

  /**
   * Check if there's a significant change between two texts
   */
  private hasSignificantChange(oldText: string, newText: string): boolean {
    const oldWords = oldText.toLowerCase().split(/\s+/)
    const newWords = newText.toLowerCase().split(/\s+/)
    
    // Check for new important keywords
    const importantKeywords = [
      'comprar', 'alugar', 'vender', 'casa', 'apartamento', 'terreno',
      'urgente', 'imediato', 'financiar', 'mil', 'milhão', 'reais',
      'quartos', 'suíte', 'garagem', 'área',
    ]
    
    for (const word of newWords) {
      if (!oldWords.includes(word) && importantKeywords.some(kw => word.includes(kw))) {
        return true
      }
    }
    
    // Check for numeric values that might be prices
    const newNumbers = newText.match(/\d+/g) || []
    const oldNumbers = oldText.match(/\d+/g) || []
    
    return newNumbers.length > oldNumbers.length
  }

  /**
   * Cancel pending analysis
   */
  cancelPending(): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout)
      this.debounceTimeout = null
    }
  }

  /**
   * Clear cached results
   */
  clearCache(): void {
    this.lastText = ''
    this.lastResult = null
  }
}

// Singleton
export const realtimeAIService = new RealTimeAIService()

// Helper functions
export function getFieldIcon(field: string): string {
  const icons: Record<string, string> = {
    budget: 'mdi-currency-usd',
    budget_min: 'mdi-currency-usd',
    budget_max: 'mdi-currency-usd',
    city: 'mdi-map-marker',
    property_type: 'mdi-home-city',
    interest_type: 'mdi-handshake',
    urgency: 'mdi-alert-circle',
    bedrooms: 'mdi-bed',
    has_financing: 'mdi-bank',
  }
  return icons[field] || 'mdi-information'
}

export function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    budget: 'Orçamento',
    budget_min: 'Orçamento Mínimo',
    budget_max: 'Orçamento Máximo',
    city: 'Cidade/Localização',
    property_type: 'Tipo de Imóvel',
    interest_type: 'Tipo de Interesse',
    urgency: 'Urgência',
    bedrooms: 'Quartos',
    has_financing: 'Financiamento',
  }
  return labels[field] || field
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    qualification: 'mdi-account-check',
    interest: 'mdi-heart',
    objection: 'mdi-shield-alert',
    closing: 'mdi-handshake-outline',
  }
  return icons[category] || 'mdi-help-circle'
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    qualification: 'Qualificação',
    interest: 'Interesse',
    objection: 'Objeção',
    closing: 'Fechamento',
  }
  return labels[category] || category
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    qualification: 'primary',
    interest: 'success',
    objection: 'warning',
    closing: 'info',
  }
  return colors[category] || 'grey'
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(price)
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'success'
  if (confidence >= 0.5) return 'warning'
  return 'error'
}

export function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    HOUSE: 'Casa',
    APARTMENT: 'Apartamento',
    LAND: 'Terreno',
    COMMERCIAL: 'Comercial',
    RURAL: 'Rural',
  }
  return labels[type] || type
}

export default realtimeAIService

