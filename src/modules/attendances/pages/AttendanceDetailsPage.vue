<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="d-flex justify-center align-center" style="min-height: 400px">
      <v-skeleton-loader type="card" width="100%"></v-skeleton-loader>
    </div>

    <!-- Error State -->
    <v-card v-else-if="error" elevation="2" class="ma-4">
      <v-card-text class="text-center pa-8">
        <v-icon color="error" size="64" class="mb-4">mdi-alert-circle</v-icon>
        <div class="text-h6 mb-2">Erro ao carregar atendimento</div>
        <div class="text-body-2 text-medium-emphasis mb-4">{{ error }}</div>
        <v-btn color="primary" @click="loadAttendance">Tentar novamente</v-btn>
      </v-card-text>
    </v-card>

    <!-- Content -->
    <div v-else-if="attendance">
      <!-- Header Card -->
      <v-card elevation="2" class="mb-4" rounded="lg">
        <v-card-title class="d-flex align-center pa-4">
          <v-btn icon variant="text" class="mr-2" @click="goBack">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-icon class="mr-3" :color="getChannelColor(attendance.channel)" size="32">
            {{ getChannelIcon(attendance.channel) }}
          </v-icon>
          <div class="flex-grow-1">
            <div class="text-h5 font-weight-bold">Detalhes do Atendimento</div>
            <div class="text-caption text-medium-emphasis">
              {{ formatDateTime(attendance.started_at) }}
            </div>
          </div>
          <v-spacer></v-spacer>
          <div class="d-flex flex-column align-end ga-2 mr-4">
            <!-- Status -->
            <v-chip
              :color="getStatusColor(attendance.status)"
              variant="flat"
              size="large"
            >
              <v-icon start size="18">{{ getStatusIcon(attendance.status) }}</v-icon>
              {{ getStatusLabel(attendance.status) }}
            </v-chip>
            <!-- Channel -->
            <v-chip
              :color="getChannelColor(attendance.channel)"
              variant="outlined"
              size="small"
            >
              <v-icon start size="16">{{ getChannelIcon(attendance.channel) }}</v-icon>
              {{ getChannelLabel(attendance.channel) }}
            </v-chip>
          </div>
          <!-- Action Buttons -->
          <div class="d-flex ga-2">
            <!-- Complete Button -->
            <v-btn
              v-if="attendance.status !== 'COMPLETED'"
              color="success"
              prepend-icon="mdi-check-circle"
              @click="handleCompleteAttendance"
              :loading="isCompleting"
            >
              Marcar como Concluído
            </v-btn>
            <!-- Edit Button -->
            <v-btn
              color="primary"
              prepend-icon="mdi-pencil"
              @click="handleEdit"
              :loading="isDeleting"
            >
              Editar
            </v-btn>
            <!-- Delete Button -->
            <v-btn
              color="error"
              prepend-icon="mdi-delete"
              @click="showDeleteDialog = true"
              :loading="isDeleting"
            >
              Excluir
            </v-btn>
          </div>
        </v-card-title>

        <!-- Duration -->
        <v-card-subtitle v-if="attendance.duration" class="pa-4 pt-0">
          <div class="d-flex align-center ga-2">
            <v-icon size="18">mdi-clock-outline</v-icon>
            <span class="text-body-2 font-weight-medium">
              Duração: {{ formatDuration(attendance.duration) }}
            </span>
            <span v-if="attendance.ended_at" class="text-caption text-medium-emphasis">
              ({{ formatDateTime(attendance.ended_at) }})
            </span>
          </div>
        </v-card-subtitle>
      </v-card>

      <!-- Main Content -->
      <v-row>
        <!-- Left Column - Main Info -->
        <v-col cols="12" md="8">
          <!-- Raw Content -->
          <v-card elevation="2" class="mb-4" rounded="lg">
            <v-card-title class="pa-4">
              <v-icon class="mr-2">mdi-text</v-icon>
              Conteúdo do Atendimento
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="text-body-1" style="white-space: pre-wrap; word-wrap: break-word;">
                {{ attendance.raw_content }}
              </div>
            </v-card-text>
          </v-card>

          <!-- AI Insights Section -->
          <v-card elevation="2" class="mb-4" rounded="lg">
            <v-card-title class="pa-4 d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-robot</v-icon>
              <span>Insights da IA</span>
              <v-spacer></v-spacer>
              <!-- Processing Status Badge -->
              <v-chip
                v-if="aiSummary"
                :color="getAIStatusColor(aiSummary.status)"
                variant="flat"
                size="small"
              >
                <v-icon start size="16">{{ getAIStatusIcon(aiSummary.status) }}</v-icon>
                {{ getAIStatusLabel(aiSummary.status) }}
              </v-chip>
            </v-card-title>

            <!-- Loading AI Summary -->
            <v-card-text v-if="isLoadingAISummary" class="pa-4">
              <v-skeleton-loader type="paragraph"></v-skeleton-loader>
            </v-card-text>

            <!-- AI Summary Content -->
            <div v-else-if="aiSummary && aiSummary.status === 'COMPLETED'">
              <!-- AI Summary Text -->
              <v-card-text v-if="aiSummary.summary_text" class="pa-4 pt-0">
                <div 
                  class="text-body-1 mb-4 markdown-content" 
                  v-html="formatMarkdown(aiSummary.summary_text)"
                ></div>
              </v-card-text>

              <!-- AI Analysis Cards -->
              <v-card-text class="pa-4 pt-0">
                <v-row dense>
                  <!-- Sentiment -->
                  <v-col cols="12" sm="6" md="3" v-if="aiSummary.sentiment">
                    <v-card variant="outlined" class="text-center pa-3">
                      <v-icon
                        :color="getSentimentColor(aiSummary.sentiment)"
                        size="32"
                        class="mb-2"
                      >
                        {{ getSentimentIcon(aiSummary.sentiment) }}
                      </v-icon>
                      <div class="text-caption text-medium-emphasis mb-1">Sentimento</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ getSentimentLabel(aiSummary.sentiment) }}
                      </div>
                    </v-card>
                  </v-col>

                  <!-- Detected Intent -->
                  <v-col cols="12" sm="6" md="3" v-if="aiSummary.detected_intent">
                    <v-card variant="outlined" class="text-center pa-3">
                      <v-icon color="info" size="32" class="mb-2">mdi-lightbulb-on</v-icon>
                      <div class="text-caption text-medium-emphasis mb-1">Intenção</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ getIntentLabel(aiSummary.detected_intent) }}
                      </div>
                    </v-card>
                  </v-col>

                  <!-- Urgency Level -->
                  <v-col cols="12" sm="6" md="3" v-if="aiSummary.urgency_level_detected">
                    <v-card variant="outlined" class="text-center pa-3">
                      <v-icon
                        :color="getUrgencyColor(aiSummary.urgency_level_detected)"
                        size="32"
                        class="mb-2"
                      >
                        mdi-alert-circle
                      </v-icon>
                      <div class="text-caption text-medium-emphasis mb-1">Urgência</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ getUrgencyLabel(aiSummary.urgency_level_detected) }}
                      </div>
                    </v-card>
                  </v-col>

                  <!-- Lead Score -->
                  <v-col cols="12" sm="6" md="3" v-if="aiSummary.lead_score_suggested !== null">
                    <v-card variant="outlined" class="text-center pa-3">
                      <v-icon color="primary" size="32" class="mb-2">mdi-star</v-icon>
                      <div class="text-caption text-medium-emphasis mb-1">Lead Score</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ aiSummary.lead_score_suggested }}/100
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>

              <!-- Detected Preferences -->
              <v-card-text
                v-if="aiSummary.interest_type_detected || aiSummary.budget_min_detected || aiSummary.budget_max_detected"
                class="pa-4 pt-0"
              >
                <v-expansion-panels variant="accordion" class="mb-2">
                  <v-expansion-panel>
                    <v-expansion-panel-title>
                      <v-icon class="mr-2">mdi-information</v-icon>
                      Preferências Detectadas
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-list density="compact">
                        <v-list-item v-if="aiSummary.interest_type_detected">
                          <template #prepend>
                            <v-icon>mdi-hand-pointing-right</v-icon>
                          </template>
                          <v-list-item-title>Tipo de Interesse</v-list-item-title>
                          <v-list-item-subtitle>
                            {{ getInterestTypeLabel(aiSummary.interest_type_detected) }}
                          </v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item
                          v-if="aiSummary.budget_min_detected || aiSummary.budget_max_detected"
                        >
                          <template #prepend>
                            <v-icon>mdi-currency-usd</v-icon>
                          </template>
                          <v-list-item-title>Orçamento</v-list-item-title>
                          <v-list-item-subtitle>
                            {{
                              formatBudgetRange(
                                aiSummary.budget_min_detected,
                                aiSummary.budget_max_detected
                              )
                            }}
                          </v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item
                          v-if="aiSummary.key_points?.city"
                        >
                          <template #prepend>
                            <v-icon>mdi-map-marker</v-icon>
                          </template>
                          <v-list-item-title>Cidade de Interesse</v-list-item-title>
                          <v-list-item-subtitle>{{ aiSummary.key_points.city }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item
                          v-if="aiSummary.key_points?.property_type"
                        >
                          <template #prepend>
                            <v-icon>mdi-home</v-icon>
                          </template>
                          <v-list-item-title>Tipo de Propriedade</v-list-item-title>
                          <v-list-item-subtitle>
                            {{ getPropertyTypeLabel(aiSummary.key_points.property_type) }}
                          </v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-card-text>

              <!-- Recommended Properties -->
              <v-card-text
                v-if="aiSummary.recommended_properties && aiSummary.recommended_properties.length > 0"
                class="pa-4 pt-0"
              >
                <div class="text-subtitle-1 font-weight-medium mb-3">
                  <v-icon class="mr-2" color="success">mdi-home-heart</v-icon>
                  Propriedades Recomendadas ({{ aiSummary.recommended_properties.length }})
                </div>
                <v-row dense>
                  <v-col
                    v-for="propertyId in aiSummary.recommended_properties"
                    :key="propertyId"
                    cols="12"
                    sm="6"
                  >
                    <v-card
                      v-if="recommendedPropertiesMap[propertyId]"
                      variant="outlined"
                      class="h-100"
                      @click="goToRecommendedProperty(propertyId)"
                      style="cursor: pointer"
                    >
                      <v-card-text class="pa-3">
                        <div class="d-flex align-center">
                          <v-avatar
                            v-if="recommendedPropertiesMap[propertyId].main_image_url"
                            size="56"
                            class="mr-3"
                            rounded="lg"
                          >
                            <v-img
                              :src="recommendedPropertiesMap[propertyId].main_image_url"
                              cover
                            ></v-img>
                          </v-avatar>
                          <v-avatar
                            v-else
                            color="primary"
                            size="56"
                            class="mr-3"
                            rounded="lg"
                          >
                            <v-icon color="white">mdi-home</v-icon>
                          </v-avatar>
                          <div class="flex-grow-1">
                            <div class="text-body-2 font-weight-medium mb-1">
                              {{ recommendedPropertiesMap[propertyId].title }}
                            </div>
                            <div class="text-caption text-medium-emphasis mb-1">
                              {{ recommendedPropertiesMap[propertyId].code }}
                            </div>
                            <v-chip
                              :color="getPropertyStatusColor(recommendedPropertiesMap[propertyId].status)"
                              variant="flat"
                              size="x-small"
                            >
                              {{ getPropertyStatusLabel(recommendedPropertiesMap[propertyId].status) }}
                            </v-chip>
                          </div>
                          <v-icon color="primary">mdi-chevron-right</v-icon>
                        </div>
                      </v-card-text>
                    </v-card>
                    <v-skeleton-loader
                      v-else
                      type="card"
                      class="h-100"
                    ></v-skeleton-loader>
                  </v-col>
                </v-row>
              </v-card-text>

              <!-- AI Next Steps -->
              <v-card-text v-if="attendance.ai_next_steps" class="pa-4 pt-0">
                <v-alert
                  type="info"
                  variant="tonal"
                  density="comfortable"
                  class="mb-0"
                >
                  <template #prepend>
                    <v-icon>mdi-arrow-right-circle</v-icon>
                  </template>
                  <div class="text-subtitle-2 font-weight-medium mb-2">Próximos Passos Sugeridos</div>
                  <div class="text-body-2 ai-next-steps-content" v-html="formatAINextSteps(attendance.ai_next_steps)"></div>
                </v-alert>
              </v-card-text>
            </div>

            <!-- Processing State -->
            <v-card-text
              v-else-if="aiSummary && aiSummary.status === 'PROCESSING'"
              class="text-center pa-8"
            >
              <v-progress-circular indeterminate color="primary" size="64" class="mb-4"></v-progress-circular>
              <div class="text-body-1 font-weight-medium mb-2">Processando análise da IA...</div>
              <div class="text-caption text-medium-emphasis">
                Isso pode levar alguns segundos
              </div>
            </v-card-text>

            <!-- Pending State -->
            <v-card-text
              v-else-if="aiSummary && aiSummary.status === 'PENDING'"
              class="text-center pa-8"
            >
              <v-icon color="warning" size="64" class="mb-4">mdi-clock-outline</v-icon>
              <div class="text-body-1 font-weight-medium mb-2">Aguardando processamento</div>
              <div class="text-caption text-medium-emphasis">
                O resumo da IA será gerado em breve
              </div>
            </v-card-text>

            <!-- Failed State -->
            <v-card-text
              v-else-if="aiSummary && aiSummary.status === 'FAILED'"
              class="text-center pa-8"
            >
              <v-icon color="error" size="64" class="mb-4">mdi-alert-circle</v-icon>
              <div class="text-body-1 font-weight-medium mb-2">Erro ao processar</div>
              <div class="text-caption text-medium-emphasis mb-4">
                {{ aiSummary.error_message || 'Erro desconhecido ao gerar resumo da IA' }}
              </div>
              <v-btn color="primary" size="small" @click="loadAISummary">
                Tentar novamente
              </v-btn>
            </v-card-text>

            <!-- Empty State -->
            <v-card-text
              v-else-if="!aiSummary && attendance.status === 'COMPLETED'"
              class="text-center pa-8"
            >
              <v-icon color="grey" size="64" class="mb-4">mdi-robot-outline</v-icon>
              <div class="text-body-1 text-medium-emphasis mb-2">
                Resumo da IA ainda não foi gerado
              </div>
              <div class="text-caption text-medium-emphasis mb-4">
                O processamento será iniciado automaticamente
              </div>
              <v-btn color="primary" size="small" @click="loadAISummary">
                Verificar novamente
              </v-btn>
            </v-card-text>

            <!-- Not Completed State -->
            <v-card-text
              v-else-if="attendance.status !== 'COMPLETED'"
              class="text-center pa-8"
            >
              <v-icon color="info" size="64" class="mb-4">mdi-information</v-icon>
              <div class="text-body-1 text-medium-emphasis">
                Complete o atendimento para gerar o resumo da IA
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column - Related Info -->
        <v-col cols="12" md="4">
          <!-- Client Info -->
          <v-card elevation="2" class="mb-4" rounded="lg">
            <v-card-title class="pa-4">
              <v-icon class="mr-2">mdi-account</v-icon>
              Cliente
            </v-card-title>
            <v-card-text v-if="client" class="pa-4">
              <div class="d-flex align-center mb-3">
                <v-avatar color="primary" size="40" class="mr-3">
                  <span class="text-caption text-white">
                    {{ getInitials(client.name) }}
                  </span>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="text-body-1 font-weight-medium">{{ client.name }}</div>
                  <div v-if="client.phone" class="text-caption text-medium-emphasis">
                    {{ formatPhone(client.phone) }}
                  </div>
                  <div v-if="client.email" class="text-caption text-medium-emphasis">
                    {{ client.email }}
                  </div>
                </div>
              </div>
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                block
                prepend-icon="mdi-arrow-right"
                @click="goToClient"
              >
                Ver Detalhes do Cliente
              </v-btn>
            </v-card-text>
            <v-card-text v-else class="pa-4">
              <v-skeleton-loader type="list-item-avatar-two-line"></v-skeleton-loader>
            </v-card-text>
          </v-card>

          <!-- Property Info -->
          <v-card v-if="attendance.property_id" elevation="2" class="mb-4" rounded="lg">
            <v-card-title class="pa-4">
              <v-icon class="mr-2">mdi-home</v-icon>
              Propriedade Relacionada
            </v-card-title>
            <v-card-text v-if="property" class="pa-4">
              <div class="mb-3">
                <div class="text-body-1 font-weight-medium mb-1">{{ property.title }}</div>
                <div class="text-caption text-medium-emphasis mb-2">
                  {{ property.code }}
                </div>
                <v-chip
                  :color="getPropertyStatusColor(property.status)"
                  variant="flat"
                  size="small"
                  class="mb-2"
                >
                  {{ getPropertyStatusLabel(property.status) }}
                </v-chip>
              </div>
              <v-btn
                color="primary"
                variant="outlined"
                size="small"
                block
                prepend-icon="mdi-arrow-right"
                @click="goToProperty"
              >
                Ver Detalhes da Propriedade
              </v-btn>
            </v-card-text>
            <v-card-text v-else class="pa-4">
              <v-skeleton-loader type="list-item"></v-skeleton-loader>
            </v-card-text>
          </v-card>

          <!-- Scheduled Visit -->
          <v-card v-if="attendance.scheduled_visit_at" elevation="2" class="mb-4" rounded="lg">
            <v-card-title class="pa-4">
              <v-icon class="mr-2" color="warning">mdi-calendar-clock</v-icon>
              Visita Agendada
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="text-body-1 font-weight-medium mb-2">
                {{ formatDateTime(attendance.scheduled_visit_at) }}
              </div>
              <v-alert
                type="info"
                variant="tonal"
                density="compact"
                class="mt-2"
              >
                Visita agendada para esta data/hora
              </v-alert>
            </v-card-text>
          </v-card>

          <!-- Additional Info -->
          <v-card elevation="2" class="mb-4" rounded="lg">
            <v-card-title class="pa-4">
              <v-icon class="mr-2">mdi-information</v-icon>
              Informações Adicionais
            </v-card-title>
            <v-card-text class="pa-4">
              <v-list density="compact">
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-calendar-start</v-icon>
                  </template>
                  <v-list-item-title>Iniciado em</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDateTime(attendance.started_at) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="attendance.ended_at">
                  <template #prepend>
                    <v-icon>mdi-calendar-end</v-icon>
                  </template>
                  <v-list-item-title>Finalizado em</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDateTime(attendance.ended_at) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-calendar-plus</v-icon>
                  </template>
                  <v-list-item-title>Criado em</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDateTime(attendance.created_at) }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-calendar-edit</v-icon>
                  </template>
                  <v-list-item-title>Atualizado em</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDateTime(attendance.updated_at) }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="error" class="mr-3">mdi-alert-circle</v-icon>
          Confirmar Exclusão
        </v-card-title>
        <v-card-text>
          <div class="text-body-1 mb-4">
            Tem certeza que deseja excluir este atendimento?
          </div>
          <v-alert type="warning" variant="tonal" density="compact" class="mb-2">
            <div class="text-body-2">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita.
            </div>
          </v-alert>
          <v-alert type="error" variant="tonal" density="compact">
            <div class="text-body-2">
              <strong>Consequências:</strong>
              <ul class="mt-2 mb-0">
                <li>Todos os resumos e análises da IA relacionados serão excluídos permanentemente</li>
                <li>O histórico completo do atendimento será removido</li>
                <li>Nenhum dado poderá ser recuperado após a exclusão</li>
              </ul>
            </div>
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="showDeleteDialog = false"
            :disabled="isDeleting"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            prepend-icon="mdi-delete"
            @click="confirmDelete"
            :loading="isDeleting"
          >
            Excluir Permanentemente
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { attendancesService, type Attendance, type AttendanceChannel, type AttendanceStatus } from '@/shared/services/attendances.service'
import { clientsService, type Client } from '@/shared/services/clients.service'
import { propertiesService, type Property } from '@/shared/services/properties.service'
import { aiSummariesService, type AISummary, type Sentiment, type DetectedIntent } from '@/shared/services/aiSummaries.service'
import { formatPhone } from '@/shared/utils/masks'

