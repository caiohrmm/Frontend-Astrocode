<template>
  <v-dialog
    v-model="dialog"
    max-width="600"
    persistent
    scrollable
  >
    <v-card>
      <v-card-title class="d-flex align-center pa-4 bg-primary text-white">
        <v-icon class="mr-3" size="32">mdi-calendar-check</v-icon>
        <span class="text-h6">Visita Detectada pela IA</span>
      </v-card-title>

      <v-card-text class="pa-6">
        <div class="mb-4">
          <v-alert
            type="info"
            variant="tonal"
            density="comfortable"
            class="mb-4"
          >
            <div class="d-flex align-center">
              <v-icon class="mr-2">mdi-robot</v-icon>
              <div>
                <div class="font-weight-medium mb-1">A IA detectou uma intenção de agendamento de visita</div>
                <div class="text-caption">Com base na conversa, identificamos que o cliente deseja agendar uma visita.</div>
              </div>
            </div>
          </v-alert>

          <v-card variant="outlined" class="mb-4">
            <v-card-text>
              <div class="text-subtitle-1 font-weight-medium mb-3">
                <v-icon class="mr-2" color="primary">mdi-information</v-icon>
                Detalhes da Visita
              </div>
              
              <v-row dense>
                <v-col cols="12" sm="6">
                  <div class="text-caption text-medium-emphasis">Data</div>
                  <div class="text-body-1 font-weight-medium">
                    <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
                    {{ visitInfo.date || 'Não especificada' }}
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="text-caption text-medium-emphasis">Horário</div>
                  <div class="text-body-1 font-weight-medium">
                    <v-icon size="small" class="mr-1">mdi-clock</v-icon>
                    {{ visitInfo.time || 'Não especificado' }}
                  </div>
                </v-col>
                <v-col cols="12" v-if="visitInfo.extracted_text">
                  <div class="text-caption text-medium-emphasis">Texto Extraído</div>
                  <div class="text-body-2">
                    "{{ visitInfo.extracted_text }}"
                  </div>
                </v-col>
                <v-col cols="12" v-if="visitInfo.confidence">
                  <div class="text-caption text-medium-emphasis">Confiança da Detecção</div>
                  <div class="d-flex align-center">
                    <v-progress-linear
                      :model-value="(visitInfo.confidence * 100)"
                      color="primary"
                      height="8"
                      rounded
                      class="mr-2"
                      style="flex: 1; max-width: 200px;"
                    ></v-progress-linear>
                    <span class="text-body-2">{{ Math.round(visitInfo.confidence * 100) }}%</span>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-alert
            v-if="visitInfo.notes"
            type="warning"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            <div class="text-caption">{{ visitInfo.notes }}</div>
          </v-alert>
        </div>

        <div class="text-body-2 text-medium-emphasis mb-4">
          Deseja criar uma visita com essas informações? Você poderá editar os detalhes antes de salvar.
        </div>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          @click="handleCancel"
        >
          Não, obrigado
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-calendar-plus"
          @click="handleConfirm"
          :loading="isCreating"
        >
          Sim, criar visita
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { DetectedVisitInfo } from '@/shared/services/attendances.service'
import { visitsService, type VisitCreate } from '@/shared/services/visits.service'

interface Props {
  modelValue: boolean
  visitInfo: DetectedVisitInfo | null
  clientId: string
  agentId: string
  propertyId?: string | null
  attendanceId?: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirmed': []
  'cancelled': []
}>()

const router = useRouter()
const dialog = ref(props.modelValue)
const isCreating = ref(false)

watch(() => props.modelValue, (newVal) => {
  dialog.value = newVal
})

watch(dialog, (newVal) => {
  emit('update:modelValue', newVal)
})

const handleCancel = () => {
  emit('cancelled')
  dialog.value = false
}

const handleConfirm = async () => {
  if (!props.visitInfo || !props.visitInfo.scheduled_at) {
    return
  }

  isCreating.value = true

  try {
    // Create visit data
    const visitData: VisitCreate = {
      client_id: props.clientId,
      broker_id: props.agentId,
      scheduled_at: props.visitInfo.scheduled_at,
      property_id: props.propertyId || props.visitInfo.property_id || null,
      status: 'SCHEDULED',
      notes: props.visitInfo.notes || `Visita detectada automaticamente pela IA: ${props.visitInfo.extracted_text || ''}`,
      attendance_id: props.attendanceId || null, // Vincula ao atendimento
    }

    // Create the visit
    const visit = await visitsService.createVisit(visitData)

    // Close dialog
    dialog.value = false
    emit('confirmed')

    // Navigate to visit edit page
    router.push({
      name: 'visits-edit',
      params: { id: visit.id },
      query: { from: 'attendance' }
    })
  } catch (error) {
    console.error('Error creating visit:', error)
    // Still close dialog and emit confirmed, but show error
    dialog.value = false
    emit('confirmed')
  } finally {
    isCreating.value = false
  }
}
</script>

<style scoped>
.v-card-title {
  border-radius: 4px 4px 0 0;
}
</style>

