<template>
  <div class="relative h-full">
    <div class="absolute inset-0 overflow-y-auto" ref="messagesContainer">
      <div v-if="conversation && messages && messages.length > 0" class="pr-2">
        <ChatMessageComponent v-for="message in messages" :key="message.id" :message="message"/>
      </div>
      <div v-else class="text-gray-500 italic h-full flex items-center justify-center">Histórico de mensagens aparecerá
        aqui
      </div>
    </div>
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

const loadMessages = async () => {
  const result = await messagesApi.getMessagesByConversationId(props.conversation.id);
  messages.value = result.data;
  await scrollToBottom();
};

const scrollToBottom = async (immediate = true) => {
  await nextTick();
  if (!messagesContainer.value) {
    return;
  }

  if (immediate) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  } else {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: 'smooth'
    });
  }
};

const messageSaved = (message) => {
  if (message.conversationId !== props.conversation.id) {
    return;
  }

  if (!messages.value) {
    messages.value = [];
  }

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