const route = useRoute()
const router = useRouter()

// State
const isLoading = ref(true)
const isLoadingAISummary = ref(false)
const isCompleting = ref(false)
const isDeleting = ref(false)
const showDeleteDialog = ref(false)
const error = ref<string | null>(null)
const attendance = ref<Attendance | null>(null)
const client = ref<Client | null>(null)
const property = ref<Property | null>(null)
const aiSummary = ref<AISummary | null>(null)
const recommendedProperties = ref<Property[]>([])

// Load data
const loadAttendance = async () => {
  const attendanceId = route.params.id as string
  if (!attendanceId) {
    error.value = 'ID do atendimento não fornecido'
    isLoading.value = false
    return
  }

  isLoading.value = true
  error.value = null

  try {
    // Load attendance
    attendance.value = await attendancesService.getAttendanceById(attendanceId)

    // Load related data in parallel
    const [clientData, propertyData] = await Promise.allSettled([
      clientsService.getClientById(attendance.value.client_id),
      attendance.value.property_id
        ? propertiesService.getPropertyById(attendance.value.property_id)
        : Promise.resolve(null),
    ])

    if (clientData.status === 'fulfilled') {
      client.value = clientData.value
    }

    if (propertyData.status === 'fulfilled' && propertyData.value) {
      property.value = propertyData.value
    }

    // Load AI summary if attendance is completed
    if (attendance.value.status === 'COMPLETED') {
      await loadAISummary()
    }
  } catch (err: any) {
    console.error('Error loading attendance:', err)
    error.value = err.response?.data?.detail || err.message || 'Erro ao carregar atendimento'
  } finally {
    isLoading.value = false
  }
}

