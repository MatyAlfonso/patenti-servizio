<template>
  <div class="page-container">
    <div class="header-section">
      <h2>Richieste</h2>

      <div class="toolbar">
        <SearchBar v-model="searchQuery" placeholder="Cerca per cognome, nome o CF..." />

        <Filter
          v-model:statusFilter="statusFilter"
          v-model:sortOrder="sortOrder"
          :options="statusOptions"
        />
      </div>

      <button class="btn-new" @click="openCreateModal">
        <Icon name="add" size="18" /> Nuova richiesta
      </button>
    </div>

    <RequestFormModal
      v-model="showModal"
      :edit-data="selectedRequest"
      :people="people"
      :categories="categories"
      @saved="handleSaved"
      @refresh-people="loadData"
      @error="(msg) => showToast(msg, 'error')"
    />

    <RequestDetailModal
      v-model="showDetailModal"
      :request="selectedRequest"
      @approve="printLicense"
      @reject="confirmReject"
    />

    <Modal
      v-if="confirmAction.show"
      :title="confirmAction.title"
      @close="confirmAction.show = false"
    >
      <div class="confirm-modal-content">
        <p v-html="confirmAction.message"></p>
        <div class="form-actions">
          <button @click="confirmAction.show = false" class="btn-cancel">Annulla</button>
          <button @click="confirmAction.callback" class="btn-reject" :disabled="isSaving">
            Conferma
          </button>
        </div>
      </div>
    </Modal>

    <Loading v-if="loading" text="Recupero le richieste..." />

    <div v-else-if="error">{{ error }}</div>

    <Table v-else :items="filteredRichiesteRaw" :fields="columns">
      <template #cell[data_richiesta]="{ data }">
        {{ formatDate(data.item.data_richiesta) }}
      </template>

      <template #cell[titolare]="{ data }">
        {{ data.item.persona?.cognome }} {{ data.item.persona?.nome }}
      </template>

      <template #cell[ente.descrizione]="{ data }">
        {{ data.item.ente?.descrizione || "-" }}
      </template>

      <template #cell[tipo.descrizione]="{ data }">
        {{ data.item.tipo?.descrizione || "-" }}
      </template>

      <template #cell[id_stato]="{ data }">
        <span :class="['badge', data.item.id_stato]">
          {{ data.item.stato?.descrizione || data.item.id_stato }}
        </span>
      </template>

      <template #cell[foto]="{ data }">
        <div class="images-container">
          <template v-if="data.item.fototessera">
            <img
              :src="`api/${data.item.fototessera.path}`"
              class="thumbnail"
              title="Foto"
            />
            <img
              :src="`api/${data.item.firma_scansionata?.path}`"
              class="thumbnail"
              title="Firma"
            />
          </template>
          <Icon v-else name="photo" color="#ccc" size="30" />
        </div>
      </template>

      <template #cell[actions]="{ data }">
        <div class="actions-wrapper">
          <button
            class="btn-icon details"
            @click="viewDetails(data.item)"
            title="Dettagli"
          >
            <Icon name="visibility" size="24" />
          </button>

          <template v-if="data.item.id_stato === 'IN_PREPARAZIONE'">
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
          </template>
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
import Toast from "@/components/Toast.vue";
import Icon from "@/components/Icon.vue";
import SearchBar from "@/components/SearchBar.vue";
import Filter from "@/components/Filter.vue";
import RequestFormModal from "@/components/RequestFormModal.vue";
import RequestDetailModal from "@/components/RequestDetailModal.vue";
import Loading from "@/components/LoadingSpinner.vue";
import { formatDate } from "@/utils/formatters";

const showModal = ref(false);
const showDetailModal = ref(false);
const selectedRequest = ref(null);
const loading = ref(true);
const isSaving = ref(false);
const error = ref(null);
const searchQuery = ref("");
const statusFilter = ref("ALL");
const sortOrder = ref("DESC");
const confirmAction = ref({ show: false, title: "", message: "", callback: null });
const richieste = ref([]);
const people = ref([]);
const entities = ref([]);
const categories = ref([]);
const requestTypes = ref([]);
const toast = ref({ show: false, message: "", type: "success" });

const createSort = (path, isDate = false) => {
  return (fa, fb, a, b) => {
    const getValue = (obj) =>
      path.split(".").reduce((acc, part) => acc?.[part], obj) || "";

    const valA = getValue(a);
    const valB = getValue(b);

    if (isDate) {
      return new Date(valA) - new Date(valB);
    }

    return String(valA).localeCompare(String(valB), undefined, { sensitivity: "base" });
  };
};

const columns = [
  { key: "data_richiesta", label: "Data", sortable: true },
  {
    key: "titolare",
    label: "Richiedente",
    sortable: true,
    sort: (fa, fb, a, b) => {
      const nameA = `${a.persona?.cognome} ${a.persona?.nome}`.toLowerCase();
      const nameB = `${b.persona?.cognome} ${b.persona?.nome}`.toLowerCase();
      return nameA.localeCompare(nameB);
    },
  },
  {
    key: "ente.descrizione",
    label: "Ente",
    sortable: true,
    sort: createSort("ente.descrizione"),
  },
  {
    key: "tipo.descrizione",
    label: "Tipo",
    sortable: true,
    sort: createSort("tipo.descrizione"),
  },
  {
    key: "id_stato",
    label: "Stato",
    sortable: true,
    sort: createSort("stato.descrizione"),
  },
  { key: "foto", label: "Allegati" },
  { key: "actions", label: "Azioni" },
];

