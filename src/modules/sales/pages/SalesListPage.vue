<template>
  <div class="sales-page">
    <!-- Header com gradiente -->
    <v-card class="sales-header-card mb-6" rounded="lg" elevation="4">
      <v-card-text class="py-6 px-8">
        <v-row align="center" justify="space-between">
          <v-col cols="12" md="auto">
            <div class="d-flex align-center">
              <v-avatar size="56" class="mr-4 sales-icon-avatar">
                <v-icon size="32" color="white">mdi-handshake</v-icon>
              </v-avatar>
              <div>
                <h1 class="text-h4 font-weight-bold text-white mb-1">Vendas & Aluguéis</h1>
                <p class="text-body-1 text-white-alpha mb-0">
                  Gerencie negociações fechadas e em andamento
                </p>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="auto">
            <v-btn
              color="white"
              size="large"
              prepend-icon="mdi-plus"
              @click="showCreateDialog = true"
              class="font-weight-bold"
            >
              Nova Venda
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Stats Bar -->
      <v-card-actions class="pa-4 stats-bar">
        <v-row no-gutters>
          <v-col cols="6" sm="3" class="pa-2">
            <div class="stat-item">
              <v-icon color="success" size="28" class="mb-1">mdi-check-circle</v-icon>
              <div class="text-h5 font-weight-bold">{{ stats.completed_count }}</div>
              <div class="text-caption text-medium-emphasis">Concluídas</div>
            </div>
          </v-col>
          <v-col cols="6" sm="3" class="pa-2">
            <div class="stat-item">
              <v-icon color="warning" size="28" class="mb-1">mdi-clock-outline</v-icon>
              <div class="text-h5 font-weight-bold">{{ stats.pending_count }}</div>
              <div class="text-caption text-medium-emphasis">Em Andamento</div>
            </div>
          </v-col>
          <v-col cols="6" sm="3" class="pa-2">
            <div class="stat-item">
              <v-icon color="primary" size="28" class="mb-1">mdi-currency-usd</v-icon>
              <div class="text-h5 font-weight-bold">{{ formatCurrencyCompact(stats.total_value) }}</div>
              <div class="text-caption text-medium-emphasis">Valor Total</div>
            </div>
          </v-col>
          <v-col cols="6" sm="3" class="pa-2">
            <div class="stat-item">
              <v-icon color="secondary" size="28" class="mb-1">mdi-percent</v-icon>
              <div class="text-h5 font-weight-bold">{{ formatCurrencyCompact(stats.total_commission) }}</div>
              <div class="text-caption text-medium-emphasis">Comissões</div>
            </div>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>

    <!-- Filtros -->
    <v-card class="mb-4" rounded="lg" elevation="1">
      <v-card-text class="py-3">
        <v-row align="center" dense>
          <v-col cols="12" sm="4" md="3">
            <v-select
              v-model="filters.sale_type"
              :items="saleTypeOptions"
              label="Tipo"
              density="compact"
              variant="outlined"
              clearable
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4" md="3">
            <v-select
              v-model="filters.sale_status"
              :items="saleStatusOptions"
              label="Status"
              density="compact"
              variant="outlined"
              clearable
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4" md="3">
            <v-text-field
              v-model="searchQuery"
              label="Buscar cliente..."
              density="compact"
              variant="outlined"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3" class="d-flex justify-end">
            <v-btn
              variant="text"
              prepend-icon="mdi-refresh"
              @click="loadSales"
              :loading="isLoading"
            >
              Atualizar
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Lista de vendas -->
    <v-card rounded="lg" elevation="1">
      <v-data-table
        :headers="headers"
        :items="filteredSales"
        :loading="isLoading"
        :items-per-page="10"
        class="sales-table"
        hover
      >
        <!-- Tipo -->
        <template v-slot:item.sale_type="{ item }">
          <v-chip
            :color="item.sale_type === 'SALE' ? 'primary' : 'secondary'"
            variant="flat"
            size="small"
            class="font-weight-medium"
          >
            <v-icon start size="16">{{ item.sale_type === 'SALE' ? 'mdi-home-plus' : 'mdi-key' }}</v-icon>
            {{ getSaleTypeLabel(item.sale_type) }}
          </v-chip>
        </template>

        <!-- Cliente -->
        <template v-slot:item.client_name="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="36" color="primary" class="mr-3">
              <span class="text-body-2 text-white">{{ getInitials(item.client_name) }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.client_name || 'Cliente não informado' }}</div>
              <div class="text-caption text-medium-emphasis" v-if="item.property_title">
                {{ item.property_title }}
              </div>
            </div>
          </div>
        </template>

        <!-- Valor -->
        <template v-slot:item.sale_value="{ item }">
          <div class="font-weight-bold text-success">
            {{ formatCurrency(item.sale_value) }}
          </div>
          <div class="text-caption text-medium-emphasis" v-if="item.commission_value">
            Comissão: {{ formatCurrency(item.commission_value) }}
          </div>
        </template>

        <!-- Status -->
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getSaleStatusColor(item.status)"
            variant="flat"
            size="small"
            class="font-weight-medium"
          >
            <v-icon start size="16">{{ getSaleStatusIcon(item.status) }}</v-icon>
            {{ getSaleStatusLabel(item.status) }}
          </v-chip>
        </template>

        <!-- Data -->
        <template v-slot:item.created_at="{ item }">
          <div class="text-body-2">{{ formatDate(item.created_at) }}</div>
          <div class="text-caption text-medium-emphasis">{{ formatRelativeDate(item.created_at) }}</div>
        </template>

        <!-- Corretor -->
        <template v-slot:item.broker_name="{ item }">
          <div class="text-body-2">{{ item.broker_name || '-' }}</div>
        </template>

        <!-- Ações -->
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            size="small"
            variant="text"
            color="primary"
            @click="viewSale(item)"
          >
            <v-icon>mdi-eye</v-icon>
            <v-tooltip activator="parent" location="top">Ver detalhes</v-tooltip>
          </v-btn>
          <v-btn
            v-if="item.status !== 'COMPLETED' && item.status !== 'CANCELLED'"
            icon
            size="small"
            variant="text"
            color="success"
            @click="openCompleteDialog(item)"
          >
            <v-icon>mdi-check</v-icon>
            <v-tooltip activator="parent" location="top">Concluir</v-tooltip>
          </v-btn>
          <v-btn
            v-if="item.status !== 'COMPLETED' && item.status !== 'CANCELLED'"
            icon
            size="small"
            variant="text"
            color="error"
            @click="openCancelDialog(item)"
          >
            <v-icon>mdi-close</v-icon>
            <v-tooltip activator="parent" location="top">Cancelar</v-tooltip>
          </v-btn>
        </template>

        <!-- Empty state -->
        <template v-slot:no-data>
          <div class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-handshake-outline</v-icon>
            <h3 class="text-h6 text-grey mb-2">Nenhuma venda encontrada</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Registre a primeira venda ou aluguel do sistema.
            </p>
            <v-btn color="primary" @click="showCreateDialog = true" prepend-icon="mdi-plus">
              Nova Venda
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog de criação de venda -->
    <v-dialog v-model="showCreateDialog" max-width="700" persistent>
      <v-card rounded="lg">
        <v-toolbar color="primary" density="compact">
          <v-toolbar-title class="text-white font-weight-bold">
            <v-icon start>mdi-handshake</v-icon>
            Registrar Nova Venda
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="closeCreateDialog">
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pt-6">
          <v-form ref="createForm" v-model="isCreateFormValid">
            <v-row>
              <!-- Tipo de venda -->
              <v-col cols="12">
                <v-btn-toggle
                  v-model="newSale.sale_type"
                  mandatory
                  color="primary"
                  class="w-100"
                >
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

              <!-- Cliente -->
              <v-col cols="12">
                <SearchSelectDialog
                  v-model="newSale.client_id"
                  label="Cliente *"
                  dialog-title="Buscar Cliente"
                  icon="mdi-account"
                  icon-color="primary"
                  item-icon="mdi-account"
                  placeholder="Clique para buscar cliente..."
                  hint="Selecione o cliente da venda"
                  :persistent-hint="true"
                  :rules="[(v: string | null) => !!v || 'Cliente é obrigatório']"
                  :items="clientSearchItems"
                  :total-items="clientsTotalItems"
                  :items-per-page="clientsPerPage"
                  :is-loading="isLoadingClients"
                  display-field="name"
                  @search="handleClientSearch"
                  @select="handleClientSelect"
                >
                  <template #item-prepend="{ item }">
                    <v-avatar color="primary" size="40" class="mr-3">
                      <span class="text-caption text-white">
                        {{ getInitials(item.name || '') }}
                      </span>
                    </v-avatar>
                  </template>
                  <template #item-title="{ item }">
                    {{ item.name }}
                  </template>
                  <template #item-subtitle="{ item }">
                    <span v-if="item.phone">{{ formatPhone(item.phone) }}</span>
                    <span v-else-if="item.email">{{ item.email }}</span>
                  </template>
                </SearchSelectDialog>
              </v-col>

              <!-- Imóvel -->
              <v-col cols="12">
                <SearchSelectDialog
                  v-model="newSale.property_id"
                  label="Imóvel (Opcional)"
                  dialog-title="Buscar Propriedade"
                  icon="mdi-home"
                  icon-color="success"
                  item-icon="mdi-home"
                  placeholder="Clique para buscar propriedade..."
                  hint="Selecione a propriedade relacionada, se aplicável"
                  :persistent-hint="true"
                  :clearable="true"
                  :items="propertySearchItems"
                  :total-items="propertiesTotalItems"
                  :items-per-page="propertiesPerPage"
                  :is-loading="isLoadingProperties"
                  display-field="title"
                  @search="handlePropertySearch"
                  @select="handlePropertySelect"
                >
                  <template #item-prepend="{ item }">
                    <v-avatar color="success" size="40" class="mr-3" rounded="lg">
                      <v-img v-if="item.main_image_url" :src="item.main_image_url" cover></v-img>
                      <v-icon v-else color="white">mdi-home</v-icon>
                    </v-avatar>
                  </template>
                  <template #item-title="{ item }">
                    {{ item.title }}
                  </template>
                  <template #item-subtitle="{ item }">
                    <span>Código: {{ item.code }}</span>
                    <span v-if="item.city" class="ml-2">• {{ item.city }}</span>
                  </template>
                </SearchSelectDialog>
              </v-col>

              <!-- Corretor -->
              <v-col cols="12">
                <v-autocomplete
                  v-model="newSale.broker_id"
                  :items="corretores"
                  item-title="full_name"
                  item-value="id"
                  label="Corretor (opcional)"
                  prepend-inner-icon="mdi-account-tie"
                  variant="outlined"
                  density="comfortable"
                  clearable
                  :loading="isLoadingCorretores"
                ></v-autocomplete>
              </v-col>

              <!-- Valor -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="newSale.sale_value"
                  label="Valor *"
                  prepend-inner-icon="mdi-currency-usd"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                  prefix="R$"
                  :rules="[(v: number | null) => (v !== null && v > 0) || 'Valor deve ser maior que zero']"
                ></v-text-field>
              </v-col>

              <!-- Comissão -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="newSale.commission_percentage"
                  label="Comissão (%)"
                  prepend-inner-icon="mdi-percent"
                  variant="outlined"
                  density="comfortable"
                  type="number"
                  suffix="%"
                  :rules="[(v: number | null) => v === null || (v >= 0 && v <= 100) || 'Entre 0 e 100']"
                ></v-text-field>
              </v-col>

              <!-- Formas de Pagamento -->
              <v-col cols="12">
                <v-card variant="outlined" class="pa-4">
                  <v-card-title class="text-subtitle-1 d-flex align-center mb-3">
                    <v-icon start size="20">mdi-credit-card-multiple</v-icon>
                    Formas de Pagamento
                  </v-card-title>
                  
                  <div v-for="(payment, index) in paymentMethods" :key="index" class="mb-3">
                    <v-row dense>
                      <v-col cols="12" sm="4">
                        <v-select
                          v-model="payment.method"
                          :items="paymentMethodOptions"
                          label="Forma"
                          variant="outlined"
                          density="compact"
                          :rules="[(v: PaymentMethod | null) => !!v || 'Selecione a forma']"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-text-field
                          v-model.number="payment.value"
                          label="Valor"
                          variant="outlined"
                          density="compact"
                          type="number"
                          prefix="R$"
                          :rules="[(v: number | null) => (v !== null && v > 0) || 'Valor deve ser maior que zero']"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="3">
                        <v-text-field
                          v-model="payment.description"
                          label="Descrição (opcional)"
                          variant="outlined"
                          density="compact"
                          placeholder="Ex: Entrada, Financiamento..."
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="1" class="d-flex align-center">
                        <v-btn
                          icon
                          variant="text"
                          color="error"
                          size="small"
                          @click="removePaymentMethod(index)"
                          :disabled="paymentMethods.length === 1"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </div>
                  
                  <v-btn
                    variant="outlined"
                    color="primary"
                    prepend-icon="mdi-plus"
                    @click="addPaymentMethod"
                    size="small"
                  >
                    Adicionar Forma de Pagamento
                  </v-btn>
                  
                  <v-alert
                    v-if="paymentMethodsTotal !== newSale.sale_value && newSale.sale_value"
                    type="warning"
                    variant="tonal"
                    density="compact"
                    class="mt-3"
                  >
                    Soma das formas de pagamento ({{ formatCurrency(paymentMethodsTotal) }}) 
                    {{ paymentMethodsTotal > newSale.sale_value ? 'excede' : 'não atinge' }} 
                    o valor total ({{ formatCurrency(newSale.sale_value) }})
                  </v-alert>
                </v-card>
              </v-col>

              <!-- Campos de aluguel -->
              <template v-if="newSale.sale_type === 'RENT'">
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="newSale.rent_duration_months"
                    label="Duração (meses)"
                    prepend-inner-icon="mdi-calendar-range"
                    variant="outlined"
                    density="comfortable"
                    type="number"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="newSale.rent_start_date"
                    label="Data de Início"
                    prepend-inner-icon="mdi-calendar"
                    variant="outlined"
                    density="comfortable"
                    type="date"
                  ></v-text-field>
                </v-col>
              </template>

              <!-- Notas -->
              <v-col cols="12">
                <v-textarea
                  v-model="newSale.notes"
                  label="Observações"
                  prepend-inner-icon="mdi-note-text"
                  variant="outlined"
                  density="comfortable"
                  rows="3"
                  auto-grow
                ></v-textarea>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeCreateDialog" :disabled="isCreating">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="createSale"
            :loading="isCreating"
            :disabled="!isCreateFormValid"
          >
            <v-icon start>mdi-check</v-icon>
            Registrar Venda
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de detalhes -->
    <v-dialog v-model="showDetailsDialog" max-width="800">
      <v-card v-if="selectedSale" rounded="lg">
        <v-toolbar :color="selectedSale.status === 'COMPLETED' ? 'success' : 'primary'" density="compact">
          <v-toolbar-title class="text-white font-weight-bold">
            <v-icon start>{{ selectedSale.sale_type === 'SALE' ? 'mdi-home-plus' : 'mdi-key' }}</v-icon>
            {{ getSaleTypeLabel(selectedSale.sale_type) }} - {{ selectedSale.client_name }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-chip
            :color="getSaleStatusColor(selectedSale.status)"
            variant="flat"
            size="small"
            class="mr-2"
          >
            {{ getSaleStatusLabel(selectedSale.status) }}
          </v-chip>
          <v-btn icon variant="text" @click="showDetailsDialog = false">
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pt-6">
          <v-row>
            <!-- Informações principais -->
            <v-col cols="12" md="6">
              <h4 class="text-subtitle-1 font-weight-bold mb-3">
                <v-icon start size="20">mdi-information</v-icon>
                Informações da Venda
              </h4>
              <v-list density="compact" class="bg-grey-lighten-5 rounded">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-account</v-icon>
                  </template>
                  <v-list-item-title>Cliente</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedSale.client_name }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="selectedSale.property_title">
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-home</v-icon>
                  </template>
                  <v-list-item-title>Imóvel</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedSale.property_title }}</v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="selectedSale.broker_name">
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-account-tie</v-icon>
                  </template>
                  <v-list-item-title>Corretor</v-list-item-title>
                  <v-list-item-subtitle>{{ selectedSale.broker_name }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>

            <!-- Informações financeiras -->
            <v-col cols="12" md="6">
              <h4 class="text-subtitle-1 font-weight-bold mb-3">
                <v-icon start size="20">mdi-currency-usd</v-icon>
                Financeiro
              </h4>
              <v-list density="compact" class="bg-grey-lighten-5 rounded">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-cash</v-icon>
                  </template>
                  <v-list-item-title>Valor Total</v-list-item-title>
                  <v-list-item-subtitle class="text-success font-weight-bold">
                    {{ formatCurrency(selectedSale.sale_value) }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="selectedSale.commission_value">
                  <template v-slot:prepend>
                    <v-icon color="secondary">mdi-percent</v-icon>
                  </template>
                  <v-list-item-title>Comissão ({{ selectedSale.commission_percentage }}%)</v-list-item-title>
                  <v-list-item-subtitle class="text-secondary font-weight-bold">
                    {{ formatCurrency(selectedSale.commission_value) }}
                  </v-list-item-subtitle>
                </v-list-item>
                <v-list-item v-if="selectedSale.down_payment">
                  <template v-slot:prepend>
                    <v-icon color="info">mdi-bank-transfer-in</v-icon>
                  </template>
                  <v-list-item-title>Entrada</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ formatCurrency(selectedSale.down_payment) }}
                  </v-list-item-subtitle>
                </v-list-item>
                <template v-if="selectedSale.payment_methods && selectedSale.payment_methods.length > 0">
                  <v-list-item
                    v-for="(payment, index) in selectedSale.payment_methods"
                    :key="index"
                  >
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-credit-card</v-icon>
                    </template>
                    <v-list-item-title>
                      {{ getPaymentMethodLabel(payment.method) }}
                      <span v-if="payment.description" class="text-caption text-medium-emphasis">
                        ({{ payment.description }})
                      </span>
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-success font-weight-bold">
                      {{ formatCurrency(payment.value) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </template>
                <v-list-item v-else-if="selectedSale.payment_method">
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-credit-card</v-icon>
                  </template>
                  <v-list-item-title>Forma de Pagamento</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ getPaymentMethodLabel(selectedSale.payment_method) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>

            <!-- Datas -->
            <v-col cols="12">
              <h4 class="text-subtitle-1 font-weight-bold mb-3">
                <v-icon start size="20">mdi-calendar</v-icon>
                Timeline
              </h4>
              <v-timeline side="end" density="compact">
                <v-timeline-item
                  v-if="selectedSale.proposal_date"
                  dot-color="primary"
                  size="small"
                >
                  <template v-slot:opposite>
                    {{ formatDate(selectedSale.proposal_date) }}
                  </template>
                  <div class="font-weight-medium">Proposta aceita</div>
                </v-timeline-item>
                <v-timeline-item
                  v-if="selectedSale.contract_date"
                  dot-color="secondary"
                  size="small"
                >
                  <template v-slot:opposite>
                    {{ formatDate(selectedSale.contract_date) }}
                  </template>
                  <div class="font-weight-medium">Contrato assinado</div>
                </v-timeline-item>
                <v-timeline-item
                  v-if="selectedSale.completion_date"
                  dot-color="success"
                  size="small"
                >
                  <template v-slot:opposite>
                    {{ formatDate(selectedSale.completion_date) }}
                  </template>
                  <div class="font-weight-medium">Venda concluída</div>
                </v-timeline-item>
              </v-timeline>
            </v-col>

            <!-- Análise IA -->
            <v-col cols="12" v-if="selectedSale.ai_analysis">
              <v-card variant="tonal" color="purple" rounded="lg">
                <v-card-title class="d-flex align-center">
                  <v-icon start color="purple">mdi-robot</v-icon>
                  Análise da IA
                </v-card-title>
                <v-card-text>
                  <div v-html="formatMarkdown(selectedSale.ai_analysis)" class="ai-analysis-content"></div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Notas -->
            <v-col cols="12" v-if="selectedSale.notes">
              <v-card variant="outlined" rounded="lg">
                <v-card-title class="d-flex align-center text-body-1">
                  <v-icon start size="20">mdi-note-text</v-icon>
                  Observações
                </v-card-title>
                <v-card-text>{{ selectedSale.notes }}</v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-btn
            v-if="selectedSale.client_id"
            variant="text"
            prepend-icon="mdi-account"
            :to="`/clients/${selectedSale.client_id}`"
          >
            Ver Cliente
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            v-if="selectedSale.status !== 'COMPLETED' && selectedSale.status !== 'CANCELLED'"
            color="error"
            variant="text"
            @click="openCancelDialog(selectedSale); showDetailsDialog = false"
          >
            Cancelar Venda
          </v-btn>
          <v-btn
            v-if="selectedSale.status !== 'COMPLETED' && selectedSale.status !== 'CANCELLED'"
            color="success"
            variant="flat"
            @click="openCompleteDialog(selectedSale); showDetailsDialog = false"
          >
            <v-icon start>mdi-check</v-icon>
            Concluir Venda
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de conclusão -->
    <v-dialog v-model="showCompleteDialog" max-width="500">
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center bg-success py-4 px-4">
          <v-icon color="white" class="mr-3" size="32">mdi-trophy</v-icon>
          <span class="text-white font-weight-bold">Concluir Venda</span>
        </v-card-title>
        <v-card-text class="pt-6">
          <p class="text-body-1 mb-4">
            Você está prestes a marcar esta venda como <strong class="text-success">concluída</strong>.
          </p>
          <v-alert type="info" variant="tonal" density="compact" class="mb-4">
            <template v-slot:text>
              A IA irá analisar a venda e gerar insights sobre os fatores de sucesso.
            </template>
          </v-alert>
          <p class="text-body-2 text-medium-emphasis">
            Esta ação atualizará o status do cliente para "Ganho" e marcará o imóvel como vendido/alugado.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showCompleteDialog = false" :disabled="isCompleting">
            Cancelar
          </v-btn>
          <v-btn color="success" variant="flat" @click="completeSale" :loading="isCompleting">
            <v-icon start>mdi-check</v-icon>
            Confirmar Conclusão
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de cancelamento -->
    <v-dialog v-model="showCancelDialog" max-width="500">
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center bg-error py-4 px-4">
          <v-icon color="white" class="mr-3" size="32">mdi-close-circle</v-icon>
          <span class="text-white font-weight-bold">Cancelar Venda</span>
        </v-card-title>
        <v-card-text class="pt-6">
          <p class="text-body-1 mb-4">
            Você está prestes a <strong class="text-error">cancelar</strong> esta venda.
          </p>
          <v-textarea
            v-model="cancelReason"
            label="Motivo do cancelamento"
            variant="outlined"
            rows="3"
            auto-grow
            placeholder="Descreva o motivo do cancelamento..."
          ></v-textarea>
          <v-alert type="warning" variant="tonal" density="compact" class="mt-4">
            <template v-slot:text>
              O status do cliente será alterado para "Perdido" e o imóvel voltará a ficar disponível.
            </template>
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showCancelDialog = false" :disabled="isCancelling">
            Voltar
          </v-btn>
          <v-btn color="error" variant="flat" @click="cancelSale" :loading="isCancelling">
            <v-icon start>mdi-close</v-icon>
            Confirmar Cancelamento
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Fechar</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  salesService,
  type Sale,
  type SaleCreate,
  type SaleStats,
  type PaymentMethodItem,
  SaleType,
  SaleStatus,
  PaymentMethod,
  getSaleTypeLabel,
  getSaleStatusLabel,
  getSaleStatusColor,
  getSaleStatusIcon,
  getPaymentMethodLabel,
  formatCurrency,
} from '@/shared/services/sales.service'
import { clientsService, type Client } from '@/shared/services/clients.service'
import { propertiesService, type Property } from '@/shared/services/properties.service'
import { usersService, type User } from '@/shared/services/users.service'
import SearchSelectDialog from '@/shared/components/SearchSelectDialog.vue'
import { formatPhone } from '@/shared/utils/masks'

// State
const sales = ref<Sale[]>([])
const corretores = ref<User[]>([])
const stats = ref<SaleStats>({
  total_sales: 0,
  total_value: 0,
  total_commission: 0,
  sales_count: 0,
  rent_count: 0,
  pending_count: 0,
  completed_count: 0,
  avg_sale_value: 0,
  avg_commission: 0,
})

// Loading states
const isLoading = ref(false)
const isLoadingClients = ref(false)
const isLoadingProperties = ref(false)
const isLoadingCorretores = ref(false)

// Search state for clients
const clientSearchItems = ref<any[]>([])
const clientsTotalItems = ref(0)
const clientsPerPage = 10

// Search state for properties
const propertySearchItems = ref<any[]>([])
const propertiesTotalItems = ref(0)
const propertiesPerPage = 10
const isCreating = ref(false)
const isCompleting = ref(false)
const isCancelling = ref(false)

// Dialogs
const showCreateDialog = ref(false)
const showDetailsDialog = ref(false)
const showCompleteDialog = ref(false)
const showCancelDialog = ref(false)

// Form
const createForm = ref()
const isCreateFormValid = ref(false)
const newSale = ref<Partial<SaleCreate>>({
  sale_type: SaleType.SALE,
  commission_percentage: 5,
})
const paymentMethods = ref<PaymentMethodItem[]>([
  { method: PaymentMethod.CASH, value: 0, description: '' }
])

// Selected sale
const selectedSale = ref<Sale | null>(null)
const cancelReason = ref('')

// Filters
const searchQuery = ref('')
const filters = ref<{
  sale_type: SaleType | null
  sale_status: SaleStatus | null
}>({
  sale_type: null,
  sale_status: null,
})

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Table headers
const headers = [
  { title: 'Tipo', key: 'sale_type', width: '120px' },
  { title: 'Cliente / Imóvel', key: 'client_name' },
  { title: 'Valor', key: 'sale_value', width: '160px' },
  { title: 'Status', key: 'status', width: '140px' },
  { title: 'Data', key: 'created_at', width: '140px' },
  { title: 'Corretor', key: 'broker_name', width: '140px' },
  { title: 'Ações', key: 'actions', width: '140px', sortable: false },
]

// Options
const saleTypeOptions = [
  { title: 'Venda', value: SaleType.SALE },
  { title: 'Aluguel', value: SaleType.RENT },
]

const saleStatusOptions = [
  { title: 'Aguardando', value: SaleStatus.PENDING },
  { title: 'Documentação', value: SaleStatus.DOCUMENTATION },
  { title: 'Contrato', value: SaleStatus.CONTRACT },
  { title: 'Assinado', value: SaleStatus.SIGNED },
  { title: 'Concluído', value: SaleStatus.COMPLETED },
  { title: 'Cancelado', value: SaleStatus.CANCELLED },
]

const paymentMethodOptions = [
  { title: 'À Vista', value: PaymentMethod.CASH },
  { title: 'Financiamento', value: PaymentMethod.FINANCING },
  { title: 'Parcelado', value: PaymentMethod.INSTALLMENTS },
  { title: 'Misto', value: PaymentMethod.MIXED },
]

// Computed
const filteredSales = computed(() => {
  let result = sales.value

  if (filters.value.sale_type) {
    result = result.filter(s => s.sale_type === filters.value.sale_type)
  }

  if (filters.value.sale_status) {
    result = result.filter(s => s.status === filters.value.sale_status)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(s =>
      s.client_name?.toLowerCase().includes(query) ||
      s.property_title?.toLowerCase().includes(query) ||
      s.broker_name?.toLowerCase().includes(query)
    )
  }

  return result
})

// Methods
const loadSales = async () => {
  isLoading.value = true
  try {
    const [salesData, statsData] = await Promise.all([
      salesService.listSales(),
      salesService.getStats(),
    ])
    sales.value = salesData
    stats.value = statsData
  } catch (error) {
    showSnackbar('Erro ao carregar vendas', 'error')
  } finally {
    isLoading.value = false
  }
}

// Handle client search from SearchSelectDialog
const handleClientSearch = async (query: string, page: number) => {
  isLoadingClients.value = true
  try {
    // Fetch all clients (backend doesn't support pagination/search filtering yet)
    const data = await clientsService.getClients({ limit: 1000 })
    
    // Filter by search query client-side
    let filtered = data
    if (query && query.trim()) {
      const lowerQuery = query.toLowerCase().trim()
      filtered = data.filter(client =>
        client.name.toLowerCase().includes(lowerQuery) ||
        (client.email && client.email.toLowerCase().includes(lowerQuery)) ||
        (client.phone && client.phone.includes(lowerQuery))
      )
    }
    
    // Apply pagination client-side
    const startIndex = (page - 1) * clientsPerPage
    const endIndex = startIndex + clientsPerPage
    const paginatedItems = filtered.slice(startIndex, endIndex)
    
    // Map to search items format
    clientSearchItems.value = paginatedItems.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      title: client.name,
      subtitle: client.phone || client.email,
    }))
    
    clientsTotalItems.value = filtered.length
  } catch (error) {
    console.error('Error searching clients:', error)
    clientSearchItems.value = []
    clientsTotalItems.value = 0
  } finally {
    isLoadingClients.value = false
  }
}

