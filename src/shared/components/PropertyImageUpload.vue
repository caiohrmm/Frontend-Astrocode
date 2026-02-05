<template>
  <div class="property-image-upload">
    <!-- Image Preview Section -->
    <v-card
      v-if="imageUrl"
      elevation="2"
      class="mb-4"
      rounded="lg"
    >
      <v-img
        :src="imageUrl"
        height="300"
        cover
        class="align-center justify-center"
      >
        <template #placeholder>
          <div class="d-flex align-center justify-center fill-height">
            <v-progress-circular
              indeterminate
              color="primary"
            ></v-progress-circular>
          </div>
        </template>
        <template #error>
          <div class="d-flex align-center justify-center fill-height bg-grey-lighten-3">
            <v-icon color="grey" size="64">mdi-image-off</v-icon>
          </div>
        </template>
      </v-img>
      <v-card-actions class="pa-3">
        <v-spacer></v-spacer>
        <v-btn
          color="error"
          variant="text"
          prepend-icon="mdi-delete"
          @click="handleRemove"
        >
          Remover Imagem
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Upload Section -->
    <v-card
      v-if="!imageUrl"
      elevation="2"
      class="mb-4"
      rounded="lg"
      variant="outlined"
    >
      <v-card-text class="pa-6">
        <div class="text-center">
          <v-icon
            color="primary"
            size="64"
            class="mb-4"
          >
            mdi-cloud-upload
          </v-icon>
          <div class="text-h6 mb-2">
            Upload da Imagem Principal
          </div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Formatos aceitos: JPEG, PNG, WebP (máx. 10MB)
          </div>
          <v-file-input
            ref="fileInputRef"
            v-model="selectedFile"
            :rules="fileRules"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            prepend-icon="mdi-camera"
            label="Selecionar imagem"
            variant="outlined"
            :disabled="isUploading"
            @update:model-value="handleFileSelect"
          ></v-file-input>
        </div>
      </v-card-text>
    </v-card>

    <!-- Upload Progress (when uploading) -->
    <v-card
      v-if="isUploading"
      elevation="2"
      class="mb-4"
      rounded="lg"
    >
      <v-card-text class="pa-6">
        <div class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
            class="mb-4"
          ></v-progress-circular>
          <div class="text-h6">
            Enviando imagem...
          </div>
          <div class="text-body-2 text-medium-emphasis mt-2">
            Por favor, aguarde
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="error = null"
    >
      {{ error }}
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { propertiesService } from '@/shared/services/properties.service'

/**
 * Props
 */
interface Props {
  /**
   * Property ID (required for upload)
   */
  propertyId: string | null
  /**
   * Current image URL (if property already has an image)
   */
  modelValue: string | null
  /**
   * Whether the component is disabled
   */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

/**
 * Emits
 */
const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'uploaded': [imageUrl: string]
  'removed': []
  'error': [error: string]
}>()

/**
 * State
 */
const selectedFile = ref<File[]>([])
const isUploading = ref(false)
const error = ref<string | null>(null)
const fileInputRef = ref()

/**
 * Computed
 */
const imageUrl = computed(() => props.modelValue)

/**
 * File validation rules
 */
const fileRules = [
  (files: File[] | null) => {
    if (!files || files.length === 0) return true
    
    const file = files[0]
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    
    if (!allowedTypes.includes(file.type)) {
      return 'Formato de arquivo inválido. Use JPEG, PNG ou WebP.'
    }
    
    if (file.size > maxSize) {
      return 'Arquivo muito grande. Tamanho máximo: 10MB.'
    }
    
    return true
  },
]

/**
 * Handle file selection
 */
const handleFileSelect = async (files: File[] | null) => {
  error.value = null
  
  if (!files || files.length === 0) {
    return
  }

  const file = files[0]

  // Validate file
  const validation = fileRules[0](files)
  if (validation !== true) {
    error.value = validation
    selectedFile.value = []
    return
  }

  // Check if property ID exists (required for upload)
  if (!props.propertyId) {
    error.value = 'ID do imóvel é necessário para fazer upload da imagem. Salve o imóvel primeiro.'
    selectedFile.value = []
    return
  }

  // Upload file
  await uploadImage(file)
}

/**
 * Upload image to backend
 */
const uploadImage = async (file: File) => {
  if (!props.propertyId) {
    error.value = 'ID do imóvel é necessário para fazer upload da imagem.'
    return
  }

  isUploading.value = true
  error.value = null

  try {
    // Upload image via API
    const updatedProperty = await propertiesService.uploadPropertyMainImage(
      props.propertyId,
      file
    )

    // Update model value with new image URL
    emit('update:modelValue', updatedProperty.main_image_url)
    emit('uploaded', updatedProperty.main_image_url)

    // Clear file input
    selectedFile.value = []
  } catch (err: any) {
    const errorMessage = err?.response?.data?.detail || err?.message || 'Erro ao fazer upload da imagem'
    error.value = errorMessage
    emit('error', errorMessage)
    selectedFile.value = []
  } finally {
    isUploading.value = false
  }
}

/**
 * Handle image removal
 */
const handleRemove = () => {
  emit('update:modelValue', null)
  emit('removed')
  selectedFile.value = []
  error.value = null
}

/**
 * Watch for external image URL changes
 */
watch(() => props.modelValue, (newValue) => {
  // Clear file input when image URL is set externally
  if (newValue && selectedFile.value.length > 0) {
    selectedFile.value = []
  }
})
</script>

<style scoped>
.property-image-upload {
  width: 100%;
}
</style>

