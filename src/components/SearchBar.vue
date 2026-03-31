<template>
  <div class="search-box">
    <Icon name="search" size="18" class="search-icon" />
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      type="text"
      :placeholder="placeholder"
      class="search-input"
    />
  </div>
</template>

<script setup>
import Icon from "./Icon.vue";

defineProps({
  modelValue: String,
  placeholder: {
    type: String,
    default: "Cerca...",
  },
});

defineEmits(["update:modelValue"]);
</script>

<style scoped>
.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
  margin: 0 20px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
}

.search-input {
  width: 100%;
  padding: 10px 10px 10px 35px;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s;
  font-size: 0.9rem;
}

.search-input:focus {
  border-color: #0067b1;
  box-shadow: 0 0 5px rgba(0, 103, 177, 0.2);
}
</style>
