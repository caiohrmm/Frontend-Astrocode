<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="d-flex align-center">
        <v-icon class="mr-2" color="primary" size="24">mdi-target</v-icon>
        <h3 class="text-h6 font-weight-bold">Ciclos de Atendimento</h3>
      </div>
      <v-btn
        color="primary"
        size="small"
        prepend-icon="mdi-plus"
        @click="handleCreateAttendance"
      >
        Novo Atendimento
      </v-btn>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="d-flex justify-center pa-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- Empty State -->
    <v-card v-else-if="attendances.length === 0" variant="outlined" class="text-center pa-8">
      <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-target-variant</v-icon>
      <div class="text-h6 text-medium-emphasis mb-2">Nenhum ciclo de atendimento</div>
      <div class="text-body-2 text-medium-emphasis mb-4">
        Os ciclos de atendimento deste cliente aparecerão aqui quando forem criados.
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="handleCreateAttendance">
        Criar Primeiro Atendimento
      </v-btn>
    </v-card>

    <!-- Cycles Timeline -->
    <div v-else class="cycles-timeline">
      <v-expansion-panels
        v-model="expandedCycles"
        variant="accordion"
        multiple
      >
        <v-expansion-panel
          v-for="(attendance, index) in sortedAttendances"
          :key="attendance.id"
          :value="attendance.id"
          class="cycle-panel"
        >
          <template #title>
            <div class="d-flex align-center flex-grow-1">
              <!-- Timeline Connector -->
              <div class="timeline-connector mr-4">
                <v-avatar
                  :color="getStatusColor(attendance.status)"
                  size="40"
                  class="timeline-dot"
                >
                  <v-icon color="white" size="20">
                    {{ getStatusIcon(attendance.status) }}
                  </v-icon>
                </v-avatar>
                <div
                  v-if="index < sortedAttendances.length - 1"
                  class="timeline-line"
                ></div>
              </div>

              <!-- Cycle Info -->
              <div class="flex-grow-1">
                <div class="d-flex align-center mb-1">
                  <v-chip
                    :color="getStatusColor(attendance.status)"
                    variant="flat"
                    size="small"
                    class="mr-2"
                  >
                    {{ getStatusLabel(attendance.status) }}
                  </v-chip>
                  <span class="text-caption text-medium-emphasis">
                    {{ formatDateTime(attendance.started_at) }}
                  </span>
                </div>
                <div class="text-body-1 font-weight-medium">
                  {{ attendance.objective || 'Objetivo não definido' }}
                </div>
                <div v-if="attendance.ended_at" class="text-caption text-medium-emphasis">
                  Finalizado em {{ formatDateTime(attendance.ended_at) }}
                  <span v-if="attendance.duration">
                    • Duração: {{ formatDuration(attendance.duration) }}
                  </span>
                </div>
              </div>

              <!-- Active Badge -->
              <v-chip
                v-if="attendance.status === 'ACTIVE'"
                color="success"
                variant="flat"
                size="small"
                class="ml-2"
              >
                <v-icon start size="14">mdi-sync</v-icon>
                Ativo
              </v-chip>
            </div>
          </template>

          <template #text>
            <v-card variant="outlined" class="mt-2">
              <v-card-text>
                <!-- Cycle Details -->
                <v-row>
                  <!-- Objective -->
                  <v-col cols="12" v-if="attendance.objective">
                    <div class="mb-2">
                      <div class="text-caption text-medium-emphasis mb-1">Objetivo do Ciclo</div>
                      <div class="text-body-1 font-weight-medium">{{ attendance.objective }}</div>
                    </div>
                  </v-col>

                  <!-- Channel & Agent -->
                  <v-col cols="12" sm="6">
                    <div class="mb-2">
                      <div class="text-caption text-medium-emphasis mb-1">Canal</div>
                      <v-chip
                        :color="getChannelColor(attendance.channel)"
                        variant="flat"
                        size="small"
                      >
                        <v-icon start size="14">{{ getChannelIcon(attendance.channel) }}</v-icon>
                        {{ getChannelLabel(attendance.channel) }}
                      </v-chip>
                    </div>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <div class="mb-2">
                      <div class="text-caption text-medium-emphasis mb-1">Agente</div>
                      <div class="text-body-2">{{ getAgentName(attendance.agent_id) }}</div>
                    </div>
                  </v-col>

                  <!-- Conversations Content -->
                  <v-col cols="12">
                    <v-divider class="my-2"></v-divider>
                    <div class="mb-2">
                      <div class="text-caption text-medium-emphasis mb-2">
                        <v-icon size="14" class="mr-1">mdi-message-text</v-icon>
                        Conversas do Ciclo
                      </div>
                      <div
                        class="text-body-2 conversations-content"
                        style="white-space: pre-wrap; word-wrap: break-word;"
                      >
                        {{ attendance.raw_content }}
                      </div>
                    </div>
                  </v-col>

                  <!-- AI Summary -->
                  <v-col cols="12" v-if="attendance.ai_summary">
                    <v-divider class="my-2"></v-divider>
                    <div class="mb-2">
                      <div class="text-caption text-medium-emphasis mb-2">
                        <v-icon size="14" class="mr-1" color="primary">mdi-robot</v-icon>
                        Resumo da IA
                      </div>
                      <div class="text-body-2">{{ attendance.ai_summary }}</div>
                    </div>
                  </v-col>

                  <!-- AI Next Steps -->
                  <v-col cols="12" v-if="attendance.ai_next_steps">
                    <v-divider class="my-2"></v-divider>
                    <v-alert type="info" variant="tonal" density="compact">
                      <div class="text-subtitle-2 font-weight-medium mb-1">Próximos Passos Sugeridos</div>
                      <div class="text-body-2">{{ attendance.ai_next_steps }}</div>
                    </v-alert>
                  </v-col>

                  <!-- Actions -->
                  <v-col cols="12">
                    <v-divider class="my-2"></v-divider>
                    <div class="d-flex ga-2">
                      <v-btn
                        color="primary"
                        variant="outlined"
                        size="small"
                        prepend-icon="mdi-eye"
                        @click="handleViewDetails(attendance.id)"
                      >
                        Ver Detalhes
                      </v-btn>
                      <v-btn
                        v-if="attendance.status === 'ACTIVE'"
                        color="success"
                        variant="outlined"
                        size="small"
                        prepend-icon="mdi-message-plus"
                        @click="handleAddConversation(attendance.id)"
                      >
                        Adicionar Conversa
                      </v-btn>
                      <v-btn
                        v-if="attendance.status === 'ACTIVE'"
                        color="primary"
                        variant="outlined"
                        size="small"
                        prepend-icon="mdi-check-circle"
                        @click="handleCompleteCycle(attendance.id)"
                      >
                        Finalizar Ciclo
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </template>
        </v-expansion-panel>
      </v-expansion-panels>
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
  type AttendanceChannel,
} from '@/shared/services/attendances.service'
import { usersService, type User } from '@/shared/services/users.service'

