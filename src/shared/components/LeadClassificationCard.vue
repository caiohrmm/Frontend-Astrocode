<template>
  <v-card 
    v-if="classification"
    :color="cardColor" 
    variant="tonal" 
    rounded="lg"
    class="lead-classification-card"
  >
    <v-card-title class="d-flex align-center py-3">
      <v-icon start :color="cardColor">mdi-robot</v-icon>
      <span class="text-subtitle-1 font-weight-bold">Classificação da IA</span>
      <v-spacer></v-spacer>
      <v-chip 
        size="small" 
        :color="getConfidenceColor(classification.confidence)"
        variant="flat"
      >
        {{ Math.round(classification.confidence * 100) }}% confiança
      </v-chip>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text class="py-4">
      <v-row dense>
        <!-- Lead Score -->
        <v-col cols="12" sm="6" md="3">
          <div class="d-flex flex-column align-center text-center pa-2">
            <v-progress-circular
              :model-value="classification.lead_score"
              :size="64"
              :width="6"
              :color="getScoreColor(classification.lead_score)"
            >
              <span class="text-h6 font-weight-bold">{{ classification.lead_score }}</span>
            </v-progress-circular>
            <span class="text-caption mt-2">Lead Score</span>
            <span class="text-caption text-medium-emphasis">{{ getScoreLabel(classification.lead_score) }}</span>
          </div>
        </v-col>

        <!-- Urgency -->
        <v-col cols="12" sm="6" md="3">
          <div class="d-flex flex-column align-center text-center pa-2">
            <v-avatar :color="getUrgencyColor(classification.urgency_level)" size="64">
              <v-icon color="white" size="32">{{ getUrgencyIcon(classification.urgency_level) }}</v-icon>
            </v-avatar>
            <span class="text-caption mt-2">Urgência</span>
            <v-chip 
              :color="getUrgencyColor(classification.urgency_level)" 
              size="small"
              variant="flat"
              class="mt-1"
            >
              {{ getUrgencyLabel(classification.urgency_level) }}
            </v-chip>
          </div>
        </v-col>

        <!-- Interest Type -->
        <v-col cols="12" sm="6" md="3">
          <div class="d-flex flex-column align-center text-center pa-2">
            <v-avatar :color="classification.interest_type ? 'primary' : 'grey'" size="64">
              <v-icon color="white" size="32">{{ getInterestIcon(classification.interest_type) }}</v-icon>
            </v-avatar>
            <span class="text-caption mt-2">Interesse</span>
            <v-chip 
              :color="classification.interest_type ? 'primary' : 'grey'" 
              size="small"
              variant="flat"
              class="mt-1"
            >
              {{ getInterestLabel(classification.interest_type) }}
            </v-chip>
          </div>
        </v-col>

        <!-- Property Type -->
        <v-col cols="12" sm="6" md="3">
          <div class="d-flex flex-column align-center text-center pa-2">
            <v-avatar :color="classification.property_type ? 'secondary' : 'grey'" size="64">
              <v-icon color="white" size="32">{{ getPropertyIcon(classification.property_type) }}</v-icon>
            </v-avatar>
            <span class="text-caption mt-2">Imóvel</span>
            <v-chip 
              :color="classification.property_type ? 'secondary' : 'grey'" 
              size="small"
              variant="flat"
              class="mt-1"
            >
              {{ getPropertyLabel(classification.property_type) }}
            </v-chip>
          </div>
        </v-col>
      </v-row>

      <!-- Classification Reason -->
      <v-alert
        v-if="classification.classification_reason"
        density="compact"
        variant="text"
        class="mt-4 mb-0"
      >
        <template v-slot:prepend>
          <v-icon color="info" size="20">mdi-information</v-icon>
        </template>
        <span class="text-body-2">{{ classification.classification_reason }}</span>
      </v-alert>

      <!-- Key Indicators -->
      <div v-if="classification.key_indicators?.length" class="mt-4">
        <span class="text-caption font-weight-bold text-medium-emphasis">Indicadores Detectados:</span>
        <div class="d-flex flex-wrap ga-1 mt-1">
          <v-chip
            v-for="(indicator, i) in classification.key_indicators"
            :key="i"
            size="small"
            variant="outlined"
            color="primary"
          >
            {{ indicator }}
          </v-chip>
        </div>
      </div>

      <!-- Recommended Actions -->
      <div v-if="classification.recommended_actions?.length" class="mt-4">
        <span class="text-caption font-weight-bold text-medium-emphasis">Ações Recomendadas:</span>
        <v-list density="compact" class="bg-transparent pa-0 mt-1">
          <v-list-item
            v-for="(action, i) in classification.recommended_actions"
            :key="i"
            class="px-0"
          >
            <template v-slot:prepend>
              <v-icon color="success" size="18">mdi-check-circle</v-icon>
            </template>
            <v-list-item-title class="text-body-2">{{ action }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </div>
    </v-card-text>

    <!-- Actions -->
    <v-card-actions v-if="showActions" class="px-4 pb-4">
      <v-spacer></v-spacer>
      <v-btn
        variant="text"
        size="small"
        @click="$emit('dismiss')"
      >
        Fechar
      </v-btn>
      <v-btn
        v-if="showApply"
        color="primary"
        variant="flat"
        size="small"
        prepend-icon="mdi-check"
        @click="$emit('apply', classification)"
      >
        Aplicar Classificação
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LeadClassificationResult, UrgencyLevel, InterestType, PropertyType } from '@/shared/services/clients.service'

