<template>
  <div>
    <!-- Header -->
    <v-card elevation="2" class="mb-4">
      <v-card-title class="d-flex align-center pa-4">
        <v-btn icon variant="text" class="mr-2" @click="goBack">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-icon class="mr-3" color="primary" size="32">
          mdi-phone-plus
        </v-icon>
        <span class="text-h5">{{ isEditMode ? 'Editar Atendimento' : 'Novo Atendimento' }}</span>
        <v-spacer></v-spacer>
        
        <v-btn color="primary" :loading="isSaving" :disabled="isSaving || !isFormValid" prepend-icon="mdi-content-save"
          @click="handleSave">
          Salvar
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- Main Content -->
    <v-row>
      <!-- Form Column -->
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-text class="pa-6">
            <v-form ref="formRef" v-model="isFormValid">
              <v-row>
                <!-- Cliente * -->
                <v-col cols="12" md="6">
                  <SearchSelectDialog
                    v-model="formData.client_id"
                    label="Cliente *"
                    dialog-title="Buscar Cliente"
                    icon="mdi-account"
                    icon-color="primary"
                    item-icon="mdi-account"
                    placeholder="Clique para buscar cliente..."
                    hint="Selecione o cliente atendido"
                    :persistent-hint="true"
                    :rules="[rules.required]"
                    :items="clientSearchItems"
                    :total-items="clientsTotalItems"
                    :items-per-page="clientsPerPage"
                    :is-loading="isLoadingClients"
                    display-field="name"
                    @search="handleClientSearch"
                    @select="handleClientSelect"
                  >
                    <template #item-prepend="{ item }">
                      <v-avatar color="primary" size="40" class="mr-3">
                        <span class="text-caption text-white">
                          {{ getInitials(item.name || '') }}
                        </span>
                      </v-avatar>
                    </template>
                    <template #item-title="{ item }">
                      {{ item.name }}
                    </template>
                    <template #item-subtitle="{ item }">
                      <span v-if="item.phone">{{ formatPhone(item.phone) }}</span>
                      <span v-else-if="item.email">{{ item.email }}</span>
                    </template>
                  </SearchSelectDialog>
                </v-col>

                <!-- Agente * -->
                <v-col cols="12" md="6">
                  <v-select v-model="formData.agent_id" :items="agentOptions" :loading="isLoadingAgents"
                    label="Agente Responsável *" variant="outlined" :rules="[rules.required]"
                    prepend-inner-icon="mdi-account-tie" hint="Selecione o agente que realizou o atendimento"
                    persistent-hint item-title="title" item-value="value"></v-select>
                </v-col>

                <!-- Propriedade (Opcional) -->
                <v-col cols="12" md="6">
                  <SearchSelectDialog
                    v-model="formData.property_id"
                    label="Propriedade (Opcional)"
                    dialog-title="Buscar Propriedade"
                    icon="mdi-home"
                    icon-color="success"
                    item-icon="mdi-home"
                    placeholder="Clique para buscar propriedade..."
                    hint="Selecione a propriedade relacionada, se aplicável"
                    :persistent-hint="true"
                    :clearable="true"
                    :items="propertySearchItems"
                    :total-items="propertiesTotalItems"
                    :items-per-page="propertiesPerPage"
                    :is-loading="isLoadingProperties"
                    display-field="title"
                    @search="handlePropertySearch"
                    @select="handlePropertySelect"
                  >
                    <template #item-prepend="{ item }">
                      <v-avatar color="success" size="40" class="mr-3" rounded="lg">
                        <v-img v-if="item.main_image_url" :src="item.main_image_url" cover></v-img>
                        <v-icon v-else color="white">mdi-home</v-icon>
                      </v-avatar>
                    </template>
                    <template #item-title="{ item }">
                      {{ item.title }}
                    </template>
                    <template #item-subtitle="{ item }">
                      <span>Código: {{ item.code }}</span>
                      <span v-if="item.city" class="ml-2">• {{ item.city }}</span>
                    </template>
                  </SearchSelectDialog>
                </v-col>

                <!-- Canal * -->
                <v-col cols="12" md="6">
                  <v-select v-model="formData.channel" :items="channelOptions" label="Meio de contato *"
                    variant="outlined" :rules="[rules.required]" prepend-inner-icon="mdi-phone"
                    hint="Por onde o cliente entrou em contato" persistent-hint item-title="title" item-value="value">
                    <template #item="{ item, props }">
                      <v-list-item v-bind="props" :key="`channel-${item.value}`">
                        <template #prepend>
                          <v-icon :color="item.raw?.color" class="mr-3">
                            {{ item.raw?.icon }}
                          </v-icon>
                        </template>
                      </v-list-item>
                    </template>
                    <template #selection="{ item }">
                      <div class="d-flex align-center">
                        <v-icon :color="item.raw?.color" size="small" class="mr-2">
                          {{ item.raw?.icon }}
                        </v-icon>
                        <span>{{ item.raw?.title }}</span>
                      </div>
                    </template>
                  </v-select>
                </v-col>

                <!-- Objective (Optional) -->
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.objective"
                    label="Objetivo do Ciclo (Opcional)"
                    variant="outlined"
                    prepend-inner-icon="mdi-target"
                    hint="Objetivo claro deste ciclo de interação (ex: 'Comprar apartamento em São Paulo'). Se não informado, será detectado automaticamente pelo conteúdo."
                    persistent-hint
                    placeholder="Ex: Comprar apartamento em São Paulo"
                    :maxlength="500"
                    counter
                  >
                    <template #append-inner>
                      <v-tooltip location="top" max-width="400">
                        <template #activator="{ props }">
                          <v-icon v-bind="props" color="info" size="small" class="ml-2">mdi-information</v-icon>
                        </template>
                        <template #default>
                          <div class="pa-2">
                            <div class="font-weight-bold mb-2">Lógica de Ciclos:</div>
                            <div class="text-body-2">
                              <p class="mb-2">
                                <strong>Se o cliente já tem um ciclo ATIVO com objetivo similar:</strong><br>
                                O novo conteúdo será adicionado ao ciclo existente (conversas acumuladas).
                              </p>
                              <p class="mb-2">
                                <strong>Se o objetivo mudou significativamente:</strong><br>
                                O ciclo anterior será fechado e um novo ciclo será criado.
                              </p>
                              <p class="mb-0">
                                <strong>Se não houver ciclo ativo:</strong><br>
                                Um novo ciclo será criado automaticamente.
                              </p>
                            </div>
                          </div>
                        </template>
                      </v-tooltip>
                    </template>
                  </v-text-field>
                </v-col>

                <!-- Status -->
                <v-col cols="12" md="6">
                  <v-select v-model="formData.status" :items="statusOptions" label="Status" variant="outlined"
                    prepend-inner-icon="mdi-flag" hint="Status do ciclo de atendimento" persistent-hint item-title="title"
                    item-value="value"></v-select>
                </v-col>

              

                <!-- Conteúdo do Atendimento * -->
                <v-col cols="12">
                  <v-textarea 
  v-model="formData.raw_content" 
  label="Conteúdo da Conversa *" 
  variant="outlined"
  persistent-placeholder
  density="comfortable"
  :rules="[rules.required, rules.minLength, rules.maxLength]" 
  :rows="8" 
  prepend-inner-icon="mdi-text"
  hint="Descreva o conteúdo da conversa. Se houver um ciclo ativo com objetivo similar, este conteúdo será adicionado ao ciclo existente. Caso contrário, um novo ciclo será criado."
  persistent-hint 
  counter
  :maxlength="100000"
  :error-messages="rawContentErrorMessages"
  :error="rawContentErrorMessages.length > 0"
