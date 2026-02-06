<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="d-flex justify-center align-center" style="min-height: 400px">
      <v-skeleton-loader type="card" width="100%"></v-skeleton-loader>
    </div>

    <!-- Error State -->
    <v-card v-else-if="error" elevation="2" class="ma-4">
      <v-card-text class="text-center pa-8">
        <v-icon color="error" size="64" class="mb-4">mdi-alert-circle</v-icon>
        <div class="text-h6 mb-2">Erro ao carregar atendimento</div>
        <div class="text-body-2 text-medium-emphasis mb-4">{{ error }}</div>
        <v-btn color="primary" @click="loadAttendance">Tentar novamente</v-btn>
      </v-card-text>
    </v-card>

    <!-- Content -->
    <div v-else-if="attendance">
      <!-- Header Card -->
      <v-card elevation="2" class="mb-4" rounded="lg">
        <v-card-title class="d-flex align-center pa-4">
          <v-btn icon variant="text" class="mr-2" @click="goBack">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-icon class="mr-3" :color="getChannelColor(attendance.channel)" size="32">
            {{ getChannelIcon(attendance.channel) }}
          </v-icon>
          <div class="flex-grow-1">
            <div class="text-h5 font-weight-bold">Detalhes do Atendimento</div>
            <div class="text-caption text-medium-emphasis">
              {{ formatDateTime(attendance.started_at) }}
            </div>
          </div>
          <v-spacer></v-spacer>
          <div class="d-flex flex-column align-end ga-2 mr-4">
            <!-- Status -->
            <v-chip
              :color="getStatusColor(attendance.status)"
              variant="flat"
              size="large"
            >
              <v-icon start size="18">{{ getStatusIcon(attendance.status) }}</v-icon>
              {{ getStatusLabel(attendance.status) }}
            </v-chip>
            <!-- Channel -->
            <v-chip
              :color="getChannelColor(attendance.channel)"
              variant="outlined"
              size="small"
            >
              <v-icon start size="16">{{ getChannelIcon(attendance.channel) }}</v-icon>
              {{ getChannelLabel(attendance.channel) }}
            </v-chip>
          </div>
        </v-card-title>

        <!-- Duration -->
        <v-card-subtitle v-if="attendance.duration" class="pa-4 pt-0">
          <div class="d-flex align-center ga-2">
            <v-icon size="18">mdi-clock-outline</v-icon>
            <span class="text-body-2 font-weight-medium">
              Duração: {{ formatDuration(attendance.duration) }}
            </span>
            <span v-if="attendance.ended_at" class="text-caption text-medium-emphasis">
              ({{ formatDateTime(attendance.ended_at) }})
            </span>
          </div>
        </v-card-subtitle>
      </v-card>

      <!-- Main Content -->
      <v-row>
        <!-- Left Column - Main Info -->
        <v-col cols="12" md="8">
          <!-- Raw Content -->
          <v-card elevation="2" class="mb-4" rounded="lg">
            <v-card-title class="pa-4">
              <v-icon class="mr-2">mdi-text</v-icon>
              Conteúdo do Atendimento
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="text-body-1" style="white-space: pre-wrap; word-wrap: break-word;">
                {{ attendance.raw_content }}
              </div>
            </v-card-text>
          </v-card>

          <!-- AI Summary -->
          <v-card v-if="attendance.ai_summary" elevation="2" class="mb-4" rounded="lg">
            <v-card-title class="pa-4">
              <v-icon class="mr-2" color="primary">mdi-robot</v-icon>
              Resumo da IA
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="text-body-1" style="white-space: pre-wrap; word-wrap: break-word;">
                {{ attendance.ai_summary }}
              </div>
            </v-card-text>
          </v-card>

          <!-- AI Next Steps -->
          <v-card v-if="attendance.ai_next_steps" elevation="2" class="mb-4" rounded="lg">
            <v-card-title class="pa-4">
              <v-icon class="mr-2" color="success">mdi-arrow-right-circle</v-icon>
              Próximos Passos (IA)
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="text-body-1" style="white-space: pre-wrap; word-wrap: break-word;">
                {{ attendance.ai_next_steps }}
              </div>
            </v-card-text>
          </v-card>

          <!-- Empty State for AI Content -->
          <v-card v-if="!attendance.ai_summary && !attendance.ai_next_steps" elevation="2" class="mb-4" rounded="lg">
            <v-card-text class="text-center pa-8">
              <v-icon color="grey" size="64" class="mb-4">mdi-robot-outline</v-icon>
              <div class="text-body-1 text-medium-emphasis">
                Resumo da IA ainda não foi gerado para este atendimento.
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column - Related Info -->
        <v-col cols="12" md="4">
          <!-- Client Info -->
          <v-card elevation="2" class="mb-4" rounded="lg">
            <v-card-title class="pa-4">
              <v-icon class="mr-2">mdi-account</v-icon>
              Cliente
            </v-card-title>
            <v-card-text v-if="client" class="pa-4">
              <div class="d-flex align-center mb-3">
                <v-avatar color="primary" size="40" class="mr-3">
                  <span class="text-caption text-white">
                    {{ getInitials(client.name) }}
                  </span>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-body-1 font-weight-medium">{{ client.name }}</div>
                  <div v-if="client.phone" class="text-caption text-medium-emphasis">
                    {{ formatPhone(client.phone) }}
                  </div>
                  <div v-if="client.email" class="text-caption text-medium-emphasis">
                    {{ client.email }}
                  </div>
                </div>
              </div>
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                block
                prepend-icon="mdi-arrow-right"
                @click="goToClient"
              >
                Ver Detalhes do Cliente
              </v-btn>
            </v-card-text>
            <v-card-text v-else class="pa-4">
              <v-skeleton-loader type="list-item-avatar-two-line"></v-skeleton-loader>
            </v-card-text>
          </v-card>

          <!-- Property Info -->
          <v-card v-if="attendance.property_id" elevation="2" class="mb-4" rounded="lg">
            <v-card-title class="pa-4">
              <v-icon class="mr-2">mdi-home</v-icon>
              Propriedade Relacionada
            </v-card-title>
            <v-card-text v-if="property" class="pa-4">
              <div class="mb-3">
                <div class="text-body-1 font-weight-medium mb-1">{{ property.title }}</div>
                <div class="text-caption text-medium-emphasis mb-2">
                  {{ property.code }}
                </div>
                <v-chip
                  :color="getPropertyStatusColor(property.status)"
                  variant="flat"
                  size="small"
                  class="mb-2"
                >
                  {{ getPropertyStatusLabel(property.status) }}
                </v-chip>
              </div>
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                block
                prepend-icon="mdi-arrow-right"
                @click="goToProperty"
              >
                Ver Detalhes da Propriedade
              </v-btn>
            </v-card-text>
            <v-card-text v-else class="pa-4">
              <v-skeleton-loader type="list-item"></v-skeleton-loader>
            </v-card-text>
          </v-card>

          <!-- Scheduled Visit -->
          <v-card v-if="attendance.scheduled_visit_at" elevation="2" class="mb-4" rounded="lg">
            <v-card-title class="pa-4">
              <v-icon class="mr-2" color="warning">mdi-calendar-clock</v-icon>
              Visita Agendada
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="text-body-1 font-weight-medium mb-2">
                {{ formatDateTime(attendance.scheduled_visit_at) }}
              </div>
              <v-alert
                type="info"
                variant="tonal"
                density="compact"
                class="mt-2"
              >
                Visita agendada para esta data/hora
              </v-alert>
            </v-card-text>
          </v-card>

          <!-- Additional Info -->
          <v-card elevation="2" class="mb-4" rounded="lg">
            <v-card-title class="pa-4">
              <v-icon class="mr-2">mdi-information</v-icon>
              Informações Adicionais
            </v-card-title>
            <v-card-text class="pa-4">
              <v-list density="compact">
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-calendar-start</v-icon>
                  </template>
                  <v-list-item-title>Iniciado em</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDateTime(attendance.started_at) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="attendance.ended_at">
                  <template #prepend>
                    <v-icon>mdi-calendar-end</v-icon>
                  </template>
                  <v-list-item-title>Finalizado em</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDateTime(attendance.ended_at) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-calendar-plus</v-icon>
                  </template>
                  <v-list-item-title>Criado em</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDateTime(attendance.created_at) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-calendar-edit</v-icon>
                  </template>
                  <v-list-item-title>Atualizado em</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDateTime(attendance.updated_at) }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { attendancesService, type Attendance, type AttendanceChannel, type AttendanceStatus } from '@/shared/services/attendances.service'
