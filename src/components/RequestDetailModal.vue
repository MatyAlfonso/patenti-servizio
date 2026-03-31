<template>
  <Modal
    v-if="modelValue"
    title="Dettaglio richiesta"
    @close="$emit('update:modelValue', false)"
  >
    <div class="detail-container" v-if="request">
      <div class="detail-grid">
        <div class="detail-images">
          <div class="image-box">
            <label>Fototessera</label>
            <img :src="`api/${request.fototessera?.path}`" class="full-img" />
          </div>
          <div class="image-box">
            <label>Firma autografa</label>
            <img
              :src="`api/${request.firma_scansionata?.path}`"
              class="full-img signature"
            />
          </div>
        </div>

        <div class="detail-info">
          <section>
            <h3>Dati personali</h3>
            <p>
              <strong>Cognome e nome:</strong> {{ request.persona?.cognome }}
              {{ request.persona?.nome }}
            </p>
            <p><strong>Codice fiscale:</strong> {{ request.persona?.codice_fiscale }}</p>
            <p>
              <strong>Data di nascita:</strong>
              {{ formatDate(request.persona?.data_nascita) }}
            </p>
            <p><strong>Luogo di nascita:</strong> {{ request.persona?.luogo_nascita }}</p>
            <p><strong>Residenza:</strong> {{ request.residenza_persona }}</p>
          </section>

          <section v-if="request.persona?.patente_civile?.length">
            <h3>Patente civile</h3>
            <p><strong>Numero:</strong> {{ request.persona.patente_civile[0].numero }}</p>
            <p>
              <strong>Categoria:</strong>
              {{ request.persona.patente_civile[0].id_categoria }}
            </p>
            <p>
              <strong>Rilasciata da:</strong>
              {{ request.persona.patente_civile[0].autorita }}
            </p>
            <p>
              <strong>Scadenza:</strong>
              {{ formatDate(request.persona.patente_civile[0].data_scadenza) }}
            </p>
          </section>

          <section>
            <h3>Richiesta</h3>
            <p><strong>Ente:</strong> {{ request.ente?.descrizione }}</p>
            <p>
              <strong>Stato: </strong>
              <span :class="['badge', request.id_stato]">
                {{ request.stato?.descrizione }}
              </span>
            </p>
          </section>
        </div>
      </div>

      <div class="form-actions">
        <button
          v-if="request.id_stato === 'IN_PREPARAZIONE'"
          class="btn-reject"
          @click="$emit('reject', request)"
        >
          <Icon name="block" size="18" /> Respingi
        </button>

        <button
          v-if="request.id_stato === 'IN_PREPARAZIONE'"
          class="btn-save"
          @click="$emit('approve', request)"
        >
          <Icon name="print" size="18" /> Approva e stampa
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import Modal from "@/components/Modal.vue";
import Icon from "@/components/Icon.vue";
import { formatDate } from "@/utils/formatters";

defineProps({
  modelValue: Boolean,
  request: Object,
});

defineEmits(["update:modelValue", "approve", "reject"]);
</script>

<style scoped>
.detail-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 30px;
}

.detail-images {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.image-box {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.image-box label {
  font-size: 0.8rem;
  font-weight: bold;
  color: #666;
}

.full-img {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f9f9f9;
}

.full-img.signature {
  height: 80px;
  object-fit: contain;
}

.detail-info section {
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.detail-info h3 {
  margin: 0 0 10px 0;
  font-size: 1rem;
  color: #0067b1;
}

.detail-info p {
  margin: 5px 0;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.btn-save {
  background: #0067b1;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;

  &:disabled {
    background: #ccc;
  }
}
.btn-reject {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    background-color: #c82333;
  }
}

.badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: uppercase;
}
.badge.IN_PREPARAZIONE {
  background: #fff3cd;
  color: #856404;
}
.badge.ATTIVA {
  background: #d4edda;
  color: #155724;
}
.badge.REVOCATA,
.badge.RESPINTA,
.badge.SCADUTA,
.badge.SOSPESA,
.badge.ANNULLATA,
.badge.RUBATA,
.badge.SMARRITA {
  background: #f8d7da;
  color: #721c24;
}
</style>
