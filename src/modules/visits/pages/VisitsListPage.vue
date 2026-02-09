<template>
  <div>
    <!-- Header Card -->
    <v-card elevation="2" class="mb-4">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="mr-3" size="32" color="primary">mdi-calendar-check</v-icon>
        <span class="text-h5">Visitas</span>
        <v-spacer></v-spacer>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="goToCreate">
          Nova Visita
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- Stats Cards -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card variant="tonal" color="info">
          <v-card-text class="d-flex align-center">
            <v-icon size="40" class="mr-3">mdi-calendar-clock</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.scheduled }}</div>
              <div class="text-caption">Agendadas</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card variant="tonal" color="success">
          <v-card-text class="d-flex align-center">
            <v-icon size="40" class="mr-3">mdi-check-circle</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.completed }}</div>
              <div class="text-caption">Concluídas</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card variant="tonal" color="warning">
          <v-card-text class="d-flex align-center">
            <v-icon size="40" class="mr-3">mdi-clock-outline</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.today }}</div>
              <div class="text-caption">Hoje</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card variant="tonal" color="error">
          <v-card-text class="d-flex align-center">
            <v-icon size="40" class="mr-3">mdi-account-off</v-icon>
            <div>
              <div class="text-h4 font-weight-bold">{{ stats.noShow }}</div>
              <div class="text-caption">Não Compareceu</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

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
            ></v-text-field>
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
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="filters.broker_id"
              :items="brokerOptions"
              label="Corretor"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-text-field
              v-model="filters.date"
              label="Data"
              type="date"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-btn-toggle v-model="viewMode" mandatory density="compact" color="primary">
              <v-btn value="list" icon="mdi-format-list-bulleted"></v-btn>
              <v-btn value="calendar" icon="mdi-calendar"></v-btn>
            </v-btn-toggle>
            <v-btn variant="outlined" color="grey" class="ml-2" @click="clearFilters">
              <v-icon>mdi-filter-off</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- List View -->
    <v-card v-if="viewMode === 'list'" elevation="2">
      <v-data-table
        :headers="headers"
        :items="filteredVisits"
        :loading="isLoading"
        item-value="id"
        class="elevation-0"
        @click:row="handleRowClick"
      >
        <!-- Scheduled At Column -->
        <template #item.scheduled_at="{ item }">
          <div class="d-flex align-center">
            <v-avatar :color="getDateColor(item.scheduled_at)" size="40" class="mr-3">
              <div class="text-center">
                <div class="text-caption font-weight-bold text-white">{{ formatDay(item.scheduled_at) }}</div>
                <div class="text-caption text-white" style="font-size: 10px;">{{ formatMonth(item.scheduled_at) }}</div>
              </div>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ formatTime(item.scheduled_at) }}</div>
              <div class="text-caption text-medium-emphasis">{{ formatWeekday(item.scheduled_at) }}</div>
            </div>
          </div>
        </template>

        <!-- Client Column -->
        <template #item.client_id="{ item }">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="32" class="mr-2">
              <span class="text-caption text-white">{{ getClientInitials(item.client_id) }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ getClientName(item.client_id) }}</div>
            </div>
          </div>
        </template>

        <!-- Property Column -->
        <template #item.property_id="{ item }">
          <div v-if="item.property_id" class="d-flex align-center">
            <v-icon color="success" size="20" class="mr-2">mdi-home</v-icon>
            <span>{{ getPropertyTitle(item.property_id) }}</span>
          </div>
          <v-chip v-else variant="tonal" size="small" color="grey">
            Sem imóvel
          </v-chip>
        </template>

        <!-- Broker Column -->
        <template #item.broker_id="{ item }">
          <div class="d-flex align-center">
            <v-avatar color="secondary" size="28" class="mr-2">
              <v-icon color="white" size="16">mdi-account-tie</v-icon>
            </v-avatar>
            <span>{{ getBrokerName(item.broker_id) }}</span>
          </div>
        </template>

        <!-- Status Column -->
        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" variant="flat" size="small">
            <v-icon start size="14">{{ getStatusIcon(item.status) }}</v-icon>
            {{ getStatusLabel(item.status) }}
          </v-chip>
        </template>

        <!-- Actions Column -->
        <template #item.actions="{ item }">
          <v-btn icon variant="text" size="small" @click.stop="handleEdit(item)">
            <v-icon size="18">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon variant="text" size="small" color="error" @click.stop="handleDelete(item)">
            <v-icon size="18">mdi-delete</v-icon>
          </v-btn>
        </template>

        <!-- Loading State -->
        <template #loading>
          <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
        </template>

        <!-- Empty State -->
        <template #no-data>
          <div class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-calendar-blank</v-icon>
            <div class="text-h6 text-medium-emphasis mb-2">Nenhuma visita encontrada</div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              {{ searchQuery || hasActiveFilters ? 'Tente ajustar os filtros' : 'Comece agendando uma nova visita' }}
            </div>
            <v-btn v-if="!hasActiveFilters" color="primary" prepend-icon="mdi-plus" @click="goToCreate">
              Agendar Visita
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Calendar View -->
    <v-card v-else elevation="2" class="pa-4">
      <div class="d-flex align-center justify-space-between mb-4">
        <v-btn icon variant="text" @click="previousMonth">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <div class="text-h6">{{ currentMonthLabel }}</div>
        <v-btn icon variant="text" @click="nextMonth">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
      
      <!-- Calendar Grid -->
      <div class="calendar-grid">
        <div v-for="day in weekDays" :key="day" class="calendar-header text-caption font-weight-bold">
          {{ day }}
        </div>
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="calendar-day"
          :class="{
            'other-month': !day.currentMonth,
            'today': day.isToday,
            'has-visits': day.visits.length > 0,
          }"
          @click="day.visits.length > 0 && showDayVisits(day)"
        >
          <div class="day-number">{{ day.date }}</div>
          <div v-if="day.visits.length > 0" class="visit-indicators">
            <v-chip
              v-for="visit in day.visits.slice(0, 3)"
              :key="visit.id"
              :color="getStatusColor(visit.status)"
              size="x-small"
              class="mb-1"
              style="width: 100%;"
            >
              {{ formatTime(visit.scheduled_at) }}
            </v-chip>
            <div v-if="day.visits.length > 3" class="text-caption text-medium-emphasis">
              +{{ day.visits.length - 3 }} mais
            </div>
          </div>
        </div>
      </div>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
          Confirmar Exclusão
        </v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir esta visita agendada para
          <strong>{{ visitToDelete ? formatDateTime(visitToDelete.scheduled_at) : '' }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" :loading="isDeleting" @click="confirmDelete">
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
import { visitsService, type Visit, type VisitStatus } from '@/shared/services/visits.service'
import { clientsService, type Client } from '@/shared/services/clients.service'
import { usersService, type User } from '@/shared/services/users.service'
import { propertiesService, type Property } from '@/shared/services/properties.service'

const router = useRouter()

// State
const visits = ref<Visit[]>([])
const clients = ref<Client[]>([])
const brokers = ref<User[]>([])
const properties = ref<Property[]>([])
const isLoading = ref(false)
const isDeleting = ref(false)
const searchQuery = ref('')
const viewMode = ref<'list' | 'calendar'>('list')
const currentDate = ref(new Date())
const showDeleteDialog = ref(false)
const visitToDelete = ref<Visit | null>(null)

const filters = ref({
  status: null as VisitStatus | null,
  broker_id: null as string | null,
  date: null as string | null,
})

// Maps
const clientsMap = computed(() => {
  const map = new Map<string, Client>()
  clients.value.forEach(c => map.set(c.id, c))
  return map
})

const brokersMap = computed(() => {
  const map = new Map<string, User>()
  brokers.value.forEach(b => map.set(b.id, b))
  return map
})

const propertiesMap = computed(() => {
  const map = new Map<string, Property>()
  properties.value.forEach(p => map.set(p.id, p))
  return map
})

// Table Headers
const headers = [
  { title: 'Data/Hora', key: 'scheduled_at', sortable: true },
  { title: 'Cliente', key: 'client_id', sortable: false },
  { title: 'Imóvel', key: 'property_id', sortable: false },
  { title: 'Corretor', key: 'broker_id', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Ações', key: 'actions', sortable: false, width: '100px' },
]

// Options
const statusOptions = [
  { title: 'Agendada', value: 'SCHEDULED' },
  { title: 'Confirmada', value: 'CONFIRMED' },
  { title: 'Em Andamento', value: 'IN_PROGRESS' },
  { title: 'Concluída', value: 'COMPLETED' },
  { title: 'Cancelada', value: 'CANCELLED' },
  { title: 'Não Compareceu', value: 'NO_SHOW' },
]

const brokerOptions = computed(() => {
  return brokers.value.map(b => ({ title: b.full_name, value: b.id }))
})

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// Computed
const hasActiveFilters = computed(() => {
  return !!(filters.value.status || filters.value.broker_id || filters.value.date)
})

const stats = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return {
    scheduled: visits.value.filter(v => v.status === 'SCHEDULED' || v.status === 'CONFIRMED').length,
    completed: visits.value.filter(v => v.status === 'COMPLETED').length,
    today: visits.value.filter(v => {
      const visitDate = new Date(v.scheduled_at)
      return visitDate >= today && visitDate < tomorrow
    }).length,
    noShow: visits.value.filter(v => v.status === 'NO_SHOW').length,
  }
})

