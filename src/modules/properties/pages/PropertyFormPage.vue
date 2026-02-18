<template>
  <div>
    <!-- Header -->
    <v-card elevation="2" class="mb-4">
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
          {{ isEditMode ? 'mdi-home-edit' : 'mdi-home-plus' }}
        </v-icon>
        <span class="text-h5">
          {{ isEditMode ? 'Editar Imóvel' : 'Novo Imóvel' }}
        </span>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          :loading="isSaving"
          :disabled="isSaving"
          prepend-icon="mdi-content-save"
          @click="handleSave"
        >
          Salvar
        </v-btn>
      </v-card-title>
    </v-card>

    <!-- Form with Tabs -->
    <v-card elevation="2" style="overflow: visible !important;">
      <v-tabs
        v-model="activeTab"
        bg-color="primary"
        slider-color="white"
        style="overflow: visible !important;"
      >
        <v-tab value="general">
          <v-icon start>mdi-information</v-icon>
          Geral
        </v-tab>
        <v-tab value="location">
          <v-icon start>mdi-map-marker</v-icon>
          Localização
        </v-tab>
        <v-tab value="characteristics">
          <v-icon start>mdi-home-variant</v-icon>
          Características
        </v-tab>
        <v-tab value="financial">
          <v-icon start>mdi-currency-usd</v-icon>
          Financeiro
        </v-tab>
        <v-tab value="commercial">
          <v-icon start>mdi-briefcase</v-icon>
          Comercial
        </v-tab>
        <v-tab value="owner">
          <v-icon start>mdi-account</v-icon>
          Proprietário
        </v-tab>
        <v-tab value="ai">
          <v-icon start>mdi-chart-line</v-icon>
          Visibilidade
        </v-tab>
        <v-tab value="media">
          <v-icon start>mdi-image</v-icon>
          Mídia
        </v-tab>
      </v-tabs>

      <v-card-text class="pa-6" style="overflow: visible !important; padding-top: 32px !important;">
        <v-form 
          ref="formRef" 
          v-model="isFormValid" 
          style="overflow: visible !important;"
          @submit.prevent="handleSave"
        >
          <v-window v-model="activeTab" style="overflow: visible !important;">
            <!-- Tab: Geral -->
            <v-window-item value="general">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.code"
                    label="Código *"
                    variant="outlined"
                    :rules="[rules.required]"
                    prepend-inner-icon="mdi-identifier"
                    hint="Código único do imóvel (ex: IMV-001)"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.property_type"
                    :items="propertyTypeOptions"
                    variant="outlined"
                    :rules="[rules.required]"
                    prepend-inner-icon="mdi-home-variant"
                    hint="Tipo do imóvel"
                    persistent-hint
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="formData.title"
                    label="Título *"
                    variant="outlined"
                    :rules="[rules.required]"
                    prepend-inner-icon="mdi-text-short"
                    hint="Título atrativo para o imóvel"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="formData.description"
                    label="Descrição"
                    variant="outlined"
                    rows="4"
                    auto-grow
                    prepend-inner-icon="mdi-text"
                    hint="Descrição detalhada do imóvel"
                    persistent-hint
                  ></v-textarea>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.business_type"
                    :items="businessTypeOptions"
                    variant="outlined"
                    :rules="[rules.required]"
                    prepend-inner-icon="mdi-handshake"
                    hint="Venda, Aluguel ou Ambos"
                    persistent-hint
                  ></v-select>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Tab: Localização -->
            <v-window-item value="location">
              <v-row>
                <!-- Busca por CEP (ViaCEP) -->
                <v-col cols="12" md="6">
                  <v-card variant="outlined" class="pa-4 mb-4" color="success">
                    <div class="d-flex align-center mb-2">
                      <v-icon color="success" class="mr-2">mdi-mailbox</v-icon>
                      <span class="text-subtitle-1 font-weight-medium">Buscar por CEP</span>
                    </div>
                    <v-text-field
                      v-model="cepSearch"
                      label="Digite o CEP"
                      variant="outlined"
                      prepend-inner-icon="mdi-magnify"
                      :loading="isSearchingCep"
                      :error="!!cepError"
                      :error-messages="cepError ? [cepError] : []"
                      hint="Digite o CEP para preencher endereço automaticamente (ex: 01310-100)"
                      persistent-hint
                      maxlength="9"
                      @input="formatCepInput"
                      @keyup.enter="handleSearchCep"
                    >
                      <template #append>
                        <v-btn
                          color="success"
                          :loading="isSearchingCep"
                          :disabled="!cepSearch.trim() || cepSearch.replace(/\D/g, '').length < 8"
                          @click="handleSearchCep"
                        >
                          Buscar
                        </v-btn>
                      </template>
                    </v-text-field>
                  </v-card>
                </v-col>

                <!-- Busca por Endereço (Google Maps) -->
                <v-col cols="12" md="6">
                  <v-card variant="outlined" class="pa-4 mb-4" color="primary">
                    <div class="d-flex align-center mb-2">
                      <v-icon color="primary" class="mr-2">mdi-map-search</v-icon>
                      <span class="text-subtitle-1 font-weight-medium">Buscar no Google Maps</span>
                    </div>
                    <v-text-field
                      v-model="addressSearch"
                      label="Digite o endereço completo"
                      variant="outlined"
                      prepend-inner-icon="mdi-magnify"
                      :loading="isGeocoding"
                      :error="!!geocodeError"
                      :error-messages="geocodeError || []"
                      hint="Busca endereço e coordenadas geográficas"
                      persistent-hint
                      @keyup.enter="handleGeocodeAddress"
                    >
                      <template #append>
                        <v-btn
                          color="primary"
                          :loading="isGeocoding"
                          :disabled="!addressSearch.trim()"
                          @click="handleGeocodeAddress"
                        >
                          Buscar
                        </v-btn>
                      </template>
                    </v-text-field>
                  </v-card>
                </v-col>

                <!-- Rua e Número -->
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="formData.street"
                    label="Rua"
                    variant="outlined"
                    prepend-inner-icon="mdi-road"
                    hint="Nome da rua ou avenida"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="formData.number"
                    label="Número"
                    variant="outlined"
                    prepend-inner-icon="mdi-numeric"
                    hint="Número do imóvel"
                    persistent-hint
                  ></v-text-field>
                </v-col>

                <!-- Bairro -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.neighborhood"
                    label="Bairro"
                    variant="outlined"
                    prepend-inner-icon="mdi-home-group"
                    hint="Bairro do imóvel"
                    persistent-hint
                  ></v-text-field>
                </v-col>

                <!-- CEP -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.zip_code"
                    label="CEP"
                    variant="outlined"
                    prepend-inner-icon="mdi-mailbox"
                    hint="Código postal (8 dígitos)"
                    persistent-hint
                    maxlength="9"
                    @input="formatZipCodeField"
                  ></v-text-field>
                </v-col>

                <!-- Estado (Select) -->
                <v-col cols="12" md="4">
                  <v-select
                    v-model="formData.state"
                    :items="brazilianStates"
                    label="Estado (UF)"
                    variant="outlined"
                    prepend-inner-icon="mdi-map"
                    item-title="name"
                    item-value="uf"
                    hint="Selecione o estado"
                    persistent-hint
                    clearable
                    @update:model-value="handleStateChange"
                  >
                    <template #item="{ props, item }">
                      <v-list-item v-bind="props">
                        <template #prepend>
                          <v-chip size="x-small" color="primary" variant="flat" class="mr-2">
                            {{ item.raw.uf }}
                          </v-chip>
                        </template>
                      </v-list-item>
                    </template>
                    <template #selection="{ item }">
                      <v-chip size="small" color="primary" variant="flat" class="mr-2">
                        {{ item.raw.uf }}
                      </v-chip>
                      {{ item.raw.name }}
                    </template>
                  </v-select>
                </v-col>

                <!-- Cidade (Autocomplete baseado no Estado) -->
                <v-col cols="12" md="8">
                  <v-autocomplete
                    v-model="formData.city"
                    :items="availableCities"
                    label="Cidade"
                    variant="outlined"
                    prepend-inner-icon="mdi-city"
                    :loading="isLoadingCities"
                    :disabled="!formData.state"
                    :hint="formData.state ? `Cidades de ${getStateName(formData.state)}` : 'Selecione um estado primeiro'"
                    persistent-hint
                    clearable
                    no-data-text="Nenhuma cidade encontrada"
                  ></v-autocomplete>
                </v-col>

                <!-- Coordenadas -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.latitude"
                    label="Latitude"
                    variant="outlined"
                    prepend-inner-icon="mdi-latitude"
                    type="number"
                    step="any"
                    hint="Coordenada de latitude"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.longitude"
                    label="Longitude"
                    variant="outlined"
                    prepend-inner-icon="mdi-longitude"
                    type="number"
                    step="any"
                    hint="Coordenada de longitude"
                    persistent-hint
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Tab: Características -->
            <v-window-item value="characteristics">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="formData.area_total"
                    label="Área Total (m²)"
                    variant="outlined"
                    prepend-inner-icon="mdi-ruler-square"
                    type="number"
                    min="0"
                    hint="Área total do terreno/imóvel"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="formData.area_built"
                    label="Área Construída (m²)"
                    variant="outlined"
                    prepend-inner-icon="mdi-floor-plan"
                    type="number"
                    min="0"
                    hint="Área construída do imóvel"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="formData.bedrooms"
                    label="Quartos"
                    variant="outlined"
                    prepend-inner-icon="mdi-bed"
                    type="number"
                    min="0"
                    hint="Número de quartos"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="formData.bathrooms"
                    label="Banheiros"
                    variant="outlined"
                    prepend-inner-icon="mdi-shower"
                    type="number"
                    min="0"
                    hint="Número de banheiros"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="formData.parking_spaces"
                    label="Vagas de Garagem"
                    variant="outlined"
                    prepend-inner-icon="mdi-car"
                    type="number"
                    min="0"
                    hint="Vagas de estacionamento"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model.number="formData.floor"
                    label="Andar"
                    variant="outlined"
                    prepend-inner-icon="mdi-stairs"
                    type="number"
                    hint="Para apartamentos"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-switch
                    v-model="formData.has_elevator"
                    label="Possui Elevador"
                    color="primary"
                    prepend-icon="mdi-elevator"
                  ></v-switch>
                </v-col>
                <v-col cols="12" md="4">
                  <v-switch
                    v-model="formData.furnished"
                    label="Mobiliado"
                    color="primary"
                    prepend-icon="mdi-sofa"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Tab: Financeiro -->
            <v-window-item value="financial">
              <v-alert
                type="info"
                variant="tonal"
                class="mb-4"
              >
                <div class="d-flex align-center">
                  
                  Os campos exibidos dependem do tipo de negócio selecionado na aba Geral.
                </div>
              </v-alert>
              <v-row>
                <v-col
                  v-if="showSalePrice"
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="priceFormatted"
                    label="Preço de Venda"
                    variant="outlined"
                    prepend-inner-icon="mdi-currency-brl"
                    prefix="R$"
                    hint="Valor de venda do imóvel"
                    persistent-hint
                    data-field="price"
                    @input="handlePriceInput($event, 'price')"
                    @blur="handlePriceBlur('price')"
                  ></v-text-field>
                </v-col>
                <v-col
                  v-if="showRentPrice"
                  cols="12"
                  md="6"
                >
                  <v-text-field
                    v-model="rentPriceFormatted"
                    label="Preço de Aluguel"
                    variant="outlined"
                    prepend-inner-icon="mdi-cash-clock"
                    prefix="R$"
                    hint="Valor mensal do aluguel"
                    persistent-hint
                    data-field="rent_price"
                    @input="handlePriceInput($event, 'rent_price')"
                    @blur="handlePriceBlur('rent_price')"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="condoFeeFormatted"
                    label="Condomínio"
                    variant="outlined"
                    prepend-inner-icon="mdi-home-city"
                    prefix="R$"
                    hint="Taxa de condomínio mensal"
                    persistent-hint
                    data-field="condo_fee"
                    @input="handlePriceInput($event, 'condo_fee')"
                    @blur="handlePriceBlur('condo_fee')"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="iptuFormatted"
                    label="IPTU"
                    variant="outlined"
                    prepend-inner-icon="mdi-file-document"
                    prefix="R$"
                    hint="Imposto predial anual"
                    persistent-hint
                    data-field="iptu"
                    @input="handlePriceInput($event, 'iptu')"
                    @blur="handlePriceBlur('iptu')"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Tab: Comercial -->
            <v-window-item value="commercial">
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.status"
                    :items="statusOptions"
                    variant="outlined"
                    prepend-inner-icon="mdi-flag"
                    :rules="[rules.required]"
                    hint="Status de publicação do imóvel"
                    persistent-hint
                  ></v-select>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Tab: Proprietário -->
            <v-window-item value="owner">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.owner_name"
                    label="Nome do Proprietário"
                    variant="outlined"
                    prepend-inner-icon="mdi-account"
                    hint="Nome completo do proprietário"
                    persistent-hint
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="ownerContactFormatted"
                    label="Contato do Proprietário"
                    variant="outlined"
                    prepend-inner-icon="mdi-phone"
                    hint="Telefone (ex: (11) 98765-4321) ou email"
                    persistent-hint
                    @blur="ownerContactFormatted = formatPhone(formData.owner_contact || '')"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Tab: Visibilidade -->
            <v-window-item value="ai" class="visibilidade-tab">
              <v-row align="stretch">
                <!-- Score de Visibilidade -->
                <v-col cols="12" md="6" class="d-flex">
                  <v-card elevation="2" rounded="lg" class="pa-5 visibility-score-card flex-grow-1 d-flex flex-column">
                    <div class="d-flex align-center mb-2">
                      <v-icon color="primary" class="mr-2" size="22">mdi-chart-line</v-icon>
                      <span class="text-subtitle-1 font-weight-medium">Score de Visibilidade</span>
                    </div>
                    <div class="text-caption text-medium-emphasis mb-4">
                      Usado para ordenar a listagem de imóveis. Quanto maior o score, melhor a posição.
                    </div>
                    <div class="text-center mb-4 d-flex justify-center">
                      <div
                        class="score-ring"
                        :style="scoreRingStyle"
                      >
                        <div class="score-ring-inner">
                          <span class="text-h4 font-weight-bold" :class="getScoreColor(calculatedScore)">
                            {{ calculatedScore }}
                          </span>
                          <div class="text-caption text-medium-emphasis">de 100 pontos</div>
                        </div>
                      </div>
                    </div>
                    <v-progress-linear
                      :model-value="calculatedScore"
                      :color="getScoreColorName(calculatedScore)"
                      height="8"
                      rounded
                      class="mb-4"
                    ></v-progress-linear>
                    <v-alert
                      :type="getScoreAlertType(calculatedScore)"
                      variant="tonal"
                      density="compact"
                      class="mb-3"
                    >
                      {{ getScoreMessage(calculatedScore) }}
                    </v-alert>
                    <div class="text-caption text-medium-emphasis">
                      O score é calculado e salvo automaticamente ao salvar o imóvel.
                    </div>
                  </v-card>
                </v-col>

                <!-- Completude do Cadastro -->
                <v-col cols="12" md="6" class="d-flex">
                  <v-card elevation="2" rounded="lg" class="pa-5 completeness-card flex-grow-1 d-flex flex-column">
                    <div class="d-flex align-center mb-3">
                      <v-icon color="success" class="mr-2" size="22">mdi-check-circle</v-icon>
                      <span class="text-subtitle-1 font-weight-medium">Completude do Cadastro</span>
                    </div>
                    <v-list density="compact" class="completeness-list flex-grow-1">
                      <v-list-item
                        v-for="item in completenessItems"
                        :key="item.label"
                        class="completeness-item"
                      >
                        <template #prepend>
                          <v-icon :color="item.complete ? 'success' : 'grey-lighten-1'" size="22">
                            {{ item.complete ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                          </v-icon>
                        </template>
                        <v-list-item-title :class="{ 'text-medium-emphasis': !item.complete }">
                          {{ item.label }}
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                    <div class="d-flex justify-end mt-3">
                      <v-chip
                        :color="completenessPercentage >= 80 ? 'success' : completenessPercentage >= 50 ? 'warning' : 'error'"
                        variant="flat"
                        size="small"
                        class="completeness-chip"
                      >
                        {{ completenessPercentage }}% completo
                      </v-chip>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Tab: Mídia -->
            <v-window-item value="media">
              <v-row>
                <v-col cols="12">
                  <div class="text-h6 mb-4">
                    <v-icon class="mr-2" color="primary">mdi-image</v-icon>
                    Imagem Principal do Imóvel
                  </div>
                  <div class="text-body-2 text-medium-emphasis mb-4">
                    Faça upload da imagem principal do imóvel. A imagem será armazenada no Cloudinary
                    e otimizada automaticamente para melhor performance.
                  </div>
                  <PropertyImageUpload
                    v-model="formData.main_image_url"
                    :property-id="isEditMode ? (route.params.id as string) : null"
                    :disabled="isSaving"
                    @uploaded="handleImageUploaded"
                    @error="handleImageError"
                  />
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { VForm } from 'vuetify/components'
import { propertiesService, type Property, type PropertyCreate, type PropertyUpdate, type AddressData } from '@/shared/services/properties.service'
import { usersService, type User } from '@/shared/services/users.service'
import { formatCurrency, parseCurrency, formatCurrencyInput, formatCurrencyInputRealTime, parseCurrencyInputRealTime, formatPhone, parsePhone } from '@/shared/utils/masks'
import PropertyImageUpload from '@/shared/components/PropertyImageUpload.vue'

const route = useRoute()
const router = useRouter()

const formRef = ref<VForm | null>(null)
const activeTab = ref('general')
const isFormValid = ref(false)
const isSaving = ref(false)
const property = ref<Property | null>(null)

// Geocoding
const addressSearch = ref('')
const isGeocoding = ref(false)
const geocodeError = ref<string[] | null>(null)

// CEP Search (ViaCEP)
const cepSearch = ref('')
const isSearchingCep = ref(false)
const cepError = ref<string | null>(null)

// Cities (IBGE API)
const isLoadingCities = ref(false)
const availableCities = ref<string[]>([])

// Brazilian States
const brazilianStates = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
]

// AI & Matching

const isEditMode = computed(() => !!route.params.id)

// Form data
const formData = ref<PropertyCreate>({
  code: '',
  title: '',
  description: null,
  property_type: 'APARTMENT',
  business_type: 'SALE',
  street: null,
  number: null,
  neighborhood: null,
  city: null,
  state: null,
  zip_code: null,
  latitude: null,
  longitude: null,
  area_total: null,
  area_built: null,
  bedrooms: null,
  bathrooms: null,
  parking_spaces: null,
  floor: null,
  has_elevator: false,
  furnished: false,
  price: null as number | null,
  rent_price: null as number | null,
  condo_fee: null as number | null,
  iptu: null as number | null,
  status: 'DRAFT',
  owner_name: null,
  owner_contact: null,
  visibility_score: null,
  ideal_client_profile: null,
  main_image_url: null,
})

// Options
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

// Computed
const showSalePrice = computed(() => {
  return formData.value.business_type === 'SALE' || formData.value.business_type === 'BOTH'
})

const showRentPrice = computed(() => {
  return formData.value.business_type === 'RENT' || formData.value.business_type === 'BOTH'
})

// Currency formatted values - using raw string during typing, format on blur
const priceFormatted = ref('')
const rentPriceFormatted = ref('')
const condoFeeFormatted = ref('')
const iptuFormatted = ref('')

// Watch formData to update formatted values when loading
watch(() => formData.value.price, (newVal) => {
  if (newVal !== null && newVal !== undefined) {
    priceFormatted.value = formatCurrency(newVal)
  } else {
    priceFormatted.value = ''
  }
}, { immediate: true })

watch(() => formData.value.rent_price, (newVal) => {
  if (newVal !== null && newVal !== undefined) {
    rentPriceFormatted.value = formatCurrency(newVal)
  } else {
    rentPriceFormatted.value = ''
  }
}, { immediate: true })

watch(() => formData.value.condo_fee, (newVal) => {
  if (newVal !== null && newVal !== undefined) {
    condoFeeFormatted.value = formatCurrency(newVal)
  } else {
    condoFeeFormatted.value = ''
  }
}, { immediate: true })

watch(() => formData.value.iptu, (newVal) => {
  if (newVal !== null && newVal !== undefined) {
    iptuFormatted.value = formatCurrency(newVal)
  } else {
    iptuFormatted.value = ''
  }
}, { immediate: true })

// Watch state to load cities when editing
watch(() => formData.value.state, async (newVal, oldVal) => {
  // Only auto-load cities when state is set (e.g., from loading property data)
  // Don't clear city if this is initial load with existing city
  if (newVal && newVal !== oldVal && availableCities.value.length === 0) {
    await loadCitiesForState(newVal)
  }
}, { immediate: false })

// Phone formatted value
const ownerContactFormatted = computed({
  get: () => formData.value.owner_contact ? formatPhone(formData.value.owner_contact) : '',
  set: (val: string) => {
    formData.value.owner_contact = parsePhone(val) || null
  }
})

// Validation rules
const rules = {
  required: (value: any) => {
    if (typeof value === 'string') {
      return !!value?.trim() || 'Campo obrigatório'
    }
    return value !== null && value !== undefined && value !== '' || 'Campo obrigatório'
  },
  state: (value: string) => {
    if (!value) return true
    return value.length === 2 || 'Estado deve ter 2 letras'
  },
}

// AI & Matching Computed - aligned with backend visibility_score_service
const calculatedScore = computed(() => {
  let score = 0
  const f = formData.value

  // Informações básicas (25 pts)
  if (f.title && f.title.trim().length >= 5) score += 5
  if (f.description) {
    const len = f.description.trim().length
    if (len >= 100) score += 10
    else if (len >= 50) score += 5
  }
  if (f.code && f.code.trim()) score += 5
  if (f.main_image_url && f.main_image_url.trim()) score += 5

  // Localização (20 pts)
  if (f.city && f.city.trim()) score += 5
  if (f.neighborhood && f.neighborhood.trim()) score += 5
  const streetOk = f.street && f.street.trim()
  const numberOk = f.number && String(f.number).trim()
  if (streetOk && numberOk) score += 5
  else if (streetOk || numberOk) score += 3
  if (f.zip_code && String(f.zip_code).replace(/-/g, '').length >= 8) score += 5

  // Características (25 pts máx)
  let charScore = 0
  const areaTotal = parseFloat(String(f.area_total || 0)) || 0
  const areaBuilt = parseFloat(String(f.area_built || 0)) || 0
  if (areaTotal > 0) charScore += 5
  else if (areaBuilt > 0) charScore += 3
  if ((f.bedrooms || 0) > 0) charScore += 5
  if ((f.bathrooms || 0) > 0) charScore += 5
  if (f.parking_spaces !== null && f.parking_spaces !== undefined) charScore += 5
  else if (['APARTMENT', 'HOUSE'].includes(f.property_type)) charScore += 2
  if (f.has_elevator || f.furnished) charScore += 5
  else if (f.floor !== null && f.floor !== undefined) charScore += 2
  score += Math.min(charScore, 25)

  // Financeiro (20 pts máx)
  const priceVal = parseFloat(String(f.price || 0)) || parseFloat(String(f.rent_price || 0)) || 0
  let finScore = 0
  if (priceVal > 0) finScore += 10
  const hasCondo = f.condo_fee !== null && f.condo_fee !== undefined && String(f.condo_fee).trim()
  const hasIptu = f.iptu !== null && f.iptu !== undefined && String(f.iptu).trim()
  if (hasCondo || hasIptu) finScore += 5
  if (priceVal > 0) finScore += 5
  score += Math.min(finScore, 20)

  // Comercial (10 pts)
  if (f.status === 'PUBLISHED') score += 5
  if (f.assigned_agent_id) score += 5

  return Math.min(100, Math.max(0, score))
})

const completenessItems = computed(() => {
  const f = formData.value
  return [
    { label: 'Título e descrição', complete: !!f.title && !!f.description },
    { label: 'Tipo de imóvel e negócio', complete: !!f.property_type && !!f.business_type },
    { label: 'Localização completa', complete: !!f.city && !!f.neighborhood },
    { label: 'Características básicas', complete: Number(f.bedrooms ?? 0) > 0 || Number(f.area_total ?? 0) > 0 },
    { label: 'Preço definido', complete: Number(f.price ?? 0) > 0 || Number(f.rent_price ?? 0) > 0 },
    { label: 'Imagem principal', complete: !!f.main_image_url },
  ]
})

const completenessPercentage = computed(() => {
  const completed = completenessItems.value.filter(i => i.complete).length
  return Math.round((completed / completenessItems.value.length) * 100)
})

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-success'
  if (score >= 50) return 'text-warning'
  return 'text-error'
}

