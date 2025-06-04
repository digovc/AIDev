<template>
  <div class="bg-gray-900 rounded-lg shadow-md p-4 flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-bold">{{ taskTitle }}</h2>
      <button @click="goBack" class="text-gray-400 hover:text-gray-200">
        <FontAwesomeIcon :icon="faTimes" class="text-2xl"/>
      </button>
    </div>

    <div>
      <TabsComponent :tabs="tabs"/>
    </div>
    <div class="flex-1 overflow-y-auto pt-4 px-2">
      <RouterView :project="project" :task="task"/>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import TabsComponent from '@/components/TabsComponent.vue';
import { tasksApi } from '@/api/tasks.api.js';

const route = useRoute();
const router = useRouter();

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
});

const tabs = ref([
  { title: 'Detalhes' },
  { title: 'Histórico' },
]);

const task = reactive({
  id: null,
  title: '',
  description: '',
  status: 'backlog',
  references: [],
  assistantId: null
});

const taskTitle = computed(() => {
  if (task.id) return `Tarefa ${ task.id }`;
  return 'Nova Tarefa';
});

const loadTask = async () => {
  const taskId = route.params.taskId;

  if (!taskId) return;
  if (taskId === 'new') return;

  try {
    const response = await tasksApi.getTaskById(taskId);
    const taskData = response.data;

    for (const key in taskData) {
      task[key] = taskData[key];
    }

    task.references = task.references || [];
  } catch (error) {
    console.error('Erro ao carregar tarefa:', error);
    alert('Não foi possível carregar os dados da tarefa.');
    goBack();
  }
};

const goBack = () => {
  router.push(`/projects/${ props.project.id }`);
};

const saveTask = async () => {
  try {
    const taskData = {
      ...task,
      projectId: props.project.id
    };

    if (task.id) {
      await tasksApi.updateTask(task.id, taskData);
    } else {
      const result = await tasksApi.createTask(taskData);
      task.id = result.data.id;
    }

    goBack();
  } catch (error) {
    console.error('Erro ao salvar tarefa:', error);
    alert('Ocorreu um erro ao salvar a tarefa. Por favor, tente novamente.');
  }
};

const saveAndRunTask = async () => {
  // Implement save and run logic
};

const duplicateTask = async () => {
  // Implement duplicate logic
};

onMounted(async () => {
  await loadTask();
});
</script>
