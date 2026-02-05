<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="d-flex justify-center align-center" style="min-height: 400px">
      <v-skeleton-loader type="card" width="100%"></v-skeleton-loader>
    </div>

    <!-- Content -->
    <div v-else-if="client">
      <!-- Header Card -->
      <v-card elevation="2" class="mb-4" rounded="lg">
        <v-card-title class="d-flex align-center pa-4">
          <v-btn
            icon
            variant="text"
            class="mr-2"
            @click="goBack"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-avatar color="primary" size="48" class="mr-3">
            <span class="text-h6 text-white">
              {{ getInitials(client.name) }}
            </span>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h5 font-weight-bold">{{ client.name }}</div>
            <div v-if="client.email" class="text-caption text-medium-emphasis">
              {{ client.email }}
            </div>
            <div v-if="client.phone" class="text-caption text-medium-emphasis">
              {{ formatPhone(client.phone) }}
            </div>
          </div>
          <v-spacer></v-spacer>
          <div class="d-flex flex-column align-end ga-2">
            <!-- Status -->
            <v-chip
              v-if="client.current_status"
              :color="getStatusColor(client.current_status)"
              variant="flat"
              size="large"
            >
              <v-icon start size="18">{{ getStatusIcon(client.current_status) }}</v-icon>
              {{ getStatusLabel(client.current_status) }}
            </v-chip>
            <!-- Urgency -->
            <v-chip
              v-if="client.current_urgency_level"
              :color="getUrgencyColor(client.current_urgency_level)"
              variant="flat"
              size="small"
            >
              <v-icon start size="16">mdi-alert-circle</v-icon>
              {{ getUrgencyLabel(client.current_urgency_level) }}
            </v-chip>
          </div>
        </v-card-title>

        <!-- Lead Score -->
        <v-card-subtitle v-if="client.current_lead_score !== null" class="pa-4 pt-0">
          <div class="d-flex align-center ga-3">
            <span class="text-body-2 font-weight-medium">Lead Score:</span>
            <v-progress-linear
              :model-value="client.current_lead_score"
              :color="getLeadScoreColor(client.current_lead_score)"
              height="24"
              rounded
              style="flex: 1; max-width: 300px;"
            ></v-progress-linear>
            <span class="text-body-1 font-weight-bold">
              {{ client.current_lead_score }}/100
            </span>
          </div>
        </v-card-subtitle>
      </v-card>

      <!-- Tabs -->
      <v-card elevation="2" rounded="lg">
        <v-tabs
          v-model="activeTab"
          bg-color="primary"
          slider-color="white"
        >
          <v-tab value="overview">
            <v-icon start>mdi-account</v-icon>
            Visão Geral
          </v-tab>
          <v-tab value="attendances">
            <v-icon start>mdi-phone</v-icon>
            Atendimentos
          </v-tab>
          <v-tab value="insights">
            <v-icon start>mdi-robot</v-icon>
            Insights da IA
          </v-tab>
          <v-tab value="followup">
            <v-icon start>mdi-calendar-clock</v-icon>
            Follow-up
          </v-tab>
        </v-tabs>

        <v-card-text class="pa-6">
          <v-window v-model="activeTab">
            <!-- Tab 1: Visão Geral -->
            <v-window-item value="overview">
              <v-row>
                <!-- Status -->
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-flag</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Status</span>
                  </div>
                  <v-select
                    v-model="editableFields.current_status"
                    :items="statusOptions"
                    variant="outlined"
                    density="compact"
                    @update:model-value="handleFieldUpdate('current_status', $event)"
                  >
                    <template #item="{ item }">
                      <v-chip
                        :color="getStatusColor(item.value)"
                        variant="flat"
                        size="small"
                      >
                        {{ item.title }}
                      </v-chip>
                    </template>
                  </v-select>
                </v-col>

                <!-- Urgência -->
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-alert-circle</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Urgência</span>
                  </div>
                  <v-select
                    v-model="editableFields.current_urgency_level"
                    :items="urgencyOptions"
                    variant="outlined"
                    density="compact"
                    @update:model-value="handleFieldUpdate('current_urgency_level', $event)"
                  ></v-select>
                </v-col>

                <!-- Agente Responsável -->
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-account-tie</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Agente Responsável</span>
                  </div>
                  <v-select
                    v-model="editableFields.assigned_agent_id"
                    :items="agentOptions"
                    variant="outlined"
                    density="compact"
                    clearable
                    @update:model-value="handleFieldUpdate('assigned_agent_id', $event)"
                  ></v-select>
                </v-col>

                <!-- Tipo de Interesse -->
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-handshake</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Tipo de Interesse</span>
                  </div>
                  <v-select
                    v-model="editableFields.current_interest_type"
                    :items="interestTypeOptions"
                    variant="outlined"
                    density="compact"
                    clearable
                    @update:model-value="handleFieldUpdate('current_interest_type', $event)"
                  ></v-select>
                </v-col>

                <!-- Tipo de Imóvel -->
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-home-variant</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Tipo de Imóvel</span>
                  </div>
                  <v-select
                    v-model="editableFields.current_property_type"
                    :items="propertyTypeOptions"
                    variant="outlined"
                    density="compact"
                    clearable
                    @update:model-value="handleFieldUpdate('current_property_type', $event)"
                  ></v-select>
                </v-col>

                <!-- Cidade de Interesse -->
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-map-marker</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Cidade de Interesse</span>
                  </div>
                  <v-text-field
                    v-model="editableFields.current_city_interest"
                    variant="outlined"
                    density="compact"
                    @blur="handleFieldUpdate('current_city_interest', editableFields.current_city_interest)"
                  ></v-text-field>
                </v-col>

                <!-- Orçamento Mínimo -->
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-currency-usd</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Orçamento Mínimo</span>
                  </div>
                  <v-text-field
                    v-model="budgetMinFormatted"
                    @blur="handleBudgetMinUpdate"
                    variant="outlined"
                    density="compact"
                    prefix="R$"
                  ></v-text-field>
                </v-col>

                <!-- Orçamento Máximo -->
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-currency-usd-circle</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Orçamento Máximo</span>
                  </div>
                  <v-text-field
                    v-model="budgetMaxFormatted"
                    @blur="handleBudgetMaxUpdate"
                    variant="outlined"
                    density="compact"
                    prefix="R$"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Tab 2: Atendimentos -->
            <v-window-item value="attendances">
              <div class="text-center pa-8">
                <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-phone-off</v-icon>
                <div class="text-h6 text-medium-emphasis mb-2">Nenhum atendimento registrado</div>
                <div class="text-body-2 text-medium-emphasis">
                  Os atendimentos deste cliente aparecerão aqui quando forem criados.
                </div>
              </div>
            </v-window-item>

            <!-- Tab 3: Insights da IA -->
            <v-window-item value="insights">
              <v-row>
                <!-- Resumo do Cliente -->
                <v-col cols="12">
                  <v-card variant="outlined" class="mb-4">
                    <v-card-title class="d-flex align-center">
                      <v-icon class="mr-2" color="primary">mdi-account-circle</v-icon>
                      Resumo do Cliente
                    </v-card-title>
                    <v-card-text>
                      <div v-if="client.summary_notes" class="text-body-1" v-html="formatMarkdown(client.summary_notes)"></div>
                      <v-alert v-else type="info" variant="tonal">
                        Nenhum resumo disponível. O resumo será gerado automaticamente pela IA com base nos atendimentos.
                      </v-alert>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Perfil de Interesse -->
                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-title class="d-flex align-center">
                      <v-icon class="mr-2" color="primary">mdi-heart</v-icon>
                      Perfil de Interesse
                    </v-card-title>
                    <v-card-text>
                      <div v-if="hasInterestProfile" class="d-flex flex-column ga-2">
                        <div v-if="client.current_interest_type">
                          <strong>Tipo:</strong> {{ getInterestTypeLabel(client.current_interest_type) }}
                        </div>
                        <div v-if="client.current_property_type">
                          <strong>Imóvel:</strong> {{ getPropertyTypeLabel(client.current_property_type) }}
                        </div>
                        <div v-if="client.current_city_interest">
                          <strong>Cidade:</strong> {{ client.current_city_interest }}
                        </div>
                        <div v-if="client.current_budget_min || client.current_budget_max">
                          <strong>Orçamento:</strong>
                          {{ formatBudgetRange() }}
                        </div>
                      </div>
                      <v-alert v-else type="info" variant="tonal">
                        Perfil de interesse ainda não definido.
                      </v-alert>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Potencial de Conversão -->
                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-title class="d-flex align-center">
                      <v-icon class="mr-2" color="primary">mdi-chart-line</v-icon>
                      Potencial de Conversão
                    </v-card-title>
                    <v-card-text>
                      <div v-if="client.current_lead_score !== null" class="d-flex flex-column ga-3">
                        <div>
                          <div class="text-caption text-medium-emphasis mb-2">Lead Score</div>
                          <v-progress-linear
                            :model-value="client.current_lead_score"
                            :color="getLeadScoreColor(client.current_lead_score)"
                            height="32"
                            rounded
                          ></v-progress-linear>
                          <div class="text-center mt-2">
                            <span class="text-h6 font-weight-bold">
                              {{ client.current_lead_score }}/100
                            </span>
                          </div>
                        </div>
                        <v-alert
                          :type="getLeadScoreAlertType(client.current_lead_score)"
                          variant="tonal"
                        >
                          {{ getLeadScoreMessage(client.current_lead_score) }}
                        </v-alert>
                      </div>
                      <v-alert v-else type="info" variant="tonal">
                        Lead score ainda não calculado.
                      </v-alert>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Sugestão de Próximos Passos -->
                <v-col cols="12">
                  <v-card variant="outlined">
                    <v-card-title class="d-flex align-center">
                      <v-icon class="mr-2" color="primary">mdi-lightbulb-on</v-icon>
                      Sugestão de Próximos Passos
                    </v-card-title>
                    <v-card-text>
                      <v-alert type="info" variant="tonal">
                        As sugestões de próximos passos serão geradas automaticamente pela IA com base no histórico de atendimentos e perfil do cliente.
                      </v-alert>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Tab 4: Follow-up -->
            <v-window-item value="followup">
              <v-row>
                <!-- Próximo Follow-up -->
                <v-col cols="12" md="6">
                  <v-card variant="outlined" class="mb-4">
                    <v-card-title class="d-flex align-center">
                      <v-icon class="mr-2" color="primary">mdi-calendar-clock</v-icon>
                      Próximo Follow-up
                    </v-card-title>
                    <v-card-text>
                      <div v-if="client.next_follow_up_at" class="d-flex flex-column ga-3">
                        <div>
                          <div class="text-h6 font-weight-bold">
                            {{ formatDateTime(client.next_follow_up_at) }}
                          </div>
                          <div
                            :class="getFollowUpClass(client.next_follow_up_at)"
                            class="text-caption font-weight-medium mt-2"
                          >
                            {{ getFollowUpStatus(client.next_follow_up_at) }}
                          </div>
                        </div>
                        <v-btn
                          color="primary"
                          prepend-icon="mdi-calendar-plus"
                          @click="showScheduleDialog = true"
                        >
                          Reagendar
                        </v-btn>
                      </div>
                      <div v-else class="d-flex flex-column ga-3">
                        <v-alert type="warning" variant="tonal">
                          Nenhum follow-up agendado.
                        </v-alert>
                        <v-btn
                          color="primary"
                          prepend-icon="mdi-calendar-plus"
                          @click="showScheduleDialog = true"
                        >
                          Agendar Próximo Contato
                        </v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Histórico de Contatos -->
                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-title class="d-flex align-center">
                      <v-icon class="mr-2" color="primary">mdi-history</v-icon>
                      Histórico de Contatos
                    </v-card-title>
                    <v-card-text>
                      <div v-if="client.first_contact_at || client.last_contact_at" class="d-flex flex-column ga-3">
                        <div v-if="client.first_contact_at">
                          <div class="text-caption text-medium-emphasis">Primeiro Contato</div>
                          <div class="text-body-1 font-weight-medium">
                            {{ formatDateTime(client.first_contact_at) }}
                          </div>
                        </div>
                        <div v-if="client.last_contact_at">
                          <div class="text-caption text-medium-emphasis">Último Contato</div>
                          <div class="text-body-1 font-weight-medium">
                            {{ formatDateTime(client.last_contact_at) }}
                          </div>
                        </div>
                      </div>
                      <v-alert v-else type="info" variant="tonal">
                        Nenhum histórico de contato disponível.
                      </v-alert>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </div>

    <!-- Error State -->
    <v-card v-else elevation="2" class="text-center pa-8">
      <v-icon color="error" size="64" class="mb-4">mdi-alert-circle</v-icon>
      <div class="text-h6 mb-2">Cliente não encontrado</div>
      <div class="text-body-2 text-medium-emphasis mb-4">
        O cliente que você está procurando não existe ou foi removido.
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-arrow-left"
        @click="goBack"
      >
        Voltar para Lista
      </v-btn>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  clientsService,
  type Client,
  type ClientStatus,
  type UrgencyLevel,
  type InterestType,
  type PropertyType,
  type ClientUpdate,
} from '@/shared/services/clients.service'
import { usersService, type User } from '@/shared/services/users.service'
import { formatPhone, formatCurrency, parseCurrency } from '@/shared/utils/masks'
// Markdown formatting (using simple parser, not marked library)

