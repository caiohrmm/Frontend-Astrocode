<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="d-flex justify-center align-center" style="min-height: 400px">
      <v-skeleton-loader type="card" width="100%"></v-skeleton-loader>
    </div>

    <!-- Content -->
    <div v-else-if="client">
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
          <v-avatar color="primary" size="48" class="mr-3">
            <span class="text-h6 text-white">
              {{ getInitials(client.name) }}
            </span>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h5 font-weight-bold">{{ client.name }}</div>
            <div v-if="client.email" class="text-caption text-medium-emphasis">
              {{ client.email }}
            </div>
            <div v-if="client.phone" class="text-caption text-medium-emphasis">
              {{ formatPhone(client.phone) }}
            </div>
          </div>
          <v-spacer></v-spacer>
          <div class="d-flex flex-column align-end ga-2">
            <!-- Status -->
            <v-chip
              v-if="client.current_status"
              :color="getStatusColor(client.current_status)"
              variant="flat"
              size="large"
            >
              <v-icon start size="18">{{ getStatusIcon(client.current_status) }}</v-icon>
              {{ getStatusLabel(client.current_status) }}
            </v-chip>
            <!-- Urgency -->
            <v-chip
              v-if="client.current_urgency_level"
              :color="getUrgencyColor(client.current_urgency_level)"
              variant="flat"
              size="small"
            >
              <v-icon start size="16">mdi-alert-circle</v-icon>
              {{ getUrgencyLabel(client.current_urgency_level) }}
            </v-chip>
          </div>
          <v-btn
            color="primary"
            prepend-icon="mdi-pencil"
            class="ml-4"
            @click="handleEditClick"
          >
            Editar
          </v-btn>
        </v-card-title>

        <!-- Lead Score -->
        <v-card-subtitle v-if="client.current_lead_score !== null" class="pa-4 pt-0">
          <div class="d-flex align-center ga-3">
            <span class="text-body-2 font-weight-medium">Lead Score:</span>
            <v-progress-linear
              :model-value="client.current_lead_score"
              :color="getLeadScoreColor(client.current_lead_score)"
              height="24"
              rounded
              style="flex: 1; max-width: 300px;"
            ></v-progress-linear>
            <span class="text-body-1 font-weight-bold">
              {{ client.current_lead_score }}/100
            </span>
          </div>
        </v-card-subtitle>
      </v-card>

      <!-- Tabs -->
      <v-card elevation="2" rounded="lg">
        <v-tabs
          v-model="activeTab"
          bg-color="primary"
          slider-color="white"
        >
          <v-tab value="overview">
            <v-icon start>mdi-account</v-icon>
            Visão Geral
          </v-tab>
          <v-tab value="attendances">
            <v-icon start>mdi-phone</v-icon>
            Atendimentos
          </v-tab>
          <v-tab value="insights">
            <v-icon start>mdi-robot</v-icon>
            Insights da IA
          </v-tab>
          <v-tab value="followup">
            <v-icon start>mdi-calendar-clock</v-icon>
            Follow-up
          </v-tab>
        </v-tabs>

        <v-card-text class="pa-6">
          <v-window v-model="activeTab">
            <!-- Tab 1: Visão Geral -->
            <v-window-item value="overview">
              <v-row>
                <!-- Status -->
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-flag</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Status</span>
                  </div>
                  <v-select
                    v-model="editableFields.current_status"
                    :items="statusOptions"
                    variant="outlined"
                    density="compact"
                    @update:model-value="handleFieldUpdate('current_status', $event)"
                  >
                    <template #item="{ item }">
                      <v-chip
                        :color="getStatusColor(item.value)"
                        variant="flat"
                        size="small"
                      >
                        {{ item.title }}
                      </v-chip>
                    </template>
                  </v-select>
                </v-col>

                <!-- Urgência -->
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-alert-circle</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Urgência</span>
                  </div>
                  <v-select
                    v-model="editableFields.current_urgency_level"
                    :items="urgencyOptions"
                    variant="outlined"
                    density="compact"
                    @update:model-value="handleFieldUpdate('current_urgency_level', $event)"
                  ></v-select>
                </v-col>

                <!-- Agente Responsável -->
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-account-tie</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Agente Responsável</span>
                  </div>
                  <v-select
                    v-model="editableFields.assigned_agent_id"
                    :items="agentOptions"
                    variant="outlined"
                    density="compact"
                    clearable
                    @update:model-value="handleFieldUpdate('assigned_agent_id', $event)"
                  ></v-select>
                </v-col>

                <!-- Tipo de Interesse -->
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-handshake</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Tipo de Interesse</span>
                  </div>
                  <v-select
                    v-model="editableFields.current_interest_type"
                    :items="interestTypeOptions"
                    variant="outlined"
                    density="compact"
                    clearable
                    @update:model-value="handleFieldUpdate('current_interest_type', $event)"
                  ></v-select>
                </v-col>

                <!-- Tipo de Imóvel -->
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-home-variant</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Tipo de Imóvel</span>
                  </div>
                  <v-select
                    v-model="editableFields.current_property_type"
                    :items="propertyTypeOptions"
                    variant="outlined"
                    density="compact"
                    clearable
                    @update:model-value="handleFieldUpdate('current_property_type', $event)"
                  ></v-select>
                </v-col>

                <!-- Cidade de Interesse -->
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-map-marker</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Cidade de Interesse</span>
                  </div>
                  <v-text-field
                    v-model="editableFields.current_city_interest"
                    variant="outlined"
                    density="compact"
                    @blur="handleFieldUpdate('current_city_interest', editableFields.current_city_interest)"
                  ></v-text-field>
                </v-col>

                <!-- Orçamento Mínimo -->
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-currency-usd</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Orçamento Mínimo</span>
                  </div>
                  <v-text-field
                    v-model="budgetMinFormatted"
                    @blur="handleBudgetMinUpdate"
                    variant="outlined"
                    density="compact"
                    prefix="R$"
                  ></v-text-field>
                </v-col>

                <!-- Orçamento Máximo -->
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-currency-usd-circle</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Orçamento Máximo</span>
                  </div>
                  <v-text-field
                    v-model="budgetMaxFormatted"
                    @blur="handleBudgetMaxUpdate"
                    variant="outlined"
                    density="compact"
                    prefix="R$"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Tab 2: Atendimentos -->
            <v-window-item value="attendances">
              <!-- Loading State -->
              <div v-if="isLoadingAttendances" class="d-flex justify-center pa-8">
                <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
              </div>

              <!-- Empty State -->
              <div v-else-if="clientAttendances.length === 0" class="text-center pa-8">
                <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-phone-off</v-icon>
                <div class="text-h6 text-medium-emphasis mb-2">Nenhum atendimento registrado</div>
                <div class="text-body-2 text-medium-emphasis mb-4">
                  Os atendimentos deste cliente aparecerão aqui quando forem criados.
                </div>
                <v-btn
                  color="primary"
                  prepend-icon="mdi-phone-plus"
                  @click="goToCreateAttendance"
                >
                  Criar Atendimento
                </v-btn>
              </div>

              <!-- Attendances List -->
              <div v-else>
                <div class="d-flex justify-space-between align-center mb-4">
                  <div class="text-h6">
                    {{ clientAttendances.length }} atendimento(s)
                  </div>
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-phone-plus"
                    @click="goToCreateAttendance"
                  >
                    Novo Atendimento
                  </v-btn>
                </div>

                <v-row>
                  <v-col
                    v-for="attendance in clientAttendances"
                    :key="attendance.id"
                    cols="12"
                  >
                    <v-card
                      variant="outlined"
                      class="attendance-card"
                      @click="goToAttendance(attendance.id)"
                    >
                      <v-card-text class="pa-4">
                        <div class="d-flex align-start">
                          <!-- Channel Icon -->
                          <v-avatar
                            :color="getChannelColor(attendance.channel)"
                            size="48"
                            class="mr-4"
                          >
                            <v-icon color="white">{{ getChannelIcon(attendance.channel) }}</v-icon>
                          </v-avatar>

                          <!-- Content -->
                          <div class="flex-grow-1">
                            <div class="d-flex align-center justify-space-between mb-2">
                              <div class="d-flex align-center ga-2">
                                <v-chip
                                  :color="getAttendanceStatusColor(attendance.status)"
                                  variant="flat"
                                  size="small"
                                >
                                  {{ getAttendanceStatusLabel(attendance.status) }}
                                </v-chip>
                                <v-chip
                                  variant="outlined"
                                  size="small"
                                >
                                  {{ getChannelLabel(attendance.channel) }}
                                </v-chip>
                              </div>
                              <div class="text-caption text-medium-emphasis">
                                {{ formatDateTime(attendance.started_at) }}
                              </div>
                            </div>

                            <!-- AI Summary Preview -->
                            <div v-if="attendance.ai_summary" class="mb-3">
                              <div class="text-subtitle-2 font-weight-medium mb-1">
                                <v-icon size="16" color="primary" class="mr-1">mdi-robot</v-icon>
                                Resumo da IA
                              </div>
                              <div 
                                class="text-body-2 ai-summary-preview"
                                v-html="formatMarkdown(truncateText(attendance.ai_summary, 200))"
                              ></div>
                            </div>

                            <!-- Next Steps Preview -->
                            <div v-if="attendance.ai_next_steps && hasValidNextSteps(attendance.ai_next_steps)" class="mb-2">
                              <div class="text-subtitle-2 font-weight-medium mb-1">
                                <v-icon size="16" color="success" class="mr-1">mdi-arrow-right-circle</v-icon>
                                Próximos Passos
                              </div>
                              <div 
                                class="text-body-2 ai-next-steps-preview"
                                v-html="formatMarkdown(truncateText(formatAINextSteps(attendance.ai_next_steps), 150))"
                              ></div>
                            </div>

                            <!-- Raw Content Preview (if no AI summary) -->
                            <div v-if="!attendance.ai_summary" class="text-body-2 text-medium-emphasis raw-content-preview">
                              {{ truncateText(attendance.raw_content, 200) }}
                            </div>

                            <!-- Duration -->
                            <div v-if="attendance.duration" class="text-caption text-medium-emphasis mt-2">
                              <v-icon size="14" class="mr-1">mdi-clock-outline</v-icon>
                              Duração: {{ formatDuration(attendance.duration) }}
                            </div>
                          </div>

                          <!-- Arrow -->
                          <v-icon color="grey" class="ml-2">mdi-chevron-right</v-icon>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-window-item>

            <!-- Tab 3: Insights da IA -->
            <v-window-item value="insights">
              <!-- Loading State -->
              <div v-if="isLoadingAIInsights" class="d-flex justify-center pa-8">
                <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
              </div>

              <!-- Content -->
              <div v-else>
                <v-row>
                  <!-- Resumo do Cliente -->
                  <v-col cols="12">
                    <v-card variant="outlined" class="mb-4">
                      <v-card-title class="d-flex align-center">
                        <v-icon class="mr-2" color="primary">mdi-account-circle</v-icon>
                        Resumo do Cliente
                        <v-spacer></v-spacer>
                        <v-chip
                          v-if="aiSummaries.length > 0"
                          color="primary"
                          variant="flat"
                          size="small"
                        >
                          {{ aiSummaries.length }} atendimento(s) analisado(s)
                        </v-chip>
                      </v-card-title>
                      <v-card-text>
                        <div v-if="aggregatedInsights.clientSummary" class="text-body-1 mb-4" v-html="formatMarkdown(aggregatedInsights.clientSummary)"></div>
                        <div v-else-if="client.summary_notes" class="text-body-1" v-html="formatMarkdown(client.summary_notes)"></div>
                        <v-alert v-else type="info" variant="tonal">
                          Nenhum resumo disponível. O resumo será gerado automaticamente pela IA com base nos atendimentos.
                        </v-alert>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <!-- Análise de Sentimento -->
                  <v-col cols="12" md="6">
                    <v-card variant="outlined" class="mb-4">
                      <v-card-title class="d-flex align-center">
                        <v-icon class="mr-2" color="primary">mdi-emoticon</v-icon>
                        Análise de Sentimento
                      </v-card-title>
                      <v-card-text>
                        <div v-if="aggregatedInsights.sentimentAnalysis" class="d-flex flex-column ga-3">
                          <div class="text-center">
                            <v-icon
                              :color="getSentimentColor(aggregatedInsights.sentimentAnalysis.dominant)"
                              size="64"
                              class="mb-2"
                            >
                              {{ getSentimentIcon(aggregatedInsights.sentimentAnalysis.dominant) }}
                            </v-icon>
                            <div class="text-h6 font-weight-bold mb-1">
                              {{ getSentimentLabel(aggregatedInsights.sentimentAnalysis.dominant) }}
                            </div>
                            <div class="text-caption text-medium-emphasis">
                              Sentimento predominante
                            </div>
                          </div>
                          <v-divider></v-divider>
                          <div class="d-flex flex-column ga-2">
                            <div
                              v-for="(count, sentiment) in aggregatedInsights.sentimentAnalysis.distribution"
                              :key="sentiment"
                              class="d-flex align-center justify-space-between"
                            >
                              <div class="d-flex align-center ga-2">
                                <v-icon
                                  :color="getSentimentColor(sentiment)"
                                  size="20"
                                >
                                  {{ getSentimentIcon(sentiment) }}
                                </v-icon>
                                <span class="text-body-2">{{ getSentimentLabel(sentiment) }}</span>
                              </div>
                              <v-chip size="small" variant="flat">
                                {{ count }}
                              </v-chip>
                            </div>
                          </div>
                        </div>
                        <v-alert v-else type="info" variant="tonal">
                          Análise de sentimento será gerada após os primeiros atendimentos serem processados.
                        </v-alert>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <!-- Intenções Detectadas -->
                  <v-col cols="12" md="6">
                    <v-card variant="outlined" class="mb-4">
                      <v-card-title class="d-flex align-center">
                        <v-icon class="mr-2" color="primary">mdi-lightbulb-on</v-icon>
                        Intenções Detectadas
                      </v-card-title>
                      <v-card-text>
                        <div v-if="aggregatedInsights.intents && aggregatedInsights.intents.length > 0" class="d-flex flex-column ga-2">
                          <v-chip
                            v-for="intent in aggregatedInsights.intents"
                            :key="intent.intent"
                            :color="getIntentColor(intent.intent)"
                            variant="flat"
                            class="mb-1"
                          >
                            <v-icon start size="16">{{ getIntentIcon(intent.intent) }}</v-icon>
                            {{ getIntentLabel(intent.intent) }}
                            <v-chip
                              size="x-small"
                              variant="text"
                              class="ml-2"
                            >
                              {{ intent.count }}x
                            </v-chip>
                          </v-chip>
                        </div>
                        <v-alert v-else type="info" variant="tonal">
                          Intenções serão detectadas após os atendimentos serem processados pela IA.
                        </v-alert>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <!-- Perfil de Interesse -->
                  <v-col cols="12" md="6">
                    <v-card variant="outlined" class="mb-4">
                      <v-card-title class="d-flex align-center">
                        <v-icon class="mr-2" color="primary">mdi-heart</v-icon>
                        Perfil de Interesse
                      </v-card-title>
                      <v-card-text>
                        <div v-if="hasInterestProfile" class="d-flex flex-column ga-3">
                          <div v-if="client.current_interest_type" class="d-flex align-center ga-2">
                            <v-icon color="primary">mdi-handshake</v-icon>
                            <div>
                              <div class="text-caption text-medium-emphasis">Tipo de Interesse</div>
                              <div class="text-body-1 font-weight-medium">
                                {{ getInterestTypeLabel(client.current_interest_type) }}
                              </div>
                            </div>
                          </div>
                          <div v-if="client.current_property_type" class="d-flex align-center ga-2">
                            <v-icon color="primary">mdi-home-variant</v-icon>
                            <div>
                              <div class="text-caption text-medium-emphasis">Tipo de Imóvel</div>
                              <div class="text-body-1 font-weight-medium">
                                {{ getPropertyTypeLabel(client.current_property_type) }}
                              </div>
                            </div>
                          </div>
                          <div v-if="client.current_city_interest" class="d-flex align-center ga-2">
                            <v-icon color="primary">mdi-map-marker</v-icon>
                            <div>
                              <div class="text-caption text-medium-emphasis">Cidade de Interesse</div>
                              <div class="text-body-1 font-weight-medium">
                                {{ client.current_city_interest }}
                              </div>
                            </div>
                          </div>
                          <div v-if="client.current_budget_min || client.current_budget_max" class="d-flex align-center ga-2">
                            <v-icon color="primary">mdi-currency-usd</v-icon>
                            <div>
                              <div class="text-caption text-medium-emphasis">Orçamento</div>
                              <div class="text-body-1 font-weight-medium">
                                {{ formatBudgetRange() }}
                              </div>
                            </div>
                          </div>
                        </div>
                        <v-alert v-else type="info" variant="tonal">
                          Perfil de interesse ainda não definido.
                        </v-alert>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <!-- Potencial de Conversão -->
                  <v-col cols="12" md="6">
                    <v-card variant="outlined" class="mb-4">
                      <v-card-title class="d-flex align-center">
                        <v-icon class="mr-2" color="primary">mdi-chart-line</v-icon>
                        Potencial de Conversão
                      </v-card-title>
                      <v-card-text>
                        <div v-if="client.current_lead_score !== null" class="d-flex flex-column ga-3">
                          <div>
                            <div class="text-caption text-medium-emphasis mb-2">Lead Score</div>
                            <v-progress-linear
                              :model-value="client.current_lead_score"
                              :color="getLeadScoreColor(client.current_lead_score)"
                              height="32"
                              rounded
                            ></v-progress-linear>
                            <div class="text-center mt-2">
                              <span class="text-h6 font-weight-bold">
                                {{ client.current_lead_score }}/100
                              </span>
                            </div>
                          </div>
                          <v-alert
                            :type="getLeadScoreAlertType(client.current_lead_score)"
                            variant="tonal"
                          >
                            {{ getLeadScoreMessage(client.current_lead_score) }}
                          </v-alert>
                          <div v-if="aggregatedInsights.averageLeadScore !== null" class="text-caption text-medium-emphasis">
                            Score médio sugerido pela IA: {{ aggregatedInsights.averageLeadScore }}/100
                          </div>
                        </div>
                        <v-alert v-else type="info" variant="tonal">
                          Lead score ainda não calculado.
                        </v-alert>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <!-- Propriedades Recomendadas pela IA -->
                  <v-col cols="12" v-if="recommendedProperties.length > 0">
                    <v-card variant="outlined" class="mb-4">
                      <v-card-title class="d-flex align-center">
                        <v-icon class="mr-2" color="success">mdi-home-heart</v-icon>
                        Propriedades Recomendadas pela IA
                        <v-spacer></v-spacer>
                        <v-chip color="success" variant="flat" size="small">
                          {{ recommendedProperties.length }} recomendada(s)
                        </v-chip>
                      </v-card-title>
                      <v-card-text>
                        <v-row dense>
                          <v-col
                            v-for="property in recommendedProperties"
                            :key="property.id"
                            cols="12"
                            sm="6"
                            md="4"
                          >
                            <v-card
                              variant="outlined"
                              class="h-100 property-card"
                              @click="goToProperty(property.id)"
                            >
                              <v-card-text class="pa-3">
                                <div class="d-flex align-center mb-2">
                                  <v-avatar
                                    v-if="property.main_image_url"
                                    size="56"
                                    class="mr-3"
                                    rounded="lg"
                                  >
                                    <v-img
                                      :src="property.main_image_url"
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
                                      {{ property.title }}
                                    </div>
                                    <div class="text-caption text-medium-emphasis">
                                      {{ property.code }}
                                    </div>
                                  </div>
                                </div>
                                <v-chip
                                  :color="getPropertyStatusColor(property.status)"
                                  variant="flat"
                                  size="x-small"
                                  class="mb-2"
                                >
                                  {{ getPropertyStatusLabel(property.status) }}
                                </v-chip>
                                <div class="text-caption text-medium-emphasis">
                                  <v-icon size="14" class="mr-1">mdi-map-marker</v-icon>
                                  {{ property.city }}, {{ property.state }}
                                </div>
                              </v-card-text>
                            </v-card>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <!-- Propriedades Baseadas no Perfil (quando não há recomendações da IA) -->
                  <v-col cols="12" v-else-if="profileBasedProperties.length > 0">
                    <v-card variant="outlined" class="mb-4">
                      <v-card-title class="d-flex align-center">
                        <v-icon class="mr-2" color="info">mdi-home-search</v-icon>
                        Propriedades que podem interessar
                        <v-spacer></v-spacer>
                        <v-chip color="info" variant="tonal" size="small">
                          Baseado no perfil
                        </v-chip>
                      </v-card-title>
                      <v-card-text>
                        <v-alert type="info" variant="tonal" class="mb-4" density="compact">
                          <v-icon start size="16">mdi-lightbulb</v-icon>
                          Estas propriedades foram selecionadas com base no perfil de interesse do cliente.
                          Conforme atendimentos forem processados, a IA fará recomendações mais precisas.
                        </v-alert>
                        <v-row dense>
                          <v-col
                            v-for="property in profileBasedProperties"
                            :key="property.id"
                            cols="12"
                            sm="6"
                            md="4"
                          >
                            <v-card
                              variant="outlined"
                              class="h-100 property-card"
                              @click="goToProperty(property.id)"
                            >
                              <v-card-text class="pa-3">
                                <div class="d-flex align-center mb-2">
                                  <v-avatar
                                    v-if="property.main_image_url"
                                    size="56"
                                    class="mr-3"
                                    rounded="lg"
                                  >
                                    <v-img
                                      :src="property.main_image_url"
                                      cover
                                    ></v-img>
                                  </v-avatar>
                                  <v-avatar
                                    v-else
                                    color="info"
                                    size="56"
                                    class="mr-3"
                                    rounded="lg"
                                  >
                                    <v-icon color="white">mdi-home</v-icon>
                                  </v-avatar>
                                  <div class="flex-grow-1">
                                    <div class="text-body-2 font-weight-medium mb-1">
                                      {{ property.title }}
                                    </div>
                                    <div class="text-caption text-medium-emphasis">
                                      {{ property.code }}
                                    </div>
                                  </div>
                                </div>
                                <v-chip
                                  :color="getPropertyStatusColor(property.status)"
                                  variant="flat"
                                  size="x-small"
                                  class="mb-2"
                                >
                                  {{ getPropertyStatusLabel(property.status) }}
                                </v-chip>
                                <div class="text-caption text-medium-emphasis">
                                  <v-icon size="14" class="mr-1">mdi-map-marker</v-icon>
                                  {{ property.city }}, {{ property.state }}
                                </div>
                              </v-card-text>
                            </v-card>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <!-- Mensagem quando não há propriedades -->
                  <v-col cols="12" v-else-if="hasInterestProfile">
                    <v-card variant="outlined" class="mb-4">
                      <v-card-title class="d-flex align-center">
                        <v-icon class="mr-2" color="grey">mdi-home-search</v-icon>
                        Propriedades Recomendadas
                      </v-card-title>
                      <v-card-text>
                        <v-alert type="info" variant="tonal">
                          <v-icon start>mdi-information</v-icon>
                          Nenhuma propriedade encontrada que corresponda ao perfil de interesse do cliente.
                          Cadastre mais propriedades ou ajuste o perfil de interesse.
                        </v-alert>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <!-- Histórico de Insights -->
                  <v-col cols="12" v-if="aiSummaries.length > 0">
                    <v-card variant="outlined" class="mb-4">
                      <v-card-title class="d-flex align-center">
                        <v-icon class="mr-2" color="primary">mdi-history</v-icon>
                        Histórico de Insights
                        <v-spacer></v-spacer>
                        <v-chip color="primary" variant="flat" size="small">
                          {{ aiSummaries.length }} análise(s)
                        </v-chip>
                      </v-card-title>
                      <v-card-text>
                        <v-expansion-panels variant="accordion">
                          <v-expansion-panel
                            v-for="summary in aiSummaries"
                            :key="summary.id"
                          >
                            <v-expansion-panel-title>
                              <div class="d-flex align-center w-100 pr-4">
                                <v-icon
                                  :color="getAIStatusColor(summary.status)"
                                  class="mr-3"
                                  size="24"
                                >
                                  {{ getAIStatusIcon(summary.status) }}
                                </v-icon>
                                <div class="flex-grow-1">
                                  <div class="d-flex align-center justify-space-between">
                                    <div class="text-body-2 font-weight-medium">
                                      {{ formatDateTime(summary.created_at) }}
                                    </div>
                                    <div class="d-flex align-center ga-1">
                                      <v-chip
                                        v-if="summary.sentiment"
                                        :color="getSentimentColor(summary.sentiment)"
                                        size="x-small"
                                        variant="flat"
                                      >
                                        <v-icon start size="12">{{ getSentimentIcon(summary.sentiment) }}</v-icon>
                                        {{ getSentimentLabel(summary.sentiment) }}
                                      </v-chip>
                                      <v-chip
                                        v-if="summary.lead_score_suggested"
                                        :color="getLeadScoreColor(summary.lead_score_suggested)"
                                        size="x-small"
                                        variant="flat"
                                      >
                                        Score: {{ summary.lead_score_suggested }}
                                      </v-chip>
                                    </div>
                                  </div>
                                  <div class="text-caption text-medium-emphasis mt-1">
                                    {{ truncateText(summary.summary_text.replace(/[#*_\-]/g, ''), 80) }}
                                  </div>
                                </div>
                              </div>
                            </v-expansion-panel-title>
                            <v-expansion-panel-text>
                              <!-- Summary Text with Markdown -->
                              <div class="mb-4">
                                <div class="text-subtitle-2 font-weight-medium mb-2 d-flex align-center">
                                  <v-icon size="16" color="primary" class="mr-1">mdi-text-box</v-icon>
                                  Resumo
                                </div>
                                <div 
                                  class="markdown-content ai-summary-content"
                                  v-html="formatMarkdown(summary.summary_text)"
                                ></div>
                              </div>

                              <!-- Key Points -->
                              <div v-if="summary.key_points && Object.keys(summary.key_points).length > 0" class="mb-4">
                                <div class="text-subtitle-2 font-weight-medium mb-2 d-flex align-center">
                                  <v-icon size="16" color="success" class="mr-1">mdi-format-list-bulleted</v-icon>
                                  Pontos-chave
                                </div>
                                <div class="d-flex flex-wrap ga-2">
                                  <template v-if="summary.key_points.topics">
                                    <v-chip
                                      v-for="topic in summary.key_points.topics"
                                      :key="topic"
                                      size="small"
                                      variant="tonal"
                                      color="primary"
                                    >
                                      {{ topic }}
                                    </v-chip>
                                  </template>
                                  <template v-if="summary.key_points.requirements">
                                    <v-chip
                                      v-for="req in summary.key_points.requirements"
                                      :key="req"
                                      size="small"
                                      variant="tonal"
                                      color="info"
                                    >
                                      {{ req }}
                                    </v-chip>
                                  </template>
                                </div>
                              </div>

                              <!-- AI Analysis -->
                              <div class="d-flex flex-wrap ga-2">
                                <v-chip
                                  v-if="summary.detected_intent"
                                  :color="getIntentColor(summary.detected_intent)"
                                  variant="flat"
                                  size="small"
                                >
                                  <v-icon start size="14">{{ getIntentIcon(summary.detected_intent) }}</v-icon>
                                  {{ getIntentLabel(summary.detected_intent) }}
                                </v-chip>
                                <v-chip
                                  v-if="summary.interest_type_detected"
                                  color="teal"
                                  variant="flat"
                                  size="small"
                                >
                                  <v-icon start size="14">mdi-handshake</v-icon>
                                  {{ getInterestTypeLabel(summary.interest_type_detected as InterestType) }}
                                </v-chip>
                                <v-chip
                                  v-if="summary.urgency_level_detected"
                                  :color="getUrgencyColor(summary.urgency_level_detected as UrgencyLevel)"
                                  variant="flat"
                                  size="small"
                                >
                                  <v-icon start size="14">mdi-alert-circle</v-icon>
                                  Urgência: {{ getUrgencyLabel(summary.urgency_level_detected as UrgencyLevel) }}
                                </v-chip>
                                <v-chip
                                  v-if="summary.budget_min_detected || summary.budget_max_detected"
                                  color="amber"
                                  variant="flat"
                                  size="small"
                                >
                                  <v-icon start size="14">mdi-currency-usd</v-icon>
                                  {{ formatBudgetDetected(summary.budget_min_detected, summary.budget_max_detected) }}
                                </v-chip>
                              </div>

                              <!-- Recommended Properties -->
                              <div v-if="summary.recommended_properties && summary.recommended_properties.length > 0" class="mt-4">
                                <div class="text-subtitle-2 font-weight-medium mb-2 d-flex align-center">
                                  <v-icon size="16" color="info" class="mr-1">mdi-home-search</v-icon>
                                  Propriedades Recomendadas
                                </div>
                                <div class="text-caption text-medium-emphasis">
                                  {{ summary.recommended_properties.length }} propriedade(s) sugerida(s)
                                </div>
                              </div>

                              <!-- Model Info -->
                              <div v-if="summary.model_used" class="mt-4 text-caption text-medium-emphasis">
                                <v-icon size="12" class="mr-1">mdi-robot</v-icon>
                                Modelo: {{ summary.model_used }} (v{{ summary.prompt_version }})
                                <span v-if="summary.confidence_score">
                                  • Confiança: {{ Math.round(summary.confidence_score * 100) }}%
                                </span>
                              </div>
                            </v-expansion-panel-text>
                          </v-expansion-panel>
                        </v-expansion-panels>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <!-- Sugestão de Próximos Passos -->
                  <v-col cols="12">
                    <v-card variant="outlined">
                      <v-card-title class="d-flex align-center">
                        <v-icon class="mr-2" color="primary">mdi-arrow-right-circle</v-icon>
                        Sugestão de Próximos Passos
                      </v-card-title>
                      <v-card-text>
                        <div v-if="aggregatedInsights.nextSteps && aggregatedInsights.nextSteps.length > 0">
                          <v-list density="comfortable">
                            <v-list-item
                              v-for="(step, index) in aggregatedInsights.nextSteps"
                              :key="index"
                            >
                              <template #prepend>
                                <v-avatar color="primary" size="32">
                                  <span class="text-white">{{ index + 1 }}</span>
                                </v-avatar>
                              </template>
                              <v-list-item-title>{{ step }}</v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </div>
                        <v-alert v-else type="info" variant="tonal">
                          As sugestões de próximos passos serão geradas automaticamente pela IA com base no histórico de atendimentos e perfil do cliente.
                        </v-alert>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-window-item>

            <!-- Tab 4: Follow-up -->
            <v-window-item value="followup">
              <v-row>
                <!-- Próximo Follow-up -->
                <v-col cols="12" md="6">
                  <v-card variant="outlined" class="mb-4">
                    <v-card-title class="d-flex align-center">
                      <v-icon class="mr-2" color="primary">mdi-calendar-clock</v-icon>
                      Próximo Follow-up
                    </v-card-title>
                    <v-card-text>
                      <div v-if="client.next_follow_up_at" class="d-flex flex-column ga-3">
                        <div>
                          <div class="text-h6 font-weight-bold">
                            {{ formatDateTime(client.next_follow_up_at) }}
                          </div>
                          <div
                            :class="getFollowUpClass(client.next_follow_up_at)"
                            class="text-caption font-weight-medium mt-2"
                          >
                            {{ getFollowUpStatus(client.next_follow_up_at) }}
                          </div>
                        </div>
                        <v-btn
                          color="primary"
                          prepend-icon="mdi-calendar-plus"
                          @click="showScheduleDialog = true"
                        >
                          Reagendar
                        </v-btn>
                      </div>
                      <div v-else class="d-flex flex-column ga-3">
                        <v-alert type="warning" variant="tonal">
                          Nenhum follow-up agendado.
                        </v-alert>
                        <v-btn
                          color="primary"
                          prepend-icon="mdi-calendar-plus"
                          @click="showScheduleDialog = true"
                        >
                          Agendar Próximo Contato
                        </v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Histórico de Contatos -->
                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-title class="d-flex align-center">
                      <v-icon class="mr-2" color="primary">mdi-history</v-icon>
                      Histórico de Contatos
                    </v-card-title>
                    <v-card-text>
                      <div v-if="client.first_contact_at || client.last_contact_at" class="d-flex flex-column ga-3">
                        <div v-if="client.first_contact_at">
                          <div class="text-caption text-medium-emphasis">Primeiro Contato</div>
                          <div class="text-body-1 font-weight-medium">
                            {{ formatDateTime(client.first_contact_at) }}
                          </div>
                        </div>
                        <div v-if="client.last_contact_at">
                          <div class="text-caption text-medium-emphasis">Último Contato</div>
                          <div class="text-body-1 font-weight-medium">
                            {{ formatDateTime(client.last_contact_at) }}
                          </div>
                        </div>
                      </div>
                      <v-alert v-else type="info" variant="tonal">
                        Nenhum histórico de contato disponível.
                      </v-alert>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </div>

    <!-- Error State -->
    <v-card v-else elevation="2" class="text-center pa-8">
      <v-icon color="error" size="64" class="mb-4">mdi-alert-circle</v-icon>
      <div class="text-h6 mb-2">Cliente não encontrado</div>
      <div class="text-body-2 text-medium-emphasis mb-4">
        O cliente que você está procurando não existe ou foi removido.
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-arrow-left"
        @click="goBack"
      >
        Voltar para Lista
      </v-btn>
    </v-card>

    <!-- Edit Client Dialog -->
    <ClientCreateDialog
      v-model="showEditDialog"
      :client="client"
      @saved="handleClientSaved"
      @error="handleClientError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  clientsService,
  type Client,
  type ClientStatus,
  type UrgencyLevel,
  type InterestType,
  type PropertyType,
  type ClientUpdate,
} from '@/shared/services/clients.service'
import { usersService, type User } from '@/shared/services/users.service'
import { aiSummariesService, type AISummary, type Sentiment, type DetectedIntent } from '@/shared/services/aiSummaries.service'
import { propertiesService, type Property } from '@/shared/services/properties.service'
import { attendancesService, type Attendance } from '@/shared/services/attendances.service'
import { formatPhone, formatCurrency, parseCurrency } from '@/shared/utils/masks'
import ClientCreateDialog from '@/shared/components/ClientCreateDialog.vue'
// Markdown formatting (using simple parser, not marked library)

const route = useRoute()
const router = useRouter()

// State
const client = ref<Client | null>(null)
const isLoading = ref(true)
const isLoadingAIInsights = ref(false)
const isLoadingAttendances = ref(false)
const activeTab = ref('overview')
const agents = ref<User[]>([])
const showScheduleDialog = ref(false)
const showEditDialog = ref(false)
const aiSummaries = ref<AISummary[]>([])
const recommendedProperties = ref<Property[]>([])
const profileBasedProperties = ref<Property[]>([])
const clientAttendances = ref<Attendance[]>([])

// Editable fields (for inline editing)
const editableFields = ref<Partial<ClientUpdate>>({})
const budgetMinFormatted = ref('')
const budgetMaxFormatted = ref('')

// Options
const statusOptions = [
  { title: 'Novo Lead', value: 'NEW_LEAD' },
  { title: 'Contatado', value: 'CONTACTED' },
  { title: 'Qualificado', value: 'QUALIFIED' },
  { title: 'Visita Agendada', value: 'VISIT_SCHEDULED' },
  { title: 'Visitando', value: 'VISITING' },
  { title: 'Proposta Enviada', value: 'PROPOSAL_SENT' },
  { title: 'Negociando', value: 'NEGOTIATING' },
  { title: 'Ganho', value: 'WON' },
  { title: 'Perdido', value: 'LOST' },
  { title: 'Inativo', value: 'INACTIVE' },
]

const urgencyOptions = [
  { title: 'Baixa', value: 'LOW' },
  { title: 'Média', value: 'MEDIUM' },
  { title: 'Alta', value: 'HIGH' },
  { title: 'Imediata', value: 'IMMEDIATE' },
]

const interestTypeOptions = [
  { title: 'Comprar', value: 'BUY' },
  { title: 'Alugar', value: 'RENT' },
  { title: 'Vender', value: 'SELL' },
  { title: 'Investir', value: 'INVEST' },
]

const propertyTypeOptions = [
  { title: 'Casa', value: 'HOUSE' },
  { title: 'Apartamento', value: 'APARTMENT' },
  { title: 'Terreno', value: 'LAND' },
  { title: 'Comercial', value: 'COMMERCIAL' },
  { title: 'Rural', value: 'RURAL' },
]

const agentOptions = computed(() => {
  return agents.value.map(agent => ({
    title: agent.full_name,
    value: agent.id,
  }))
})

// Computed
const hasInterestProfile = computed(() => {
  return !!(
    client.value?.current_interest_type ||
    client.value?.current_property_type ||
    client.value?.current_city_interest ||
    client.value?.current_budget_min ||
    client.value?.current_budget_max
  )
})

// Aggregated AI Insights
const aggregatedInsights = computed(() => {
  const completedSummaries = aiSummaries.value.filter(s => s.status === 'COMPLETED')
  
  if (completedSummaries.length === 0) {
    return {
      clientSummary: null,
      sentimentAnalysis: null,
      intents: [],
      averageLeadScore: null,
      nextSteps: [],
    }
  }

  // Sentiment Analysis
  const sentimentCounts: Record<Sentiment, number> = {
    POSITIVE: 0,
    NEUTRAL: 0,
    NEGATIVE: 0,
    MIXED: 0,
  }
  
  completedSummaries.forEach(summary => {
    if (summary.sentiment) {
      sentimentCounts[summary.sentiment]++
    }
  })

  const dominantSentiment = Object.entries(sentimentCounts).reduce((a, b) => 
    sentimentCounts[a[0] as Sentiment] > sentimentCounts[b[0] as Sentiment] ? a : b
  )[0] as Sentiment

  // Intent Analysis
  const intentCounts: Record<string, number> = {}
  completedSummaries.forEach(summary => {
    if (summary.detected_intent) {
      intentCounts[summary.detected_intent] = (intentCounts[summary.detected_intent] || 0) + 1
    }
  })

  const intents = Object.entries(intentCounts)
    .map(([intent, count]) => ({ intent: intent as DetectedIntent, count }))
    .sort((a, b) => b.count - a.count)

  // Average Lead Score
  const leadScores = completedSummaries
    .map(s => s.lead_score_suggested)
    .filter((score): score is number => score !== null)
  
  const averageLeadScore = leadScores.length > 0
    ? Math.round(leadScores.reduce((a, b) => a + b, 0) / leadScores.length)
    : null

  // Client Summary (from most recent summary)
  const mostRecentSummary = completedSummaries.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0]

  // Next Steps (aggregate from attendances ai_next_steps)
  const allNextSteps: string[] = []
  
  // First, try to get from attendances ai_next_steps field
  clientAttendances.value
    .filter(a => a.status === 'COMPLETED' && a.ai_next_steps)
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
    .forEach(attendance => {
      if (attendance.ai_next_steps) {
        // Parse the ai_next_steps field and extract individual steps
        const lines = attendance.ai_next_steps.split('\n')
        lines.forEach(line => {
          const trimmed = line.trim()
          // Skip lines that look like metadata (e.g., "Tipo de interesse: BUY")
          if (trimmed.match(/^(Tipo de interesse|Urgência|Interest type|Urgency):/i)) {
            return
          }
          // Extract list items
          const match = trimmed.match(/^(?:-|\*|\d+\.)\s*(.+)/)
          if (match) {
            const step = match[1].trim()
            if (step && step.length > 10 && !allNextSteps.includes(step)) {
              allNextSteps.push(step)
            }
          } else if (trimmed.length > 20 && !trimmed.includes(':') && !allNextSteps.includes(trimmed)) {
            // Also include non-list paragraphs that look like action items
            allNextSteps.push(trimmed)
          }
        })
      }
    })

  // Generate smart suggestions based on client profile if no AI steps
  if (allNextSteps.length === 0 && client.value) {
    const c = client.value
    
    // Based on status
    if (c.current_status === 'NEW_LEAD') {
      allNextSteps.push('Fazer primeiro contato para qualificar o lead')
      allNextSteps.push('Entender necessidades e preferências do cliente')
    } else if (c.current_status === 'CONTACTED') {
      allNextSteps.push('Agendar visita a imóveis compatíveis com o perfil')
      allNextSteps.push('Enviar opções de imóveis por WhatsApp ou e-mail')
    } else if (c.current_status === 'QUALIFIED') {
      allNextSteps.push('Selecionar imóveis que atendam aos critérios do cliente')
      allNextSteps.push('Agendar visitas presenciais')
    } else if (c.current_status === 'VISIT_SCHEDULED' || c.current_status === 'VISITING') {
      allNextSteps.push('Confirmar visita com antecedência')
      allNextSteps.push('Preparar documentação do imóvel para apresentação')
    } else if (c.current_status === 'PROPOSAL_SENT') {
      allNextSteps.push('Fazer follow-up sobre a proposta enviada')
      allNextSteps.push('Esclarecer dúvidas sobre valores e condições')
    } else if (c.current_status === 'NEGOTIATING') {
      allNextSteps.push('Negociar termos e condições finais')
      allNextSteps.push('Preparar documentação para fechamento')
    }
    
    // Based on urgency
    if (c.current_urgency_level === 'IMMEDIATE' || c.current_urgency_level === 'HIGH') {
      allNextSteps.unshift('Priorizar atendimento - cliente com urgência alta')
    }
  }

  return {
    clientSummary: mostRecentSummary?.summary_text || null,
    sentimentAnalysis: {
      dominant: dominantSentiment,
      distribution: sentimentCounts,
    },
    intents,
    averageLeadScore,
    nextSteps: allNextSteps.slice(0, 6), // Top 6 next steps
  }
})

// Methods
const loadClient = async () => {
  isLoading.value = true
  try {
    const clientId = route.params.id as string
    client.value = await clientsService.getClientById(clientId)
    
    // Initialize editable fields
    editableFields.value = {
      current_status: client.value.current_status,
      current_urgency_level: client.value.current_urgency_level,
      assigned_agent_id: client.value.assigned_agent_id,
      current_interest_type: client.value.current_interest_type,
      current_property_type: client.value.current_property_type,
      current_city_interest: client.value.current_city_interest,
      current_budget_min: client.value.current_budget_min,
      current_budget_max: client.value.current_budget_max,
    }
    
    // Format budget fields
    budgetMinFormatted.value = client.value.current_budget_min
      ? formatCurrency(parseFloat(client.value.current_budget_min))
      : ''
    budgetMaxFormatted.value = client.value.current_budget_max
      ? formatCurrency(parseFloat(client.value.current_budget_max))
      : ''
  } catch (error) {
    console.error('Error loading client:', error)
    client.value = null
  } finally {
    isLoading.value = false
  }
}

const loadAgents = async () => {
  try {
    agents.value = await usersService.getCorretores()
  } catch (error) {
    console.error('Error loading agents:', error)
  }
}

// Load client attendances
const loadClientAttendances = async () => {
  if (!client.value) return

  isLoadingAttendances.value = true
  try {
    clientAttendances.value = await attendancesService.getAttendances({
      client_id: client.value.id,
      limit: 100,
    })
  } catch (error) {
    console.error('Error loading client attendances:', error)
  } finally {
    isLoadingAttendances.value = false
  }
}

// Load profile-based property recommendations when no AI recommendations exist
const loadProfileBasedProperties = async () => {
  if (!client.value) return
  
  // Only load if no AI recommendations and client has interest profile
  if (recommendedProperties.value.length > 0) return
  if (!hasInterestProfile.value) return
  
  try {
    // Get all properties and filter based on client profile
    const allProperties = await propertiesService.listProperties({ limit: 100 })
    
    // Filter properties based on client preferences
    const filtered = allProperties.filter(property => {
      // Only published properties
      if (property.status !== 'PUBLISHED') return false
      
      // Match interest type
      if (client.value?.current_interest_type === 'BUY' && 
          property.business_type !== 'SALE' && property.business_type !== 'BOTH') return false
      if (client.value?.current_interest_type === 'RENT' && 
          property.business_type !== 'RENT' && property.business_type !== 'BOTH') return false
      
      // Match property type
      if (client.value?.current_property_type && 
          property.property_type !== client.value.current_property_type) return false
      
      // Match city
      if (client.value?.current_city_interest && property.city) {
        const cityMatch = property.city.toLowerCase().includes(
          client.value.current_city_interest.toLowerCase()
        )
        if (!cityMatch) return false
      }
      
      // Match budget
      const minBudget = client.value?.current_budget_min ? parseFloat(client.value.current_budget_min) : null
      const maxBudget = client.value?.current_budget_max ? parseFloat(client.value.current_budget_max) : null
      
      if (minBudget || maxBudget) {
        const priceValue = client.value?.current_interest_type === 'RENT' 
          ? property.rent_price 
          : property.price
        
        const price = typeof priceValue === 'string' ? parseFloat(priceValue) : priceValue
        
        if (price) {
          if (minBudget && price < minBudget) return false
          if (maxBudget && price > maxBudget) return false
        }
      }
      
      return true
    })
    
    // Take top 6 properties
    profileBasedProperties.value = filtered.slice(0, 6)
  } catch (error) {
    console.error('Error loading profile-based properties:', error)
  }
}

// Load AI Insights
const loadAIInsights = async () => {
  if (!client.value) return

  isLoadingAIInsights.value = true
  try {
    // Load all AI summaries for this client
    aiSummaries.value = await aiSummariesService.getSummariesByClientId(client.value.id)

    // Collect all recommended property IDs
    const propertyIds = new Set<string>()
    aiSummaries.value.forEach(summary => {
      if (summary.recommended_properties) {
        summary.recommended_properties.forEach(id => propertyIds.add(id))
      }
    })

    // Load recommended properties from AI
    if (propertyIds.size > 0) {
      const propertiesPromises = Array.from(propertyIds).map(id =>
        propertiesService.getPropertyById(id).catch(() => null)
      )
      const propertiesResults = await Promise.allSettled(propertiesPromises)
      
      recommendedProperties.value = propertiesResults
        .filter((result): result is PromiseFulfilledResult<Property> =>
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value)
    }
    
    // If no AI recommendations, try to find based on profile
    if (recommendedProperties.value.length === 0) {
      await loadProfileBasedProperties()
    }
  } catch (error) {
    console.error('Error loading AI insights:', error)
  } finally {
    isLoadingAIInsights.value = false
  }
}

// Watch active tab to load data when needed
watch(activeTab, (newTab) => {
  if (newTab === 'insights' && client.value && aiSummaries.value.length === 0) {
    loadAIInsights()
  }
  if (newTab === 'attendances' && client.value && clientAttendances.value.length === 0) {
    loadClientAttendances()
  }
})

const handleFieldUpdate = async (field: keyof ClientUpdate, value: any) => {
  if (!client.value) return
  
  try {
    const updateData: ClientUpdate = {
      [field]: value,
    }
    
    client.value = await clientsService.updateClient(client.value.id, updateData)
    
    // Update local state
    editableFields.value[field] = value
  } catch (error: any) {
    console.error(`Error updating ${field}:`, error)
    alert(`Erro ao atualizar ${field}: ${error.message}`)
    // Reload client to revert changes
    await loadClient()
  }
}

const handleBudgetMinUpdate = async () => {
  const parsed = parseCurrency(budgetMinFormatted.value)
  await handleFieldUpdate('current_budget_min', parsed ? String(parsed) : null)
}

const handleBudgetMaxUpdate = async () => {
  const parsed = parseCurrency(budgetMaxFormatted.value)
  await handleFieldUpdate('current_budget_max', parsed ? String(parsed) : null)
}

const formatBudgetRange = (): string => {
  const min = client.value?.current_budget_min
    ? formatCurrency(parseFloat(client.value.current_budget_min))
    : null
  const max = client.value?.current_budget_max
    ? formatCurrency(parseFloat(client.value.current_budget_max))
    : null
  
  if (min && max) return `${min} - ${max}`
  if (min) return `A partir de ${min}`
  if (max) return `Até ${max}`
  return 'Não definido'
}

const formatMarkdown = (text: string): string => {
  if (!text) return ''
  
  // Split by lines to process lists properly
  const lines = text.split('\n')
  const processedLines: string[] = []
  let inList = false
  let listType: 'ul' | 'ol' | null = null
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    
    // Check for unordered list items
    const ulMatch = line.match(/^(\s*)[-*]\s+(.+)/)
    // Check for ordered list items
    const olMatch = line.match(/^(\s*)\d+\.\s+(.+)/)
    
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) processedLines.push(listType === 'ol' ? '</ol>' : '</ul>')
        processedLines.push('<ul class="markdown-list">')
        inList = true
        listType = 'ul'
      }
      const content = formatInlineMarkdown(ulMatch[2])
      processedLines.push(`<li>${content}</li>`)
    } else if (olMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) processedLines.push(listType === 'ol' ? '</ol>' : '</ul>')
        processedLines.push('<ol class="markdown-list">')
        inList = true
        listType = 'ol'
      }
      const content = formatInlineMarkdown(olMatch[2])
      processedLines.push(`<li>${content}</li>`)
    } else {
      // Close list if we were in one
      if (inList && line.trim() !== '') {
        processedLines.push(listType === 'ol' ? '</ol>' : '</ul>')
        inList = false
        listType = null
      }
      
      // Process headers
      if (line.match(/^### /)) {
        line = `<h4 class="markdown-h4">${formatInlineMarkdown(line.replace(/^### /, ''))}</h4>`
      } else if (line.match(/^## /)) {
        line = `<h3 class="markdown-h3">${formatInlineMarkdown(line.replace(/^## /, ''))}</h3>`
      } else if (line.match(/^# /)) {
        line = `<h2 class="markdown-h2">${formatInlineMarkdown(line.replace(/^# /, ''))}</h2>`
      } else if (line.trim() !== '') {
        // Regular paragraph with inline formatting
        line = `<p class="markdown-p">${formatInlineMarkdown(line)}</p>`
      } else if (!inList) {
        // Empty line - add spacing only if not in list
        line = '<div class="markdown-spacer"></div>'
      }
      
      processedLines.push(line)
    }
  }
  
  // Close any open list
  if (inList) {
    processedLines.push(listType === 'ol' ? '</ol>' : '</ul>')
  }
  
  return processedLines.join('')
}

const formatInlineMarkdown = (text: string): string => {
  if (!text) return ''
  
  let html = text
  
  // Bold (process first to avoid conflicts with italic)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
  
  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>')
  
  // Code
  html = html.replace(/`([^`]+)`/g, '<code class="markdown-code">$1</code>')
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="markdown-link">$1</a>')
  
  return html
}

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date)
}

const getFollowUpClass = (dateString: string): string => {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const followUpDate = new Date(date)
  followUpDate.setHours(0, 0, 0, 0)

  const diffTime = followUpDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'text-error'
  if (diffDays === 0) return 'text-warning'
  if (diffDays <= 3) return 'text-orange'
  return 'text-success'
}

const getFollowUpStatus = (dateString: string): string => {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const followUpDate = new Date(date)
  followUpDate.setHours(0, 0, 0, 0)

  const diffTime = followUpDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return `Atrasado há ${Math.abs(diffDays)} dia(s)`
  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Amanhã'
  if (diffDays <= 7) return `Em ${diffDays} dias`
  return `Em ${diffDays} dias`
}

// Attendance helpers
const getChannelLabel = (channel: string): string => {
  const labels: Record<string, string> = {
    WHATSAPP: 'WhatsApp',
    SITE: 'Site',
    PHONE: 'Telefone',
    EMAIL: 'E-mail',
    IN_PERSON: 'Presencial',
  }
  return labels[channel] || channel
}

const getChannelIcon = (channel: string): string => {
  const icons: Record<string, string> = {
    WHATSAPP: 'mdi-whatsapp',
    SITE: 'mdi-web',
    PHONE: 'mdi-phone',
    EMAIL: 'mdi-email',
    IN_PERSON: 'mdi-account',
  }
  return icons[channel] || 'mdi-phone'
}

const getChannelColor = (channel: string): string => {
  const colors: Record<string, string> = {
    WHATSAPP: 'success',
    SITE: 'primary',
    PHONE: 'info',
    EMAIL: 'warning',
    IN_PERSON: 'purple',
  }
  return colors[channel] || 'grey'
}

const getAttendanceStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    IN_PROGRESS: 'Em Andamento',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
    PAUSED: 'Pausado',
  }
  return labels[status] || status
}

const getAttendanceStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    IN_PROGRESS: 'info',
    COMPLETED: 'success',
    CANCELLED: 'error',
    PAUSED: 'warning',
  }
  return colors[status] || 'grey'
}

const truncateText = (text: string, maxLength: number): string => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
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
    formatted = formatted.replace(new RegExp(`\\b${en}\\b`, 'gi'), pt)
  })
  
  // Clean up any remaining field labels that look like metadata
  const lines = formatted.split('\n')
  const cleanedLines = lines.filter(line => {
    const trimmed = line.trim()
    // Keep actual content, filter out raw metadata lines
    if (!trimmed) return false
    // Skip lines that are just "Label: Value" with short values
    if (trimmed.match(/^[A-Za-zÀ-ú\s]+:\s*[A-Za-zÀ-ú]{1,15}$/)) {
      return false
    }
    return true
  })
  
  return cleanedLines.join('\n')
}

// Check if next steps has valid content (not just metadata)
const hasValidNextSteps = (nextSteps: string): boolean => {
  if (!nextSteps) return false
  
  const lines = nextSteps.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    
    // Skip lines that are just metadata (e.g., "Tipo de interesse detectado: BUY")
    if (trimmed.match(/^(Tipo de interesse|Urgência|Interest type|Urgency|Budget|Orçamento).*:/i)) {
      continue
    }
    
    // If we find a line that's not metadata and has substantial content, return true
    if (trimmed.length > 20) {
      return true
    }
  }
  
  return false
}

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}min`
  }
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}min`
}

const formatBudgetDetected = (min: number | null, max: number | null): string => {
  const formatValue = (value: number) => formatCurrency(value)
  
  if (min && max) return `${formatValue(min)} - ${formatValue(max)}`
  if (min) return `A partir de ${formatValue(min)}`
  if (max) return `Até ${formatValue(max)}`
  return 'Não definido'
}

const goToAttendance = (attendanceId: string) => {
  router.push({ name: 'attendances-details', params: { id: attendanceId } })
}

const goToCreateAttendance = () => {
  router.push({ name: 'attendances-create', query: { client_id: client.value?.id } })
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const getStatusLabel = (status: ClientStatus): string => {
  const labels: Record<ClientStatus, string> = {
    NEW_LEAD: 'Novo Lead',
    CONTACTED: 'Contatado',
    QUALIFIED: 'Qualificado',
    VISIT_SCHEDULED: 'Visita Agendada',
    VISITING: 'Visitando',
    PROPOSAL_SENT: 'Proposta Enviada',
    NEGOTIATING: 'Negociando',
    WON: 'Ganho',
    LOST: 'Perdido',
    INACTIVE: 'Inativo',
  }
  return labels[status] || status
}

const getStatusColor = (status: ClientStatus): string => {
  const colors: Record<ClientStatus, string> = {
    NEW_LEAD: 'blue',
    CONTACTED: 'cyan',
    QUALIFIED: 'teal',
    VISIT_SCHEDULED: 'orange',
    VISITING: 'deep-orange',
    PROPOSAL_SENT: 'amber',
    NEGOTIATING: 'purple',
    WON: 'success',
    LOST: 'error',
    INACTIVE: 'grey',
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status: ClientStatus): string => {
  const icons: Record<ClientStatus, string> = {
    NEW_LEAD: 'mdi-star',
    CONTACTED: 'mdi-phone',
    QUALIFIED: 'mdi-check-circle',
    VISIT_SCHEDULED: 'mdi-calendar',
    VISITING: 'mdi-walk',
    PROPOSAL_SENT: 'mdi-file-send',
    NEGOTIATING: 'mdi-handshake',
    WON: 'mdi-trophy',
    LOST: 'mdi-close-circle',
    INACTIVE: 'mdi-pause-circle',
  }
  return icons[status] || 'mdi-help-circle'
}

const getUrgencyLabel = (urgency: UrgencyLevel): string => {
  const labels: Record<UrgencyLevel, string> = {
    LOW: 'Baixa',
    MEDIUM: 'Média',
    HIGH: 'Alta',
    IMMEDIATE: 'Imediata',
  }
  return labels[urgency] || urgency
}

const getUrgencyColor = (urgency: UrgencyLevel): string => {
  const colors: Record<UrgencyLevel, string> = {
    LOW: 'grey',
    MEDIUM: 'blue',
    HIGH: 'orange',
    IMMEDIATE: 'error',
  }
  return colors[urgency] || 'grey'
}

const getInterestTypeLabel = (type: InterestType): string => {
  const labels: Record<InterestType, string> = {
    BUY: 'Comprar',
    RENT: 'Alugar',
    SELL: 'Vender',
    INVEST: 'Investir',
  }
  return labels[type] || type
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

const getLeadScoreColor = (score: number): string => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'info'
  if (score >= 40) return 'warning'
  return 'error'
}

const getLeadScoreAlertType = (score: number): 'success' | 'info' | 'warning' | 'error' => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'info'
  if (score >= 40) return 'warning'
  return 'error'
}

const getLeadScoreMessage = (score: number): string => {
  if (score >= 80) return 'Excelente potencial de conversão! Cliente muito qualificado.'
  if (score >= 60) return 'Bom potencial de conversão. Cliente qualificado.'
  if (score >= 40) return 'Potencial moderado. Requer mais qualificação.'
  return 'Baixo potencial. Necessita mais informações e qualificação.'
}

const handleEditClick = () => {
  if (!client.value) {
    console.error('Client is null, cannot edit')
    return
  }
  console.log('Opening edit dialog for client:', client.value.id)
  showEditDialog.value = true
}

const handleClientSaved = async () => {
  // Reload client to show updated data
  await loadClient()
  showEditDialog.value = false
}

const handleClientError = (error: string) => {
  alert(`Erro ao salvar cliente: ${error}`)
  console.error('Client save error:', error)
}

const goBack = () => {
  router.push({ name: 'clients' })
}

const goToProperty = (propertyId: string) => {
  router.push({ name: 'properties-details', params: { id: propertyId } })
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
const getIntentColor = (intent: DetectedIntent): string => {
  const colors: Record<DetectedIntent, string> = {
    INFORMATION_REQUEST: 'info',
    PROPERTY_SEARCH: 'primary',
    SCHEDULE_VISIT: 'success',
    PRICE_NEGOTIATION: 'warning',
    DOCUMENTATION_REQUEST: 'purple',
    GENERAL_INQUIRY: 'cyan',
    COMPLAINT: 'error',
    FOLLOW_UP: 'orange',
  }
  return colors[intent] || 'grey'
}

const getIntentIcon = (intent: DetectedIntent): string => {
  const icons: Record<DetectedIntent, string> = {
    INFORMATION_REQUEST: 'mdi-information',
    PROPERTY_SEARCH: 'mdi-magnify',
    SCHEDULE_VISIT: 'mdi-calendar-clock',
    PRICE_NEGOTIATION: 'mdi-handshake',
    DOCUMENTATION_REQUEST: 'mdi-file-document',
    GENERAL_INQUIRY: 'mdi-help-circle',
    COMPLAINT: 'mdi-alert',
    FOLLOW_UP: 'mdi-phone',
  }
  return icons[intent] || 'mdi-help-circle'
}

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

onMounted(() => {
  loadClient()
  loadAgents()
})
</script>

<style scoped>
/* Card hover effects */
.property-card,
.attendance-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.property-card:hover,
.attendance-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  transform: translateY(-2px);
}

/* Markdown content styles */
:deep(.markdown-content) {
  line-height: 1.7;
}

:deep(.markdown-h2) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: rgb(var(--v-theme-on-surface));
}

:deep(.markdown-h3) {
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
  color: rgb(var(--v-theme-on-surface));
}

:deep(.markdown-h4) {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 0.5rem;
  margin-bottom: 0.25rem;
  color: rgb(var(--v-theme-on-surface));
}

:deep(.markdown-p) {
  margin-bottom: 0.75rem;
}

:deep(.markdown-p:last-child) {
  margin-bottom: 0;
}

:deep(.markdown-list) {
  margin: 0.5rem 0 0.75rem 1.5rem;
  padding: 0;
}

:deep(.markdown-list li) {
  margin-bottom: 0.25rem;
  padding-left: 0.25rem;
}

:deep(.markdown-list li:last-child) {
  margin-bottom: 0;
}

:deep(.markdown-code) {
  background-color: rgba(var(--v-theme-on-surface), 0.08);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.875em;
}

:deep(.markdown-link) {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
}

:deep(.markdown-link:hover) {
  text-decoration: underline;
}

:deep(.markdown-spacer) {
  height: 0.5rem;
}

/* AI Summary preview styles */
.ai-summary-preview,
.ai-next-steps-preview {
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
  padding: 0.75rem;
  border-radius: 8px;
  border-left: 3px solid rgb(var(--v-theme-primary));
}

.ai-next-steps-preview {
  border-left-color: rgb(var(--v-theme-success));
}

.raw-content-preview {
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* AI Summary content in expansion panels */
:deep(.ai-summary-content) {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  padding: 1rem;
  border-radius: 8px;
}

:deep(.ai-summary-content .markdown-p) {
  margin-bottom: 0.5rem;
}

:deep(.ai-summary-content .markdown-list) {
  margin-left: 1.25rem;
}
</style>

