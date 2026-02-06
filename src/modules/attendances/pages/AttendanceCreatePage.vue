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
        <span class="text-h5">Novo Atendimento</span>
        <v-spacer></v-spacer>
        <v-btn color="primary" :loading="isSaving" :disabled="isSaving || !isFormValid" prepend-icon="mdi-content-save"
          @click="handleSave">
          Salvar
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- Form -->
    <v-card elevation="2">
      <v-card-text class="pa-6">
        <v-form ref="formRef" v-model="isFormValid">
          <v-row>
            <!-- Cliente * -->
            <v-col cols="12" md="6">
              <v-select v-model="formData.client_id" :items="clientOptions" :loading="isLoadingClients"
                label="Cliente *" variant="outlined" :rules="[rules.required]" prepend-inner-icon="mdi-account"
                hint="Selecione o cliente atendido" persistent-hint item-title="title" item-value="value"
                @update:search="searchClients">
                <template #item="{ item, props }">
                  <v-list-item v-bind="props" :key="`client-${item.value}`">
                    <template #prepend>
                      <v-avatar color="primary" size="32" class="mr-3">
                        <span class="text-caption text-white">
                          {{ getInitials(item.title) }}
                        </span>
                      </v-avatar>
                    </template>

                    <v-list-item-subtitle v-if="item.raw?.phone">
                      {{ formatPhone(item.raw.phone) }}
                    </v-list-item-subtitle>
                  </v-list-item>

                </template>
              </v-select>
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
              <v-select v-model="formData.property_id" :items="propertyOptions" :loading="isLoadingProperties"
                label="Propriedade (Opcional)" variant="outlined" clearable prepend-inner-icon="mdi-home"
                hint="Selecione a propriedade relacionada, se aplicável" persistent-hint item-title="title"
                item-value="value" @update:search="searchProperties">
                <template #item="{ item, props }">
                  <v-list-item v-bind="props" :key="`property-${item.value}`">
                    <v-list-item-subtitle v-if="item.raw?.code">
                      Código: {{ item.raw.code }}
                    </v-list-item-subtitle>
                  </v-list-item>

                </template>
              </v-select>
            </v-col>

            <!-- Canal * -->
            <v-col cols="12" md="6">
              <v-select v-model="formData.channel" :items="channelOptions" label="Canal de Atendimento *"
                variant="outlined" :rules="[rules.required]" prepend-inner-icon="mdi-phone"
                hint="Como o atendimento foi realizado" persistent-hint item-title="title" item-value="value">
                <template #item="{ item, props }">
                  <v-list-item v-bind="props" :key="`channel-${item.value}`">
                    <template #prepend>
                      <v-icon :color="item.raw?.color || item.color" class="mr-3">
                        {{ item.raw?.icon || item.icon }}
                      </v-icon>
                    </template>
                  </v-list-item>
                </template>
                <template #selection="{ item }">
                  <div class="d-flex align-center">
                    <v-icon :color="item.raw?.color || item.color" size="small" class="mr-2">
                      {{ item.raw?.icon || item.icon }}
                    </v-icon>
                    <span>{{ item.raw?.title || item.title }}</span>
                  </div>
                </template>
              </v-select>
            </v-col>

            <!-- Data/Hora de Início * -->
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.started_at" label="Data/Hora de Início *" type="datetime-local"
                variant="outlined" :rules="[rules.required]" prepend-inner-icon="mdi-calendar-clock"
                hint="Quando o atendimento começou" persistent-hint></v-text-field>
            </v-col>

            <!-- Data/Hora de Término (Opcional) -->
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.ended_at" label="Data/Hora de Término (Opcional)" type="datetime-local"
                variant="outlined" prepend-inner-icon="mdi-calendar-check"
                hint="Quando o atendimento terminou (deixe em branco se ainda está em andamento)"
                persistent-hint></v-text-field>
            </v-col>

            <!-- Status -->
            <v-col cols="12" md="6">
              <v-select v-model="formData.status" :items="statusOptions" label="Status" variant="outlined"
                prepend-inner-icon="mdi-flag" hint="Status do atendimento" persistent-hint item-title="title"
                item-value="value"></v-select>
            </v-col>

            <!-- Agendar Visita (Opcional) -->
            <v-col cols="12" md="6">
              <v-text-field v-model="formData.scheduled_visit_at" label="Agendar Visita (Opcional)"
                type="datetime-local" variant="outlined" prepend-inner-icon="mdi-calendar-plus"
                hint="Data/hora para agendar uma visita relacionada" persistent-hint></v-text-field>
            </v-col>

            <!-- Conteúdo do Atendimento * -->
            <v-col cols="12">
              <v-textarea v-model="formData.raw_content" label="Conteúdo do Atendimento *" variant="outlined"
                :rules="[rules.required, rules.minLength]" rows="8" prepend-inner-icon="mdi-text"
                hint="Descreva o conteúdo completo do atendimento. Este conteúdo será usado pela IA para gerar resumos e próximos passos."
                persistent-hint counter :maxlength="10000"></v-textarea>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { VForm } from 'vuetify/components'
