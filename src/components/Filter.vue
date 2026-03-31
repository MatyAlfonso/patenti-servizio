<template>
  <div class="filter-group">
    <select
      :value="statusFilter"
      @change="$emit('update:statusFilter', $event.target.value)"
      class="filter-select"
    >
      <option value="ALL">Tutti gli stati</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>

    <!-- <select
      :value="sortOrder"
      @change="$emit('update:sortOrder', $event.target.value)"
      class="filter-select"
    >
      <option value="DESC">Più recenti</option>
      <option value="ASC">Più antichi</option>
    </select> -->
  </div>
</template>

<script setup>
defineProps({
  statusFilter: String,
  sortOrder: String,
  options: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["update:statusFilter", "update:sortOrder"]);
</script>

<style scoped>
.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 1rem;
}

.filter-group label {
  font-weight: bold;
  font-size: 0.9rem;
  color: #666;
}

.filter-select {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background: white;
  outline: none;

  &:focus {
    border-color: #0067b1;
  }
}
</style>