// Load AI Summary
const loadAISummary = async () => {
  if (!attendance.value) return

  isLoadingAISummary.value = true
  try {
    aiSummary.value = await aiSummariesService.getSummaryByAttendanceId(attendance.value.id)

    // Load recommended properties if available
    if (aiSummary.value?.recommended_properties && aiSummary.value.recommended_properties.length > 0) {
      await loadRecommendedProperties(aiSummary.value.recommended_properties)
    }
  } catch (err: any) {
    console.error('Error loading AI summary:', err)
    // Don't show error, just log it
  } finally {
    isLoadingAISummary.value = false
  }
}

// Load recommended properties
const loadRecommendedProperties = async (propertyIds: string[]) => {
  try {
    const propertiesPromises = propertyIds.map(id => 
      propertiesService.getPropertyById(id).catch(() => null)
    )
    const propertiesResults = await Promise.allSettled(propertiesPromises)
    
    recommendedProperties.value = propertiesResults
      .filter((result): result is PromiseFulfilledResult<Property> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value)
  } catch (err) {
    console.error('Error loading recommended properties:', err)
  }
}

// Computed map for recommended properties
const recommendedPropertiesMap = computed(() => {
  const map: Record<string, Property> = {}
  recommendedProperties.value.forEach(prop => {
    map[prop.id] = prop
  })
  return map
})

