<template>
	<TheTable :items="items" :fields="fields" @selectionChange="onSelChange">
		<template #details="{data}" >
			<img :src="data.item.image" >
		</template>
	</TheTable>

	<div>Righe selezionate: {{  selectedItems }}</div>
</template>

<script setup>
import { ref } from 'vue';
import TheTable from '@stim/pcfrvg-lib/lib/table.vue';


const fields = [
	{ key: '#sel'},
	{ key: '#expand'},
	{ key: 'idx', label: 'id', sortable: true},
	{ key: 'name', label: 'Nome', sortable: true }
];

let items = [
	{ idx: 1, name: 'Pippo', image: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/50/Goofy_Duckipedia.png/250px-Goofy_Duckipedia.png' },	
	{ idx: 2, name: 'Pluto', image: 'https://upload.wikimedia.org/wikipedia/en/b/b2/Pluto_%28Disney%29_transparent.png' },	
	{ idx: 3, name: 'Paperino', image: 'https://upload.wikimedia.org/wikipedia/en/a/a5/Donald_Duck_angry_transparent_background.png' },	
	{ idx: 4, name: 'Topolino', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Mickey-Mouse.png' },	
	{ idx: 5, name: 'Minnie', image: 'https://upload.wikimedia.org/wikipedia/en/0/0f/Minnie_Mouse_Duckipedia.png' },	
];


let selectedItems = ref(0);

const onSelChange = (v) => {
	selectedItems.value = Object.keys(v).length;
}

</script>

<style lang="scss" scoped>
.group {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;

	gap: 1rem;

	.item {
		position: relative;
		text-align: center;
		width: 5rem;
		height: 5rem;

		&.large {
			width: 20rem;
		}
	}
}
</style>