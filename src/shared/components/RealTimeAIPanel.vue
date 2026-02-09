<template>
  <v-card 
    class="realtime-ai-panel" 
    :elevation="3"
    rounded="lg"
  >
    <!-- Header -->
    <v-card-title class="d-flex align-center py-3 px-4 panel-header">
      <v-icon color="white" class="mr-2">mdi-robot-excited</v-icon>
      <span class="text-white font-weight-bold">Assistente IA</span>
      <v-spacer />
      <v-chip 
        v-if="isAnalyzing" 
        color="white" 
        size="small" 
        variant="flat"
        class="analyzing-chip"
      >
        <v-progress-circular 
          indeterminate 
          size="12" 
          width="2" 
          color="primary"
          class="mr-1"
        />
        Analisando...
      </v-chip>
      <v-chip 
        v-else-if="lastAnalysis" 
        color="white" 
        size="small" 
        variant="flat"
      >
        <v-icon start size="14" color="success">mdi-check-circle</v-icon>
        Pronto
      </v-chip>
    </v-card-title>

    <v-divider />

    <!-- Content -->
    <v-card-text class="pa-0 panel-content">
      <!-- Empty State -->
      <div 
        v-if="!lastAnalysis && !isAnalyzing" 
        class="d-flex flex-column align-center justify-center pa-6 text-center"
      >
        <v-icon size="48" color="grey-lighten-1" class="mb-3">mdi-text-search</v-icon>
        <p class="text-body-2 text-medium-emphasis">
          Comece a digitar no atendimento para receber<br/>
          sugestões em tempo real da IA
        </p>
      </div>

      <div v-else>
        <!-- Summary -->
        <div v-if="lastAnalysis?.summary" class="pa-4 bg-grey-lighten-5">
          <div class="d-flex align-center mb-1">
            <v-icon size="18" color="primary" class="mr-2">mdi-lightbulb</v-icon>
            <span class="text-caption text-uppercase font-weight-bold text-primary">Resumo</span>
          </div>
          <p class="text-body-2 mb-0">{{ lastAnalysis.summary }}</p>
        </div>

        <v-divider />

        <!-- Alerts -->
        <div v-if="lastAnalysis?.alerts?.length" class="pa-4">
          <div class="d-flex align-center mb-3">
            <v-icon size="18" color="warning" class="mr-2">mdi-alert</v-icon>
            <span class="text-caption text-uppercase font-weight-bold text-warning">
              Alertas ({{ lastAnalysis.alerts.length }})
            </span>
          </div>
          <v-alert
            v-for="(alert, index) in lastAnalysis.alerts"
            :key="index"
            type="warning"
            variant="tonal"
            density="compact"
            class="mb-2"
          >
            {{ alert }}
          </v-alert>
        </div>

        <v-divider v-if="lastAnalysis?.alerts?.length" />

        <!-- Detected Information -->
        <div v-if="lastAnalysis?.detected_info?.length" class="pa-4">
          <div class="d-flex align-center mb-3">
            <v-icon size="18" color="info" class="mr-2">mdi-magnify-scan</v-icon>
            <span class="text-caption text-uppercase font-weight-bold text-info">
              Informações Detectadas ({{ lastAnalysis.detected_info.length }})
            </span>
          </div>
          
          <v-list density="compact" class="pa-0 bg-transparent">
            <v-list-item
              v-for="(info, index) in lastAnalysis.detected_info"
              :key="index"
              class="px-0 detected-item"
            >
              <template #prepend>
                <v-icon :color="getConfidenceColor(info.confidence)" size="20">
                  {{ getFieldIcon(info.field) }}
                </v-icon>
              </template>
              <v-list-item-title class="text-body-2 font-weight-medium">
                {{ getFieldLabel(info.field) }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">
                <v-chip size="x-small" :color="getConfidenceColor(info.confidence)" variant="flat">
                  {{ info.value }}
                </v-chip>
                <span class="text-caption text-medium-emphasis ml-1">
                  ({{ Math.round(info.confidence * 100) }}%)
                </span>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </div>

        <v-divider v-if="lastAnalysis?.detected_info?.length" />

        <!-- Suggested Questions -->
        <div v-if="lastAnalysis?.suggested_questions?.length" class="pa-4">
          <div class="d-flex align-center mb-3">
            <v-icon size="18" color="success" class="mr-2">mdi-chat-question</v-icon>
            <span class="text-caption text-uppercase font-weight-bold text-success">
              Perguntas Sugeridas
            </span>
          </div>
          
          <div 
            v-for="(question, index) in sortedQuestions" 
            :key="index"
            class="question-card mb-2 pa-3 rounded"
            :class="[`priority-${question.priority}`, `category-${question.category}`]"
            @click="copyQuestion(question.question)"
          >
            <div class="d-flex align-center mb-1">
              <v-icon size="16" :color="getCategoryColor(question.category)" class="mr-1">
                {{ getCategoryIcon(question.category) }}
              </v-icon>
              <v-chip 
                size="x-small" 
                :color="getCategoryColor(question.category)" 
                variant="flat"
              >
                {{ getCategoryLabel(question.category) }}
              </v-chip>
              <v-spacer />
              <v-icon 
                v-for="i in (4 - question.priority)" 
                :key="i" 
                size="10" 
                color="warning"
              >
                mdi-star
              </v-icon>
            </div>
            <p class="text-body-2 font-weight-medium mb-1">
              "{{ question.question }}"
            </p>
            <p class="text-caption text-medium-emphasis mb-0">
              {{ question.reason }}
            </p>
            <v-tooltip activator="parent" location="bottom">
              Clique para copiar
            </v-tooltip>
          </div>
        </div>

        <v-divider v-if="lastAnalysis?.suggested_questions?.length" />

        <!-- Property Suggestions -->
        <div v-if="lastAnalysis?.property_suggestions?.length" class="pa-4">
          <div class="d-flex align-center mb-3">
            <v-icon size="18" color="secondary" class="mr-2">mdi-home-search</v-icon>
            <span class="text-caption text-uppercase font-weight-bold text-secondary">
              Imóveis Sugeridos ({{ lastAnalysis.property_suggestions.length }})
            </span>
          </div>
          
          <v-card
            v-for="(prop, index) in lastAnalysis.property_suggestions"
            :key="index"
            variant="outlined"
            class="mb-2 property-card"
            @click="$emit('select-property', prop.property_id)"
          >
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-body-2 font-weight-bold">{{ prop.title }}</span>
                <v-chip size="x-small" color="success" variant="flat">
                  {{ Math.round(prop.match_score * 100) }}% match
                </v-chip>
              </div>
              <div class="d-flex align-center text-caption text-medium-emphasis mb-1">
                <v-icon size="14" class="mr-1">mdi-map-marker</v-icon>
                {{ prop.city }}
                <span class="mx-2">•</span>
                <v-icon size="14" class="mr-1">mdi-home</v-icon>
                {{ getPropertyTypeLabel(prop.property_type) }}
              </div>
              <div class="d-flex align-center justify-space-between">
                <span class="text-body-2 font-weight-bold text-success">
                  {{ formatPrice(prop.price) }}
                </span>
                <span class="text-caption text-medium-emphasis">
                  {{ prop.match_reason }}
                </span>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- Detected Intent -->
        <div v-if="lastAnalysis?.detected_intent" class="pa-4 bg-primary-lighten-5">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-target</v-icon>
            <div>
              <span class="text-caption text-uppercase font-weight-bold text-primary">
                Intenção Detectada
              </span>
              <p class="text-body-2 font-weight-bold mb-0">
                {{ getIntentLabel(lastAnalysis.detected_intent) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>

    <!-- Snackbar for copy feedback -->
    <v-snackbar v-model="showCopyFeedback" :timeout="2000" color="success">
      <v-icon start>mdi-check</v-icon>
      Pergunta copiada!
    </v-snackbar>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import {
  realtimeAIService,
  type RealTimeAnalysisResult,
  getFieldIcon,
  getFieldLabel,
  getCategoryIcon,
  getCategoryLabel,
  getCategoryColor,
  getConfidenceColor,
  getPropertyTypeLabel,
  formatPrice,
} from '@/shared/services/realtime-ai.service'

// Props
const props = defineProps<{
  text: string
  clientId?: string
  includeProperties?: boolean
  debounceMs?: number
  disabled?: boolean
}>()

// Emits
const emit = defineEmits<{
  (e: 'analysis-complete', result: RealTimeAnalysisResult): void
  (e: 'select-property', propertyId: string): void
}>()

// State
const lastAnalysis = ref<RealTimeAnalysisResult | null>(null)
const isAnalyzing = ref(false)
const showCopyFeedback = ref(false)

// Computed
const sortedQuestions = computed(() => {
  if (!lastAnalysis.value?.suggested_questions) return []
  return [...lastAnalysis.value.suggested_questions].sort((a, b) => a.priority - b.priority)
})

// Methods
function analyzeText() {
  if (props.disabled || !props.text || props.text.length < 15) {
    return
  }

  isAnalyzing.value = true

  realtimeAIService.analyzeWithDebounce(
    {
      text: props.text,
      client_id: props.clientId,
      include_properties: props.includeProperties ?? true,
    },
    props.debounceMs ?? 800,
    (result) => {
      lastAnalysis.value = result
      isAnalyzing.value = false
      emit('analysis-complete', result)
    },
    (error) => {
      isAnalyzing.value = false
      console.error('Analysis error:', error)
    }
  )
}

function copyQuestion(question: string) {
  navigator.clipboard.writeText(question)
  showCopyFeedback.value = true
}

function getIntentLabel(intent: string): string {
  const labels: Record<string, string> = {
    SCHEDULE_VISIT: '📅 Agendar Visita',
    PRICE_NEGOTIATION: '💰 Negociação de Preço',
    INFORMATION_REQUEST: 'ℹ️ Solicitação de Informações',
    CLOSING: '🤝 Fechamento',
    OBJECTION: '⚠️ Objeção',
  }
  return labels[intent] || intent
}

// Watch for text changes
watch(() => props.text, () => {
  analyzeText()
}, { immediate: true })

// Cleanup
onUnmounted(() => {
  realtimeAIService.cancelPending()
})
</script>

<style scoped>
.realtime-ai-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

.panel-header {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.analyzing-chip {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.detected-item {
  transition: background-color 0.2s ease;
}

.detected-item:hover {
  background-color: rgba(var(--v-theme-info), 0.05);
}

.question-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
}

.question-card:hover {
  transform: translateX(4px);
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.question-card.priority-1 {
  border-left: 3px solid rgb(var(--v-theme-error));
}

.question-card.priority-2 {
  border-left: 3px solid rgb(var(--v-theme-warning));
}

.question-card.priority-3 {
  border-left: 3px solid rgb(var(--v-theme-info));
}

.property-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.property-card:hover {
  border-color: rgb(var(--v-theme-secondary));
  box-shadow: 0 2px 8px rgba(var(--v-theme-secondary), 0.2);
}

/* Custom scrollbar */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: transparent;
}

.panel-content::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}
</style>

