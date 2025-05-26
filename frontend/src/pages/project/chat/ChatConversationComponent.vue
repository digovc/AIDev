<template>
  <div class="relative h-full">
    <div class="absolute inset-0 overflow-y-auto" ref="messagesContainer" @scroll="handleScroll">
      <div v-if="conversation && messages && messages.length > 0" class="pr-2">
        <ChatMessageComponent v-for="message in messages" :key="message.id" :message="message"/>
      </div>
      <div v-else class="text-gray-500 italic h-full flex items-center justify-center">
        Histórico de mensagens aparecerá aqui
      </div>
    </div>

    <!-- Botão para retomar o scroll automático -->
    <button v-if="!autoScrollEnabled" @click="resumeAutoScroll" class="fixed bottom-38 right-18 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition">
      ↓ Ir para o final
    </button>
  </div>
</template>

<script setup>
import ChatMessageComponent from './ChatMessageComponent.vue';
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { messagesApi } from '@/api/messages.api.js';
import { socketIOService } from "@/services/socket.io.js";

const props = defineProps({
  conversation: {
    type: Object,
    default: null
  }
});

const messages = ref([]);
const messagesContainer = ref(null);
const autoScrollEnabled = ref(true);

const loadMessages = async () => {
  const result = await messagesApi.getMessagesByConversationId(props.conversation.id);
  messages.value = result.data;
  await scrollToBottom();
};

const scrollToBottom = async (immediate = true) => {
  if (!autoScrollEnabled.value) return; // Não rolar se o scroll automático estiver desativado

  await nextTick();
  if (!messagesContainer.value) return;

  if (immediate) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  } else {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth'
    });
  }
};

const handleScroll = () => {
  if (!messagesContainer.value) return;

  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
  const isAtBottom = scrollHeight - (scrollTop + clientHeight) < 50; // Margem de 50px

  autoScrollEnabled.value = isAtBottom;
};

const resumeAutoScroll = () => {
  autoScrollEnabled.value = true;
  scrollToBottom(false); // Rolar suavemente para o final
};

const messageSaved = (message) => {
  if (message.conversationId !== props.conversation.id) return;

  if (!messages.value) messages.value = [];

  if (!messages.value.find(m => m.id === message.id)) {
    messages.value.push(message);
    scrollToBottom();
  }
};

const blockCreated = (block) => {
  const message = messages.value.find(m => m.id === block.messageId);

  if (message) {
    message.blocks = message.blocks || [];
    message.blocks.push(block);
    scrollToBottom();
  }
};

const blockDelta = (block) => {
  const message = messages.value.find(m => m.id === block.messageId);

  if (message && message.blocks && message.blocks.length > 0) {
    const localBlock = message.blocks.find(b => b.id === block.id);

    if (localBlock) {
      localBlock.content += block.delta;
      scrollToBottom();
    }
  }
};

watch(() => props.conversation, async (newValue) => {
  if (newValue && newValue?.id) {
    await loadMessages();
  }
}, { immediate: true });

onMounted(async () => {
  socketIOService.socket.on('message-created', messageSaved);
  socketIOService.socket.on('message-updated', messageSaved);
  socketIOService.socket.on('block-created', blockCreated);
  socketIOService.socket.on('block-delta', blockDelta);
});

onUnmounted(() => {
  socketIOService.socket.off('message-created', messageSaved);
  socketIOService.socket.off('message-updated', messageSaved);
  socketIOService.socket.off('block-created', blockCreated);
  socketIOService.socket.off('block-delta', blockDelta);
});
</script>
