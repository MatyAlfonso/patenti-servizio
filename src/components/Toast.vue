<template>
  <Transition name="toast">
    <div v-if="show" :class="['toast-container', type]">
      <div class="toast-content">
        <Icon
          :name="type === 'success' ? 'check_circle' : 'error'"
          size="24"
          class="toast-icon"
        />
        <p>{{ message }}</p>
      </div>

      <button class="close-btn" @click="$emit('close')">
        <Icon name="close" size="20" />
      </button>
    </div>
  </Transition>
</template>

<script setup>
import Icon from "@/components/Icon.vue";

defineProps({
  show: Boolean,
  message: String,
  type: { type: String, default: "success" },
});

defineEmits(["close"]);
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 300px;
  padding: 16px;
  border-radius: 8px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 9999;
}
.success {
  background-color: #4caf50;
}
.error {
  background-color: #f44336;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
}
.icon {
  font-size: 1.2rem;
}
.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
}
.close-btn:hover {
  opacity: 1;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s ease;
}
.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
