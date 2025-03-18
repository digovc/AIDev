<template>
  <dialog ref="dialogRef" class="p-0 rounded-lg shadow-lg bg-gray-900">
    <div class="p-6 w-full">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-white">{{ isEditing ? 'Editar Assistente' : 'Novo Assistente' }}</h2>
        <button @click="close" class="text-white">
          <span class="text-2xl">&times;</span>
        </button>
      </div>

      <form @submit.prevent="saveAssistant">
        <div class="mb-4">
          <label for="name" class="form-label">Nome</label>
          <input type="text" id="name" v-model="assistant.name" class="form-input" required autofocus/>
        </div>

        <div class="mb-4">
          <label for="profile" class="form-label">Perfil</label>
          <textarea id="profile" v-model="assistant.profile" rows="5" class="form-input"></textarea>
        </div>

        <div class="mb-4">
          <label for="provider" class="form-label">Provider</label>
          <select id="provider" v-model="assistant.provider" class="form-input" required>
            <option value="anthropic">Anthropic</option>
            <option value="openai">OpenAI</option>
            <option value="deepseek">DeepSeek</option>
            <option value="google">Google</option>
          </select>
        </div>

        <div class="mb-6">
          <label for="model" class="form-label">Modelo LLM</label>
          <input type="text" id="model" v-model="assistant.model" class="form-input" required/>
        </div>

        <div class="flex justify-end space-x-3">
          <button type="button" @click="close" class="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </div>
  </dialog>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import { assistantsApi } from '@/api/assistants.api';

const props = defineProps({
  assistantData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['assistant-created', 'assistant-updated']);
const dialogRef = ref(null);
const loading = ref(false);

const assistant = reactive({
  id: '',
  name: '',
  profile: '',
  provider: '',
  model: ''
});

const isEditing = computed(() => !!assistant.id);

const open = (assistantToEdit = null) => {
  if (assistantToEdit) {
    Object.assign(assistant, assistantToEdit);
  } else {
    resetForm();
  }
  dialogRef.value.showModal();
};

const close = () => {
  dialogRef.value.close();
  resetForm();
};

const resetForm = () => {
  assistant.id = '';
  assistant.name = '';
  assistant.profile = '';
  assistant.provider = '';
  assistant.model = '';
};

const saveAssistant = async () => {
  try {
    loading.value = true;
    let response;

    if (isEditing.value) {
      response = await assistantsApi.updateAssistant(assistant.id, assistant);
      emit('assistant-updated', response.data);
    } else {
      response = await assistantsApi.createAssistant(assistant);
      emit('assistant-created', response.data);
    }

    close();
  } catch (error) {
    console.error('Erro ao salvar assistente:', error);
    alert('Ocorreu um erro ao salvar o assistente. Por favor, tente novamente.');
  } finally {
    loading.value = false;
  }
};

defineExpose({
  open
});
</script>

<style scoped>
dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

dialog {
  border: none;
  width: 75vw;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
}
</style>
