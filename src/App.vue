<template>
  <NavBar />
  <main class="content">
    <router-view />
  </main>
</template>

<script setup>
import NavBar from './components/NavBar.vue';
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: Inter, system-ui, sans-serif;
}

.content {
  padding: 1rem;
}
</style>