const route = useRoute()
const router = useRouter()

// State
const client = ref<Client | null>(null)
const isLoading = ref(true)
const activeTab = ref('overview')
const agents = ref<User[]>([])
const showScheduleDialog = ref(false)

// Editable fields (for inline editing)
const editableFields = ref<Partial<ClientUpdate>>({})
const budgetMinFormatted = ref('')
const budgetMaxFormatted = ref('')

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

const interestTypeOptions = [
  { title: 'Comprar', value: 'BUY' },
  { title: 'Alugar', value: 'RENT' },
  { title: 'Vender', value: 'SELL' },
  { title: 'Investir', value: 'INVEST' },
]

const propertyTypeOptions = [
  { title: 'Casa', value: 'HOUSE' },
  { title: 'Apartamento', value: 'APARTMENT' },
  { title: 'Terreno', value: 'LAND' },
  { title: 'Comercial', value: 'COMMERCIAL' },
  { title: 'Rural', value: 'RURAL' },
]

const agentOptions = computed(() => {
  return agents.value.map(agent => ({
    title: agent.full_name,
    value: agent.id,
  }))
})

// Computed
const hasInterestProfile = computed(() => {
  return !!(
    client.value?.current_interest_type ||
    client.value?.current_property_type ||
    client.value?.current_city_interest ||
    client.value?.current_budget_min ||
    client.value?.current_budget_max
  )
})