>
</v-textarea>
                  <!-- Warning when approaching limit -->
                  <v-alert
                    v-if="rawContentLength > 90000"
                    type="warning"
                    variant="tonal"
                    density="compact"
                    class="mt-2"
                  >
                    <div class="d-flex align-center">
                      <v-icon size="18" class="mr-2">mdi-alert</v-icon>
                      <div>
                        <div class="text-body-2 font-weight-medium">
                          Você está próximo do limite de 100.000 caracteres
                        </div>
                        <div class="text-caption">
                          Restam {{ (100000 - rawContentLength).toLocaleString('pt-BR') }} caracteres.
                          O conteúdo será truncado automaticamente pela IA se exceder o limite.
                        </div>
                      </div>
                    </div>
                  </v-alert>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- AI Suggestions Dialog -->
    <ClientUpdateSuggestionsDialog
      v-model="showSuggestionsDialog"
      :client="suggestionsClient"
      :ai-summary="suggestionsAISummary"
      @applied="handleSuggestionsApplied"
      @skipped="handleSuggestionsSkipped"
    />

    <!-- Visit Detection Dialog -->
    <VisitDetectionDialog
      v-model="showVisitDialog"
      :visit-info="detectedVisit"
      :client-id="formData.client_id"
      :agent-id="formData.agent_id"
      :property-id="formData.property_id"
      @confirmed="handleVisitConfirmed"
      @cancelled="handleVisitCancelled"
    />

    <!-- Snackbar for cycle action feedback -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="5000"
      location="top"
      rounded="lg"
    >
      <div class="d-flex align-center">
        <v-icon v-if="snackbarIcon" :icon="snackbarIcon" class="mr-2"></v-icon>
        <span>{{ snackbarText }}</span>
      </div>
      <template #actions>
        <v-btn variant="text" @click="snackbar = false">Fechar</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { VForm } from 'vuetify/components'
