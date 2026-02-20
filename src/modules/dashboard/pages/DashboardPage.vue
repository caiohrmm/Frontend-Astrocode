<template>
  <div class="dashboard-page">
    <!-- Header -->
    <v-card class="mb-4" elevation="2" rounded="lg">
      <v-card-text class="py-4">
        <div class="d-flex align-center justify-space-between flex-wrap">
          <div>
            <h1 class="text-h4 font-weight-bold d-flex align-center mb-2">
              <v-icon size="40" color="primary" class="mr-3">mdi-view-dashboard-variant</v-icon>
              Dashboard Executivo
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              Visão completa do negócio com inteligência e evolução
            </p>
          </div>
          <div class="d-flex align-center ga-2">
            <v-btn
              icon
              variant="text"
              @click="refreshData"
              :loading="isLoading"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
            <v-chip
              :color="isLoading ? 'grey' : 'success'"
              variant="tonal"
              prepend-icon="mdi-circle"
            >
              {{ isLoading ? 'Carregando...' : 'Atualizado' }}
            </v-chip>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Alerts -->
    <v-alert
      v-for="(alert, index) in metrics?.insights.alerts || []"
      :key="index"
      :type="alert.type"
      variant="tonal"
      class="mb-4"
      :closable="true"
    >
      <div class="d-flex align-center justify-space-between">
        <div>
          <div class="font-weight-bold mb-1">{{ alert.title }}</div>
          <div>{{ alert.message }}</div>
        </div>
        <v-btn
          v-if="alert.action_url"
          variant="text"
          size="small"
          :to="alert.action_url"
        >
          Ver
        </v-btn>
      </div>
    </v-alert>

    <!-- Main Metrics Cards -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card
          class="metric-card"
          elevation="2"
          rounded="lg"
          :class="{ 'metric-card-primary': true }"
        >
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis mb-1 d-flex align-center">
                  Total de Clientes
                  <v-tooltip location="top" max-width="280">
                    <template #activator="{ props }">
                      <v-icon v-bind="props" size="16" color="grey" class="ml-1">mdi-information-outline</v-icon>
                    </template>
                    <span>Total de clientes cadastrados no sistema. "Ativos" são leads que ainda não foram ganhos, perdidos ou inativados.</span>
                  </v-tooltip>
                </div>
                <div class="text-h4 font-weight-bold">{{ metrics?.total_clients || 0 }}</div>
                <div class="text-caption mt-1">
                  <v-icon size="14" class="mr-1">mdi-account-multiple</v-icon>
                  {{ metrics?.active_leads || 0 }} ativos
                </div>
              </div>
              <v-avatar size="64" color="primary" variant="tonal">
                <v-icon size="32" color="primary">mdi-account-group</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card
          class="metric-card"
          elevation="2"
          rounded="lg"
          :class="{ 'metric-card-success': true }"
        >
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis mb-1 d-flex align-center">
                  Vendas Concluídas
                  <v-tooltip location="top" max-width="280">
                    <template #activator="{ props }">
                      <v-icon v-bind="props" size="16" color="grey" class="ml-1">mdi-information-outline</v-icon>
                    </template>
                    <span>Quantidade de vendas ou aluguéis com status COMPLETED. O valor total é a soma de todas as vendas concluídas.</span>
                  </v-tooltip>
                </div>
                <div class="text-h4 font-weight-bold">{{ metrics?.sales_stats.completed_count || 0 }}</div>
                <div class="text-caption mt-1 text-success">
                  <v-icon size="14" class="mr-1">mdi-trending-up</v-icon>
                  {{ formatCurrency(metrics?.sales_stats.total_value || 0) }}
                </div>
              </div>
              <v-avatar size="64" color="success" variant="tonal">
                <v-icon size="32" color="success">mdi-trophy</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card
          class="metric-card"
          elevation="2"
          rounded="lg"
          :class="{ 'metric-card-info': true }"
        >
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis mb-1 d-flex align-center">
                  Taxa de Conversão
                  <v-tooltip location="top" max-width="320">
                    <template #activator="{ props }">
                      <v-icon v-bind="props" size="16" color="grey" class="ml-1">mdi-information-outline</v-icon>
                    </template>
                    <span>Percentual de atendimentos que resultaram em venda: (Vendas Concluídas ÷ Total de Atendimentos) × 100. Indica quantos atendimentos convertem em negócio.</span>
                  </v-tooltip>
                </div>
                <div class="text-h4 font-weight-bold">{{ metrics?.conversion_rate || 0 }}%</div>
                <div class="text-caption mt-1">
                  <v-icon size="14" class="mr-1">mdi-chart-line</v-icon>
                  {{ metrics?.sales_stats?.completed_count || 0 }} vendas / {{ metrics?.total_attendances || 0 }} atendimentos
                </div>
              </div>
              <v-avatar size="64" color="info" variant="tonal">
                <v-icon size="32" color="info">mdi-chart-arc</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card
          class="metric-card"
          elevation="2"
          rounded="lg"
          :class="{ 'metric-card-warning': true }"
        >
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis mb-1 d-flex align-center">
                  Lead Score Médio
                  <v-tooltip location="top" max-width="300">
                    <template #activator="{ props }">
                      <v-icon v-bind="props" size="16" color="grey" class="ml-1">mdi-information-outline</v-icon>
                    </template>
                    <span>Média dos lead scores (0 a 100) de todos os clientes. O score considera interesse, urgência, orçamento e intenção para indicar o potencial do lead.</span>
                  </v-tooltip>
                </div>
                <div class="text-h4 font-weight-bold">{{ metrics?.avg_lead_score || 0 }}</div>
                <div class="text-caption mt-1">
                  <v-icon size="14" class="mr-1">mdi-star</v-icon>
                  Qualidade dos leads
                </div>
              </div>
              <v-avatar size="64" color="warning" variant="tonal">
                <v-icon size="32" color="warning">mdi-star-circle</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Funnel Visualization -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="primary">mdi-funnel</v-icon>
            <span>Funil de Vendas - Jornada do Cliente</span>
            <v-spacer></v-spacer>
            <v-chip size="small" variant="tonal" color="primary">
              {{ metrics?.funnel_data.length || 0 }} etapas
            </v-chip>
          </v-card-title>
          <v-card-text>
            <div class="funnel-container">
              <div
                v-for="(stage, index) in metrics?.funnel_data || []"
                :key="stage.stage"
                class="funnel-stage"
                :style="{ width: `${100 - index * 8}%` }"
              >
                <div class="funnel-stage-content" :class="`funnel-${stage.color}`">
                  <div class="d-flex align-center justify-space-between pa-3">
                    <div class="d-flex align-center">
                      <v-icon :color="stage.color" class="mr-2">{{ stage.icon }}</v-icon>
                      <div>
                        <div class="font-weight-bold">{{ stage.label }}</div>
                        <div class="text-caption text-medium-emphasis">
                          {{ stage.count }} clientes ({{ stage.percentage }}%)
                        </div>
                      </div>
                    </div>
                    <v-chip
                      :color="stage.color"
                      variant="flat"
                      size="small"
                    >
                      {{ stage.count }}
                    </v-chip>
                  </div>
                  <v-progress-linear
                    :model-value="stage.percentage"
                    :color="stage.color"
                    height="8"
                    rounded
                    class="mt-2"
                  ></v-progress-linear>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts Row -->
    <v-row class="mb-4">
      <!-- Evolution Chart -->
      <v-col cols="12" md="8">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="primary">mdi-chart-bar</v-icon>
            <span>Evolução Mensal</span>
            <v-spacer></v-spacer>
            <v-chip size="small" variant="tonal">Últimos 6 meses</v-chip>
          </v-card-title>
          <v-card-text class="pa-4">
            <!-- Legenda clara no topo -->
            <div class="evolution-legend mb-4">
              <div class="evolution-legend-item">
                <span class="evolution-legend-color" style="background: #1976d2"></span>
                <span>Novos clientes</span>
              </div>
              <div class="evolution-legend-item">
                <span class="evolution-legend-color" style="background: #2e7d32"></span>
                <span>Vendas fechadas</span>
              </div>
              <div class="evolution-legend-item">
                <span class="evolution-legend-color" style="background: #c62828"></span>
                <span>Perdas</span>
              </div>
            </div>
            <div class="chart-container">
              <canvas ref="evolutionChart"></canvas>
            </div>
            <!-- Receita por mês em destaque -->
            <div v-if="metrics?.monthly_trends?.length" class="evolution-revenue-section mt-4 pt-4">
              <div class="text-subtitle-2 text-medium-emphasis mb-3">
                <v-icon size="18" class="mr-1">mdi-cash</v-icon>
                Receita por mês
              </div>
              <div class="evolution-revenue-carousel">
                <div class="evolution-revenue-track">
                  <div
                    v-for="(trend, index) in revenueCarouselItems"
                    :key="`${index}-${trend.month}-${trend.revenue}`"
                    class="evolution-revenue-item"
                    :class="getRevenueItemClass(trend.revenue)"
                  >
                    <span class="evolution-revenue-month">{{ trend.month }}</span>
                    <span class="evolution-revenue-value">{{ formatCurrency(parseRevenue(trend.revenue)) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Distribution by Source -->
      <v-col cols="12" md="4">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="success">mdi-chart-pie</v-icon>
            <span>Leads por Origem</span>
          </v-card-title>
          <v-card-text>
            <div class="source-distribution">
              <div
                v-for="(count, source) in metrics?.clients_by_source || {}"
                :key="source"
                class="source-item mb-3"
              >
                <div class="d-flex align-center justify-space-between mb-1">
                  <div class="d-flex align-center">
                    <v-icon
                      :color="getSourceColor(source)"
                      size="20"
                      class="mr-2"
                    >
                      {{ getSourceIcon(source) }}
                    </v-icon>
                    <span class="font-weight-medium">{{ getSourceLabel(source) }}</span>
                  </div>
                  <v-chip size="small" variant="tonal">
                    {{ count }}
                  </v-chip>
                </div>
                <v-progress-linear
                  :model-value="getSourcePercentage(source, count)"
                  :color="getSourceColor(source)"
                  height="6"
                  rounded
                ></v-progress-linear>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Broker Performance & Insights -->
    <v-row class="mb-4">
      <!-- Broker Performance - Full width for better readability -->
      <v-col cols="12" md="8">
        <v-card elevation="2" rounded="lg" class="broker-performance-card">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="primary">mdi-account-tie</v-icon>
            <span>Performance por Corretor</span>
            <v-spacer></v-spacer>
            <v-chip size="small" variant="tonal" color="primary">
              {{ metrics?.broker_performance.length || 0 }} corretores
            </v-chip>
          </v-card-title>
          <v-card-text>
            <v-table density="comfortable" class="broker-table">
              <thead>
                <tr>
                  <th class="broker-name-col">Corretor</th>
                  <th class="text-center">Vendas</th>
                  <th class="text-end">Receita</th>
                  <th class="text-center">Conversão</th>
                  <th class="text-center">Clientes Ativos</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="broker in metrics?.broker_performance.slice(0, 5) || []"
                  :key="broker.broker_id"
                >
                  <td class="broker-name-col">
                    <div class="d-flex align-center">
                      <v-avatar size="36" color="primary" variant="tonal" class="mr-3 flex-shrink-0">
                        <span class="text-caption">{{ getInitials(broker.broker_name) }}</span>
                      </v-avatar>
                      <span class="font-weight-medium text-wrap">{{ broker.broker_name }}</span>
                    </div>
                  </td>
                  <td class="text-center">
                    <v-chip size="small" color="success" variant="flat">
                      {{ broker.total_sales }}
                    </v-chip>
                  </td>
                  <td class="font-weight-bold text-success text-end">
                    {{ formatCurrency(broker.total_revenue) }}
                  </td>
                  <td class="text-center conversion-cell">
                    <v-progress-circular
                      :model-value="broker.conversion_rate"
                      :color="getConversionColor(broker.conversion_rate)"
                      size="44"
                      width="4"
                    >
                      <span class="conversion-value">{{ formatConversionRate(broker.conversion_rate) }}</span>
                    </v-progress-circular>
                  </td>
                  <td class="text-center">
                    <v-chip size="small" variant="tonal">
                      {{ broker.active_clients }}
                    </v-chip>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Quick Insights -->
      <v-col cols="12" md="4">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="info">mdi-lightbulb-on</v-icon>
            <span>Insights Inteligentes</span>
            <v-tooltip location="top" max-width="320">
              <template #activator="{ props }">
                <v-icon v-bind="props" size="18" color="grey" class="ml-1">mdi-information-outline</v-icon>
              </template>
              <span>Recomendações automáticas baseadas nos dados: clientes de alta urgência sem contato recente, oportunidades de alto valor, e visitas agendadas para amanhã.</span>
            </v-tooltip>
          </v-card-title>
          <v-card-text>
            <div class="insights-list">
              <div
                v-for="(recommendation, index) in metrics?.insights.recommendations || []"
                :key="index"
                class="insight-item mb-3"
              >
                <div class="d-flex align-start">
                  <v-icon color="info" size="20" class="mr-2 mt-1">mdi-information</v-icon>
                  <div class="flex-grow-1">
                    <div class="text-body-2">{{ recommendation }}</div>
                  </div>
                </div>
              </div>
              <div v-if="!metrics?.insights.recommendations?.length" class="text-center py-4">
                <v-icon size="48" color="grey-lighten-1">mdi-check-circle</v-icon>
                <div class="text-body-2 text-medium-emphasis mt-2">
                  Tudo em ordem! Nenhuma ação urgente necessária.
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Opportunities & At Risk -->
    <v-row>
      <!-- Top Opportunities -->
      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="success">mdi-trending-up</v-icon>
            <span>Top Oportunidades</span>
            <v-tooltip location="top" max-width="320">
              <template #activator="{ props }">
                <v-icon v-bind="props" size="18" color="grey" class="ml-1">mdi-information-outline</v-icon>
              </template>
              <span>Clientes com lead score ≥ 70 que ainda não foram ganhos, perdidos ou inativados. Ordenados por score (maior primeiro). Até 5 itens.</span>
            </v-tooltip>
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              size="small"
              to="/clients"
            >
              Ver todos
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-for="client in metrics?.insights.top_opportunities || []"
                :key="client.id"
                :to="`/clients/${client.id}`"
              >
                <template #prepend>
                  <v-avatar color="success" variant="tonal" size="40">
                    <span class="text-caption">{{ getInitials(client.name) }}</span>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ client.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  <div class="d-flex align-center mt-1">
                    <v-chip
                      size="x-small"
                      :color="getStatusColor(client.current_status)"
                      variant="tonal"
                      class="mr-2"
                    >
                      {{ getStatusLabel(client.current_status) }}
                    </v-chip>
                    <v-chip
                      size="x-small"
                      color="warning"
                      variant="flat"
                    >
                      Score: {{ client.current_lead_score }}
                    </v-chip>
                  </div>
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="!metrics?.insights.top_opportunities?.length">
                <v-list-item-title class="text-medium-emphasis">
                  Nenhuma oportunidade no momento
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- At Risk Clients -->
      <v-col cols="12" md="6">
        <v-card elevation="2" rounded="lg">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2" color="warning">mdi-alert</v-icon>
            <span>Clientes em Risco</span>
            <v-tooltip location="top" max-width="320">
              <template #activator="{ props }">
                <v-icon v-bind="props" size="18" color="grey" class="ml-1">mdi-information-outline</v-icon>
              </template>
              <span>Clientes com urgência ALTA ou IMEDIATA que já tiveram contato, mas estão sem contato há mais de 7 dias. Exclui ganhos, perdidos e inativos. Até 5 itens.</span>
            </v-tooltip>
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              size="small"
              to="/clients"
            >
              Ver todos
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-for="client in metrics?.insights.at_risk_clients || []"
                :key="client.id"
                :to="`/clients/${client.id}`"
              >
                <template #prepend>
                  <v-avatar color="warning" variant="tonal" size="40">
                    <span class="text-caption">{{ getInitials(client.name) }}</span>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ client.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  <div class="d-flex align-center mt-1">
                    <v-chip
                      size="x-small"
                      color="error"
                      variant="flat"
                      class="mr-2"
                    >
                      {{ getUrgencyLabel(client.current_urgency_level) }}
                    </v-chip>
                    <span class="text-caption text-medium-emphasis">
                      {{ getContactStatusText(client.last_contact_at) }}
                    </span>
                  </div>
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-if="!metrics?.insights.at_risk_clients?.length">
                <v-list-item-title class="text-medium-emphasis">
                  Nenhum cliente em risco no momento
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { dashboardService, type DashboardMetrics } from '@/shared/services/dashboard.service'
import { useAuthStore } from '@/app/store/auth.store'

const _authStore = useAuthStore()

// State
const metrics = ref<DashboardMetrics | null>(null)
const isLoading = ref(false)
const evolutionChart = ref<HTMLCanvasElement | null>(null)

// Methods
const loadDashboard = async () => {
  isLoading.value = true
  try {
    metrics.value = await dashboardService.getDashboardMetrics()
    await nextTick()
    drawEvolutionChart()
  } catch (error) {
    console.error('Error loading dashboard:', error)
  } finally {
    isLoading.value = false
  }
}

const refreshData = () => {
  loadDashboard()
}

const drawEvolutionChart = () => {
  if (!evolutionChart.value || !metrics.value) return

  const canvas = evolutionChart.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const trends = metrics.value.monthly_trends
  if (!trends.length) return

  const container = canvas.parentElement
  if (!container) return

  const dpr = window.devicePixelRatio || 1
  const containerWidth = container.clientWidth
  const containerHeight = 280
  canvas.width = containerWidth * dpr
  canvas.height = containerHeight * dpr
  canvas.style.width = `${containerWidth}px`
  canvas.style.height = `${containerHeight}px`
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.scale(dpr, dpr)

  const padding = { top: 20, right: 20, bottom: 50, left: 50 }
  const chartWidth = containerWidth - padding.left - padding.right
  const chartHeight = containerHeight - padding.top - padding.bottom

  const maxCount = Math.max(
    ...trends.map(t => Math.max(t.clients, t.sales, t.losses)),
    1
  )
  const paddedMax = Math.max(maxCount * 1.15, 5)
  const numMonths = trends.length
  const groupWidth = chartWidth / numMonths
  const barGap = 6
  const barsPerGroup = 3
  const barWidth = (groupWidth - barGap * (barsPerGroup - 1)) / barsPerGroup

  ctx.clearRect(0, 0, containerWidth, containerHeight)

  // Grid horizontal
  ctx.strokeStyle = '#eceff1'
  ctx.lineWidth = 1
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (chartHeight / 5) * i
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(containerWidth - padding.right, y)
    ctx.stroke()
  }

  // Eixos
  ctx.strokeStyle = '#90a4ae'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(padding.left, padding.top)
  ctx.lineTo(padding.left, containerHeight - padding.bottom)
  ctx.lineTo(containerWidth - padding.right, containerHeight - padding.bottom)
  ctx.stroke()

  // Labels do eixo Y
  ctx.fillStyle = '#546e7a'
  ctx.font = '12px Roboto, sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  for (let i = 0; i <= 5; i++) {
    const value = Math.round((paddedMax / 5) * (5 - i))
    const y = padding.top + (chartHeight / 5) * i
    ctx.fillText(value.toString(), padding.left - 8, y)
  }

  // Cores das barras
  const colors = {
    clients: '#1976d2',
    sales: '#2e7d32',
    losses: '#c62828',
  }

  // Desenhar barras agrupadas
  trends.forEach((trend, monthIndex) => {
    const groupCenter = padding.left + (monthIndex + 0.5) * groupWidth
    const barStartX = groupCenter - groupWidth / 2 + barGap / 2

    const datasets = [
      { value: trend.clients, color: colors.clients },
      { value: trend.sales, color: colors.sales },
      { value: trend.losses, color: colors.losses },
    ]

    datasets.forEach((ds, barIndex) => {
      const x = barStartX + barIndex * (barWidth + barGap)
      const barHeight = (ds.value / paddedMax) * chartHeight
      const y = containerHeight - padding.bottom - barHeight

      ctx.fillStyle = ds.color
      ctx.fillRect(x, y, barWidth, barHeight)

      // Valor acima da barra
      if (ds.value > 0) {
        ctx.fillStyle = '#37474f'
        ctx.font = '11px Roboto, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(ds.value.toString(), x + barWidth / 2, y - 6)
      }
    })
  })

  // Labels dos meses
  ctx.fillStyle = '#546e7a'
  ctx.font = '13px Roboto, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  trends.forEach((trend, index) => {
    const x = padding.left + (index + 0.5) * groupWidth
    ctx.fillText(trend.month, x, containerHeight - padding.bottom + 12)
  })
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(value)
}

