<template>
  <div v-if="task" class="flex flex-col h-full">
    <div class="flex-grow relative">
      <ChatConversationComponent :conversation="conversation" v-if="conversation"/>
      <div v-else class="text-center text-gray-400 h-full flex justify-center items-center italic text-sm">
        Nenhuma mensagem trocada
      </div>
    </div>
    <div>
      <ChatInputComponent :onSendMessage="sendMessage" v-if="conversation"/>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import ChatConversationComponent from './ChatConversationComponent.vue';
import ChatInputComponent from './ChatInputComponent.vue';
import { conversationsApi } from '@/api/conversations.api.js';
import { messagesApi } from "@/api/messages.api.js";

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  task: {
    type: Object
  }
});

const route = useRoute();
const conversation = ref(null);

watch(() => props.task, async () => {
  if (!props.task) {
    conversation.value = null;
    return;
  }

  if (!props.task.conversationId) {
    conversation.value = null;
    return;
  }

  if (conversation.value && conversation.value.id === props.task.conversationId) return;

  const response = await conversationsApi.getById(props.task.conversationId);
  conversation.value = response.data;
}, { deep: true, immediate: true });

const sendMessage = async (text) => {
  const projectId = route.params.id;

  if (!conversation.value) {
    const response = await conversationsApi.createConversation(projectId);
    conversation.value = response.data;
  }

  const now = new Date();

  const userMessage = {
    id: `${ now.getTime() }`,
    conversationId: conversation.value.id,
    sender: 'user',
    timestamp: now.toISOString(),
    blocks: [
      {
        id: `${ now.getTime() + 1 }`,
        type: 'text',
        content: text
      }
    ]
  };

  await messagesApi.sendMessage(userMessage);
};
</script>
