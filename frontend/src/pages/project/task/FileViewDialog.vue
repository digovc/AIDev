<template>
  <dialog ref="dialogRef" class="p-0 rounded-lg shadow-lg bg-gray-900 text-white">
    <div class="w-full h-full flex flex-col gap-2">
      <div class="flex justify-between items-center p-2 text-gray-300">
        <div class="text-sm cursor-pointer hover:text-gray-100" @click="copyPathToClipboard">
          {{ file.path }}
        </div>
        <div class="flex justify-between items-center px-2 text-gray-400 gap-4">
          <FontAwesomeIcon :icon="faTimes" @click="close" class="text-gray-400 hover:text-gray-300 cursor-pointer"/>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto relative mx-2 mb-2">
        <div class="absolute inset-0">
          <div ref="editorContainer" class="h-full"/>
        </div>
      </div>
    </div>
  </dialog>
</template>

<script setup>
import { nextTick, onUnmounted, ref } from "vue";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { languageDetector } from "@/services/language.detector.js";
import "@/services/monaco.worker.js";
import { filesApi } from "@/api/files.api.js";
import { useRoute } from "vue-router";

const props = defineProps({
  file: {
    type: Object,
    required: true
  }
});

const dialogRef = ref(null);
const content = ref('');
const editorContainer = ref();
const route = useRoute();

let monacoEditor = null;
let model = null;

const open = async () => {
  await nextTick();
  await loadFile();
  dialogRef.value.showModal();
  initEditor();
};

const close = () => {
  dialogRef.value.close();
};

const initEditor = () => {
  if (!editorContainer.value) {
    return;
  }

  const language = languageDetector.getLanguage(props.file.path);

  if (model) {
    model.dispose();
  }

  model = monaco.editor.createModel(
      content.value,
      language
  );

  if (monacoEditor) {
    monacoEditor.dispose();
  }

  monacoEditor = monaco.editor.create(
      editorContainer.value,
      {
        readOnly: true,
        roundedSelection: false,
        scrollBeyondLastLine: false,
        theme: "vs-dark",
        automaticLayout: true,
      }
  );

  monacoEditor.setModel(model);
};

const copyPathToClipboard = () => {
  navigator.clipboard.writeText(props.file.path);
};

const loadFile = async () => {
  if (!props.file || !props.file.path) {
    return;
  }
  try {
    const taskId = route.params.taskId;
    const response = await filesApi.getFileContent(taskId, props.file.path);
    content.value = response.data.content;
  } catch (error) {
    console.error('Failed to fetch file content:', error);
    content.value = '';
  }
};

onUnmounted(() => {
  if (monacoEditor) {
    monacoEditor.dispose();
    monacoEditor = null;
  }
  if (model) {
    model.dispose();
    model = null;
  }
});

defineExpose({
  open
});
</script>

<style scoped>
dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

dialog {
  border: none;
  width: 80vw;
  height: 80vh;
  max-width: 90vw;
  max-height: 90vh;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
}
</style>
