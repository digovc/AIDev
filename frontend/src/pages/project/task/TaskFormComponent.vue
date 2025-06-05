<template>
  <div class="bg-gray-900 rounded-lg shadow-md px-1 flex flex-col space-y-2">
    <form @submit.prevent="saveTask" class="flex flex-col grow space-y-2">
      <div class="mb-4">
        <label for="title" class="form-label">Título</label>
        <input type="text" id="title" v-model="task.title" class="form-input" required ref="titleInput"/>
      </div>

      <div class="mb-4">
        <label for="description" class="form-label">Descrição</label>
        <textarea id="description" v-model="task.description" rows="15" class="form-input"></textarea>
      </div>

      <!-- Adicione esta nova seção para listar as referências -->
      <div class="grow flex flex-col">
        <div class="flex justify-between items-center">
          <label class="form-label">Referências</label>
          <button type="button" @click="openReferencesDialog" class="btn btn-secondary mt-1 mr-1">
            <FontAwesomeIcon :icon="faPlus" class="mr-2"/>
            Referência
          </button>
        </div>

        <div v-if="task.references.length === 0" class="text-gray-500 italic text-sm">
          Nenhuma referência adicionada
        </div>

        <div v-else class="space-y-2 pt-4 grow overflow-y-auto">
          <ReferenceComponent v-for="(ref, index) in task.references" :key="index" :reference="ref" @remove="removeReference(index)"/>
        </div>
      </div>

      <div class="pt-4">
        <label for="assistant" class="form-label">Assistente</label>
        <select id="assistant" v-model="task.assistantId" class="form-input">
          <option :value="null">Selecione um assistente</option>
          <option v-for="assistant in assistants" :key="assistant.id" :value="assistant.id">
            {{ assistant.name }}
          </option>
        </select>
      </div>

      <div class="flex justify-end space-x-3 pt-2">
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <FontAwesomeIcon :icon="faSave" class="mr-2"/>
          {{ loading ? 'Salvando...' : 'Salvar' }}
        </button>
        <button v-if="isEditing" type="button" @click="duplicateTask" class="btn btn-secondary" :disabled="loading">
          <FontAwesomeIcon :icon="faCopy" class="mr-2"/>
          Duplicar
        </button>
        <button type="button" @click="goBack" class="btn btn-secondary">
          Voltar
        </button>
      </div>
    </form>
    <ReferencesDialog ref="referencesDialog" :project="project" :task-references="task.references" @update:references="updateReferences"/>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { tasksApi } from '@/api/tasks.api.js';
import ReferencesDialog from '@/pages/project/task/ReferencesDialog.vue';
import ReferenceComponent from '@/components/ReferenceComponent.vue';
import { assistantsApi } from '@/api/assistants.api.js';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCopy, faPlus, faSave } from '@fortawesome/free-solid-svg-icons';
import { conversationsApi } from '@/api/conversations.api.js';
import { socketIOService } from "@/services/socket.io.js";

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
});

const assistants = ref([]);
const conversationTitle = ref(null);
const isEditing = ref(false);
const loading = ref(false);
const referencesDialog = ref(null);
const route = useRoute();
const router = useRouter();
const titleInput = ref(null);

const task = reactive({
  id: null,
  title: '',
  description: '',
  status: 'backlog',
  references: [],
  assistantId: null
});

watch(() => route.params.taskId, async (newTaskId) => {
  if (newTaskId) {
    await loadTask();
  }
});

const emits = defineEmits(['task-closed', 'task-duplicated', 'task-started']);

const goBack = () => {
  emits('task-closed');
  router.push(`/projects/${ props.project.id }`);
};

