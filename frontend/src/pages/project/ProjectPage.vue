<template>
  <div class="h-full flex flex-col p-4">
    <div v-if="loading" class="text-center py-8">
      <p class="text-lg">Carregando projeto...</p>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <div v-else class="flex flex-col h-full space-y-2">
      <ProjectInfoComponent :project="project" @project-updated="handleProjectUpdated"/>
      <!-- Lista de tarefas ocupa toda a largura -->
      <div class="h-full">
        <RouterView v-if="project" :project="project" class="h-full" @taskSelected="handleTaskSelected" @taskClosed="handleTaskClosed" @taskDuplicated="handleTaskSelected" @taskStarted="handleTaskSelected"></RouterView>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { projectsApi } from '@/api/projects.api';
import ProjectInfoComponent from './ProjectInfoComponent.vue';
import { socketIOService } from "@/services/socket.io.js";

const error = ref(null);
const loading = ref(true);
const project = ref(null);
const route = useRoute();
const taskSelected = ref(null);



const handleTaskSelected = (task) => {
  taskSelected.value = task;
};

const handleTaskClosed = () => {
  taskSelected.value = null;
};

const handleProjectUpdated = (updatedProject) => {
  if (updatedProject) {
    project.value = updatedProject;

    if (updatedProject.name) {
      document.title = `${ updatedProject.name } - AIDev`;
    }
  }
};

const loadProject = async () => {
  if (!route.params.id) {
    return;
  }

  try {
    loading.value = true;
    const response = await projectsApi.getProjectById(route.params.id);
    project.value = response.data;


    if (project.value && project.value.name) {
      document.title = `${ project.value.name } - AIDev`;
    }

  } catch (e) {
    console.error('Erro ao carregar dados do projeto:', e);
    error.value = 'Não foi possível carregar o projeto. Tente novamente mais tarde.';
  } finally {
    loading.value = false;
  }
};

const conversationCreated = (conversation) => {
  if (taskSelected && taskSelected.id === conversation.taskId && taskSelected.conversationId !== conversation.id) {
    taskSelected.conversationId = conversation.id;
  }
};

onMounted(async () => {
  await loadProject();

  if (project.value && project.value.name) {
    document.title = `${ project.value.name } - AIDev`;
  }

  socketIOService.socket.on('conversation-created', conversationCreated);
});

onUnmounted(() => {
  socketIOService.socket.off('conversation-created', conversationCreated);

  document.title = 'AIDev';
});
</script>
