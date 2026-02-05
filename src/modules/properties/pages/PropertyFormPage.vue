<template>
  <div>
    <!-- Header -->
    <v-card elevation="2" class="mb-4">
      <v-card-title class="d-flex align-center pa-4">
        <v-btn
          icon
          variant="text"
          class="mr-2"
          @click="goBack"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-icon class="mr-3" color="primary" size="32">
          {{ isEditMode ? 'mdi-home-edit' : 'mdi-home-plus' }}
        </v-icon>
        <span class="text-h5">
          {{ isEditMode ? 'Editar Imóvel' : 'Novo Imóvel' }}
        </span>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          :loading="isSaving"
          :disabled="!isFormValid"
          prepend-icon="mdi-content-save"
          @click="handleSave"
        >
          Salvar
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- Form with Tabs -->
    <v-card elevation="2">
      <v-tabs
        v-model="activeTab"
        bg-color="primary"
        slider-color="white"
      >
        <v-tab value="general">
          <v-icon start>mdi-information</v-icon>
          Geral
        </v-tab>
        <v-tab value="location">
          <v-icon start>mdi-map-marker</v-icon>
          Localização
        </v-tab>
        <v-tab value="characteristics">
          <v-icon start>mdi-home-variant</v-icon>
          Características
        </v-tab>
        <v-tab value="financial">
          <v-icon start>mdi-currency-usd</v-icon>
          Financeiro
        </v-tab>
        <v-tab value="commercial">
          <v-icon start>mdi-briefcase</v-icon>
          Comercial
        </v-tab>
        <v-tab value="owner">
          <v-icon start>mdi-account</v-icon>
          Proprietário
        </v-tab>
        <v-tab value="ai">
          <v-icon start>mdi-robot</v-icon>
          IA & Matching
        </v-tab>
        <v-tab value="media">
          <v-icon start>mdi-image</v-icon>
          Mídia
        </v-tab>
      </v-tabs>

      <v-card-text class="pa-6">
        <v-form ref="formRef" v-model="isFormValid">
          <v-window v-model="activeTab">
            <!-- Tab: Geral -->
            <v-window-item value="general">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.code"
                    label="Código *"
                    variant="outlined"
                    :rules="[rules.required]"
                    hint="Código único do imóvel"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.property_type"
                    :items="propertyTypeOptions"
                    label="Tipo de Imóvel *"
                    variant="outlined"
                    :rules="[rules.required]"
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.title"
                    label="Título *"
                    variant="outlined"
                    :rules="[rules.required]"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="formData.description"
                    label="Descrição"
                    variant="outlined"
                    rows="4"
                    auto-grow
                  ></v-textarea>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.business_type"
                    :items="businessTypeOptions"
                    label="Tipo de Negócio *"
                    variant="outlined"
                    :rules="[rules.required]"
                  ></v-select>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Tab: Localização -->
            <v-window-item value="location">
              <v-row>
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="formData.street"
                    label="Rua *"
                    variant="outlined"
                    :rules="[rules.required]"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formData.number"
                    label="Número *"
                    variant="outlined"
                    :rules="[rules.required]"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.neighborhood"
                    label="Bairro *"
                    variant="outlined"
                    :rules="[rules.required]"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.city"
                    label="Cidade *"
                    variant="outlined"
                    :rules="[rules.required]"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formData.state"
                    label="Estado (UF) *"
                    variant="outlined"
                    :rules="[rules.required, rules.state]"
                    maxlength="2"
                    counter="2"
                    hint="Ex: SP, RJ, MG"
                    persistent-hint
                    @input="formData.state = formData.state.toUpperCase()"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formData.zip_code"
                    label="CEP *"
                    variant="outlined"
                    :rules="[rules.required]"
                    hint="Preparado para autocomplete futuro"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.latitude"
                    label="Latitude"
                    variant="outlined"
                    type="number"
                    step="any"
                    hint="Será preenchido automaticamente no futuro"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.longitude"
                    label="Longitude"
                    variant="outlined"
                    type="number"
                    step="any"
                    hint="Será preenchido automaticamente no futuro"
                    persistent-hint
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Tab: Características -->
            <v-window-item value="characteristics">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="formData.area_total"
                    label="Área Total (m²)"
                    variant="outlined"
                    type="number"
                    min="0"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="formData.area_built"
                    label="Área Construída (m²)"
                    variant="outlined"
                    type="number"
                    min="0"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="formData.bedrooms"
                    label="Quartos"
                    variant="outlined"
                    type="number"
                    min="0"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="formData.bathrooms"
                    label="Banheiros"
                    variant="outlined"
                    type="number"
                    min="0"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="formData.parking_spaces"
                    label="Vagas de Garagem"
                    variant="outlined"
                    type="number"
                    min="0"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="formData.floor"
                    label="Andar"
                    variant="outlined"
                    type="number"
                    hint="Para apartamentos"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="formData.has_elevator"
                    label="Possui Elevador"
                    color="primary"
                    hide-details
                  ></v-switch>
                </v-col>
                <v-col cols="12">
                  <v-switch
                    v-model="formData.furnished"
                    label="Mobiliado"
                    color="primary"
                    hide-details
                  ></v-switch>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Tab: Financeiro -->
            <v-window-item value="financial">
              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                Os campos exibidos dependem do tipo de negócio selecionado.
              </v-alert>
              <v-row>
                <v-col
                  v-if="showSalePrice"
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="formData.price"
                    label="Preço de Venda"
                    variant="outlined"
                    type="number"
                    min="0"
                    step="0.01"
                    prefix="R$"
                    hint="Valor em reais"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col
                  v-if="showRentPrice"
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="formData.rent_price"
                    label="Preço de Aluguel"
                    variant="outlined"
                    type="number"
                    min="0"
                    step="0.01"
                    prefix="R$"
                    hint="Valor mensal em reais"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.condo_fee"
                    label="Condomínio"
                    variant="outlined"
                    type="number"
                    min="0"
                    step="0.01"
                    prefix="R$"
                    hint="Valor mensal"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.iptu"
                    label="IPTU"
                    variant="outlined"
                    type="number"
                    min="0"
                    step="0.01"
                    prefix="R$"
                    hint="Valor anual"
                    persistent-hint
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Tab: Comercial -->
            <v-window-item value="commercial">
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.status"
                    :items="statusOptions"
                    label="Status *"
                    variant="outlined"
                    :rules="[rules.required]"
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-autocomplete
                    v-model="formData.assigned_agent_id"
                    :items="corretoresOptions"
                    label="Corretor Responsável"
                    variant="outlined"
                    item-title="full_name"
                    item-value="id"
                    return-object
                    clearable
                    hint="Apenas usuários com role 'corretor'"
                    persistent-hint
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template #prepend>
                          <v-avatar color="primary" size="32" class="mr-3">
                            <v-icon color="white" size="18">mdi-account</v-icon>
                          </v-avatar>
                        </template>
                        <v-list-item-title>{{ item.raw.full_name }}</v-list-item-title>
                        <v-list-item-subtitle>{{ item.raw.email }}</v-list-item-subtitle>
                      </v-list-item>
                    </template>
                  </v-autocomplete>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Tab: Proprietário -->
            <v-window-item value="owner">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.owner_name"
                    label="Nome do Proprietário"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.owner_contact"
                    label="Contato do Proprietário"
                    variant="outlined"
                    hint="Telefone, email ou outro contato"
                    persistent-hint
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Tab: IA & Matching -->
            <v-window-item value="ai">
              <v-row>
                <v-col cols="12">
                  <v-alert
                    type="info"
                    variant="tonal"
                    class="mb-4"
                  >
                    O score de visibilidade é calculado automaticamente pelo sistema.
                  </v-alert>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="property?.visibility_score ?? '-'"
                    label="Score de Visibilidade"
                    variant="outlined"
                    readonly
                    hint="Calculado automaticamente (0-100)"
                    persistent-hint
                  >
                    <template #append>
                      <v-progress-linear
                        v-if="property?.visibility_score !== null && property?.visibility_score !== undefined"
                        :model-value="property.visibility_score"
                        color="primary"
                        height="20"
                        width="100"
                        rounded
                      ></v-progress-linear>
                    </template>
                  </v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="formData.ideal_client_profile"
                    label="Perfil do Cliente Ideal"
                    variant="outlined"
                    rows="4"
                    auto-grow
                    hint="Descrição do perfil de cliente ideal para este imóvel"
                    persistent-hint
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Tab: Mídia -->
            <v-window-item value="media">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.main_image_url"
                    label="URL da Imagem Principal"
                    variant="outlined"
                    hint="URL da imagem principal do imóvel"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col
                  v-if="formData.main_image_url"
                  cols="12"
                  md="6"
                >
                  <v-card>
                    <v-card-title class="text-subtitle-2 pa-2">
                      Preview
                    </v-card-title>
                    <v-img
                      :src="formData.main_image_url"
                      height="200"
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
                        <div class="d-flex align-center justify-center fill-height">
                          <v-icon color="error" size="48">mdi-image-off</v-icon>
                        </div>
                      </template>
                    </v-img>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { VForm } from 'vuetify/components'