// Handle client selection
const handleClientSelect = (item: any) => {
  if (item) {
    console.log('Client selected:', item)
  }
}

// Handle property search from SearchSelectDialog
const handlePropertySearch = async (query: string, page: number) => {
  isLoadingProperties.value = true
  try {
    // Fetch all properties (backend doesn't support pagination/search filtering yet)
    const data = await propertiesService.listProperties({ limit: 1000 })
    
    // Filter by search query client-side
    let filtered = data
    if (query && query.trim()) {
      const lowerQuery = query.toLowerCase().trim()
      filtered = data.filter(property =>
        property.title.toLowerCase().includes(lowerQuery) ||
        property.code.toLowerCase().includes(lowerQuery) ||
        (property.city && property.city.toLowerCase().includes(lowerQuery)) ||
        (property.neighborhood && property.neighborhood.toLowerCase().includes(lowerQuery))
      )
    }
    
    // Apply pagination client-side
    const startIndex = (page - 1) * propertiesPerPage
    const endIndex = startIndex + propertiesPerPage
    const paginatedItems = filtered.slice(startIndex, endIndex)
    
    // Map to search items format
    propertySearchItems.value = paginatedItems.map(property => ({
      id: property.id,
      title: property.title,
      code: property.code,
      city: property.city,
      neighborhood: property.neighborhood,
      main_image_url: property.main_image_url,
      subtitle: `${property.code} ${property.city ? '• ' + property.city : ''}`,
    }))
    
    propertiesTotalItems.value = filtered.length
  } catch (error) {
    console.error('Error searching properties:', error)
    propertySearchItems.value = []
    propertiesTotalItems.value = 0
  } finally {
    isLoadingProperties.value = false
  }
}

