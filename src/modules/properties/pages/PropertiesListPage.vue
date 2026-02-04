<template>
  <div>
    <!-- Header Card -->
    <v-card elevation="2" class="mb-4">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-3" size="32" color="primary">mdi-home-city</v-icon>
        <span class="text-h5">Imóveis</span>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="goToCreate"
        >
          Novo Imóvel
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- Filters Card -->
    <v-card elevation="2" class="mb-4">
      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="searchQuery"
              label="Buscar"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @update:model-value="handleSearch"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.property_type"
              :items="propertyTypeOptions"
              label="Tipo"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @update:model-value="loadProperties"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.business_type"
              :items="businessTypeOptions"
              label="Negócio"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @update:model-value="loadProperties"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              label="Status"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @update:model-value="loadProperties"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="filters.city"
              label="Cidade"
              variant="outlined"
              density="compact"
              clearable
              hide-details
              @update:model-value="handleCityFilter"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Properties Table -->
    <v-card elevation="2">
      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :headers="headers"
        :items="properties"
        :items-length="totalItems"
        :loading="isLoading"
        :items-per-page-options="[10, 25, 50, 100]"
        item-value="id"
        class="elevation-0"
        @update:options="loadProperties"
      >
        <template #item.code="{ item }">
          <span class="font-weight-medium text-primary">{{ item.code }}</span>
        </template>

        <template #item.title="{ item }">
          <div class="d-flex align-center">
            <v-avatar
              v-if="item.main_image_url"
              size="40"
              class="mr-3"
            >
              <v-img
                :src="item.main_image_url"
                :alt="item.title"
                cover
              ></v-img>
            </v-avatar>
            <v-avatar
              v-else
              color="grey-lighten-2"
              size="40"
              class="mr-3"
            >
              <v-icon color="grey">mdi-home</v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.title }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ item.city }}, {{ item.state }}
              </div>
            </div>
          </div>
        </template>

        <template #item.property_type="{ item }">
          <v-chip
            size="small"
            :color="getPropertyTypeColor(item.property_type)"
            variant="tonal"
          >
            {{ getPropertyTypeLabel(item.property_type) }}
          </v-chip>
        </template>

        <template #item.business_type="{ item }">
          <v-chip
            size="small"
            :color="getBusinessTypeColor(item.business_type)"
            variant="tonal"
          >
            {{ getBusinessTypeLabel(item.business_type) }}
          </v-chip>
        </template>

        <template #item.status="{ item }">
          <v-chip
            size="small"
            :color="getStatusColor(item.status)"
            variant="tonal"
          >
            {{ getStatusLabel(item.status) }}
          </v-chip>
        </template>

        <template #item.price="{ item }">
          <div v-if="item.business_type === 'SALE' && item.price">
            <span class="font-weight-bold text-primary">
              {{ formatCurrency(item.price) }}
            </span>
          </div>
          <div v-else-if="item.business_type === 'RENT' && item.rent_price">
            <span class="font-weight-bold text-success">
              {{ formatCurrency(item.rent_price) }}/mês
            </span>
          </div>
          <div v-else-if="item.business_type === 'BOTH'">
            <div v-if="item.price" class="text-caption">
              Venda: {{ formatCurrency(item.price) }}
            </div>
            <div v-if="item.rent_price" class="text-caption">
              Aluguel: {{ formatCurrency(item.rent_price) }}/mês
            </div>
          </div>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <template #item.visibility_score="{ item }">
          <v-progress-linear
            v-if="item.visibility_score !== null"
            :model-value="item.visibility_score"
            color="primary"
            height="20"
            rounded
          >
            <template #default="{ value }">
              <span class="text-caption font-weight-bold">{{ Math.round(value) }}%</span>
            </template>
          </v-progress-linear>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <template #item.actions="{ item }">
          <v-menu location="bottom end">
            <template #activator="{ props }">
              <v-btn
                icon
                variant="text"
                size="small"
                v-bind="props"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                prepend-icon="mdi-eye"
                title="Ver Detalhes"
                @click="goToDetails(item.id)"
              ></v-list-item>
              <v-list-item
                prepend-icon="mdi-pencil"
                title="Editar"
                @click="goToEdit(item.id)"
              ></v-list-item>
              <v-list-divider v-if="canDelete"></v-list-divider>
              <v-list-item
                v-if="canDelete"
                prepend-icon="mdi-delete"
                title="Excluir"
                class="text-error"
                @click="confirmDelete(item)"
              ></v-list-item>
            </v-list>
          </v-menu>
        </template>

        <template #no-data>
          <div class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-1">mdi-home-off</v-icon>
            <p class="text-h6 mt-4 text-grey">Nenhum imóvel encontrado</p>
            <v-btn
              color="primary"
              class="mt-4"
              prepend-icon="mdi-plus"
              @click="goToCreate"
            >
              Criar Primeiro Imóvel
            </v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog
      v-model="deleteDialog"
      max-width="400"
      persistent
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon
            color="error"
            class="mr-3"
            size="32"
          >
            mdi-alert-circle-outline
          </v-icon>
          <span class="text-h6">Confirmar exclusão</span>
        </v-card-title>
        <v-card-text class="pt-4">
          <p class="text-body-1">
            Tem certeza que deseja excluir o imóvel <strong>{{ propertyToDelete?.code }}</strong>?
          </p>
          <p class="text-caption text-medium-emphasis mt-2">
            Esta ação não pode ser desfeita.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="deleteDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            :loading="isDeleting"
            @click="handleDelete"
          >
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { DataTableHeader } from 'vuetify/components'
import { propertiesService, type Property, type PropertyType, type BusinessType, type PropertyStatus } from '@/shared/services/properties.service'
import { useAuthStore } from '@/app/store/auth.store'

