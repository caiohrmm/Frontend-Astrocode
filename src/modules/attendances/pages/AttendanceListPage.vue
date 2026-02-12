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
                {{ formatDateTime(item.created_at) }}
              </div>
            </div>
          </div>
        </template>

        <!-- Objective Column -->
        <template #item.objective="{ item }">
          <div v-if="item.objective" class="objective-cell">
            <v-tooltip location="top" max-width="300">
              <template #activator="{ props }">
                <v-chip
                  v-bind="props"
                  color="primary"
                  variant="outlined"
                  size="small"
                  class="cursor-pointer"
                >
                  <v-icon start size="14">mdi-target</v-icon>
                  {{ truncateText(item.objective, 40) }}
                </v-chip>
              </template>
              <div class="pa-2">
                <div class="font-weight-bold mb-1">Objetivo do Ciclo:</div>
                <div class="text-body-2">{{ item.objective }}</div>
              </div>
            </v-tooltip>
          </div>
          <v-chip v-else variant="tonal" size="small" color="grey">
            <v-icon start size="14">mdi-help-circle</v-icon>
            Não definido
          </v-chip>
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

        <!-- Created At Column -->
        <template #item.created_at="{ item }">
          <div class="text-caption">
            <v-icon size="14" class="mr-1">mdi-calendar</v-icon>
            {{ formatDateTime(item.created_at) }}
          </div>
        </template>

        <!-- AI Summary Column -->
        <template #item.ai_summary="{ item }">
          <div v-if="item.ai_summary" class="ai-summary-cell">
            <v-btn
              color="success"
              variant="flat"
              size="small"
              prepend-icon="mdi-robot"
              class="text-none font-weight-medium"
              @click.stop="openAISummaryModal(item)"
            >
              Ver RESUMO da IA
            </v-btn>
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

    <!-- AI Summary Modal -->
    <v-dialog v-model="showAISummaryModal" max-width="900" scrollable persistent>
      <v-card v-if="selectedAttendance" rounded="xl" class="ai-summary-modal">
        <v-card-title class="d-flex align-center pa-6 modal-header">
          <v-avatar color="success" size="48" class="mr-4">
            <v-icon color="white" size="28">mdi-robot</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h5 font-weight-bold">Análise da IA</div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              Atendimento de {{ getClientName(selectedAttendance.client_id) }}
            </div>
          </div>
          <v-btn
            icon
            variant="text"
            size="small"
            class="ml-2"
            @click="closeAISummaryModal"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-6">
          <!-- Summary Content -->
          <div v-if="selectedAttendance.ai_summary" class="mb-8">
            <div class="d-flex align-center mb-4">
              <v-icon color="primary" size="24" class="mr-3">mdi-text-box-outline</v-icon>
              <span class="text-h6 font-weight-bold">Resumo da Análise</span>
            </div>
            <div class="markdown-container pa-5">
              <div 
                class="text-body-1 markdown-content" 
                v-html="formatMarkdown(selectedAttendance.ai_summary)"
              ></div>
            </div>
          </div>

          <!-- Next Steps -->
          <div v-if="selectedAttendance.ai_next_steps" class="mb-8">
            <div class="d-flex align-center mb-4">
              <v-icon color="info" size="24" class="mr-3">mdi-arrow-right-circle</v-icon>
              <span class="text-h6 font-weight-bold">Próximos Passos Recomendados</span>
            </div>
            <v-alert
              type="info"
              variant="tonal"
              density="comfortable"
              class="mb-0 next-steps-alert"
            >
              <div class="ai-next-steps-content" v-html="formatAINextSteps(selectedAttendance.ai_next_steps)"></div>
            </v-alert>
          </div>

          <!-- Attendance Info -->
          <div class="attendance-info-section">
            <div class="text-subtitle-1 font-weight-bold mb-4">
              <v-icon size="20" class="mr-2">mdi-information-outline</v-icon>
              Informações do Atendimento
            </div>
            <v-row dense class="info-cards-row">
              <v-col cols="12" sm="6">
                <div class="info-card pa-4">
                  <div class="d-flex align-center">
                    <v-icon color="primary" size="24" class="mr-3">mdi-target</v-icon>
                    <div class="flex-grow-1">
                      <div class="text-caption text-medium-emphasis mb-1">Objetivo</div>
                      <div class="text-body-1 font-weight-medium">
                        {{ selectedAttendance.objective || 'Não definido' }}
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="info-card pa-4">
                  <div class="d-flex align-center">
                    <v-icon 
                      :color="getChannelColor(selectedAttendance.channel)" 
                      size="24" 
                      class="mr-3"
                    >
                      {{ getChannelIcon(selectedAttendance.channel) }}
                    </v-icon>
                    <div class="flex-grow-1">
                      <div class="text-caption text-medium-emphasis mb-1">Canal</div>
                      <div class="text-body-1 font-weight-medium">
                        {{ getChannelLabel(selectedAttendance.channel) }}
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="info-card pa-4">
                  <div class="d-flex align-center">
                    <v-icon 
                      :color="getStatusColor(selectedAttendance.status)" 
                      size="24" 
                      class="mr-3"
                    >
                      mdi-circle
                    </v-icon>
                    <div class="flex-grow-1">
                      <div class="text-caption text-medium-emphasis mb-1">Status</div>
                      <div class="text-body-1 font-weight-medium">
                        {{ getStatusLabel(selectedAttendance.status) }}
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="info-card pa-4">
                  <div class="d-flex align-center">
                    <v-icon color="grey-darken-1" size="24" class="mr-3">mdi-calendar-clock</v-icon>
                    <div class="flex-grow-1">
                      <div class="text-caption text-medium-emphasis mb-1">Criado em</div>
                      <div class="text-body-1 font-weight-medium">
                        {{ formatDateTime(selectedAttendance.created_at) }}
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>

        <v-card-actions class="pa-6 modal-actions">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            size="large"
            @click="closeAISummaryModal"
          >
            Fechar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            prepend-icon="mdi-arrow-right"
            @click="goToAttendanceDetails"
          >
            Ver Detalhes Completos
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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