const getScoreColorName = (score: number): string => {
  if (score >= 80) return 'success'
  if (score >= 50) return 'warning'
  return 'error'
}

const getScoreAlertType = (score: number): 'success' | 'warning' | 'error' => {
  if (score >= 80) return 'success'
  if (score >= 50) return 'warning'
  return 'error'
}

const getScoreMessage = (score: number): string => {
  if (score >= 80) return 'Excelente! Este imóvel tem alta visibilidade.'
  if (score >= 50) return 'Bom! Adicione mais detalhes para melhorar a visibilidade.'
  return 'Baixa visibilidade. Complete os campos obrigatórios e adicione mais informações.'
}

// Gradient vermelho no anel (vermelho escuro → coral)
const scoreRingStyle = computed(() => {
  const pct = calculatedScore.value
  const mid = Math.max(1, pct * 0.5)
  return {
    background: `conic-gradient(from -90deg, #b71c1c 0%, #e53935 ${mid}%, #ff6b6b ${pct}%, rgba(0,0,0,0.05) ${pct}%)`,
  }
})

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

// CEP Functions
const formatCepInput = () => {
  // Format CEP as 00000-000
  let value = cepSearch.value.replace(/\D/g, '')
  if (value.length > 5) {
    value = value.substring(0, 5) + '-' + value.substring(5, 8)
  }
  cepSearch.value = value
}

