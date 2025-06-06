<template>
  <div class="h-screen bg-black text-gray-100">
    <RouterView/>
  </div>
</template>
<script setup>
import { onMounted } from 'vue';
import { shortcutService } from "@/services/shortcut.service.js";

onMounted(() => {
  shortcutService.init();
});
</script>