import {
  attendancesService,
  type AttendanceCreate,
  type AttendanceUpdate,
} from '@/shared/services/attendances.service'
import { clientsService, type Client } from '@/shared/services/clients.service'
import { usersService, type User } from '@/shared/services/users.service'
import { propertiesService } from '@/shared/services/properties.service'
import { aiSummariesService, type AISummary } from '@/shared/services/aiSummaries.service'
import { formatPhone } from '@/shared/utils/masks'
import SearchSelectDialog from '@/shared/components/SearchSelectDialog.vue'
import ClientUpdateSuggestionsDialog from '@/shared/components/ClientUpdateSuggestionsDialog.vue'
import VisitDetectionDialog from '@/shared/components/VisitDetectionDialog.vue'

const router = useRouter()
const route = useRoute()

// State
const formRef = ref<VForm | null>(null)
const isFormValid = ref(false)
const isSaving = ref(false)
const isLoadingClients = ref(false)
const isLoadingAgents = ref(false)
const isLoadingProperties = ref(false)
const isLoadingAttendance = ref(false)

const agents = ref<User[]>([])

// AI Suggestions Dialog state
const showSuggestionsDialog = ref(false)
const suggestionsClient = ref<Client | null>(null)
const suggestionsAISummary = ref<AISummary | null>(null)
const savedAttendanceId = ref<string | null>(null)

// Visit Detection Dialog state
const showVisitDialog = ref(false)
const detectedVisit = ref<any | null>(null)
const savedAttendanceForVisit = ref<{ id: string; client_id: string } | null>(null)

// Raw content validation
const rawContentLength = computed(() => formData.value.raw_content?.length || 0)
const rawContentErrorMessages = computed(() => {
  const messages: string[] = []
  if (rawContentLength.value > 100000) {
    messages.push('Conteúdo excede o limite de 100.000 caracteres')
  }
  return messages
})

// Snackbar state
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref<'success' | 'info' | 'warning' | 'error'>('success')
const snackbarIcon = ref('')

const showSnackbar = (
  color: 'success' | 'info' | 'warning' | 'error',
  text: string,
  icon: string = ''
) => {
  snackbarColor.value = color
  snackbarText.value = text
  snackbarIcon.value = icon
  snackbar.value = true
}

// Search state for clients
const clientSearchItems = ref<any[]>([])
const clientsTotalItems = ref(0)
const clientsPerPage = 10

// Search state for properties
const propertySearchItems = ref<any[]>([])
const propertiesTotalItems = ref(0)
const propertiesPerPage = 10

// Check if in edit mode
const isEditMode = computed(() => !!route.params.id)

