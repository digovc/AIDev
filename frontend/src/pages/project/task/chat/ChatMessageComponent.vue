<template>
  <div v-if="!isInvisible" class="mb-3 p-3 rounded" :class="isUser ? 'bg-gray-800' : 'bg-gray-700'">
    <div class="flex justify-between mb-1">
      <div class="font-bold space-x-2" :class="isUser ? 'text-blue-400' : 'text-green-400'">
        <FontAwesomeIcon :icon="icon"/>
        <span>{{ sender }}</span>
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-xs text-gray-500">
          {{ formatTime(message.timestamp) }}
        </span>
        <button @click="$emit('delete', message.id)" class="text-gray-400 hover:text-red-400">
          <FontAwesomeIcon :icon="faTrash"/>
        </button>
        <button @click="copyMessageContent" class="text-gray-400 hover:text-blue-400 ml-2">
          <FontAwesomeIcon :icon="faCopy"/>
        </button>
      </div>
    </div>
    <div v-for="(block, index) in message.blocks" :key="index" class="text-gray-300 overflow-y-auto">
      <div v-if="block.type === 'reasoning'">
        <ChatMessageReasoningComponent :content="block.content"/>
      </div>
      <div v-if="block.type === 'text'">
        <ChatMessageTextComponent :content="block.content"/>
      </div>
      <div v-if="block.type === 'tool_use'">
        <ChatMessageToolComponent :block="block"/>
      </div>
      <div v-if="block.type === 'tool_result'">
        <ChatMessageToolResultComponent :block="block"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { faFileLines, faQuestion, faRobot, faServer, faToolbox, faUser, faTrash, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import ChatMessageTextComponent from "@/pages/project/task/chat/ChatMessageTextComponent.vue";
import ChatMessageToolComponent from "@/pages/project/task/chat/ChatMessageToolComponent.vue";
import ChatMessageToolResultComponent from "@/pages/project/task/chat/ChatMessageToolResultComponent.vue";
import ChatMessageReasoningComponent from "@/pages/project/task/chat/ChatMessageReasoningComponent.vue";

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
});

const sender = computed(() => {
  switch (props.message.sender) {
    case 'user':
      return 'Você';
    case 'assistant':
      return 'AIDev';
    case 'tool':
      return 'Resultado';
    case 'system':
    case 'user_system':
      return 'Sistema';
    case 'log':
      return 'Log';
    default:
      return props.message.sender;
  }
});

const icon = computed(() => {
  switch (props.message.sender) {
    case 'user':
      return faUser;
    case 'assistant':
      return faRobot;
    case 'tool':
      return faToolbox;
    case 'system':
    case 'user_system':
      return faServer;
    case 'log':
      return faFileLines;
    default:
      return faQuestion;
  }
});

const isUser = computed(() => props.message.sender === 'user');

const isInvisible = computed(() => {
  if (['system', 'user_system'].includes(props.message.sender)) {
    return true
  }

  if (props.message.blocks.length === 0) {
    return true;
  }
});

const formatTime = (timestamp) => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const copyMessageContent = () => {
  const messageContent = props.message.blocks.map(block => block.content).join('\n');
  navigator.clipboard.writeText(messageContent).then(() => {
    // Optional: Show a notification or tooltip here
  }).catch(err => {
    console.error('Failed to copy message content:', err);
  });
};
</script>
