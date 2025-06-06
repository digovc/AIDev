<template>
  <div class="h-full bg-gray-800 p-2 overflow-y-auto">
    <template v-if="files.length > 0">
      <DiffFileComponent v-for="file in files" :key="file.path" :file="file" @click="handleFileClick(file)" @rollback="handleRollback"/>
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

const emit = defineEmits(['select', 'rollback']);

const handleFileClick = (file) => {
  emit('select', file);
};

const handleRollback = async (file) => {
  await gitApi.rollback(route.params.id, file.path);
  emit('rollback');
};
</script>
