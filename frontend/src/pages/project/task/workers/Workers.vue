<template>
  <div class="p-4 h-full">
    <div v-if="workers.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <WorkerCard v-for="worker in workers" :key="worker.conversationId" :worker="worker"/>
    </div>
    <div v-else class="text-center text-gray-400 h-full flex justify-center items-center italic text-sm">
      Nenhum worker em execução
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import WorkerCard from './WorkerCard.vue';

const props = defineProps({
  task: {
    type: Object
  }
});

const workers = computed(() => {
  return props.task?.workers ?? [];
});
</script>
