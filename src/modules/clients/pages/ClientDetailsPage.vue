<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="d-flex justify-center align-center" style="min-height: 400px">
      <v-skeleton-loader type="card" width="100%"></v-skeleton-loader>
    </div>

    <!-- Content -->
    <div v-else-if="client">
      <!-- Modern Header -->
      <v-card class="client-header mb-6" rounded="xl" elevation="0">
        <!-- Gradient Background -->
        <div class="header-gradient">
          <div class="header-content pa-6">
            <!-- Top Actions Bar -->
            <div class="d-flex align-center justify-space-between mb-4">
              <v-btn icon variant="text" color="white" size="small" @click="goBack">
                <v-icon>mdi-arrow-left</v-icon>
                <v-tooltip activator="parent" location="bottom">Voltar</v-tooltip>
              </v-btn>

              <div class="d-flex align-center ga-2">
                <v-btn variant="flat" color="success" size="small" prepend-icon="mdi-handshake" @click="openSaleDialog">
                  Registrar Venda
                </v-btn>
                <v-btn variant="flat" color="warning" size="small" prepend-icon="mdi-account-remove"
                  @click="openLossDialog">
                  Registrar Perda
                </v-btn>
                <v-btn variant="tonal" color="white" size="small" prepend-icon="mdi-pencil" @click="handleEditClick">
                  Editar
                </v-btn>
                <v-btn variant="tonal" color="error" size="small" prepend-icon="mdi-delete"
                  @click="showDeleteDialog = true">
                  Excluir
                </v-btn>
              </div>
            </div>

            <!-- Client Info -->
            <div class="d-flex align-start flex-wrap ga-6">
              <!-- Avatar & Name -->
              <div class="d-flex align-center">
                <v-avatar size="72" class="avatar-ring mr-4">
                  <span class="text-h4 font-weight-bold text-primary">
                    {{ getInitials(client.name) }}
                  </span>
                </v-avatar>
                <div>
                  <h1 class="text-h4 font-weight-bold text-white mb-1">
                    {{ client.name }}
                  </h1>
                  <div class="d-flex align-center ga-4 flex-wrap">
                    <div v-if="client.phone" class="d-flex align-center text-white-darken-1">
                      <v-icon size="16" class="mr-1">mdi-phone</v-icon>
                      <span class="text-body-2">{{ formatPhone(client.phone) }}</span>
                    </div>
                    <div v-if="client.email" class="d-flex align-center text-white-darken-1">
                      <v-icon size="16" class="mr-1">mdi-email</v-icon>
                      <span class="text-body-2">{{ client.email }}</span>
                    </div>
                    <div v-if="client.lead_source" class="d-flex align-center text-white-darken-1">
                      <v-icon size="16" class="mr-1">mdi-source-branch</v-icon>
                      <span class="text-body-2">{{ getLeadSourceLabel(client.lead_source) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <v-spacer class="d-none d-md-block"></v-spacer>

              <!-- Status Chips -->
              <div class="d-flex flex-column align-end ga-2">
                <v-chip v-if="client.current_status" :color="getStatusColor(client.current_status)" variant="elevated"
                  size="large" class="font-weight-bold">
                  <v-icon start size="18">{{ getStatusIcon(client.current_status) }}</v-icon>
                  {{ getStatusLabel(client.current_status) }}
                </v-chip>
                <div class="d-flex align-center ga-2">
                  <v-chip v-if="client.current_urgency_level" :color="getUrgencyColor(client.current_urgency_level)"
                    variant="elevated" size="small">
                    <v-icon start size="14">mdi-clock-alert</v-icon>
                    {{ getUrgencyLabel(client.current_urgency_level) }}
                  </v-chip>
                  <v-chip v-if="client.current_interest_type" color="white" variant="flat" size="small">
                    <v-icon start size="14">mdi-handshake</v-icon>
                    {{ getInterestTypeLabel(client.current_interest_type) }}
                  </v-chip>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Metrics Bar -->
        <v-card-text class="metrics-bar pa-0">
          <v-row no-gutters class="divide-x">
            <!-- Lead Score -->
            <v-col cols="6" sm="3" class="pa-4 text-center">
              <div class="d-flex flex-column align-center">
                <v-progress-circular :model-value="client.current_lead_score || 0" :size="56" :width="6"
                  :color="getLeadScoreColor(client.current_lead_score || 0)">
                  <span class="text-body-1 font-weight-bold">{{ client.current_lead_score || 0 }}</span>
                </v-progress-circular>
                <span class="text-caption text-medium-emphasis mt-2">Lead Score</span>
              </div>
            </v-col>

            <!-- Attendances -->
            <v-col cols="6" sm="3" class="pa-4 border-start d-flex align-center justify-center">
              <div class="d-flex flex-column align-center text-center">
                <div class="text-h5 font-weight-bold text-primary">
                  {{ clientAttendances.length }}
                </div>
                <span class="text-caption text-medium-emphasis mt-1">
                  Atendimentos
                </span>
              </div>
            </v-col>

            <!-- Last Contact -->
            <v-col cols="6" sm="3" class="pa-4 border-start d-flex align-center justify-center">
              <div class="d-flex flex-column align-center text-center">
                <div class="text-h5 font-weight-bold" :class="getDaysSinceContactColor(client.last_contact_at)">
                  {{ getDaysSinceContact(client.last_contact_at) }}
                </div>
                <span class="text-caption text-medium-emphasis mt-1">
                  Dias s/ Contato
                </span>
              </div>
            </v-col>

            <!-- Budget -->
            <v-col cols="6" sm="3" class="pa-4 border-start d-flex align-center justify-center">
              <div class="d-flex flex-column text-center">
                <div class="text-body-1 font-weight-bold text-success">
                  {{ formatBudgetRange(client.current_budget_min, client.current_budget_max) }}
                </div>
                <span class="text-caption text-medium-emphasis mt-1">
                  Orçamento
                </span>
              </div>
            </v-col>

          </v-row>
        </v-card-text>
      </v-card>

      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="showDeleteDialog" max-width="500" persistent>
        <v-card rounded="lg">
          <v-card-title class="d-flex align-center pa-4 bg-error">
            <v-icon color="white" class="mr-3" size="28">mdi-alert-circle</v-icon>
            <span class="text-white text-h6">Excluir Cliente</span>
          </v-card-title>

          <v-card-text class="pa-6">
            <div class="text-center mb-4">
              <v-avatar color="error" size="64" class="mb-3">
                <span class="text-h5 text-white">{{ getInitials(client.name) }}</span>
              </v-avatar>
              <h3 class="text-h6 font-weight-bold">{{ client.name }}</h3>
            </div>

            <v-alert type="warning" variant="tonal" class="mb-4">
              <div class="font-weight-bold mb-1">Atenção: Esta ação é irreversível!</div>
              <div class="text-body-2">
                Ao excluir este cliente, <strong>todos os dados relacionados</strong> serão removidos permanentemente:
              </div>
            </v-alert>

            <v-list density="compact" class="bg-grey-lighten-4 rounded-lg">
              <v-list-item>
                <template #prepend>
                  <v-icon color="error" size="20">mdi-phone</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  {{ clientAttendances.length }} atendimento(s) e resumos de IA
                </v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon color="error" size="20">mdi-calendar</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  Todas as visitas agendadas
                </v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon color="error" size="20">mdi-timeline</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  Histórico completo da jornada
                </v-list-item-title>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon color="error" size="20">mdi-robot</v-icon>
                </template>
                <v-list-item-title class="text-body-2">
                  Todos os insights da IA
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-4">
            <v-btn variant="text" @click="showDeleteDialog = false">
              Cancelar
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="error" variant="flat" prepend-icon="mdi-delete" :loading="isDeleting"
              @click="handleDeleteClient">
              Confirmar Exclusão
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Sale Registration Dialog -->
      <v-dialog v-model="showSaleDialog" max-width="700" persistent>
        <v-card rounded="lg">
          <v-toolbar color="success" density="compact">
            <v-toolbar-title class="text-white font-weight-bold">
              <v-icon start>mdi-handshake</v-icon>
              Registrar Venda/Aluguel
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon variant="text" @click="closeSaleDialog">
              <v-icon color="white">mdi-close</v-icon>
            </v-btn>
          </v-toolbar>

          <v-card-text class="pt-6">
            <v-form ref="saleForm" v-model="isSaleFormValid">
              <v-row>
                <!-- Tipo de venda -->
                <v-col cols="12">
                  <v-btn-toggle v-model="newSale.sale_type" mandatory color="primary" class="w-100">
                    <v-btn value="SALE" class="flex-grow-1">
                      <v-icon start>mdi-home-plus</v-icon>
                      Venda
                    </v-btn>
                    <v-btn value="RENT" class="flex-grow-1">
                      <v-icon start>mdi-key</v-icon>
                      Aluguel
                    </v-btn>
                  </v-btn-toggle>
                </v-col>

                <!-- Cliente (readonly) -->
                <v-col cols="12">
                  <v-text-field :model-value="client?.name" label="Cliente" prepend-inner-icon="mdi-account"
                    variant="outlined" density="comfortable" readonly bg-color="grey-lighten-4"></v-text-field>
                </v-col>

                <!-- Imóvel -->
                <v-col cols="12">
                  <v-autocomplete v-model="newSale.property_id" :items="availableProperties" item-title="title"
                    item-value="id" label="Imóvel (opcional)" prepend-inner-icon="mdi-home" variant="outlined"
                    density="comfortable" clearable :loading="isLoadingProperties">
                    <template v-slot:item="{ props, item }">
                      <v-list-item v-bind="props">
                        <v-list-item-subtitle>
                          {{ item.raw.city }} - R$ {{ formatPropertyPrice(item.raw) }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </template>
                  </v-autocomplete>
                </v-col>

                <!-- Valor -->
                <v-col cols="12" sm="6">
                  <v-text-field v-model.number="newSale.sale_value" label="Valor *"
                    prepend-inner-icon="mdi-currency-usd" variant="outlined" density="comfortable" type="number"
                    prefix="R$"
                    :rules="[(v: number | null) => (v !== null && v > 0) || 'Valor deve ser maior que zero']"></v-text-field>
                </v-col>

                <!-- Comissão -->
                <v-col cols="12" sm="6">
                  <v-text-field v-model.number="newSale.commission_percentage" label="Comissão (%)"
                    prepend-inner-icon="mdi-percent" variant="outlined" density="comfortable" type="number"
                    suffix="%"></v-text-field>
                </v-col>

                <!-- Entrada -->
                <v-col cols="12" sm="6">
                  <v-text-field v-model.number="newSale.down_payment" label="Entrada (opcional)"
                    prepend-inner-icon="mdi-cash" variant="outlined" density="comfortable" type="number"
                    prefix="R$"></v-text-field>
                </v-col>

                <!-- Forma de pagamento -->
                <v-col cols="12" sm="6">
                  <v-select v-model="newSale.payment_method" :items="paymentMethodOptions" label="Forma de Pagamento"
                    prepend-inner-icon="mdi-credit-card" variant="outlined" density="comfortable" clearable></v-select>
                </v-col>

                <!-- Campos de aluguel -->
                <template v-if="newSale.sale_type === 'RENT'">
                  <v-col cols="12" sm="6">
                    <v-text-field v-model.number="newSale.rent_duration_months" label="Duração (meses)"
                      prepend-inner-icon="mdi-calendar-range" variant="outlined" density="comfortable"
                      type="number"></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="newSale.rent_start_date" label="Data de Início"
                      prepend-inner-icon="mdi-calendar" variant="outlined" density="comfortable"
                      type="date"></v-text-field>
                  </v-col>
                </template>

                <!-- Notas -->
                <v-col cols="12">
                  <v-textarea v-model="newSale.notes" label="Observações" prepend-inner-icon="mdi-note-text"
                    variant="outlined" density="comfortable" rows="2" auto-grow></v-textarea>
                </v-col>
              </v-row>
            </v-form>

            <v-alert type="info" variant="tonal" density="compact" class="mt-4">
              <template v-slot:text>
                Ao registrar a venda, o status do cliente será atualizado para "Ganho" e a IA irá
                analisar a negociação quando a venda for concluída.
              </template>
            </v-alert>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="closeSaleDialog" :disabled="isCreatingSale">
              Cancelar
            </v-btn>
            <v-btn color="success" variant="flat" @click="createSale" :loading="isCreatingSale"
              :disabled="!isSaleFormValid">
              <v-icon start>mdi-check</v-icon>
              Registrar Venda
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Loss Registration Dialog -->
      <v-dialog v-model="showLossDialog" max-width="700" persistent>
        <v-card rounded="lg">
          <v-toolbar color="warning" density="compact">
            <v-toolbar-title class="text-white font-weight-bold">
              <v-icon start>mdi-account-remove</v-icon>
              Registrar Perda de Cliente
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon variant="text" @click="closeLossDialog">
              <v-icon color="white">mdi-close</v-icon>
            </v-btn>
          </v-toolbar>

          <v-card-text class="pt-6">
            <v-form ref="lossForm" v-model="isLossFormValid">
              <v-row>
                <!-- Cliente (readonly) -->
                <v-col cols="12">
                  <v-text-field :model-value="client?.name" label="Cliente" prepend-inner-icon="mdi-account"
                    variant="outlined" density="comfortable" readonly bg-color="grey-lighten-4"></v-text-field>
                </v-col>

                <!-- Motivo da perda -->
                <v-col cols="12">
                  <v-select v-model="newLoss.loss_reason" :items="lossReasonOptions" label="Motivo da perda *"
                    prepend-inner-icon="mdi-help-circle" variant="outlined" density="comfortable"
                    :rules="[(v: string | null) => !!v || 'Selecione o motivo']">
                    <template v-slot:item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template v-slot:prepend>
                          <v-icon :color="getLossReasonColor(item.raw.value)">
                            {{ getLossReasonIcon(item.raw.value) }}
                          </v-icon>
                        </template>
                      </v-list-item>
                    </template>
                  </v-select>
                </v-col>

                <!-- Estágio quando perdido -->
                <v-col cols="12">
                  <v-select v-model="newLoss.loss_stage" :items="lossStageOptions" label="Estágio quando perdido *"
                    prepend-inner-icon="mdi-progress-check" variant="outlined" density="comfortable"
                    :rules="[(v: string | null) => !!v || 'Selecione o estágio']"></v-select>
                </v-col>

                <!-- Detalhes -->
                <v-col cols="12">
                  <v-textarea v-model="newLoss.detailed_reason" label="Detalhes sobre a perda"
                    prepend-inner-icon="mdi-text" variant="outlined" density="comfortable" rows="2" auto-grow
                    placeholder="Descreva o que aconteceu..."></v-textarea>
                </v-col>

                <!-- Feedback do cliente -->
                <v-col cols="12">
                  <v-textarea v-model="newLoss.client_feedback" label="Feedback do cliente"
                    prepend-inner-icon="mdi-comment-quote" variant="outlined" density="comfortable" rows="2" auto-grow
                    placeholder="O que o cliente disse?"></v-textarea>
                </v-col>

                <!-- Info do concorrente -->
                <v-col cols="12" v-if="newLoss.loss_reason === 'BETTER_OFFER_COMPETITOR'">
                  <v-textarea v-model="newLoss.competitor_info" label="Informações sobre o concorrente"
                    prepend-inner-icon="mdi-account-switch" variant="outlined" density="comfortable" rows="2" auto-grow
                    placeholder="Qual concorrente? Qual oferta?"></v-textarea>
                </v-col>

                <!-- Poderia ter sido evitada? -->
                <v-col cols="12">
                  <v-switch v-model="newLoss.could_have_been_prevented" label="Esta perda poderia ter sido evitada?"
                    color="warning" hide-details></v-switch>
                </v-col>

                <!-- Lições aprendidas -->
                <v-col cols="12" v-if="newLoss.could_have_been_prevented">
                  <v-textarea v-model="newLoss.lessons_learned" label="Lições aprendidas"
                    prepend-inner-icon="mdi-lightbulb" variant="outlined" density="comfortable" rows="2" auto-grow
                    placeholder="O que poderia ter sido feito diferente?"></v-textarea>
                </v-col>
              </v-row>
            </v-form>

            <v-alert type="info" variant="tonal" density="compact" class="mt-4">
              <template v-slot:text>
                A IA irá analisar esta perda e gerar insights para evitar situações similares.
                Quanto mais detalhes você fornecer, melhor será a análise.
              </template>
            </v-alert>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="closeLossDialog" :disabled="isCreatingLoss">
              Cancelar
            </v-btn>
            <v-btn color="warning" variant="flat" @click="createLoss" :loading="isCreatingLoss"
              :disabled="!isLossFormValid">
              <v-icon start>mdi-check</v-icon>
              Registrar Perda
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Tabs -->
      <v-card elevation="2" rounded="lg">
        <v-tabs v-model="activeTab" bg-color="primary" slider-color="white">
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
          <v-tab value="journey">
            <v-icon start>mdi-map-marker-path</v-icon>
            Jornada
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
                    item-title="title"
                    item-value="value"
                    @update:model-value="handleStatusChange">
                    <template #item="{ props }">
                      <v-list-item v-bind="props">
                        <template #prepend>
                          <v-chip 
                            :color="getStatusColor(props.value)" 
                            variant="flat" 
                            size="small" 
                            class="mr-2">
                            {{ props.title }}
                          </v-chip>
                        </template>
                      </v-list-item>
                    </template>
                    <template #selection="{ item }">
                      <v-chip 
                        :color="getStatusColor(item.value)" 
                        variant="flat" 
                        size="small">
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
                  <v-select v-model="editableFields.current_urgency_level" :items="urgencyOptions" variant="outlined"
                    density="compact"
                    @update:model-value="handleFieldUpdate('current_urgency_level', $event)"></v-select>
                </v-col>

                <!-- Tipo de Interesse -->
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-handshake</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Tipo de Interesse</span>
                  </div>
                  <v-select v-model="editableFields.current_interest_type" :items="interestTypeOptions"
                    variant="outlined" density="compact" clearable
                    @update:model-value="handleFieldUpdate('current_interest_type', $event)"></v-select>
                </v-col>

                <!-- Tipo de Imóvel -->
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-home-variant</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Tipo de Imóvel</span>
                  </div>
                  <v-select v-model="editableFields.current_property_type" :items="propertyTypeOptions"
                    variant="outlined" density="compact" clearable
                    @update:model-value="handleFieldUpdate('current_property_type', $event)"></v-select>
                </v-col>

                <!-- Cidade de Interesse -->
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-map-marker</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Cidade de Interesse</span>
                  </div>
                  <v-text-field v-model="editableFields.current_city_interest" variant="outlined" density="compact"
                    @blur="handleFieldUpdate('current_city_interest', editableFields.current_city_interest)"></v-text-field>
                </v-col>

                <!-- Orçamento Mínimo -->
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-currency-usd</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Orçamento Mínimo</span>
                  </div>
                  <v-text-field v-model="budgetMinFormatted" @blur="handleBudgetMinUpdate" variant="outlined"
                    density="compact" prefix="R$"></v-text-field>
                </v-col>

                <!-- Orçamento Máximo -->
                <v-col cols="12" md="6">
                  <div class="d-flex align-center mb-2">
                    <v-icon class="mr-2" color="primary">mdi-currency-usd</v-icon>
                    <span class="text-subtitle-1 font-weight-medium">Orçamento Máximo</span>
                  </div>
                  <v-text-field v-model="budgetMaxFormatted" @blur="handleBudgetMaxUpdate" variant="outlined"
                    density="compact" prefix="R$"></v-text-field>
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
              <div v-else-if="clientAttendances.length === 0" class="text-center pa-12">
                <v-icon size="80" color="grey-lighten-1" class="mb-4">mdi-phone-off</v-icon>
                <div class="text-h6 text-medium-emphasis mb-2">Nenhum atendimento registrado</div>
                <div class="text-body-2 text-medium-emphasis mb-6">
                  Os atendimentos deste cliente aparecerão aqui quando forem criados.
                </div>
                <v-btn color="primary" size="large" prepend-icon="mdi-phone-plus" @click="goToCreateAttendance">
                  Criar Primeiro Atendimento
                </v-btn>
              </div>

              <!-- Attendances List -->
              <div v-else>
                <!-- Header -->
                <div class="d-flex justify-space-between align-center mb-6">
                  <div>
                    <div class="text-h5 font-weight-bold mb-1">
                      Atendimentos
                    </div>
                    <div class="text-body-2 text-medium-emphasis">
                      {{ clientAttendances.length }} {{ clientAttendances.length === 1 ? 'atendimento registrado' : 'atendimentos registrados' }}
                    </div>
                  </div>
                  <v-btn 
                    color="primary" 
                    size="large"
                    prepend-icon="mdi-phone-plus" 
                    @click="goToCreateAttendance"
                    elevation="2"
                  >
                    Novo Atendimento
                  </v-btn>
                </div>

                <!-- Timeline Style List -->
                <div class="attendances-timeline">
                  <v-expansion-panels 
                    v-model="expandedAttendances" 
                    variant="accordion"
                    multiple
                    class="mb-4"
                  >
                    <v-expansion-panel
                      v-for="(attendance, index) in clientAttendances"
                      :key="attendance.id"
                      :value="attendance.id"
                      class="attendance-panel mb-4"
                      elevation="2"
                      rounded="lg"
                    >
                      <v-expansion-panel-title class="pa-0">
                        <template #default="{ expanded }">
                          <v-card 
                            :class="['attendance-card-header', { 'expanded': expanded }]"
                            variant="flat"
                            @click.stop="goToAttendance(attendance.id)"
                          >
                            <v-card-text class="pa-4">
                              <div class="d-flex align-start">
                                <!-- Timeline Indicator -->
                                <div class="timeline-indicator mr-4">
                                  <v-avatar 
                                    :color="getChannelColor(attendance.channel)" 
                                    size="56"
                                    class="timeline-avatar"
                                  >
                                    <v-icon color="white" size="28">
                                      {{ getChannelIcon(attendance.channel) }}
                                    </v-icon>
                                  </v-avatar>
                                  <div v-if="index < clientAttendances.length - 1" class="timeline-line"></div>
                                </div>

                                <!-- Content -->
                                <div class="flex-grow-1">
                                  <!-- Header Row -->
                                  <div class="d-flex align-center justify-space-between mb-3">
                                    <div class="d-flex align-center ga-2 flex-wrap">
                                      <v-chip 
                                        :color="getAttendanceStatusColor(attendance.status)" 
                                        variant="flat"
                                        size="small"
                                        class="font-weight-medium"
                                      >
                                        <v-icon start size="16">
                                          {{ getAttendanceStatusIcon(attendance.status) }}
                                        </v-icon>
                                        {{ getAttendanceStatusLabel(attendance.status) }}
                                      </v-chip>
                                      <v-chip 
                                        :color="getChannelColor(attendance.channel)" 
                                        variant="tonal"
                                        size="small"
                                      >
                                        {{ getChannelLabel(attendance.channel) }}
                                      </v-chip>
                                    </div>
                                    <div class="text-body-2 font-weight-medium text-medium-emphasis">
                                      <v-icon size="16" class="mr-1">mdi-clock-outline</v-icon>
                                      {{ formatDateTime(attendance.started_at) }}
                                    </div>
                                  </div>

                                  <!-- AI Summary (Always visible) -->
                                  <div v-if="attendance.ai_summary" class="mb-3">
                                    <div class="text-subtitle-1 font-weight-bold mb-2 d-flex align-center">
                                      <v-icon size="20" color="primary" class="mr-2">mdi-robot</v-icon>
                                      Resumo da IA
                                    </div>
                                    <div 
                                      class="text-body-1 ai-summary-content pa-3 rounded"
                                      v-html="formatMarkdown(attendance.ai_summary)"
                                    ></div>
                                  </div>

                                  <!-- Raw Content (if no AI summary) -->
                                  <div v-else-if="attendance.raw_content" class="mb-3">
                                    <div class="text-subtitle-1 font-weight-bold mb-2 d-flex align-center">
                                      <v-icon size="20" color="grey" class="mr-2">mdi-text</v-icon>
                                      Conteúdo do Atendimento
                                    </div>
                                    <div class="text-body-1 raw-content-full pa-3 rounded bg-grey-lighten-5">
                                      {{ attendance.raw_content }}
                                    </div>
                                  </div>

                                  <!-- Next Steps -->
                                  <div 
                                    v-if="attendance.ai_next_steps && hasValidNextSteps(attendance.ai_next_steps)"
                                    class="mb-2"
                                  >
                                    <div class="text-subtitle-1 font-weight-bold mb-2 d-flex align-center">
                                      <v-icon size="20" color="success" class="mr-2">mdi-arrow-right-circle</v-icon>
                                      Próximos Passos
                                    </div>
                                    <div 
                                      class="text-body-1 ai-next-steps-content pa-3 rounded bg-success-lighten-5"
                                      v-html="formatMarkdown(formatAINextSteps(attendance.ai_next_steps))"
                                    ></div>
                                  </div>

                                  <!-- Metadata Footer -->
                                  <div class="d-flex align-center ga-4 mt-3 pt-3 border-t">
                                    <div v-if="attendance.duration" class="d-flex align-center text-caption text-medium-emphasis">
                                      <v-icon size="16" class="mr-1">mdi-timer-outline</v-icon>
                                      Duração: {{ formatDuration(attendance.duration) }}
                                    </div>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                      variant="text"
                                      size="small"
                                      prepend-icon="mdi-open-in-new"
                                      @click.stop="goToAttendance(attendance.id)"
                                    >
                                      Ver Detalhes
                                    </v-btn>
                                  </div>
                                </div>
                              </div>
                            </v-card-text>
                          </v-card>
                        </template>
                      </v-expansion-panel-title>

                      <v-expansion-panel-text class="pa-0">
                        <v-card variant="flat" class="attendance-card-expanded">
                          <v-card-text class="pa-6">
                            <!-- Full Content View -->
                            <v-row>
                              <!-- Main Content -->
                              <v-col cols="12" md="8">
                                <!-- Full AI Summary -->
                                <div v-if="attendance.ai_summary" class="mb-6">
                                  <div class="text-h6 font-weight-bold mb-3 d-flex align-center">
                                    <v-icon size="24" color="primary" class="mr-2">mdi-robot</v-icon>
                                    Resumo Completo da IA
                                  </div>
                                  <div 
                                    class="text-body-1 ai-summary-full pa-4 rounded-lg bg-primary-lighten-5"
                                    v-html="formatMarkdown(attendance.ai_summary)"
                                  ></div>
                                </div>

                                <!-- Full Raw Content -->
                                <div v-if="attendance.raw_content" class="mb-6">
                                  <div class="text-h6 font-weight-bold mb-3 d-flex align-center">
                                    <v-icon size="24" color="grey" class="mr-2">mdi-text</v-icon>
                                    Conteúdo Original
                                  </div>
                                  <div class="text-body-1 raw-content-full pa-4 rounded-lg bg-grey-lighten-5">
                                    {{ attendance.raw_content }}
                                  </div>
                                </div>

                                <!-- Full Next Steps -->
                                <div 
                                  v-if="attendance.ai_next_steps && hasValidNextSteps(attendance.ai_next_steps)"
                                  class="mb-6"
                                >
                                  <div class="text-h6 font-weight-bold mb-3 d-flex align-center">
                                    <v-icon size="24" color="success" class="mr-2">mdi-arrow-right-circle</v-icon>
                                    Próximos Passos Sugeridos
                                  </div>
                                  <div 
                                    class="text-body-1 ai-next-steps-full pa-4 rounded-lg bg-success-lighten-5"
                                    v-html="formatMarkdown(formatAINextSteps(attendance.ai_next_steps))"
                                  ></div>
                                </div>
                              </v-col>

                              <!-- Sidebar Info -->
                              <v-col cols="12" md="4">
                                <v-card variant="outlined" class="mb-4">
                                  <v-card-title class="text-subtitle-1 font-weight-bold">
                                    Informações
                                  </v-card-title>
                                  <v-card-text>
                                    <div class="d-flex flex-column ga-3">
                                      <div>
                                        <div class="text-caption text-medium-emphasis mb-1">Status</div>
                                        <v-chip 
                                          :color="getAttendanceStatusColor(attendance.status)" 
                                          variant="flat"
                                          size="small"
                                        >
                                          {{ getAttendanceStatusLabel(attendance.status) }}
                                        </v-chip>
                                      </div>
                                      <div>
                                        <div class="text-caption text-medium-emphasis mb-1">Canal</div>
                                        <v-chip 
                                          :color="getChannelColor(attendance.channel)" 
                                          variant="tonal"
                                          size="small"
                                        >
                                          {{ getChannelLabel(attendance.channel) }}
                                        </v-chip>
                                      </div>
                                      <div v-if="attendance.duration">
                                        <div class="text-caption text-medium-emphasis mb-1">Duração</div>
                                        <div class="text-body-2 font-weight-medium">
                                          {{ formatDuration(attendance.duration) }}
                                        </div>
                                      </div>
                                      <div>
                                        <div class="text-caption text-medium-emphasis mb-1">Data/Hora</div>
                                        <div class="text-body-2 font-weight-medium">
                                          {{ formatDateTime(attendance.started_at) }}
                                        </div>
                                      </div>
                                    </div>
                                  </v-card-text>
                                </v-card>

                                <v-btn
                                  block
                                  color="primary"
                                  variant="flat"
                                  prepend-icon="mdi-open-in-new"
                                  @click="goToAttendance(attendance.id)"
                                  size="large"
                                >
                                  Ver Detalhes Completos
                                </v-btn>
                              </v-col>
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>
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
                        <v-chip v-if="aiSummaries.length > 0" color="primary" variant="flat" size="small">
                          {{ aiSummaries.length }} atendimento(s) analisado(s)
                        </v-chip>
                      </v-card-title>
                      <v-card-text>
                        <div v-if="aggregatedInsights.clientSummary" class="text-body-1 mb-4"
                          v-html="formatMarkdown(aggregatedInsights.clientSummary)"></div>
                        <div v-else-if="client.summary_notes" class="text-body-1"
                          v-html="formatMarkdown(client.summary_notes)"></div>
                        <v-alert v-else type="info" variant="tonal">
                          Nenhum resumo disponível. O resumo será gerado automaticamente pela IA com base nos
                          atendimentos.
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
                            <v-icon :color="getSentimentColor(aggregatedInsights.sentimentAnalysis.dominant)" size="64"
                              class="mb-2">
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
                            <div v-for="(count, sentiment) in aggregatedInsights.sentimentAnalysis.distribution"
                              :key="sentiment" class="d-flex align-center justify-space-between">
                              <div class="d-flex align-center ga-2">
                                <v-icon :color="getSentimentColor(sentiment)" size="20">
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
                        <div v-if="aggregatedInsights.intents && aggregatedInsights.intents.length > 0"
                          class="d-flex flex-column ga-2">
                          <v-chip v-for="intent in aggregatedInsights.intents" :key="intent.intent"
                            :color="getIntentColor(intent.intent)" variant="flat" class="mb-1">
                            <v-icon start size="16">{{ getIntentIcon(intent.intent) }}</v-icon>
                            {{ getIntentLabel(intent.intent) }}
                            <v-chip size="x-small" variant="text" class="ml-2">
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
                          <div v-if="client.current_budget_min || client.current_budget_max"
                            class="d-flex align-center ga-2">
                            <v-icon color="primary">mdi-currency-usd</v-icon>
                            <div>
                              <div class="text-caption text-medium-emphasis">Orçamento</div>
                              <div class="text-body-1 font-weight-medium">
                                {{ formatBudgetRange(
                                  client.current_budget_min ? parseFloat(client.current_budget_min) : null,
                                  client.current_budget_max ? parseFloat(client.current_budget_max) : null
                                ) }}
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
                            <v-progress-linear :model-value="client.current_lead_score"
                              :color="getLeadScoreColor(client.current_lead_score)" height="32"
                              rounded></v-progress-linear>
                            <div class="text-center mt-2">
                              <span class="text-h6 font-weight-bold">
                                {{ client.current_lead_score }}/100
                              </span>
                            </div>
                          </div>
                          <v-alert :type="getLeadScoreAlertType(client.current_lead_score)" variant="tonal">
                            {{ getLeadScoreMessage(client.current_lead_score) }}
                          </v-alert>
                          <div v-if="aggregatedInsights.averageLeadScore !== null"
                            class="text-caption text-medium-emphasis">
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
                          <v-col v-for="property in recommendedProperties" :key="property.id" cols="12" sm="6" md="4">
                            <v-card variant="outlined" class="h-100 property-card" @click="goToProperty(property.id)">
                              <v-card-text class="pa-3">
                                <div class="d-flex align-center mb-2">
                                  <v-avatar v-if="property.main_image_url" size="56" class="mr-3" rounded="lg">
                                    <v-img :src="property.main_image_url" cover></v-img>
                                  </v-avatar>
                                  <v-avatar v-else color="primary" size="56" class="mr-3" rounded="lg">
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
                                <v-chip :color="getPropertyStatusColor(property.status)" variant="flat" size="x-small"
                                  class="mb-2">
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
                          <v-col v-for="property in profileBasedProperties" :key="property.id" cols="12" sm="6" md="4">
                            <v-card variant="outlined" class="h-100 property-card" @click="goToProperty(property.id)">
                              <v-card-text class="pa-3">
                                <div class="d-flex align-center mb-2">
                                  <v-avatar v-if="property.main_image_url" size="56" class="mr-3" rounded="lg">
                                    <v-img :src="property.main_image_url" cover></v-img>
                                  </v-avatar>
                                  <v-avatar v-else color="info" size="56" class="mr-3" rounded="lg">
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
                                <v-chip :color="getPropertyStatusColor(property.status)" variant="flat" size="x-small"
                                  class="mb-2">
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
                          <v-expansion-panel v-for="summary in aiSummaries" :key="summary.id">
                            <v-expansion-panel-title>
                              <div class="d-flex align-center w-100 pr-4">
                                <v-icon :color="getAIStatusColor(summary.status)" class="mr-3" size="24">
                                  {{ getAIStatusIcon(summary.status) }}
                                </v-icon>
                                <div class="flex-grow-1">
                                  <div class="d-flex align-center justify-space-between">
                                    <div class="text-body-2 font-weight-medium">
                                      {{ formatDateTime(summary.created_at) }}
                                    </div>
                                    <div class="d-flex align-center ga-1">
                                      <v-chip v-if="summary.sentiment" :color="getSentimentColor(summary.sentiment)"
                                        size="x-small" variant="flat">
                                        <v-icon start size="12">{{ getSentimentIcon(summary.sentiment) }}</v-icon>
                                        {{ getSentimentLabel(summary.sentiment) }}
                                      </v-chip>
                                      <v-chip v-if="summary.lead_score_suggested"
                                        :color="getLeadScoreColor(summary.lead_score_suggested)" size="x-small"
                                        variant="flat">
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
                                <div class="markdown-content ai-summary-content"
                                  v-html="formatMarkdown(summary.summary_text)"></div>
                              </div>

                              <!-- Key Points -->
                              <div v-if="summary.key_points && Object.keys(summary.key_points).length > 0" class="mb-4">
                                <div class="text-subtitle-2 font-weight-medium mb-2 d-flex align-center">
                                  <v-icon size="16" color="success" class="mr-1">mdi-format-list-bulleted</v-icon>
                                  Pontos-chave
                                </div>
                                <div class="d-flex flex-wrap ga-2">
                                  <template v-if="summary.key_points.topics">
                                    <v-chip v-for="topic in summary.key_points.topics" :key="topic" size="small"
                                      variant="tonal" color="primary">
                                      {{ topic }}
                                    </v-chip>
                                  </template>
                                  <template v-if="summary.key_points.requirements">
                                    <v-chip v-for="req in summary.key_points.requirements" :key="req" size="small"
                                      variant="tonal" color="info">
                                      {{ req }}
                                    </v-chip>
                                  </template>
                                </div>
                              </div>

                              <!-- AI Analysis -->
                              <div class="d-flex flex-wrap ga-2">
                                <v-chip v-if="summary.detected_intent" :color="getIntentColor(summary.detected_intent)"
                                  variant="flat" size="small">
                                  <v-icon start size="14">{{ getIntentIcon(summary.detected_intent) }}</v-icon>
                                  {{ getIntentLabel(summary.detected_intent) }}
                                </v-chip>
                                <v-chip v-if="summary.interest_type_detected" color="teal" variant="flat" size="small">
                                  <v-icon start size="14">mdi-handshake</v-icon>
                                  {{ getInterestTypeLabel(summary.interest_type_detected as InterestType) }}
                                </v-chip>
                                <v-chip v-if="summary.urgency_level_detected"
                                  :color="getUrgencyColor(summary.urgency_level_detected as UrgencyLevel)"
                                  variant="flat" size="small">
                                  <v-icon start size="14">mdi-alert-circle</v-icon>
                                  Urgência: {{ getUrgencyLabel(summary.urgency_level_detected as UrgencyLevel) }}
                                </v-chip>
                                <v-chip v-if="summary.budget_min_detected || summary.budget_max_detected" color="amber"
                                  variant="flat" size="small">
                                  <v-icon start size="14">mdi-currency-usd</v-icon>
                                  {{ formatBudgetDetected(summary.budget_min_detected, summary.budget_max_detected) }}
                                </v-chip>
                              </div>

                              <!-- Recommended Properties -->
                              <div v-if="summary.recommended_properties && summary.recommended_properties.length > 0"
                                class="mt-4">
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
                            <v-list-item v-for="(step, index) in aggregatedInsights.nextSteps" :key="index">
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
                          As sugestões de próximos passos serão geradas automaticamente pela IA com base no histórico de
                          atendimentos e perfil do cliente.
                        </v-alert>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-window-item>

            <!-- Tab 4: Jornada do Cliente -->
            <v-window-item value="journey">
              <ClientJourneyPanel :client-id="clientId" />
            </v-window-item>

            <!-- Tab 5: Follow-up -->
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
                          <div :class="getFollowUpClass(client.next_follow_up_at)"
                            class="text-caption font-weight-medium mt-2">
                            {{ getFollowUpStatus(client.next_follow_up_at) }}
                          </div>
                        </div>
                        <v-btn color="primary" prepend-icon="mdi-calendar-plus" @click="showScheduleDialog = true">
                          Reagendar
                        </v-btn>
                      </div>
                      <div v-else class="d-flex flex-column ga-3">
                        <v-alert type="warning" variant="tonal">
                          Nenhum follow-up agendado.
                        </v-alert>
                        <v-btn color="primary" prepend-icon="mdi-calendar-plus" @click="showScheduleDialog = true">
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
      <v-btn color="primary" prepend-icon="mdi-arrow-left" @click="goBack">
        Voltar para Lista
      </v-btn>
    </v-card>

    <!-- Edit Client Dialog -->
    <ClientCreateDialog v-model="showEditDialog" :client="client" @saved="handleClientSaved"
      @error="handleClientError" />
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
import { salesService } from '@/shared/services/sales.service'
import {
  lossesService,
  lossReasonOptions,
  lossStageOptions,
  getLossReasonColor,
  getLossReasonIcon,
} from '@/shared/services/losses.service'
import { attendancesService, type Attendance } from '@/shared/services/attendances.service'
import { formatPhone, formatCurrency, parseCurrency } from '@/shared/utils/masks'
import ClientCreateDialog from '@/shared/components/ClientCreateDialog.vue'
import ClientJourneyPanel from '@/shared/components/ClientJourneyPanel.vue'
// Markdown formatting (using simple parser, not marked library)

const route = useRoute()
const router = useRouter()

// Computed
const clientId = computed(() => route.params.id as string)

// State
const client = ref<Client | null>(null)
const isLoading = ref(true)
const isLoadingAIInsights = ref(false)
const isLoadingAttendances = ref(false)
const isDeleting = ref(false)
const activeTab = ref('overview')
const showScheduleDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const showSaleDialog = ref(false)
const isSaleFormValid = ref(false)
const isCreatingSale = ref(false)
const isLoadingProperties = ref(false)
const availableProperties = ref<Property[]>([])
const saleForm = ref()
const newSale = ref<{
  sale_type: string
  property_id: string | null
  sale_value: number | null
  commission_percentage: number | null
  down_payment: number | null
  payment_method: string | null
  rent_duration_months: number | null
  rent_start_date: string | null
  notes: string | null
}>({
  sale_type: 'SALE',
  property_id: null,
  sale_value: null,
  commission_percentage: 5,
  down_payment: null,
  payment_method: null,
  rent_duration_months: null,
  rent_start_date: null,
  notes: null,
})

const paymentMethodOptions = [
  { title: 'À Vista', value: 'CASH' },
  { title: 'Financiamento', value: 'FINANCING' },
  { title: 'Parcelado', value: 'INSTALLMENTS' },
  { title: 'Misto', value: 'MIXED' },
]

// Loss registration
const showLossDialog = ref(false)
const isLossFormValid = ref(false)
const isCreatingLoss = ref(false)
const lossForm = ref()
const newLoss = ref<{
  loss_reason: string | null
  loss_stage: string | null
  detailed_reason: string | null
  client_feedback: string | null
  competitor_info: string | null
  could_have_been_prevented: boolean | null
  lessons_learned: string | null
}>({
  loss_reason: null,
  loss_stage: null,
  detailed_reason: null,
  client_feedback: null,
  competitor_info: null,
  could_have_been_prevented: false,
  lessons_learned: null,
})

const aiSummaries = ref<AISummary[]>([])
const recommendedProperties = ref<Property[]>([])
const profileBasedProperties = ref<Property[]>([])
const clientAttendances = ref<Attendance[]>([])
const expandedAttendances = ref<string[]>([])

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

const handleStatusChange = async (newStatus: ClientStatus) => {
  if (!client.value) return
  
  // Update local state immediately for better UX
  editableFields.value.current_status = newStatus
  
  try {
    const updateData: ClientUpdate = {
      current_status: newStatus,
    }

    client.value = await clientsService.updateClient(client.value.id, updateData)
  } catch (error: any) {
    console.error('Error updating status:', error)
    alert(`Erro ao atualizar status: ${error.message}`)
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

const getAttendanceStatusIcon = (status: string): string => {
  const icons: Record<string, string> = {
    IN_PROGRESS: 'mdi-clock-outline',
    COMPLETED: 'mdi-check-circle',
    CANCELLED: 'mdi-cancel',
    PAUSED: 'mdi-pause-circle',
  }
  return icons[status] || 'mdi-circle'
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

// Delete client handler
const handleDeleteClient = async () => {
  if (!client.value) return

  isDeleting.value = true
  try {
    await clientsService.deleteClient(client.value.id)
    showDeleteDialog.value = false
    router.push({ name: 'clients' })
  } catch (error: any) {
    console.error('Error deleting client:', error)
    alert(`Erro ao excluir cliente: ${error?.message || 'Erro desconhecido'}`)
  } finally {
    isDeleting.value = false
  }
}

// Sale registration functions
const openSaleDialog = async () => {
  showSaleDialog.value = true
  // Load available properties
  isLoadingProperties.value = true
  try {
    availableProperties.value = await propertiesService.listProperties({ status: 'PUBLISHED' })
  } catch (error) {
    console.error('Error loading properties:', error)
  } finally {
    isLoadingProperties.value = false
  }
}

const closeSaleDialog = () => {
  showSaleDialog.value = false
  newSale.value = {
    sale_type: 'SALE',
    property_id: null,
    sale_value: null,
    commission_percentage: 5,
    down_payment: null,
    payment_method: null,
    rent_duration_months: null,
    rent_start_date: null,
    notes: null,
  }
}

const createSale = async () => {
  if (!client.value || !isSaleFormValid.value) return

  isCreatingSale.value = true
  try {
    await salesService.createSale({
      client_id: client.value.id,
      property_id: newSale.value.property_id || undefined,
      sale_type: newSale.value.sale_type as 'SALE' | 'RENT',
      sale_value: newSale.value.sale_value!,
      commission_percentage: newSale.value.commission_percentage || undefined,
      down_payment: newSale.value.down_payment || undefined,
      payment_method: newSale.value.payment_method as any || undefined,
      rent_duration_months: newSale.value.rent_duration_months || undefined,
      rent_start_date: newSale.value.rent_start_date || undefined,
      notes: newSale.value.notes || undefined,
    })
    closeSaleDialog()
    // Reload client to get updated status
    await loadClient()
    alert('Venda registrada com sucesso! 🎉')
  } catch (error: any) {
    console.error('Error creating sale:', error)
    alert(`Erro ao registrar venda: ${error?.message || 'Erro desconhecido'}`)
  } finally {
    isCreatingSale.value = false
  }
}

const formatPropertyPrice = (property: Property): string => {
  const price = property.price || property.rent_price || 0
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(price)
}

// Loss registration functions
const openLossDialog = () => {
  // Set initial stage based on current client status
  const statusToStage: Record<string, string> = {
    'NEW_LEAD': 'INITIAL_CONTACT',
    'CONTACTED': 'QUALIFICATION',
    'QUALIFIED': 'QUALIFICATION',
    'VISIT_SCHEDULED': 'VISIT_SCHEDULED',
    'VISITING': 'VISIT_COMPLETED',
    'PROPOSAL_SENT': 'PROPOSAL',
    'NEGOTIATING': 'NEGOTIATION',
  }
  newLoss.value.loss_stage = statusToStage[client.value?.current_status || ''] || 'INITIAL_CONTACT'
  showLossDialog.value = true
}

const closeLossDialog = () => {
  showLossDialog.value = false
  newLoss.value = {
    loss_reason: null,
    loss_stage: null,
    detailed_reason: null,
    client_feedback: null,
    competitor_info: null,
    could_have_been_prevented: false,
    lessons_learned: null,
  }
}

const createLoss = async () => {
  if (!client.value || !isLossFormValid.value) return

  isCreatingLoss.value = true
  try {
    await lossesService.createLoss({
      client_id: client.value.id,
      loss_reason: newLoss.value.loss_reason as any,
      loss_stage: newLoss.value.loss_stage as any,
      detailed_reason: newLoss.value.detailed_reason || undefined,
      client_feedback: newLoss.value.client_feedback || undefined,
      competitor_info: newLoss.value.competitor_info || undefined,
      could_have_been_prevented: newLoss.value.could_have_been_prevented || undefined,
      lessons_learned: newLoss.value.lessons_learned || undefined,
    })
    closeLossDialog()
    // Reload client to get updated status
    await loadClient()
    alert('Perda registrada. A IA irá analisar este caso para gerar insights.')
  } catch (error: any) {
    console.error('Error creating loss:', error)
    alert(`Erro ao registrar perda: ${error?.message || 'Erro desconhecido'}`)
  } finally {
    isCreatingLoss.value = false
  }
}

// Helper functions for header
const getDaysSinceContact = (lastContactAt: string | null): string => {
  if (!lastContactAt) return '-'
  const days = Math.floor((Date.now() - new Date(lastContactAt).getTime()) / (1000 * 60 * 60 * 24))
  return String(days)
}

const getDaysSinceContactColor = (lastContactAt: string | null): string => {
  if (!lastContactAt) return 'text-grey'
  const days = Math.floor((Date.now() - new Date(lastContactAt).getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 3) return 'text-success'
  if (days <= 7) return 'text-warning'
  return 'text-error'
}

const formatBudgetRange = (min: number | null, max: number | null): string => {
  if (!min && !max) return '-'

  const formatValue = (val: number): string => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(0)}K`
    }
    return val.toLocaleString('pt-BR')
  }

  if (min && max) {
    return `R$ ${formatValue(min)} - ${formatValue(max)}`
  }
  if (min) {
    return `A partir de R$ ${formatValue(min)}`
  }
  if (max) {
    return `Até R$ ${formatValue(max)}`
  }
  return '-'
}

const getLeadSourceLabel = (source: string): string => {
  const labels: Record<string, string> = {
    WEBSITE: 'Website',
    REFERRAL: 'Indicação',
    SOCIAL_MEDIA: 'Redes Sociais',
    PHONE: 'Telefone',
    EMAIL: 'E-mail',
    WALK_IN: 'Presencial',
    AD_CAMPAIGN: 'Campanha',
    OTHER: 'Outro',
  }
  return labels[source] || source
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
})
</script>

<style scoped>
/* Modern Header Styles */
.client-header {
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

/* Attendances Timeline Styles */
.attendances-timeline {
  position: relative;
}

.attendance-panel {
  border-radius: 12px;
  overflow: hidden;
}

.attendance-card-header {
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.attendance-card-header:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
  border-left-color: rgb(var(--v-theme-primary));
}

.attendance-card-header.expanded {
  border-left-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.06);
}

.timeline-indicator {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 56px;
}

.timeline-avatar {
  z-index: 2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 3px solid white;
}

.timeline-line {
  width: 2px;
  flex: 1;
  min-height: 40px;
  background: linear-gradient(
    to bottom,
    rgb(var(--v-theme-primary)) 0%,
    rgba(var(--v-theme-primary), 0.3) 100%
  );
  margin-top: 8px;
  border-radius: 2px;
}

.attendance-card-expanded {
  background-color: rgba(var(--v-theme-surface), 1);
}

/* Content Styles */
.ai-summary-content,
.ai-next-steps-content,
.raw-content-full {
  line-height: 1.8;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.ai-summary-content {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.ai-next-steps-content {
  background-color: rgba(var(--v-theme-success), 0.05);
  border-left: 4px solid rgb(var(--v-theme-success));
}

.raw-content-full {
  background-color: rgba(var(--v-theme-grey), 0.05);
  border-left: 4px solid rgb(var(--v-theme-grey));
  font-family: 'Roboto Mono', monospace;
  font-size: 0.9em;
}

.ai-summary-full,
.ai-next-steps-full {
  line-height: 1.8;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.ai-summary-full {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.ai-next-steps-full {
  background-color: rgba(var(--v-theme-success), 0.05);
  border-left: 4px solid rgb(var(--v-theme-success));
}

/* Markdown Styles */
:deep(.markdown-list) {
  margin: 12px 0;
  padding-left: 24px;
}

:deep(.markdown-list li) {
  margin: 8px 0;
  line-height: 1.6;
}

:deep(.markdown-list ul),
:deep(.markdown-list ol) {
  margin-top: 8px;
  margin-bottom: 8px;
}

:deep(.markdown-spacer) {
  height: 12px;
}

:deep(.markdown-code) {
  background-color: rgba(var(--v-theme-grey), 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.9em;
}

:deep(.markdown-link) {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  font-weight: 500;
}

:deep(.markdown-link:hover) {
  text-decoration: underline;
}

:deep(.markdown-h1),
:deep(.markdown-h2),
:deep(.markdown-h3) {
  margin-top: 16px;
  margin-bottom: 8px;
  font-weight: 600;
}

:deep(.markdown-h1) {
  font-size: 1.5em;
}

:deep(.markdown-h2) {
  font-size: 1.3em;
}

:deep(.markdown-h3) {
  font-size: 1.1em;
}

/* Border Top Utility */
.border-t {
  border-top: 1px solid rgba(var(--v-border-color), 0.12);
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .timeline-indicator {
    min-width: 48px;
  }

  .timeline-avatar {
    width: 48px !important;
    height: 48px !important;
  }
}

.header-gradient {
  background: linear-gradient(135deg,
      rgb(var(--v-theme-primary)) 0%,
      rgb(var(--v-theme-primary-darken-1), 0.9) 50%,
      rgb(var(--v-theme-secondary)) 100%);
  position: relative;
}

.header-gradient::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.5;
}

.header-content {
  position: relative;
  z-index: 1;
}

.avatar-ring {
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.metrics-bar {
  background: rgb(var(--v-theme-surface));
  border-top: 1px solid rgba(var(--v-border-color), 0.12);
}

.border-start {
  border-left: 1px solid rgba(var(--v-border-color), 0.12);
}

.text-white-darken-1 {
  color: rgba(255, 255, 255, 0.85) !important;
}

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