// Helper to convert ISO datetime to local datetime-local format
const convertISOToLocalDateTime = (isoString: string | null): string | null => {
  if (!isoString) return null
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const formData = ref<AttendanceCreate>({
  client_id: '',
  agent_id: '',
  property_id: null,
  objective: null, // Optional: will be auto-detected
  channel: 'WHATSAPP',
  raw_content: '',
  status: 'ACTIVE',
  scheduled_visit_at: null,
})

// Options
const channelOptions = computed(() => {
  const options = [
    { title: 'WhatsApp', value: 'WHATSAPP', icon: 'mdi-whatsapp', color: 'success' },
    { title: 'Site', value: 'SITE', icon: 'mdi-web', color: 'primary' },
    { title: 'Telefone', value: 'PHONE', icon: 'mdi-phone', color: 'info' },
    { title: 'E-mail', value: 'EMAIL', icon: 'mdi-email', color: 'warning' },
    { title: 'Presencial', value: 'IN_PERSON', icon: 'mdi-account', color: 'purple' },
  ]
  // Remove duplicates by value
  return Array.from(
    new Map(options.map(option => [option.value, option])).values()
  )
})

const statusOptions = [
  { title: 'Ativo', value: 'ACTIVE' },
  { title: 'Concluído', value: 'COMPLETED' },
  { title: 'Perdido', value: 'LOST' },
  { title: 'Abandonado', value: 'ABANDONED' },
]

const agentOptions = computed(() => {
  if (!agents.value || agents.value.length === 0) {
    console.log('No agents available for options')
    return []
  }
  
  // Remove duplicates by ID
  const uniqueAgents = Array.from(
    new Map(agents.value.map(agent => [agent.id, agent])).values()
  )
  
  // Map to options and remove duplicates by value as well
  const options = uniqueAgents.map(agent => ({
    title: agent.full_name || `User ${agent.id}`,
    value: agent.id,
  }))
  
  // Final deduplication by value to ensure no duplicates in the list
  const finalOptions = Array.from(
    new Map(options.map(option => [option.value, option])).values()
  )
  
  console.log('Agent options computed:', finalOptions.length, 'options')
  return finalOptions
})

// Validation Rules
const rules = {
  required: (value: any) => {
    if (typeof value === 'string') {
      return value.trim() !== '' || 'Campo obrigatório'
    }
    return value !== null && value !== undefined || 'Campo obrigatório'
  },
  minLength: (value: string) => {
    if (!value) return 'Campo obrigatório'
    return value.trim().length >= 10 || 'Conteúdo deve ter pelo menos 10 caracteres'
  },
  maxLength: (value: string) => {
    if (!value) return true
    return value.length <= 100000 || 'Conteúdo não pode exceder 100.000 caracteres'
  },
}

// Methods
const loadAgents = async () => {
  if (isLoadingAgents.value) return // Prevent multiple simultaneous loads
  isLoadingAgents.value = true
  try {
    console.log('Loading corretores...')
    const data = await usersService.getCorretores()
    console.log('Raw data from API:', data)
    
    if (!data || !Array.isArray(data)) {
      console.warn('Invalid data received from API:', data)
      agents.value = []
      return
    }
    
    if (data.length === 0) {
      console.warn('No corretores found in the system')
      agents.value = []
      return
    }
    
    // Remove duplicates by ID before setting
    const uniqueAgents = Array.from(
      new Map(data.map(agent => [agent.id, agent])).values()
    )
    agents.value = uniqueAgents
    console.log('Loaded agents:', uniqueAgents.length, 'unique agents', uniqueAgents)
  } catch (error) {
    console.error('Error loading agents:', error)
    agents.value = []
  } finally {
    isLoadingAgents.value = false
  }
}

// Handle client search from SearchSelectDialog
const handleClientSearch = async (query: string, page: number) => {
  isLoadingClients.value = true
  try {
    // Fetch all clients (backend doesn't support pagination/search filtering yet)
    const data = await clientsService.getClients({ limit: 1000 })
    
    // Filter by search query client-side
    let filtered = data
    if (query && query.trim()) {
      const lowerQuery = query.toLowerCase().trim()
      filtered = data.filter(client =>
        client.name.toLowerCase().includes(lowerQuery) ||
        (client.email && client.email.toLowerCase().includes(lowerQuery)) ||
        (client.phone && client.phone.includes(lowerQuery))
      )
    }
    
    // Apply pagination client-side
    const startIndex = (page - 1) * clientsPerPage
    const endIndex = startIndex + clientsPerPage
    const paginatedItems = filtered.slice(startIndex, endIndex)
    
    // Map to search items format
    clientSearchItems.value = paginatedItems.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      title: client.name,
      subtitle: client.phone || client.email,
    }))
    
    clientsTotalItems.value = filtered.length
  } catch (error) {
    console.error('Error searching clients:', error)
    clientSearchItems.value = []
    clientsTotalItems.value = 0
  } finally {
    isLoadingClients.value = false
  }
}

// Handle client selection
const handleClientSelect = (item: any) => {
  if (item) {
    console.log('Client selected:', item)
  }
}

