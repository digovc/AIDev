<template>
  <div class="h-full">
    <DiffViewComponent v-if="selectedFile" :file="selectedFile"/>
    <DiffFilesComponent v-else :files="files" @select="handleFileSelect"/>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import DiffFilesComponent from './DiffFilesComponent.vue';
import DiffViewComponent from './DiffViewComponent.vue';
import { gitApi } from "@/api/git.api.js";

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
});

const files = ref([]);
const selectedFile = ref(null);

watch(() => props.task, async (newTask) => {
  try {
    const response = await gitApi.getFilesChanged(props.task.id);
    files.value = response.data;
  } catch (error) {
    console.error('Failed to fetch changed files:', error);
  }
}, { immediate: true });

const handleFileSelect = (file) => {
  selectedFile.value = file;
};
</script>
