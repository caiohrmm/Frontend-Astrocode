<template>
  <div>
    <!-- Header Card -->
    <v-card elevation="2" class="mb-4">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-3" size="32" color="primary">mdi-phone</v-icon>
        <span class="text-h5">Atendimentos</span>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="goToCreate"
        >
          Novo Atendimento
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- Filters Card -->
    <v-card elevation="2" class="mb-4">
      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              label="Buscar"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @update:model-value="handleSearch"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              label="Status"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @update:model-value="applyFilters"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.channel"
              :items="channelOptions"
              label="Canal"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @update:model-value="applyFilters"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.agent_id"
              :items="agentOptions"
              label="Agente"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @update:model-value="applyFilters"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-btn
              variant="outlined"
              color="grey"
              prepend-icon="mdi-filter-off"
              @click="clearFilters"
            >
              Limpar
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Attendances Table -->
    <v-card elevation="2">
      <v-data-table
        :headers="headers"
        :items="filteredAttendances"
        :loading="isLoading"
        item-value="id"
        class="elevation-0"
        @click:row="handleRowClick"
      >
        <!-- Client Column -->
        <template #item.client_id="{ item }">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="36" class="mr-3">
              <span class="text-caption text-white font-weight-bold">
                {{ getClientInitials(item.client_id) }}
              </span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ getClientName(item.client_id) }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ formatDateTime(item.started_at) }}
              </div>
            </div>
          </div>
        </template>

        <!-- Channel Column -->
        <template #item.channel="{ item }">
          <v-chip
            :color="getChannelColor(item.channel)"
            variant="flat"
            size="small"
          >
            <v-icon start size="16">{{ getChannelIcon(item.channel) }}</v-icon>
            {{ getChannelLabel(item.channel) }}
          </v-chip>
        </template>

        <!-- Status Column -->
        <template #item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            variant="flat"
            size="small"
          >
            {{ getStatusLabel(item.status) }}
          </v-chip>
        </template>

        <!-- Agent Column -->
        <template #item.agent_id="{ item }">
          <div class="d-flex align-center">
            <v-avatar color="secondary" size="28" class="mr-2">
              <v-icon color="white" size="16">mdi-account-tie</v-icon>
            </v-avatar>
            <span class="text-body-2">{{ getAgentName(item.agent_id) }}</span>
          </div>
        </template>

        <!-- Duration Column -->
        <template #item.duration="{ item }">
          <v-chip v-if="item.duration !== null" variant="tonal" size="small" color="info">
            <v-icon start size="14">mdi-clock-outline</v-icon>
            {{ formatDuration(item.duration) }}
          </v-chip>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <!-- Started At Column -->
        <template #item.started_at="{ item }">
          <div class="text-caption">
            <v-icon size="14" class="mr-1">mdi-calendar</v-icon>
            {{ formatDateTime(item.started_at) }}
          </div>
        </template>

        <!-- AI Summary Column -->
        <template #item.ai_summary="{ item }">
          <div v-if="item.ai_summary" class="ai-summary-cell">
            <v-tooltip location="top" max-width="400">
              <template #activator="{ props }">
                <v-chip
                  v-bind="props"
                  color="success"
                  variant="flat"
                  size="small"
                  class="cursor-pointer"
                >
                  <v-icon start size="14">mdi-robot</v-icon>
                  {{ truncateText(item.ai_summary, 30) }}
                </v-chip>
              </template>
              <div class="pa-2">
                <div class="font-weight-bold mb-2">
                  <v-icon size="16" class="mr-1">mdi-robot</v-icon>
                  Resumo da IA
                </div>
                <div class="text-body-2">{{ item.ai_summary }}</div>
                <div v-if="item.ai_next_steps" class="mt-2 pt-2 border-t">
                  <div class="font-weight-medium mb-1">Próximos Passos:</div>
                  <div class="text-body-2">{{ item.ai_next_steps }}</div>
                </div>
              </div>
            </v-tooltip>
          </div>
          <v-chip v-else variant="tonal" size="small" color="grey">
            <v-icon start size="14">mdi-robot-off</v-icon>
            Pendente
          </v-chip>
        </template>

        <!-- Loading State -->
        <template #loading>
          <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
        </template>

        <!-- Empty State -->
        <template #no-data>
          <div class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-phone-off</v-icon>
            <div class="text-h6 text-medium-emphasis mb-2">Nenhum atendimento encontrado</div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              {{ searchQuery || hasActiveFilters ? 'Tente ajustar os filtros de busca' : 'Comece criando um novo atendimento' }}
            </div>
            <v-btn
              v-if="!hasActiveFilters"
              color="primary"
              prepend-icon="mdi-plus"
              @click="goToCreate"
            >
              Novo Atendimento
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>
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
import { clientsService, type Client } from '@/shared/services/clients.service'

const router = useRouter()

