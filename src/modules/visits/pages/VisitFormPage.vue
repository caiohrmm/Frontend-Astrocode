<template>
  <div>
    <!-- Header -->
    <v-card elevation="2" class="mb-4">
      <v-card-title class="d-flex align-center pa-4">
        <v-btn icon variant="text" class="mr-2" @click="goBack">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-icon class="mr-3" size="32" color="primary">
          {{ isEditMode ? 'mdi-calendar-edit' : 'mdi-calendar-plus' }}
        </v-icon>
        <span class="text-h5">{{ isEditMode ? 'Editar Visita' : 'Nova Visita' }}</span>
      </v-card-title>
    </v-card>

    <!-- Loading State -->
    <v-card v-if="isLoading" elevation="2">
      <v-card-text class="text-center pa-8">
        <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
        <div class="text-body-1 mt-4">Carregando...</div>
      </v-card-text>
    </v-card>

    <!-- Form -->
    <v-form v-else ref="formRef" v-model="isFormValid" @submit.prevent="handleSave">
      <v-row>
        <!-- Main Form Column -->
        <v-col cols="12" lg="8">
          <v-card elevation="2" class="mb-4">
            <v-card-title class="d-flex align-center pa-4 border-b">
              <v-icon class="mr-2" color="primary">mdi-account-multiple</v-icon>
              Informações Principais
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <!-- Client Selection -->
                <v-col cols="12" md="6">
                  <SearchSelectDialog
                    v-model="formData.client_id"
                    label="Cliente *"
                    dialog-title="Selecionar Cliente"
                    icon="mdi-account"
                    :items="clientSearchItems"
                    :total-items="clients.length"
                    :items-per-page="10"
                    :is-loading="isLoadingClients"
                    display-field="name"
                    subtitle-field="email"
                    :rules="[rules.required]"
                    @search="handleClientSearch"
                    @select="handleClientSelect"
                  >
                    <template #item-prepend="{ item }">
                      <v-avatar color="primary" size="40">
                        <span class="text-caption text-white">{{ getInitials(item.name || '') }}</span>
                      </v-avatar>
                    </template>
                    <template #item-title="{ item }">
                      {{ item.name }}
                    </template>
                    <template #item-subtitle="{ item }">
                      {{ item.email || item.phone || '-' }}
                    </template>
                  </SearchSelectDialog>
                </v-col>

                <!-- Broker Selection -->
                <v-col cols="12" md="6">
                  <v-autocomplete
                    v-model="formData.broker_id"
                    :items="brokerOptions"
                    label="Corretor Responsável *"
                    variant="outlined"
                    prepend-inner-icon="mdi-account-tie"
                    :rules="[rules.required]"
                    :loading="isLoadingBrokers"
                    hint="Corretor que irá acompanhar a visita"
                    persistent-hint
                  >
                    <template #item="{ props }">
                      <v-list-item v-bind="props">
                        <template #prepend>
                          <v-avatar color="secondary" size="32">
                            <v-icon color="white" size="18">mdi-account-tie</v-icon>
                          </v-avatar>
                        </template>
                      </v-list-item>
                    </template>
                  </v-autocomplete>
                </v-col>

                <!-- Attendance Selection (required for creation) -->
                <v-col cols="12">
                  <SearchSelectDialog
                    v-model="formData.attendance_id"
                    :label="isEditMode ? 'Atendimento vinculado' : 'Atendimento *'"
                    dialog-title="Buscar Atendimento"
                    icon="mdi-phone-in-talk"
                    icon-color="primary"
                    item-icon="mdi-phone-in-talk"
                    :items="attendanceSearchItems"
                    :total-items="attendancesTotalItems"
                    :items-per-page="ATTENDANCES_PER_PAGE"
                    :is-loading="isLoadingAttendances"
                    display-field="name"
                    placeholder="Clique para buscar atendimento..."
                    hint="Selecione o atendimento ao qual esta visita está vinculada"
                    :persistent-hint="true"
                    :rules="isEditMode ? [] : [rules.required]"
                    :clearable="false"
                    @search="handleAttendanceSearch"
                    @select="handleAttendanceSelect"
                  >
                    <template #item-prepend="{ item }">
                      <v-avatar color="primary" size="40">
                        <v-icon color="white">mdi-phone-in-talk</v-icon>
                      </v-avatar>
                    </template>
                    <template #item-title="{ item }">
                      {{ item.name }}
                    </template>
                    <template #item-subtitle="{ item }">
                      {{ item.subtitle }}
                    </template>
                  </SearchSelectDialog>
                </v-col>

                <!-- Property Selection -->
                <v-col cols="12">
                  <SearchSelectDialog
                    v-model="formData.property_id"
                    label="Imóvel (opcional)"
                    dialog-title="Selecionar Imóvel"
                    icon="mdi-home"
                    :items="propertySearchItems"
                    :total-items="properties.length"
                    :items-per-page="10"
                    :is-loading="isLoadingProperties"
                    display-field="title"
                    subtitle-field="address"
                    clearable
                    @search="handlePropertySearch"
                    @select="handlePropertySelect"
                  >
                    <template #item-prepend>
                      <v-avatar color="success" size="40" rounded="lg">
                        <v-icon color="white">mdi-home</v-icon>
                      </v-avatar>
                    </template>
                    <template #item-title="{ item }">
                      {{ item.title }}
                    </template>
                    <template #item-subtitle="{ item }">
                      <div>{{ item.city }}, {{ item.state }} - {{ formatCurrency(item.price) }}</div>
                    </template>
                  </SearchSelectDialog>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Scheduling Card -->
          <v-card elevation="2" class="mb-4">
            <v-card-title class="d-flex align-center pa-4 border-b">
              <v-icon class="mr-2" color="primary">mdi-clock-outline</v-icon>
              Agendamento
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.scheduled_at"
                    label="Data e Hora *"
                    type="datetime-local"
                    variant="outlined"
                    prepend-inner-icon="mdi-calendar-clock"
                    :rules="[rules.required, rules.futureDate]"
                    hint="Quando a visita será realizada"
                    persistent-hint
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.status"
                    :items="statusOptions"
                    label="Status"
                    variant="outlined"
                    prepend-inner-icon="mdi-flag"
                    hint="Status atual da visita"
                    persistent-hint
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template #prepend>
                          <v-icon :color="getStatusColor(item.value as VisitStatus)">
                            {{ getStatusIcon(item.value as VisitStatus) }}
                          </v-icon>
                        </template>
                      </v-list-item>
                    </template>
                    <template #selection="{ item }">
                      <v-chip :color="getStatusColor(item.value as VisitStatus)" size="small" variant="flat">
                        <v-icon start size="14">{{ getStatusIcon(item.value as VisitStatus) }}</v-icon>
                        {{ item.title }}
                      </v-chip>
                    </template>
                  </v-select>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Notes Card -->
          <v-card elevation="2">
            <v-card-title class="d-flex align-center pa-4 border-b">
              <v-icon class="mr-2" color="primary">mdi-note-text</v-icon>
              Observações
            </v-card-title>
            <v-card-text class="pa-4">
              <v-textarea
                v-model="formData.notes"
                label="Notas e Observações"
                variant="outlined"
                prepend-inner-icon="mdi-text"
                rows="4"
                auto-grow
                counter
                hint="Informações adicionais sobre a visita"
                persistent-hint
              ></v-textarea>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Summary Column -->
        <v-col cols="12" lg="4">
          <!-- Summary Card -->
          <v-card elevation="2" class="mb-4">
            <v-card-title class="d-flex align-center pa-4 border-b">
              <v-icon class="mr-2" color="primary">mdi-information</v-icon>
              Resumo
            </v-card-title>
            <v-card-text class="pa-4">
              <v-list density="compact">
                <v-list-item v-if="selectedClient">
                  <template #prepend>
                    <v-avatar color="primary" size="40">
                      <span class="text-caption text-white">{{ getInitials(selectedClient.name) }}</span>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ selectedClient.name }}</v-list-item-title>
                  <v-list-item-subtitle>Cliente</v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="selectedBroker">
                  <template #prepend>
                    <v-avatar color="secondary" size="40">
                      <v-icon color="white">mdi-account-tie</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ selectedBroker.full_name }}</v-list-item-title>
                  <v-list-item-subtitle>Corretor</v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="selectedProperty">
                  <template #prepend>
                    <v-avatar color="success" size="40" rounded="lg">
                      <v-icon color="white">mdi-home</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ selectedProperty.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedProperty.city }}, {{ selectedProperty.state }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="selectedAttendance">
                  <template #prepend>
                    <v-avatar color="primary" size="40">
                      <v-icon color="white">mdi-phone-in-talk</v-icon>
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ formatAttendanceLabel(selectedAttendance) }}</v-list-item-title>
                  <v-list-item-subtitle>Atendimento vinculado</v-list-item-subtitle>
                </v-list-item>

                <v-divider class="my-3"></v-divider>

                <v-list-item v-if="formData.scheduled_at">
                  <template #prepend>
                    <v-icon color="warning">mdi-calendar-clock</v-icon>
                  </template>
                  <v-list-item-title>{{ formatScheduledAt }}</v-list-item-title>
                  <v-list-item-subtitle>Data e Hora</v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="formData.status">
                  <template #prepend>
                    <v-icon :color="getStatusColor(formData.status)">{{ getStatusIcon(formData.status) }}</v-icon>
                  </template>
                  <v-list-item-title>{{ getStatusLabel(formData.status) }}</v-list-item-title>
                  <v-list-item-subtitle>Status</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <!-- Actions Card -->
          <v-card elevation="2">
            <v-card-text class="pa-4">
              <v-btn
                color="primary"
                block
                size="large"
                :loading="isSaving"
                :disabled="!isFormValid"
                type="submit"
              >
                <v-icon start>{{ isEditMode ? 'mdi-content-save' : 'mdi-calendar-check' }}</v-icon>
                {{ isEditMode ? 'Salvar Alterações' : 'Agendar Visita' }}
              </v-btn>
              <v-btn
                variant="outlined"
                block
                size="large"
                class="mt-3"
                @click="goBack"
              >
                Cancelar
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Quick Actions (Edit Mode) -->
          <v-card v-if="isEditMode && formData.status !== 'COMPLETED' && formData.status !== 'CANCELLED'" elevation="2" class="mt-4">
            <v-card-title class="d-flex align-center pa-4 border-b">
              <v-icon class="mr-2" color="primary">mdi-lightning-bolt</v-icon>
              Ações Rápidas
            </v-card-title>
            <v-card-text class="pa-4">
              <v-btn
                v-if="formData.status === 'SCHEDULED'"
                color="primary"
                variant="tonal"
                block
                class="mb-2"
                @click="updateStatus('CONFIRMED')"
              >
                <v-icon start>mdi-check</v-icon>
                Confirmar Visita
              </v-btn>
              <v-btn
                v-if="formData.status === 'CONFIRMED'"
                color="warning"
                variant="tonal"
                block
                class="mb-2"
                @click="updateStatus('IN_PROGRESS')"
              >
                <v-icon start>mdi-play</v-icon>
                Iniciar Visita
              </v-btn>
              <v-btn
                v-if="formData.status === 'IN_PROGRESS' || formData.status === 'CONFIRMED'"
                color="success"
                variant="tonal"
                block
                class="mb-2"
                @click="updateStatus('COMPLETED')"
              >
                <v-icon start>mdi-check-circle</v-icon>
                Concluir Visita
              </v-btn>
              <v-btn
                color="error"
                variant="tonal"
                block
                @click="showCancelDialog = true"
              >
                <v-icon start>mdi-cancel</v-icon>
                Cancelar Visita
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-form>

    <!-- Cancel Confirmation Dialog -->
    <v-dialog v-model="showCancelDialog" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="warning" class="mr-2">mdi-alert</v-icon>
          Cancelar Visita
        </v-card-title>
        <v-card-text>
          <p class="mb-4">Tem certeza que deseja cancelar esta visita?</p>
          <v-radio-group v-model="cancelReason" inline>
            <v-radio label="Cliente cancelou" value="cliente"></v-radio>
            <v-radio label="Corretor cancelou" value="corretor"></v-radio>
            <v-radio label="Não compareceu" value="no_show"></v-radio>
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showCancelDialog = false">Voltar</v-btn>
          <v-btn color="error" variant="flat" @click="cancelVisit">
            Confirmar Cancelamento
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { visitsService, type VisitStatus, type VisitCreate, type VisitUpdate } from '@/shared/services/visits.service'
import { clientsService, type Client } from '@/shared/services/clients.service'
import { usersService, type User } from '@/shared/services/users.service'
import { propertiesService, type Property } from '@/shared/services/properties.service'
import { attendancesService, type Attendance, type AttendanceStatus } from '@/shared/services/attendances.service'
import SearchSelectDialog from '@/shared/components/SearchSelectDialog.vue'

