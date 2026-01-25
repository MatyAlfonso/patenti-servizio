<template>
	<NewtabLinkIcon url="https://cssloaders.github.io/" ><template #before>https://cssloaders.github.io/</template></NewtabLinkIcon>
	<div class="group">
		Color1: <input type="color" v-model="color1">
		Color2: <input type="color" v-model="color2">
		Speed: <input type="number" v-model="speed">
	</div>
	<div class="group">
		<div class="item" v-for="type in spinner_types">
			<Cover>
				<Spinner :type="type" :color="color1" :color2="color2" :speed="speed + 's'"></Spinner>
			</Cover>
			<label>{{ type }}</label>
		</div>

		<div class="item large">
			<Cover>
				<ProgressText stroke="black" :fill="color2" :back="color1" size="2rem" text="Caricamento..." :speed="speed + 's'"></ProgressText>
			</Cover>
			<label>progress-text</label>
		</div>

		<div class="item">
			<Cover>
				<Pulse size="3rem" :speed="speed + 's'" type="bounce" :color="color1" :color2="color2"></Pulse>
			</Cover>
			<label>bounce</label>
		</div>

		<div class="item">
			<Cover>
				<Pulse size="3rem" type="circles" :speed="speed + 's'" :color="color1" :color2="color2"></Pulse>
			</Cover>
			<label>circles</label>
		</div>

	</div>
</template>

<script setup>
import { ref } from 'vue';
import Cover from '@stim/pcfrvg-lib/lib/cover.vue';
import NewtabLinkIcon from '@stim/pcfrvg-lib/lib/newtab-link-icon.vue';

import Spinner from '@stim/pcfrvg-lib/lib/wait-indicators/spinner.vue'
import ProgressText from '@stim/pcfrvg-lib/lib/wait-indicators/progress-text.vue';
import Pulse from '@stim/pcfrvg-lib/lib/wait-indicators/pulse.vue';

let color1 = ref('#1e65aa');
let color2 = ref('#eb7029');
let speed = ref(1);

const spinner_types = [
	'spinner',
	'dog',
	'tape',
	'double-spinner',
	'double-comet',
]

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