// Navigation
const goBack = () => {
  router.push({ name: 'attendances' })
}

const goToClient = () => {
  if (attendance.value?.client_id) {
    router.push({ name: 'clients-details', params: { id: attendance.value.client_id } })
  }
}

const goToProperty = () => {
  if (attendance.value?.property_id) {
    router.push({ name: 'properties-details', params: { id: attendance.value.property_id } })
  }
}

const goToRecommendedProperty = (propertyId: string) => {
  router.push({ name: 'properties-details', params: { id: propertyId } })
}

// Complete attendance
const handleCompleteAttendance = async () => {
  if (!attendance.value) return

  isCompleting.value = true
  try {
    // Update attendance status to COMPLETED
    // This will trigger AI processing on the backend
    const updatedAttendance = await attendancesService.updateAttendance(attendance.value.id, {
      status: 'COMPLETED',
      ended_at: attendance.value.ended_at || new Date().toISOString(),
    })

    attendance.value = updatedAttendance

    // Wait a bit and then load AI summary
    setTimeout(async () => {
      await loadAISummary()
      // Poll for AI summary if still processing
      if (aiSummary.value?.status === 'PROCESSING' || aiSummary.value?.status === 'PENDING') {
        pollAISummary()
      }
    }, 2000)
  } catch (err: any) {
    console.error('Error completing attendance:', err)
    error.value = err.response?.data?.detail || err.message || 'Erro ao completar atendimento'
  } finally {
    isCompleting.value = false
  }
}

