<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center pa-8">
      <v-progress-circular indeterminate size="48" color="primary"></v-progress-circular>
      <div class="text-body-2 mt-4">Carregando informações da jornada do cliente...</div>
    </div>

    <template v-else>
      <!-- Header com explicação -->
      <v-alert type="info" variant="tonal" class="mb-4" density="compact">
        <div class="d-flex align-center">

          <div>
            <strong>O que é a Jornada do Cliente?</strong>
            <div class="text-caption mt-1">
              Esta página mostra um resumo completo da interação com o cliente, incluindo métricas de engajamento,
              estágio atual da negociação, ações recomendadas e histórico de eventos importantes.
            </div>
          </div>
        </div>
      </v-alert>

      <!-- Métricas Principais -->
      <v-card elevation="2" class="mb-4">
        <v-card-title class="pa-4 border-b">
          <v-icon class="mr-2" color="primary">mdi-chart-line</v-icon>
          Métricas Principais
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <!-- Engagement Score -->
            <v-col cols="12" sm="6" md="3">
              <v-card variant="outlined" class="h-100">
                <v-card-text class="text-center">
                  <v-progress-circular :model-value="insights?.engagement_score || 0" :size="80" :width="8"
                    :color="getEngagementColor(insights?.engagement_score || 0)">
                    <span class="text-h5 font-weight-bold">{{ insights?.engagement_score || 0 }}</span>
                  </v-progress-circular>
                  <div class="text-subtitle-2 mt-2 font-weight-medium">Nível de Engajamento</div>
                  <div class="text-caption text-medium-emphasis mt-1">
                    Quão ativo o cliente está no processo
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Relationship Health -->
            <v-col cols="12" sm="6" md="3">
              <v-card variant="outlined" class="h-100">
                <v-card-text class="text-center">
                  <v-icon :color="getRelationshipHealthColor(insights?.relationship_health || 'UNKNOWN')" size="64">
                    {{ getRelationshipHealthIcon(insights?.relationship_health || 'UNKNOWN') }}
                  </v-icon>
                  <div class="text-h6 font-weight-medium mt-2">
                    {{ getRelationshipHealthLabel(insights?.relationship_health || 'UNKNOWN') }}
                  </div>
                  <div class="text-subtitle-2 text-medium-emphasis">Qualidade do Relacionamento</div>
                  <div class="text-caption text-medium-emphasis mt-1">
                    Estado atual da relação com o cliente
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Journey Stage -->
            <v-col cols="12" sm="6" md="3">
              <v-card variant="outlined" class="h-100">
                <v-card-text class="text-center">
                  <v-icon color="primary" size="64">mdi-map-marker-path</v-icon>
                  <div class="text-h6 font-weight-medium mt-2">
                    {{ getJourneyStageLabel(insights?.journey_stage || 'UNKNOWN') }}
                  </div>
                  <div class="text-subtitle-2 text-medium-emphasis">Fase Atual</div>
                  <div class="text-caption text-medium-emphasis mt-1">
                    Em que etapa da negociação estamos
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Sentiment Trend -->
            <v-col cols="12" sm="6" md="3">
              <v-card variant="outlined" class="h-100">
                <v-card-text class="text-center">
                  <v-icon :color="getSentimentColor(insights?.sentiment_trend || 'UNKNOWN')" size="64">
                    {{ getSentimentIcon(insights?.sentiment_trend || 'UNKNOWN') }}
                  </v-icon>
                  <div class="text-h6 font-weight-medium mt-2">
                    {{ getSentimentLabel(insights?.sentiment_trend || 'UNKNOWN') }}
                  </div>
                  <div class="text-subtitle-2 text-medium-emphasis">Tendência</div>
                  <div class="text-caption text-medium-emphasis mt-1">
                    Como o cliente está reagindo
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Estatísticas Rápidas -->
      <v-card elevation="2" class="mb-4">
        <v-card-title class="pa-4 border-b">
          <v-icon class="mr-2" color="primary">mdi-chart-box</v-icon>
          Estatísticas Rápidas
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="6" sm="4" md="2">
              <v-card variant="tonal" color="info">
                <v-card-text class="text-center pa-3">
                  <div class="text-h5 font-weight-bold">{{ insights?.total_attendances || 0 }}</div>
                  <div class="text-caption">Atendimentos</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6" sm="4" md="2">
              <v-card variant="tonal" color="success">
                <v-card-text class="text-center pa-3">
                  <div class="text-h5 font-weight-bold">{{ insights?.completed_visits || 0 }}</div>
                  <div class="text-caption">Visitas Realizadas</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6" sm="4" md="2">
              <v-card variant="tonal"
                :color="insights?.days_since_contact && insights.days_since_contact > 7 ? 'warning' : 'grey'">
                <v-card-text class="text-center pa-3">
                  <div class="text-h5 font-weight-bold">{{ insights?.days_since_contact ?? '-' }}</div>
                  <div class="text-caption">Dias sem Contato</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6" sm="4" md="2">
              <v-card variant="tonal"
                :color="insights?.no_show_visits && insights.no_show_visits > 0 ? 'error' : 'grey'">
                <v-card-text class="text-center pa-3">
                  <div class="text-h5 font-weight-bold">{{ insights?.no_show_visits || 0 }}</div>
                  <div class="text-caption">Faltas em Visitas</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6" sm="4" md="2">
              <v-card variant="tonal" color="primary">
                <v-card-text class="text-center pa-3">
                  <div class="text-h5 font-weight-bold">{{ insights?.avg_ai_lead_score?.toFixed(0) || '-' }}</div>
                  <div class="text-caption">Pontuação</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6" sm="4" md="2">
              <v-card variant="tonal" color="secondary">
                <v-card-text class="text-center pa-3">
                  <div class="text-h6 font-weight-bold">{{ getIntentLabel(insights?.most_common_intent) }}</div>
                  <div class="text-caption">Interesse Principal</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Próximas Ações Recomendadas -->
      <v-card v-if="nextActions.length > 0" elevation="2" class="mb-4">
        <v-card-title class="d-flex align-center pa-4 border-b">
          <v-icon class="mr-2" color="primary">mdi-lightning-bolt</v-icon>
          Próximas Ações Recomendadas
          <v-spacer></v-spacer>
          <v-chip variant="tonal" size="small" color="primary">
            {{ nextActions.length }} ação{{ nextActions.length > 1 ? 'ões' : '' }}
          </v-chip>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-list>
            <v-list-item v-for="(action, index) in nextActions" :key="index" class="border-b">
              <template #prepend>
                <v-chip :color="getPriorityColor(action.priority)" variant="flat" size="small" class="mr-3">
                  {{ action.priority === 'HIGH' ? 'ALTA' : action.priority === 'MEDIUM' ? 'MÉDIA' : 'BAIXA' }}
                </v-chip>
              </template>
              <v-list-item-title class="font-weight-medium">{{ action.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ action.description }}</v-list-item-subtitle>
              <template #append>
                <v-chip v-if="action.suggested_channel" variant="tonal" size="small">
                  <v-icon start size="14">{{ getChannelIcon(action.suggested_channel) }}</v-icon>
                  {{ getChannelLabel(action.suggested_channel) }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <!-- Análise Detalhada (Opcional) -->
      <v-card v-if="showAnalysisSection" elevation="2" class="mb-4">
        <v-card-title class="d-flex align-center pa-4 border-b">
          <v-icon class="mr-2" color="purple">mdi-robot</v-icon>
          Análise Detalhada
          <v-spacer></v-spacer>
          <v-btn v-if="!analysis" variant="tonal" size="small" color="primary" @click="loadAnalysis"
            :loading="isLoadingAnalysis">
            <v-icon start>mdi-refresh</v-icon>
            Gerar Análise
          </v-btn>
          <v-btn v-else variant="tonal" size="small" color="primary" @click="loadAnalysis" :loading="isLoadingAnalysis">
            <v-icon start>mdi-refresh</v-icon>
            Atualizar
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-4">
          <div v-if="analysis" class="analysis-content" v-html="formatMarkdown(analysis)"></div>
          <div v-else class="text-center py-4">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-robot-outline</v-icon>
            <div class="text-body-2 text-medium-emphasis">
              Clique em "Gerar Análise" para obter uma análise detalhada da jornada do cliente
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Histórico de Eventos Importantes -->
      <v-card elevation="2">
        <v-card-title class="d-flex align-center pa-4 border-b">
          <v-icon class="mr-2" color="primary">mdi-history</v-icon>
          Histórico de Eventos Importantes
          <v-spacer></v-spacer>
          <v-chip variant="tonal" size="small">
            {{ filteredTimeline.length }} evento{{ filteredTimeline.length !== 1 ? 's' : '' }}
          </v-chip>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-timeline align="start" density="compact" side="end">
            <v-timeline-item v-for="event in filteredTimeline" :key="event.id"
              :dot-color="getEventTypeColor(event.event_type)" size="small">
              <template #icon>
                <v-icon size="16" color="white">{{ getEventTypeIcon(event.event_type) }}</v-icon>
              </template>

              <div class="d-flex align-start">
                <div class="flex-grow-1">
                  <div class="d-flex align-center mb-1">
                    <span class="font-weight-medium">{{ formatEventTitle(event) }}</span>
                    <v-chip v-if="event.importance >= 4" variant="tonal" size="x-small" color="warning" class="ml-2">
                      <v-icon size="10">mdi-star</v-icon>
                      Importante
                    </v-chip>
                  </div>
                  <div v-if="formatEventDescription(event)" class="text-body-2 text-medium-emphasis mb-1">
                    {{ formatEventDescription(event) }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ formatDateTime(event.created_at) }}
                  </div>
                </div>
              </div>
            </v-timeline-item>
          </v-timeline>

          <div v-if="filteredTimeline.length === 0" class="text-center py-8">
            <v-icon size="48" color="grey-lighten-1">mdi-history</v-icon>
            <div class="text-body-1 text-medium-emphasis mt-2">Nenhum evento registrado ainda</div>
            <div class="text-caption text-medium-emphasis mt-1">
              Os eventos importantes aparecerão aqui conforme você interage com o cliente
            </div>
          </div>
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import {
  journeyService,
  type JourneyInsights,
  type NextAction,
  type TimelineEvent,
  type TimelineEventType,
  getEventTypeLabel,
  getEventTypeIcon,
  getEventTypeColor,
  getRelationshipHealthColor,
  getRelationshipHealthLabel,
  getJourneyStageLabel,
  getPriorityColor,
} from '@/shared/services/journey.service'

