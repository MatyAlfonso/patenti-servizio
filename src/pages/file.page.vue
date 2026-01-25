<script setup>
import { ref, computed } from 'vue';
// import PdfViewer from '@stim/pcfrvg-lib/lib/pdf_viewer.vue';
import FileInput from '../components/FileInput.vue';
import PdfViewer from '../components/PdfViewer.vue';

const dlg = ref(null);

const openpreview = () => dlg.open();

let pdfFiles = ref([]);
const validPdf = computed( () => pdfFiles.value.length > 0 );
</script>

<template>
	<FileInput name="uploadedFile" 
		:preview="true"
		:mandatory="true"
		v-model:files="pdfFiles"
		:valid="validPdf"
	>
		<template #preview="{urls}">
			<PdfViewer :pdfUrl="urls[0] ?? ''" />
		</template>
	</FileInput>
	<!-- {{ pdfFiles[0].name }} -->
</template>

