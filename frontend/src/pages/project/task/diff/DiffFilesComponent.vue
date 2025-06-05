<template>
  <div class="h-full bg-gray-800 p-4 overflow-y-auto">
    <DiffFileComponent v-for="file in files" :key="file.path" :file="file" @click="handleFileClick(file)"/>
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
