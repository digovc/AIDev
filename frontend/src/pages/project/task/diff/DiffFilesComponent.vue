<template>
  <div class="h-full bg-gray-800 p-2 overflow-y-auto">
    <template v-if="files.length > 0">
      <DiffFileComponent v-for="file in files" :key="file.path" :file="file" @click="handleFileClick(file)"/>
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
</script>
