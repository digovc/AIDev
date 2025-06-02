<template>
  <div class="h-full flex flex-col p-4">
    <div v-if="loading" class="text-center py-8">
      <p class="text-lg">Carregando projeto...</p>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <div v-else class="flex h-full">

      <div class="space-y-2 flex flex-col" :style="{ width: `${leftWidth}%` }">
        <ProjectInfoComponent :project="project" @project-updated="handleProjectUpdated"/>
        <div class="relative grow overflow-y-auto">
          <RouterView v-if="project" :project="project" class="h-full absolute inset-0" @taskSelected="handleTaskSelected" @taskClosed="handleTaskClosed" @taskDuplicated="handleTaskSelected" @taskStarted="handleTaskSelected"></RouterView>
        </div>
      </div>

      <!-- Divisor redimensionável -->
      <div class="cursor-col-resize w-2 h-full hover:bg-blue-300 active:bg-blue-500 transition-colors duration-200" @mousedown="startResize"></div>

      <!-- Coluna da direita (chat) -->
      <div class="flex-1">
        <ChatComponent v-if="taskSelected" :project="project" :task="taskSelected"/>
        <div v-else class="text-center text-gray-400 h-full flex justify-center items-center italic text-sm">
          Nenhuma tarefa selecionada
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { projectsApi } from '@/api/projects.api';
import ProjectInfoComponent from './ProjectInfoComponent.vue';
import ChatComponent from './chat/ChatComponent.vue';
import { socketIOService } from "@/services/socket.io.js";

const containerRef = ref(null);
const error = ref(null);
const isResizing = ref(false);
const leftWidth = ref(66);
const loading = ref(true);
const project = ref(null);
const route = useRoute();
const taskSelected = ref(null);

const loadSavedLayout = () => {
  try {
    const savedWidth = localStorage.getItem('aidev.layout.leftWidth');
    if (savedWidth !== null) {
      leftWidth.value = parseFloat(savedWidth);
    }
  } catch (e) {
    console.error('Erro ao carregar layout salvo:', e);
  }
};

const saveLayout = () => {
  try {
    localStorage.setItem('aidev.layout.leftWidth', leftWidth.value.toString());
  } catch (e) {
    console.error('Erro ao salvar layout:', e);
  }
};

const startResize = (e) => {
  isResizing.value = true;

  containerRef.value = e.target.closest('.flex.h-full');
  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', stopResize);

  e.preventDefault();
};

const onResize = (e) => {
  if (!isResizing.value || !containerRef.value) return;

  const containerRect = containerRef.value.getBoundingClientRect();
  const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;


  leftWidth.value = Math.max(30, Math.min(80, newWidth));
};

const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
  saveLayout();
};

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
  loadSavedLayout();
  await loadProject();

  if (project.value && project.value.name) {
    document.title = `${ project.value.name } - AIDev`;
  }

  socketIOService.socket.on('conversation-created', conversationCreated);
});

onUnmounted(() => {
  socketIOService.socket.off('conversation-created', conversationCreated);

  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);

  document.title = 'AIDev';
});
</script>