const parseRevenue = (value: unknown): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  const s = String(value).replace(',', '.').replace(/[^\d.-]/g, '')
  const n = parseFloat(s)
  return Number.isNaN(n) ? 0 : n
}

const getRevenueItemClass = (revenue: unknown): string => {
  const r = parseRevenue(revenue)
  if (r > 0) return 'evolution-revenue-positive'
  if (r < 0) return 'evolution-revenue-negative'
  return 'evolution-revenue-zero'
}

const revenueCarouselItems = computed(() => {
  const trends = metrics.value?.monthly_trends || []
  return [...trends, ...trends]
})

const getSourceLabel = (source: string): string => {
  const labels: Record<string, string> = {
    WHATSAPP: 'WhatsApp',
    SITE: 'Site',
    PHONE: 'Telefone',
  }
  return labels[source] || source
}

const getSourceIcon = (source: string): string => {
  const icons: Record<string, string> = {
    WHATSAPP: 'mdi-whatsapp',
    SITE: 'mdi-web',
    PHONE: 'mdi-phone',
  }
  return icons[source] || 'mdi-help-circle'
}

const getSourceColor = (source: string): string => {
  const colors: Record<string, string> = {
    WHATSAPP: 'success',
    SITE: 'primary',
    PHONE: 'info',
  }
  return colors[source] || 'grey'
}

