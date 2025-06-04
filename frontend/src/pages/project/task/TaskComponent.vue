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
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import TabsComponent from '@/components/TabsComponent.vue';
import { tasksApi } from '@/api/tasks.api.js';

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
});

const route = useRoute();
const router = useRouter();
const task = ref(null);

const tabs = ref([
  { title: 'Detalhes' },
  { title: 'Histórico' },
]);

watch(() => route.params.taskId, async (newTaskId) => {
  if (task.value?.id !== newTaskId) {
    await loadTask();
  }
});

const taskTitle = computed(() => {
  if (task.value?.id) return `Tarefa ${ task.value.id }`;
  return 'Nova tarefa';
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

const goBack = () => {
  router.push(`/projects/${ props.project.id }`);
};

onMounted(async () => {
  await loadTask();
});
</script>
