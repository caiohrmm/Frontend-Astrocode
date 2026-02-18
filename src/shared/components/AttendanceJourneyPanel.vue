<template>
  <div class="attendance-journey-panel">
    <!-- Header com explicação -->
    <v-alert type="info" variant="tonal" class="mb-4" density="compact" rounded="lg">
      <div class="d-flex align-center">
        
        <div class="flex-grow-1">
          <div class="text-body-1 font-weight-medium mb-1">
            Jornada dos Atendimentos
          </div>
          <div class="text-body-2 text-medium-emphasis">
            Esta página mostra a jornada completa dos ciclos de atendimento do cliente. 
            Cada ciclo representa um objetivo específico. Um cliente pode ter múltiplos ciclos, 
            alguns perdidos e outros ganhos - ele sempre pode voltar a comprar.
          </div>
        </div>
      </div>
    </v-alert>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center pa-8">
      <v-progress-circular indeterminate size="48" color="primary"></v-progress-circular>
      <div class="text-body-2 mt-4">Carregando jornada dos atendimentos...</div>
    </div>

    <!-- Empty State -->
    <v-card v-else-if="attendances.length === 0" variant="outlined" class="text-center pa-8">
      <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-target-variant</v-icon>
      <div class="text-h6 text-medium-emphasis mb-2">Nenhum atendimento registrado</div>
      <div class="text-body-2 text-medium-emphasis mb-4">
        Os ciclos de atendimento deste cliente aparecerão aqui quando forem criados.
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="handleCreateAttendance">
        Criar Primeiro Atendimento
      </v-btn>
    </v-card>

    <!-- Journey Timeline -->
    <div v-else>
      <!-- Statistics Summary -->
      <v-row class="mb-4">
        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined" class="text-center pa-4">
            <div class="text-h4 font-weight-bold text-primary">{{ attendances.length }}</div>
            <div class="text-body-2 text-medium-emphasis mt-1">Total de Ciclos</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined" class="text-center pa-4">
            <div class="text-h4 font-weight-bold text-success">{{ completedCount }}</div>
            <div class="text-body-2 text-medium-emphasis mt-1">Ganhos</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined" class="text-center pa-4">
            <div class="text-h4 font-weight-bold text-error">{{ lostCount }}</div>
            <div class="text-body-2 text-medium-emphasis mt-1">Perdidos</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined" class="text-center pa-4">
            <div class="text-h4 font-weight-bold text-info">{{ activeCount }}</div>
            <div class="text-body-2 text-medium-emphasis mt-1">Em Andamento</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Timeline Visual -->
      <v-timeline align="start" density="comfortable" side="end" class="journey-timeline">
        <v-timeline-item
          v-for="(attendance, index) in sortedAttendances"
          :key="attendance.id"
          :dot-color="getStatusColor(attendance.status)"
          size="large"
          :icon="getStatusIcon(attendance.status)"
        >
          <template #icon>
            <v-avatar :color="getStatusColor(attendance.status)" size="48">
              <v-icon color="white" size="24">
                {{ getStatusIcon(attendance.status) }}
              </v-icon>
            </v-avatar>
          </template>

          <v-card
            :color="getStatusColor(attendance.status)"
            variant="tonal"
            class="attendance-card"
            elevation="2"
          >
            <v-card-title class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-chip
                  :color="getStatusColor(attendance.status)"
                  variant="flat"
                  size="small"
                  class="mr-2"
                >
                  {{ getStatusLabel(attendance.status) }}
                </v-chip>
                <span class="text-caption text-medium-emphasis">
                  {{ formatDateTime(attendance.created_at) }}
                </span>
              </div>
              <v-btn
                icon
                variant="text"
                size="small"
                @click="goToAttendance(attendance.id)"
              >
                <v-icon>mdi-open-in-new</v-icon>
              </v-btn>
            </v-card-title>

            <v-card-text>
              <!-- Objective -->
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">Objetivo do Ciclo</div>
                <div class="text-body-1 font-weight-medium">
                  {{ attendance.objective || 'Objetivo não definido' }}
                </div>
              </div>

              <!-- Property Link -->
              <div v-if="attendance.property_id" class="mb-3">
                <v-btn
                  variant="text"
                  size="small"
                  prepend-icon="mdi-home"
                  @click="goToProperty(attendance.property_id)"
                >
                  Ver Imóvel
                </v-btn>
              </div>

              <!-- AI Summary -->
              <div v-if="attendance.ai_summary" class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">Resumo da IA</div>
                <div
                  class="text-body-2 markdown-content ai-summary-preview"
                  v-html="formatMarkdown(attendance.ai_summary.substring(0, 200) + (attendance.ai_summary.length > 200 ? '...' : ''))"
                ></div>
              </div>

              <!-- Duration -->
              <div v-if="attendance.status !== 'ACTIVE'" class="text-caption text-medium-emphasis">
                Duração: {{ calculateDuration(attendance.created_at, attendance.updated_at) }}
              </div>
              <div v-else class="text-caption text-medium-emphasis">
                Em andamento desde {{ formatDateTime(attendance.created_at) }}
              </div>

              <!-- Important Note for LOST status -->
              <v-alert
                v-if="attendance.status === 'LOST'"
                type="info"
                variant="tonal"
                density="compact"
                class="mt-3"
                rounded="lg"
              >
                <div class="d-flex align-center">
                  <v-icon class="mr-2" size="18">mdi-information</v-icon>
                  <div class="text-caption">
                    Este ciclo foi perdido, mas o cliente pode ter novos atendimentos e voltar a comprar.
                  </div>
                </div>
              </v-alert>
            </v-card-text>

            <v-card-actions v-if="attendance.status === 'ACTIVE'">
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                variant="text"
                size="small"
                prepend-icon="mdi-pencil"
                @click="goToAttendance(attendance.id)"
              >
                Continuar Atendimento
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-timeline-item>
      </v-timeline>

      <!-- Summary Message -->
      <v-alert
        v-if="lostCount > 0 && activeCount > 0"
        type="success"
        variant="tonal"
        class="mt-4"
        rounded="lg"
      >
        <div class="d-flex align-center">
          <v-icon class="mr-3" size="24">mdi-check-circle</v-icon>
          <div>
            <div class="text-body-1 font-weight-medium mb-1">
              Cliente com histórico de perdas, mas com atendimento ativo
            </div>
            <div class="text-body-2 text-medium-emphasis">
              Este cliente teve {{ lostCount }} ciclo(s) perdido(s) anteriormente, mas atualmente 
              possui {{ activeCount }} atendimento(s) em andamento. Continue trabalhando para converter!
            </div>
          </div>
        </div>
      </v-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  attendancesService,
  type Attendance,
  type AttendanceStatus,
} from '@/shared/services/attendances.service'

