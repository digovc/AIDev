<template>
  <div class="border rounded-lg p-4 shadow">
    <div class="flex justify-between items-center">
      <div class="flex items-center space-x-2">
        <h3 class="font-semibold">Worker {{ worker.conversationId }}</h3>
        <FontAwesomeIcon :icon="faCog" class="text-gray-400 animate-spin" v-if="worker.status === 'running'"/>
      </div>
      <span class="text-sm" :class="statusClass">{{ worker.status }}</span>
    </div>
    <div class="mt-2">
      <span class="text-sm text-gray-500">Mensagens: {{ worker.messagesCount }}</span>
    </div>
    <div class="mt-2">
      <span class="text-sm text-gray-500">Prompt: {{ worker.prompt }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
const props = defineProps({
  worker: {
    type: Object,
    required: true
  }
});

const statusClass = computed(() => {
  switch (props.worker.status) {
    case 'started': return 'text-blue-500';
    case 'running': return 'text-green-500';
    case 'finished': return 'text-gray-400 line-through';
    default: return 'text-gray-500';
  }
});
</script>

<style scoped>
/* Styles for WorkerCard */
</style>