const props = defineProps<{
  clientId: string
}>()

// State
const isLoading = ref(true)
const isLoadingAnalysis = ref(false)
const insights = ref<JourneyInsights | null>(null)
const nextActions = ref<NextAction[]>([])
const timeline = ref<TimelineEvent[]>([])
const analysis = ref<string>('')
const showAnalysisSection = ref(false) // Oculto por padrão, pode ser ativado se necessário

// Eventos técnicos de IA que devem ser filtrados ou simplificados
const TECHNICAL_AI_EVENTS: TimelineEventType[] = [
  'AI_INSIGHT_GENERATED',
  'AI_SUGGESTION_APPLIED',
  'CLIENT_UPDATED_BY_AI',
]

// Filtrar timeline para remover eventos técnicos de IA ou simplificá-los
const filteredTimeline = computed(() => {
  return timeline.value
    .filter(event => {
      // Remover eventos técnicos de IA que não agregam valor para o usuário
      if (TECHNICAL_AI_EVENTS.includes(event.event_type as TimelineEventType)) {
        return false
      }
      return true
    })
    .slice(0, 20) // Limitar a 20 eventos mais recentes
})

// Methods
const loadData = async () => {
  isLoading.value = true
  try {
    const [insightsData, actionsData, timelineData] = await Promise.all([
      journeyService.getInsights(props.clientId),
      journeyService.getNextActions(props.clientId),
      journeyService.getTimeline(props.clientId, { limit: 50 }),
    ])

    insights.value = insightsData
    nextActions.value = actionsData
    timeline.value = timelineData
  } catch (error) {
    console.error('Error loading journey data:', error)
  } finally {
    isLoading.value = false
  }
}

