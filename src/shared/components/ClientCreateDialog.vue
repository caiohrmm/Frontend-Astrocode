<template>
  <v-dialog
    v-model="dialogModel"
    max-width="600"
    persistent
  >
    <v-card>
      <v-card-title class="d-flex align-center pa-4">
        <v-icon
          :color="isEditMode ? 'primary' : 'primary'"
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
                @input="handlePhoneInput"
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
            <v-col cols="12" md="6">
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

            <!-- AI Classification Toggle -->
            <v-col cols="12" md="6" class="d-flex align-center">
              <v-switch
                v-model="formData.use_ai_classification"
                label="Classificar com IA"
                color="primary"
                hide-details
                class="mt-0"
              >
                <template v-slot:label>
                  <div class="d-flex align-center">
                    <v-icon start size="20" color="primary">mdi-robot</v-icon>
                    <span>Classificar com IA</span>
                  </div>
                </template>
              </v-switch>
            </v-col>

            <!-- Initial Message (for AI) -->
            <v-col cols="12" v-if="formData.use_ai_classification && !isEditMode">
              <v-textarea
                v-model="formData.initial_message"
                label="Mensagem inicial do cliente"
                variant="outlined"
                rows="3"
                auto-grow
                prepend-inner-icon="mdi-message-text"
                hint="Cole aqui a primeira mensagem do cliente para a IA analisar"
                persistent-hint
              ></v-textarea>
            </v-col>
          </v-row>
        </v-form>

        <!-- AI Info Alert -->
        <v-alert
          v-if="formData.use_ai_classification && !isEditMode"
          type="info"
          variant="tonal"
          density="compact"
          class="mt-4"
        >
          <template v-slot:text>
            A IA irá analisar as informações e definir automaticamente:
            <strong>Lead Score</strong>, <strong>Urgência</strong>, <strong>Tipo de Interesse</strong> e <strong>Ações Recomendadas</strong>.
          </template>
        </v-alert>
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
  type ClientWithClassification,
  type LeadSource,
} from '@/shared/services/clients.service'
import { formatPhone, formatPhoneInput, parsePhone } from '@/shared/utils/masks'

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
  'saved': [client: Client | ClientWithClassification]
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
  use_ai_classification: true,
  initial_message: '',
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
    use_ai_classification: true,
    initial_message: '',
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

const handlePhoneInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  // Apply mask while typing
  phoneFormatted.value = formatPhoneInput(value)
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

    // Prepare data - email is optional, can be null
    const clientData: ClientCreate | ClientUpdate = {
      name: formData.value.name.trim(),
      phone: phone,
      email: formData.value.email?.trim() || null,
      lead_source: formData.value.lead_source,
    }

    let savedClient: Client | ClientWithClassification

    if (isEditMode.value && props.client) {
      // Update existing client
      savedClient = await clientsService.updateClient(
        props.client.id,
        clientData as ClientUpdate
      )
    } else {
      // Create new client with AI classification
      const createData: ClientCreate = {
        ...clientData as ClientCreate,
        use_ai_classification: formData.value.use_ai_classification,
        initial_message: formData.value.initial_message?.trim() || null,
      }
      savedClient = await clientsService.createClient(createData)
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

