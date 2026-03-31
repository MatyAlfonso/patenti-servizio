<template>
  <Modal
    v-if="modelValue"
    title="Richiesta patente di servizio"
    @close="$emit('update:modelValue', false)"
  >
    <form @submit.prevent="submitRequest" class="grid-form">
      <div class="flex">
        <h4>MODULO RICHIESTA RILASCIO PATENTE DI SERVIZIO --</h4>
        <label
          ><input type="radio" value="NUOVA" v-model="form.id_tipo" required />
          Nuova</label
        >
        <label
          ><input type="radio" value="RINNOVO" v-model="form.id_tipo" required />
          Rinnovo</label
        >
      </div>

      <div class="header-group">
        <div class="form-group">
          <div style="align-items: flex-end">
            <label>Foto formato 33x40 mm</label>
            <div class="foto">
              <input
                type="file"
                @change="(e) => handleFile(e, 'foto')"
                accept="image/*"
                class="fileInput"
                :required="!isEditing"
              />
              <img
                v-if="previews.foto"
                :src="previews.foto"
                style="width: 100%; height: 100%; object-fit: cover"
              />
            </div>
          </div>
          <div class="form-group">
            <label>Firma</label>
            <div class="firma">
              <input
                type="file"
                @change="(e) => handleFile(e, 'firma')"
                accept="image/*"
                class="fileInput"
                :required="!isEditing"
              />
              <img
                v-if="previews.firma"
                :src="previews.firma"
                style="max-height: 90%; max-width: 90%"
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Tipologia</label>
          <label
            ><input type="radio" value="PCR" v-model="form.id_ente" required /> Protezione
            Civile della Regione</label
          >
          <label
            ><input type="radio" value="CFR" v-model="form.id_ente" required /> Corpo
            Forestale Regionale</label
          >
        </div>
      </div>

      <fieldset>
        <legend>DATI PERSONALI</legend>
        <div class="form-group-row">
          <label>Cognome e nome</label>
          <select v-model="form.id_persona" @change="checkNewPerson" required>
            <option disabled value="">Seleziona...</option>
            <option value="NEW_PERSON" class="option-add">
              + Aggiungi nuova persona...
            </option>
            <option v-for="p in sortedPeople" :key="p.id" :value="p.id">
              {{ p.cognome }} {{ p.nome }}
            </option>
          </select>
        </div>

        <div>
          <div class="form-group-row">
            <label>Codice Fiscale</label>
            <input
              :value="selectedPerson?.codice_fiscale"
              type="text"
              readonly
              style="background: #f0f0f0"
            />
          </div>
          <div>
            <div class="form-group-row">
              <label>Data di nascita</label>
              <input
                :value="formatDate(selectedPerson?.data_nascita)"
                type="text"
                readonly
                style="background: #f0f0f0"
              />
            </div>
            <div class="form-group-row">
              <label>Luogo di nascita</label>
              <input
                :value="selectedPerson?.luogo_nascita"
                type="text"
                readonly
                style="background: #f0f0f0"
              />
            </div>
          </div>
        </div>

        <div class="form-group-row">
          <label>Residenza</label>
          <input v-model="form.residenza_persona" type="text" required />
        </div>
      </fieldset>

      <CreatePersonModal
        v-model="showPersonModal"
        @person-created="handlePersonCreated"
      />

      <fieldset>
        <legend>
          DATI PATENTE CIVILE POSSEDUTA
          <span v-if="isLicenseReadonly" class="autocomplete">
            (Recuperata automaticamente)
          </span>
        </legend>
        <div>
          <div class="form-group-row">
            <label>Numero della patente</label>
            <input v-model="form.patente_civile_numero" type="text" required />
          </div>
          <div class="form-group-row">
            <label>Categoria patente civile</label>
            <select v-model="form.patente_civile_categorie" required>
              <option disabled value="">Seleziona categoria...</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.id.replace("_", " ") }} - {{ cat.descrizione }}
              </option>
            </select>
          </div>
        </div>
        <div>
          <div class="form-group-row">
            <label>Rilasciata da</label>
            <input v-model="form.patente_civile_autorita" type="text" required />
          </div>
          <div class="form-group-row">
            <label>Data del rilascio</label>
            <input v-model="form.patente_civile_rilascio" type="date" required />
          </div>
          <div class="form-group-row">
            <label>Data di scadenza </label>
            <input v-model="form.patente_civile_scadenza" type="date" required />
          </div>
        </div>
      </fieldset>

      <div class="form-actions">
        <button
          type="button"
          @click="$emit('update:modelValue', false)"
          class="btn-cancel"
        >
          Annulla
        </button>
        <button type="submit" class="btn-save" :disabled="isSaving">Salva</button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { apiClient } from "@/services/api";
import { formatDate } from "@/utils/formatters";
import Modal from "@/components/Modal.vue";
import CreatePersonModal from "./CreatePersonModal.vue";

const props = defineProps({
  modelValue: Boolean,
  editData: Object,
  people: Array,
  categories: Array,
});

const emit = defineEmits(["update:modelValue", "saved", "refresh-people", "error"]);

const isSaving = ref(false);
const isEditing = computed(() => !!props.editData);
const files = { foto: null, firma: null };
const previews = ref({ foto: null, firma: null });
const showPersonModal = ref(false);
const isLicenseReadonly = ref(false);

const initialFormState = {
  id_persona: "",
  id_ente: "PCR",
  residenza_persona: "",
  patente_civile_numero: "",
  patente_civile_categorie: "",
  patente_civile_autorita: "",
  patente_civile_rilascio: "",
  patente_civile_scadenza: "",
  id_tipo: "NUOVA",
  id_stato: "IN_PREPARAZIONE",
};

