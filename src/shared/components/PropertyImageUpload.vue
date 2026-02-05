<template>
  <!-- 
    This component is isolated from form validation to avoid interference.
    File validation is handled internally, not by the parent form.
  -->
  <div class="property-image-upload">
    <!-- Image Preview Section -->
    <v-card
      v-if="imageUrl"
      elevation="2"
      class="mb-4"
      rounded="lg"
    >
      <v-card-text class="pa-4">
        <div class="d-flex justify-center">
          <v-img
            :src="imageUrl"
            height="200"
            width="200"
            cover
            class="rounded"
            style="object-fit: cover; max-width: 200px; max-height: 200px;"
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
        </div>
      </v-card-text>
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
            accept="image/jpeg,image/jpg,image/png,image/webp"
            prepend-icon="mdi-camera"
            label="Selecionar imagem"
            variant="outlined"
            :disabled="isUploading || disabled"
            :error="!!error"
            :error-messages="error ? [error] : []"
            :rules="[]"
            hide-details="auto"
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
const previewUrl = ref<string | null>(null) // Temporary preview URL before upload

/**
 * Computed
 */
const imageUrl = computed(() => props.modelValue || previewUrl.value)

/**
 * File validation rules
 * Note: v-file-input may pass File[] or File | null, so we handle both cases
 */
const fileRules = [
  (value: File[] | File | null) => {
    // Handle empty/null values
    if (!value) return true
    if (Array.isArray(value) && value.length === 0) return true
    
    // Get the file - handle both array and single file
    const file = Array.isArray(value) ? value[0] : value
    
    // Check if file exists
    if (!file) return true
    
    // Check if file is a valid File object
    if (!(file instanceof File)) {
      return 'Arquivo inválido. Por favor, selecione um arquivo válido.'
    }
    
    // Check if file has required properties
    if (typeof file.type !== 'string' || typeof file.size !== 'number') {
      return 'Arquivo inválido. Por favor, selecione um arquivo válido.'
    }
    
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
 * Note: v-file-input may pass File[] or File directly
 */
const handleFileSelect = async (value: File[] | File | null) => {
  console.log('handleFileSelect called with:', value, 'Type:', typeof value, 'Is Array:', Array.isArray(value))
  error.value = null
  
  // Handle empty/null values
  if (!value) {
    console.log('No files selected, clearing selection')
    selectedFile.value = []
    return
  }
  
  // Normalize to File - handle both array and single file
  let file: File | null = null
  if (Array.isArray(value)) {
    if (value.length === 0) {
      console.log('Empty array, clearing selection')
      selectedFile.value = []
      return
    }
    file = value[0]
    selectedFile.value = value // Keep array for v-model
  } else if (value instanceof File) {
    // Single File object
    file = value
    selectedFile.value = [value] // Convert to array for v-model
  } else {
    console.error('Unexpected value type:', typeof value, value)
    error.value = 'Tipo de arquivo inválido.'
    selectedFile.value = []
    return
  }
  
  console.log('File selected:', file, 'Type:', file?.type, 'Size:', file?.size)
  
  // Check if file exists
  if (!file) {
    console.log('File is null or undefined')
    selectedFile.value = []
    return
  }
  
  // Check if file is a valid File object
  if (!(file instanceof File)) {
    console.error('File is not a File instance:', typeof file, file)
    error.value = 'Arquivo inválido. Por favor, selecione um arquivo válido.'
    selectedFile.value = []
    return
  }
  
  // Check if file has required properties
  if (typeof file.type !== 'string' || file.type === '') {
    console.error('File type is invalid:', file.type)
    error.value = 'Tipo de arquivo não identificado. Por favor, selecione uma imagem válida.'
    selectedFile.value = []
    return
  }
  
  if (typeof file.size !== 'number' || file.size === 0) {
    console.error('File size is invalid:', file.size)
    error.value = 'Arquivo vazio. Por favor, selecione um arquivo válido.'
    selectedFile.value = []
    return
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    console.error('File type not allowed:', file.type)
    error.value = 'Formato de arquivo inválido. Use JPEG, PNG ou WebP.'
    selectedFile.value = []
    return
  }

  // Validate file size
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    console.error('File too large:', file.size, 'max:', maxSize)
    error.value = 'Arquivo muito grande. Tamanho máximo: 10MB.'
    selectedFile.value = []
    return
  }

  // Check if property ID exists (required for upload)
  if (!props.propertyId) {
    console.warn('Property ID not available, cannot upload')
    error.value = 'ID do imóvel é necessário para fazer upload da imagem. Salve o imóvel primeiro.'
    selectedFile.value = []
    return
  }

  console.log('All validations passed, starting upload...')
  
  // Create preview URL for immediate feedback
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = URL.createObjectURL(file)
  console.log('Preview URL created:', previewUrl.value)
  
  // All validations passed - upload file
  await uploadImage(file)
}

/**
 * Upload image to backend
 */
const uploadImage = async (file: File) => {
  console.log('uploadImage called with file:', file.name, file.type, file.size)
  
  if (!props.propertyId) {
    error.value = 'ID do imóvel é necessário para fazer upload da imagem.'
    return
  }

  isUploading.value = true
  error.value = null

  try {
    console.log('Uploading image to property:', props.propertyId)
    // Upload image via API
    const updatedProperty = await propertiesService.uploadPropertyMainImage(
      props.propertyId,
      file
    )

    console.log('Upload response:', updatedProperty)
    
    // Update model value with new image URL
    const imageUrl = updatedProperty.main_image_url
    if (!imageUrl) {
      throw new Error('Upload succeeded but no image URL was returned from server')
    }
    
    console.log('Image URL received:', imageUrl)
    
    // Emit update to parent component
    emit('update:modelValue', imageUrl)
    emit('uploaded', imageUrl)
    
    // Clear file input and preview after successful upload
    selectedFile.value = []
    // Clean up preview URL since we now have the real URL
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = null
    }
    console.log('Upload completed successfully')
  } catch (err: any) {
    console.error('Upload error:', err)
    const errorMessage = err?.response?.data?.detail || err?.message || 'Erro ao fazer upload da imagem'
    error.value = errorMessage
    emit('error', errorMessage)
    selectedFile.value = []
    // Clean up preview URL on error
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = null
    }
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
  // Clean up preview URL
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
}

/**
 * Watch for external image URL changes
 */
watch(() => props.modelValue, (newValue) => {
  // Clear file input when image URL is set externally
  // This prevents the file input from interfering with form validation
  if (newValue) {
    selectedFile.value = []
    // Reset file input if it exists
    if (fileInputRef.value) {
      fileInputRef.value.reset()
    }
  }
}, { immediate: true })
</script>

<style scoped>
.property-image-upload {
  width: 100%;
}
</style>