const saveTask = async () => {
  try {
    loading.value = true;

    const taskData = {
      ...task,
      projectId: props.project.id
    };

    if (task.assistantId) {
      localStorage.setItem('defaultAssistantId', task.assistantId);
    }

    if (isEditing.value) {
      await tasksApi.updateTask(task.id, taskData);
    } else {
      const result = await tasksApi.createTask(taskData);
      task.id = result.data.id;
    }

    await router.push(`/projects/${ props.project.id }/tasks/${ task.id }`);
  } catch (error) {
    console.error(`Erro ao ${ isEditing.value ? 'atualizar' : 'salvar' } tarefa:`, error);
    alert(`Ocorreu um erro ao ${ isEditing.value ? 'atualizar' : 'salvar' } a tarefa. Por favor, tente novamente.`);
  } finally {
    loading.value = false;
  }
};


const loadTask = async () => {
  const taskId = route.params.taskId;

  if (!taskId) return;
  if (taskId === 'new') return;

  isEditing.value = true;

  try {
    loading.value = true;
    const response = await tasksApi.getTaskById(taskId);
    const taskData = response.data;

    for (const key in taskData) {
      task[key] = taskData[key];
    }

    task.references = task.references || [];
    task.conversationId = taskData.conversationId;

    await loadConversationTitle();

  } catch (error) {
    console.error('Erro ao carregar tarefa:', error);
    alert('Não foi possível carregar os dados da tarefa.');
    await router.push(`/projects/${ props.project.id }`);
  } finally {
    loading.value = false;
  }
};

const loadConversationTitle = async () => {
  if (task.conversationId) {
    try {
      const response = await conversationsApi.getById(task.conversationId);
      conversationTitle.value = response.data.title;
    } catch (error) {
      console.error('Erro ao carregar título da conversa:', error);
    }
  }
};

const duplicateTask = async () => {
  try {
    loading.value = true;

    // Criar uma cópia da tarefa atual, removendo o ID para criar uma nova
    const duplicatedTaskData = {
      title: `${ task.title } (Cópia)`,
      description: task.description,
      status: 'backlog', // Define status como backlog para a nova tarefa
      references: [...task.references], // Copia as referências
      projectId: props.project.id,
      assistantId: task.assistantId
    };

    // Criar nova tarefa
    const result = await tasksApi.createTask(duplicatedTaskData);
    const duplicatedTask = result.data;

    // Navegar para a página de edição da nova tarefa
    emits('task-duplicated', duplicatedTask);
    await router.push(`/projects/${ props.project.id }/tasks/${ duplicatedTask.id }`);

    setTimeout(() => titleInput.value.focus(), 100);
  } catch (error) {
    console.error('Erro ao duplicar tarefa:', error);
    alert('Ocorreu um erro ao duplicar a tarefa. Por favor, tente novamente.');
  } finally {
    loading.value = false;
  }
};

const openReferencesDialog = () => {
  referencesDialog.value.open();
};

const updateReferences = (newReferences) => {
  task.references = newReferences;
};

const removeReference = (index) => {
  task.references.splice(index, 1);
};

const handleKeyPress = (event) => {
  const isScapePressed = event.key === 'Escape';

  if (isScapePressed) {
    event.preventDefault();
    event.stopPropagation();
    goBack();
  }
};

const loadAssistants = async () => {
  try {
    const response = await assistantsApi.listAssistants();
    assistants.value = response.data;

    // Verifica se há um assistente default no localStorage
    const defaultAssistantId = localStorage.getItem('defaultAssistantId');
    if (defaultAssistantId) {
      const assistant = assistants.value.find(assistant => assistant.id === defaultAssistantId);
      if (assistant) {
        task.assistantId = assistant.id;
      }
    }
  } catch (error) {
    console.error('Erro ao carregar assistentes:', error);
  }
};

const taskUpdated = (updatedTask) => {
  if (updatedTask.id === task.id) {
    Object.assign(task, updatedTask);
  }
};

onMounted(async () => {
  window.addEventListener('keydown', handleKeyPress);
  socketIOService.socket.on('task-updated', taskUpdated);

  await loadTask();
  await loadAssistants();
  await titleInput.value.focus();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
  socketIOService.socket.off('task-updated', taskUpdated);
});
</script>