// State
const attendances = ref<Attendance[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const filters = ref({
  status: null as AttendanceStatus | null,
  channel: null as AttendanceChannel | null,
  agent_id: null as string | null,
})
const agents = ref<User[]>([])
const clients = ref<Client[]>([])

// Maps for quick lookup
const clientsMap = computed(() => {
  const map = new Map<string, Client>()
  clients.value.forEach(client => map.set(client.id, client))
  return map
})

const agentsMap = computed(() => {
  const map = new Map<string, User>()
  agents.value.forEach(agent => map.set(agent.id, agent))
  return map
})

// Table Headers
const headers = [
  { title: 'Cliente', key: 'client_id', sortable: true },
  { title: 'Canal', key: 'channel', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Agente', key: 'agent_id', sortable: true },
  { title: 'Duração', key: 'duration', sortable: true },
  { title: 'Iniciado em', key: 'started_at', sortable: true },
  { title: 'Resumo IA', key: 'ai_summary', sortable: false },
]

// Options
const statusOptions = [
  { title: 'Em Andamento', value: 'IN_PROGRESS' },
  { title: 'Concluído', value: 'COMPLETED' },
  { title: 'Cancelado', value: 'CANCELLED' },
  { title: 'Pausado', value: 'PAUSED' },
]

const channelOptions = [
  { title: 'WhatsApp', value: 'WHATSAPP' },
  { title: 'Site', value: 'SITE' },
  { title: 'Telefone', value: 'PHONE' },
  { title: 'E-mail', value: 'EMAIL' },
  { title: 'Presencial', value: 'IN_PERSON' },
]

const agentOptions = computed(() => {
  return agents.value.map(agent => ({
    title: agent.full_name,
    value: agent.id,
  }))
})

// Computed
const hasActiveFilters = computed(() => {
  return !!(
    filters.value.status ||
    filters.value.channel ||
    filters.value.agent_id
  )
})

const filteredAttendances = computed(() => {
  let result = [...attendances.value]

  // Search filter (raw_content, client name, agent name, ai_summary)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(attendance => {
      const clientName = getClientName(attendance.client_id).toLowerCase()
      const agentName = getAgentName(attendance.agent_id).toLowerCase()
      const rawContent = attendance.raw_content.toLowerCase()
      const aiSummary = attendance.ai_summary?.toLowerCase() || ''
      
      return (
        clientName.includes(query) ||
        agentName.includes(query) ||
        rawContent.includes(query) ||
        aiSummary.includes(query)
      )
    })
  }

  // Status filter
  if (filters.value.status) {
    result = result.filter(attendance => attendance.status === filters.value.status)
  }

  // Channel filter
  if (filters.value.channel) {
    result = result.filter(attendance => attendance.channel === filters.value.channel)
  }

  // Agent filter
  if (filters.value.agent_id) {
    result = result.filter(attendance => attendance.agent_id === filters.value.agent_id)
  }

  // Sort by most recent first
  result.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())

  return result
})

// Methods
const loadAttendances = async () => {
  isLoading.value = true
  try {
    const data = await attendancesService.getAttendances({ limit: 1000 }) // Get all for frontend filtering
    console.log('Loaded attendances:', data?.length || 0, 'items')
    attendances.value = data || []
  } catch (error: any) {
    console.error('Error loading attendances:', error)
    console.error('Error details:', error?.response?.data || error?.message)
    attendances.value = []
    // Show error to user
    alert(`Erro ao carregar atendimentos: ${error?.response?.data?.detail || error?.message || 'Erro desconhecido'}`)
  } finally {
    isLoading.value = false
  }
}

const loadAgents = async () => {
  try {
    agents.value = await usersService.getCorretores()
  } catch (error) {
    console.error('Error loading agents:', error)
    // If user doesn't have permission, just continue with empty list
  }
}

const loadClients = async () => {
  try {
    clients.value = await clientsService.getClients({ limit: 1000 })
  } catch (error) {
    console.error('Error loading clients:', error)
  }
}

// Helper functions for displaying names
const getClientName = (clientId: string): string => {
  const client = clientsMap.value.get(clientId)
  return client?.name || `Cliente #${clientId.slice(0, 8)}`
}

const getClientInitials = (clientId: string): string => {
  const client = clientsMap.value.get(clientId)
  if (client?.name) {
    const parts = client.name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return client.name.substring(0, 2).toUpperCase()
  }
  return '??'
}

const getAgentName = (agentId: string): string => {
  const agent = agentsMap.value.get(agentId)
  return agent?.full_name || `Agente #${agentId.slice(0, 8)}`
}

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const handleSearch = () => {
  // Search is reactive via computed property
}

const applyFilters = () => {
  // Filters are reactive via computed property
}

const clearFilters = () => {
  filters.value = {
    status: null,
    channel: null,
    agent_id: null,
  }
  searchQuery.value = ''
}

const handleRowClick = (_event: Event, { item }: { item: Attendance }) => {
  router.push({ name: 'attendances-details', params: { id: item.id } })
}

const goToCreate = () => {
  router.push({ name: 'attendances-create' })
}

// Formatting helpers
const getStatusLabel = (status: AttendanceStatus): string => {
  const labels: Record<AttendanceStatus, string> = {
    IN_PROGRESS: 'Em Andamento',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
    PAUSED: 'Pausado',
  }
  return labels[status] || status
}

const getStatusColor = (status: AttendanceStatus): string => {
  const colors: Record<AttendanceStatus, string> = {
    IN_PROGRESS: 'info',
    COMPLETED: 'success',
    CANCELLED: 'error',
    PAUSED: 'warning',
  }
  return colors[status] || 'grey'
}

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

onMounted(async () => {
  // Load all data in parallel
  await Promise.all([
    loadAttendances(),
    loadAgents(),
    loadClients(),
  ])
})
</script>

<style scoped>
:deep(.v-data-table__tr) {
  cursor: pointer;
}

:deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.ai-summary-cell .v-chip {
  max-width: 200px;
}

.cursor-pointer {
  cursor: pointer;
}

.border-t {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}
</style>

