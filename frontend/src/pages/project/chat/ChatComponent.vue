<template>
  <div class="bg-gray-900 rounded-lg shadow-md p-6 h-full flex flex-col">
    <h2 class="text-2xl font-bold mb-4">Chat</h2>
    <div class="flex flex-col h-full">
      <div class="flex-grow mb-4 relative">
        <ChatConversationComponent :conversation="selectedConversation" v-if="selectedConversation"/>
      </div>

      <div class="mb-3">
        <ChatActionsComponent :conversations="conversations" :selectedConversation="selectedConversation" :onSelectConversation="selectConversation" :onCreateNewConversation="createNewConversation"/>
      </div>

      <div>
        <ChatInputComponent :onSendMessage="sendMessage" v-if="selectedConversation"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import ChatConversationComponent from './ChatConversationComponent.vue';
import ChatActionsComponent from './ChatActionsComponent.vue';
import ChatInputComponent from './ChatInputComponent.vue';
import { conversationsApi } from '@/api/conversations.api.js';
import { socketIOService } from "@/services/socket.io.js";
import { messagesApi } from "@/api/messages.api.js";

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
});

const conversations = ref([]);
const route = useRoute();
const selectedConversation = ref(null);

const sendMessage = async (text) => {
  const projectId = route.params.id;

  if (!selectedConversation.value) {
    const response = await conversationsApi.createConversation(projectId);
    selectedConversation.value = response.data;
    conversations.value.push(selectedConversation.value);
  }

  const now = new Date();

  const userMessage = {
    id: `${ now.getTime() }`,
    conversationId: selectedConversation.value.id,
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

const selectConversation = (conversation) => {
  selectedConversation.value = conversation;

  if (conversations.value.every(conv => conv.id !== conversation.id)) {
    conversations.value.push(conversation);
  }
};

const createNewConversation = async () => {
  const projectId = route.params.id;
  const response = await conversationsApi.createConversation(projectId);
  const newConversation = response.data;
  conversations.value.push(newConversation);
  selectedConversation.value = newConversation;
};

const selectConversationById = async (conversationId) => {
  const conversation = conversations.value.find(conv => conv.id === conversationId);

  if (!conversation) {
    const result = await conversationsApi.getById(conversationId);
    conversations.value.push(result.data);
  }

  selectedConversation.value = conversation;
};

const conversationCreated = (conversation) => {
  if (!props.project) {
    return;
  }

  if (!conversations.value) {
    conversations.value = [];
  }

  if (conversations.value.some(conv => conv.id === conversation.id)) {
    return;
  }

  if (props.project.id === conversation.projectId) {
    conversations.value.push(conversation);
    selectedConversation.value = conversation;
  }
};

const loadConversations = async () => {
  const projectId = route.params.id;
  const response = await conversationsApi.getConversationsByProjectId(projectId);
  conversations.value = response.data;

  if (conversations.value.length > 0) {
    const lastConversationIndex = conversations.value.length - 1;
    selectedConversation.value = conversations.value[lastConversationIndex];
  }
};

onMounted(async () => {
  await loadConversations();
  socketIOService.socket.on('conversation-created', conversationCreated);
});

onUnmounted(() => {
  socketIOService.socket.off('conversation-created', conversationCreated);
});

defineExpose({
  selectConversationById
});
</script>
