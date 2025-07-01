<template>
  <div class="pt-4 h-full">
    <ul v-if="todoItems.length" class="space-y-2">
      <li v-for="(item, index) in todoItems" :key="index" class="p-2 bg-gray-800 rounded">
        <div class="md:flex gap-4 items-center justify-between space-y-4 md:space-y-0">
          <div class="">
            {{ item.content }}
          </div>
          <div :class="statusClass(item.status)" class="text-right">
            {{ statusLabel(item.status) }}
          </div>
        </div>
      </li>
    </ul>
    <div v-else class="text-center text-gray-400 h-full flex justify-center items-center italic text-sm">
      Nenhum plano definido
    </div>
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
      return 'Em progresso';
    case 'completed':
      return 'Concluído';
    default:
      return 'Desconhecido';
  }
};
</script>