// Handle property selection
const handlePropertySelect = (item: any) => {
  if (item) {
    console.log('Property selected:', item)
  }
}

const loadCorretores = async () => {
  isLoadingCorretores.value = true
  try {
    corretores.value = await usersService.getCorretores()
  } catch (error) {
    console.error('Error loading corretores:', error)
  } finally {
    isLoadingCorretores.value = false
  }
}

const createSale = async () => {
  if (!isCreateFormValid.value) return

  isCreating.value = true
  try {
    // Prepare sale data with payment methods
    const saleData: SaleCreate = {
      ...newSale.value,
      payment_methods: paymentMethods.value.filter(pm => pm.method && pm.value > 0),
    } as SaleCreate
    
    await salesService.createSale(saleData)
    showSnackbar('Venda registrada com sucesso!', 'success')
    closeCreateDialog()
    loadSales()
  } catch (error) {
    showSnackbar('Erro ao registrar venda', 'error')
  } finally {
    isCreating.value = false
  }
}

const viewSale = (sale: Sale) => {
  selectedSale.value = sale
  showDetailsDialog.value = true
}

const openCompleteDialog = (sale: Sale) => {
  selectedSale.value = sale
  showCompleteDialog.value = true
}

const openCancelDialog = (sale: Sale) => {
  selectedSale.value = sale
  cancelReason.value = ''
  showCancelDialog.value = true
}