const router = useRouter()
const route = useRoute()

// State
const formRef = ref()
const isFormValid = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const isLoadingClients = ref(false)
const isLoadingBrokers = ref(false)
const isLoadingProperties = ref(false)
const isLoadingAttendances = ref(false)
const showCancelDialog = ref(false)
const cancelReason = ref('cliente')

const clients = ref<Client[]>([])
const brokers = ref<User[]>([])
const properties = ref<Property[]>([])
const attendances = ref<Attendance[]>([])
const clientSearchQuery = ref('')
const propertySearchQuery = ref('')
const attendanceSearchPage = ref(1)
const attendancesTotalItems = ref(0)
const ATTENDANCES_PER_PAGE = 15

const formData = ref<{
  client_id: string | null
  broker_id: string | null
  property_id: string | null
  scheduled_at: string
  status: VisitStatus
  notes: string
  attendance_id: string | null
}>({
  client_id: null,
  broker_id: null,
  property_id: null,
  scheduled_at: '',
  status: 'SCHEDULED',
  notes: '',
  attendance_id: null,
})

// Computed
const isEditMode = computed(() => !!route.params.id)

const brokerOptions = computed(() => {
  return brokers.value.map(b => ({
    title: b.full_name,
    value: b.id,
  }))
})

const clientSearchItems = computed(() => {
  let result = clients.value
  if (clientSearchQuery.value) {
    const query = clientSearchQuery.value.toLowerCase()
    result = result.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.phone?.includes(query)
    )
  }
  // Map to SearchItem compatible format (email: null -> undefined)
  return result.map(c => ({
    ...c,
    email: c.email || undefined,
  }))
})

