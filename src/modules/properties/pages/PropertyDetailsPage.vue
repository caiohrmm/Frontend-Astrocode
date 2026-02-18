<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="d-flex justify-center align-center" style="min-height: 400px">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      ></v-progress-circular>
    </div>

    <!-- Content -->
    <div v-else-if="property">
      <!-- Hero Section with Image -->
      <v-card
        v-if="property.main_image_url"
        elevation="2"
        class="mb-4"
        rounded="lg"
      >
        <div class="d-flex justify-center pa-4 bg-grey-lighten-5">
          <v-img
            :src="property.main_image_url"
            max-height="200"
            max-width="100%"
            contain
            class="rounded"
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
        <v-card-title class="pa-4 text-h4 font-weight-bold">
          {{ property.title }}
        </v-card-title>
      </v-card>

      <!-- Header Card -->
      <v-card elevation="2" class="mb-4" rounded="lg">
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
            {{ !property.main_image_url ? 'mdi-home' : '' }}
          </v-icon>
          <span v-if="!property.main_image_url" class="text-h5">
            {{ property.title }}
          </span>
          <v-spacer></v-spacer>
          <v-chip
            :color="getStatusColor(property.status)"
            variant="flat"
            size="large"
            class="mr-2"
          >
            <v-icon start size="18">{{ getStatusIcon(property.status) }}</v-icon>
            {{ getStatusLabel(property.status) }}
          </v-chip>
          <v-btn
            color="primary"
            prepend-icon="mdi-pencil"
            @click="goToEdit"
          >
            Editar
          </v-btn>
        </v-card-title>
        <v-card-subtitle class="pa-4 pt-0">
          <div class="d-flex flex-wrap align-center ga-2">
            <v-chip
              color="primary"
              variant="outlined"
              size="small"
            >
              <v-icon start size="16">mdi-tag</v-icon>
              {{ property.code }}
            </v-chip>
            <v-chip
              color="secondary"
              variant="outlined"
              size="small"
            >
              <v-icon start size="16">mdi-home-variant</v-icon>
              {{ getPropertyTypeLabel(property.property_type) }}
            </v-chip>
            <v-chip
              color="info"
              variant="outlined"
              size="small"
            >
              <v-icon start size="16">mdi-handshake</v-icon>
              {{ getBusinessTypeLabel(property.business_type) }}
            </v-chip>
          </div>
        </v-card-subtitle>
      </v-card>

      <!-- Main Content Grid -->
      <v-row>
        <!-- Left Column -->
        <v-col cols="12" lg="8">
          <!-- Description -->
          <v-card elevation="2" class="mb-4" rounded="lg">
            <v-card-title class="d-flex align-center pa-4">
              <v-icon class="mr-2" color="primary">mdi-text</v-icon>
              Descrição
            </v-card-title>
            <v-card-text class="pa-4">
              <p v-if="property.description" class="text-body-1">
                {{ property.description }}
              </p>
              <p v-else class="text-body-2 text-medium-emphasis">
                Nenhuma descrição disponível.
              </p>
            </v-card-text>
          </v-card>

          <!-- Location -->
          <v-card elevation="2" class="mb-4" rounded="lg">
            <v-card-title class="d-flex align-center pa-4">
              <v-icon class="mr-2" color="primary">mdi-map-marker</v-icon>
              Localização
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="12">
                  <div class="text-h6 mb-2">
                    {{ property.street }}, {{ property.number }}
                  </div>
                  <div class="text-body-1 text-medium-emphasis mb-2">
                    {{ property.neighborhood }}, {{ property.city }} - {{ property.state }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    CEP: {{ formatZipCode(property.zip_code) }}
                  </div>
                </v-col>
                <v-col
                  v-if="property.latitude && property.longitude"
                  cols="12"
                >
                  <v-divider class="my-3"></v-divider>
                  <div class="text-caption text-medium-emphasis mb-2">
                    Coordenadas:
                  </div>
                  <div class="text-body-2">
                    <v-icon size="16" class="mr-1">mdi-latitude</v-icon>
                    {{ property.latitude }}°,
                    <v-icon size="16" class="mr-1 ml-2">mdi-longitude</v-icon>
                    {{ property.longitude }}°
                  </div>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    size="small"
                    prepend-icon="mdi-map"
                    class="mt-2"
                    :href="getGoogleMapsUrl()"
                    target="_blank"
                  >
                    Ver no Google Maps
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Characteristics -->
          <v-card elevation="2" class="mb-4" rounded="lg">
            <v-card-title class="d-flex align-center pa-4">
              <v-icon class="mr-2" color="primary">mdi-home-variant</v-icon>
              Características
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col
                  v-if="property.area_total"
                  cols="6" md="4"
                >
                  <div class="d-flex flex-column align-center pa-3 bg-grey-lighten-5 rounded">
                    <v-icon color="primary" size="32" class="mb-2">mdi-ruler-square</v-icon>
                    <div class="text-h6 font-weight-bold">{{ property.area_total }} m²</div>
                    <div class="text-caption text-medium-emphasis">Área Total</div>
                  </div>
                </v-col>
                <v-col
                  v-if="property.area_built"
                  cols="6" md="4"
                >
                  <div class="d-flex flex-column align-center pa-3 bg-grey-lighten-5 rounded">
                    <v-icon color="primary" size="32" class="mb-2">mdi-home-city</v-icon>
                    <div class="text-h6 font-weight-bold">{{ property.area_built }} m²</div>
                    <div class="text-caption text-medium-emphasis">Área Construída</div>
                  </div>
                </v-col>
                <v-col
                  v-if="property.bedrooms !== null"
                  cols="6" md="4"
                >
                  <div class="d-flex flex-column align-center pa-3 bg-grey-lighten-5 rounded">
                    <v-icon color="primary" size="32" class="mb-2">mdi-bed</v-icon>
                    <div class="text-h6 font-weight-bold">{{ property.bedrooms }}</div>
                    <div class="text-caption text-medium-emphasis">Quartos</div>
                  </div>
                </v-col>
                <v-col
                  v-if="property.bathrooms !== null"
                  cols="6" md="4"
                >
                  <div class="d-flex flex-column align-center pa-3 bg-grey-lighten-5 rounded">
                    <v-icon color="primary" size="32" class="mb-2">mdi-shower</v-icon>
                    <div class="text-h6 font-weight-bold">{{ property.bathrooms }}</div>
                    <div class="text-caption text-medium-emphasis">Banheiros</div>
                  </div>
                </v-col>
                <v-col
                  v-if="property.parking_spaces !== null"
                  cols="6" md="4"
                >
                  <div class="d-flex flex-column align-center pa-3 bg-grey-lighten-5 rounded">
                    <v-icon color="primary" size="32" class="mb-2">mdi-car</v-icon>
                    <div class="text-h6 font-weight-bold">{{ property.parking_spaces }}</div>
                    <div class="text-caption text-medium-emphasis">Vagas</div>
                  </div>
                </v-col>
                <v-col
                  v-if="property.floor !== null"
                  cols="6" md="4"
                >
                  <div class="d-flex flex-column align-center pa-3 bg-grey-lighten-5 rounded">
                    <v-icon color="primary" size="32" class="mb-2">mdi-office-building</v-icon>
                    <div class="text-h6 font-weight-bold">{{ property.floor }}º</div>
                    <div class="text-caption text-medium-emphasis">Andar</div>
                  </div>
                </v-col>
              </v-row>
              <v-row class="mt-2">
                <v-col cols="12" md="6">
                  <v-chip
                    :color="property.has_elevator ? 'success' : 'default'"
                    variant="flat"
                    size="small"
                    class="mr-2 mb-2"
                  >
                    <v-icon start size="16">
                      {{ property.has_elevator ? 'mdi-check' : 'mdi-close' }}
                    </v-icon>
                    Elevador
                  </v-chip>
                  <v-chip
                    :color="property.furnished ? 'success' : 'default'"
                    variant="flat"
                    size="small"
                    class="mr-2 mb-2"
                  >
                    <v-icon start size="16">
                      {{ property.furnished ? 'mdi-check' : 'mdi-close' }}
                    </v-icon>
                    Mobiliado
                  </v-chip>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Financial -->
          <v-card
            v-if="hasFinancialInfo"
            elevation="2"
            class="mb-4"
            rounded="lg"
          >
            <v-card-title class="d-flex align-center pa-4">
              <v-icon class="mr-2" color="primary">mdi-currency-usd</v-icon>
              Informações Financeiras
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col
                  v-if="property.price"
                  cols="12" md="6"
                >
                  <div class="d-flex align-center pa-3 bg-primary-lighten-5 rounded mb-2">
                    <v-icon color="primary" size="28" class="mr-3">mdi-cash</v-icon>
                    <div>
                      <div class="text-caption text-medium-emphasis">Preço de Venda</div>
                      <div class="text-h5 font-weight-bold text-primary">
                        {{ formatCurrency(property.price) }}
                      </div>
                    </div>
                  </div>
                </v-col>
                <v-col
                  v-if="property.rent_price"
                  cols="12" md="6"
                >
                  <div class="d-flex align-center pa-3 bg-success-lighten-5 rounded mb-2">
                    <v-icon color="success" size="28" class="mr-3">mdi-calendar-month</v-icon>
                    <div>
                      <div class="text-caption text-medium-emphasis">Preço de Aluguel</div>
                      <div class="text-h5 font-weight-bold text-success">
                        {{ formatCurrency(property.rent_price) }}/mês
                      </div>
                    </div>
                  </div>
                </v-col>
                <v-col
                  v-if="property.condo_fee"
                  cols="12" md="6"
                >
                  <div class="d-flex align-center pa-3 bg-grey-lighten-5 rounded mb-2">
                    <v-icon color="grey-darken-1" size="28" class="mr-3">mdi-home-group</v-icon>
                    <div>
                      <div class="text-caption text-medium-emphasis">Condomínio</div>
                      <div class="text-h6 font-weight-bold">
                        {{ formatCurrency(property.condo_fee) }}/mês
                      </div>
                    </div>
                  </div>
                </v-col>
                <v-col
                  v-if="property.iptu"
                  cols="12" md="6"
                >
                  <div class="d-flex align-center pa-3 bg-grey-lighten-5 rounded mb-2">
                    <v-icon color="grey-darken-1" size="28" class="mr-3">mdi-file-document</v-icon>
                    <div>
                      <div class="text-caption text-medium-emphasis">IPTU</div>
                      <div class="text-h6 font-weight-bold">
                        {{ formatCurrency(property.iptu) }}/ano
                      </div>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Owner -->
          <v-card
            v-if="property.owner_name || property.owner_contact"
            elevation="2"
            class="mb-4"
            rounded="lg"
          >
            <v-card-title class="d-flex align-center pa-4">
              <v-icon class="mr-2" color="primary">mdi-account</v-icon>
              Proprietário
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col
                  v-if="property.owner_name"
                  cols="12" md="6"
                >
                  <div class="text-body-1 mb-1">
                    <v-icon size="18" class="mr-2">mdi-account-circle</v-icon>
                    <strong>Nome:</strong> {{ property.owner_name }}
                  </div>
                </v-col>
                <v-col
                  v-if="property.owner_contact"
                  cols="12" md="6"
                >
                  <div class="text-body-1">
                    <v-icon size="18" class="mr-2">mdi-phone</v-icon>
                    <strong>Contato:</strong> {{ property.owner_contact }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Score de Visibilidade -->
          <v-card
            v-if="property.visibility_score !== null"
            elevation="2"
            class="mb-4"
            rounded="lg"
          >
            <v-card-title class="d-flex align-center pa-4">
              <v-icon class="mr-2" color="primary">mdi-chart-line</v-icon>
              Score de Visibilidade
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="text-caption text-medium-emphasis mb-2">
                Usado para ordenar a listagem de imóveis. Quanto maior, melhor a posição.
              </div>
              <div class="d-flex align-center">
                <v-progress-linear
                  :model-value="property.visibility_score"
                  color="primary"
                  height="24"
                  rounded
                  class="mr-3"
                ></v-progress-linear>
                <span class="text-h6 font-weight-bold">
                  {{ property.visibility_score }}/100
                </span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column -->
        <v-col cols="12" lg="4">
          <!-- Commercial Info -->
          <v-card elevation="2" class="mb-4" rounded="lg">
            <v-card-title class="d-flex align-center pa-4">
              <v-icon class="mr-2" color="primary">mdi-briefcase</v-icon>
              Informações Comerciais
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="mb-4">
                <div class="text-caption text-medium-emphasis mb-1">Status</div>
                <v-chip
                  :color="getStatusColor(property.status)"
                  variant="flat"
                  size="large"
                >
                  <v-icon start size="18">{{ getStatusIcon(property.status) }}</v-icon>
                  {{ getStatusLabel(property.status) }}
                </v-chip>
              </div>
              <v-divider class="my-4"></v-divider>
              <div v-if="assignedAgent">
                <div class="text-caption text-medium-emphasis mb-2">Corretor Responsável</div>
                <v-card variant="outlined" class="pa-3">
                  <div class="d-flex align-center">
                    <v-avatar color="primary" size="48" class="mr-3">
                      <v-icon color="white">mdi-account</v-icon>
                    </v-avatar>
                    <div>
                      <div class="text-body-1 font-weight-medium">
                        {{ assignedAgent.full_name }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        {{ assignedAgent.email }}
                      </div>
                    </div>
                  </div>
                </v-card>
              </div>
              <div v-else class="text-body-2 text-medium-emphasis">
                Nenhum corretor atribuído
              </div>
            </v-card-text>
          </v-card>

          <!-- Metadata -->
          <v-card elevation="2" class="mb-4" rounded="lg">
            <v-card-title class="d-flex align-center pa-4">
              <v-icon class="mr-2" color="primary">mdi-information-outline</v-icon>
              Informações do Sistema
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">Código</div>
                <div class="text-body-1 font-weight-medium">{{ property.code }}</div>
              </div>
              <v-divider class="my-3"></v-divider>
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">Criado em</div>
                <div class="text-body-2">
                  {{ formatDateTime(property.created_at) }}
                </div>
              </div>
              <div class="mb-3">
                <div class="text-caption text-medium-emphasis mb-1">Atualizado em</div>
                <div class="text-body-2">
                  {{ formatDateTime(property.updated_at) }}
                </div>
              </div>
              <div v-if="property.published_at">
                <v-divider class="my-3"></v-divider>
                <div class="mb-3">
                  <div class="text-caption text-medium-emphasis mb-1">Publicado em</div>
                  <div class="text-body-2">
                    {{ formatDateTime(property.published_at) }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Error State -->
    <v-card v-else elevation="2" class="text-center pa-8">
      <v-icon color="error" size="64" class="mb-4">mdi-alert-circle</v-icon>
      <div class="text-h6 mb-2">Imóvel não encontrado</div>
      <div class="text-body-2 text-medium-emphasis mb-4">
        O imóvel que você está procurando não existe ou foi removido.
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-arrow-left"
        @click="goBack"
      >
        Voltar para Lista
      </v-btn>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { propertiesService, type Property, type PropertyType, type BusinessType, type PropertyStatus } from '@/shared/services/properties.service'
import { usersService, type User } from '@/shared/services/users.service'

const route = useRoute()
const router = useRouter()

const property = ref<Property | null>(null)
const assignedAgent = ref<User | null>(null)
const isLoading = ref(true)

// Computed
const hasFinancialInfo = computed(() => {
  return !!(property.value?.price || property.value?.rent_price || property.value?.condo_fee || property.value?.iptu)
})

// Methods
const loadProperty = async () => {
  try {
    const propertyId = route.params.id as string
    property.value = await propertiesService.getPropertyById(propertyId)
    
    // Load assigned agent if exists
    // Note: This requires manager role, so we catch errors gracefully
    if (property.value.assigned_agent_id) {
      try {
        assignedAgent.value = await usersService.getUserById(property.value.assigned_agent_id)
      } catch (error: any) {
        // User might not have manager role to view agent details
        // Continue without agent info - this is acceptable
        console.debug('Could not load assigned agent (may require manager role):', error?.message)
      }
    }
  } catch (error) {
    console.error('Error loading property:', error)
    property.value = null
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push({ name: 'properties' })
}

const goToEdit = () => {
  router.push({ name: 'properties-edit', params: { id: route.params.id } })
}

const formatCurrency = (value: string | number | null | undefined): string => {
  if (!value) return 'R$ 0,00'
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue)
}

const formatZipCode = (zipCode: string): string => {
  if (!zipCode) return ''
  const cleaned = zipCode.replace(/\D/g, '')
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
  }
  return zipCode
}

const formatDateTime = (date: string | Date): string => {
  if (!date) return '-'
  const d = new Date(date)
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(d)
}

const getGoogleMapsUrl = (): string => {
  if (!property.value?.latitude || !property.value?.longitude) {
    return '#'
  }
  return `https://www.google.com/maps?q=${property.value.latitude},${property.value.longitude}`
}

const getPropertyTypeLabel = (type: PropertyType): string => {
  const labels: Record<PropertyType, string> = {
    HOUSE: 'Casa',
    APARTMENT: 'Apartamento',
    LAND: 'Terreno',
    COMMERCIAL: 'Comercial',
    RURAL: 'Rural',
  }
  return labels[type] || type
}

const getBusinessTypeLabel = (type: BusinessType): string => {
  const labels: Record<BusinessType, string> = {
    SALE: 'Venda',
    RENT: 'Aluguel',
    BOTH: 'Venda e Aluguel',
  }
  return labels[type] || type
}

const getStatusLabel = (status: PropertyStatus): string => {
  const labels: Record<PropertyStatus, string> = {
    DRAFT: 'Rascunho',
    PUBLISHED: 'Publicado',
    SOLD: 'Vendido',
    RENTED: 'Alugado',
    UNAVAILABLE: 'Indisponível',
  }
  return labels[status] || status
}

const getStatusColor = (status: PropertyStatus): string => {
  const colors: Record<PropertyStatus, string> = {
    DRAFT: 'grey',
    PUBLISHED: 'success',
    SOLD: 'info',
    RENTED: 'primary',
    UNAVAILABLE: 'error',
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status: PropertyStatus): string => {
  const icons: Record<PropertyStatus, string> = {
    DRAFT: 'mdi-file-document-outline',
    PUBLISHED: 'mdi-check-circle',
    SOLD: 'mdi-handshake',
    RENTED: 'mdi-key',
    UNAVAILABLE: 'mdi-close-circle',
  }
  return icons[status] || 'mdi-help-circle'
}

onMounted(() => {
  loadProperty()
})
</script>

<style scoped>
:deep(.v-card) {
  transition: box-shadow 0.2s ease;
}

:deep(.v-card:hover) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12) !important;
}
</style>
