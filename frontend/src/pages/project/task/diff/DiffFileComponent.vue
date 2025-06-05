<template>
  <div class="group bg-gray-800 rounded-lg p-2 flex justify-between items-center mb-2 cursor-pointer hover:bg-gray-700" @click="$emit('click')">
    <div class="text-xs text-gray-300">
      {{ file.path }}
    </div>
    <div class="text-xs font-mono" :class="statusClass">
      {{ statusText }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  file: {
    type: Object,
    required: true
  }
});

const statusClass = computed(() => {
  switch (props.file.status) {
    case 'M':
      return 'text-yellow-500';
    case 'AM':
      return 'text-green-500';
    default:
      return 'text-gray-400';
  }
});

const statusText = computed(() => {
  switch (props.file.status) {
    case 'M':
      return 'Modificado';
    case 'AM':
      return 'Adicionado';
    default:
      return 'Não modificado';
  }
});
</script>