const loadAnalysis = async () => {
  isLoadingAnalysis.value = true
  try {
    const result = await journeyService.getJourneyAnalysis(props.clientId)
    analysis.value = result.analysis
    showAnalysisSection.value = true
  } catch (error) {
    console.error('Error loading analysis:', error)
  } finally {
    isLoadingAnalysis.value = false
  }
}

// Helper functions
const getEngagementColor = (score: number): string => {
  if (score >= 70) return 'success'
  if (score >= 50) return 'info'
  if (score >= 30) return 'warning'
  return 'error'
}

const getRelationshipHealthIcon = (health: string): string => {
  const icons: Record<string, string> = {
    EXCELLENT: 'mdi-heart',
    GOOD: 'mdi-heart-half-full',
    NEEDS_ATTENTION: 'mdi-alert-circle',
    AT_RISK: 'mdi-heart-broken',
    UNKNOWN: 'mdi-help-circle',
  }
  return icons[health] || 'mdi-help-circle'
}

const getSentimentColor = (trend: string): string => {
  const colors: Record<string, string> = {
    IMPROVING: 'success',
    STABLE: 'info',
    DECLINING: 'error',
    UNKNOWN: 'grey',
  }
  return colors[trend] || 'grey'
}

const getSentimentIcon = (trend: string): string => {
  const icons: Record<string, string> = {
    IMPROVING: 'mdi-trending-up',
    STABLE: 'mdi-trending-neutral',
    DECLINING: 'mdi-trending-down',
    UNKNOWN: 'mdi-help-circle',
  }
  return icons[trend] || 'mdi-help-circle'
}

const getSentimentLabel = (trend: string): string => {
  const labels: Record<string, string> = {
    IMPROVING: 'Melhorando',
    STABLE: 'Estável',
    DECLINING: 'Preocupante',
    UNKNOWN: 'Indefinido',
  }
  return labels[trend] || trend
}

