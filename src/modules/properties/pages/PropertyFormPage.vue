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
          :disabled="isSaving"
          prepend-icon="mdi-content-save"
          @click="handleSave"
        >
          Salvar
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- Form with Tabs -->
    <v-card elevation="2" style="overflow: visible !important;">
      <v-tabs
        v-model="activeTab"
        bg-color="primary"
        slider-color="white"
        style="overflow: visible !important;"
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

      <v-card-text class="pa-6" style="overflow: visible !important; padding-top: 32px !important;">
        <v-form ref="formRef" v-model="isFormValid" style="overflow: visible !important;">
          <v-window v-model="activeTab" style="overflow: visible !important;">
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
                <v-col cols="12">
                  <v-card variant="outlined" class="pa-4 mb-4" color="primary">
                    <div class="d-flex align-center mb-2">
                      <v-icon color="primary" class="mr-2">mdi-map-search</v-icon>
                      <span class="text-subtitle-1 font-weight-medium">Buscar Endereço no Google Maps</span>
                    </div>
                    <v-text-field
                      v-model="addressSearch"
                      label="Digite o endereço completo (ex: Rua Exemplo, 123, São Paulo, SP)"
                      variant="outlined"
                      prepend-inner-icon="mdi-magnify"
                      :loading="isGeocoding"
                      :error="!!geocodeError"
                      :error-messages="geocodeError ? [geocodeError] : []"
                      hint="Digite um endereço e clique em buscar para preencher automaticamente os campos abaixo"
                      persistent-hint
                      @keyup.enter="handleGeocodeAddress"
                    >
                      <template #append>
                        <v-btn
                          color="primary"
                          :loading="isGeocoding"
                          :disabled="!addressSearch.trim()"
                          @click="handleGeocodeAddress"
                        >
                          Buscar
                        </v-btn>
                      </template>
                    </v-text-field>
                  </v-card>
                </v-col>
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="formData.street"
                    label="Rua"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formData.number"
                    label="Número"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.neighborhood"
                    label="Bairro"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.city"
                    label="Cidade"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formData.state"
                    label="Estado (UF)"
                    variant="outlined"
                    :rules="[rules.state]"
                    maxlength="2"
                    counter="2"
                    hint="Ex: SP, RJ, MG"
                    persistent-hint
                    @input="formData.state = formData.state ? formData.state.toUpperCase() : ''"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formData.zip_code"
                    label="CEP"
                    variant="outlined"
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
                    v-model="priceFormatted"
                    label="Preço de Venda"
                    variant="outlined"
                    prefix="R$"
                    hint="Digite apenas números (será formatado automaticamente)"
                    persistent-hint
                    @input="priceFormatted = formatCurrencyInput(priceFormatted)"
                    @blur="formData.price = parseCurrency(priceFormatted) || null; priceFormatted = formData.price ? formatCurrency(formData.price) : ''"
                  ></v-text-field>
                </v-col>
                <v-col
                  v-if="showRentPrice"
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="rentPriceFormatted"
                    label="Preço de Aluguel"
                    variant="outlined"
                    prefix="R$"
                    hint="Digite apenas números (será formatado automaticamente)"
                    persistent-hint
                    @input="rentPriceFormatted = formatCurrencyInput(rentPriceFormatted)"
                    @blur="formData.rent_price = parseCurrency(rentPriceFormatted) || null; rentPriceFormatted = formData.rent_price ? formatCurrency(formData.rent_price) : ''"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="condoFeeFormatted"
                    label="Condomínio"
                    variant="outlined"
                    prefix="R$"
                    hint="Digite apenas números (será formatado automaticamente)"
                    persistent-hint
                    @input="condoFeeFormatted = formatCurrencyInput(condoFeeFormatted)"
                    @blur="formData.condo_fee = parseCurrency(condoFeeFormatted) || null; condoFeeFormatted = formData.condo_fee ? formatCurrency(formData.condo_fee) : ''"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="iptuFormatted"
                    label="IPTU"
                    variant="outlined"
                    prefix="R$"
                    hint="Digite apenas números (será formatado automaticamente)"
                    persistent-hint
                    @input="iptuFormatted = formatCurrencyInput(iptuFormatted)"
                    @blur="formData.iptu = parseCurrency(iptuFormatted) || null; iptuFormatted = formData.iptu ? formatCurrency(formData.iptu) : ''"
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
                    v-model="ownerContactFormatted"
                    label="Contato do Proprietário"
                    variant="outlined"
                    hint="Telefone (ex: (11) 98765-4321) ou email"
                    persistent-hint
                    @blur="ownerContactFormatted = formatPhone(formData.owner_contact || '')"
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
                  <div class="text-h6 mb-4">
                    <v-icon class="mr-2" color="primary">mdi-image</v-icon>
                    Imagem Principal do Imóvel
                  </div>
                  <div class="text-body-2 text-medium-emphasis mb-4">
                    Faça upload da imagem principal do imóvel. A imagem será armazenada no Cloudinary
                    e otimizada automaticamente para melhor performance.
                  </div>
                  <PropertyImageUpload
                    v-model="formData.main_image_url"
                    :property-id="isEditMode ? (route.params.id as string) : null"
                    :disabled="isSaving"
                    @uploaded="handleImageUploaded"
                    @error="handleImageError"
                  />
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
import { propertiesService, type Property, type PropertyCreate, type PropertyUpdate, type AddressData } from '@/shared/services/properties.service'
import { usersService, type User } from '@/shared/services/users.service'
import { formatCurrency, parseCurrency, formatCurrencyInput, formatPhone, parsePhone } from '@/shared/utils/masks'
import PropertyImageUpload from '@/shared/components/PropertyImageUpload.vue'