const formatZipCodeField = () => {
  // Format zip_code field as 00000-000
  if (!formData.value.zip_code) return
  let value = formData.value.zip_code.replace(/\D/g, '')
  if (value.length > 5) {
    value = value.substring(0, 5) + '-' + value.substring(5, 8)
  }
  formData.value.zip_code = value
}

const handleSearchCep = async () => {
  const cep = cepSearch.value.replace(/\D/g, '')
  if (cep.length !== 8) {
    cepError.value = 'CEP deve ter 8 dígitos'
    return
  }
  
  isSearchingCep.value = true
  cepError.value = null
  
  try {
    // Use ViaCEP API
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.erro) {
      cepError.value = 'CEP não encontrado'
      return
    }
    
    // Fill form fields with ViaCEP data
    formData.value.street = data.logradouro || formData.value.street || ''
    formData.value.neighborhood = data.bairro || formData.value.neighborhood || ''
    formData.value.city = data.localidade || formData.value.city || ''
    formData.value.state = data.uf || formData.value.state || ''
    formData.value.zip_code = cepSearch.value
    
    // Load cities for the state if changed
    if (data.uf) {
      await loadCitiesForState(data.uf)
    }
    
    // Try to get coordinates using Nominatim (OpenStreetMap) - free geocoding
    if (data.logradouro && data.localidade && data.uf) {
      try {
        const fullAddress = `${data.logradouro}, ${data.bairro || ''}, ${data.localidade}, ${data.uf}, Brasil`
        const nominatimResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'RealEstateApp/1.0',
            },
          }
        )
        
        if (nominatimResponse.ok) {
          const nominatimData = await nominatimResponse.json()
          if (nominatimData.length > 0) {
            formData.value.latitude = parseFloat(nominatimData[0].lat)
            formData.value.longitude = parseFloat(nominatimData[0].lon)
            console.log('Coordinates found via Nominatim:', nominatimData[0].lat, nominatimData[0].lon)
          }
        }
      } catch (geoError) {
        console.warn('Could not get coordinates (optional):', geoError)
        // Don't fail - coordinates are optional
      }
    }
    
  } catch (error: any) {
    console.error('Error searching CEP:', error)
    console.error('Error name:', error?.name)
    console.error('Error message:', error?.message)
    
    if (error.name === 'TypeError' && error.message?.includes('Failed to fetch')) {
      cepError.value = 'Erro de conexão. Verifique sua internet.'
    } else if (error.message?.includes('NetworkError')) {
      cepError.value = 'Erro de rede. Verifique sua conexão.'
    } else {
      cepError.value = `Erro ao buscar CEP: ${error?.message || 'Tente novamente.'}`
    }
  } finally {
    isSearchingCep.value = false
  }
}

