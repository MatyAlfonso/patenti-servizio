<script setup >
import { ref } from 'vue';
// import MyPage from './pages/file.page.vue';
import Person from './models/Person.js'

let persons = ref([]);
let error = ref(null);

const test = async () => {
	try {
		error.value = null;
		let pp = await Person.read({filter: null});
		console.log( pp );
		persons.value = pp;
	}
	catch( err ) {
		error.value = err;
	}
};

</script>

<template>
	<div v-if="error"><hr>{{ error }}<hr></div>
	<button @click="test()">Test</button>
  <!-- <div>
    <a href="https://electron-vite.github.io" target="_blank">
      <img src="/electron-vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div> -->
  <!-- <HelloWorld msg="Vite + Vue" /> -->
   <div v-for="(p,ix) in persons" :key="p.cf">
		{{ix}} - {{  p.id }} {{ p.first_name }} {{ p.last_name }}
   </div>
   <!-- <MyPage /> -->
</template>

<style scoped>
/* .logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
} */
</style>