const getSourcePercentage = (_source: string, count: number): number => {
  if (!metrics.value) return 0
  const total = Object.values(metrics.value.clients_by_source).reduce((a, b) => a + b, 0)
  return total > 0 ? (count / total) * 100 : 0
}

const getStatusLabel = (status: string | null): string => {
  if (!status) return 'Sem status'
  const labels: Record<string, string> = {
    NEW_LEAD: 'Novo Lead',
    CONTACTED: 'Contatado',
    QUALIFIED: 'Qualificado',
    VISIT_SCHEDULED: 'Visita Agendada',
    VISITING: 'Em Visita',
    PROPOSAL_SENT: 'Proposta Enviada',
    NEGOTIATING: 'Negociando',
    WON: 'Ganho',
    LOST: 'Perdido',
    INACTIVE: 'Inativo',
  }
  return labels[status] || status
}

const getStatusColor = (status: string | null): string => {
  if (!status) return 'grey'
  const colors: Record<string, string> = {
    NEW_LEAD: 'grey',
    CONTACTED: 'blue',
    QUALIFIED: 'cyan',
    VISIT_SCHEDULED: 'teal',
    VISITING: 'green',
    PROPOSAL_SENT: 'orange',
    NEGOTIATING: 'deep-orange',
    WON: 'success',
    LOST: 'error',
    INACTIVE: 'grey',
  }
  return colors[status] || 'grey'
}

