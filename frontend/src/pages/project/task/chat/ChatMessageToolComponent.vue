<template>
  <div class="tool-use-container rounded pt-2 my-2">
    <div class="flex items-center mb-1 cursor-pointer" @click="toggleExpanded">
      <FontAwesomeIcon :icon="getToolIcon(block.tool)" class="mr-2 text-yellow-500"/>
      <span class="font-semibold text-yellow-500">{{ toolName }}</span>
      <FontAwesomeIcon :icon="isExpanded ? faChevronUp : faChevronDown" class="ml-auto text-gray-400 text-sm"/>
    </div>
    <div class="flex items-center mb-1 cursor-pointer" @click="toggleExpanded" v-if="block.content">
      <span class="text-xs text-gray-500 font-semibold">PARÂMETROS</span>
      <FontAwesomeIcon :icon="isExpanded ? faChevronUp : faChevronDown" class="ml-2 text-gray-400 text-xs"/>
    </div>
    <div v-if="isExpanded && block.content" class="tool-input bg-[#0d1117] p-2 rounded">
      <pre class="whitespace-pre-wrap break-words text-gray-400 text-xs">{{ formatInput(block.content) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faFileCirclePlus,
  faListCheck,
  faListUl,
  faTools
} from "@fortawesome/free-solid-svg-icons";

const props = defineProps({
  block: {
    type: Object,
    required: true
  }
});

const isExpanded = ref(false);

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

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
