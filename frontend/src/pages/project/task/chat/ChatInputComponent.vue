<template>
  <div class="relative">
    <textarea ref="textareaRef" v-model="messageText" placeholder="Digite sua mensagem..." class="w-full p-1 pl-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500 resize-none overflow-hidden" style="min-height: 1rem;"/>
    <button class="absolute bottom-3.5 right-1.5 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-700" @click="sendMessage">
      <FontAwesomeIcon :icon="faPaperPlane" class="text-white"/>
    </button>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue';
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

const props = defineProps({
  onSendMessage: Function
});

const messageText = ref('');
const textareaRef = ref(null);

const adjustHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px';
  }
};

watch(messageText, () => {
  nextTick(() => {
    adjustHeight();
  });
});

const sendMessage = () => {
  const text = messageText.value.trim();

  if (!text) return;

  props.onSendMessage(text);
  messageText.value = '';
  nextTick(() => adjustHeight());
};
</script>