const route = useRoute()
const router = useRouter()

const formRef = ref<VForm | null>(null)
const activeTab = ref('general')
const isFormValid = ref(false)
const isSaving = ref(false)
const property = ref<Property | null>(null)
const corretores = ref<User[]>([])

// Geocoding
const addressSearch = ref('')
const isGeocoding = ref(false)
const geocodeError = ref<string | null>(null)

const isEditMode = computed(() => !!route.params.id)

// Form data
const formData = ref<PropertyCreate & { assigned_agent_id?: string | null }>({
  code: '',
  title: '',
  description: null,
  property_type: 'APARTMENT',
  business_type: 'SALE',
  street: null,
  number: null,
  neighborhood: null,
  city: null,
  state: null,
  zip_code: null,
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
  price: null as number | null,
  rent_price: null as number | null,
  condo_fee: null as number | null,
  iptu: null as number | null,
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

// Currency formatted values - using raw string during typing, format on blur
const priceFormatted = ref('')
const rentPriceFormatted = ref('')
const condoFeeFormatted = ref('')
const iptuFormatted = ref('')

// Watch formData to update formatted values when loading
watch(() => formData.value.price, (newVal) => {
  if (newVal !== null && newVal !== undefined) {
    priceFormatted.value = formatCurrency(newVal)
  } else {
    priceFormatted.value = ''
  }
}, { immediate: true })

watch(() => formData.value.rent_price, (newVal) => {
  if (newVal !== null && newVal !== undefined) {
    rentPriceFormatted.value = formatCurrency(newVal)
  } else {
    rentPriceFormatted.value = ''
  }
}, { immediate: true })

watch(() => formData.value.condo_fee, (newVal) => {
  if (newVal !== null && newVal !== undefined) {
    condoFeeFormatted.value = formatCurrency(newVal)
  } else {
    condoFeeFormatted.value = ''
  }
}, { immediate: true })

watch(() => formData.value.iptu, (newVal) => {
  if (newVal !== null && newVal !== undefined) {
    iptuFormatted.value = formatCurrency(newVal)
  } else {
    iptuFormatted.value = ''
  }
}, { immediate: true })

// Phone formatted value
const ownerContactFormatted = computed({
  get: () => formData.value.owner_contact ? formatPhone(formData.value.owner_contact) : '',
  set: (val: string) => {
    formData.value.owner_contact = parsePhone(val) || null
  }
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
      price: property.value.price ? parseFloat(property.value.price) : null,
      rent_price: property.value.rent_price ? parseFloat(property.value.rent_price) : null,
      condo_fee: property.value.condo_fee ? parseFloat(property.value.condo_fee) : null,
      iptu: property.value.iptu ? parseFloat(property.value.iptu) : null,
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
  // Validate form
  if (formRef.value) {
    const { valid } = await formRef.value.validate()
    if (!valid) {
      console.log('Form validation failed')
      // Focus on first tab with errors
      activeTab.value = 'general'
      return
    }
  }

  console.log('Saving property...', formData.value)
  isSaving.value = true
  try {
    // Convert form data to API format
    const propertyData: PropertyCreate | PropertyUpdate = {
      code: formData.value.code,
      title: formData.value.title,
      description: formData.value.description || null,
      property_type: formData.value.property_type,
      business_type: formData.value.business_type,
      street: formData.value.street?.trim() || null,
      number: formData.value.number?.trim() || null,
      neighborhood: formData.value.neighborhood?.trim() || null,
      city: formData.value.city?.trim() || null,
      state: formData.value.state?.trim() ? formData.value.state.trim().toUpperCase() : null,
      zip_code: formData.value.zip_code?.trim() || null,
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
    console.log('Property saved successfully')
    router.push({ name: 'properties' })
    // TODO: Show success notification
  } catch (error: any) {
    console.error('Error saving property:', error)
    console.error('Error details:', error.response?.data || error.message)
    // Show error to user
    const errorMessage = error.response?.data?.detail || error.message || 'Erro desconhecido ao salvar imóvel'
    alert(`Erro ao salvar imóvel: ${errorMessage}`)
  } finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.push({ name: 'properties' })
}

/**
 * Handle image upload success
 */
const handleImageUploaded = (imageUrl: string) => {
  // Image URL is already updated via v-model
  // Optionally show success notification here
  console.log('Image uploaded successfully:', imageUrl)
}

/**
 * Handle image upload error
 */
const handleImageError = (error: string) => {
  // Error is already shown in the component
  // Optionally show additional notification here
  console.error('Image upload error:', error)
}

const handleGeocodeAddress = async () => {
  if (!addressSearch.value.trim()) {
    return
  }

  isGeocoding.value = true
  geocodeError.value = null

  try {
    const addressData: AddressData = await propertiesService.geocodeAddress(addressSearch.value.trim())
    
    // Fill form fields with geocoded data
    if (addressData.street) {
      formData.value.street = addressData.street
    }
    if (addressData.number) {
      formData.value.number = addressData.number
    }
    if (addressData.neighborhood) {
      formData.value.neighborhood = addressData.neighborhood
    }
    if (addressData.city) {
      formData.value.city = addressData.city
    }
    if (addressData.state) {
      formData.value.state = addressData.state.toUpperCase()
    }
    if (addressData.zip_code) {
      formData.value.zip_code = addressData.zip_code
    }
    if (addressData.latitude) {
      formData.value.latitude = addressData.latitude
    }
    if (addressData.longitude) {
      formData.value.longitude = addressData.longitude
    }

    // Clear search field after successful geocoding
    addressSearch.value = ''
    
    // Show success message (you can add a snackbar here if needed)
  } catch (error: any) {
    console.error('Geocoding error:', error)
    geocodeError.value = error.message || 'Erro ao buscar endereço. Verifique se o endereço está correto.'
    // TODO: Show error notification
  } finally {
    isGeocoding.value = false
  }
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

/* CRITICAL: Remove all overflow hidden from parent containers */
:deep(.v-card),
:deep(.v-card-text),
:deep(.v-card-body),
:deep(.v-window),
:deep(.v-window-item),
:deep(.v-row),
:deep(.v-col),
:deep(.v-form),
:deep(.v-tabs),
:deep(.v-tabs-window) {
  overflow: visible !important;
}

/* Add significant padding to columns to accommodate floating labels */
:deep(.v-col) {
  padding-top: 28px !important;
  padding-bottom: 28px !important;
  overflow: visible !important;
  min-height: 90px !important;
}

/* Ensure card text has extra space at top */
:deep(.v-card-text) {
  padding-top: 28px !important;
  overflow: visible !important;
}

/* Fix label - ensure it's never clipped */
:deep(.v-field--variant-outlined .v-label) {
  white-space: nowrap !important;
  overflow: visible !important;
  text-overflow: unset !important;
  max-width: none !important;
  pointer-events: none;
}

/* When label is floating - ensure background covers the border line */
:deep(.v-field--focused.v-field--variant-outlined .v-label),
:deep(.v-field--active.v-field--variant-outlined .v-label),
:deep(.v-field--dirty.v-field--variant-outlined .v-label) {
  transform: translateY(-12px) scale(0.75) !important;
  background-color: rgb(var(--v-theme-surface)) !important;
  padding: 0px 10px !important;
  margin: 0px -10px !important;
  max-width: none !important;
  width: auto !important;
  min-width: fit-content !important;
  white-space: nowrap !important;
  overflow: visible !important;
  text-overflow: unset !important;
  left: 0 !important;
  right: auto !important;
  z-index: 10 !important;
  position: absolute !important;
  top: 0 !important;
}

/* Ensure field container has space and doesn't clip */
:deep(.v-field--variant-outlined) {
  padding-top: 0 !important;
  overflow: visible !important;
  min-height: 56px;
}

:deep(.v-field--variant-outlined .v-field__overlay) {
  padding-top: 0 !important;
  overflow: visible !important;
}

/* Ensure field input area doesn't clip labels */
:deep(.v-field__input) {
  overflow: visible !important;
}

:deep(.v-field__input .v-field__input__control) {
  overflow: visible !important;
}

/* Fix for select and autocomplete specifically */
:deep(.v-select),
:deep(.v-autocomplete),
:deep(.v-text-field),
:deep(.v-textarea) {
  overflow: visible !important;
}

:deep(.v-select .v-field),
:deep(.v-autocomplete .v-field),
:deep(.v-text-field .v-field),
:deep(.v-textarea .v-field) {
  overflow: visible !important;
}

/* Ensure the field wrapper doesn't clip */
:deep(.v-input) {
  overflow: visible !important;
}

:deep(.v-input__details) {
  overflow: visible !important;
}
</style>
