<template>
  <div class="bg-gray-900 rounded-lg shadow-md p-4 flex flex-col h-full space-y-2">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-bold">{{ isEditing ? `Editar Tarefa (${ task.id })` : 'Nova Tarefa' }}</h2>
      <button @click="goBack" class="text-gray-400 hover:text-gray-200">
        <FontAwesomeIcon :icon="faTimes" class="text-2xl"/>
      </button>
    </div>

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
            Adicionar Referência
          </button>
        </div>

        <div v-if="task.references.length === 0" class="text-gray-500 italic p-2">
          Nenhuma referência adicionada
        </div>

        <div v-else class="space-y-2 pt-3 grow h-1 overflow-y-auto">
          <ReferenceComponent v-for="(ref, index) in task.references" :key="index" :reference="ref" @remove="removeReference(index)"/>
        </div>
      </div>

      <div>
        <label for="assistant" class="form-label">Assistente</label>
        <select id="assistant" v-model="task.assistantId" class="form-input">
          <option :value="null">Selecione um assistente</option>
          <option v-for="assistant in assistants" :key="assistant.id" :value="assistant.id">
            {{ assistant.name }}
          </option>
        </select>
      </div>

      <div class="flex justify-between items-center space-x-3">
        <div class="flex items-center">
          <div v-if="hasConversation" class="flex items-center text-sm text-gray-400 mr-4">
            <FontAwesomeIcon :icon="faComments" class="mr-2"/>
            <span>{{ conversationTitle || 'Conversa vinculada' }}</span>
          </div>
        </div>
        <div class="flex justify-end space-x-3">
          <button type="button" @click="saveAndRunTask" class="btn btn-primary" :disabled="loading">
            <FontAwesomeIcon :icon="faPlay" class="mr-2"/>
            {{ loading ? 'Processando...' : 'Executar' }}
          </button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <FontAwesomeIcon :icon="faSave" class="mr-2"/>
            {{ loading ? 'Salvando...' : 'Salvar' }}
          </button>
          <button v-if="isEditing" type="button" @click="duplicateTask" class="btn btn-secondary" :disabled="loading">
            <FontAwesomeIcon :icon="faCopy" class="mr-2"/>
            Duplicar
          </button>
          <button type="button" @click="goBack" class="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </div>
    </form>
    <ReferencesDialog ref="referencesDialog" :project="project" :task-references="task.references" @update:references="updateReferences"/>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { tasksApi } from '@/api/tasks.api.js';
import ReferencesDialog from '@/pages/project/taks/ReferencesDialog.vue';
import ReferenceComponent from '@/components/ReferenceComponent.vue';
import { assistantsApi } from '@/api/assistants.api.js';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faComments, faCopy, faPlay, faPlus, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { conversationsApi } from '@/api/conversations.api.js';

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const isEditing = ref(false);
const referencesDialog = ref(null);
const titleInput = ref(null);
const assistants = ref([]);
const conversationTitle = ref(null);

const task = reactive({
  id: null,
  title: '',
  description: '',
  status: 'backlog',
  references: [],
  assistantId: null
});

const hasConversation = computed(() => {
  console.log('hasConversation', task.conversationId);
  return task.conversationId !== null && task.conversationId !== undefined;
});

const goBack = () => {
  router.push(`/projects/${ props.project.id }`);
};

const saveTask = async () => {
  try {
    loading.value = true;

    const taskData = {
      ...task,
      projectId: props.project.id
    };

    // Salva o assistente selecionado como default no localStorage
    if (task.assistantId) {
      localStorage.setItem('defaultAssistantId', task.assistantId);
    }

    if (isEditing.value) {
      await tasksApi.updateTask(task.id, taskData);
    } else {
      const result = await tasksApi.createTask(taskData);
      task.id = result.data.id; // Atualiza o ID da tarefa após a criação
    }

    // Navegar de volta para a lista de tarefas
    await router.push(`/projects/${ props.project.id }`);
  } catch (error) {
    console.error(`Erro ao ${ isEditing.value ? 'atualizar' : 'salvar' } tarefa:`, error);
    alert(`Ocorreu um erro ao ${ isEditing.value ? 'atualizar' : 'salvar' } a tarefa. Por favor, tente novamente.`);
  } finally {
    loading.value = false;
    window.removeEventListener('keydown', handleKeyPress);
  }
};

const saveAndRunTask = async () => {
  try {
    loading.value = true;

    // Salva o assistente selecionado como default no localStorage
    if (task.assistantId) {
      localStorage.setItem('defaultAssistantId', task.assistantId);
    }

    const taskData = {
      ...task,
      projectId: props.project.id
    };

    let taskId;

    if (isEditing.value) {
      await tasksApi.updateTask(task.id, taskData);
      taskId = task.id;
    } else {
      const result = await tasksApi.createTask(taskData);
      taskId = result.data.id;
    }

    // Executar a tarefa após salvar
    await tasksApi.runTask(taskId);

    // Navegar de volta para a lista de tarefas
    await router.push(`/projects/${ props.project.id }`);
  } catch (error) {
    console.error(`Erro ao salvar e executar tarefa:`, error);
    alert(`Ocorreu um erro ao salvar e executar a tarefa. Por favor, tente novamente.`);
  } finally {
    loading.value = false;
  }
};

const loadTask = async () => {
  const taskId = route.params.taskId;

  if (!taskId) {
    return;
  }

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

    // Navegar para a página de edição da nova tarefa
    await router.push(`/projects/${ props.project.id }/tasks/${ result.data.id }`);

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
  const isPressed = event.ctrlKey && event.shiftKey && event.key === 'E';
  if (isPressed && !loading.value) {
    event.preventDefault(); // Prevent default browser behavior like opening search
    saveAndRunTask();
  }
};

// Observar mudanças na rota para recarregar a tarefa quando o parâmetro taskId mudar
watch(() => route.params.taskId, async (newTaskId) => {
  if (newTaskId) {
    await loadTask();
  }
});

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

onMounted(async () => {
  window.addEventListener('keydown', handleKeyPress);
  await loadTask();
  await loadAssistants();
  await titleInput.value.focus();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
});
</script>