// Methods
const loadClient = async () => {
  isLoading.value = true
  try {
    const clientId = route.params.id as string
    client.value = await clientsService.getClientById(clientId)
    
    // Initialize editable fields
    editableFields.value = {
      current_status: client.value.current_status,
      current_urgency_level: client.value.current_urgency_level,
      assigned_agent_id: client.value.assigned_agent_id,
      current_interest_type: client.value.current_interest_type,
      current_property_type: client.value.current_property_type,
      current_city_interest: client.value.current_city_interest,
      current_budget_min: client.value.current_budget_min,
      current_budget_max: client.value.current_budget_max,
    }
    
    // Format budget fields
    budgetMinFormatted.value = client.value.current_budget_min
      ? formatCurrency(parseFloat(client.value.current_budget_min))
      : ''
    budgetMaxFormatted.value = client.value.current_budget_max
      ? formatCurrency(parseFloat(client.value.current_budget_max))
      : ''
  } catch (error) {
    console.error('Error loading client:', error)
    client.value = null
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

const handleFieldUpdate = async (field: keyof ClientUpdate, value: any) => {
  if (!client.value) return
  
  try {
    const updateData: ClientUpdate = {
      [field]: value,
    }
    
    client.value = await clientsService.updateClient(client.value.id, updateData)
    
    // Update local state
    editableFields.value[field] = value
  } catch (error: any) {
    console.error(`Error updating ${field}:`, error)
    alert(`Erro ao atualizar ${field}: ${error.message}`)
    // Reload client to revert changes
    await loadClient()
  }
}

const handleBudgetMinUpdate = async () => {
  const parsed = parseCurrency(budgetMinFormatted.value)
  await handleFieldUpdate('current_budget_min', parsed ? String(parsed) : null)
}

const handleBudgetMaxUpdate = async () => {
  const parsed = parseCurrency(budgetMaxFormatted.value)
  await handleFieldUpdate('current_budget_max', parsed ? String(parsed) : null)
}

const formatBudgetRange = (): string => {
  const min = client.value?.current_budget_min
    ? formatCurrency(parseFloat(client.value.current_budget_min))
    : null
  const max = client.value?.current_budget_max
    ? formatCurrency(parseFloat(client.value.current_budget_max))
    : null
  
  if (min && max) return `${min} - ${max}`
  if (min) return `A partir de ${min}`
  if (max) return `Até ${max}`
  return 'Não definido'
}

const formatMarkdown = (text: string): string => {
  if (!text) return ''
  
  // Simple markdown parser for common formatting
  let html = text
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>')
  
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/_(.*?)_/g, '<em>$1</em>')
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
  
  // Line breaks
  html = html.replace(/\n/g, '<br>')
  
  // Code blocks
  html = html.replace(/`([^`]+)`/g, '<code class="markdown-code">$1</code>')
  
  return html
}

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
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

  if (diffDays < 0) return 'text-error'
  if (diffDays === 0) return 'text-warning'
  if (diffDays <= 3) return 'text-orange'
  return 'text-success'
}

const getFollowUpStatus = (dateString: string): string => {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const followUpDate = new Date(date)
  followUpDate.setHours(0, 0, 0, 0)

  const diffTime = followUpDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return `Atrasado há ${Math.abs(diffDays)} dia(s)`
  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Amanhã'
  if (diffDays <= 7) return `Em ${diffDays} dias`
  return `Em ${diffDays} dias`
}

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

const getStatusIcon = (status: ClientStatus): string => {
  const icons: Record<ClientStatus, string> = {
    NEW_LEAD: 'mdi-star',
    CONTACTED: 'mdi-phone',
    QUALIFIED: 'mdi-check-circle',
    VISIT_SCHEDULED: 'mdi-calendar',
    VISITING: 'mdi-walk',
    PROPOSAL_SENT: 'mdi-file-send',
    NEGOTIATING: 'mdi-handshake',
    WON: 'mdi-trophy',
    LOST: 'mdi-close-circle',
    INACTIVE: 'mdi-pause-circle',
  }
  return icons[status] || 'mdi-help-circle'
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

const getInterestTypeLabel = (type: InterestType): string => {
  const labels: Record<InterestType, string> = {
    BUY: 'Comprar',
    RENT: 'Alugar',
    SELL: 'Vender',
    INVEST: 'Investir',
  }
  return labels[type] || type
}

const getPropertyTypeLabel = (type: PropertyType): string => {
  const labels: Record<PropertyType, string> = {
    HOUSE: 'Casa',
    APARTMENT: 'Apartamento',
    LAND: 'Terreno',
    COMMERCIAL: 'Comercial',
    RURAL: 'Rural',
  }
  return labels[type] || type
}

const getLeadScoreColor = (score: number): string => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'info'
  if (score >= 40) return 'warning'
  return 'error'
}

const getLeadScoreAlertType = (score: number): string => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'info'
  if (score >= 40) return 'warning'
  return 'error'
}

const getLeadScoreMessage = (score: number): string => {
  if (score >= 80) return 'Excelente potencial de conversão! Cliente muito qualificado.'
  if (score >= 60) return 'Bom potencial de conversão. Cliente qualificado.'
  if (score >= 40) return 'Potencial moderado. Requer mais qualificação.'
  return 'Baixo potencial. Necessita mais informações e qualificação.'
}

const goBack = () => {
  router.push({ name: 'clients' })
}

onMounted(() => {
  loadClient()
  loadAgents()
})
</script>

<style scoped>
:deep(.v-card) {
  transition: box-shadow 0.2s ease;
}

:deep(.v-card:hover) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12) !important;
}

/* Markdown styles */
:deep(.v-card-text) {
  line-height: 1.6;
}

:deep(.v-card-text h1),
:deep(.v-card-text h2),
:deep(.v-card-text h3) {
  margin-top: 1em;
  margin-bottom: 0.5em;
}

:deep(.v-card-text ul),
:deep(.v-card-text ol) {
  margin-left: 1.5em;
  margin-bottom: 1em;
}

:deep(.v-card-text p) {
  margin-bottom: 1em;
}
</style>