import { propertiesService, type Property, type PropertyCreate, type PropertyUpdate, type PropertyType, type BusinessType, type PropertyStatus } from '@/shared/services/properties.service'
import { usersService, type User } from '@/shared/services/users.service'

const route = useRoute()
const router = useRouter()

const formRef = ref<VForm | null>(null)
const activeTab = ref('general')
const isFormValid = ref(false)
const isSaving = ref(false)
const property = ref<Property | null>(null)
const corretores = ref<User[]>([])

const isEditMode = computed(() => !!route.params.id)

// Form data
const formData = ref<PropertyCreate & { assigned_agent_id?: string | null }>({
  code: '',
  title: '',
  description: null,
  property_type: 'APARTMENT',
  business_type: 'SALE',
  street: '',
  number: '',
  neighborhood: '',
  city: '',
  state: '',
  zip_code: '',
  latitude: null,
  longitude: null,
  area_total: null,
  area_built: null,
  bedrooms: null,
  bathrooms: null,
  parking_spaces: null,
  floor: null,
  has_elevator: false,
  furnished: false,
  price: null,
  rent_price: null,
  condo_fee: null,
  iptu: null,
  status: 'DRAFT',
  assigned_agent_id: null,
  owner_name: null,
  owner_contact: null,
  visibility_score: null,
  ideal_client_profile: null,
  main_image_url: null,
})

