<template>
  <div class="rounded mb-2">
    <div class="flex items-center mb-1 cursor-pointer" @click="toggleExpanded" v-if="block.content">
      <span class="text-xs text-gray-500 font-semibold">DETALHES</span>
      <FontAwesomeIcon :icon="isExpanded ? faChevronUp : faChevronDown" class="ml-2 text-gray-400 text-xs"/>
    </div>
    <div v-if="isExpanded && block.content" class="tool-input bg-[#0d1117] p-2 rounded">
      <pre class="whitespace-pre-wrap break-words text-xs text-gray-400">{{ formatInput(block.content) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

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
