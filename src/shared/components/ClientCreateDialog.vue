<template>
  <v-dialog
    v-model="dialogModel"
    max-width="600"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center pa-4">
        <v-icon
          :color="isEditMode ? 'primary' : 'success'"
          class="mr-3"
          size="32"
        >
          {{ isEditMode ? 'mdi-account-edit' : 'mdi-account-plus' }}
        </v-icon>
        <span class="text-h5">
          {{ isEditMode ? 'Editar Cliente' : 'Novo Cliente' }}
        </span>
        <v-spacer></v-spacer>
        <v-btn
          icon
          variant="text"
          @click="handleClose"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-6">
        <v-form
          ref="formRef"
          v-model="isFormValid"
        >
          <v-row>
            <!-- Nome -->
            <v-col cols="12">
              <v-text-field
                v-model="formData.name"
                label="Nome *"
                variant="outlined"
                :rules="[rules.required]"
                prepend-inner-icon="mdi-account"
                hint="Nome completo do cliente"
                persistent-hint
              ></v-text-field>
            </v-col>

            <!-- Telefone -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="phoneFormatted"
                @blur="formData.phone = parsePhone(phoneFormatted)"
                label="Telefone *"
                variant="outlined"
                :rules="[rules.required, rules.phone]"
                prepend-inner-icon="mdi-phone"
                hint="Telefone de contato"
                persistent-hint
              ></v-text-field>
            </v-col>

            <!-- Email -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.email"
                label="Email"
                type="email"
                variant="outlined"
                :rules="[rules.email]"
                prepend-inner-icon="mdi-email"
                hint="Email de contato (opcional)"
                persistent-hint
              ></v-text-field>
            </v-col>

            <!-- Lead Source -->
            <v-col cols="12">
              <v-select
                v-model="formData.lead_source"
                :items="leadSourceOptions"
                label="Origem do Lead *"
                variant="outlined"
                :rules="[rules.required]"
                prepend-inner-icon="mdi-source-branch"
                hint="Como o cliente chegou até você"
                persistent-hint
              ></v-select>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="handleClose"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="isSaving"
          :disabled="!isFormValid || isSaving"
          prepend-icon="mdi-content-save"
          @click="handleSave"
        >
          {{ isEditMode ? 'Salvar' : 'Criar' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { VForm } from 'vuetify/components'
import {
  clientsService,
  type Client,
  type ClientCreate,
  type ClientUpdate,
  type LeadSource,
} from '@/shared/services/clients.service'
import { formatPhone, parsePhone } from '@/shared/utils/masks'

/**
 * Props
 */
interface Props {
  /**
   * Whether the dialog is visible
   */
  modelValue: boolean
  /**
   * Client to edit (if provided, dialog is in edit mode)
   */
  client?: Client | null
}

const props = withDefaults(defineProps<Props>(), {
  client: null,
})

/**
 * Emits
 */
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': [client: Client]
  'error': [error: string]
}>()

/**
 * State
 */
const formRef = ref<VForm | null>(null)
const isFormValid = ref(false)
const isSaving = ref(false)

const formData = ref<ClientCreate>({
  name: '',
  phone: '',
  email: '',
  lead_source: 'WHATSAPP',
})

const phoneFormatted = ref('')

/**
 * Computed
 */
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isEditMode = computed(() => !!props.client)

const leadSourceOptions = [
  { title: 'WhatsApp', value: 'WHATSAPP' },
  { title: 'Site', value: 'SITE' },
  { title: 'Telefone', value: 'PHONE' },
]

/**
 * Validation Rules
 */
const rules = {
  required: (value: any) => {
    if (typeof value === 'string') {
      return value.trim() !== '' || 'Campo obrigatório'
    }
    return value !== null && value !== undefined || 'Campo obrigatório'
  },
  phone: (value: string) => {
    if (!value) return 'Telefone obrigatório'
    const digits = value.replace(/\D/g, '')
    if (digits.length < 10) {
      return 'Telefone deve ter pelo menos 10 dígitos'
    }
    return true
  },
  email: (value: string) => {
    if (!value) return true // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) || 'Email inválido'
  },
}

/**
 * Methods
 */
const resetForm = () => {
  formData.value = {
    name: '',
    phone: '',
    email: '',
    lead_source: 'WHATSAPP',
  }
  phoneFormatted.value = ''
  formRef.value?.resetValidation()
}

const loadClient = () => {
  if (!props.client) {
    resetForm()
    return
  }

  formData.value = {
    name: props.client.name,
    phone: props.client.phone,
    email: props.client.email,
    lead_source: props.client.lead_source,
  }
  phoneFormatted.value = formatPhone(props.client.phone)
}

const handleClose = () => {
  dialogModel.value = false
  resetForm()
}

const handleSave = async () => {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()
  if (!valid) {
    return
  }

  isSaving.value = true

  try {
    // Ensure phone is parsed (remove formatting)
    const phone = parsePhone(phoneFormatted.value) || formData.value.phone

    // Prepare email - if not provided, generate a valid temporary email
    // Backend requires EmailStr, so we need a valid email format
    let email = formData.value.email?.trim() || ''
    if (!email) {
      // Generate temporary email based on name and timestamp
      const nameSlug = formData.value.name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '.')
        .replace(/[^a-z0-9.]/g, '')
        .substring(0, 30) // Limit length
      const timestamp = Date.now().toString().slice(-6)
      email = `${nameSlug}.${timestamp}@temp.local`
    }

    // Prepare data
    const clientData: ClientCreate | ClientUpdate = {
      name: formData.value.name.trim(),
      phone: phone,
      email: email,
      lead_source: formData.value.lead_source,
    }

    let savedClient: Client

    if (isEditMode.value && props.client) {
      // Update existing client
      savedClient = await clientsService.updateClient(
        props.client.id,
        clientData as ClientUpdate
      )
    } else {
      // Create new client
      savedClient = await clientsService.createClient(clientData as ClientCreate)
    }

    emit('saved', savedClient)
    handleClose()
  } catch (error: any) {
    console.error('Error saving client:', error)
    const errorMessage =
      error?.response?.data?.detail || error?.message || 'Erro ao salvar cliente'
    emit('error', errorMessage)
  } finally {
    isSaving.value = false
  }
}

/**
 * Watch for dialog open/close and client changes
 */
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    loadClient()
  } else {
    resetForm()
  }
})

watch(() => props.client, () => {
  if (props.modelValue) {
    loadClient()
  }
})
</script>

<style scoped>
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