const filteredVisits = computed(() => {
  let result = [...visits.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(v => {
      const clientName = getClientName(v.client_id).toLowerCase()
      const brokerName = getBrokerName(v.broker_id).toLowerCase()
      const propertyTitle = v.property_id ? getPropertyTitle(v.property_id).toLowerCase() : ''
      return clientName.includes(query) || brokerName.includes(query) || propertyTitle.includes(query)
    })
  }

  if (filters.value.status) {
    result = result.filter(v => v.status === filters.value.status)
  }

  if (filters.value.broker_id) {
    result = result.filter(v => v.broker_id === filters.value.broker_id)
  }

  if (filters.value.date) {
    const filterDate = new Date(filters.value.date)
    filterDate.setHours(0, 0, 0, 0)
    result = result.filter(v => {
      const visitDate = new Date(v.scheduled_at)
      visitDate.setHours(0, 0, 0, 0)
      return visitDate.getTime() === filterDate.getTime()
    })
  }

  // Sort by scheduled_at
  result.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

  return result
})

const currentMonthLabel = computed(() => {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate.value)
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDay = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  
  const days: Array<{ date: number; currentMonth: boolean; isToday: boolean; visits: Visit[]; fullDate: Date }> = []
  
  // Previous month days
  const prevMonth = new Date(year, month, 0)
  for (let i = startDay - 1; i >= 0; i--) {
    const date = prevMonth.getDate() - i
    const fullDate = new Date(year, month - 1, date)
    days.push({
      date,
      currentMonth: false,
      isToday: false,
      visits: getVisitsForDate(fullDate),
      fullDate,
    })
  }
  
  // Current month days
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let date = 1; date <= daysInMonth; date++) {
    const fullDate = new Date(year, month, date)
    const isToday = fullDate.getTime() === today.getTime()
    days.push({
      date,
      currentMonth: true,
      isToday,
      visits: getVisitsForDate(fullDate),
      fullDate,
    })
  }
  
  // Next month days
  const remaining = 42 - days.length
  for (let date = 1; date <= remaining; date++) {
    const fullDate = new Date(year, month + 1, date)
    days.push({
      date,
      currentMonth: false,
      isToday: false,
      visits: getVisitsForDate(fullDate),
      fullDate,
    })
  }
  
  return days
})

