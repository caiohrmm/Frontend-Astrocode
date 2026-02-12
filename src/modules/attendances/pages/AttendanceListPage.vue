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
      <v-card v-if="selectedAttendance" variant="flat" class="ai-summary-modal">
        <!-- Header -->
        <v-card-title class="d-flex align-center pa-6 pb-4">
          <div class="d-flex align-center flex-grow-1">
            <v-avatar color="success" size="40" class="mr-4">
              <v-icon color="white" size="22">mdi-robot</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">Análise da IA</div>
              <div class="text-caption text-medium-emphasis mt-1">
                Atendimento de {{ getClientName(selectedAttendance.client_id) }}
              </div>
            </div>
          </div>
          <v-btn
            icon
            variant="text"
            size="small"
            @click.stop="closeAISummaryModal"
          >
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-6 pt-2">
          <!-- Summary Content -->
          <div v-if="selectedAttendance.ai_summary" class="mb-8">
            <h3 class="text-subtitle-2 font-weight-medium text-medium-emphasis mb-3">
              Resumo da Análise
            </h3>
            <div 
              class="text-body-1 markdown-content" 
              style="line-height: 1.7; color: rgba(var(--v-theme-on-surface), 0.87);"
              v-html="formatMarkdown(selectedAttendance.ai_summary)"
            ></div>
          </div>

          <!-- Next Steps -->
          <div v-if="selectedAttendance.ai_next_steps" class="mb-8">
            <h3 class="text-subtitle-2 font-weight-medium text-medium-emphasis mb-3">
              Próximos Passos
            </h3>
            <v-list variant="flat" density="comfortable" class="pa-0">
              <template v-for="(step, index) in parsedNextSteps" :key="index">
                <v-list-item class="px-0 py-2">
                  <template #prepend>
                    <v-icon 
                      :color="step.isUrgent ? 'error' : 'primary'" 
                      size="18" 
                      class="mr-3"
                    >
                      {{ step.isUrgent ? 'mdi-alert-circle' : 'mdi-arrow-right' }}
                    </v-icon>
                  </template>
                  <v-list-item-title 
                    :class="step.isUrgent ? 'font-weight-medium' : 'text-body-2'"
                    style="line-height: 1.6;"
                  >
                    {{ step.text }}
                  </v-list-item-title>
                </v-list-item>
                <v-divider v-if="index < parsedNextSteps.length - 1" class="my-1" />
              </template>
            </v-list>
          </div>

          <!-- Attendance Info -->
          <div class="attendance-info-section">
            <h3 class="text-subtitle-2 font-weight-medium text-medium-emphasis mb-4">
              Informações do Atendimento
            </h3>
            <v-row dense>
              <v-col cols="12" sm="6" class="pb-2">
                <div class="info-field">
                  <div class="text-caption text-medium-emphasis mb-1">Objetivo</div>
                  <div class="text-body-2 font-weight-medium">
                    {{ selectedAttendance.objective || 'Não definido' }}
                  </div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" class="pb-2">
                <div class="info-field">
                  <div class="text-caption text-medium-emphasis mb-1">Canal</div>
                  <div class="text-body-2 font-weight-medium">
                    {{ getChannelLabel(selectedAttendance.channel) }}
                  </div>
                </div>
              </v-col>
              <v-col cols="12" sm="6" class="pb-2">
                <div class="info-field">
                  <div class="text-caption text-medium-emphasis mb-1">Status</div>
                  <v-chip
                    :color="getStatusColor(selectedAttendance.status)"
                    variant="tonal"
                    size="small"
                    class="mt-1"
                  >
                    {{ getStatusLabel(selectedAttendance.status) }}
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="12" sm="6" class="pb-2">
                <div class="info-field">
                  <div class="text-caption text-medium-emphasis mb-1">Criado em</div>
                  <div class="text-body-2 font-weight-medium">
                    {{ formatDateTime(selectedAttendance.created_at) }}
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-card-text>

        <v-divider class="mx-6" />

        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="closeAISummaryModal"
          >
            Fechar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
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

// Computed for parsed next steps
const parsedNextSteps = computed(() => {
  if (!selectedAttendance.value?.ai_next_steps) return []
  return parseNextSteps(selectedAttendance.value.ai_next_steps)
})

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

// Parse Next Steps into array for v-list
const parseNextSteps = (nextSteps: string): Array<{ text: string; isUrgent: boolean }> => {
  if (!nextSteps) return []
  
  const steps: Array<{ text: string; isUrgent: boolean }> = []
  const lines = nextSteps.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    
    // Remove bullet points and numbering
    let cleanText = trimmed
      .replace(/^[-*•]\s*/, '')
      .replace(/^\d+\.\s*/, '')
      .trim()
    
    if (!cleanText) continue
    
    // Check if it's urgent (contains urgent keywords)
    const isUrgent = /urgente|imediata|imediato|24h|hoje|agora/i.test(cleanText)
    
    steps.push({
      text: cleanText,
      isUrgent,
    })
  }
  
  return steps
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

/* AI Summary Modal Styles - Modern SaaS Design */
.ai-summary-modal {
  overflow: hidden;
}

.attendance-info-section {
  margin-top: 2rem;
  padding-top: 2rem;
}

.info-field {
  padding-bottom: 0.5rem;
}

/* Markdown Content Styles - Clean and Minimal */
.markdown-content {
  line-height: 1.7;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  color: rgba(var(--v-theme-on-surface), 0.87);
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.markdown-content :deep(h1) {
  font-size: 1.25rem;
}

.markdown-content :deep(h2) {
  font-size: 1.125rem;
}

.markdown-content :deep(h3) {
  font-size: 1rem;
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
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  padding: 0.15rem 0.35rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875em;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

.markdown-content :deep(pre) {
  background-color: rgba(var(--v-theme-surface-variant), 0.2);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
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
</style>

