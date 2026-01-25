<template>
	<div class="dlg-body">
		<iframe v-if="pdfUrl" :src="pdfUrl" width="100%" height="500px" frameborder="0"></iframe>
	</div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
	pdfUrl: { type: String, required: true }
});

const pdfUrl = ref(props.pdfUrl);

watch(() => props.pdfUrl, (newPdfUrl) => {
	pdfUrl.value = newPdfUrl;
});
</script>

<style lang="scss" scoped>
.dlg-body {
	margin-top: 1.5rem;
	display: flex;
	flex-direction: column;
}
</style>