const propertySearchItems = computed(() => {
  if (!propertySearchQuery.value) return properties.value
  const query = propertySearchQuery.value.toLowerCase()
  return properties.value.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.city?.toLowerCase().includes(query) ||
    p.code?.toLowerCase().includes(query)
  )
})

const attendanceSearchItems = computed(() => {
  return attendances.value.map(a => ({
    ...a,
    name: formatAttendanceLabel(a),
    subtitle: formatAttendanceSubtitle(a),
  }))
})

const selectedAttendance = computed(() => {
  if (!formData.value.attendance_id) return null
  return attendances.value.find(a => a.id === formData.value.attendance_id) ?? null
})

const selectedClient = computed(() => {
  if (!formData.value.client_id) return null
  return clients.value.find(c => c.id === formData.value.client_id)
})

const selectedBroker = computed(() => {
  if (!formData.value.broker_id) return null
  return brokers.value.find(b => b.id === formData.value.broker_id)
})

const selectedProperty = computed(() => {
  if (!formData.value.property_id) return null
  return properties.value.find(p => p.id === formData.value.property_id)
})

const formatScheduledAt = computed(() => {
  if (!formData.value.scheduled_at) return ''
  const date = new Date(formData.value.scheduled_at)
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
})

const statusOptions = [
  { title: 'Agendada', value: 'SCHEDULED' },
  { title: 'Confirmada', value: 'CONFIRMED' },
  { title: 'Em Andamento', value: 'IN_PROGRESS' },
  { title: 'Concluída', value: 'COMPLETED' },
  { title: 'Cancelada', value: 'CANCELLED' },
  { title: 'Não Compareceu', value: 'NO_SHOW' },
]