const getUrgencyLabel = (urgency: string | null): string => {
  if (!urgency) return 'Baixa'
  const labels: Record<string, string> = {
    LOW: 'Baixa',
    MEDIUM: 'Média',
    HIGH: 'Alta',
    IMMEDIATE: 'Imediata',
  }
  return labels[urgency] || urgency
}

const getDaysSinceContact = (lastContact: string | null): number | null => {
  if (!lastContact) return null
  const last = new Date(lastContact)
  const now = new Date()
  const diff = now.getTime() - last.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

const getContactStatusText = (lastContact: string | null): string => {
  const days = getDaysSinceContact(lastContact)
  if (days === null) return 'Ainda à espera do primeiro contato'
  return `Sem contato há ${days} dias`
}

const getInitials = (name: string): string => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const formatConversionRate = (rate: number): string => {
  return `${Math.round(rate)}%`
}

const getConversionColor = (rate: number): string => {
  if (rate >= 30) return 'success'
  if (rate >= 15) return 'warning'
  return 'error'
}

// Resize handler
let resizeHandler: (() => void) | null = null

// Lifecycle
onMounted(() => {
  loadDashboard()
  
  // Redraw chart on window resize
  resizeHandler = () => {
    if (metrics.value) {
      setTimeout(() => {
        drawEvolutionChart()
      }, 100)
    }
  }
  
  window.addEventListener('resize', resizeHandler)
})

onUnmounted(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
})
</script>

