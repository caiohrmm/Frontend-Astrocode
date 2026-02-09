<template>
  <div>
    <!-- Loading State -->
    <v-card v-if="isLoading" elevation="2">
      <v-card-text class="text-center pa-8">
        <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
        <div class="text-body-1 mt-4">Carregando visita...</div>
      </v-card-text>
    </v-card>

    <template v-else-if="visit">
      <!-- Header Card -->
      <v-card elevation="2" class="mb-4">
        <v-card-title class="d-flex align-center pa-4">
          <v-btn icon variant="text" class="mr-2" @click="goBack">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-icon class="mr-3" size="32" color="primary">mdi-calendar-check</v-icon>
          <div>
            <div class="text-h5">Detalhes da Visita</div>
            <div class="text-caption text-medium-emphasis">{{ formatDateTime(visit.scheduled_at) }}</div>
          </div>
          <v-spacer></v-spacer>
          <v-chip :color="getStatusColor(visit.status)" variant="flat" size="large" class="mr-2">
            <v-icon start>{{ getStatusIcon(visit.status) }}</v-icon>
            {{ getStatusLabel(visit.status) }}
          </v-chip>
          <v-btn variant="outlined" color="primary" class="mr-2" @click="handleEdit">
            <v-icon start>mdi-pencil</v-icon>
            Editar
          </v-btn>
          <v-btn variant="outlined" color="error" @click="showDeleteDialog = true">
            <v-icon start>mdi-delete</v-icon>
            Excluir
          </v-btn>
        </v-card-title>
      </v-card>

      <v-row>
        <!-- Main Content Column -->
        <v-col cols="12" lg="8">
          <!-- Schedule Card -->
          <v-card elevation="2" class="mb-4">
            <v-card-title class="d-flex align-center pa-4 border-b">
              <v-icon class="mr-2" color="primary">mdi-clock-outline</v-icon>
              Informações do Agendamento
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <div class="text-caption text-medium-emphasis mb-1">Data</div>
                  <div class="d-flex align-center">
                    <v-avatar :color="getDateColor(visit.scheduled_at)" size="48" class="mr-3">
                      <div class="text-center">
                        <div class="text-body-1 font-weight-bold text-white">{{ formatDay(visit.scheduled_at) }}</div>
                        <div class="text-caption text-white" style="font-size: 10px;">{{ formatMonth(visit.scheduled_at) }}</div>
                      </div>
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium">{{ formatWeekday(visit.scheduled_at) }}</div>
                      <div class="text-caption text-medium-emphasis">{{ formatYear(visit.scheduled_at) }}</div>
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="text-caption text-medium-emphasis mb-1">Horário</div>
                  <div class="d-flex align-center">
                    <v-icon color="warning" size="48" class="mr-3">mdi-clock-time-eight</v-icon>
                    <div class="text-h4 font-weight-medium">{{ formatTime(visit.scheduled_at) }}</div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="4">
                  <div class="text-caption text-medium-emphasis mb-1">Tempo Restante</div>
                  <div class="d-flex align-center">
                    <v-icon :color="timeRemainingColor" size="48" class="mr-3">mdi-timer-sand</v-icon>
                    <div :class="`text-h6 font-weight-medium text-${timeRemainingColor}`">
                      {{ timeRemaining }}
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Client Card -->
          <v-card elevation="2" class="mb-4" @click="goToClient" style="cursor: pointer;">
            <v-card-title class="d-flex align-center pa-4 border-b">
              <v-icon class="mr-2" color="primary">mdi-account</v-icon>
              Cliente
              <v-spacer></v-spacer>
              <v-icon size="20">mdi-chevron-right</v-icon>
            </v-card-title>
            <v-card-text class="pa-4">
              <div v-if="client" class="d-flex align-center">
                <v-avatar color="primary" size="64" class="mr-4">
                  <span class="text-h5 text-white">{{ getInitials(client.name) }}</span>
                </v-avatar>
                <div>
                  <div class="text-h6">{{ client.name }}</div>
                  <div v-if="client.email" class="text-body-2 text-medium-emphasis">
                    <v-icon size="14" class="mr-1">mdi-email</v-icon>
                    {{ client.email }}
                  </div>
                  <div v-if="client.phone" class="text-body-2 text-medium-emphasis">
                    <v-icon size="14" class="mr-1">mdi-phone</v-icon>
                    {{ client.phone }}
                  </div>
                </div>
              </div>
              <v-skeleton-loader v-else type="list-item-avatar-two-line"></v-skeleton-loader>
            </v-card-text>
          </v-card>

          <!-- Property Card -->
          <v-card v-if="visit.property_id" elevation="2" class="mb-4" @click="goToProperty" style="cursor: pointer;">
            <v-card-title class="d-flex align-center pa-4 border-b">
              <v-icon class="mr-2" color="success">mdi-home</v-icon>
              Imóvel
              <v-spacer></v-spacer>
              <v-icon size="20">mdi-chevron-right</v-icon>
            </v-card-title>
            <v-card-text class="pa-4">
              <div v-if="property" class="d-flex align-center">
                <v-avatar color="success" size="64" rounded="lg" class="mr-4">
                  <v-icon color="white" size="32">mdi-home</v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6">{{ property.title }}</div>
                  <div class="text-body-2 text-medium-emphasis">
                    <v-icon size="14" class="mr-1">mdi-map-marker</v-icon>
                    {{ property.street }}, {{ property.number }} - {{ property.city }}, {{ property.state }}
                  </div>
                  <div class="text-body-2 text-success font-weight-medium">
                    {{ formatCurrency(property.price) }}
                  </div>
                </div>
              </div>
              <v-skeleton-loader v-else type="list-item-avatar-two-line"></v-skeleton-loader>
            </v-card-text>
          </v-card>

          <v-card v-else elevation="2" class="mb-4" variant="outlined">
            <v-card-text class="pa-4 text-center">
              <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-home-off</v-icon>
              <div class="text-body-1 text-medium-emphasis">Nenhum imóvel vinculado a esta visita</div>
              <v-btn variant="tonal" color="primary" class="mt-2" @click="handleEdit">
                Vincular Imóvel
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Notes Card -->
          <v-card v-if="visit.notes" elevation="2">
            <v-card-title class="d-flex align-center pa-4 border-b">
              <v-icon class="mr-2" color="primary">mdi-note-text</v-icon>
              Observações
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="text-body-1" style="white-space: pre-wrap;">{{ visit.notes }}</div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Sidebar Column -->
        <v-col cols="12" lg="4">
          <!-- Broker Card -->
          <v-card elevation="2" class="mb-4">
            <v-card-title class="d-flex align-center pa-4 border-b">
              <v-icon class="mr-2" color="secondary">mdi-account-tie</v-icon>
              Corretor Responsável
            </v-card-title>
            <v-card-text class="pa-4">
              <div v-if="broker" class="d-flex align-center">
                <v-avatar color="secondary" size="48" class="mr-3">
                  <v-icon color="white" size="28">mdi-account-tie</v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-medium">{{ broker.full_name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ broker.email }}</div>
                </div>
              </div>
              <v-skeleton-loader v-else type="list-item-avatar"></v-skeleton-loader>
            </v-card-text>
          </v-card>

          <!-- Quick Actions Card -->
          <v-card v-if="visit.status !== 'COMPLETED' && visit.status !== 'CANCELLED' && visit.status !== 'NO_SHOW'" elevation="2" class="mb-4">
            <v-card-title class="d-flex align-center pa-4 border-b">
              <v-icon class="mr-2" color="primary">mdi-lightning-bolt</v-icon>
              Ações Rápidas
            </v-card-title>
            <v-card-text class="pa-4">
              <v-btn
                v-if="visit.status === 'SCHEDULED'"
                color="primary"
                variant="tonal"
                block
                class="mb-2"
                :loading="isUpdating"
                @click="updateStatus('CONFIRMED')"
              >
                <v-icon start>mdi-check</v-icon>
                Confirmar Visita
              </v-btn>
              <v-btn
                v-if="visit.status === 'CONFIRMED'"
                color="warning"
                variant="tonal"
                block
                class="mb-2"
                :loading="isUpdating"
                @click="updateStatus('IN_PROGRESS')"
              >
                <v-icon start>mdi-play</v-icon>
                Iniciar Visita
              </v-btn>
              <v-btn
                v-if="visit.status === 'IN_PROGRESS' || visit.status === 'CONFIRMED'"
                color="success"
                variant="tonal"
                block
                class="mb-2"
                :loading="isUpdating"
                @click="updateStatus('COMPLETED')"
              >
                <v-icon start>mdi-check-circle</v-icon>
                Concluir Visita
              </v-btn>
              <v-btn
                color="error"
                variant="tonal"
                block
                :loading="isUpdating"
                @click="showCancelDialog = true"
              >
                <v-icon start>mdi-cancel</v-icon>
                Cancelar Visita
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Status History -->
          <v-card elevation="2" class="mb-4">
            <v-card-title class="d-flex align-center pa-4 border-b">
              <v-icon class="mr-2" color="primary">mdi-history</v-icon>
              Informações
            </v-card-title>
            <v-card-text class="pa-0">
              <v-list density="compact">
                <v-list-item>
                  <template #prepend>
                    <v-icon color="grey">mdi-calendar-plus</v-icon>
                  </template>
                  <v-list-item-title>Criada em</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDateTime(visit.created_at) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon color="grey">mdi-calendar-edit</v-icon>
                  </template>
                  <v-list-item-title>Última atualização</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDateTime(visit.updated_at) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="visit.attendance_id">
                  <template #prepend>
                    <v-icon color="info">mdi-message-text</v-icon>
                  </template>
                  <v-list-item-title>Atendimento Relacionado</v-list-item-title>
                  <v-list-item-subtitle>
                    <v-btn variant="text" size="small" color="info" @click="goToAttendance">
                      Ver Atendimento
                    </v-btn>
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <!-- Completed/Cancelled Info -->
          <v-alert
            v-if="visit.status === 'COMPLETED'"
            type="success"
            variant="tonal"
            class="mb-4"
          >
            <div class="font-weight-medium">Visita Concluída</div>
            <div class="text-caption">Esta visita foi realizada com sucesso.</div>
          </v-alert>

          <v-alert
            v-if="visit.status === 'CANCELLED'"
            type="error"
            variant="tonal"
            class="mb-4"
          >
            <div class="font-weight-medium">Visita Cancelada</div>
            <div class="text-caption">Esta visita foi cancelada.</div>
          </v-alert>

          <v-alert
            v-if="visit.status === 'NO_SHOW'"
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            <div class="font-weight-medium">Cliente Não Compareceu</div>
            <div class="text-caption">O cliente não compareceu à visita agendada.</div>
          </v-alert>
        </v-col>
      </v-row>
    </template>

    <!-- Not Found State -->
    <v-card v-else elevation="2">
      <v-card-text class="text-center pa-8">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-calendar-remove</v-icon>
        <div class="text-h6 text-medium-emphasis mb-2">Visita não encontrada</div>
        <v-btn color="primary" @click="goBack">
          Voltar para a lista
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          Confirmar Exclusão
        </v-card-title>
        <v-card-text>
          <p>Tem certeza que deseja excluir esta visita agendada para:</p>
          <p class="font-weight-bold text-center my-3">{{ visit ? formatDateTime(visit.scheduled_at) : '' }}</p>
          <v-alert type="warning" variant="tonal" density="compact">
            Esta ação não pode ser desfeita.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" :loading="isDeleting" @click="handleDelete">
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Cancel Confirmation Dialog -->
    <v-dialog v-model="showCancelDialog" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="warning" class="mr-2">mdi-alert</v-icon>
          Cancelar Visita
        </v-card-title>
        <v-card-text>
          <p class="mb-4">Selecione o motivo do cancelamento:</p>
          <v-radio-group v-model="cancelReason">
            <v-radio label="Cliente cancelou" value="cliente"></v-radio>
            <v-radio label="Corretor cancelou" value="corretor"></v-radio>
            <v-radio label="Cliente não compareceu" value="no_show"></v-radio>
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showCancelDialog = false">Voltar</v-btn>
          <v-btn color="error" variant="flat" :loading="isUpdating" @click="cancelVisit">
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { visitsService, type Visit, type VisitStatus } from '@/shared/services/visits.service'
import { clientsService, type Client } from '@/shared/services/clients.service'
import { usersService, type User } from '@/shared/services/users.service'
import { propertiesService, type Property } from '@/shared/services/properties.service'