const form = ref({ ...initialFormState });

const selectedPerson = computed(() => {
  return props.people.find((p) => p.id === form.value.id_persona) || null;
});

const sortedPeople = computed(() => {
  if (!props.people) return [];

  return [...props.people].sort((a, b) => {
    const nameA = `${a.cognome} ${a.nome}`.toLowerCase();
    const nameB = `${b.cognome} ${b.nome}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });
});

const checkNewPerson = (event) => {
  if (event.target.value === "NEW_PERSON") {
    showPersonModal.value = true;
    form.value.id_persona = "";
  }
};

const resetLicenseFields = () => {
  form.value.patente_civile_numero = "";
  form.value.patente_civile_categorie = "";
  form.value.patente_civile_autorita = "";
  form.value.patente_civile_rilascio = "";
  form.value.patente_civile_scadenza = "";
  isLicenseReadonly.value = false;
};

const handlePersonCreated = async (newPersonId) => {
  emit("refresh-people");
  form.value.id_persona = newPersonId;
  showPersonModal.value = false;
};

const submitRequest = async () => {
  try {
    isSaving.value = true;
    const formData = new FormData();

    Object.keys(form.value).forEach((key) => {
      if (form.value[key] !== null) formData.append(key, form.value[key]);
    });

    if (files.foto) formData.append("fototessera", files.foto);
    if (files.firma) formData.append("firma", files.firma);

    if (isEditing.value) {
      await apiClient.patch(`/richieste/${form.value.id}`, formData);
    } else {
      await apiClient.post("/richieste", formData);
    }

    emit("saved");
    emit("update:modelValue", false);
  } catch (err) {
    const errorMessage =
      err.response?.data?.error || err.message || "Errore durante il salvataggio";
    emit("error", errorMessage);
  } finally {
    isSaving.value = false;
  }
};

const handleFile = (e, type) => {
  const file = e.target.files[0];
  if (file) {
    files[type] = file;
    previews.value[type] = URL.createObjectURL(file);
  }
};

const resetForm = () => {
  form.value = { ...initialFormState };
  previews.value = { foto: null, firma: null };
  files.foto = null;
  files.firma = null;
};

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && !props.editData) {
      resetForm();
    }
  }
);

watch(
  () => props.editData,
  (r) => {
    if (r) {
      form.value = {
        ...initialFormState,
        id: r.id,
        id_persona: r.id_persona,
        id_ente: r.id_ente,
        id_tipo: r.id_tipo,
        residenza_persona: r.residenza_persona,
        patente_civile_numero:
          r.persona?.patente_civile?.find((p) => p.id_stato === "ATTIVA")?.numero || "",
        patente_civile_categorie:
          r.persona?.patente_civile?.find((p) => p.id_stato === "ATTIVA")?.id_categoria ||
          "",
        patente_civile_autorita:
          r.persona?.patente_civile?.find((p) => p.id_stato === "ATTIVA")?.autorita || "",
        patente_civile_rilascio:
          r.persona?.patente_civile?.find((p) => p.id_stato === "ATTIVA")
            ?.data_rilascio || "",
        patente_civile_scadenza:
          r.persona?.patente_civile?.find((p) => p.id_stato === "ATTIVA")
            ?.data_scadenza || "",
      };

      previews.value.foto = r.fototessera?.path ? `api/${r.fototessera.path}` : null;
      previews.value.firma = r.firma_scansionata?.path
        ? `api/${r.firma_scansionata.path}`
        : null;
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

watch(selectedPerson, (newPerson) => {
  if (isEditing.value && props.editData?.id_persona === newPerson?.id) return;

  if (newPerson) {
    const activeLicense = newPerson.patente_civile?.find((p) => p.id_stato === "ATTIVA");

    if (activeLicense) {
      form.value.patente_civile_numero = activeLicense.numero;
      form.value.patente_civile_categorie = activeLicense.id_categoria;
      form.value.patente_civile_autorita = activeLicense.autorita;

      form.value.patente_civile_rilascio = activeLicense.data_rilascio
        ? activeLicense.data_rilascio.substring(0, 10)
        : "";
      form.value.patente_civile_scadenza = activeLicense.data_scadenza
        ? activeLicense.data_scadenza.substring(0, 10)
        : "";

      isLicenseReadonly.value = true;
    } else {
      resetLicenseFields();
    }
  } else {
    resetLicenseFields();
  }
});
</script>

<style scoped>
.grid-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.flex {
  display: flex;
  align-items: center;
}

.header-group {
  display: flex;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.form-group-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 5px;
  font-weight: bold;
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 10px;
  align-items: center;
}
.form-group-row input,
.form-group-row select {
  flex: 1;
  min-width: 0;
}
.form-group-row label {
  white-space: nowrap;
  margin-right: 15px;
  display: flex;
  align-items: center;
}
.form-group label {
  font-weight: bold;
  font-size: 0.9rem;
  color: #555;
}
.form-group input,
.form-group select,
.form-group textarea {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
}

.fileInput {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.foto {
  width: 132px;
  height: 160px;
  border: 1px solid black;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  background: #f9f9f9;
}

.firma {
  width: 300px;
  height: 100px;
  border: 1px solid black;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.option-add {
  background-color: #f0f7ff;
  color: #0067b1;
  font-weight: bold;
  &:hover {
    background-color: #e0efff;
  }
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

.autocomplete {
  font-size: 0.7rem;
  color: #28a745;
  margin-left: 10px;
}
</style>