<style scoped>
.dashboard-page {
  padding: 16px;
  max-width: 1600px;
  margin: 0 auto;
}

.metric-card {
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
}

.metric-card-primary {
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.metric-card-success {
  border-left: 4px solid rgb(var(--v-theme-success));
}

.metric-card-info {
  border-left: 4px solid rgb(var(--v-theme-info));
}

.metric-card-warning {
  border-left: 4px solid rgb(var(--v-theme-warning));
}

.funnel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.funnel-stage {
  transition: all 0.3s;
}

.funnel-stage-content {
  border-radius: 8px;
  padding: 0;
  margin: 0 auto;
  min-height: 60px;
}

.funnel-grey {
  background: linear-gradient(135deg, rgba(158, 158, 158, 0.1), rgba(158, 158, 158, 0.05));
  border-left: 4px solid #9e9e9e;
}

.funnel-blue {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.05));
  border-left: 4px solid #2196f3;
}

.funnel-cyan {
  background: linear-gradient(135deg, rgba(0, 188, 212, 0.1), rgba(0, 188, 212, 0.05));
  border-left: 4px solid #00bcd4;
}

.funnel-teal {
  background: linear-gradient(135deg, rgba(0, 150, 136, 0.1), rgba(0, 150, 136, 0.05));
  border-left: 4px solid #009688;
}