import {
  attendancesService,
  type AttendanceCreate,
  type AttendanceChannel,
  type AttendanceStatus,
} from '@/shared/services/attendances.service'
import { clientsService, type Client } from '@/shared/services/clients.service'
import { usersService, type User } from '@/shared/services/users.service'
import { propertiesService, type Property } from '@/shared/services/properties.service'
import { formatPhone } from '@/shared/utils/masks'

const router = useRouter()

// State
const formRef = ref<VForm | null>(null)
const isFormValid = ref(false)
const isSaving = ref(false)
const isLoadingClients = ref(false)
const isLoadingAgents = ref(false)
const isLoadingProperties = ref(false)

const clients = ref<Client[]>([])
const agents = ref<User[]>([])
const properties = ref<Property[]>([])

const formData = ref<AttendanceCreate>({
  client_id: '',
  agent_id: '',
  property_id: null,
  channel: 'WHATSAPP',
  started_at: new Date().toISOString().slice(0, 16), // Current date/time in local format
  ended_at: null,
  raw_content: '',
  status: 'IN_PROGRESS',
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
  { title: 'Em Andamento', value: 'IN_PROGRESS' },
  { title: 'Concluído', value: 'COMPLETED' },
  { title: 'Cancelado', value: 'CANCELLED' },
  { title: 'Pausado', value: 'PAUSED' },
]

const clientOptions = computed(() => {
  if (!clients.value || clients.value.length === 0) return []

  // Remove duplicates by ID first
  const uniqueClients = Array.from(
    new Map(clients.value.map(client => [client.id, client])).values()
  )

  // Map to options
  const options = uniqueClients.map(client => ({
    title: client.name,
    value: client.id,
    raw: client,
  }))

  // Final deduplication by value to ensure no duplicates in the list
  const deduplicated = Array.from(
    new Map(options.map(option => [option.value, option])).values()
  )

  console.log('Client options:', deduplicated.length, 'items')
  return deduplicated
})

const agentOptions = computed(() => {
  // Remove duplicates by ID
  const uniqueAgents = Array.from(
    new Map(agents.value.map(agent => [agent.id, agent])).values()
  )
  // Map to options and remove duplicates by value as well
  const options = uniqueAgents.map(agent => ({
    title: agent.full_name,
    value: agent.id,
  }))
  // Final deduplication by value to ensure no duplicates in the list
  return Array.from(
    new Map(options.map(option => [option.value, option])).values()
  )
})

const propertyOptions = computed(() => {
  if (!properties.value || properties.value.length === 0) return []

  // Remove duplicates by ID first
  const uniqueProperties = Array.from(
    new Map(properties.value.map(property => [property.id, property])).values()
  )

  // Map to options
  const options = uniqueProperties.map(property => ({
    title: `${property.title} - ${property.code}`,
    value: property.id,
    raw: property,
  }))

  // Final deduplication by value to ensure no duplicates in the list
  const deduplicated = Array.from(
    new Map(options.map(option => [option.value, option])).values()
  )

  console.log('Property options:', deduplicated.length, 'items')
  return deduplicated
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
}

// Methods
const loadClients = async () => {
  if (isLoadingClients.value) return // Prevent multiple simultaneous loads
  isLoadingClients.value = true
  try {
    const data = await clientsService.getClients({ limit: 1000 })
    // Remove duplicates by ID before setting
    const uniqueClients = Array.from(
      new Map(data.map(client => [client.id, client])).values()
    )
    clients.value = uniqueClients
    console.log('Loaded clients:', uniqueClients.length, 'unique clients')
  } catch (error) {
    console.error('Error loading clients:', error)
  } finally {
    isLoadingClients.value = false
  }
}

const loadAgents = async () => {
  if (isLoadingAgents.value) return // Prevent multiple simultaneous loads
  isLoadingAgents.value = true
  try {
    const data = await usersService.getCorretores()
    // Remove duplicates by ID before setting
    const uniqueAgents = Array.from(
      new Map(data.map(agent => [agent.id, agent])).values()
    )
    agents.value = uniqueAgents
    console.log('Loaded agents:', uniqueAgents.length, 'unique agents')
  } catch (error) {
    console.error('Error loading agents:', error)
  } finally {
    isLoadingAgents.value = false
  }
}

const loadProperties = async () => {
  if (isLoadingProperties.value) return // Prevent multiple simultaneous loads
  isLoadingProperties.value = true
  try {
    const data = await propertiesService.listProperties({ limit: 1000 })
    // Remove duplicates by ID before setting
    const uniqueProperties = Array.from(
      new Map(data.map(property => [property.id, property])).values()
    )
    properties.value = uniqueProperties
    console.log('Loaded properties:', uniqueProperties.length, 'unique properties')
  } catch (error) {
    console.error('Error loading properties:', error)
  } finally {
    isLoadingProperties.value = false
  }
}

const searchClients = async (search: string) => {
  if (!search || search.length < 2) return
  // Could implement search here if backend supports it
  // For now, just load all clients
}

const searchProperties = async (search: string) => {
  if (!search || search.length < 2) return
  // Could implement search here if backend supports it
  // For now, just load all properties
}

const handleSave = async () => {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()
  if (!valid) {
    return
  }

  isSaving.value = true

  try {
    // Convert datetime-local format to ISO string
    const attendanceData: AttendanceCreate = {
      client_id: formData.value.client_id,
      agent_id: formData.value.agent_id,
      property_id: formData.value.property_id || null,
      channel: formData.value.channel,
      started_at: convertLocalDateTimeToISO(formData.value.started_at),
      ended_at: formData.value.ended_at
        ? convertLocalDateTimeToISO(formData.value.ended_at)
        : null,
      raw_content: formData.value.raw_content.trim(),
      status: formData.value.status,
      scheduled_visit_at: formData.value.scheduled_visit_at
        ? convertLocalDateTimeToISO(formData.value.scheduled_visit_at)
        : null,
    }

    await attendancesService.createAttendance(attendanceData)

    // Redirect to list
    router.push({ name: 'attendances' })
    // TODO: Show success notification
  } catch (error: any) {
    console.error('Error saving attendance:', error)
    const errorMessage =
      error?.response?.data?.detail || error?.message || 'Erro desconhecido ao salvar atendimento'
    alert(`Erro ao salvar atendimento: ${errorMessage}`)
  } finally {
    isSaving.value = false
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

onMounted(() => {
  loadClients()
  loadAgents()
  loadProperties()
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
</style>