// Methods
const loadData = async () => {
  isLoading.value = true
  try {
    const [visitsData, clientsData, brokersData, propertiesData] = await Promise.all([
      visitsService.getVisits({ limit: 1000 }),
      clientsService.getClients({ limit: 1000 }),
      usersService.getCorretores(),
      propertiesService.listProperties({ limit: 1000 }),
    ])
    
    visits.value = visitsData
    clients.value = clientsData
    brokers.value = brokersData
    properties.value = propertiesData
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    isLoading.value = false
  }
}

const getVisitsForDate = (date: Date): Visit[] => {
  const dateStart = new Date(date)
  dateStart.setHours(0, 0, 0, 0)
  const dateEnd = new Date(date)
  dateEnd.setHours(23, 59, 59, 999)
  
  return visits.value.filter(v => {
    const visitDate = new Date(v.scheduled_at)
    return visitDate >= dateStart && visitDate <= dateEnd
  })
}

const getClientName = (id: string): string => clientsMap.value.get(id)?.name || `Cliente #${id.slice(0, 8)}`
const getClientInitials = (id: string): string => {
  const client = clientsMap.value.get(id)
  if (client?.name) {
    const parts = client.name.trim().split(' ')
    return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : client.name.substring(0, 2).toUpperCase()
  }
  return '??'
}
const getBrokerName = (id: string): string => brokersMap.value.get(id)?.full_name || `Corretor #${id.slice(0, 8)}`
const getPropertyTitle = (id: string): string => propertiesMap.value.get(id)?.title || `Imóvel #${id.slice(0, 8)}`