const router = useRouter()
const route = useRoute()

// State
const visit = ref<Visit | null>(null)
const client = ref<Client | null>(null)
const broker = ref<User | null>(null)
const property = ref<Property | null>(null)
const isLoading = ref(true)
const isUpdating = ref(false)
const isDeleting = ref(false)
const showDeleteDialog = ref(false)
const showCancelDialog = ref(false)
const cancelReason = ref('cliente')
const now = ref(new Date())
let timeInterval: ReturnType<typeof setInterval> | null = null

// Computed
const timeRemaining = computed(() => {
  if (!visit.value) return '-'
  
  const scheduledDate = new Date(visit.value.scheduled_at)
  const diff = scheduledDate.getTime() - now.value.getTime()
  
  if (diff < 0) return 'Já passou'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}min`
  return `${minutes} min`
})

const timeRemainingColor = computed(() => {
  if (!visit.value) return 'grey'
  
  const scheduledDate = new Date(visit.value.scheduled_at)
  const diff = scheduledDate.getTime() - now.value.getTime()
  
  if (diff < 0) return 'grey'
  if (diff < 1000 * 60 * 60) return 'error' // Less than 1 hour
  if (diff < 1000 * 60 * 60 * 24) return 'warning' // Less than 1 day
  return 'success'
})

// Methods
const loadData = async () => {
  isLoading.value = true
  try {
    const visitId = route.params.id as string
    visit.value = await visitsService.getVisitById(visitId)
    
    // Load related entities
    const [clientData, brokerData] = await Promise.all([
      clientsService.getClientById(visit.value.client_id),
      usersService.getUserById(visit.value.broker_id),
    ])
    
    client.value = clientData
    broker.value = brokerData
    
    if (visit.value.property_id) {
      property.value = await propertiesService.getPropertyById(visit.value.property_id)
    }
  } catch (error) {
    console.error('Error loading visit:', error)
    visit.value = null
  } finally {
    isLoading.value = false
  }
}

const updateStatus = async (status: VisitStatus) => {
  if (!visit.value) return
  
  isUpdating.value = true
  try {
    visit.value = await visitsService.updateVisit(visit.value.id, { status })
  } catch (error) {
    console.error('Error updating status:', error)
  } finally {
    isUpdating.value = false
  }
}

const cancelVisit = async () => {
  const status: VisitStatus = cancelReason.value === 'no_show' ? 'NO_SHOW' : 'CANCELLED'
  await updateStatus(status)
  showCancelDialog.value = false
}

const handleEdit = () => {
  if (!visit.value) return
  router.push({ name: 'visits-edit', params: { id: visit.value.id } })
}

const handleDelete = async () => {
  if (!visit.value) return
  
  isDeleting.value = true
  try {
    await visitsService.deleteVisit(visit.value.id)
    router.push({ name: 'visits' })
  } catch (error) {
    console.error('Error deleting visit:', error)
  } finally {
    isDeleting.value = false
  }
}

const goBack = () => router.push({ name: 'visits' })
const goToClient = () => client.value && router.push({ name: 'clients-details', params: { id: client.value.id } })
const goToProperty = () => property.value && router.push({ name: 'properties-details', params: { id: property.value.id } })
const goToAttendance = () => visit.value?.attendance_id && router.push({ name: 'attendances-details', params: { id: visit.value.attendance_id } })

// Formatting helpers
const getInitials = (name: string): string => {
  if (!name) return '??'
  const parts = name.trim().split(' ')
  return parts.length >= 2 
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() 
    : name.substring(0, 2).toUpperCase()
}

const formatDateTime = (dateStr: string): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

const formatDay = (dateStr: string): string => new Date(dateStr).getDate().toString().padStart(2, '0')
const formatMonth = (dateStr: string): string => new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(dateStr)).replace('.', '')
const formatYear = (dateStr: string): string => new Date(dateStr).getFullYear().toString()
const formatTime = (dateStr: string): string => new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr))
const formatWeekday = (dateStr: string): string => new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date(dateStr))

const formatCurrency = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '-'
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return '-'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue)
}

const getDateColor = (dateStr: string): string => {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const visitDay = new Date(date)
  visitDay.setHours(0, 0, 0, 0)
  
  if (visitDay.getTime() === today.getTime()) return 'warning'
  if (visitDay < today) return 'grey'
  return 'primary'
}

const getStatusLabel = (status: VisitStatus): string => {
  const labels: Record<VisitStatus, string> = {
    SCHEDULED: 'Agendada',
    CONFIRMED: 'Confirmada',
    IN_PROGRESS: 'Em Andamento',
    COMPLETED: 'Concluída',
    CANCELLED: 'Cancelada',
    NO_SHOW: 'Não Compareceu',
  }
  return labels[status] || status
}

const getStatusColor = (status: VisitStatus): string => {
  const colors: Record<VisitStatus, string> = {
    SCHEDULED: 'info',
    CONFIRMED: 'primary',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'grey',
    NO_SHOW: 'error',
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status: VisitStatus): string => {
  const icons: Record<VisitStatus, string> = {
    SCHEDULED: 'mdi-calendar-clock',
    CONFIRMED: 'mdi-calendar-check',
    IN_PROGRESS: 'mdi-run',
    COMPLETED: 'mdi-check-circle',
    CANCELLED: 'mdi-cancel',
    NO_SHOW: 'mdi-account-off',
  }
  return icons[status] || 'mdi-help-circle'
}

onMounted(() => {
  loadData()
  // Update time remaining every minute
  timeInterval = setInterval(() => {
    now.value = new Date()
  }, 60000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
}
</style>