.funnel-green {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05));
  border-left: 4px solid #4caf50;
}

.funnel-orange {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 152, 0, 0.05));
  border-left: 4px solid #ff9800;
}

.funnel-deep-orange {
  background: linear-gradient(135deg, rgba(255, 87, 34, 0.1), rgba(255, 87, 34, 0.05));
  border-left: 4px solid #ff5722;
}

.funnel-success {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.1));
  border-left: 4px solid #4caf50;
}

.funnel-error {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(244, 67, 54, 0.05));
  border-left: 4px solid #f44336;
}

.evolution-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 12px 16px;
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
}

.evolution-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
}

.evolution-legend-color {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  flex-shrink: 0;
}

.evolution-revenue-section {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.evolution-revenue-carousel {
  overflow: hidden;
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 5%,
    black 95%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 5%,
    black 95%,
    transparent 100%
  );
}

.evolution-revenue-track {
  display: flex;
  gap: 12px;
  width: max-content;
  animation: evolution-revenue-scroll 25s linear infinite;
}

.evolution-revenue-track:hover {
  animation-play-state: paused;
}

@keyframes evolution-revenue-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.evolution-revenue-item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  min-width: 140px;
}

.evolution-revenue-item.evolution-revenue-positive {
  background: rgba(46, 125, 50, 0.18) !important;
  border-left: 4px solid #2e7d32 !important;
}

