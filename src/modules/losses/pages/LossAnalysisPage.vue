<template>
  <div class="loss-analysis-page">
    <!-- Header -->
    <v-card class="header-card mb-6" rounded="lg" elevation="4">
      <v-card-text class="py-6 px-8">
        <v-row align="center" justify="space-between">
          <v-col cols="12" md="auto">
            <div class="d-flex align-center">
              <v-avatar size="56" class="mr-4 header-icon-avatar">
                <v-icon size="32" color="white">mdi-chart-timeline-variant</v-icon>
              </v-avatar>
              <div>
                <h1 class="text-h4 font-weight-bold text-white mb-1">Análise de Perdas</h1>
                <p class="text-body-1 text-white-alpha mb-0">
                  Entenda padrões e melhore sua taxa de conversão
                </p>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="auto">
            <v-btn-toggle
              v-model="selectedPeriod"
              mandatory
              color="white"
              variant="outlined"
            >
              <v-btn value="30">30 dias</v-btn>
              <v-btn value="90">90 dias</v-btn>
              <v-btn value="180">6 meses</v-btn>
              <v-btn value="365">1 ano</v-btn>
            </v-btn-toggle>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="text-body-1 mt-4 text-medium-emphasis">Analisando padrões de perda com IA...</p>
    </div>

    <!-- Content -->
    <div v-else-if="analysis">
      <!-- Summary Card -->
      <v-card class="mb-6" rounded="lg" elevation="2">
        <v-card-text class="pa-6">
          <div class="d-flex align-center mb-4">
            <v-icon color="primary" size="28" class="mr-3">mdi-robot</v-icon>
            <h2 class="text-h6 font-weight-bold">Resumo da IA</h2>
          </div>
          <p class="text-body-1 text-medium-emphasis mb-4">
            {{ analysis.summary }}
          </p>
          <v-chip
            color="warning"
            variant="tonal"
            class="mr-2"
          >
            {{ analysis.total_losses }} perdas analisadas
          </v-chip>
          <v-chip
            color="info"
            variant="tonal"
          >
            {{ analysis.period_analyzed }}
          </v-chip>
        </v-card-text>
      </v-card>

      <v-row>
        <!-- Top Reasons -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="2" height="100%">
            <v-card-title class="d-flex align-center">
              <v-icon start color="warning">mdi-alert-circle</v-icon>
              Principais Motivos de Perda
            </v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-for="(reason, index) in analysis.top_reasons"
                  :key="index"
                  class="mb-2"
                >
                  <template v-slot:prepend>
                    <v-avatar :color="getReasonColor(index)" size="32" class="mr-3">
                      <span class="text-white font-weight-bold">{{ index + 1 }}</span>
                    </v-avatar>
                  </template>
                  <v-list-item-title class="font-weight-medium">
                    {{ reason.reason }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ reason.count }} casos ({{ reason.percentage }}%)
                  </v-list-item-subtitle>
                  <template v-slot:append>
                    <v-progress-linear
                      :model-value="reason.percentage"
                      :color="getReasonColor(index)"
                      height="8"
                      rounded
                      style="width: 100px"
                    ></v-progress-linear>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Critical Stages -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="2" height="100%">
            <v-card-title class="d-flex align-center">
              <v-icon start color="error">mdi-progress-alert</v-icon>
              Estágios Críticos
            </v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-for="(stage, index) in analysis.critical_stages"
                  :key="index"
                  class="mb-2"
                >
                  <template v-slot:prepend>
                    <v-icon :color="getStageColor(index)" size="24">
                      {{ getStageIcon(stage.stage) }}
                    </v-icon>
                  </template>
                  <v-list-item-title class="font-weight-medium">
                    {{ stage.stage }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ stage.count }} perdas ({{ stage.percentage }}%)
                  </v-list-item-subtitle>
                  <template v-slot:append>
                    <v-progress-linear
                      :model-value="stage.percentage"
                      :color="getStageColor(index)"
                      height="8"
                      rounded
                      style="width: 100px"
                    ></v-progress-linear>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- AI Patterns -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="2" height="100%">
            <v-card-title class="d-flex align-center">
              <v-icon start color="purple">mdi-eye-outline</v-icon>
              Padrões Detectados pela IA
            </v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-for="(pattern, index) in analysis.patterns_detected"
                  :key="index"
                >
                  <template v-slot:prepend>
                    <v-icon color="purple" size="20">mdi-lightbulb</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2">
                    {{ pattern }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
              <div v-if="!analysis.patterns_detected.length" class="text-center text-medium-emphasis pa-4">
                <v-icon size="48" color="grey-lighten-1">mdi-magnify</v-icon>
                <p class="mt-2">Nenhum padrão detectado ainda</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Risk Factors -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="2" height="100%">
            <v-card-title class="d-flex align-center">
              <v-icon start color="error">mdi-alert</v-icon>
              Fatores de Risco
            </v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item
                  v-for="(risk, index) in analysis.risk_factors"
                  :key="index"
                >
                  <template v-slot:prepend>
                    <v-icon color="error" size="20">mdi-alert-circle</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2">
                    {{ risk }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
              <div v-if="!analysis.risk_factors.length" class="text-center text-medium-emphasis pa-4">
                <v-icon size="48" color="grey-lighten-1">mdi-shield-check</v-icon>
                <p class="mt-2">Nenhum fator de risco identificado</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- AI Recommendations -->
        <v-col cols="12">
          <v-card rounded="lg" elevation="2" color="success" variant="tonal">
            <v-card-title class="d-flex align-center">
              <v-icon start color="success">mdi-rocket-launch</v-icon>
              Recomendações da IA para Melhorar Conversão
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col
                  v-for="(rec, index) in analysis.recommendations"
                  :key="index"
                  cols="12"
                  md="6"
                  lg="4"
                >
                  <v-card variant="flat" class="pa-4 h-100">
                    <div class="d-flex align-start">
                      <v-avatar color="success" size="32" class="mr-3">
                        <span class="text-white font-weight-bold">{{ index + 1 }}</span>
                      </v-avatar>
                      <p class="text-body-2 mb-0">{{ rec }}</p>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
              <div v-if="!analysis.recommendations.length" class="text-center py-4">
                <v-icon size="48" color="grey-lighten-1">mdi-lightbulb-outline</v-icon>
                <p class="mt-2 text-medium-emphasis">Nenhuma recomendação disponível ainda</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Success vs Loss Insights -->
        <v-col cols="12" v-if="analysis.success_vs_loss_insights">
          <v-card rounded="lg" elevation="2">
            <v-card-title class="d-flex align-center">
              <v-icon start color="info">mdi-compare</v-icon>
              Comparação: Vendas x Perdas
            </v-card-title>
            <v-card-text>
              <p class="text-body-1">{{ analysis.success_vs_loss_insights }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Recent Losses List -->
      <v-card class="mt-6" rounded="lg" elevation="2">
        <v-card-title class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon start>mdi-history</v-icon>
            Perdas Recentes
          </div>
          <v-btn
            variant="text"
            size="small"
            @click="loadRecentLosses"
            :loading="isLoadingLosses"
          >
            <v-icon start>mdi-refresh</v-icon>
            Atualizar
          </v-btn>
        </v-card-title>
        <v-data-table
          :headers="lossHeaders"
          :items="recentLosses"
          :loading="isLoadingLosses"
          :items-per-page="10"
          hover
        >
          <template v-slot:item.loss_reason="{ item }">
            <v-chip
              :color="getLossReasonColor(item.loss_reason)"
              variant="tonal"
              size="small"
            >
              <v-icon start size="16">{{ getLossReasonIcon(item.loss_reason) }}</v-icon>
              {{ getLossReasonLabel(item.loss_reason) }}
            </v-chip>
          </template>
          <template v-slot:item.loss_stage="{ item }">
            <span class="text-body-2">{{ getLossStageLabel(item.loss_stage) }}</span>
          </template>
          <template v-slot:item.client_name="{ item }">
            <router-link
              v-if="item.client_id"
              :to="`/clients/${item.client_id}`"
              class="text-decoration-none"
            >
              {{ item.client_name || 'Cliente' }}
            </router-link>
            <span v-else>{{ item.client_name || '-' }}</span>
          </template>
          <template v-slot:item.lost_at="{ item }">
            <span class="text-body-2">{{ formatDate(item.lost_at) }}</span>
          </template>
          <template v-slot:item.could_have_been_prevented="{ item }">
            <v-icon
              v-if="item.could_have_been_prevented !== null"
              :color="item.could_have_been_prevented ? 'warning' : 'grey'"
              size="20"
            >
              {{ item.could_have_been_prevented ? 'mdi-alert' : 'mdi-minus' }}
            </v-icon>
            <span v-else class="text-medium-emphasis">-</span>
          </template>
          <template v-slot:no-data>
            <div class="text-center pa-8">
              <v-icon size="48" color="grey-lighten-1">mdi-check-circle</v-icon>
              <p class="text-body-1 mt-2 text-medium-emphasis">
                Nenhuma perda registrada no período
              </p>
            </div>
          </template>
        </v-data-table>
      </v-card>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <v-icon size="80" color="grey-lighten-1">mdi-chart-timeline-variant</v-icon>
      <h3 class="text-h5 mt-4 text-grey">Nenhum dado disponível</h3>
      <p class="text-body-1 text-medium-emphasis">
        Registre perdas de clientes para visualizar análises e padrões.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import {
  lossesService,
  type Loss,
  type LossPatternAnalysis,
  getLossReasonLabel,
  getLossStageLabel,
  getLossReasonColor,
  getLossReasonIcon,
} from '@/shared/services/losses.service'

// State
const analysis = ref<LossPatternAnalysis | null>(null)
const recentLosses = ref<Loss[]>([])
const selectedPeriod = ref('90')
const isLoading = ref(false)
const isLoadingLosses = ref(false)

// Table headers
const lossHeaders = [
  { title: 'Cliente', key: 'client_name' },
  { title: 'Motivo', key: 'loss_reason' },
  { title: 'Estágio', key: 'loss_stage' },
  { title: 'Data', key: 'lost_at', width: '120px' },
  { title: 'Evitável?', key: 'could_have_been_prevented', width: '100px', align: 'center' as const },
]

// Methods
const loadAnalysis = async () => {
  isLoading.value = true
  try {
    analysis.value = await lossesService.analyzePatterns({
      days: parseInt(selectedPeriod.value),
    })
  } catch (error) {
    console.error('Error loading analysis:', error)
  } finally {
    isLoading.value = false
  }
}

const loadRecentLosses = async () => {
  isLoadingLosses.value = true
  try {
    recentLosses.value = await lossesService.listLosses({ limit: 20 })
  } catch (error) {
    console.error('Error loading losses:', error)
  } finally {
    isLoadingLosses.value = false
  }
}

// Helpers
const getReasonColor = (index: number): string => {
  const colors = ['error', 'warning', 'orange', 'amber', 'grey']
  return colors[index] || 'grey'
}

const getStageColor = (index: number): string => {
  const colors = ['error', 'warning', 'info', 'primary', 'grey']
  return colors[index] || 'grey'
}

const getStageIcon = (stage: string): string => {
  const icons: Record<string, string> = {
    'Contato inicial': 'mdi-phone-incoming',
    'Qualificação': 'mdi-clipboard-check',
    'Visita agendada': 'mdi-calendar-clock',
    'Visita realizada': 'mdi-home-search',
    'Proposta': 'mdi-file-document-edit',
    'Negociação': 'mdi-handshake',
    'Contrato': 'mdi-file-sign',
  }
  return icons[stage] || 'mdi-circle'
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

// Watch period changes
watch(selectedPeriod, () => {
  loadAnalysis()
})

// Lifecycle
onMounted(() => {
  loadAnalysis()
  loadRecentLosses()
})
</script>

<style scoped>
.loss-analysis-page {
  padding: 16px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-card {
  background: linear-gradient(135deg, #f57c00 0%, #e65100 50%, #bf360c 100%);
  position: relative;
  overflow: hidden;
}

.header-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
}

.header-icon-avatar {
  background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1));
  border: 2px solid rgba(255,255,255,0.4);
}

.text-white-alpha {
  color: rgba(255, 255, 255, 0.85);
}
</style>

