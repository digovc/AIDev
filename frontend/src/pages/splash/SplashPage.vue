<template>
  <div class="h-full flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold">AI Dev</h1>
      <p class="text-lg">Your AI development partner</p>
    </div>
  </div>
</template>
<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  setTimeout(() => {
    router.push('/home')
  }, 1000)
})
</script>