const router = useRouter()
const authStore = useAuthStore()

// State
const properties = ref<Property[]>([])
const isLoading = ref(false)
const page = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const searchQuery = ref('')
const deleteDialog = ref(false)
const propertyToDelete = ref<Property | null>(null)
const isDeleting = ref(false)

const filters = ref({
  property_type: null as PropertyType | null,
  business_type: null as BusinessType | null,
  status: null as PropertyStatus | null,
  city: null as string | null,
  state: null as string | null,
})

// Options for selects
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

// Table headers
const headers: DataTableHeader[] = [
  { title: 'Código', key: 'code', sortable: false, width: '120px' },
  { title: 'Imóvel', key: 'title', sortable: false },
  { title: 'Tipo', key: 'property_type', sortable: false, width: '140px' },
  { title: 'Negócio', key: 'business_type', sortable: false, width: '120px' },
  { title: 'Status', key: 'status', sortable: false, width: '120px' },
  { title: 'Valor', key: 'price', sortable: false, width: '180px' },
  { title: 'Visibilidade', key: 'visibility_score', sortable: false, width: '120px' },
  { title: 'Ações', key: 'actions', sortable: false, align: 'end', width: '80px' },
]

// Computed
const canDelete = computed(() => {
  return authStore.hasRole('corretor') || authStore.hasRole('gestor')
})

// Methods
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

const getPropertyTypeColor = (type: PropertyType): string => {
  const colors: Record<PropertyType, string> = {
    HOUSE: 'blue',
    APARTMENT: 'purple',
    LAND: 'green',
    COMMERCIAL: 'orange',
    RURAL: 'brown',
  }
  return colors[type] || 'grey'
}

const getBusinessTypeLabel = (type: BusinessType): string => {
  const labels: Record<BusinessType, string> = {
    SALE: 'Venda',
    RENT: 'Aluguel',
    BOTH: 'Venda/Aluguel',
  }
  return labels[type] || type
}

const getBusinessTypeColor = (type: BusinessType): string => {
  const colors: Record<BusinessType, string> = {
    SALE: 'primary',
    RENT: 'success',
    BOTH: 'info',
  }
  return colors[type] || 'grey'
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
    SOLD: 'primary',
    RENTED: 'info',
    UNAVAILABLE: 'error',
  }
  return colors[status] || 'grey'
}

const formatCurrency = (value: string): string => {
  const num = parseFloat(value)
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num)
}

const loadProperties = async () => {
  isLoading.value = true
  try {
    const skip = (page.value - 1) * itemsPerPage.value
    const params: any = {
      skip,
      limit: itemsPerPage.value,
    }

    if (filters.value.property_type) params.property_type = filters.value.property_type
    if (filters.value.business_type) params.business_type = filters.value.business_type
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.city) params.city = filters.value.city
    if (filters.value.state) params.state = filters.value.state

    const data = await propertiesService.listProperties(params)
    properties.value = data
    // TODO: Backend should return total count for proper pagination
    totalItems.value = data.length
  } catch (error) {
    console.error('Error loading properties:', error)
    // TODO: Show error notification
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  // TODO: Implement search when backend supports it
  // For now, just reload
  loadProperties()
}

const handleCityFilter = () => {
  loadProperties()
}

const goToCreate = () => {
  router.push({ name: 'properties-create' })
}

const goToEdit = (id: string) => {
  router.push({ name: 'properties-edit', params: { id } })
}

const goToDetails = (id: string) => {
  router.push({ name: 'properties-details', params: { id } })
}

const confirmDelete = (property: Property) => {
  propertyToDelete.value = property
  deleteDialog.value = true
}

const handleDelete = async () => {
  if (!propertyToDelete.value) return

  isDeleting.value = true
  try {
    await propertiesService.deleteProperty(propertyToDelete.value.id)
    deleteDialog.value = false
    propertyToDelete.value = null
    await loadProperties()
    // TODO: Show success notification
  } catch (error) {
    console.error('Error deleting property:', error)
    // TODO: Show error notification
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  loadProperties()
})
</script>

<style scoped>
:deep(.v-data-table) {
  background-color: transparent;
}
</style>

