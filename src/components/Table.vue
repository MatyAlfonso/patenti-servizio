<template>
  <div class="table-container">
    <table class="generic-table" :class="{ 'tbl-striped': striped }">
      <thead class="table-light">
        <tr>
          <th v-for="field in fields" :key="field.key" :class="[field.hclass, 'sticky']">
            <div
              v-if="field.key == sel_key"
              class="field-cell"
              :class="field.class || ''"
            >
              <div class="col-label">
                <input
                  type="checkbox"
                  @change="toggleAllSelected($event)"
                  ref="selectAllcheckbox"
                />
                <div v-if="nselected > 0" class="badge bg-primary ms-2">
                  {{ nselected }}
                </div>
              </div>
            </div>
            <div
              v-else
              class="field-cell"
              @click="handle_sort(field.key)"
              :class="[{ 'col-sortable': field.sortable == true }, field.class || '']"
            >
              <div class="col-label">
                <slot :name="`header[${field.key}]`" :field="field">
                  {{ field.label }}
                </slot>
              </div>
              <div class="sort-icon" v-if="field.sortable == true">
                <Icon :name="sort_path(field.key)"></Icon>
              </div>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(item, ix) in sorted_items" :key="item.id">
          <tr :class="{ even: (ix & 1) == 0 }">
            <td
              v-for="field in fields"
              :key="field.key"
              :style="{ 'text-align': field.align || 'center' }"
              :data-label="field.label == null ? field.key : field.label"
            >
              <input
                v-if="field.key == sel_key"
                type="checkbox"
                :checked="selection[item.id] != null"
                @change="addSelection(item.id, $event)"
              />
              <slot v-else-if="field.key == expand_key">
                <div
                  class="det-col"
                  :class="{ expanded: expanded_items[item.id] }"
                  @click="
                    $emit('detailsToggled', { item, expanded: toggleDetails(item.id) })
                  "
                >
                  <Icon name="chevron_right"></Icon>
                </div>
              </slot>

              <slot
                v-else
                :name="`cell[${field.key}]`"
                :data="{
                  item,
                  value: item[field.key],
                  key: field.key,
                  toggleDetails: () => toggleDetails(item.id),
                  details: expanded_items[item.id],
                }"
              >
                {{ field.formatter ? field.formatter(item[field.key]) : item[field.key] }}
              </slot>
            </td>
          </tr>
          <tr v-if="expanded_items[item.id] == true" :class="{ even: (ix & 1) == 0 }">
            <td :colspan="fields.length" data-label="">
              <slot
                name="details"
                :data="{ item, toggleDetails: () => toggleDetails(item.id) }"
              >
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
//import { mdiChevronRight, mdiMenuDown, mdiMenuUp } from "@mdi/js";
import { ref, computed } from "vue";
//import Icon from "./svg-icon.vue";
import Icon from "@/components/Icon.vue";

const props = defineProps({
  fields: { type: Array, required: true },
  items: { type: Array, default: () => [] },
  order: { type: Object, default: null },
  striped: { type: Boolean, default: true },
  sel_key: { type: String, default: "#sel" },
  expand_key: { type: String, default: "#expand" },
});

const emit = defineEmits(["sort", "detailsToggled", "selectionChange"]);

let expanded_items = ref({});
let sorted_fields = ref(props.order || {});

const sorted_items = computed(() => {
  // todo: sorting on multiple fields
  let _items = props.items;
  if (_items.length > 0 && _items[0].id == null) {
    // if there is no id field, force it to unique value
    _items = _items.map((x, index) => ({ id: index, ...x }));
  }
  let sort_field_key = Object.keys(sorted_fields.value)[0];
  if (!sort_field_key) return _items;

  let field = props.fields.filter((f) => f.key == sort_field_key)[0] || {};
  if (field.sortable != true) return _items;

  let sort_dir = sorted_fields.value[sort_field_key];
  let fx = sort_dir == "ASC" ? 1 : -1;
  const def_fn = (a, b) => (a > b ? 1 : a < b ? -1 : 0);
  const fn = field.sort || def_fn;
  if (fn == "api") return _items;

  let result = _items.concat([]); // sort is in place: duplicate the array
  result.sort((a, b) => {
    let fa = a[sort_field_key];
    let fb = b[sort_field_key];

    return fx * fn(fa, fb, a, b);
  });

  return result;
});

function handle_sort(field_key) {
  // todo: sorting on multiple fields
  // single field:
  let f = sorted_fields.value[field_key];
  let new_obj = {};
  if (f == null) {
    // not sorted: add to sort list
    new_obj[field_key] = "ASC";
  } else if (f == "ASC") {
    new_obj[field_key] = "DESC";
  }
  sorted_fields.value = new_obj;

  let field = props.fields.filter((f) => f.key == field_key)[0] || {};
  if (field.sort == "api") emit("sort", new_obj);

  /* multiple fields
	let f = sorted_fields.value[field_key];
	if( f == null ) {
		// not sorted: add to sort list
		sorted_fields.value[field_key] = 'ASC';
	}
	else if( f == 'ASC' ) {
		sorted_fields.value[field_key] = 'DESC';
	}
	else if( f == 'DESC' ) {
		delete sorted_fields.value[field_key];
	}
	*/
}