import { clientsService, type Client } from '@/shared/services/clients.service'
import { propertiesService, type Property } from '@/shared/services/properties.service'
import { formatPhone } from '@/shared/utils/masks'

const route = useRoute()
const router = useRouter()

// State
const isLoading = ref(true)
const error = ref<string | null>(null)
const attendance = ref<Attendance | null>(null)
const client = ref<Client | null>(null)
const property = ref<Property | null>(null)

// Load data
const loadAttendance = async () => {
  const attendanceId = route.params.id as string
  if (!attendanceId) {
    error.value = 'ID do atendimento não fornecido'
    isLoading.value = false
    return
  }

  isLoading.value = true
  error.value = null

  try {
    // Load attendance
    attendance.value = await attendancesService.getAttendanceById(attendanceId)

    // Load related data in parallel
    const [clientData, propertyData] = await Promise.allSettled([
      clientsService.getClientById(attendance.value.client_id),
      attendance.value.property_id
        ? propertiesService.getPropertyById(attendance.value.property_id)
        : Promise.resolve(null),
    ])

    if (clientData.status === 'fulfilled') {
      client.value = clientData.value
    }

    if (propertyData.status === 'fulfilled' && propertyData.value) {
      property.value = propertyData.value
    }
  } catch (err: any) {
    console.error('Error loading attendance:', err)
    error.value = err.response?.data?.detail || err.message || 'Erro ao carregar atendimento'
  } finally {
    isLoading.value = false
  }
}