interface Props {
  classification: LeadClassificationResult | null
  showActions?: boolean
  showApply?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false,
  showApply: false,
})

defineEmits<{
  dismiss: []
  apply: [classification: LeadClassificationResult]
}>()

const cardColor = computed(() => {
  if (!props.classification) return 'grey'
  const score = props.classification.lead_score
  if (score >= 76) return 'success'
  if (score >= 51) return 'warning'
  if (score >= 26) return 'info'
  return 'grey'
})

// Helper functions
const getScoreColor = (score: number): string => {
  if (score >= 76) return 'success'
  if (score >= 51) return 'warning'
  if (score >= 26) return 'info'
  return 'grey'
}

const getScoreLabel = (score: number): string => {
  if (score >= 76) return 'Muito Quente'
  if (score >= 51) return 'Quente'
  if (score >= 26) return 'Morno'
  return 'Frio'
}

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return 'success'
  if (confidence >= 0.5) return 'warning'
  return 'grey'
}

const getUrgencyColor = (urgency: UrgencyLevel): string => {
  const colors: Record<UrgencyLevel, string> = {
    LOW: 'grey',
    MEDIUM: 'info',
    HIGH: 'warning',
    IMMEDIATE: 'error',
  }
  return colors[urgency] || 'grey'
}

const getUrgencyIcon = (urgency: UrgencyLevel): string => {
  const icons: Record<UrgencyLevel, string> = {
    LOW: 'mdi-clock-outline',
    MEDIUM: 'mdi-clock',
    HIGH: 'mdi-clock-fast',
    IMMEDIATE: 'mdi-clock-alert',
  }
  return icons[urgency] || 'mdi-clock'
}

const getUrgencyLabel = (urgency: UrgencyLevel): string => {
  const labels: Record<UrgencyLevel, string> = {
    LOW: 'Baixa',
    MEDIUM: 'Média',
    HIGH: 'Alta',
    IMMEDIATE: 'Imediata',
  }
  return labels[urgency] || urgency
}

const getInterestIcon = (interest: InterestType | null): string => {
  if (!interest) return 'mdi-help-circle-outline'
  const icons: Record<InterestType, string> = {
    BUY: 'mdi-home-plus',
    RENT: 'mdi-key-variant',
    SELL: 'mdi-tag',
    INVEST: 'mdi-chart-line',
  }
  return icons[interest] || 'mdi-help-circle'
}

const getInterestLabel = (interest: InterestType | null): string => {
  if (!interest) return 'Não detectado'
  const labels: Record<InterestType, string> = {
    BUY: 'Comprar',
    RENT: 'Alugar',
    SELL: 'Vender',
    INVEST: 'Investir',
  }
  return labels[interest] || interest
}

const getPropertyIcon = (property: PropertyType | null): string => {
  if (!property) return 'mdi-help-circle-outline'
  const icons: Record<PropertyType, string> = {
    HOUSE: 'mdi-home',
    APARTMENT: 'mdi-office-building',
    LAND: 'mdi-land-plots',
    COMMERCIAL: 'mdi-store',
    RURAL: 'mdi-tractor',
  }
  return icons[property] || 'mdi-home'
}

const getPropertyLabel = (property: PropertyType | null): string => {
  if (!property) return 'Não detectado'
  const labels: Record<PropertyType, string> = {
    HOUSE: 'Casa',
    APARTMENT: 'Apartamento',
    LAND: 'Terreno',
    COMMERCIAL: 'Comercial',
    RURAL: 'Rural',
  }
  return labels[property] || property
}
</script>

<style scoped>
.lead-classification-card {
  border-left: 4px solid currentColor;
}
</style>

