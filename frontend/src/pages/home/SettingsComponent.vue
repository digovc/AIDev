<template>
  <div class="rounded-lg shadow-md p-4">
    <h1 class="text-2xl font-bold mb-6">Configurações</h1>

    <form @submit.prevent="saveSettings">

      <div class="mb-6">
        <div class="flex items-center mb-3">
          <input type="checkbox" id="anthropicEnabled" v-model="settings.anthropic.enabled" class="mr-2 bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600"/>
          <label for="anthropicEnabled">Ativar Anthropic</label>
        </div>

        <input v-if="settings.anthropic.enabled" type="password" id="anthropicApiKey" v-model="settings.anthropic.apiKey" placeholder="Cole sua API Key do Anthropic" class="form-input w-full"/>
      </div>


      <div class="mb-6">
        <div class="flex items-center mb-3">
          <input type="checkbox" id="openaiEnabled" v-model="settings.openai.enabled" class="mr-2 bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600"/>
          <label for="openaiEnabled">Ativar OpenAI</label>
        </div>

        <input v-if="settings.openai.enabled" type="password" id="openaiApiKey" v-model="settings.openai.apiKey" placeholder="Cole sua API Key do OpenAI" class="form-input w-full"/>
      </div>


      <div class="mb-6">
        <div class="flex items-center mb-3">
          <input type="checkbox" id="deepseekEnabled" v-model="settings.deepseek.enabled" class="mr-2 bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600"/>
          <label for="deepseekEnabled">Ativar DeepSeek</label>
        </div>

        <input v-if="settings.deepseek.enabled" type="password" id="deepseekApiKey" v-model="settings.deepseek.apiKey" placeholder="Cole sua API Key do DeepSeek" class="form-input w-full"/>
      </div>


      <div class="mb-6">
        <div class="flex items-center mb-3">
          <input type="checkbox" id="geminiEnabled" v-model="settings.gemini.enabled" class="mr-2 bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600"/>
          <label for="geminiEnabled">Ativar Google Gemini</label>
        </div>

        <input v-if="settings.gemini.enabled" type="password" id="geminiApiKey" v-model="settings.gemini.apiKey" placeholder="Cole sua API Key do Google Gemini" class="form-input w-full"/>
      </div>

      <div class="mb-6">
        <div class="flex items-center mb-3">
          <input type="checkbox" id="openrouterEnabled" v-model="settings.openrouter.enabled" class="mr-2 bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600"/>
          <label for="openrouterEnabled">Ativar OpenRouter</label>
        </div>

        <input v-if="settings.openrouter.enabled" type="password" id="openrouterApiKey" v-model="settings.openrouter.apiKey" placeholder="Cole sua API Key do OpenRouter" class="form-input w-full"/>
      </div>

      <div class="mb-6">
        <div class="flex items-center mb-3">
          <input type="checkbox" id="alibabaEnabled" v-model="settings.alibaba.enabled" class="mr-2 bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600"/>
          <label for="alibabaEnabled">Ativar Alibaba</label>
        </div>

        <input v-if="settings.alibaba.enabled" type="password" id="alibabaApiKey" v-model="settings.alibaba.apiKey" placeholder="Cole sua API Key do Alibaba" class="form-input w-full"/>
      </div>

      <div class="mb-6">
        <div class="flex items-center mb-3">
          <input type="checkbox" id="moonshotEnabled" v-model="settings.moonshot.enabled" class="mr-2 bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600"/>
          <label for="moonshotEnabled">Ativar Moonshot</label>
        </div>

        <input v-if="settings.moonshot.enabled" type="password" id="moonshotApiKey" v-model="settings.moonshot.apiKey" placeholder="Cole sua API Key do Moonshot" class="form-input w-full"/>
      </div>

      <div class="mb-6">
        <div class="flex items-center mb-3">
          <input type="checkbox" id="xaiEnabled" v-model="settings.xai.enabled" class="mr-2 bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600"/>
          <label for="xaiEnabled">Ativar xAI (Grok)</label>
        </div>

        <input v-if="settings.xai.enabled" type="password" id="xaiApiKey" v-model="settings.xai.apiKey" placeholder="Cole sua API Key do xAI" class="form-input w-full"/>
      </div>

      <div class="mb-6">
        <div class="flex items-center mb-3">
          <input type="checkbox" id="groqEnabled" v-model="settings.groq.enabled" class="mr-2 bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-600"/>
          <label for="groqEnabled">Ativar Groq</label>
        </div>

        <input v-if="settings.groq.enabled" type="password" id="groqApiKey" v-model="settings.groq.apiKey" placeholder="Cole sua API Key do Groq" class="form-input w-full"/>
      </div>

      <div class="flex justify-end space-x-3">
        <button type="button" @click="resetSettings" class="btn btn-secondary">
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Salvando...' : 'Salvar Configurações' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { settingsApi } from '@/api/settings.api';

const loading = ref(false);

const settings = reactive({
  anthropic: {
    enabled: false,
    apiKey: ''
  },
  openai: {
    enabled: false,
    apiKey: ''
  },
  deepseek: {
    enabled: false,
    apiKey: ''
  },
  gemini: {
    enabled: false,
    apiKey: ''
  },
  openrouter: {
    enabled: false,
    apiKey: ''
  },
  alibaba: {
    enabled: false,
    apiKey: ''
  },
  moonshot: {
    enabled: false,
    apiKey: ''
  },
  xai: {
    enabled: false,
    apiKey: ''
  },
  groq: {
    enabled: false,
    apiKey: ''
  }
});

const saveSettings = async () => {
  try {
    loading.value = true;
    const response = await settingsApi.saveSettings(settings);
    console.log('Configurações salvas com sucesso:', response.data);
    alert('Configurações salvas com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    alert('Não foi possível salvar as configurações. Tente novamente.');
  } finally {
    loading.value = false;
  }
};

const resetSettings = () => {
  settings.anthropic.enabled = false;
  settings.anthropic.apiKey = '';
  settings.openai.enabled = false;
  settings.openai.apiKey = '';
  settings.deepseek.enabled = false;
  settings.deepseek.apiKey = '';
  settings.gemini.enabled = false;
  settings.gemini.apiKey = '';
  settings.alibaba.enabled = false;
  settings.alibaba.apiKey = '';
  settings.moonshot.enabled = false;
  settings.moonshot.apiKey = '';
  settings.xai.enabled = false;
  settings.xai.apiKey = '';
  settings.groq.enabled = false;
  settings.groq.apiKey = '';
};

onMounted(async () => {
  try {
    const response = await settingsApi.getSettings();
    if (response.data) {
      Object.assign(settings, response.data);
    }
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    alert('Não foi possível carregar as configurações.');
  }
});
</script>
