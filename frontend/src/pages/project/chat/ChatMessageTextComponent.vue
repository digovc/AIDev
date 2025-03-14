<template>
  <div class="bg-[#0d1117] p-4 rounded">
    <VMarkdownView :content="content" mode="dark"></VMarkdownView>
  </div>
</template>
<script setup>
import 'vue3-markdown/dist/style.css'
import { VMarkdownView } from 'vue3-markdown'

const props = defineProps({
  content: {
    type: String,
    required: true
  }
});
</script>
