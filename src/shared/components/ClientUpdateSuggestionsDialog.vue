<template>
  <v-dialog v-model="dialogOpen" max-width="600" persistent>
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center pa-4 bg-primary">
        <v-icon color="white" class="mr-3">mdi-robot-happy</v-icon>
        <span class="text-white">Sugestões da IA</span>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-alert type="info" variant="tonal" class="mb-4">
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-lightbulb</v-icon>
            <div>
              Com base no atendimento concluído, a IA identificou informações que podem atualizar o perfil do cliente.
              Deseja aplicar as alterações sugeridas?
            </div>
          </div>
        </v-alert>

        <!-- Client Info -->
        <div v-if="client" class="d-flex align-center mb-4 pa-3 bg-grey-lighten-4 rounded-lg">
          <v-avatar color="primary" size="40" class="mr-3">
            <span class="text-white">{{ getInitials(client.name) }}</span>
          </v-avatar>
          <div>
            <div class="font-weight-medium">{{ client.name }}</div>
            <div v-if="client.email" class="text-caption text-medium-emphasis">{{ client.email }}</div>
          </div>
        </div>

        <!-- Suggestions List -->
        <div class="suggestions-list">
          <div
            v-for="suggestion in suggestions"
            :key="suggestion.field"
            class="suggestion-item mb-3"
          >
            <v-card variant="outlined" :class="{ 'border-primary': suggestion.selected }">
              <v-card-text class="pa-3">
                <div class="d-flex align-start">
                  <v-checkbox
                    v-model="suggestion.selected"
                    hide-details
                    class="mt-0 pt-0"
                  ></v-checkbox>
                  <div class="flex-grow-1 ml-2">
                    <div class="d-flex align-center justify-space-between mb-2">
                      <div class="d-flex align-center">
                        <v-icon :color="suggestion.selected ? 'primary' : 'grey'" size="20" class="mr-2">
                          {{ getFieldIcon(suggestion.field) }}
                        </v-icon>
                        <span class="font-weight-medium">{{ getFieldLabel(suggestion.field) }}</span>
                      </div>
                      <v-chip
                        v-if="suggestion.confidence"
                        :color="getConfidenceColor(suggestion.confidence)"
                        variant="tonal"
                        size="x-small"
                      >
                        {{ Math.round(suggestion.confidence * 100) }}% confiança
                      </v-chip>
                    </div>

                    <div class="d-flex align-center ga-2">
                      <!-- Current Value -->
                      <div class="suggestion-value current">
                        <div class="text-caption text-medium-emphasis mb-1">Valor Atual</div>
                        <v-chip variant="outlined" size="small">
                          {{ formatValue(suggestion.field, suggestion.currentValue) || 'Não definido' }}
                        </v-chip>
                      </div>

                      <v-icon color="primary" size="20">mdi-arrow-right</v-icon>

                      <!-- Suggested Value -->
                      <div class="suggestion-value suggested">
                        <div class="text-caption text-medium-emphasis mb-1">Sugerido</div>
                        <v-chip color="primary" variant="flat" size="small">
                          {{ formatValue(suggestion.field, suggestion.suggestedValue) }}
                        </v-chip>
                      </div>
                    </div>

                    <!-- Reason -->
                    <div v-if="suggestion.reason" class="text-caption text-medium-emphasis mt-2">
                      <v-icon size="12" class="mr-1">mdi-information</v-icon>
                      {{ suggestion.reason }}
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="suggestions.length === 0" class="text-center py-4">
          <v-icon color="grey" size="48" class="mb-2">mdi-check-circle</v-icon>
          <div class="text-body-1 text-medium-emphasis">
            Nenhuma sugestão de atualização identificada.
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-btn variant="text" @click="handleSkip">
          Ignorar
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="selectAll"
          :disabled="suggestions.length === 0"
        >
          {{ allSelected ? 'Desmarcar Todas' : 'Selecionar Todas' }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-check"
          :disabled="!hasSelectedSuggestions"
          :loading="isApplying"
          @click="handleApply"
        >
          Aplicar Selecionadas
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { clientsService, type Client, type ClientUpdate } from '@/shared/services/clients.service'

interface Suggestion {
  field: keyof ClientUpdate
  currentValue: string | null
  suggestedValue: string
  reason?: string
  confidence?: number
  selected: boolean
}

interface AISummaryProps {
  interest_type_detected?: string | null
  urgency_level_detected?: string | null
  budget_min_detected?: number | null
  budget_max_detected?: number | null
  lead_score_suggested?: number | null
  detected_intent?: string | null
  key_points?: {
    city?: string | null
    property_type?: string | null
    topics?: string[]
    requirements?: string[]
    mentions?: string[]
  } | null
}

interface Props {
  modelValue: boolean
  client: Client | null
  aiSummary: AISummaryProps | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'applied': [updatedClient: Client]
  'skipped': []
}>()

// State
const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const suggestions = ref<Suggestion[]>([])
const isApplying = ref(false)

// Computed
const hasSelectedSuggestions = computed(() => suggestions.value.some(s => s.selected))
const allSelected = computed(() => suggestions.value.length > 0 && suggestions.value.every(s => s.selected))

// Watch for changes to generate suggestions
watch(
  () => [props.modelValue, props.client, props.aiSummary],
  () => {
    if (props.modelValue && props.client && props.aiSummary) {
      generateSuggestions()
    }
  },
  { immediate: true }
)

// Methods
const generateSuggestions = () => {
  if (!props.client || !props.aiSummary) {
    suggestions.value = []
    return
  }

  const newSuggestions: Suggestion[] = []
  const ai = props.aiSummary
  const c = props.client

  // Extract city and property_type from key_points if available
  const detectedCity = ai.key_points?.city || null
  const detectedPropertyType = ai.key_points?.property_type || null

  // City of Interest
  if (detectedCity && detectedCity !== c.current_city_interest) {
    newSuggestions.push({
      field: 'current_city_interest',
      currentValue: c.current_city_interest,
      suggestedValue: detectedCity,
      reason: 'Cidade mencionada no atendimento',
      confidence: 0.85,
      selected: true,
    })
  }

  // Property Type
  if (detectedPropertyType && detectedPropertyType !== c.current_property_type) {
    newSuggestions.push({
      field: 'current_property_type',
      currentValue: c.current_property_type,
      suggestedValue: detectedPropertyType,
      reason: 'Tipo de imóvel identificado no atendimento',
      confidence: 0.9,
      selected: true,
    })
  }

  // Interest Type
  const interestType = ai.interest_type_detected || null
    
  if (interestType && interestType !== c.current_interest_type) {
    newSuggestions.push({
      field: 'current_interest_type',
      currentValue: c.current_interest_type,
      suggestedValue: interestType,
      reason: 'Tipo de interesse detectado no atendimento',
      confidence: 0.9,
      selected: true,
    })
  }

  // Urgency Level
  const urgencyLevel = ai.urgency_level_detected || null
    
  if (urgencyLevel && urgencyLevel !== c.current_urgency_level) {
    newSuggestions.push({
      field: 'current_urgency_level',
      currentValue: c.current_urgency_level,
      suggestedValue: urgencyLevel,
      reason: 'Nível de urgência detectado no atendimento',
      confidence: 0.8,
      selected: true,
    })
  }

  // Budget Min
  if (ai.budget_min_detected && (!c.current_budget_min || parseFloat(c.current_budget_min) !== ai.budget_min_detected)) {
    newSuggestions.push({
      field: 'current_budget_min',
      currentValue: c.current_budget_min,
      suggestedValue: String(ai.budget_min_detected),
      reason: 'Orçamento mínimo identificado',
      confidence: 0.75,
      selected: true,
    })
  }

  // Budget Max
  if (ai.budget_max_detected && (!c.current_budget_max || parseFloat(c.current_budget_max) !== ai.budget_max_detected)) {
    newSuggestions.push({
      field: 'current_budget_max',
      currentValue: c.current_budget_max,
      suggestedValue: String(ai.budget_max_detected),
      reason: 'Orçamento máximo identificado',
      confidence: 0.75,
      selected: true,
    })
  }

  // Lead Score
  if (ai.lead_score_suggested && ai.lead_score_suggested !== c.current_lead_score) {
    newSuggestions.push({
      field: 'current_lead_score',
      currentValue: c.current_lead_score ? String(c.current_lead_score) : null,
      suggestedValue: String(ai.lead_score_suggested),
      reason: 'Lead Score calculado pela IA',
      confidence: 0.85,
      selected: true,
    })
  }

  // Status - determinar baseado no contexto
  const suggestedStatus = determineSuggestedStatus(c, ai)
  if (suggestedStatus && suggestedStatus !== c.current_status) {
    newSuggestions.push({
      field: 'current_status',
      currentValue: c.current_status,
      suggestedValue: suggestedStatus,
      reason: 'Status atualizado baseado no atendimento',
      confidence: 0.8,
      selected: true,
    })
  }

  suggestions.value = newSuggestions
}

const determineSuggestedStatus = (client: Client, ai: AISummaryProps): string | null => {
  const current = client.current_status
  const intent = ai.detected_intent
  
  // Status progression order
  const statusOrder: Record<string, number> = {
    NEW_LEAD: 1,
    CONTACTED: 2,
    QUALIFIED: 3,
    VISIT_SCHEDULED: 4,
    VISITING: 5,
    PROPOSAL_SENT: 6,
    NEGOTIATING: 7,
    WON: 10,
    LOST: 10,
    INACTIVE: 0,
  }
  
  const currentOrder = statusOrder[current || 'NEW_LEAD'] || 0
  
  // If NEW_LEAD, move to CONTACTED
  if (!current || current === 'NEW_LEAD') {
    return 'CONTACTED'
  }
  
  // If CONTACTED and detected interest/budget, move to QUALIFIED
  if (current === 'CONTACTED') {
    if (ai.interest_type_detected || ai.budget_min_detected || ai.budget_max_detected) {
      return 'QUALIFIED'
    }
  }
  
  // If intent is SCHEDULE_VISIT
  if (intent === 'SCHEDULE_VISIT' && currentOrder < statusOrder['VISIT_SCHEDULED']) {
    return 'VISIT_SCHEDULED'
  }
  
  // If intent is PRICE_NEGOTIATION
  if (intent === 'PRICE_NEGOTIATION' && currentOrder < statusOrder['NEGOTIATING']) {
    return 'NEGOTIATING'
  }
  
  return null
}

const getFieldIcon = (field: string): string => {
  const icons: Record<string, string> = {
    current_city_interest: 'mdi-map-marker',
    current_property_type: 'mdi-home-variant',
    current_interest_type: 'mdi-handshake',
    current_urgency_level: 'mdi-alert-circle',
    current_budget_min: 'mdi-currency-usd',
    current_budget_max: 'mdi-currency-usd-off',
    current_status: 'mdi-flag',
    current_lead_score: 'mdi-star',
  }
  return icons[field] || 'mdi-information'
}

const getFieldLabel = (field: string): string => {
  const labels: Record<string, string> = {
    current_city_interest: 'Cidade de Interesse',
    current_property_type: 'Tipo de Imóvel',
    current_interest_type: 'Tipo de Interesse',
    current_urgency_level: 'Urgência',
    current_budget_min: 'Orçamento Mínimo',
    current_budget_max: 'Orçamento Máximo',
    current_status: 'Status',
    current_lead_score: 'Lead Score',
  }
  return labels[field] || field
}

const formatValue = (field: string, value: string | null | undefined): string => {
  if (!value) return ''

  const translations: Record<string, Record<string, string>> = {
    current_interest_type: {
      BUY: 'Comprar',
      RENT: 'Alugar',
      SELL: 'Vender',
      INVEST: 'Investir',
    },
    current_urgency_level: {
      LOW: 'Baixa',
      MEDIUM: 'Média',
      HIGH: 'Alta',
      IMMEDIATE: 'Imediata',
    },
    current_property_type: {
      HOUSE: 'Casa',
      APARTMENT: 'Apartamento',
      LAND: 'Terreno',
      COMMERCIAL: 'Comercial',
      RURAL: 'Rural',
    },
    current_status: {
      NEW_LEAD: 'Novo Lead',
      CONTACTED: 'Contatado',
      QUALIFIED: 'Qualificado',
      VISIT_SCHEDULED: 'Visita Agendada',
      VISITING: 'Em Visita',
      PROPOSAL_SENT: 'Proposta Enviada',
      NEGOTIATING: 'Negociando',
      WON: 'Fechado',
      LOST: 'Perdido',
      INACTIVE: 'Inativo',
    },
  }

  if (translations[field] && translations[field][value]) {
    return translations[field][value]
  }

  // Format budget values
  if (field === 'current_budget_min' || field === 'current_budget_max') {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    }
  }

  // Format lead score
  if (field === 'current_lead_score') {
    return `${value} pontos`
  }

  return value
}

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.9) return 'success'
  if (confidence >= 0.7) return 'info'
  if (confidence >= 0.5) return 'warning'
  return 'grey'
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const selectAll = () => {
  const newValue = !allSelected.value
  suggestions.value.forEach(s => (s.selected = newValue))
}

const handleSkip = () => {
  dialogOpen.value = false
  emit('skipped')
}

const handleApply = async () => {
  if (!props.client || !hasSelectedSuggestions.value) return

  isApplying.value = true
  try {
    // Build update object from selected suggestions
    const updateData: ClientUpdate = {}
    
    suggestions.value
      .filter(s => s.selected)
      .forEach(s => {
        (updateData as Record<string, string>)[s.field] = s.suggestedValue
      })

    // Apply updates
    const updatedClient = await clientsService.updateClient(props.client.id, updateData)

    dialogOpen.value = false
    emit('applied', updatedClient)
  } catch (error: any) {
    console.error('Error applying suggestions:', error)
    alert(`Erro ao aplicar sugestões: ${error.message}`)
  } finally {
    isApplying.value = false
  }
}
</script>

<style scoped>
.suggestions-list {
  max-height: 400px;
  overflow-y: auto;
}

.suggestion-item .v-card {
  transition: border-color 0.2s ease;
}

.suggestion-item .v-card.border-primary {
  border-color: rgb(var(--v-theme-primary)) !important;
}

.suggestion-value {
  min-width: 100px;
}

.suggestion-value.current .v-chip {
  opacity: 0.7;
}
</style>