// Navigation
const goBack = () => {
  router.push({ name: 'attendances' })
}

const goToClient = () => {
  if (attendance.value?.client_id) {
    router.push({ name: 'clients-details', params: { id: attendance.value.client_id } })
  }
}

const goToProperty = () => {
  if (attendance.value?.property_id) {
    router.push({ name: 'properties-details', params: { id: attendance.value.property_id } })
  }
}

// Formatting
const formatDateTime = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDuration = (seconds: number): string => {
  if (!seconds) return '0s'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

// Status helpers
const getStatusColor = (status: AttendanceStatus): string => {
  const colors: Record<AttendanceStatus, string> = {
    IN_PROGRESS: 'info',
    COMPLETED: 'success',
    CANCELLED: 'error',
    PAUSED: 'warning',
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status: AttendanceStatus): string => {
  const icons: Record<AttendanceStatus, string> = {
    IN_PROGRESS: 'mdi-clock-outline',
    COMPLETED: 'mdi-check-circle',
    CANCELLED: 'mdi-cancel',
    PAUSED: 'mdi-pause-circle',
  }
  return icons[status] || 'mdi-help-circle'
}

const getStatusLabel = (status: AttendanceStatus): string => {
  const labels: Record<AttendanceStatus, string> = {
    IN_PROGRESS: 'Em Andamento',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
    PAUSED: 'Pausado',
  }
  return labels[status] || status
}

// Channel helpers
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

// Property status helpers
const getPropertyStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    DRAFT: 'grey',
    PUBLISHED: 'success',
    SOLD: 'primary',
    RENTED: 'info',
    UNAVAILABLE: 'error',
  }
  return colors[status] || 'grey'
}

const getPropertyStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    DRAFT: 'Rascunho',
    PUBLISHED: 'Publicado',
    SOLD: 'Vendido',
    RENTED: 'Alugado',
    UNAVAILABLE: 'Indisponível',
  }
  return labels[status] || status
}

onMounted(() => {
  loadAttendance()
})
</script>

<style scoped>
/* Additional styles if needed */
</style>

