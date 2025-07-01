<template>
  <div class="border rounded-lg p-4 shadow bg-gray-800">
    <div class="flex justify-between items-center mb-2">
      <div class="flex items-center space-x-2">
        <h3 class="font-semibold text-blue-400">Worker {{ worker.conversationId }}</h3>
        <FontAwesomeIcon :icon="faCog" class="text-gray-400 animate-spin" v-if="worker.status === 'running'"/>
      </div>
      <span class="text-sm" :class="statusClass">{{ worker.status }}</span>
    </div>
    <div class="mb-2">
      <span class="text-sm text-gray-500">Mensagens: {{ worker.messagesCount }}</span>
    </div>
    <div class="bg-[#0d1117] p-2 rounded mb-2">
      <div class="font-semibold text-yellow-500 mb-1">Prompt</div>
      <VMarkdownView :content="worker.prompt" mode="dark" class="text-xs text-gray-400"></VMarkdownView>
    </div>
    <div class="bg-[#0d1117] p-2 rounded" v-if="worker.report">
      <div class="font-semibold text-green-500 mb-1">Report</div>
      <VMarkdownView :content="worker.report" mode="dark" class="text-xs text-gray-400"></VMarkdownView>
    </div>
    <div class="mt-2" v-if="worker.error">
      <span class="text-sm text-red-500">Error: {{ worker.error ? 'Yes' : 'No' }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import 'vue3-markdown/dist/style.css';
import { VMarkdownView } from 'vue3-markdown';

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
.tool-use-container {
  border-left: 3px solid #f59e0b;
  padding-left: 0.5rem;
}
.tool-input {
  border-left: 3px solid #3b82f6;
}
</style>