interface Props {
  clientId: string
}

const props = defineProps<Props>()
const router = useRouter()

// State
const isLoading = ref(false)
const attendances = ref<Attendance[]>([])
const agents = ref<User[]>([])
const expandedCycles = ref<string[]>([])

// Computed
const sortedAttendances = computed(() => {
  // Sort by started_at descending (most recent first)
  return [...attendances.value].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  )
})

const agentsMap = computed(() => {
  const map = new Map<string, User>()
  agents.value.forEach(agent => map.set(agent.id, agent))
  return map
})

// Methods
const loadAttendances = async () => {
  isLoading.value = true
  try {
    attendances.value = await attendancesService.getAttendances({
      client_id: props.clientId,
      limit: 1000,
    })
    
    // Auto-expand active cycles
    const activeCycles = attendances.value
      .filter(a => a.status === 'ACTIVE')
      .map(a => a.id)
    if (activeCycles.length > 0) {
      expandedCycles.value = activeCycles
    }
  } catch (error) {
    console.error('Error loading attendances:', error)
    attendances.value = []
  } finally {
    isLoading.value = false
  }
}

const loadAgents = async () => {
  try {
    agents.value = await usersService.getCorretores()
  } catch (error) {
    console.error('Error loading agents:', error)
  }
}

const getAgentName = (agentId: string): string => {
  const agent = agentsMap.value.get(agentId)
  return agent?.full_name || `Agente #${agentId.slice(0, 8)}`
}