const completeSale = async () => {
  if (!selectedSale.value) return

  isCompleting.value = true
  try {
    await salesService.completeSale(selectedSale.value.id)
    showSnackbar('Venda concluída com sucesso! 🎉', 'success')
    showCompleteDialog.value = false
    loadSales()
  } catch (error) {
    showSnackbar('Erro ao concluir venda', 'error')
  } finally {
    isCompleting.value = false
  }
}

const cancelSale = async () => {
  if (!selectedSale.value) return

  isCancelling.value = true
  try {
    await salesService.cancelSale(selectedSale.value.id, cancelReason.value || undefined)
    showSnackbar('Venda cancelada', 'warning')
    showCancelDialog.value = false
    loadSales()
  } catch (error) {
    showSnackbar('Erro ao cancelar venda', 'error')
  } finally {
    isCancelling.value = false
  }
}

const closeCreateDialog = () => {
  showCreateDialog.value = false
  newSale.value = {
    sale_type: SaleType.SALE,
    commission_percentage: 5,
  }
  paymentMethods.value = [
    { method: PaymentMethod.CASH, value: 0, description: '' }
  ]
}

const addPaymentMethod = () => {
  paymentMethods.value.push({
    method: PaymentMethod.CASH,
    value: 0,
    description: '',
  })
}

