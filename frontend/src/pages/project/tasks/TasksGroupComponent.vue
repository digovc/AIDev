<template>
  <div class="bg-gray-800 p-4 rounded-lg mb-4">
    <div @click="toggleExpanded" class="flex justify-between items-center cursor-pointer">
      <h3 class="text-gl font-semibold text-white flex items-center">
        {{ title }} <span class="ml-2 text-gray-400 text-sm">({{ tasks.length }})</span>
      </h3>
      <FontAwesomeIcon :icon="expanded ? faChevronUp : faChevronDown" class="text-gray-400 hover:text-gray-200"/>
    </div>

    <div v-if="expanded" class="mt-3">
      <!-- Área de ações do grupo -->
      <div v-if="tasks.length > 0 && showGroupActions" class="mb-3 flex justify-end">
        <button v-if="title === 'Concluído'" @click="$emit('archive-all')" class="text-gray-400 hover:text-gray-200 flex items-center">
          <FontAwesomeIcon :icon="faArchive" class="h-6 w-6 mr-1"/>
          Arquivar todas
        </button>
      </div>

      <div v-if="tasks.length === 0" class="text-sm text-gray-400 italic">
        Nenhuma tarefa {{ emptyMessage }}
      </div>
      <TaskItemComponent v-for="task in tasks" :key="task.id" :task="task" @play="$emit('play', $event)" @play-now="$emit('play-now', $event)" @stop="$emit('stop', $event)" @edit="$emit('edit', $event)" @archive="$emit('archive', $event)" @done="$emit('done', $event)"/>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faArchive, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import TaskItemComponent from "@/pages/project/tasks/TaskItemComponent.vue";

const props = defineProps({
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

const expanded = ref(props.title !== 'Concluído');

const toggleExpanded = () => {
  expanded.value = !expanded.value;
};

defineEmits(['play', 'play-now', 'stop', 'edit', 'archive', 'done', 'archive-all']);
</script>
