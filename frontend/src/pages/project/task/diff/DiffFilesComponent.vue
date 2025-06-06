<template>
  <div class="h-full bg-gray-800 p-2 overflow-y-auto">
    <template v-if="files.length > 0">
      <template v-for="file in files" :key="file.path">
        <template v-if="!file.isRolledBack">
          <DiffFileComponent :file="file" @click="handleFileClick(file)" @rollback="handleRollback" @delete="handleDelete"/>
        </template>
      </template>
    </template>
    <template v-else>
      <div class="flex items-center justify-center h-full text-gray-400">
        Nenhuma alteração encontrada.
      </div>
    </template>
  </div>
</template>

<script setup>
import DiffFileComponent from './DiffFileComponent.vue';
import { useRoute } from 'vue-router';
import { gitApi } from "@/api/git.api.js";

const route = useRoute();

defineProps({
  files: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['select']);

const handleFileClick = (file) => {
  emit('select', file);
};

const handleRollback = async (file) => {
  await gitApi.rollback(route.params.taskId, file.path);
  file.isRolledBack = true;
};

const handleDelete = async (file) => {
  await gitApi.deleteFile(route.params.taskId, file.path);
  file.isRolledBack = true;
};
</script>