const removePaymentMethod = (index: number) => {
  if (paymentMethods.value.length > 1) {
    paymentMethods.value.splice(index, 1)
  }
}

const paymentMethodsTotal = computed(() => {
  return paymentMethods.value.reduce((sum, pm) => sum + (pm.value || 0), 0)
})

const showSnackbar = (message: string, color: string) => {
  snackbar.value = { show: true, message, color }
}

// Helpers
const getInitials = (name: string | null): string => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

const formatRelativeDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `${diffDays} dias atrás`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`
  return `${Math.floor(diffDays / 30)} meses atrás`
}

const formatCurrencyCompact = (value: number): string => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}K`
  }
  return formatCurrency(value)
}

const formatMarkdown = (text: string): string => {
  // Basic markdown formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

// Lifecycle
onMounted(() => {
  loadSales()
  loadCorretores()
})
</script>

<style scoped>
.sales-page {
  padding: 16px;
  max-width: 1400px;
  margin: 0 auto;
}

.sales-header-card {
  background: linear-gradient(135deg, #1565c0 0%, #0d47a1 50%, #002171 100%);
  position: relative;
  overflow: hidden;
}

.sales-header-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  pointer-events: none;
}

.sales-icon-avatar {
  background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1));
  border: 2px solid rgba(255,255,255,0.4);
}

.text-white-alpha {
  color: rgba(255, 255, 255, 0.85);
}

.stats-bar {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.stat-item {
  text-align: center;
  padding: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
}

.sales-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(25, 118, 210, 0.04) !important;
}

.ai-analysis-content {
  line-height: 1.6;
}
</style>