const getChannelIcon = (channel: string): string => {
  const icons: Record<string, string> = {
    WHATSAPP: 'mdi-whatsapp',
    PHONE: 'mdi-phone',
    EMAIL: 'mdi-email',
  }
  return icons[channel] || 'mdi-message'
}

const getChannelLabel = (channel: string): string => {
  const labels: Record<string, string> = {
    WHATSAPP: 'WhatsApp',
    PHONE: 'Telefone',
    EMAIL: 'E-mail',
  }
  return labels[channel] || channel
}

const getIntentLabel = (intent: string | null | undefined): string => {
  if (!intent) return '-'
  const labels: Record<string, string> = {
    PROPERTY_SEARCH: 'Busca de Imóvel',
    INFORMATION_REQUEST: 'Solicitação de Informação',
    SCHEDULE_VISIT: 'Agendar Visita',
    PRICE_NEGOTIATION: 'Negociação',
    DOCUMENTATION_REQUEST: 'Documentação',
    GENERAL_INQUIRY: 'Consulta Geral',
    COMPLAINT: 'Reclamação',
  }
  return labels[intent] || intent
}

// Formatar título do evento de forma mais amigável
const formatEventTitle = (event: TimelineEvent): string => {
  // Se o título já está em português e claro, usar diretamente
  if (event.title && !event.title.includes('AI') && !event.title.includes('IA gerou')) {
    return event.title
  }

  // Traduzir tipos de eventos técnicos
  const titleMap: Record<string, string> = {
    'CLIENT_CREATED': 'Cliente cadastrado',
    'CLIENT_UPDATED': 'Dados do cliente atualizados',
    'STATUS_CHANGED': 'Status alterado',
    'AGENT_ASSIGNED': 'Corretor atribuído',
    'ATTENDANCE_STARTED': 'Atendimento iniciado',
    'ATTENDANCE_COMPLETED': 'Atendimento concluído',
    'VISIT_SCHEDULED': 'Visita agendada',
    'VISIT_CONFIRMED': 'Visita confirmada',
    'VISIT_COMPLETED': 'Visita realizada',
    'VISIT_CANCELLED': 'Visita cancelada',
    'VISIT_NO_SHOW': 'Cliente não compareceu',
    'PROPOSAL_SENT': 'Proposta enviada',
    'PROPOSAL_ACCEPTED': 'Proposta aceita',
    'PROPOSAL_REJECTED': 'Proposta rejeitada',
    'PRICE_NEGOTIATION': 'Negociação de preço',
    'NOTE_ADDED': 'Nota adicionada',
    'DOCUMENT_UPLOADED': 'Documento anexado',
    'CONTACT_ATTEMPT': 'Tentativa de contato',
    'SALE_COMPLETED': 'Venda concluída',
    'CONTRACT_SIGNED': 'Contrato assinado',
    'SALE_CANCELLED': 'Venda cancelada',
  }

  return titleMap[event.event_type] || event.title || getEventTypeLabel(event.event_type as TimelineEventType)
}

// Formatar descrição do evento removendo dados técnicos
const formatEventDescription = (event: TimelineEvent): string | null => {
  if (!event.description) return null

  // Remover informações técnicas de IA
  let description = event.description
    .replace(/Lead Score: \d+/gi, '')
    .replace(/Sentimento: [A-Z]+/gi, '')
    .replace(/Confidence: [\d.]+/gi, '')
    .replace(/IA gerou.*/gi, '')
    .replace(/AI.*/gi, '')
    .trim()

  // Se a descrição ficou vazia ou muito técnica, retornar null
  if (!description || description.length < 10) {
    return null
  }

  return description
}

const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const formatMarkdown = (text: string): string => {
  if (!text) return ''

  let html = text
    // Headers
    .replace(/^### (.*$)/gim, '<h4 class="text-subtitle-1 font-weight-bold mt-3 mb-1">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 class="text-h6 font-weight-bold mt-4 mb-2">$1</h3>')
    .replace(/^# (.*$)/gim, '<h2 class="text-h5 font-weight-bold mt-4 mb-2">$1</h2>')
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^\d+\.\s+(.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/^[\-\*]\s+(.*$)/gim, '<li class="ml-4">$1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, '<br>')

  return `<p class="mb-2">${html}</p>`
}

// Watch for clientId changes
watch(() => props.clientId, () => {
  loadData()
  analysis.value = ''
  showAnalysisSection.value = false
})

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
}

.analysis-content :deep(h2),
.analysis-content :deep(h3),
.analysis-content :deep(h4) {
  color: rgb(var(--v-theme-primary));
}

.analysis-content :deep(li) {
  margin-bottom: 4px;
}

.analysis-content :deep(strong) {
  color: rgb(var(--v-theme-on-surface));
}
</style>
