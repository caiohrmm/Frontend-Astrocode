<template>
  <div>
    <!-- Header Card -->
    <v-card elevation="2" class="mb-4">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-3" size="32" color="primary">mdi-account-group</v-icon>
        <span class="text-h5">Clientes</span>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="showCreateDialog = true"
        >
          Novo Cliente
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- Create/Edit Client Dialog -->
    <ClientCreateDialog
      v-model="showCreateDialog"
      :client="clientToEdit"
      @saved="handleClientSaved"
      @error="handleClientError"
    />

    <!-- Filters Card -->
    <v-card elevation="2" class="mb-4">
      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              label="Buscar por nome ou telefone"
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
              v-model="filters.urgency"
              :items="urgencyOptions"
              label="Urgência"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @update:model-value="applyFilters"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.assigned_agent_id"
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

    <!-- Clients Table -->
    <v-card elevation="2">
      <v-data-table
        :headers="headers"
        :items="filteredClients"
        :loading="isLoading"
        item-value="id"
        class="elevation-0"
        @click:row="handleRowClick"
      >
        <!-- Name Column -->
        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="32" class="mr-3">
              <span class="text-caption text-white">
                {{ getInitials(item.name) }}
              </span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.name }}</div>
              <div v-if="item.email" class="text-caption text-medium-emphasis">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <!-- Phone Column -->
        <template #item.phone="{ item }">
          <span>{{ formatPhone(item.phone) }}</span>
        </template>

        <!-- Status Column -->
        <template #item.current_status="{ item }">
          <v-chip
            v-if="item.current_status"
            :color="getStatusColor(item.current_status)"
            variant="flat"
            size="small"
          >
            {{ getStatusLabel(item.current_status) }}
          </v-chip>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <!-- Urgency Column -->
        <template #item.current_urgency_level="{ item }">
          <v-chip
            v-if="item.current_urgency_level"
            :color="getUrgencyColor(item.current_urgency_level)"
            variant="flat"
            size="small"
          >
            {{ getUrgencyLabel(item.current_urgency_level) }}
          </v-chip>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <!-- Lead Score Column -->
        <template #item.current_lead_score="{ item }">
          <div v-if="item.current_lead_score !== null" class="d-flex align-center">
            <v-progress-linear
              :model-value="item.current_lead_score"
              :color="getLeadScoreColor(item.current_lead_score)"
              height="20"
              rounded
              class="mr-2"
              style="min-width: 80px;"
            ></v-progress-linear>
            <span class="text-caption font-weight-medium">
              {{ item.current_lead_score }}
            </span>
          </div>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <!-- Last Contact Column -->
        <template #item.last_contact_at="{ item }">
          <span v-if="item.last_contact_at" class="text-caption">
            {{ formatDate(item.last_contact_at) }}
          </span>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <!-- Next Follow-up Column -->
        <template #item.next_follow_up_at="{ item }">
          <span
            v-if="item.next_follow_up_at"
            :class="getFollowUpClass(item.next_follow_up_at)"
            class="text-caption font-weight-medium"
          >
            {{ formatDate(item.next_follow_up_at) }}
          </span>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <!-- Loading State -->
        <template #loading>
          <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
        </template>

        <!-- Empty State -->
        <template #no-data>
          <div class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-account-off</v-icon>
            <div class="text-h6 text-medium-emphasis mb-2">Nenhum cliente encontrado</div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              {{ searchQuery || hasActiveFilters ? 'Tente ajustar os filtros de busca' : 'Comece criando um novo cliente' }}
            </div>
            <v-btn
              v-if="!hasActiveFilters"
              color="primary"
              prepend-icon="mdi-plus"
              @click="showCreateDialog = true"
            >
              Novo Cliente
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
  clientsService,
  type Client,
  type ClientStatus,
  type UrgencyLevel,
} from '@/shared/services/clients.service'
import { usersService, type User } from '@/shared/services/users.service'
import { formatPhone } from '@/shared/utils/masks'
import ClientCreateDialog from '@/shared/components/ClientCreateDialog.vue'

const router = useRouter()

// State
const clients = ref<Client[]>([])
const isLoading = ref(false)
const searchQuery = ref('')
const filters = ref({
  status: null as ClientStatus | null,
  urgency: null as UrgencyLevel | null,
  assigned_agent_id: null as string | null,
})
const agents = ref<User[]>([])
const showCreateDialog = ref(false)
const clientToEdit = ref<Client | null>(null)

// Table Headers
const headers = [
  { title: 'Nome', key: 'name', sortable: true },
  { title: 'Telefone', key: 'phone', sortable: true },
  { title: 'Status', key: 'current_status', sortable: true },
  { title: 'Urgência', key: 'current_urgency_level', sortable: true },
  { title: 'Lead Score', key: 'current_lead_score', sortable: true },
  { title: 'Último Contato', key: 'last_contact_at', sortable: true },
  { title: 'Próximo Follow-up', key: 'next_follow_up_at', sortable: true },
]

