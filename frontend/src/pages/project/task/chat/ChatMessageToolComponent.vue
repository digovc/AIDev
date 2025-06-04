<template>
  <div class="tool-use-container rounded pt-2 my-2">
    <div class="flex items-center mb-2">
      <FontAwesomeIcon :icon="getToolIcon(block.tool)" class="mr-2 text-yellow-500"/>
      <span class="font-semibold text-yellow-500">{{ toolName }}</span>
    </div>
    <div v-if="block.content" class="tool-input bg-[#0d1117] p-2 rounded">
      <pre class="whitespace-pre-wrap break-words text-gray-400 text-xs">{{ formatInput(block.content) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faFileCirclePlus, faListCheck, faListUl, faTools } from "@fortawesome/free-solid-svg-icons";

const props = defineProps({
  block: {
    type: Object,
    required: true
  }
});

const toolName = computed(() => {
  // Verifica se block.tool existe e retorna um nome amigável
  switch (props.block.tool) {
    case 'write_file':
      return 'Escrever Arquivo';
    case 'list_files':
      return 'Listar Arquivos';
    case 'list_tasks':
      return 'Listar Tarefas';
    default:
      return props.block.tool || 'Ferramenta';
  }
});

const getToolIcon = (toolName) => {
  switch (toolName) {
    case 'write_file':
      return faFileCirclePlus;
    case 'list_files':
      return faListUl;
    case 'list_tasks':
      return faListCheck;
    default:
      return faTools;
  }
};

const formatInput = (input) => {
  try {
    if (typeof input === 'string') {
      // Tenta fazer parse se for uma string JSON
      return JSON.stringify(JSON.parse(input), null, 2);
    } else {
      // Se já for um objeto, apenas formata
      return JSON.stringify(input, null, 2);
    }
  } catch (e) {
    // Se não for um JSON válido, retorna como está
    return input;
  }
};
</script>
