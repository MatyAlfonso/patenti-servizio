<template>
	<div class="input-group">
		<input type="file" :name="name" class="form-control" ref="inputControl"
			@change="filesSelected($event)"
			:class="mandatory ? valid ? 'is-valid' : 'is-invalid' : ''"
			:multiple="multiple"
		/>
		<div class="input-group-append">
			<button @click.prevent="resetFileUrls" class="btn btn-secondary" title="reset">X</button>
		</div>
	</div>				
	<slot name="preview" :urls="fileUrls" >
		<div v-for="url in fileUrls">
			{{  url }}
		</div>
	</slot>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps({
	name: { type: String, default: 'uploadedFile'},
	multiple: { type: Boolean, default: false },
	preview: { type: Boolean, default: false },
	mandatory: { type: Boolean, default: false},
	valid: { type: Boolean, default: false },
});

const emit = defineEmits(['change']);

const files = defineModel('files');
const value = defineModel('value');

let inputControl = ref(null);
let fileUrls = ref([]);

function filesSelected(ev) {
	if(props.preview) {
		let urls = fileUrls.value;
		for(let i=0; i<urls.length; i++) {
			URL.revokeObjectURL(urls[i]);
		}
		urls = [];
		for(let i=0; i<ev.target.files.length; i++) {
			urls.push( URL.createObjectURL(ev.target.files[i]) );
		}
		fileUrls.value = urls;
	}

	const el = inputControl.value;
	files.value = el?.files ?? [];
	value.value = el?.value ?? '';
	emit('change', ev);
}

function resetFileUrls() {
	const el = inputControl.value;
	if(!el) return;

	const urls = fileUrls.value;
	fileUrls.value = [];
	el.value = null;

	for(let i=0; i<urls.length; i++) {
		URL.revokeObjectURL(urls[i]);
	}

	files.value = el.files;
	value.value = el.value;
}


onUnmounted( () => {
	resetFileUrls();
});
</script>