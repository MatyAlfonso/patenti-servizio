<template>
  <div class="page-container">
    <div class="header-section">
      <h2>Anagrafica del personale</h2>
      <SearchBar v-model="searchQuery" placeholder="Cerca per cognome, nome o CF..." />
      <button class="btn-new" @click="openCreateModal">
        <Icon name="add" size="18" /> Nuova persona
      </button>
    </div>

    <Modal
      v-if="showModal"
      :title="isEditing ? 'Modifica persona' : 'Nuova persona'"
      @close="showModal = false"
    >
      <form @submit.prevent="savePerson" class="grid-form">
        <div class="form-group">
          <label>Cognome</label>
          <input v-model="personForm.cognome" type="text" required />
        </div>
        <div class="form-group">
          <label>Nome</label>
          <input v-model="personForm.nome" type="text" required />
        </div>
        <div class="form-group">
          <label>Codice Fiscale</label>
          <input
            v-model="personForm.codice_fiscale"
            type="text"
            :style="[{ textTransform: 'uppercase' }]"
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
          <button type="button" @click="showModal = false" class="btn-cancel">
            Annulla
          </button>
          <button type="submit" class="btn-save" :disabled="isSaving">Salva</button>
        </div>
      </form>
    </Modal>

    <Modal
      v-if="confirmAction.show"
      :title="confirmAction.title"
      @close="confirmAction.show = false"
    >
      <div class="confirm-modal-content">
        <p v-html="confirmAction.message"></p>
        <p v-if="confirmAction.warning" class="warning-text">
          {{ confirmAction.warning }}
        </p>
        <div class="form-actions">
          <button @click="confirmAction.show = false" class="btn-cancel">Annulla</button>
          <button
            @click="confirmAction.callback"
            class="btn-delete-confirm"
            :disabled="isSaving"
          >
            {{ isSaving ? "Eliminando..." : "Conferma" }}
          </button>
        </div>
      </div>
    </Modal>

    <Loading v-if="loading" text="Recupero anagrafica del personale..." />

    <div v-else-if="error">{{ error }}</div>

    <Table v-else :items="filteredPeople" :fields="tableColumns" :striped="true">
      <template #cell[actions]="{ data }">
        <div class="actions-wrapper">
          <button
            class="btn-icon edit"
            @click="openEditModal(data.item)"
            title="Modifica"
          >
            <Icon name="edit" size="24" />
          </button>
          <button
            class="btn-icon delete"
            @click="confirmDelete(data.item)"
            title="Elimina"
          >
            <Icon name="delete" size="24" />
          </button>
        </div>
      </template>
    </Table>

    <Toast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="toast.show = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { apiClient } from "@/services/api";
import Table from "@/components/Table.vue";
import Modal from "@/components/Modal.vue";
import Icon from "@/components/Icon.vue";
import Toast from "@/components/Toast.vue";
import SearchBar from "@/components/SearchBar.vue";
import Loading from "@/components/LoadingSpinner.vue";
import { formatDate } from "@/utils/formatters";

const people = ref([]);
const loading = ref(true);
const isSaving = ref(false);
const showModal = ref(false);
const isEditing = ref(false);
const searchQuery = ref("");
const error = ref(null);
const confirmAction = ref({
  show: false,
  title: "",
  message: "",
  warning: "",
  callback: null,
});

const initialPersonState = {
  cognome: "",
  nome: "",
  codice_fiscale: "",
  data_nascita: "",
  luogo_nascita: "",
};

const personForm = ref({ ...initialPersonState });

const tableColumns = [
  { key: "cognome", label: "Cognome", sortable: true },
  { key: "nome", label: "Nome", sortable: true },
  { key: "codice_fiscale", label: "Codice fiscale", sortable: true },
  {
    key: "data_nascita",
    label: "Data di nascita",
    sortable: true,
    formatter: formatDate,
  },
  { key: "luogo_nascita", label: "Luogo di nascita", sortable: true },
  { key: "actions", label: "Azioni" },
];

const toast = ref({ show: false, message: "", type: "success" });
const filteredPeople = computed(() => {
  const query = searchQuery.value.toLowerCase();
  if (!query) return people.value;

  return people.value.filter(
    (p) =>
      p.cognome.toLowerCase().includes(query) ||
      p.nome.toLowerCase().includes(query) ||
      p.codice_fiscale.toLowerCase().includes(query)
  );
});

const openCreateModal = () => {
  isEditing.value = false;
  personForm.value = { ...initialPersonState };
  showModal.value = true;
};

const openEditModal = (item) => {
  isEditing.value = true;
  personForm.value = { ...item };
  showModal.value = true;
};

const savePerson = async () => {
  try {
    isSaving.value = true;
    const payload = {
      ...personForm.value,
      codice_fiscale: personForm.value.codice_fiscale.toUpperCase().trim(),
    };

    if (isEditing.value) {
      await apiClient.patch(`/persone/${payload.id}`, payload);
      showToast("Dati aggiornati!");
    } else {
      await apiClient.post("/persone", payload);
      showToast("Persona creata!");
    }
    showModal.value = false;
    await loadPeople();
  } catch (err) {
    showToast(err.response?.data?.error || "Errore al salvare", "error");
  } finally {
    isSaving.value = false;
  }
};

const loadPeople = async () => {
  try {
    loading.value = true;
    people.value = await apiClient.get("/persone");
  } catch (err) {
    error.value = "Nessun personale trovato.";
  } finally {
    loading.value = false;
  }
};

const confirmDelete = (person) => {
  confirmAction.value = {
    show: true,
    title: "Conferma eliminazione",
    message: `Sei sicuro di voler eliminare <strong>${person.cognome} ${person.nome}</strong>?`,
    warning: "L'azione è irreversibile.",
    callback: () => executeDelete(person.id),
  };
};

const executeDelete = async (id) => {
  try {
    isSaving.value = true;
    await apiClient.delete(`/persone/${id}`);
    showToast("Persona eliminata!");
    confirmAction.value.show = false;
    await loadPeople();
  } catch (err) {
    showToast("Errore nell'eliminazione", "error");
  } finally {
    isSaving.value = false;
  }
};

const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type };
  setTimeout(() => (toast.value.show = false), 4000);
};

onMounted(loadPeople);
</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.btn-new {
  background-color: #ff5900;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}
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
}
.btn-save:disabled {
  background: #ccc;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
}
.btn-icon.edit {
  color: #0067b1;
}
.btn-icon.delete {
  color: #dc3545;
}

.btn-delete-confirm {
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;

  &:disabled {
    background: #eaa1a8;
    cursor: not-allowed;
  }
}
.btn-cancel {
  background: #eee;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.actions-wrapper {
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>
