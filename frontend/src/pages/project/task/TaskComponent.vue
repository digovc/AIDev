<template>
  <div class="bg-gray-900 rounded-lg shadow-md p-2 flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center space-x-4">
        <h2 class="text-lg font-bold">{{ taskTitle }}</h2>
        <FontAwesomeIcon :icon="faCog" class="text-gray-200 animate-spin" v-if="isRunning"/>
      </div>

      <div class="flex gap-4 text-gray-400 text-lg">
        <button v-if="!isRunning && task?.id" @click="runTask" :disabled="loading">
          <FontAwesomeIcon :icon="faPlay" class="text-green-500 hover:text-green-300"/>
        </button>
        <button v-if="isRunning && task?.id" @click="stopTask" :disabled="loading">
          <FontAwesomeIcon :icon="faStop" class="text-red-500 hover:text-red-300"/>
        </button>
        <button @click="goBack" class="text-gray-400 hover:text-gray-200">
          <FontAwesomeIcon :icon="faTimes" class="text-2xl"/>
        </button>
      </div>
    </div>

    <div>
      <TabsComponent :tabs="tabs"/>
    </div>
    <div class="flex-1 overflow-y-auto pt-2 px-1">
      <RouterView :project="project" :task="task"/>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCog, faPlay, faStop, faTimes } from '@fortawesome/free-solid-svg-icons';
import TabsComponent from '@/components/TabsComponent.vue';
import { tasksApi } from '@/api/tasks.api.js';
import { runningTasksService } from "@/services/running-tasks.service.js";
import { socketIOService } from "@/services/socket.io.js";
import { shortcutService } from "@/services/shortcut.service.js";

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
});

const loading = ref(false);
const route = useRoute();
const router = useRouter();
const task = ref(null);

const tabs = computed(() => {
  const params = route.params;

  const baseTabs = [
    { title: 'Detalhes', route: 'task-details', params },
  ];

  if (task.value?.id) {
    baseTabs.push(
        { title: 'Histórico', route: 'task-chat', params },
        { title: 'Alterações', route: 'task-diff', params },
    );
  }

  return baseTabs;
});

watch(() => route.params.taskId, async (newTaskId) => {
  if (task.value?.id !== newTaskId) {
    await loadTask();
  }
});

const taskTitle = computed(() => {
  if (task.value?.id) return `Tarefa ${ task.value.id }`;
  return 'Nova tarefa';
});

const isRunning = computed(() => {
  if (!task.value?.id) return false;
  return runningTasksService.isRunning(task.value.id);
});

const loadTask = async () => {
  const taskId = route.params.taskId;

  if (!taskId) return;
  if (taskId === 'new') return;

  try {
    const response = await tasksApi.getTaskById(taskId);
    task.value = response.data;
    task.value.references = task.value.references || [];
  } catch (error) {
    console.error('Erro ao carregar tarefa:', error);
    alert('Não foi possível carregar os dados da tarefa.');
    goBack();
  }
};

const runTask = async () => {
  try {
    if (!task.value?.id) return;
    loading.value = true;
    await tasksApi.runTask(task.value.id);
  } catch (error) {
    console.error('Erro ao executar tarefa:', error);
    alert('Ocorreu um erro ao executar a tarefa. Por favor, tente novamente.');
  } finally {
    loading.value = false;
  }
};

const stopTask = async () => {
  try {
    loading.value = true;
    await tasksApi.stopTask(task.value.id);
  } catch (error) {
    console.error('Erro ao parar tarefa:', error);
    alert('Ocorreu um erro ao parar a tarefa. Por favor, tente novamente.');
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push(`/projects/${ props.project.id }`);
};

const taskUpdated = (updatedTask) => {
  if (updatedTask.id !== task.value.id) return;
  task.value = updatedTask;
};

const handleExecute = () => {
  runTask();
};

const handleClose = () => {
  goBack();
};

const handleTabDetails = () => {
  router.push({ name: 'task-details', params: route.params });
};

const handleTabHistory = () => {
  if (task.value?.id) {
    router.push({ name: 'task-chat', params: route.params });
  }
};

const handleTabChanges = () => {
  if (task.value?.id) {
    router.push({ name: 'task-diff', params: route.params });
  }
};

onMounted(async () => {
  await loadTask();
  socketIOService.socket.on('task-updated', taskUpdated);
  shortcutService.on('execute', handleExecute);
  shortcutService.on('close', handleClose);
  shortcutService.on('tab-details', handleTabDetails);
  shortcutService.on('tab-history', handleTabHistory);
  shortcutService.on('tab-changes', handleTabChanges);
});

onUnmounted(() => {
  socketIOService.socket.off('task-updated', taskUpdated);
  shortcutService.off('execute', handleExecute);
  shortcutService.off('close', handleClose);
  shortcutService.off('tab-details', handleTabDetails);
  shortcutService.off('tab-history', handleTabHistory);
  shortcutService.off('tab-changes', handleTabChanges);
});
</script>
