<template>
  <div class="reasoning-container rounded pt-2 my-2 mb-6">
    <div class="flex items-center mb-2 text-red-400">
      <FontAwesomeIcon :icon="faBrain" class="mr-2"/>
      <span class="font-semibold">Thinking...</span>
    </div>
    <div class="bg-[#0d1117] p-2 rounded">
      <p class="text-gray-400 text-xs" v-html="formattedContent"/>
    </div>
  </div>
</template>
<script setup>
import 'vue3-markdown/dist/style.css'
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faBrain } from "@fortawesome/free-solid-svg-icons";
import { computed } from "vue";

const props = defineProps({
  content: {
    type: String,
    required: true
  }
});

const formattedContent = computed(() => {
  return props.content.replace(/\n/g, '<br/>');
});

</script>