const getStatusLabel = (status: VisitStatus): string => {
  const labels: Record<VisitStatus, string> = {
    SCHEDULED: 'Agendada',
    CONFIRMED: 'Confirmada',
    IN_PROGRESS: 'Em Andamento',
    COMPLETED: 'Concluída',
    CANCELLED: 'Cancelada',
    NO_SHOW: 'Não Compareceu',
  }
  return labels[status] || status
}

const getStatusColor = (status: VisitStatus): string => {
  const colors: Record<VisitStatus, string> = {
    SCHEDULED: 'info',
    CONFIRMED: 'primary',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'grey',
    NO_SHOW: 'error',
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status: VisitStatus): string => {
  const icons: Record<VisitStatus, string> = {
    SCHEDULED: 'mdi-calendar-clock',
    CONFIRMED: 'mdi-calendar-check',
    IN_PROGRESS: 'mdi-run',
    COMPLETED: 'mdi-check-circle',
    CANCELLED: 'mdi-cancel',
    NO_SHOW: 'mdi-account-off',
  }
  return icons[status] || 'mdi-help-circle'
}

const getDateColor = (dateStr: string): string => {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const visitDay = new Date(date)
  visitDay.setHours(0, 0, 0, 0)
  
  if (visitDay.getTime() === today.getTime()) return 'warning'
  if (visitDay < today) return 'grey'
  return 'primary'
}

const formatDay = (dateStr: string): string => new Date(dateStr).getDate().toString().padStart(2, '0')
const formatMonth = (dateStr: string): string => new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(dateStr)).replace('.', '')
const formatTime = (dateStr: string): string => new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr))
const formatWeekday = (dateStr: string): string => new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date(dateStr))
const formatDateTime = (dateStr: string): string => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr))

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const showDayVisits = (day: { visits: Visit[] }) => {
  if (day.visits.length === 1) {
    router.push({ name: 'visits-details', params: { id: day.visits[0].id } })
  }
}

const clearFilters = () => {
  filters.value = { status: null, broker_id: null, date: null }
  searchQuery.value = ''
}

const goToCreate = () => router.push({ name: 'visits-create' })
const handleRowClick = (_event: Event, { item }: { item: Visit }) => router.push({ name: 'visits-details', params: { id: item.id } })
const handleEdit = (visit: Visit) => router.push({ name: 'visits-edit', params: { id: visit.id } })

const handleDelete = (visit: Visit) => {
  visitToDelete.value = visit
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!visitToDelete.value) return
  
  isDeleting.value = true
  try {
    await visitsService.deleteVisit(visitToDelete.value.id)
    visits.value = visits.value.filter(v => v.id !== visitToDelete.value!.id)
    showDeleteDialog.value = false
    visitToDelete.value = null
  } catch (error) {
    console.error('Error deleting visit:', error)
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => loadData())
</script>

<style scoped>
:deep(.v-data-table__tr) {
  cursor: pointer;
}

:deep(.v-data-table__tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-header {
  text-align: center;
  padding: 8px;
  background-color: rgba(var(--v-theme-primary), 0.1);
  border-radius: 4px;
}

.calendar-day {
  min-height: 100px;
  padding: 8px;
  border: 1px solid rgba(var(--v-border-color), 0.12);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.calendar-day:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.calendar-day.other-month {
  opacity: 0.4;
}

.calendar-day.today {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.calendar-day.has-visits {
  cursor: pointer;
}

.day-number {
  font-weight: 500;
  margin-bottom: 4px;
}

.visit-indicators {
  display: flex;
  flex-direction: column;
}
</style>