// Poll AI summary until completed
const pollAISummary = async (maxAttempts = 10) => {
  let attempts = 0
  const pollInterval = setInterval(async () => {
    attempts++
    await loadAISummary()

    if (
      aiSummary.value?.status === 'COMPLETED' ||
      aiSummary.value?.status === 'FAILED' ||
      attempts >= maxAttempts
    ) {
      clearInterval(pollInterval)
    }
  }, 3000) // Poll every 3 seconds
}

// Formatting
const formatDateTime = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDuration = (seconds: number): string => {
  if (!seconds) return '0s'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

// Status helpers
const getStatusColor = (status: AttendanceStatus): string => {
  const colors: Record<AttendanceStatus, string> = {
    IN_PROGRESS: 'info',
    COMPLETED: 'success',
    CANCELLED: 'error',
    PAUSED: 'warning',
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status: AttendanceStatus): string => {
  const icons: Record<AttendanceStatus, string> = {
    IN_PROGRESS: 'mdi-clock-outline',
    COMPLETED: 'mdi-check-circle',
    CANCELLED: 'mdi-cancel',
    PAUSED: 'mdi-pause-circle',
  }
  return icons[status] || 'mdi-help-circle'
}

const getStatusLabel = (status: AttendanceStatus): string => {
  const labels: Record<AttendanceStatus, string> = {
    IN_PROGRESS: 'Em Andamento',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
    PAUSED: 'Pausado',
  }
  return labels[status] || status
}

// Channel helpers
const getChannelColor = (channel: AttendanceChannel): string => {
  const colors: Record<AttendanceChannel, string> = {
    WHATSAPP: 'success',
    SITE: 'primary',
    PHONE: 'info',
    EMAIL: 'warning',
    IN_PERSON: 'purple',
  }
  return colors[channel] || 'grey'
}

const getChannelIcon = (channel: AttendanceChannel): string => {
  const icons: Record<AttendanceChannel, string> = {
    WHATSAPP: 'mdi-whatsapp',
    SITE: 'mdi-web',
    PHONE: 'mdi-phone',
    EMAIL: 'mdi-email',
    IN_PERSON: 'mdi-account',
  }
  return icons[channel] || 'mdi-help-circle'
}

const getChannelLabel = (channel: AttendanceChannel): string => {
  const labels: Record<AttendanceChannel, string> = {
    WHATSAPP: 'WhatsApp',
    SITE: 'Site',
    PHONE: 'Telefone',
    EMAIL: 'E-mail',
    IN_PERSON: 'Presencial',
  }
  return labels[channel] || channel
}

// Property status helpers
const getPropertyStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    DRAFT: 'grey',
    PUBLISHED: 'success',
    SOLD: 'primary',
    RENTED: 'info',
    UNAVAILABLE: 'error',
  }
  return colors[status] || 'grey'
}

const getPropertyStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    DRAFT: 'Rascunho',
    PUBLISHED: 'Publicado',
    SOLD: 'Vendido',
    RENTED: 'Alugado',
    UNAVAILABLE: 'Indisponível',
  }
  return labels[status] || status
}

// AI Summary helpers
const getAIStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PENDING: 'warning',
    PROCESSING: 'info',
    COMPLETED: 'success',
    FAILED: 'error',
    REPROCESSING: 'info',
  }
  return colors[status] || 'grey'
}

const getAIStatusIcon = (status: string): string => {
  const icons: Record<string, string> = {
    PENDING: 'mdi-clock-outline',
    PROCESSING: 'mdi-loading',
    COMPLETED: 'mdi-check-circle',
    FAILED: 'mdi-alert-circle',
    REPROCESSING: 'mdi-refresh',
  }
  return icons[status] || 'mdi-help-circle'
}

const getAIStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PENDING: 'Pendente',
    PROCESSING: 'Processando',
    COMPLETED: 'Completo',
    FAILED: 'Falhou',
    REPROCESSING: 'Reprocessando',
  }
  return labels[status] || status
}

// Sentiment helpers
const getSentimentColor = (sentiment: Sentiment): string => {
  const colors: Record<Sentiment, string> = {
    POSITIVE: 'success',
    NEUTRAL: 'grey',
    NEGATIVE: 'error',
    MIXED: 'warning',
  }
  return colors[sentiment] || 'grey'
}

const getSentimentIcon = (sentiment: Sentiment): string => {
  const icons: Record<Sentiment, string> = {
    POSITIVE: 'mdi-emoticon-happy',
    NEUTRAL: 'mdi-emoticon-neutral',
    NEGATIVE: 'mdi-emoticon-sad',
    MIXED: 'mdi-emoticon-confused',
  }
  return icons[sentiment] || 'mdi-help-circle'
}

