<template>
  <div class="h-full flex flex-col gap-2">
    <div class="flex justify-end items-center pb-2 pr-2">
      <FontAwesomeIcon :icon="faUpload" class="text-gray-400 hover:text-gray-200" @click="pushChanges"/>
    </div>
    <div class="grow">
      <DiffFilesComponent v-if="!selectedFile" :files="files" @select="handleFileSelect"/>
      <DiffViewComponent v-else :file="selectedFile" :task="task" @close="selectedFile = null" @line-click="console.log($event)"/>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import DiffFilesComponent from './DiffFilesComponent.vue';
import DiffViewComponent from './DiffViewComponent.vue';
import { gitApi } from "@/api/git.api.js";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

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

const pushChanges = async () => {
  try {
    await gitApi.pushChanges(props.task.id);
  } catch (error) {
    console.error('Failed to push changes:', error);
    alert('Ocorreu um erro ao enviar as alterações. Por favor, tente novamente.');
  }
};
</script>
