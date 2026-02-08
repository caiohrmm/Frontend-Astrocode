<template>
  <div>
    <!-- Trigger Field -->
    <v-text-field
      :model-value="displayValue"
      :label="label"
      :placeholder="placeholder"
      :prepend-inner-icon="icon"
      :rules="rules"
      :hint="hint"
      :persistent-hint="persistentHint"
      :clearable="clearable"
      readonly
      variant="outlined"
      @click="openDialog"
      @click:clear="handleClear"
    >
      <template #append-inner>
        <v-btn
          icon
          size="small"
          variant="text"
          @click.stop="openDialog"
        >
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
      </template>
    </v-text-field>

    <!-- Search Dialog -->
    <v-dialog v-model="dialogOpen" max-width="700" scrollable>
      <v-card>
        <v-card-title class="d-flex align-center pa-4">
          <v-icon :color="iconColor" class="mr-3">{{ icon }}</v-icon>
          <span>{{ dialogTitle }}</span>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="dialogOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <!-- Search Input -->
        <v-card-text class="pa-4 pb-0">
          <v-text-field
            v-model="searchQuery"
            label="Buscar"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
            autofocus
            hide-details
            @update:model-value="handleSearch"
          ></v-text-field>
        </v-card-text>

        <!-- Results List -->
        <v-card-text class="pa-4" style="min-height: 300px; max-height: 400px; overflow-y: auto;">
          <!-- Loading State -->
          <div v-if="isLoading" class="d-flex justify-center align-center" style="min-height: 200px;">
            <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
          </div>

          <!-- Empty State -->
          <div v-else-if="items.length === 0" class="text-center py-8">
            <v-icon color="grey-lighten-1" size="64" class="mb-4">mdi-magnify-close</v-icon>
            <div class="text-h6 text-medium-emphasis mb-2">Nenhum resultado encontrado</div>
            <div class="text-body-2 text-medium-emphasis">
              {{ searchQuery ? 'Tente buscar com outros termos' : 'Nenhum item disponível' }}
            </div>
          </div>

          <!-- Results -->
          <v-list v-else density="compact" class="py-0">
            <v-list-item
              v-for="item in items"
              :key="item.id"
              :active="selectedItem?.id === item.id"
              class="rounded-lg mb-1"
              @click="selectItem(item)"
            >
              <template #prepend>
                <slot name="item-prepend" :item="item">
                  <v-avatar :color="iconColor" size="40" class="mr-3">
                    <v-icon color="white" v-if="!item.image">{{ itemIcon }}</v-icon>
                    <v-img v-else :src="item.image" cover></v-img>
                  </v-avatar>
                </slot>
              </template>

              <v-list-item-title class="font-weight-medium">
                <slot name="item-title" :item="item">
                  {{ item.title || item.name }}
                </slot>
              </v-list-item-title>

              <v-list-item-subtitle>
                <slot name="item-subtitle" :item="item">
                  {{ item.subtitle || item.code || item.email || item.phone }}
                </slot>
              </v-list-item-subtitle>

              <template #append>
                <v-icon v-if="selectedItem?.id === item.id" color="success">
                  mdi-check-circle
                </v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>

        <!-- Pagination -->
        <v-divider v-if="totalPages > 1"></v-divider>
        <v-card-text v-if="totalPages > 1" class="pa-3">
          <div class="d-flex align-center justify-center ga-2">
            <v-btn
              icon
              size="small"
              variant="text"
              :disabled="currentPage <= 1 || isLoading"
              @click="goToPage(currentPage - 1)"
            >
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            
            <div class="text-body-2 mx-4">
              Página {{ currentPage }} de {{ totalPages }}
              <span class="text-medium-emphasis ml-2">({{ totalItems }} itens)</span>
            </div>
            
            <v-btn
              icon
              size="small"
              variant="text"
              :disabled="currentPage >= totalPages || isLoading"
              @click="goToPage(currentPage + 1)"
            >
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <!-- Actions -->
        <v-card-actions class="pa-4">
          <v-btn variant="text" @click="dialogOpen = false">
            Cancelar
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="flat"
            :disabled="!selectedItem"
            @click="confirmSelection"
          >
            Selecionar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface SearchItem {
  id: string
  title?: string
  name?: string
  subtitle?: string
  code?: string
  email?: string
  phone?: string
  image?: string
  [key: string]: any
}