// Options
const statusOptions = [
  { title: 'Novo Lead', value: 'NEW_LEAD' },
  { title: 'Contatado', value: 'CONTACTED' },
  { title: 'Qualificado', value: 'QUALIFIED' },
  { title: 'Visita Agendada', value: 'VISIT_SCHEDULED' },
  { title: 'Visitando', value: 'VISITING' },
  { title: 'Proposta Enviada', value: 'PROPOSAL_SENT' },
  { title: 'Negociando', value: 'NEGOTIATING' },
  { title: 'Ganho', value: 'WON' },
  { title: 'Perdido', value: 'LOST' },
  { title: 'Inativo', value: 'INACTIVE' },
]

const urgencyOptions = [
  { title: 'Baixa', value: 'LOW' },
  { title: 'Média', value: 'MEDIUM' },
  { title: 'Alta', value: 'HIGH' },
  { title: 'Imediata', value: 'IMMEDIATE' },
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
    filters.value.urgency ||
    filters.value.assigned_agent_id
  )
})

const filteredClients = computed(() => {
  let result = [...clients.value]

  // Search filter (name or phone)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      client =>
        client.name.toLowerCase().includes(query) ||
        client.phone.replace(/\D/g, '').includes(query.replace(/\D/g, ''))
    )
  }

  // Status filter
  if (filters.value.status) {
    result = result.filter(client => client.current_status === filters.value.status)
  }

  // Urgency filter
  if (filters.value.urgency) {
    result = result.filter(client => client.current_urgency_level === filters.value.urgency)
  }

  // Agent filter
  if (filters.value.assigned_agent_id) {
    result = result.filter(
      client => client.assigned_agent_id === filters.value.assigned_agent_id
    )
  }

  return result
})

// Methods
const loadClients = async () => {
  isLoading.value = true
  try {
    clients.value = await clientsService.getClients({ limit: 1000 }) // Get all for frontend filtering
  } catch (error) {
    console.error('Error loading clients:', error)
    // TODO: Show error notification
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

const handleSearch = () => {
  // Search is reactive via computed property
}

const applyFilters = () => {
  // Filters are reactive via computed property
}

const clearFilters = () => {
  filters.value = {
    status: null,
    urgency: null,
    assigned_agent_id: null,
  }
  searchQuery.value = ''
}

const handleRowClick = (_event: Event, { item }: { item: Client }) => {
  router.push({ name: 'clients-details', params: { id: item.id } })
}

const handleClientSaved = async (client: Client) => {
  // Reload clients list to show the new/updated client
  await loadClients()
  // Optionally show success message
  console.log('Client saved successfully:', client)
}

const handleClientError = (error: string) => {
  // Show error to user
  alert(`Erro ao salvar cliente: ${error}`)
  console.error('Client save error:', error)
}

// Formatting helpers
const getInitials = (name: string): string => {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const getStatusLabel = (status: ClientStatus): string => {
  const labels: Record<ClientStatus, string> = {
    NEW_LEAD: 'Novo Lead',
    CONTACTED: 'Contatado',
    QUALIFIED: 'Qualificado',
    VISIT_SCHEDULED: 'Visita Agendada',
    VISITING: 'Visitando',
    PROPOSAL_SENT: 'Proposta Enviada',
    NEGOTIATING: 'Negociando',
    WON: 'Ganho',
    LOST: 'Perdido',
    INACTIVE: 'Inativo',
  }
  return labels[status] || status
}

const getStatusColor = (status: ClientStatus): string => {
  const colors: Record<ClientStatus, string> = {
    NEW_LEAD: 'blue',
    CONTACTED: 'cyan',
    QUALIFIED: 'teal',
    VISIT_SCHEDULED: 'orange',
    VISITING: 'deep-orange',
    PROPOSAL_SENT: 'amber',
    NEGOTIATING: 'purple',
    WON: 'success',
    LOST: 'error',
    INACTIVE: 'grey',
  }
  return colors[status] || 'grey'
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

const getUrgencyColor = (urgency: UrgencyLevel): string => {
  const colors: Record<UrgencyLevel, string> = {
    LOW: 'grey',
    MEDIUM: 'blue',
    HIGH: 'orange',
    IMMEDIATE: 'error',
  }
  return colors[urgency] || 'grey'
}

const getLeadScoreColor = (score: number): string => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'info'
  if (score >= 40) return 'warning'
  return 'error'
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

const getFollowUpClass = (dateString: string): string => {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const followUpDate = new Date(date)
  followUpDate.setHours(0, 0, 0, 0)

  const diffTime = followUpDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'text-error' // Past due
  if (diffDays === 0) return 'text-warning' // Today
  if (diffDays <= 3) return 'text-orange' // Soon
  return 'text-success' // Future
}

onMounted(() => {
  loadClients()
  loadAgents()
})
</script>

<style scoped>
:deep(.v-data-table__tr) {
  cursor: pointer;
}

:deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>