// Handle property search from SearchSelectDialog
const handlePropertySearch = async (query: string, page: number) => {
  isLoadingProperties.value = true
  try {
    // Fetch all properties (backend doesn't support pagination/search filtering yet)
    const data = await propertiesService.listProperties({ limit: 1000 })
    
    // Filter by search query client-side
    let filtered = data
    if (query && query.trim()) {
      const lowerQuery = query.toLowerCase().trim()
      filtered = data.filter(property =>
        property.title.toLowerCase().includes(lowerQuery) ||
        property.code.toLowerCase().includes(lowerQuery) ||
        (property.city && property.city.toLowerCase().includes(lowerQuery)) ||
        (property.neighborhood && property.neighborhood.toLowerCase().includes(lowerQuery))
      )
    }
    
    // Apply pagination client-side
    const startIndex = (page - 1) * propertiesPerPage
    const endIndex = startIndex + propertiesPerPage
    const paginatedItems = filtered.slice(startIndex, endIndex)
    
    // Map to search items format
    propertySearchItems.value = paginatedItems.map(property => ({
      id: property.id,
      title: property.title,
      code: property.code,
      city: property.city,
      neighborhood: property.neighborhood,
      main_image_url: property.main_image_url,
      subtitle: `${property.code} ${property.city ? '• ' + property.city : ''}`,
    }))
    
    propertiesTotalItems.value = filtered.length
  } catch (error) {
    console.error('Error searching properties:', error)
    propertySearchItems.value = []
    propertiesTotalItems.value = 0
  } finally {
    isLoadingProperties.value = false
  }
}

// Handle property selection
const handlePropertySelect = (item: any) => {
  if (item) {
    console.log('Property selected:', item)
  }
}

// Load attendance for editing
const loadAttendance = async () => {
  if (!isEditMode.value || !route.params.id) return

  isLoadingAttendance.value = true
  try {
    const attendance = await attendancesService.getAttendanceById(route.params.id as string)
    
    // Populate form with attendance data
    formData.value = {
      client_id: attendance.client_id,
      agent_id: attendance.agent_id,
      property_id: attendance.property_id || null,
      objective: attendance.objective || null,
      channel: attendance.channel,
      raw_content: attendance.raw_content,
      status: attendance.status,
      scheduled_visit_at: convertISOToLocalDateTime(attendance.scheduled_visit_at),
    }
  } catch (error: any) {
    console.error('Error loading attendance:', error)
    const errorMessage =
      error?.response?.data?.detail || error?.message || 'Erro ao carregar atendimento'
    alert(`Erro ao carregar atendimento: ${errorMessage}`)
    router.push({ name: 'attendances' })
  } finally {
    isLoadingAttendance.value = false
  }
}