// Options
const propertyTypeOptions = [
  { title: 'Casa', value: 'HOUSE' },
  { title: 'Apartamento', value: 'APARTMENT' },
  { title: 'Terreno', value: 'LAND' },
  { title: 'Comercial', value: 'COMMERCIAL' },
  { title: 'Rural', value: 'RURAL' },
]

const businessTypeOptions = [
  { title: 'Venda', value: 'SALE' },
  { title: 'Aluguel', value: 'RENT' },
  { title: 'Venda e Aluguel', value: 'BOTH' },
]

const statusOptions = [
  { title: 'Rascunho', value: 'DRAFT' },
  { title: 'Publicado', value: 'PUBLISHED' },
  { title: 'Vendido', value: 'SOLD' },
  { title: 'Alugado', value: 'RENTED' },
  { title: 'Indisponível', value: 'UNAVAILABLE' },
]

const corretoresOptions = computed(() => {
  return corretores.value.map(corretor => ({
    ...corretor,
    full_name: corretor.full_name,
    email: corretor.email,
  }))
})

// Computed
const showSalePrice = computed(() => {
  return formData.value.business_type === 'SALE' || formData.value.business_type === 'BOTH'
})

const showRentPrice = computed(() => {
  return formData.value.business_type === 'RENT' || formData.value.business_type === 'BOTH'
})

// Validation rules
const rules = {
  required: (value: any) => {
    if (typeof value === 'string') {
      return !!value?.trim() || 'Campo obrigatório'
    }
    return value !== null && value !== undefined && value !== '' || 'Campo obrigatório'
  },
  state: (value: string) => {
    if (!value) return true
    return value.length === 2 || 'Estado deve ter 2 letras'
  },
}

