<template>
  <div class="h-full bg-gray-900 flex flex-col gap-2">
    <div class="flex justify-between items-center px-2 text-gray-300">
      <div class="text-sm">
        {{ file.path }}
      </div>
      <div class="flex justify-between items-center px-2 text-gray-400">
        <FontAwesomeIcon :icon="faTimes" @click="$emit('close')" class="text-gray-400 hover:text-gray-300"/>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto relative">
      <div class="absolute inset-0">
        <div ref="editor" class="h-full"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { gitApi } from "@/api/git.api.js";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { languageDetector } from "@/services/language.detector.js";
import "@/services/monaco.worker.js";

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  file: {
    type: Object,
    required: true
  }
});

const versions = ref();
const editor = ref();

const initEditor = () => {
  const language = languageDetector.getLanguage(props.file.path);

  const originalModel = monaco.editor.createModel(
      versions.value.previous,
      language
  );

  const modifiedModel = monaco.editor.createModel(
      versions.value.current,
      language
  );

  const diffEditor = monaco.editor.createDiffEditor(
      editor.value,
      {
        enableSplitViewResizing: false,
        readOnly: true,
        renderSideBySide: false,
        roundedSelection: false,
        scrollBeyondLastLine: false,
        theme: "vs-dark",
      }
  );

  diffEditor.setModel({
    original: originalModel,
    modified: modifiedModel,
  });
};

const loadVersions = async () => {
  try {
    const response = await gitApi.getContentVersions(props.task.id, props.file.path);
    versions.value = response.data;
  } catch (error) {
    console.error('Failed to fetch file versions:', error);
  }
};

onMounted(async () => {
  await loadVersions();
  initEditor();
});
</script>
