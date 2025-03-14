<template>
  <div class="rounded mb-2">
    <div v-if="block.content" class="tool-input bg-[#0d1117] p-2 rounded">
      <pre class="whitespace-pre-wrap break-words text-sm">{{ formatInput(block.content) }}</pre>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  block: {
    type: Object,
    required: true
  }
});

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
