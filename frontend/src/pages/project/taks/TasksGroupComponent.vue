<template>
  <div class="bg-gray-800 p-4 rounded-lg mb-4">
    <div @click="toggleExpanded" class="flex justify-between items-center cursor-pointer">
      <h3 class="text-xl font-semibold text-white flex items-center">
        {{ title }} <span class="ml-2 text-gray-400 text-sm">({{ tasks.length }})</span>
      </h3>
      <i :class="expanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="text-gray-400 hover:text-gray-200"></i>
    </div>

    <div v-if="expanded" class="mt-3">
      <!-- Área de ações do grupo -->
      <div v-if="tasks.length > 0 && showGroupActions" class="mb-3 flex justify-end">
        <button 
          v-if="title === 'Concluído'" 
          @click="$emit('archive-all')" 
          class="text-gray-400 hover:text-gray-200 flex items-center">
          <FontAwesomeIcon :icon="faArchive" class="h-6 w-6 mr-1" /> Arquivar todas
        </button>
      </div>
      
      <div v-if="tasks.length === 0" class="text-gray-400 italic">
        Nenhuma tarefa {{ emptyMessage }}
      </div>
      <TaskComponent v-for="task in tasks" :key="task.id" :task="task" @play="$emit('play', $event)" @play-now="$emit('play-now', $event)" @stop="$emit('stop', $event)" @edit="$emit('edit', $event)" @archive="$emit('archive', $event)" @done="$emit('done', $event)"/>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TaskComponent from './TaskComponent.vue';
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faArchive } from "@fortawesome/free-solid-svg-icons";

const expanded = ref(true);

const toggleExpanded = () => {
  expanded.value = !expanded.value;
};

defineProps({
  title: {
    type: String,
    required: true
  },
  tasks: {
    type: Array,
    default: () => []
  },
  emptyMessage: {
    type: String,
    default: ''
  },
  showGroupActions: {
    type: Boolean,
    default: true
  }
});

defineEmits(['play', 'play-now', 'stop', 'edit', 'archive', 'done', 'archive-all']);
</script>