// Validation Rules
const rules = {
  required: (v: unknown) => !!v || 'Campo obrigatório',
  futureDate: (v: string) => {
    if (!v) return true
    const date = new Date(v)
    // Allow past dates in edit mode for completed/cancelled visits
    if (isEditMode.value && (formData.value.status === 'COMPLETED' || formData.value.status === 'CANCELLED')) {
      return true
    }
    return date > new Date() || 'A data deve ser no futuro'
  },
}

// Methods
const loadData = async () => {
  isLoading.value = true
  try {
    const [clientsData, brokersData, propertiesData] = await Promise.all([
      clientsService.getClients({ limit: 1000 }),
      usersService.getCorretores(),
      propertiesService.listProperties({ limit: 1000 }),
    ])

    clients.value = clientsData
    brokers.value = brokersData
    properties.value = propertiesData

    if (isEditMode.value) {
      await loadVisit()
    } else {
      // Set default scheduled_at to tomorrow at 10:00
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(10, 0, 0, 0)
      formData.value.scheduled_at = formatDateTimeLocal(tomorrow)
      // Preload first page of attendances for the selection dialog
      await handleAttendanceSearch('', 1)
    }
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    isLoading.value = false
  }
}

const loadVisit = async () => {
  try {
    const visit = await visitsService.getVisitById(route.params.id as string)
    formData.value = {
      client_id: visit.client_id,
      broker_id: visit.broker_id,
      property_id: visit.property_id,
      scheduled_at: formatDateTimeLocal(new Date(visit.scheduled_at)),
      status: visit.status,
      notes: visit.notes || '',
      attendance_id: visit.attendance_id,
    }
    if (visit.attendance_id) {
      const attendance = await attendancesService.getAttendanceById(visit.attendance_id)
      attendances.value = [attendance]
      attendancesTotalItems.value = 1
    }
  } catch (error) {
    console.error('Error loading visit:', error)
    router.push({ name: 'visits' })
  }
}

