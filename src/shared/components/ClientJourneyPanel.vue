<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center pa-8">
      <v-progress-circular indeterminate size="48" color="primary"></v-progress-circular>
      <div class="text-body-2 mt-4">Analisando jornada do cliente...</div>
    </div>

    <template v-else>
      <!-- Insights Cards -->
      <v-row class="mb-4">
        <!-- Engagement Score -->
        <v-col cols="12" sm="6" md="3">
          <v-card elevation="2" class="h-100">
            <v-card-text class="text-center">
              <v-progress-circular
                :model-value="insights?.engagement_score || 0"
                :size="80"
                :width="8"
                :color="getEngagementColor(insights?.engagement_score || 0)"
              >
                <span class="text-h5 font-weight-bold">{{ insights?.engagement_score || 0 }}</span>
              </v-progress-circular>
              <div class="text-subtitle-2 mt-2">Score de Engajamento</div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Relationship Health -->
        <v-col cols="12" sm="6" md="3">
          <v-card elevation="2" class="h-100">
            <v-card-text class="text-center">
              <v-icon
                :color="getRelationshipHealthColor(insights?.relationship_health || 'UNKNOWN')"
                size="64"
              >
                {{ getRelationshipHealthIcon(insights?.relationship_health || 'UNKNOWN') }}
              </v-icon>
              <div class="text-h6 font-weight-medium mt-2">
                {{ getRelationshipHealthLabel(insights?.relationship_health || 'UNKNOWN') }}
              </div>
              <div class="text-subtitle-2 text-medium-emphasis">Saúde do Relacionamento</div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Journey Stage -->
        <v-col cols="12" sm="6" md="3">
          <v-card elevation="2" class="h-100">
            <v-card-text class="text-center">
              <v-icon color="primary" size="64">mdi-map-marker-path</v-icon>
              <div class="text-h6 font-weight-medium mt-2">
                {{ getJourneyStageLabel(insights?.journey_stage || 'UNKNOWN') }}
              </div>
              <div class="text-subtitle-2 text-medium-emphasis">Estágio da Jornada</div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Sentiment Trend -->
        <v-col cols="12" sm="6" md="3">
          <v-card elevation="2" class="h-100">
            <v-card-text class="text-center">
              <v-icon
                :color="getSentimentColor(insights?.sentiment_trend || 'UNKNOWN')"
                size="64"
              >
                {{ getSentimentIcon(insights?.sentiment_trend || 'UNKNOWN') }}
              </v-icon>
              <div class="text-h6 font-weight-medium mt-2">
                {{ getSentimentLabel(insights?.sentiment_trend || 'UNKNOWN') }}
              </div>
              <div class="text-subtitle-2 text-medium-emphasis">Tendência de Sentimento</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Stats Row -->
      <v-row class="mb-4">
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
              <div class="text-caption">Visitas</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-card variant="tonal" :color="insights?.days_since_contact && insights.days_since_contact > 7 ? 'warning' : 'grey'">
            <v-card-text class="text-center pa-3">
              <div class="text-h5 font-weight-bold">{{ insights?.days_since_contact ?? '-' }}</div>
              <div class="text-caption">Dias s/ Contato</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-card variant="tonal" color="primary">
            <v-card-text class="text-center pa-3">
              <div class="text-h5 font-weight-bold">{{ insights?.avg_ai_lead_score?.toFixed(0) || '-' }}</div>
              <div class="text-caption">Lead Score IA</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-card variant="tonal" :color="insights?.no_show_visits && insights.no_show_visits > 0 ? 'error' : 'grey'">
            <v-card-text class="text-center pa-3">
              <div class="text-h5 font-weight-bold">{{ insights?.no_show_visits || 0 }}</div>
              <div class="text-caption">Não Compareceu</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6" sm="4" md="2">
          <v-card variant="tonal" color="secondary">
            <v-card-text class="text-center pa-3">
              <div class="text-h5 font-weight-bold">{{ insights?.most_common_intent || '-' }}</div>
              <div class="text-caption">Intenção Principal</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Next Actions -->
      <v-card v-if="nextActions.length > 0" elevation="2" class="mb-4">
        <v-card-title class="d-flex align-center pa-4 border-b">
          <v-icon class="mr-2" color="primary">mdi-lightning-bolt</v-icon>
          Próximas Ações Recomendadas
        </v-card-title>
        <v-card-text class="pa-0">
          <v-list>
            <v-list-item
              v-for="(action, index) in nextActions"
              :key="index"
              class="border-b"
            >
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
                  {{ action.suggested_channel }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <!-- AI Analysis -->
      <v-card v-if="analysis" elevation="2" class="mb-4">
        <v-card-title class="d-flex align-center pa-4 border-b">
          <v-icon class="mr-2" color="purple">mdi-robot</v-icon>
          Análise da IA
          <v-spacer></v-spacer>
          <v-btn variant="tonal" size="small" color="primary" @click="loadAnalysis" :loading="isLoadingAnalysis">
            <v-icon start>mdi-refresh</v-icon>
            Atualizar
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-4">
          <div class="analysis-content" v-html="formatMarkdown(analysis)"></div>
        </v-card-text>
      </v-card>

      <!-- Timeline -->
      <v-card elevation="2">
        <v-card-title class="d-flex align-center pa-4 border-b">
          <v-icon class="mr-2" color="primary">mdi-timeline</v-icon>
          Timeline do Cliente
          <v-spacer></v-spacer>
          <v-chip variant="tonal" size="small">
            {{ timeline.length }} eventos
          </v-chip>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-timeline align="start" density="compact" side="end">
            <v-timeline-item
              v-for="event in timeline"
              :key="event.id"
              :dot-color="getEventTypeColor(event.event_type)"
              size="small"
            >
              <template #icon>
                <v-icon size="16" color="white">{{ getEventTypeIcon(event.event_type) }}</v-icon>
              </template>
              
              <div class="d-flex align-start">
                <div class="flex-grow-1">
                  <div class="d-flex align-center mb-1">
                    <span class="font-weight-medium">{{ event.title }}</span>
                    <v-chip
                      v-if="event.ai_generated"
                      variant="tonal"
                      size="x-small"
                      color="purple"
                      class="ml-2"
                    >
                      <v-icon start size="10">mdi-robot</v-icon>
                      IA
                    </v-chip>
                    <v-chip
                      v-if="event.importance >= 4"
                      variant="tonal"
                      size="x-small"
                      color="warning"
                      class="ml-1"
                    >
                      <v-icon size="10">mdi-star</v-icon>
                    </v-chip>
                  </div>
                  <div v-if="event.description" class="text-body-2 text-medium-emphasis mb-1">
                    {{ event.description }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ formatDateTime(event.created_at) }}
                  </div>
                </div>
              </div>
            </v-timeline-item>
          </v-timeline>

          <div v-if="timeline.length === 0" class="text-center py-8">
            <v-icon size="48" color="grey-lighten-1">mdi-timeline-outline</v-icon>
            <div class="text-body-1 text-medium-emphasis mt-2">Nenhum evento na timeline</div>
          </div>
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
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

// Methods
const loadData = async () => {
  isLoading.value = true
  try {
    const [insightsData, actionsData, timelineData] = await Promise.all([
      journeyService.getInsights(props.clientId),
      journeyService.getNextActions(props.clientId),
      journeyService.getTimeline(props.clientId, { limit: 30 }),
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
    DECLINING: 'Declinando',
    UNKNOWN: 'Desconhecido',
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