function sort_path(field_key) {
  let f = sorted_fields.value[field_key];
  if (f == "ASC") return "expand_less";
  else if (f == "DESC") return "expand_more";
  else return "";
}

function toggleDetails(id) {
  // console.log('toggleDetails(%s)',id);
  let x = expanded_items.value[id];
  if (!x) {
    // expand
    expanded_items.value[id] = true;
    return true;
  }

  // collapse
  expanded_items.value[id] = false;
  return false;
}

let selection = ref({});
let nselected = computed(() => Object.keys(selection.value).length);

// refs
let selectAllcheckbox = ref(null); // ref in v-for loop contains an array !

const addSelection = (id, ev) => {
  const checked = ev.target.checked;
  if (checked) {
    selection.value[id] = true;
    let sel_count = Object.keys(selection.value).length;
    if (sel_count == sorted_items.value.length) {
      // All selected
      selectAllcheckbox.value[0].indeterminate = false;
      selectAllcheckbox.value[0].checked = true;
    } else {
      selectAllcheckbox.value[0].checked = false;
      selectAllcheckbox.value[0].indeterminate = true;
    }
  } else {
    delete selection.value[id];
    let sel_count = Object.keys(selection.value).length;
    selectAllcheckbox.value[0].checked = false;
    selectAllcheckbox.value[0].indeterminate = sel_count > 0;
  }
  emit("selectionChange", selection.value);
};

const toggleAllSelected = (ev) => {
  const checked = ev.target.checked;
  if (checked) {
    sorted_items.value.forEach((i) => {
      selection.value[i.id] = true;
    });
  } else selection.value = {};

  emit("selectionChange", selection.value);
};

defineExpose({
  selected_count: nselected,
  selected: () =>
    nselected.value
      ? Object.keys(selection.value).map((id) =>
          sorted_items.value.find((i) => i.id == id)
        )
      : [],
});
</script>

<style scoped lang="scss">
.table-container {
  width: 100%;
  overflow-x: auto;
}

.generic-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.generic-table th,
.generic-table td {
  border: 1px solid #ddd;
  padding: 12px 8px;
  text-align: center;
}

.generic-table th {
  background-color: #f4f4f4;
  font-weight: bold;
  color: #333;
}

.sort-icon {
  color: var(--bs-success);
}

table {
  caption-side: bottom;
  border-collapse: collapse;

  --light-border-color: #dee2e6;
  --light-cell-border-color: var(--light-border-color);
  --tbl-th-cell-border-color: #bfbfbf;

  --tbl-header-bk-color: #e2e2e2;

  --tbl-even-stripe-color: #0b0c0c;
  --tbl-even-bk-color: #f8f9fa; // #a8b0b9;
  --tbl-even-hover-bk-color: rgb(242, 242, 153); // rgb(234, 234, 210); // #a8b0b9;

  --tbl-hover-bk-color: rgb(255, 255, 182);
  --tbl-hover-border-color: black;

  width: 100%;
  border: 1px solid var(--light-border-color);

  .valigned {
    vertical-align: middle;
  }

  .field-cell {
    display: flex;
    flex-direction: row;
    justify-content: center;

    &.col-sortable {
      cursor: pointer;
    }
  }

  tr th {
    &.sticky {
      position: sticky;
      top: 0;
    }
  }

  th {
    background-color: var(--tbl-header-bk-color);
    border: 1px solid var(--tbl-th-cell-border-color);
  }

  tr td {
    border: 1px solid var(--light-cell-border-color);
    // box-shadow: inset 0 0 0 9999px var(--tbl-hover-bk-color);
  }

  tr:hover {
    td {
      // background-color: var(--tbl-hover-bk-color);
      box-shadow: inset 0 0 0 9999px var(--tbl-hover-bk-color);
    }
  }

  &.tbl-striped {
    tr.even {
      td {
        box-shadow: inset 0 0 0 9999px var(--tbl-even-bk-color);
      }

      &:hover td {
        box-shadow: inset 0 0 0 9999px var(--tbl-even-hover-bk-color);
      }
    }
  }

  .det-col {
    width: 1rem;
    cursor: pointer;
    transition: transform 150ms;
    &.expanded {
      transform: rotate(90deg);
    }
  }
}

@media (max-width: 650px) {
  th {
    display: none;
  }

  td {
    display: grid;
    grid-template-columns: 15ch auto;
    text-align: left !important;
    // align-items: start;

    &::before {
      content: attr(data-label) ":";
      font-weight: bold;
      text-align: left;
    }
    &[data-label=""]::before {
      content: "";
    }
  }
}
</style>