const getSentimentLabel = (sentiment: Sentiment): string => {
  const labels: Record<Sentiment, string> = {
    POSITIVE: 'Positivo',
    NEUTRAL: 'Neutro',
    NEGATIVE: 'Negativo',
    MIXED: 'Misto',
  }
  return labels[sentiment] || sentiment
}

// Intent helpers
const getIntentLabel = (intent: DetectedIntent): string => {
  const labels: Record<DetectedIntent, string> = {
    INFORMATION_REQUEST: 'Solicitação de Informação',
    PROPERTY_SEARCH: 'Busca de Propriedade',
    SCHEDULE_VISIT: 'Agendar Visita',
    PRICE_NEGOTIATION: 'Negociação de Preço',
    DOCUMENTATION_REQUEST: 'Solicitação de Documentação',
    GENERAL_INQUIRY: 'Consulta Geral',
    COMPLAINT: 'Reclamação',
    FOLLOW_UP: 'Follow-up',
  }
  return labels[intent] || intent
}

// Urgency helpers
const getUrgencyColor = (urgency: string): string => {
  const colors: Record<string, string> = {
    LOW: 'success',
    MEDIUM: 'warning',
    HIGH: 'error',
    IMMEDIATE: 'error',
  }
  return colors[urgency] || 'grey'
}

const getUrgencyLabel = (urgency: string): string => {
  const labels: Record<string, string> = {
    LOW: 'Baixa',
    MEDIUM: 'Média',
    HIGH: 'Alta',
    IMMEDIATE: 'Imediata',
  }
  return labels[urgency] || urgency
}

// Interest type helpers
const getInterestTypeLabel = (interestType: string): string => {
  const labels: Record<string, string> = {
    BUY: 'Comprar',
    RENT: 'Alugar',
    SELL: 'Vender',
    INVEST: 'Investir',
  }
  return labels[interestType] || interestType
}

// Property type helpers
const getPropertyTypeLabel = (propertyType: string): string => {
  const labels: Record<string, string> = {
    HOUSE: 'Casa',
    APARTMENT: 'Apartamento',
    LAND: 'Terreno',
    COMMERCIAL: 'Comercial',
    RURAL: 'Rural',
  }
  return labels[propertyType] || propertyType
}

// Budget formatting
const formatBudgetRange = (min: number | null, max: number | null): string => {
  if (min && max) {
    return `R$ ${formatCurrency(min)} - R$ ${formatCurrency(max)}`
  }
  if (min) {
    return `A partir de R$ ${formatCurrency(min)}`
  }
  if (max) {
    return `Até R$ ${formatCurrency(max)}`
  }
  return 'Não especificado'
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Edit attendance
const handleEdit = () => {
  if (attendance.value) {
    router.push({ name: 'attendances-edit', params: { id: attendance.value.id } })
  }
}

// Delete attendance
const confirmDelete = async () => {
  if (!attendance.value) return

  isDeleting.value = true
  try {
    await attendancesService.deleteAttendance(attendance.value.id)
    // Close dialog and navigate back to list
    showDeleteDialog.value = false
    router.push({ name: 'attendances' })
  } catch (err: any) {
    console.error('Error deleting attendance:', err)
    error.value = err.response?.data?.detail || err.message || 'Erro ao excluir atendimento'
    // Show error in dialog or as a snackbar
    // For now, we'll show an alert if deletion fails
    alert(error.value)
  } finally {
    isDeleting.value = false
  }
}

// Markdown formatting
const formatMarkdown = (text: string): string => {
  if (!text) return ''
  
  // Simple markdown parser for common formatting
  let html = text
  
  // Code blocks first (to avoid processing markdown inside code)
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="markdown-pre"><code>$1</code></pre>')
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
  
  // Italic (avoid conflicts with bold)
  html = html.replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  html = html.replace(/(?<!_)_(?!_)([^_]+?)(?<!_)_(?!_)/g, '<em>$1</em>')
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="markdown-code">$1</code>')
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  
  // Lists - process line by line
  const lines = html.split('\n')
  const processedLines: string[] = []
  let inList = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const unorderedMatch = line.match(/^[\*\-] (.+)$/)
    const orderedMatch = line.match(/^\d+\. (.+)$/)
    
    if (unorderedMatch || orderedMatch) {
      if (!inList) {
        processedLines.push('<ul>')
        inList = true
      }
      processedLines.push(`<li>${unorderedMatch ? unorderedMatch[1] : orderedMatch![1]}</li>`)
    } else {
      if (inList) {
        processedLines.push('</ul>')
        inList = false
      }
      processedLines.push(line)
    }
  }
  
  if (inList) {
    processedLines.push('</ul>')
  }
  
  html = processedLines.join('\n')
  
  // Line breaks - double newline becomes paragraph break
  html = html.replace(/\n\n+/g, '</p><p>')
  html = html.replace(/\n/g, '<br>')
  
  // Wrap in paragraph if not already wrapped
  if (!html.trim().startsWith('<')) {
    html = '<p>' + html + '</p>'
  }
  
  return html
}

