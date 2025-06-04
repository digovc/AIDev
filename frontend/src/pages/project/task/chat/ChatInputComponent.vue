<template>
  <div class="flex">
    <input v-model="messageText" type="text" placeholder="Digite sua mensagem..." class="flex-grow p-2 rounded-l bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500" @keyup.enter="sendMessage"/>
    <button class="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700" @click="sendMessage" :disabled="!messageText.trim()">
      Enviar
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  onSendMessage: Function
});

const messageText = ref('');

const sendMessage = () => {
  const text = messageText.value.trim();

  if (text) {
    props.onSendMessage(text);
    messageText.value = '';
  }
};
</script>