.evolution-revenue-item.evolution-revenue-zero {
  background: rgba(158, 158, 158, 0.08) !important;
  border-left: 4px solid rgba(158, 158, 158, 0.35) !important;
}

.evolution-revenue-item.evolution-revenue-negative {
  background: rgba(198, 40, 40, 0.15) !important;
  border-left: 4px solid #c62828 !important;
}

.evolution-revenue-month {
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface));
  font-weight: 500;
  white-space: nowrap;
}

.evolution-revenue-value {
  font-weight: 700;
  font-size: 14px;
  white-space: nowrap;
}

.evolution-revenue-item.evolution-revenue-positive .evolution-revenue-value {
  color: #1b5e20 !important;
}

.evolution-revenue-item.evolution-revenue-zero .evolution-revenue-value {
  color: rgba(0, 0, 0, 0.6) !important;
}

.evolution-revenue-item.evolution-revenue-negative .evolution-revenue-value {
  color: #b71c1c !important;
}

.chart-container {
  position: relative;
  width: 100%;
  min-height: 280px;
  overflow: visible;
  background: #ffffff;
  border-radius: 8px;
}

.chart-container canvas {
  width: 100% !important;
  height: 280px !important;
  display: block;
}

.source-distribution {
  padding: 8px 0;
}

.source-item {
  padding: 8px 0;
}

.insights-list {
  max-height: 400px;
  overflow-y: auto;
}

.insight-item {
  padding: 8px;
  border-radius: 8px;
  background: rgba(var(--v-theme-info), 0.05);
}

/* Broker Performance card - ensure full names are visible */
.broker-performance-card .broker-table {
  min-width: 100%;
}

.broker-performance-card .broker-name-col {
  min-width: 200px;
  max-width: 320px;
  white-space: normal;
  word-break: break-word;
  padding-right: 16px !important;
}

.broker-performance-card .text-wrap {
  overflow-wrap: break-word;
}

/* Conversion percentage - ensure it fits inside the circle */
.broker-performance-card .conversion-cell {
  min-width: 56px;
  padding: 8px 12px !important;
}

.broker-performance-card .conversion-value {
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  display: inline-block;
}
</style>