const handleSave = async () => {
  if (!formRef.value) return

  // Check content length before validation
  if (formData.value.raw_content && formData.value.raw_content.length > 100000) {
    showSnackbar(
      'error',
      'O conteúdo excede o limite de 100.000 caracteres. Por favor, reduza o tamanho do texto.',
      'mdi-alert-circle'
    )
    return
  }

  const { valid } = await formRef.value.validate()
  if (!valid) {
    return
  }

  isSaving.value = true

  try {
    if (isEditMode.value && route.params.id) {
      // Update existing attendance
      const updateData: AttendanceUpdate = {
        client_id: formData.value.client_id,
        agent_id: formData.value.agent_id,
        property_id: formData.value.property_id || null,
        objective: formData.value.objective || null,
        channel: formData.value.channel,
        raw_content: formData.value.raw_content.trim(),
        status: formData.value.status,
        scheduled_visit_at: formData.value.scheduled_visit_at
          ? convertLocalDateTimeToISO(formData.value.scheduled_visit_at)
          : null,
      }

      const updated = await attendancesService.updateAttendance(route.params.id as string, updateData)
      
      // Check if visit was detected
      if (updated.detected_visit && updated.detected_visit.detected) {
        detectedVisit.value = updated.detected_visit
        savedAttendanceForVisit.value = { id: route.params.id as string, client_id: formData.value.client_id }
        showVisitDialog.value = true
        return // Don't redirect yet, wait for user to handle visit dialog
      }
      
      // If attendance is completed, check for AI suggestions
      if (updateData.status === 'COMPLETED') {
        await checkForAISuggestions(route.params.id as string, formData.value.client_id)
      } else {
        // Redirect to details page
        router.push({ name: 'attendances-details', params: { id: route.params.id } })
      }
    } else {
      // Create new attendance
      const attendanceData: AttendanceCreate = {
        client_id: formData.value.client_id,
        agent_id: formData.value.agent_id,
        property_id: formData.value.property_id || null,
        objective: formData.value.objective || null, // Optional: backend will auto-detect if not provided
        channel: formData.value.channel,
        raw_content: formData.value.raw_content.trim(),
        status: formData.value.status,
        scheduled_visit_at: formData.value.scheduled_visit_at
          ? convertLocalDateTimeToISO(formData.value.scheduled_visit_at)
          : null,
      }

      const created = await attendancesService.createAttendance(attendanceData)
      
      // Show feedback based on cycle action
      if (created.cycle_action === 'NEW_CYCLE_CREATED') {
        if (created.previous_cycle_id) {
          showSnackbar(
            'info',
            `Novo ciclo criado! O ciclo anterior foi fechado devido à mudança de objetivo.`,
            'mdi-information'
          )
        } else {
          showSnackbar(
            'success',
            'Novo ciclo de atendimento criado com sucesso!',
            'mdi-check-circle'
          )
        }
      } else if (created.cycle_action === 'CYCLE_UPDATED') {
        showSnackbar(
          'success',
          'Conversa adicionada ao ciclo atual com sucesso!',
          'mdi-message-plus'
        )
      }
      
      // Check if visit was detected
      if (created.detected_visit && created.detected_visit.detected) {
        detectedVisit.value = created.detected_visit
        savedAttendanceForVisit.value = { id: created.id, client_id: created.client_id }
        showVisitDialog.value = true
        return // Don't redirect yet, wait for user to handle visit dialog
      }
      
      // Check if loss was detected - redirect to client page with loss dialog
      if (created.detected_loss && created.detected_loss.detected) {
        // Navigate to client details page with loss detection
        router.push({ 
          name: 'clients-details', 
          params: { id: created.client_id },
          query: { 
            showLossDialog: 'true',
            lossReason: created.detected_loss.loss_reason || '',
            lossStage: created.detected_loss.loss_stage || '',
            detailedReason: created.detected_loss.detailed_reason || '',
            clientFeedback: created.detected_loss.client_feedback || '',
          }
        })
        return
      }
      
      // Check if sale was detected - redirect to client page with sale dialog
      if (created.detected_sale && created.detected_sale.detected) {
        // Navigate to client details page with sale detection
        router.push({ 
          name: 'clients-details', 
          params: { id: created.client_id },
          query: { 
            showSaleDialog: 'true',
            saleType: created.detected_sale.sale_type || '',
            saleValue: created.detected_sale.sale_value?.toString() || '',
            paymentMethod: created.detected_sale.payment_method || '',
            notes: created.detected_sale.notes || '',
          }
        })
        return
      }
      
      // If attendance is completed, check for AI suggestions
      if (created.status === 'COMPLETED') {
        await checkForAISuggestions(created.id, created.client_id)
      } else {
        // Redirect to details page
        router.push({ name: 'attendances-details', params: { id: created.id } })
      }
    }
  } catch (error: any) {
    console.error('Error saving attendance:', error)
    const errorMessage =
      error?.response?.data?.detail || error?.message || 'Erro desconhecido ao salvar atendimento'
    alert(`Erro ao salvar atendimento: ${errorMessage}`)
  } finally {
    isSaving.value = false
  }
}

// Check for AI suggestions after saving completed attendance
const checkForAISuggestions = async (attendanceId: string, clientId: string) => {
  try {
    // Load client data
    const client = await clientsService.getClientById(clientId)
    
    // Load AI summary for this attendance
    const summaries = await aiSummariesService.getSummariesByClientId(clientId)
    
    // Find the most recent summary (should be the one just created)
    const latestSummary = summaries
      .filter(s => s.status === 'COMPLETED')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    
    if (latestSummary) {
      // Check if there are any suggestions to make
      const hasSuggestions = checkIfHasSuggestions(client, latestSummary)
      
      if (hasSuggestions) {
        // Show suggestions dialog
        suggestionsClient.value = client
        suggestionsAISummary.value = latestSummary
        savedAttendanceId.value = attendanceId
        showSuggestionsDialog.value = true
        return // Don't redirect yet, wait for dialog
      }
    }
    
    // No suggestions, redirect directly
    router.push({ name: 'attendances-details', params: { id: attendanceId } })
  } catch (error) {
    console.error('Error checking for AI suggestions:', error)
    // If error, just redirect
    router.push({ name: 'attendances-details', params: { id: attendanceId } })
  }
}

