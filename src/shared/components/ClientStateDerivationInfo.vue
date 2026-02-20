<template>
  <v-card v-if="hasDerivationInfo" variant="outlined" class="state-derivation-card">
    <v-card-title class="d-flex align-center pa-4">
      <v-icon class="mr-2" color="primary">mdi-robot</v-icon>
      <span class="text-subtitle-1 font-weight-bold">Derivação Automática de Estado</span>
      <v-spacer></v-spacer>
      <v-chip color="primary" variant="flat" size="small">
        <v-icon start size="14">mdi-auto-fix</v-icon>
        Automático
      </v-chip>
    </v-card-title>

    <v-card-text class="pa-4">
      <v-row dense>
        <!-- Last Derivation -->
        <v-col cols="12" v-if="client.last_state_derivation_at">
          <div class="d-flex align-center mb-2">
            <v-icon size="20" color="success" class="mr-2">mdi-check-circle</v-icon>
            <div class="flex-grow-1">
              <div class="text-caption text-medium-emphasis mb-1">Última Derivação</div>
              <div class="text-body-2 font-weight-medium">
                {{ formatRelativeTime(client.last_state_derivation_at) }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ formatDateTime(client.last_state_derivation_at) }}
              </div>
            </div>
          </div>
        </v-col>

        <!-- Derivation Count -->
        <v-col cols="12" sm="6" v-if="client.state_derivation_count !== undefined && client.state_derivation_count > 0">
          <div class="d-flex align-center">
            <v-icon size="20" color="info" class="mr-2">mdi-counter</v-icon>
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Derivações Realizadas</div>
              <div class="text-body-2 font-weight-medium">
                {{ client.state_derivation_count }} {{ client.state_derivation_count === 1 ? 'vez' : 'vezes' }}
              </div>
            </div>
          </div>
        </v-col>

        <!-- Attendances Used -->
        <v-col cols="12" sm="6" v-if="client.state_derived_from_attendances_count">
          <div class="d-flex align-center">
            <v-icon size="20" color="primary" class="mr-2">mdi-target</v-icon>
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Baseado em</div>
              <div class="text-body-2 font-weight-medium">
                {{ client.state_derived_from_attendances_count }} {{ client.state_derived_from_attendances_count === 1 ? 'ciclo' : 'ciclos' }}
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Info Alert -->
      <v-alert type="info" variant="tonal" density="compact" class="mt-3">
        <div class="text-caption">
        
          O perfil deste cliente é atualizado automaticamente pela IA com base nos sinais consolidados de todos os ciclos de atendimento.
          O sistema usa lógica anti-oscilação para manter estabilidade.
        </div>
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Client } from '@/shared/services/clients.service'

interface Props {
  client: Client | null
}

const props = defineProps<Props>()

const hasDerivationInfo = computed(() => {
  if (!props.client) return false
  return (
    props.client.last_state_derivation_at !== null ||
    (props.client.state_derivation_count !== undefined && props.client.state_derivation_count > 0) ||
    props.client.state_derived_from_attendances_count !== null
  )
})

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `Há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`
  } else if (diffHours > 0) {
    return `Há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
  } else if (diffMinutes > 0) {
    return `Há ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`
  } else {
    return 'Agora mesmo'
  }
}
</script>

<style scoped>
.state-derivation-card {
  border-left: 4px solid rgb(var(--v-theme-primary));
}
</style>

