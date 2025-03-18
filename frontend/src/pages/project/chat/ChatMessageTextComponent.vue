<template>
  <div class="bg-[#0d1117] p-4 rounded" v-if="isVisible">
    <VMarkdownView :content="content" mode="dark"></VMarkdownView>
  </div>
</template>
<script setup>
import 'vue3-markdown/dist/style.css'
import { VMarkdownView } from 'vue3-markdown'
import { computed } from "vue";

const props = defineProps({
  content: {
    type: String,
    required: true
  }
});

const isVisible = computed(() => {
  return props.content.trim().length > 0;
});
</script>
