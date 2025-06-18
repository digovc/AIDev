<template>
  <div class="p-4">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <WorkerCard v-for="worker in workers" :key="worker.conversationId" :worker="worker"/>
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
