<template>
  <div class="h-full flex flex-col gap-2">
    <div class="flex justify-end items-center pb-2 pr-2">
      <FontAwesomeIcon :icon="faUpload" class="text-gray-400 hover:text-gray-200" @click="pushChanges" :disabled="isPushing"/>
    </div>
    <div class="grow">
      <DiffFilesComponent :files="files" @select="handleFileSelect"/>
      <DiffViewDialog v-if="selectedFile" ref="diffViewDialog" :file="selectedFile" :task="task"/>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue';
import DiffFilesComponent from './DiffFilesComponent.vue';
import DiffViewDialog from './DiffViewDialog.vue';
import { gitApi } from "@/api/git.api.js";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

const props = defineProps({
  task: { type: Object }
});

const files = ref([]);
const selectedFile = ref(null);
const isPushing = ref(false);
const diffViewDialog = ref(null);

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
  selectedFile.value = file;
  nextTick(() => {
    diffViewDialog.value.open();
  });
};

const pushChanges = async () => {
  const confirmed = confirm('Tem certeza que deseja enviar as alterações?');
  if (!confirmed) return;

  isPushing.value = true;
  try {
    await gitApi.pushChanges(props.task.id);
    files.value = []
    alert('Alterações enviadas com sucesso!');
  } catch (error) {
    console.error('Failed to push changes:', error);
    alert('Ocorreu um erro ao enviar as alterações. Por favor, tente novamente.');
  } finally {
    isPushing.value = false;
  }
};
</script>
