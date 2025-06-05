<template>
  <div class="h-full">
    <DiffFilesComponent v-if="!selectedFile" :files="files" @select="handleFileSelect"/>
    <DiffViewComponent v-else :file="selectedFile" :task="task" @close="selectedFile = null"/>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import DiffFilesComponent from './DiffFilesComponent.vue';
import DiffViewComponent from './DiffViewComponent.vue';
import { gitApi } from "@/api/git.api.js";

const props = defineProps({
  task: { type: Object }
});

const files = ref([]);
const selectedFile = ref(null);

watch(() => props.task, async (newTask) => {
  if (!newTask) return;

  try {
    const response = await gitApi.getFilesChanged(props.task.id);
    files.value = response.data;
  } catch (error) {
    console.error('Failed to fetch changed files:', error);
  }
}, { immediate: true });

const handleFileSelect = (file) => {
  selectedFile.value = file
};
</script>