// Check if AI summary has suggestions that differ from client data
const checkIfHasSuggestions = (client: Client, summary: AISummary): boolean => {
  // Extract city and property_type from key_points if available
  const city = summary.key_points?.city || null
  const propertyType = summary.key_points?.property_type || null
  
  // Check if any field is different
  if (city && city !== client.current_city_interest) return true
  if (propertyType && propertyType !== client.current_property_type) return true
  if (summary.interest_type_detected && summary.interest_type_detected !== client.current_interest_type) return true
  if (summary.urgency_level_detected && summary.urgency_level_detected !== client.current_urgency_level) return true
  if (summary.budget_min_detected && (!client.current_budget_min || parseFloat(client.current_budget_min) !== summary.budget_min_detected)) return true
  if (summary.budget_max_detected && (!client.current_budget_max || parseFloat(client.current_budget_max) !== summary.budget_max_detected)) return true
  
  return false
}

// Handle suggestions dialog events
const handleSuggestionsApplied = () => {
  if (savedAttendanceId.value) {
    router.push({ name: 'attendances-details', params: { id: savedAttendanceId.value } })
  }
}

// Handle visit detection dialog events
const handleVisitConfirmed = () => {
  // Visit was created, user will be redirected to visit form
  // Optionally redirect to attendance details after
  if (savedAttendanceForVisit.value) {
    // Small delay to allow visit form to load
    setTimeout(() => {
      router.push({ name: 'attendances-details', params: { id: savedAttendanceForVisit.value!.id } })
    }, 1000)
  }
}

const handleVisitCancelled = () => {
  // User cancelled visit creation, redirect to attendance details
  if (savedAttendanceForVisit.value) {
    router.push({ name: 'attendances-details', params: { id: savedAttendanceForVisit.value.id } })
  }
}

const handleSuggestionsSkipped = () => {
  if (savedAttendanceId.value) {
    router.push({ name: 'attendances-details', params: { id: savedAttendanceId.value } })
  }
}

const convertLocalDateTimeToISO = (localDateTime: string): string => {
  // Convert from "YYYY-MM-DDTHH:mm" to ISO string
  if (!localDateTime) return ''
  // datetime-local format is "YYYY-MM-DDTHH:mm"
  // We need to convert to ISO format with timezone
  // Create a Date object from the local datetime string
  const date = new Date(localDateTime)
  // Return as ISO string (includes timezone)
  return date.toISOString()
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}


const goBack = () => {
  router.push({ name: 'attendances' })
}

// Counter formatting
const formatCounter = (value: number, maxLength: number): string => {
  const val = value ?? 0
  const max = maxLength ?? 100000
  return `${val.toLocaleString('pt-BR')} / ${max.toLocaleString('pt-BR')}`
}

const getCounterColor = (value: number, maxLength: number): string => {
  const val = value ?? 0
  const max = maxLength ?? 100000
  if (val > max) return 'text-error'
  if (val > max * 0.9) return 'text-warning'
  return 'text-medium-emphasis'
}

onMounted(async () => {
  // Load agents (always needed as combobox)
  await loadAgents()
  
  // Load attendance if in edit mode and populate search dialogs with selected items
  if (isEditMode.value) {
    await loadAttendance()
    
    // Pre-load client data for the search dialog if client is set
    if (formData.value.client_id) {
      await handleClientSearch('', 1)
    }
    
    // Pre-load property data for the search dialog if property is set
    if (formData.value.property_id) {
      await handlePropertySearch('', 1)
    }
  }
})
</script>

<style scoped>
/* Adjustments for label positioning */
:deep(.v-field--variant-outlined .v-field-label) {
  top: -10px !important;
  background-color: rgb(var(--v-theme-surface)) !important;
  padding-inline: 4px !important;
  margin-inline-start: -4px !important;
  font-size: 0.75em;
}

:deep(.v-field--variant-outlined .v-field__outline) {
  top: 0 !important;
}

/* AI Panel Container */
.ai-panel-container {
  position: sticky;
  top: 80px;
  max-height: calc(100vh - 100px);
}

.cursor-pointer {
  cursor: pointer;
}
</style>
