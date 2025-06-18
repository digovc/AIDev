<template>
  <div class="flex flex-col md:flex-row items-start md:items-center bg-gray-700 p-2 rounded mb-2 hover:bg-gray-600 gap-1 transition-colors" @click="$emit('edit', task)" tabindex="0" @keydown.enter="$emit('edit', task)" @keydown.space="$emit('edit', task)">
    <div class="bg-gray-600 text-white px-2 py-1 rounded font-mono text-xs mr-3">
      #{{ task.id }}
    </div>
    <div class="flex-grow">
      <div class="text-xs font-bold">{{ task.title }}</div>
    </div>
    <div class="flex space-x-4 items-center justify-end w-full md:w-auto">
      <button v-if="task.status !== 'running'" @click="$emit('play', task.id)" class="text-gray-400 hover:text-gray-200" title="Iniciar" tabindex="-1">
        <FontAwesomeIcon :icon="faPlay" class="h-6 w-6"/>
      </button>
      <button v-if="task.status === 'running'" @click="$emit('stop', task.id)" class="text-gray-400 hover:text-gray-200" title="Parar" tabindex="-1">
        <FontAwesomeIcon :icon="faStop" class="h-6 w-6"/>
      </button>
      <button v-if="task.status !== 'done'" @click.stop="$emit('done', task.id)" class="text-gray-400 hover:text-gray-200" title="Concluir" tabindex="-1">
        <FontAwesomeIcon :icon="faCheck" class="h-6 w-6"/>
      </button>
      <button @click.stop="$emit('archive', task.id)" class="text-gray-400 hover:text-gray-200" title="Arquivar" tabindex="-1">
        <FontAwesomeIcon :icon="faArchive" class="h-6 w-6"/>
      </button>
      <FontAwesomeIcon :icon="faCog" class="text-orange-400 h-6 w-6 animate-spin" v-if="isRunning"/>
    </div>
  </div>
</template>

<script setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faArchive, faCheck, faCog, faPlay, faStop } from "@fortawesome/free-solid-svg-icons";
import { computed } from "vue";
import { runningTasksService } from "@/services/running-tasks.service.js";

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
});

defineEmits(['play', 'play-now', 'stop', 'edit', 'archive', 'done']);

const isRunning = computed(() => {
  return runningTasksService.isRunning(props.task.id);
});
</script>