// AI Summary Modal State
const showAISummaryModal = ref(false)
const selectedAttendance = ref<Attendance | null>(null)

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
  { title: 'Objetivo', key: 'objective', sortable: false },
  { title: 'Canal', key: 'channel', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Agente', key: 'agent_id', sortable: true },
  { title: 'Criado em', key: 'created_at', sortable: true },
  { title: 'Resumo IA', key: 'ai_summary', sortable: false },
]

// Options
const statusOptions = [
  { title: 'Ativo', value: 'ACTIVE' },
  { title: 'Concluído', value: 'COMPLETED' },
  { title: 'Perdido', value: 'LOST' },
  { title: 'Abandonado', value: 'ABANDONED' },
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
  result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

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

// AI Summary Modal Functions
const openAISummaryModal = (attendance: Attendance) => {
  selectedAttendance.value = attendance
  showAISummaryModal.value = true
}

const closeAISummaryModal = () => {
  showAISummaryModal.value = false
  setTimeout(() => {
    selectedAttendance.value = null
  }, 300)
}

const goToAttendanceDetails = () => {
  if (selectedAttendance.value) {
    closeAISummaryModal()
    router.push({ name: 'attendances-details', params: { id: selectedAttendance.value.id } })
  }
}

// Markdown formatting (same as AttendanceDetailsPage)
const formatMarkdown = (text: string): string => {
  if (!text) return ''
  
  // Simple markdown parser for common formatting
  let html = text
  
  // Code blocks first (to avoid processing markdown inside code)
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="markdown-pre"><code>$1</code></pre>')
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-subtitle-1 font-weight-bold mt-4 mb-2">$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-h6 font-weight-bold mt-4 mb-2">$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-h5 font-weight-bold mt-4 mb-3">$1</h1>')
  
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
  
  // Italic (avoid conflicts with bold)
  html = html.replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  html = html.replace(/(?<!_)_(?!_)([^_]+?)(?<!_)_(?!_)/g, '<em>$1</em>')
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="markdown-code">$1</code>')
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary">$1</a>')
  
  // Lists - process line by line
  const lines = html.split('\n')
  const processedLines: string[] = []
  let inList = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const unorderedMatch = line.match(/^[\*\-] (.+)$/)
    const orderedMatch = line.match(/^\d+\. (.+)$/)
    
    if (unorderedMatch || orderedMatch) {
      if (!inList) {
        processedLines.push('<ul class="markdown-list">')
        inList = true
      }
      processedLines.push(`<li>${unorderedMatch ? unorderedMatch[1] : orderedMatch![1]}</li>`)
    } else {
      if (inList) {
        processedLines.push('</ul>')
        inList = false
      }
      processedLines.push(line)
    }
  }
  
  if (inList) {
    processedLines.push('</ul>')
  }
  
  html = processedLines.join('\n')
  
  // Line breaks - double newline becomes paragraph break
  html = html.replace(/\n\n+/g, '</p><p class="mb-2">')
  html = html.replace(/\n/g, '<br>')
  
  // Wrap in paragraph if not already wrapped
  if (!html.trim().startsWith('<')) {
    html = '<p class="mb-2">' + html + '</p>'
  }
  
  return html
}