const formatDateTimeLocal = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const handleSave = async () => {
  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (!valid) return

  isSaving.value = true
  try {
    const scheduledDate = new Date(formData.value.scheduled_at)
    
    if (isEditMode.value) {
      const updateData: VisitUpdate = {
        client_id: formData.value.client_id || undefined,
        broker_id: formData.value.broker_id || undefined,
        property_id: formData.value.property_id || null,
        scheduled_at: scheduledDate.toISOString(),
        status: formData.value.status,
        notes: formData.value.notes || null,
      }
      await visitsService.updateVisit(route.params.id as string, updateData)
    } else {
      const createData: VisitCreate = {
        client_id: formData.value.client_id!,
        broker_id: formData.value.broker_id!,
        property_id: formData.value.property_id || null,
        scheduled_at: scheduledDate.toISOString(),
        status: formData.value.status,
        notes: formData.value.notes || null,
        attendance_id: formData.value.attendance_id,
      }
      await visitsService.createVisit(createData)
    }

    router.push({ name: 'visits' })
  } catch (error: any) {
    console.error('Error saving visit:', error)
    alert(error?.response?.data?.detail || 'Erro ao salvar visita')
  } finally {
    isSaving.value = false
  }
}

const updateStatus = async (status: VisitStatus) => {
  if (!isEditMode.value) return
  
  isSaving.value = true
  try {
    await visitsService.updateVisit(route.params.id as string, { status })
    formData.value.status = status
  } catch (error) {
    console.error('Error updating status:', error)
  } finally {
    isSaving.value = false
  }
}

