<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Assistentes</h1>
      <button @click="showAssistantForm" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Novo Assistente
      </button>
    </div>
    <AssistantFormComponent ref="assistantFormRef" @assistant-created="onAssistantCreated" @assistant-updated="onAssistantUpdated"/>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <AssistantComponent v-for="assistant in assistants" :key="assistant.id" :assistant="assistant" @edit-assistant="editAssistant"/>
    </div>
    <div v-if="assistants.length === 0" class="text-center py-10 text-gray-400">
      Nenhum assistente cadastrado
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import AssistantComponent from './AssistantComponent.vue';
import AssistantFormComponent from '@/components/AssistantFormComponent.vue';
import { assistantsApi } from "@/api/assistants.api.js";

const assistants = ref([]);

const assistantFormRef = ref(null);

const fetchAssistants = async () => {
  try {
    const response = await assistantsApi.listAssistants();
    assistants.value = response.data;
  } catch (error) {
    console.error('Erro ao carregar assistentes:', error);
  }
};

const showAssistantForm = () => {
  assistantFormRef.value.open();
};

const onAssistantCreated = (newAssistant) => {
  assistants.value.push(newAssistant);
};

const onAssistantUpdated = (updatedAssistant) => {
  const index = assistants.value.findIndex(a => a.id === updatedAssistant.id);
  if (index !== -1) {
    assistants.value[index] = updatedAssistant;
  }
};

const editAssistant = (assistant) => {
  assistantFormRef.value.open(assistant);
};

onMounted(() => {
  fetchAssistants(); // Descomentar quando a API estiver disponível
});
</script>