// Format AI Next Steps
const formatAINextSteps = (nextSteps: string): string => {
  if (!nextSteps) return ''
  
  // Translation maps for common English terms
  const translations: Record<string, string> = {
    'BUY': 'Comprar',
    'RENT': 'Alugar',
    'SELL': 'Vender',
    'INVEST': 'Investir',
    'LOW': 'Baixa',
    'MEDIUM': 'Média',
    'HIGH': 'Alta',
    'IMMEDIATE': 'Imediata',
    'HOUSE': 'Casa',
    'APARTMENT': 'Apartamento',
    'LAND': 'Terreno',
    'COMMERCIAL': 'Comercial',
    'RURAL': 'Rural',
  }
  
  let formatted = nextSteps
  
  // Replace English terms with Portuguese
  Object.entries(translations).forEach(([en, pt]) => {
    formatted = formatted.replace(new RegExp(`:\\s*${en}\\b`, 'gi'), `: ${pt}`)
    formatted = formatted.replace(new RegExp(`\\b${en}\\b`, 'g'), pt)
  })
  
  // Parse and filter lines
  const lines = formatted.split('\n')
  const filteredLines: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    
    // Skip lines that are just "Label: Value" with short values (metadata)
    if (trimmed.match(/^(Tipo de interesse|Urgência|Nível de urgência|Orçamento):\s*.{1,20}$/i)) {
      continue
    }
    
    filteredLines.push(trimmed)
  }
  
  // Format as HTML with proper styling
  if (filteredLines.length === 0) {
    return '<p class="text-medium-emphasis">Nenhum próximo passo específico definido.</p>'
  }
  
  const htmlLines = filteredLines.map(line => {
    // Check if it's a list item
    const listMatch = line.match(/^[-*•]\s*(.+)/)
    if (listMatch) {
      return `<li>${listMatch[1]}</li>`
    }
    const numberedMatch = line.match(/^\d+\.\s*(.+)/)
    if (numberedMatch) {
      return `<li>${numberedMatch[1]}</li>`
    }
    return `<p>${line}</p>`
  })
  
  // Wrap list items in ul
  let result = ''
  let inList = false
  
  for (const html of htmlLines) {
    if (html.startsWith('<li>')) {
      if (!inList) {
        result += '<ul class="ai-next-steps-list">'
        inList = true
      }
      result += html
    } else {
      if (inList) {
        result += '</ul>'
        inList = false
      }
      result += html
    }
  }
  
  if (inList) {
    result += '</ul>'
  }
  
  return result
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

.ai-summary-cell {
  display: flex;
  align-items: center;
}

.ai-summary-cell .v-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.ai-summary-cell .v-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.ai-summary-cell .v-btn:hover::before {
  width: 300px;
  height: 300px;
}

.ai-summary-cell .v-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 20px rgba(var(--v-theme-success), 0.35);
}

.ai-summary-cell .v-btn:active {
  transform: translateY(0) scale(0.98);
}

.cursor-pointer {
  cursor: pointer;
}

.border-t {
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

/* AI Summary Modal Styles */
.ai-summary-modal {
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-success), 0.08) 0%, rgba(var(--v-theme-primary), 0.04) 100%);
  border-bottom: none;
}

.markdown-container {
  background: rgba(var(--v-theme-surface-variant), 0.25);
  border-radius: 16px;
  border: none;
  backdrop-filter: blur(10px);
}

.next-steps-alert {
  border-radius: 16px;
  border: none;
}

.attendance-info-section {
  margin-top: 2rem;
  padding-top: 2rem;
}

.info-cards-row {
  margin: 0;
}

.info-card {
  background: rgba(var(--v-theme-surface-variant), 0.15);
  border-radius: 16px;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  backdrop-filter: blur(10px);
}

.info-card:hover {
  background: rgba(var(--v-theme-surface-variant), 0.25);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.modal-actions {
  background: rgba(var(--v-theme-surface-variant), 0.08);
  border-top: none;
}

/* Markdown Content Styles */
.markdown-content {
  line-height: 1.7;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  color: rgb(var(--v-theme-primary));
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.markdown-content :deep(h1) {
  font-size: 1.5rem;
  font-weight: bold;
}

.markdown-content :deep(h2) {
  font-size: 1.25rem;
  font-weight: 600;
}

.markdown-content :deep(h3) {
  font-size: 1.1rem;
  font-weight: 600;
}

.markdown-content :deep(p) {
  margin: 0.75rem 0;
  line-height: 1.7;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.markdown-content :deep(li) {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.markdown-content :deep(strong) {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.95);
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(code) {
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  color: rgb(var(--v-theme-primary));
}

.markdown-content :deep(pre) {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

.markdown-content :deep(a) {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  font-weight: 500;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-list {
  list-style-type: disc;
  padding-left: 1.5rem;
}

/* AI Next Steps Styles */
.ai-next-steps-content {
  line-height: 1.7;
}

.ai-next-steps-content :deep(.ai-next-steps-list) {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
  list-style-type: disc;
}

.ai-next-steps-content :deep(.ai-next-steps-list li) {
  margin: 0.5rem 0;
  padding-left: 0.25rem;
  line-height: 1.6;
}

.ai-next-steps-content :deep(p) {
  margin: 0.5rem 0;
  line-height: 1.7;
}

.ai-next-steps-content :deep(p:first-child) {
  margin-top: 0;
}

.ai-next-steps-content :deep(p:last-child) {
  margin-bottom: 0;
}
</style>

