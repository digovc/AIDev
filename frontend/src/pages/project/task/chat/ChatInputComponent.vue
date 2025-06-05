<template>
  <div class="relative">
    <textarea v-model="messageText" placeholder="Digite sua mensagem..." rows="5" class="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"/>
    <button class="absolute bottom-4 right-2 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-700" @click="sendMessage" :disabled="!messageText.trim()">
      <FontAwesomeIcon :icon="faPaperPlane" class="text-white"/>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

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