// Methods
const loadProperty = async () => {
  if (!isEditMode.value) return

  try {
    const propertyId = route.params.id as string
    property.value = await propertiesService.getPropertyById(propertyId)
    
    // Populate form with property data
    formData.value = {
      code: property.value.code,
      title: property.value.title,
      description: property.value.description,
      property_type: property.value.property_type,
      business_type: property.value.business_type,
      street: property.value.street,
      number: property.value.number,
      neighborhood: property.value.neighborhood,
      city: property.value.city,
      state: property.value.state,
      zip_code: property.value.zip_code,
      latitude: property.value.latitude,
      longitude: property.value.longitude,
      area_total: property.value.area_total,
      area_built: property.value.area_built,
      bedrooms: property.value.bedrooms,
      bathrooms: property.value.bathrooms,
      parking_spaces: property.value.parking_spaces,
      floor: property.value.floor,
      has_elevator: property.value.has_elevator,
      furnished: property.value.furnished,
      price: property.value.price,
      rent_price: property.value.rent_price,
      condo_fee: property.value.condo_fee,
      iptu: property.value.iptu,
      status: property.value.status,
      assigned_agent_id: property.value.assigned_agent_id,
      owner_name: property.value.owner_name,
      owner_contact: property.value.owner_contact,
      visibility_score: property.value.visibility_score,
      ideal_client_profile: property.value.ideal_client_profile,
      main_image_url: property.value.main_image_url,
    }
  } catch (error) {
    console.error('Error loading property:', error)
    // TODO: Show error notification
    router.push({ name: 'properties' })
  }
}

const loadCorretores = async () => {
  try {
    corretores.value = await usersService.getCorretores()
  } catch (error) {
    console.error('Error loading corretores:', error)
    // If user doesn't have permission, just continue with empty list
  }
}

const handleSave = async () => {
  const { valid } = await formRef.value?.validate() ?? { valid: false }
  if (!valid) {
    // Focus on first tab with errors
    activeTab.value = 'general'
    return
  }

  isSaving.value = true
  try {
    // Convert form data to API format
    const propertyData: PropertyCreate | PropertyUpdate = {
      code: formData.value.code,
      title: formData.value.title,
      description: formData.value.description || null,
      property_type: formData.value.property_type,
      business_type: formData.value.business_type,
      street: formData.value.street,
      number: formData.value.number,
      neighborhood: formData.value.neighborhood,
      city: formData.value.city,
      state: formData.value.state.toUpperCase(),
      zip_code: formData.value.zip_code,
      latitude: formData.value.latitude ? String(formData.value.latitude) : null,
      longitude: formData.value.longitude ? String(formData.value.longitude) : null,
      area_total: formData.value.area_total ? String(formData.value.area_total) : null,
      area_built: formData.value.area_built ? String(formData.value.area_built) : null,
      bedrooms: formData.value.bedrooms ?? null,
      bathrooms: formData.value.bathrooms ?? null,
      parking_spaces: formData.value.parking_spaces ?? null,
      floor: formData.value.floor ?? null,
      has_elevator: formData.value.has_elevator,
      furnished: formData.value.furnished,
      price: formData.value.price ? String(formData.value.price) : null,
      rent_price: formData.value.rent_price ? String(formData.value.rent_price) : null,
      condo_fee: formData.value.condo_fee ? String(formData.value.condo_fee) : null,
      iptu: formData.value.iptu ? String(formData.value.iptu) : null,
      status: formData.value.status,
      assigned_agent_id: formData.value.assigned_agent_id || null,
      owner_name: formData.value.owner_name || null,
      owner_contact: formData.value.owner_contact || null,
      ideal_client_profile: formData.value.ideal_client_profile || null,
      main_image_url: formData.value.main_image_url || null,
    }

    if (isEditMode.value) {
      await propertiesService.updateProperty(route.params.id as string, propertyData as PropertyUpdate)
    } else {
      await propertiesService.createProperty(propertyData as PropertyCreate)
    }

    // Redirect to list
    router.push({ name: 'properties' })
    // TODO: Show success notification
  } catch (error) {
    console.error('Error saving property:', error)
    // TODO: Show error notification
  } finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.push({ name: 'properties' })
}

// Watch business_type to clear prices when not applicable
watch(() => formData.value.business_type, (newType) => {
  if (newType === 'SALE') {
    formData.value.rent_price = null
  } else if (newType === 'RENT') {
    formData.value.price = null
  }
})

onMounted(async () => {
  await Promise.all([
    loadProperty(),
    loadCorretores(),
  ])
})
</script>

<style scoped>
:deep(.v-window-item) {
  transition: none;
}
</style>