const statusOptions = [
  { value: "IN_PREPARAZIONE", label: "In preparazione" },
  { value: "INVIATA", label: "Inviata" },
  { value: "RESPINTA", label: "Respinta" },
];

const filteredRichiesteRaw = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  let result = [...richieste.value];

  if (statusFilter.value !== "ALL") {
    result = result.filter((r) => r.id_stato === statusFilter.value);
  }

  if (query) {
    result = result.filter(
      (r) =>
        r.persona?.cognome?.toLowerCase().includes(query) ||
        r.persona?.nome?.toLowerCase().includes(query) ||
        r.persona?.codice_fiscale?.toLowerCase().includes(query)
    );
  }

  return result.sort((a, b) => {
    const dateA = new Date(a.data_richiesta);
    const dateB = new Date(b.data_richiesta);
    return sortOrder.value === "ASC" ? dateA - dateB : dateB - dateA;
  });
});

const loadData = async () => {
  try {
    loading.value = true;
    const [
      resRichieste,
      resPeople,
      resEntities,
      resCategories,
      resTypes,
    ] = await Promise.all([
      apiClient.get("/richieste"),
      apiClient.get("/persone"),
      apiClient.get("/enti"),
      apiClient.get("/categorie-patenti"),
      apiClient.get("/tipi-richieste"),
    ]);
    richieste.value = resRichieste;
    people.value = resPeople;
    entities.value = resEntities;
    categories.value = resCategories;
    requestTypes.value = resTypes;
  } catch (err) {
    error.value = "Errore nel caricamento dati.";
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  selectedRequest.value = null;
  showModal.value = true;
};

const handleSaved = async () => {
  await loadData();
  showToast(
    selectedRequest.value
      ? "Richiesta modificata con successo"
      : "Richiesta creata con successo"
  );
};

const printLicense = async (item) => {
  showDetailModal.value = false;
  let url = null;
  try {
    await apiClient.post(`/richieste/${item.id}`);

    showToast("Richiesta approvata. Generazione PDF...");

    await new Promise((resolve) => setTimeout(resolve, 500));

    const response = await apiClient.get(`/richieste/${item.id}/pdf`, {
      responseType: "blob",
    });

    const blob = new Blob([response], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const printWindow = window.open(url);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    } else {
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Patente_${item.cognome}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    await loadData();
  } catch (err) {
    if (url) window.URL.revokeObjectURL(url);
    console.error("Errore durante il proceso:", err);
    const msg =
      err.response?.data?.error || "Errore durante la generazione del documento";
    showToast(msg, "error");
  }
};

const confirmReject = (item) => {
  confirmAction.value = {
    show: true,
    title: "Conferma respinta",
    message: `Vuoi respingere la richiesta di <strong>${item.persona?.cognome} ${item.persona?.nome}</strong>?`,
    callback: () => executeReject(item.id),
  };
};

const executeReject = async (id) => {
  try {
    await apiClient.patch(`/richieste/${id}`, { id_stato: "RESPINTA" });
    showToast("Richiesta respinta");
    showDetailModal.value = false;
    confirmAction.value.show = false;
    await loadData();
  } catch (err) {
    showToast("Errore", "error");
  }
};

const confirmDelete = (item) => {
  confirmAction.value = {
    show: true,
    title: "Conferma eliminazione",
    message: `Sei sicuro di voler eliminare la richiesta di <strong>${item.persona?.cognome} ${item.persona?.nome}</strong>?`,
    callback: () => executeDelete(item.id),
  };
};

const executeDelete = async (id) => {
  try {
    isSaving.value = true;
    await apiClient.delete(`/richieste/${id}`);
    showToast("Richiesta eliminata");
    await loadData();
    confirmAction.value.show = false;
  } catch (err) {
    showToast("Errore nell'eliminazione", "error");
  } finally {
    isSaving.value = false;
  }
};

const openEditModal = (item) => {
  selectedRequest.value = item;
  showModal.value = true;
};

const viewDetails = (item) => {
  selectedRequest.value = item;
  showDetailModal.value = true;
};

const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 4000);
};

onMounted(loadData);
</script>

<style scoped>
fieldset {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
}
legend {
  font-weight: bold;
  color: #0067b1;
  padding: 0 10px;
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

.file-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
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

.option-add {
  background-color: #f0f7ff;
  color: #0067b1;
  font-weight: bold;
}

.images-container {
  display: flex;
  gap: 4px;
  justify-content: center;
}
.thumbnail {
  width: 30px;
  height: 38px;
  object-fit: cover;
  border: 1px solid #ddd;
  border-radius: 2px;
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
.badge.INVIATA {
  background: #d4edda;
  color: #155724;
}
.badge.RESPINTA {
  background: #f8d7da;
  color: #721c24;
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
.btn-icon.details {
  color: #646464;
}
.btn-icon.print {
  color: #0067b1;
}
.btn-icon.reject {
  color: #dc3545;
}
.btn-icon.edit {
  color: #0067b1;
}
.btn-icon.delete {
  color: #dc3545;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}
</style>