const cancelVisit = async () => {
  const status: VisitStatus = cancelReason.value === 'no_show' ? 'NO_SHOW' : 'CANCELLED'
  await updateStatus(status)
  showCancelDialog.value = false
}

const handleClientSearch = (query: string) => {
  clientSearchQuery.value = query
}

const handleClientSelect = (item: { id: string } | null) => {
  if (item) {
    formData.value.client_id = item.id
  }
}

const handlePropertySearch = (query: string) => {
  propertySearchQuery.value = query
}

const handlePropertySelect = (item: { id: string } | null) => {
  if (item) {
    formData.value.property_id = item.id
  }
}

const handleAttendanceSearch = async (_query: string, page: number = 1) => {
  attendanceSearchPage.value = page
  isLoadingAttendances.value = true
  try {
    const params: {
      limit: number
      skip: number
      client_id?: string
      status?: AttendanceStatus
    } = {
      limit: ATTENDANCES_PER_PAGE,
      skip: (page - 1) * ATTENDANCES_PER_PAGE,
    }
    if (formData.value.client_id) {
      params.client_id = formData.value.client_id
    }
    // Só listar atendimentos ACTIVE para criação de visitas
    params.status = 'ACTIVE'
    const list = await attendancesService.getAttendances(params)
    if (page === 1) {
      attendances.value = list
    } else {
      attendances.value = [...attendances.value, ...list]
    }
    attendancesTotalItems.value = list.length >= ATTENDANCES_PER_PAGE ? list.length + (page - 1) * ATTENDANCES_PER_PAGE + 1 : (page - 1) * ATTENDANCES_PER_PAGE + list.length
  } catch (err) {
    console.error('Error loading attendances:', err)
    attendances.value = []
    attendancesTotalItems.value = 0
  } finally {
    isLoadingAttendances.value = false
  }
}

const handleAttendanceSelect = (item: Attendance | (Attendance & { name: string; subtitle: string }) | null) => {
  if (item) {
    formData.value.attendance_id = item.id
    if (!formData.value.client_id && item.client_id) {
      formData.value.client_id = item.client_id
      if (!clients.value.some(c => c.id === item.client_id)) {
        clientsService.getClientById(item.client_id).then(client => {
          if (!clients.value.find(c => c.id === client.id)) {
            clients.value = [client, ...clients.value]
          }
        }).catch(() => {})
      }
    }
    if (!formData.value.broker_id && item.agent_id) {
      formData.value.broker_id = item.agent_id
    }
  }
}

const formatAttendanceLabel = (a: Attendance): string => {
  const date = a.created_at ? new Date(a.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'
  const statusLabels: Record<string, string> = {
    ACTIVE: 'Ativo',
    COMPLETED: 'Concluído',
    LOST: 'Perdido',
    ABANDONED: 'Abandonado',
  }
  const status = statusLabels[a.status] || a.status
  return `Atendimento ${date} - ${status}`
}

const formatAttendanceSubtitle = (a: Attendance): string => {
  const date = a.created_at ? new Date(a.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
  return date ? `Criado em ${date}` : `ID: ${a.id.slice(0, 8)}...`
}

const getInitials = (name: string): string => {
  if (!name) return '??'
  const parts = name.trim().split(' ')
  return parts.length >= 2 
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() 
    : name.substring(0, 2).toUpperCase()
}

const formatCurrency = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '-'
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return '-'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numValue)
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

const goBack = () => {
  if (isEditMode.value) {
    router.push({ name: 'visits-details', params: { id: route.params.id } })
  } else {
    router.push({ name: 'visits' })
  }
}

onMounted(() => loadData())
</script>

<style scoped>
.border-b {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
}
</style>

