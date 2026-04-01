<template>
  <div class="page-container">
    <div class="header-section">
      <h1>Anagrafica degli enti</h1>

      <SearchBar v-model="searchQuery" placeholder="Cerca per codice o nome..." />

      <button class="btn-new" @click="openCreateModal">
        <Icon name="add" size="24" /> Nuovo ente
      </button>
    </div>

    <Modal
      v-if="showModal"
      :title="isEditing ? 'Modifica ente' : 'Nuovo ente'"
      @close="showModal = false"
    >
      <form @submit.prevent="saveEntity" class="grid-form">
        <div class="form-group">
          <label>Codice ente</label>
          <input
            v-model="entityForm.id"
            type="text"
            :readonly="isEditing"
            placeholder="Es: PCR, CFR"
            required
            :style="[
              isEditing ? { background: '#f0f0f0' } : {},
              { textTransform: 'uppercase' },
            ]"
            @input="entityForm.id = entityForm.id.toUpperCase()"
          />
        </div>

        <div class="form-group">
          <label>Descrizione</label>
          <input
            v-model="entityForm.descrizione"
            type="text"
            placeholder="Es: Protezione Civile Regionale"
            required
          />
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
        <div class="form-actions">
          <button @click="confirmAction.show = false" class="btn-cancel">Annulla</button>
          <button
            @click="confirmAction.callback"
            class="btn-delete-confirm"
            :disabled="isSaving"
          >
            {{ isSaving ? "Eliminando..." : "Sì, elimina" }}
          </button>
        </div>
      </div>
    </Modal>

    <Loading v-if="loading" text="Recupero anagrafica degli enti..." />

    <div v-else-if="error">{{ error }}</div>

    <Table v-else :items="filteredEntities" :fields="tableColumns" :striped="true">
      <template #cell[actions]="{ data }">
        <div class="actions-wrapper">
          <button
            class="btn-icon edit"
            @click="openEditModal(data.item)"
            title="Modifica"
          >
            <Icon name="edit" size="32" />
          </button>
          <button
            class="btn-icon delete"
            @click="confirmDelete(data.item)"
            title="Elimina"
          >
            <Icon name="delete" size="32" />
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
import Api from "@/services/Api";
import Table from "@/components/Table.vue";
import Modal from "@/components/Modal.vue";
import Icon from "@/components/Icon.vue";
import Toast from "@/components/Toast.vue";
import Loading from "@/components/LoadingSpinner.vue";
import SearchBar from "@/components/SearchBar.vue";

const entities = ref([]);
const loading = ref(true);
const isSaving = ref(false);
const showModal = ref(false);
const error = ref(null);
const searchQuery = ref("");
const isEditing = ref(false);
const confirmAction = ref({ show: false, title: "", message: "", callback: null });

const initialEntityState = {
  id: "",
  descrizione: "",
};

const entityForm = ref({ ...initialEntityState });

const tableColumns = [
  { key: "id", label: "Codice", sortable: true },
  { key: "descrizione", label: "Descrizione", sortable: true },
  { key: "actions", label: "Azioni" },
];

const toast = ref({
  show: false,
  message: "",
  type: "success",
});

const filteredEntities = computed(() => {
  const query = searchQuery.value.toLowerCase();

  if (!query) return entities.value;

  return entities.value.filter((e) => {
    return (
      e.descrizione.toLowerCase().includes(query) || e.id.toLowerCase().includes(query)
    );
  });
});

const loadEntities = async () => {
  try {
    loading.value = true;
    entities.value = await Api.getEnti();
  } catch (err) {
    error.value = "Nessun ente trovato.";
  } finally {
    loading.value = false;
  }
};

const openEditModal = (entity) => {
  isEditing.value = true;
  entityForm.value = { ...entity };
  showModal.value = true;
};

const openCreateModal = () => {
  isEditing.value = false;
  entityForm.value = { ...initialEntityState };
  showModal.value = true;
};

const saveEntity = async () => {
  try {
    isSaving.value = true;

    const payload = {
      ...entityForm.value,
      id: entityForm.value.id.toUpperCase().trim(),
    };

    if (isEditing.value) {
      await Api.updateEnte(payload.id, { descrizione: payload.descrizione });
      showToast("Ente aggiornato con successo!");
    } else {
      await Api.createEnte(payload);
      showToast("Ente creato con successo!");
    }

    showModal.value = false;
    await loadEntities();
  } catch (err) {
    showToast("Errore: " + err.message, "error");
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = (entity) => {
  confirmAction.value = {
    show: true,
    title: "Conferma eliminazione",
    message: `Sei sicuro di voler eliminare l'ente <strong>${entity.descrizione}</strong>?`,
    callback: () => executeDelete(entity.id),
  };
};

const executeDelete = async (id) => {
  try {
    isSaving.value = true;
    await Api.deleteEnte(id);
    showToast("Ente eliminato con successo!");
    confirmAction.value.show = false;
    await loadEntities();
  } catch (err) {
    showToast(err, "error");
  } finally {
    isSaving.value = false;
  }
};

const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 4000);
};

onMounted(loadEntities);
</script>

<style scoped>
button {
  font-size: 1.1rem;
}

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
  font-size: 1.1rem;
  color: #555;
}
.form-group input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1.1rem;
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
.actions-wrapper {
  display: flex;
  gap: 10px;
  justify-content: center;
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
</style>