interface Props {
  modelValue: string | null | undefined
  label: string
  dialogTitle: string
  icon?: string
  iconColor?: string
  itemIcon?: string
  placeholder?: string
  hint?: string
  persistentHint?: boolean
  clearable?: boolean
  rules?: any[]
  items: SearchItem[]
  totalItems?: number
  itemsPerPage?: number
  isLoading?: boolean
  displayField?: string
  subtitleField?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'mdi-magnify',
  iconColor: 'primary',
  itemIcon: 'mdi-account',
  placeholder: 'Clique para buscar...',
  hint: '',
  persistentHint: false,
  clearable: true,
  rules: () => [],
  items: () => [],
  totalItems: 0,
  itemsPerPage: 10,
  isLoading: false,
  displayField: 'title',
  subtitleField: 'subtitle',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'search': [query: string, page: number]
  'select': [item: SearchItem | null]
}>()

// State
const dialogOpen = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const selectedItem = ref<SearchItem | null>(null)
const selectedDisplayValue = ref('')

// Computed
const displayValue = computed(() => {
  if (selectedDisplayValue.value) {
    return selectedDisplayValue.value
  }
  
  if (props.modelValue) {
    // Find item in current items
    const item = props.items.find(i => i.id === props.modelValue)
    if (item) {
      return item[props.displayField] || item.title || item.name || ''
    }
    return 'Carregando...'
  }
  
  return ''
})

const totalPages = computed(() => {
  if (props.totalItems <= 0 || props.itemsPerPage <= 0) return 1
  return Math.ceil(props.totalItems / props.itemsPerPage)
})

// Methods
const openDialog = () => {
  dialogOpen.value = true
  searchQuery.value = ''
  currentPage.value = 1
  
  // Preselect current value
  if (props.modelValue) {
    const item = props.items.find(i => i.id === props.modelValue)
    selectedItem.value = item || null
  } else {
    selectedItem.value = null
  }
  
  // Trigger initial search
  emit('search', '', 1)
}

const handleSearch = () => {
  currentPage.value = 1
  emit('search', searchQuery.value, 1)
}

const goToPage = (page: number) => {
  currentPage.value = page
  emit('search', searchQuery.value, page)
}

const selectItem = (item: SearchItem) => {
  selectedItem.value = item
}

const confirmSelection = () => {
  if (selectedItem.value) {
    selectedDisplayValue.value = selectedItem.value[props.displayField] || selectedItem.value.title || selectedItem.value.name || ''
    emit('update:modelValue', selectedItem.value.id)
    emit('select', selectedItem.value)
  }
  dialogOpen.value = false
}

const handleClear = () => {
  selectedItem.value = null
  selectedDisplayValue.value = ''
  emit('update:modelValue', null)
  emit('select', null)
}

// Watch for external modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    selectedItem.value = null
    selectedDisplayValue.value = ''
  } else if (!selectedDisplayValue.value) {
    // Try to find item in current items
    const item = props.items.find(i => i.id === newValue)
    if (item) {
      selectedDisplayValue.value = item[props.displayField] || item.title || item.name || ''
      selectedItem.value = item
    }
  }
}, { immediate: true })

// Watch items to update selected item display
watch(() => props.items, (newItems) => {
  if (props.modelValue && !selectedDisplayValue.value) {
    const item = newItems.find(i => i.id === props.modelValue)
    if (item) {
      selectedDisplayValue.value = item[props.displayField] || item.title || item.name || ''
      selectedItem.value = item
    }
  }
}, { immediate: true })
</script>

<style scoped>
.v-list-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.v-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.v-list-item--active {
  background-color: rgba(var(--v-theme-primary), 0.12);
}
</style>

