<template>
  <div class="p-4">
    <h3 class="text-lg font-bold mb-4">Planejamento</h3>
    <ul class="space-y-2">
      <li v-for="(item, index) in todoItems" :key="index" class="flex items-center justify-between p-2 bg-gray-800 rounded">
        <span>{{ item.content }}</span>
        <span :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  task: {
    type: Object
  }
});

const todoItems = computed(() => {
  return props.task?.todo ?? [];
});

const statusClass = (status) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-500';
    case 'in_progress':
      return 'text-blue-500';
    case 'completed':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
};

const statusLabel = (status) => {
  switch (status) {
    case 'pending':
      return 'Pendente';
    case 'in_progress':
      return 'Em Progresso';
    case 'completed':
      return 'Concluído';
    default:
      return 'Desconhecido';
  }
};
</script>