const props = defineProps<{
  clientId: string
}>()

const router = useRouter()

// State
const attendances = ref<Attendance[]>([])
const isLoading = ref(true)

// Computed
const sortedAttendances = computed(() => {
  return [...attendances.value].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
})

const activeCount = computed(() => {
  return attendances.value.filter(a => a.status === 'ACTIVE').length
})

const completedCount = computed(() => {
  return attendances.value.filter(a => a.status === 'COMPLETED').length
})

const lostCount = computed(() => {
  return attendances.value.filter(a => a.status === 'LOST').length
})

// Methods
const loadAttendances = async () => {
  isLoading.value = true
  try {
    attendances.value = await attendancesService.getAttendances({
      client_id: props.clientId,
    })
  } catch (error) {
    console.error('Error loading attendances:', error)
  } finally {
    isLoading.value = false
  }
}

const getStatusColor = (status: AttendanceStatus): string => {
  const colors: Record<AttendanceStatus, string> = {
    ACTIVE: 'info',
    COMPLETED: 'success',
    LOST: 'error',
    ABANDONED: 'warning',
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status: AttendanceStatus): string => {
  const icons: Record<AttendanceStatus, string> = {
    ACTIVE: 'mdi-sync',
    COMPLETED: 'mdi-check-circle',
    LOST: 'mdi-cancel',
    ABANDONED: 'mdi-close-circle',
  }
  return icons[status] || 'mdi-circle'
}

const getStatusLabel = (status: AttendanceStatus): string => {
  const labels: Record<AttendanceStatus, string> = {
    ACTIVE: 'Em Andamento',
    COMPLETED: 'Ganho',
    LOST: 'Perdido',
    ABANDONED: 'Abandonado',
  }
  return labels[status] || status
}

const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo', // Explicitly use Brazil timezone
  }).format(date)
}

const calculateDuration = (start: string, end: string): string => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffMs = endDate.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`
    }
    return `${diffHours} hora${diffHours !== 1 ? 's' : ''}`
  }
  
  if (diffDays < 30) {
    return `${diffDays} dia${diffDays !== 1 ? 's' : ''}`
  }
  
  const diffMonths = Math.floor(diffDays / 30)
  const remainingDays = diffDays % 30
  
  if (remainingDays === 0) {
    return `${diffMonths} mês${diffMonths !== 1 ? 'es' : ''}`
  }
  
  return `${diffMonths} mês${diffMonths !== 1 ? 'es' : ''} e ${remainingDays} dia${remainingDays !== 1 ? 's' : ''}`
}

const goToAttendance = (attendanceId: string) => {
  router.push({ name: 'attendances-details', params: { id: attendanceId } })
}

const goToProperty = (propertyId: string) => {
  router.push({ name: 'properties-details', params: { id: propertyId } })
}

const handleCreateAttendance = () => {
  router.push({
    name: 'attendances-create',
    query: { client_id: props.clientId },
  })
}

// Markdown formatting
const formatMarkdown = (text: string | null | undefined): string => {
  if (!text) return ''
  
  let html = text
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h4 class="text-subtitle-2 font-weight-bold">$1</h4>')
  html = html.replace(/^## (.*$)/gim, '<h3 class="text-subtitle-1 font-weight-bold">$1</h3>')
  html = html.replace(/^# (.*$)/gim, '<h2 class="text-h6 font-weight-bold">$1</h2>')
  
  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="markdown-code">$1</code>')
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="markdown-link">$1</a>')
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p class="text-body-2 mb-1">')
  html = html.replace(/\n/g, '<br>')
  
  return `<p class="text-body-2 mb-1">${html}</p>`
}

onMounted(() => {
  loadAttendances()
})
</script>

<style scoped>
.attendance-journey-panel {
  padding: 8px;
}

.journey-timeline {
  position: relative;
}

.attendance-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.attendance-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.ai-summary-preview {
  max-height: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Markdown styles */
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4) {
  margin-top: 0.5rem;
  margin-bottom: 0.25rem;
}

.markdown-content :deep(p) {
  margin: 0.25rem 0;
  line-height: 1.5;
}

.markdown-content :deep(code) {
  background: rgba(0, 0, 0, 0.05);
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  font-size: 0.9em;
}

.markdown-content :deep(a) {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}
</style>

