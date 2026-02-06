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
              <div class="text-center pa-8">
                <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-phone-off</v-icon>
                <div class="text-h6 text-medium-emphasis mb-2">Nenhum atendimento registrado</div>
                <div class="text-body-2 text-medium-emphasis">
                  Os atendimentos deste cliente aparecerão aqui quando forem criados.
                </div>
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

                  <!-- Propriedades Recomendadas -->
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
                              class="h-100"
                              @click="goToProperty(property.id)"
                              style="cursor: pointer"
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

                  <!-- Histórico de Insights -->
                  <v-col cols="12" v-if="aiSummaries.length > 0">
                    <v-card variant="outlined" class="mb-4">
                      <v-card-title class="d-flex align-center">
                        <v-icon class="mr-2" color="primary">mdi-history</v-icon>
                        Histórico de Insights
                      </v-card-title>
                      <v-card-text>
                        <v-timeline density="compact" side="end">
                          <v-timeline-item
                            v-for="summary in aiSummaries"
                            :key="summary.id"
                            :dot-color="getAIStatusColor(summary.status)"
                            size="small"
                          >
                            <template #icon>
                              <v-icon :color="getAIStatusColor(summary.status)">
                                {{ getAIStatusIcon(summary.status) }}
                              </v-icon>
                            </template>
                            <v-card variant="outlined" class="mb-2">
                              <v-card-text class="pa-3">
                                <div class="d-flex align-center justify-space-between mb-2">
                                  <div class="text-caption text-medium-emphasis">
                                    {{ formatDateTime(summary.created_at) }}
                                  </div>
                                  <v-chip
                                    :color="getAIStatusColor(summary.status)"
                                    variant="flat"
                                    size="x-small"
                                  >
                                    {{ getAIStatusLabel(summary.status) }}
                                  </v-chip>
                                </div>
                                <div class="text-body-2 mb-2" style="white-space: pre-wrap; word-wrap: break-word;">
                                  {{ summary.summary_text.substring(0, 200) }}{{ summary.summary_text.length > 200 ? '...' : '' }}
                                </div>
                                <div class="d-flex flex-wrap ga-1">
                                  <v-chip
                                    v-if="summary.sentiment"
                                    size="x-small"
                                    variant="outlined"
                                  >
                                    <v-icon start size="12">{{ getSentimentIcon(summary.sentiment) }}</v-icon>
                                    {{ getSentimentLabel(summary.sentiment) }}
                                  </v-chip>
                                  <v-chip
                                    v-if="summary.detected_intent"
                                    size="x-small"
                                    variant="outlined"
                                  >
                                    {{ getIntentLabel(summary.detected_intent) }}
                                  </v-chip>
                                  <v-chip
                                    v-if="summary.urgency_level_detected"
                                    size="x-small"
                                    variant="outlined"
                                  >
                                    Urgência: {{ getUrgencyLabel(summary.urgency_level_detected) }}
                                  </v-chip>
                                </div>
                              </v-card-text>
                            </v-card>
                          </v-timeline-item>
                        </v-timeline>
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
import { formatPhone, formatCurrency, parseCurrency } from '@/shared/utils/masks'
import ClientCreateDialog from '@/shared/components/ClientCreateDialog.vue'
// Markdown formatting (using simple parser, not marked library)

const route = useRoute()
const router = useRouter()

// State
const client = ref<Client | null>(null)
const isLoading = ref(true)
const isLoadingAIInsights = ref(false)
const activeTab = ref('overview')
const agents = ref<User[]>([])
const showScheduleDialog = ref(false)
const showEditDialog = ref(false)
const aiSummaries = ref<AISummary[]>([])
const recommendedProperties = ref<Property[]>([])

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

  // Next Steps (aggregate from all summaries)
  const allNextSteps: string[] = []
  completedSummaries.forEach(summary => {
    // Extract next steps from summary text (simple heuristic)
    const lines = summary.summary_text.split('\n')
    lines.forEach(line => {
      if (line.trim().match(/^(?:-|\*|\d+\.)\s*(.+)/i)) {
        const step = line.trim().replace(/^(?:-|\*|\d+\.)\s*/, '')
        if (step && !allNextSteps.includes(step)) {
          allNextSteps.push(step)
        }
      }
    })
  })

  return {
    clientSummary: mostRecentSummary?.summary_text || null,
    sentimentAnalysis: {
      dominant: dominantSentiment,
      distribution: sentimentCounts,
    },
    intents,
    averageLeadScore,
    nextSteps: allNextSteps.slice(0, 5), // Top 5 next steps
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

    // Load recommended properties
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
  } catch (error) {
    console.error('Error loading AI insights:', error)
  } finally {
    isLoadingAIInsights.value = false
  }
}

// Watch active tab to load AI insights when needed
watch(activeTab, (newTab) => {
  if (newTab === 'insights' && client.value && aiSummaries.value.length === 0) {
    loadAIInsights()
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
  
  // Simple markdown parser for common formatting
  let html = text
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>')
  
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/_(.*?)_/g, '<em>$1</em>')
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
  
  // Line breaks
  html = html.replace(/\n/g, '<br>')
  
  // Code blocks
  html = html.replace(/`([^`]+)`/g, '<code class="markdown-code">$1</code>')
  
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

const getLeadScoreAlertType = (score: number): string => {
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

const handleClientSaved = async (updatedClient: Client) => {
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
:deep(.v-card) {
  transition: box-shadow 0.2s ease;
}

:deep(.v-card:hover) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12) !important;
}

/* Markdown styles */
:deep(.v-card-text) {
  line-height: 1.6;
}

:deep(.v-card-text h1),
:deep(.v-card-text h2),
:deep(.v-card-text h3) {
  margin-top: 1em;
  margin-bottom: 0.5em;
}

:deep(.v-card-text ul),
:deep(.v-card-text ol) {
  margin-left: 1.5em;
  margin-bottom: 1em;
}

:deep(.v-card-text p) {
  margin-bottom: 1em;
}
</style>

