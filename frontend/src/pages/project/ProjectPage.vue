<template>
  <div class="h-full flex flex-col p-4">
    <div v-if="loading" class="text-center py-8">
      <p class="text-lg">Carregando projeto...</p>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {{ error }}
    </div>

    <div v-else class="flex h-full">
      <!-- Coluna da esquerda (tarefas) -->
      <div class="space-y-2 flex flex-col" :style="{ width: `${leftWidth}%` }">
        <!-- Componente de informações do projeto -->
        <ProjectInfoComponent :project="project" @project-updated="handleProjectUpdated"/>
        <div class="relative grow overflow-y-auto">
          <!-- Router view para exibir tarefas ou formulário de tarefa -->
          <RouterView v-if="project" :project="project" class="h-full absolute inset-0" @taskSelected="handleTaskSelected"></RouterView>
        </div>
      </div>

      <!-- Divisor redimensionável -->
      <div class="cursor-col-resize w-2 h-full hover:bg-blue-300 active:bg-blue-500 transition-colors duration-200" @mousedown="startResize"></div>

      <!-- Coluna da direita (chat) -->
      <div class="flex-1">
        <!-- Componente de chat -->
        <ChatComponent ref="chatComponent" :project="project" class="h-full"/>
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

const route = useRoute();
const project = ref(null);
const loading = ref(true);
const error = ref(null);
const chatComponent = ref(null);

// Estado para controlar o redimensionamento
const leftWidth = ref(66); // Padrão: 66% para a esquerda (aprox. 2/3)
const isResizing = ref(false);
const containerRef = ref(null);

// Carregar a proporção salva do localStorage ou usar o valor padrão
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

// Salvar a proporção atual no localStorage
const saveLayout = () => {
  try {
    localStorage.setItem('aidev.layout.leftWidth', leftWidth.value.toString());
  } catch (e) {
    console.error('Erro ao salvar layout:', e);
  }
};

// Lidar com o início do redimensionamento
const startResize = (e) => {
  isResizing.value = true;
  // Armazenar a referência ao container
  containerRef.value = e.target.closest('.flex.h-full');
  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', stopResize);
  // Evitar seleção de texto durante o redimensionamento
  e.preventDefault();
};

// Calcular a nova largura durante o redimensionamento
const onResize = (e) => {
  if (!isResizing.value || !containerRef.value) return;

  const containerRect = containerRef.value.getBoundingClientRect();
  const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

  // Limitar a largura entre 30% e 80%
  leftWidth.value = Math.max(30, Math.min(80, newWidth));
};

// Parar o redimensionamento e salvar a configuração
const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
  saveLayout();
};

const handleTaskSelected = (task) => {
  if (task && task.conversationId && chatComponent.value) {
    chatComponent.value.selectConversationById(task.conversationId);
  }
};

const handleProjectUpdated = (updatedProject) => {
  if (updatedProject) {
    project.value = updatedProject;
    // Atualizar o título da página com o nome atualizado do projeto
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

    // Atualizar o título da página com o nome do projeto
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
  if (project.value && conversation.projectId === project.value.id) {
    project.value.conversations.push({ id: conversation.id, title: conversation.title });
  }
};

onMounted(async () => {
  // Carregar a proporção salva
  loadSavedLayout();

  await loadProject();

  // Atualizar o título da página com o nome do projeto
  if (project.value && project.value.name) {
    document.title = `${ project.value.name } - AIDev`;
  }

  socketIOService.socket.on('conversation-created', conversationCreated);
});

onUnmounted(() => {
  socketIOService.socket.off('conversation-created', conversationCreated);

  // Limpar os event listeners de redimensionamento se ainda estiverem ativos
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);

  // Resetar o título da página quando sair da página do projeto
  document.title = 'AIDev';
});
</script>
