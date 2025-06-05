<template>
  <div class="h-full flex flex-col p-4">
    <div v-if="loading" class="text-center py-8">
      <p class="text-lg">Carregando projeto...</p>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <div v-else class="flex flex-col grow space-y-2">
      <div>
        <ProjectHeaderComponent :project="project" @project-updated="handleProjectUpdated"/>
      </div>
      <div class="flex-1 relative">
        <div class="absolute inset-0 overflow-y-auto">
          <RouterView v-if="project" :project="project" class="h-full" @taskSelected="handleTaskSelected" @taskClosed="handleTaskClosed" @taskDuplicated="handleTaskSelected" @taskStarted="handleTaskSelected"></RouterView>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import ProjectHeaderComponent from "@/pages/project/ProjectHeaderComponent.vue";
import { onMounted, onUnmounted, ref } from 'vue';
import { projectsApi } from '@/api/projects.api';
import { socketIOService } from "@/services/socket.io.js";
import { useRoute, useRouter } from 'vue-router';

const error = ref(null);
const loading = ref(true);
const project = ref(null);
const route = useRoute();
const router = useRouter();
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
    await router.push('home');
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
