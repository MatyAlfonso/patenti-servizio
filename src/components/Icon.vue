<template>
  <span class="material-icons" :style="{ fontSize: size + 'px', color: color }">
    {{ name }}
  </span>
</template>

<script setup>
defineProps({
  name: String,
  size: { type: [String, Number], default: 24 },
  color: { type: String, default: "currentColor" },
});
</script>

<style scoped>
.material-icons {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  user-select: none;
}
</style>
