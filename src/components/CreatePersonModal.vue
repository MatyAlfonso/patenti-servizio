<template>
  <Modal
    v-if="modelValue"
    title="Anagrafica nuova persona"
    @close="$emit('update:modelValue', false)"
  >
    <form @submit.prevent="submitNewPerson" class="grid-form">
      <div class="form-group">
        <label>Cognome</label>
        <input v-model="personForm.cognome" type="text" required />
      </div>
      <div class="form-group">
        <label>Nome</label>
        <input v-model="personForm.nome" type="text" required />
      </div>
      <div class="form-group">
        <label>Codice fiscale</label>
        <input
          v-model="personForm.codice_fiscale"
          type="text"
          @input="personForm.codice_fiscale = personForm.codice_fiscale.toUpperCase()"
          required
        />
      </div>
      <div class="form-group">
        <label>Data di nascita</label>
        <input v-model="personForm.data_nascita" type="date" required />
      </div>
      <div class="form-group">
        <label>Luogo di nascita</label>
        <input v-model="personForm.luogo_nascita" type="text" required />
      </div>

      <div class="form-actions">
        <button
          type="button"
          @click="$emit('update:modelValue', false)"
          class="btn-cancel"
        >
          Annulla
        </button>
        <button type="submit" class="btn-save" :disabled="loading">
          {{ loading ? "Salvataggio..." : "Salva persona" }}
        </button>
      </div>
    </form>

    <Toast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="toast.show = false"
    />
  </Modal>
</template>

<script setup>
import { ref } from "vue";
import { apiClient } from "@/services/api";
import Modal from "@/components/Modal.vue";
import Toast from "@/components/Toast.vue";

defineProps({ modelValue: Boolean });
const emit = defineEmits(["update:modelValue", "person-created"]);

const loading = ref(false);
const toast = ref({ show: false, message: "", type: "error" });

const personForm = ref({
  cognome: "",
  nome: "",
  codice_fiscale: "",
  data_nascita: "",
  luogo_nascita: "",
});

const showToast = (msg, type = "error") => {
  toast.value = { show: true, message: msg, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

const submitNewPerson = async () => {
  try {
    loading.value = true;
    const response = await apiClient.post("/persone", personForm.value);

    const newId = response.id || (response.data && response.data.id);

    if (newId) {
      emit("person-created", newId);
    } else {
      console.error("ID non trovato nella risposta:", response);
    }
    emit("update:modelValue", false);

    personForm.value = {
      cognome: "",
      nome: "",
      codice_fiscale: "",
      data_nascita: "",
      luogo_nascita: "",
    };
  } catch (err) {
    const msg =
      err.message === "Validation error"
        ? "Errore: Persona già esistente o dati non validi"
        : err.message || "Errore nella creazione della persona";

    showToast(msg, "error");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.grid-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.form-group label {
  font-weight: bold;
  font-size: 0.9rem;
  color: #555;
}
.form-group input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.btn-cancel {
  background: #eee;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
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
</style>