// Cities Functions (IBGE API)
const loadCitiesForState = async (uf: string) => {
  if (!uf) {
    availableCities.value = []
    return
  }
  
  isLoadingCities.value = true
  
  try {
    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`)
    const data = await response.json()
    
    availableCities.value = data.map((city: { nome: string }) => city.nome)
  } catch (error) {
    console.error('Error loading cities:', error)
    availableCities.value = []
  } finally {
    isLoadingCities.value = false
  }
}

const handleStateChange = async (uf: string | null) => {
  formData.value.city = '' // Clear city when state changes
  if (uf) {
    await loadCitiesForState(uf)
  } else {
    availableCities.value = []
  }
}

const getStateName = (uf: string): string => {
  const state = brazilianStates.find(s => s.uf === uf)
  return state ? state.name : uf
}

// Methods
const loadProperty = async () => {
  if (!isEditMode.value) return

  try {
    const propertyId = route.params.id as string
    property.value = await propertiesService.getPropertyById(propertyId)
    
    // Populate form with property data
    formData.value = {
      code: property.value.code,
      title: property.value.title,
      description: property.value.description,
      property_type: property.value.property_type,
      business_type: property.value.business_type,
      street: property.value.street,
      number: property.value.number,
      neighborhood: property.value.neighborhood,
      city: property.value.city,
      state: property.value.state,
      zip_code: property.value.zip_code,
      latitude: property.value.latitude,
      longitude: property.value.longitude,
      area_total: property.value.area_total,
      area_built: property.value.area_built,
      bedrooms: property.value.bedrooms,
      bathrooms: property.value.bathrooms,
      parking_spaces: property.value.parking_spaces,
      floor: property.value.floor,
      has_elevator: property.value.has_elevator,
      furnished: property.value.furnished,
      price: property.value.price ? parseFloat(property.value.price) : null,
      rent_price: property.value.rent_price ? parseFloat(property.value.rent_price) : null,
      condo_fee: property.value.condo_fee ? parseFloat(property.value.condo_fee) : null,
      iptu: property.value.iptu ? parseFloat(property.value.iptu) : null,
      status: property.value.status,
      owner_name: property.value.owner_name,
      owner_contact: property.value.owner_contact,
      visibility_score: property.value.visibility_score,
      ideal_client_profile: property.value.ideal_client_profile,
      main_image_url: property.value.main_image_url,
    }
  } catch (error) {
    console.error('Error loading property:', error)
    // TODO: Show error notification
    router.push({ name: 'properties' })
  }
}

const handleSave = async () => {
  // Validate form (skip validation if there's an image being uploaded)
  if (formRef.value) {
    const { valid } = await formRef.value.validate()
    if (!valid) {
      console.log('Form validation failed')
      // Log validation errors for debugging
      const errors = formRef.value.errors
      console.log('Validation errors:', errors)
      // Focus on first tab with errors
      activeTab.value = 'general'
      return
    }
  }

  console.log('Saving property...', formData.value)
  isSaving.value = true
  try {
    // Convert form data to API format
    const propertyData: PropertyCreate | PropertyUpdate = {
      code: formData.value.code,
      title: formData.value.title,
      description: formData.value.description || null,
      property_type: formData.value.property_type,
      business_type: formData.value.business_type,
      street: formData.value.street?.trim() || null,
      number: formData.value.number?.trim() || null,
      neighborhood: formData.value.neighborhood?.trim() || null,
      city: formData.value.city?.trim() || null,
      state: formData.value.state?.trim() ? formData.value.state.trim().toUpperCase() : null,
      zip_code: formData.value.zip_code?.trim() || null,
      latitude: formData.value.latitude ? String(formData.value.latitude) : null,
      longitude: formData.value.longitude ? String(formData.value.longitude) : null,
      area_total: formData.value.area_total ? String(formData.value.area_total) : null,
      area_built: formData.value.area_built ? String(formData.value.area_built) : null,
      bedrooms: formData.value.bedrooms ?? null,
      bathrooms: formData.value.bathrooms ?? null,
      parking_spaces: formData.value.parking_spaces ?? null,
      floor: formData.value.floor ?? null,
      has_elevator: formData.value.has_elevator,
      furnished: formData.value.furnished,
      price: formData.value.price ? String(formData.value.price) : null,
      rent_price: formData.value.rent_price ? String(formData.value.rent_price) : null,
      condo_fee: formData.value.condo_fee ? String(formData.value.condo_fee) : null,
      iptu: formData.value.iptu ? String(formData.value.iptu) : null,
      status: formData.value.status,
      owner_name: formData.value.owner_name || null,
      owner_contact: formData.value.owner_contact || null,
      // Use the value directly from formData, don't convert empty strings to null here
      // The backend will handle null/empty string conversion
      main_image_url: formData.value.main_image_url || null,
    }

    // Log for debugging
    console.log('Saving property with main_image_url:', propertyData.main_image_url)
    console.log('formData.main_image_url value:', formData.value.main_image_url)
    console.log('Full formData:', JSON.stringify(formData.value, null, 2))

    if (isEditMode.value) {
      await propertiesService.updateProperty(route.params.id as string, propertyData as PropertyUpdate)
    } else {
      await propertiesService.createProperty(propertyData as PropertyCreate)
    }

    // Redirect to list
    console.log('Property saved successfully')
    router.push({ name: 'properties' })
    // TODO: Show success notification
  } catch (error: any) {
    console.error('Error saving property:', error)
    console.error('Error details:', error.response?.data || error.message)
    // Show error to user
    const errorMessage = error.response?.data?.detail || error.message || 'Erro desconhecido ao salvar imóvel'
    alert(`Erro ao salvar imóvel: ${errorMessage}`)
  } finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.push({ name: 'properties' })
}

/**
 * Handle image upload success
 */
const handleImageUploaded = async (imageUrl: string) => {
  console.log('handleImageUploaded called with imageUrl:', imageUrl)
  console.log('formData.main_image_url BEFORE update:', formData.value.main_image_url)
  
  // Explicitly set the value - v-model should handle this, but let's be sure
  formData.value.main_image_url = imageUrl
  
  console.log('formData.main_image_url AFTER explicit set:', formData.value.main_image_url)
  
  // Force a reactive update by creating a new object reference
  // This ensures Vue's reactivity system picks up the change
  formData.value = { ...formData.value, main_image_url: imageUrl }
  
  console.log('formData.main_image_url AFTER spread:', formData.value.main_image_url)
  
  // If in edit mode, reload property to ensure sync with backend
  if (isEditMode.value && route.params.id) {
    try {
      const updatedProperty = await propertiesService.getPropertyById(route.params.id as string)
      property.value = updatedProperty
      // Update formData with the latest property data, especially main_image_url
      formData.value.main_image_url = updatedProperty.main_image_url || imageUrl
      console.log('Property reloaded, main_image_url:', updatedProperty.main_image_url)
      console.log('formData.main_image_url after reload:', formData.value.main_image_url)
    } catch (error) {
      console.warn('Could not reload property after image upload:', error)
      // Continue anyway - the image URL is already set
    }
  }
}

/**
 * Handle image upload error
 */
const handleImageError = (error: string) => {
  // Error is already shown in the component
  // Optionally show additional notification here
  console.error('Image upload error:', error)
}

/**
 * Format geocoding error messages to be more user-friendly
 * Returns an array of strings for better display in Vuetify error messages
 */
const formatGeocodingError = (error: any): string[] => {
  const errorMessage = error?.response?.data?.detail || error?.message || error?.toString() || ''
  
  // Check for specific Google Maps URL error
  if (errorMessage.includes('Could not extract valid location information from Google Maps URL') ||
      errorMessage.includes('place_id or coordinates')) {
    return [
      'Não foi possível identificar a localização neste link do Google Maps.',
      'Por favor, tente uma das opções abaixo:',
      '• Cole um endereço completo em texto (ex: "Rua Exemplo, 123, São Paulo, SP")',
      '• Use um link direto do Google Maps que contenha coordenadas ou um local específico',
      '• Ou preencha os campos de endereço manualmente'
    ]
  }
  
  // Check for other common geocoding errors
  if (errorMessage.includes('ZERO_RESULTS') || errorMessage.includes('not found')) {
    return ['Endereço não encontrado. Verifique se o endereço está correto e tente novamente.']
  }
  
  if (errorMessage.includes('OVER_QUERY_LIMIT') || errorMessage.includes('quota')) {
    return ['Limite de consultas excedido. Por favor, tente novamente em alguns instantes.']
  }
  
  if (errorMessage.includes('REQUEST_DENIED') || errorMessage.includes('permission')) {
    return ['Erro de permissão na busca de endereço. Entre em contato com o suporte.']
  }
  
  // Generic error message
  return ['Erro ao buscar endereço. Verifique se o endereço está correto ou tente preencher os campos manualmente.']
}

const handleGeocodeAddress = async () => {
  if (!addressSearch.value.trim()) {
    return
  }

  isGeocoding.value = true
  geocodeError.value = null

  try {
    const addressData: AddressData = await propertiesService.geocodeAddress(addressSearch.value.trim())
    
    // Fill form fields with geocoded data
    if (addressData.street) {
      formData.value.street = addressData.street
    }
    if (addressData.number) {
      formData.value.number = addressData.number
    }
    if (addressData.neighborhood) {
      formData.value.neighborhood = addressData.neighborhood
    }
    if (addressData.city) {
      formData.value.city = addressData.city
    }
    if (addressData.state) {
      formData.value.state = addressData.state.toUpperCase()
    }
    if (addressData.zip_code) {
      formData.value.zip_code = addressData.zip_code
    }
    if (addressData.latitude) {
      formData.value.latitude = addressData.latitude
    }
    if (addressData.longitude) {
      formData.value.longitude = addressData.longitude
    }

    // Clear search field after successful geocoding
    addressSearch.value = ''
    
    // Show success message (you can add a snackbar here if needed)
  } catch (error: any) {
    console.error('Geocoding error:', error)
    geocodeError.value = formatGeocodingError(error)
  } finally {
    isGeocoding.value = false
  }
}

// Handle real-time currency input formatting (like banking apps)
const handlePriceInput = (event: Event, field: 'price' | 'rent_price' | 'condo_fee' | 'iptu') => {
  const target = event.target as HTMLInputElement
  const inputValue = target.value
  
  // Store cursor position before formatting
  const cursorPosition = target.selectionStart || 0
  
  // Remove all formatting to get raw digits
  const rawDigits = inputValue.replace(/\D/g, '')
  
  if (rawDigits === '') {
    // Clear the field
    switch (field) {
      case 'price':
        priceFormatted.value = ''
        formData.value.price = null
        break
      case 'rent_price':
        rentPriceFormatted.value = ''
        formData.value.rent_price = null
        break
      case 'condo_fee':
        condoFeeFormatted.value = ''
        formData.value.condo_fee = null
        break
      case 'iptu':
        iptuFormatted.value = ''
        formData.value.iptu = null
        break
    }
    return
  }
  
  // Format in real-time
  const formatted = formatCurrencyInputRealTime(rawDigits)
  
  // Update the appropriate field
  switch (field) {
    case 'price':
      priceFormatted.value = formatted
      break
    case 'rent_price':
      rentPriceFormatted.value = formatted
      break
    case 'condo_fee':
      condoFeeFormatted.value = formatted
      break
    case 'iptu':
      iptuFormatted.value = formatted
      break
  }
  
  // Update formData immediately (for real-time updates)
  const parsed = parseCurrencyInputRealTime(formatted)
  if (parsed !== null) {
    switch (field) {
      case 'price':
        formData.value.price = parsed
        break
      case 'rent_price':
        formData.value.rent_price = parsed
        break
      case 'condo_fee':
        formData.value.condo_fee = parsed
        break
      case 'iptu':
        formData.value.iptu = parsed
        break
    }
  }
  
  // Restore cursor position after formatting (next tick to ensure DOM is updated)
  // For better UX like banking apps, place cursor at the end when typing
  nextTick(() => {
    // Place cursor at the end of the formatted value (common in banking apps)
    // This provides a better typing experience - user continues typing from the end
    target.setSelectionRange(formatted.length, formatted.length)
  })
}

// Handle blur event to ensure final formatting
const handlePriceBlur = (field: 'price' | 'rent_price' | 'condo_fee' | 'iptu') => {
  let formattedValue: string
  let parsedValue: number | null
  
  switch (field) {
    case 'price':
      formattedValue = priceFormatted.value
      parsedValue = parseCurrencyInputRealTime(formattedValue)
      formData.value.price = parsedValue
      priceFormatted.value = parsedValue ? formatCurrency(parsedValue) : ''
      break
    case 'rent_price':
      formattedValue = rentPriceFormatted.value
      parsedValue = parseCurrencyInputRealTime(formattedValue)
      formData.value.rent_price = parsedValue
      rentPriceFormatted.value = parsedValue ? formatCurrency(parsedValue) : ''
      break
    case 'condo_fee':
      formattedValue = condoFeeFormatted.value
      parsedValue = parseCurrencyInputRealTime(formattedValue)
      formData.value.condo_fee = parsedValue
      condoFeeFormatted.value = parsedValue ? formatCurrency(parsedValue) : ''
      break
    case 'iptu':
      formattedValue = iptuFormatted.value
      parsedValue = parseCurrencyInputRealTime(formattedValue)
      formData.value.iptu = parsedValue
      iptuFormatted.value = parsedValue ? formatCurrency(parsedValue) : ''
      break
  }
}

// Watch business_type to clear prices when not applicable
watch(() => formData.value.business_type, (newType) => {
  if (newType === 'SALE') {
    formData.value.rent_price = null
  } else if (newType === 'RENT') {
    formData.value.price = null
  }
})

onMounted(async () => {
  await loadProperty()
})
</script>

<style scoped>
:deep(.v-window-item) {
  transition: none;
}

/* CRITICAL: Remove all overflow hidden from parent containers */
:deep(.v-card),
:deep(.v-card-text),
:deep(.v-card-body),
:deep(.v-window),
:deep(.v-window-item),
:deep(.v-row),
:deep(.v-col),
:deep(.v-form),
:deep(.v-tabs),
:deep(.v-tabs-window) {
  overflow: visible !important;
}

/* Add significant padding to columns to accommodate floating labels */
:deep(.v-col) {
  padding-top: 28px !important;
  padding-bottom: 28px !important;
  overflow: visible !important;
  min-height: 90px !important;
}

/* Ensure card text has extra space at top */
:deep(.v-card-text) {
  padding-top: 28px !important;
  overflow: visible !important;
}

/* Fix label - ensure it's never clipped */
:deep(.v-field--variant-outlined .v-label) {
  white-space: nowrap !important;
  overflow: visible !important;
  text-overflow: unset !important;
  max-width: none !important;
  pointer-events: none;
}

/* When label is floating - ensure background covers the border line */
:deep(.v-field--focused.v-field--variant-outlined .v-label),
:deep(.v-field--active.v-field--variant-outlined .v-label),
:deep(.v-field--dirty.v-field--variant-outlined .v-label) {
  transform: translateY(-12px) scale(0.75) !important;
  background-color: rgb(var(--v-theme-surface)) !important;
  padding: 0px 10px !important;
  margin: 0px -10px !important;
  max-width: none !important;
  width: auto !important;
  min-width: fit-content !important;
  white-space: nowrap !important;
  overflow: visible !important;
  text-overflow: unset !important;
  left: 0 !important;
  right: auto !important;
  z-index: 10 !important;
  position: absolute !important;
  top: 0 !important;
}

/* Ensure field container has space and doesn't clip */
:deep(.v-field--variant-outlined) {
  padding-top: 0 !important;
  overflow: visible !important;
  min-height: 56px;
}

:deep(.v-field--variant-outlined .v-field__overlay) {
  padding-top: 0 !important;
  overflow: visible !important;
}

/* Ensure field input area doesn't clip labels */
:deep(.v-field__input) {
  overflow: visible !important;
}

:deep(.v-field__input .v-field__input__control) {
  overflow: visible !important;
}

/* Fix for select and autocomplete specifically */
:deep(.v-select),
:deep(.v-autocomplete),
:deep(.v-text-field),
:deep(.v-textarea) {
  overflow: visible !important;
}

:deep(.v-select .v-field),
:deep(.v-autocomplete .v-field),
:deep(.v-text-field .v-field),
:deep(.v-textarea .v-field) {
  overflow: visible !important;
}

/* Ensure the field wrapper doesn't clip */
:deep(.v-input) {
  overflow: visible !important;
}

:deep(.v-input__details) {
  overflow: visible !important;
}

/* Visibilidade tab - cards sem borda, mesmo tamanho, estilo moderno */
.visibilidade-tab :deep(.visibility-score-card),
.visibilidade-tab :deep(.completeness-card) {
  border: none !important;
  border-radius: 12px !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04) !important;
  min-height: 380px;
}

/* Score ring - gradiente vermelho, espaçamento interno */
.score-ring {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  box-sizing: border-box;
}

.score-ring-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgb(var(--v-theme-surface));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.visibilidade-tab :deep(.completeness-list .completeness-item) {
  min-height: 44px;
}

.visibilidade-tab :deep(.completeness-item .v-list-item__prepend) {
  padding-right: 12px;
}
</style>