// Status helpers
const getStatusLabel = (status: AttendanceStatus): string => {
  const labels: Record<AttendanceStatus, string> = {
    ACTIVE: 'Ativo',
    COMPLETED: 'Concluído',
    LOST: 'Perdido',
    ABANDONED: 'Abandonado',
  }
  return labels[status] || status
}

const getStatusColor = (status: AttendanceStatus): string => {
  const colors: Record<AttendanceStatus, string> = {
    ACTIVE: 'success',
    COMPLETED: 'primary',
    LOST: 'error',
    ABANDONED: 'warning',
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status: AttendanceStatus): string => {
  const icons: Record<AttendanceStatus, string> = {
    ACTIVE: 'mdi-check-circle',
    COMPLETED: 'mdi-check-circle',
    LOST: 'mdi-close-circle',
    ABANDONED: 'mdi-pause-circle',
  }
  return icons[status] || 'mdi-help-circle'
}

// Channel helpers
const getChannelLabel = (channel: AttendanceChannel): string => {
  const labels: Record<AttendanceChannel, string> = {
    WHATSAPP: 'WhatsApp',
    SITE: 'Site',
    PHONE: 'Telefone',
    EMAIL: 'E-mail',
    IN_PERSON: 'Presencial',
  }
  return labels[channel] || channel
}

const getChannelColor = (channel: AttendanceChannel): string => {
  const colors: Record<AttendanceChannel, string> = {
    WHATSAPP: 'success',
    SITE: 'primary',
    PHONE: 'info',
    EMAIL: 'warning',
    IN_PERSON: 'purple',
  }
  return colors[channel] || 'grey'
}

const getChannelIcon = (channel: AttendanceChannel): string => {
  const icons: Record<AttendanceChannel, string> = {
    WHATSAPP: 'mdi-whatsapp',
    SITE: 'mdi-web',
    PHONE: 'mdi-phone',
    EMAIL: 'mdi-email',
    IN_PERSON: 'mdi-account',
  }
  return icons[channel] || 'mdi-help-circle'
}

// Formatting helpers
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

const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

// Actions
const handleCreateAttendance = () => {
  router.push({
    name: 'attendances-create',
    query: { client_id: props.clientId },
  })
}

const handleViewDetails = (attendanceId: string) => {
  router.push({
    name: 'attendances-details',
    params: { id: attendanceId },
  })
}

const handleAddConversation = async (attendanceId: string) => {
  // Navigate to details page where user can add conversation
  // The details page will handle showing feedback
  router.push({
    name: 'attendances-details',
    params: { id: attendanceId },
    query: { action: 'add_conversation' },
  })
}

const handleCompleteCycle = async (attendanceId: string) => {
  try {
    await attendancesService.updateAttendance(attendanceId, {
      status: 'COMPLETED',
      ended_at: new Date().toISOString(),
    })
    // Reload attendances
    await loadAttendances()
  } catch (error) {
    console.error('Error completing cycle:', error)
    alert('Erro ao finalizar ciclo')
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([loadAttendances(), loadAgents()])
})
</script>

<style scoped>
.cycles-timeline {
  position: relative;
}

.timeline-connector {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 40px;
}

.timeline-dot {
  position: relative;
  z-index: 2;
}

.timeline-line {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: calc(100% - 40px);
  background: linear-gradient(
    to bottom,
    rgba(var(--v-theme-primary), 0.3),
    rgba(var(--v-theme-primary), 0.1)
  );
  z-index: 1;
}

.cycle-panel {
  margin-bottom: 8px;
}

.conversations-content {
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  background-color: rgba(var(--v-theme-surface), 0.5);
  border-radius: 4px;
}
</style>