// Translate and format AI next steps
const formatAINextSteps = (nextSteps: string): string => {
  if (!nextSteps) return ''
  
  // Translation maps for common English terms
  const translations: Record<string, string> = {
    // Interest types
    'BUY': 'Comprar',
    'RENT': 'Alugar',
    'SELL': 'Vender',
    'INVEST': 'Investir',
    // Urgency levels
    'LOW': 'Baixa',
    'MEDIUM': 'Média',
    'HIGH': 'Alta',
    'IMMEDIATE': 'Imediata',
    // Property types
    'HOUSE': 'Casa',
    'APARTMENT': 'Apartamento',
    'LAND': 'Terreno',
    'COMMERCIAL': 'Comercial',
    'RURAL': 'Rural',
    // Common English phrases
    'Interest type detected': 'Tipo de interesse detectado',
    'Tipo de interesse detectado': 'Tipo de interesse',
    'Urgency': 'Urgência',
    'Urgency level': 'Nível de urgência',
    'Property type': 'Tipo de imóvel',
    'Next steps': 'Próximos passos',
    'Recommendations': 'Recomendações',
    'Budget': 'Orçamento',
    'Location': 'Localização',
    'City': 'Cidade',
  }
  
  let formatted = nextSteps
  
  // Replace English terms with Portuguese
  Object.entries(translations).forEach(([en, pt]) => {
    // Replace exact matches (for values like BUY, LOW)
    formatted = formatted.replace(new RegExp(`:\\s*${en}\\b`, 'gi'), `: ${pt}`)
    // Replace phrase matches
    formatted = formatted.replace(new RegExp(`\\b${en}\\b`, 'g'), pt)
  })
  
  // Parse and filter lines to remove pure metadata
  const lines = formatted.split('\n')
  const filteredLines: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    
    // Skip lines that are just "Label: Value" with short values (metadata)
    if (trimmed.match(/^(Tipo de interesse|Urgência|Nível de urgência|Orçamento):\s*.{1,20}$/i)) {
      continue
    }
    
    filteredLines.push(trimmed)
  }
  
  // Format as HTML with proper styling
  if (filteredLines.length === 0) {
    return '<p class="text-medium-emphasis">Nenhum próximo passo específico definido.</p>'
  }
  
  const htmlLines = filteredLines.map(line => {
    // Check if it's a list item
    const listMatch = line.match(/^[-*•]\s*(.+)/)
    if (listMatch) {
      return `<li>${listMatch[1]}</li>`
    }
    const numberedMatch = line.match(/^\d+\.\s*(.+)/)
    if (numberedMatch) {
      return `<li>${numberedMatch[1]}</li>`
    }
    return `<p>${line}</p>`
  })
  
  // Wrap list items in ul
  let result = ''
  let inList = false
  
  for (const html of htmlLines) {
    if (html.startsWith('<li>')) {
      if (!inList) {
        result += '<ul class="ai-next-steps-list">'
        inList = true
      }
      result += html
    } else {
      if (inList) {
        result += '</ul>'
        inList = false
      }
      result += html
    }
  }
  
  if (inList) {
    result += '</ul>'
  }
  
  return result
}

onMounted(() => {
  loadAttendance()
})
</script>

<style scoped>
/* Markdown content styles */
.markdown-content {
  line-height: 1.6;
}

.markdown-content :deep(h1) {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1rem 0 0.5rem 0;
  color: inherit;
}

.markdown-content :deep(h2) {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0.875rem 0 0.5rem 0;
  color: inherit;
}

.markdown-content :deep(h3) {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0.75rem 0 0.5rem 0;
  color: inherit;
}

.markdown-content :deep(p) {
  margin: 0.5rem 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.markdown-content :deep(li) {
  margin: 0.25rem 0;
}

.markdown-content :deep(strong) {
  font-weight: 600;
  color: inherit;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(code) {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.75rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0.75rem 0;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.markdown-content :deep(a) {
  color: inherit;
  text-decoration: underline;
  opacity: 0.9;
}

.markdown-content :deep(a:hover) {
  opacity: 1;
}

/* AI Next Steps styles */
.ai-next-steps-content {
  line-height: 1.6;
}

.ai-next-steps-content :deep(.ai-next-steps-list) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  list-style-type: disc;
}

.ai-next-steps-content :deep(.ai-next-steps-list li) {
  margin: 0.375rem 0;
  padding-left: 0.25rem;
}

.ai-next-steps-content :deep(p) {
  margin: 0.25rem 0;
}

.ai-next-steps-content :deep(p:first-child) {
  margin-top: 0;
}

.ai-next-steps-content :deep(p:last-child) {
  margin-bottom: 0;
}
</style>

