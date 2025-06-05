<template>
  <div class="h-full bg-gray-900 flex flex-col gap-2">
    <div class="flex justify-between items-center px-2 text-gray-300">
      <div class="text-sm">
        {{ file.path }}
      </div>
      <div class="flex justify-between items-center px-2 text-gray-400">
        <FontAwesomeIcon :icon="faTimes" @click="$emit('close')" class="text-gray-400 hover:text-gray-300 cursor-pointer"/>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto relative">
      <div class="absolute inset-0">
        <div ref="editorContainer" class="h-full"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
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

const emit = defineEmits(['close', 'line-click']);

const versions = ref();
const editorContainer = ref();
let monacoDiffEditor = null;

// Mantenha referências aos modelos para fácil acesso se necessário,
// embora possamos obtê-los dos editores também.
let originalModelInstance = null;
let modifiedModelInstance = null;

const initEditor = () => {
  if (!editorContainer.value || !versions.value) {
    console.warn("Editor container or versions not ready for editor initialization.");
    return;
  }

  const language = languageDetector.getLanguage(props.file.path);

  // Limpar modelos anteriores, se existirem
  if (originalModelInstance) {
    originalModelInstance.dispose();
    originalModelInstance = null;
  }

  if (modifiedModelInstance) {
    modifiedModelInstance.dispose();
    modifiedModelInstance = null;
  }

  originalModelInstance = monaco.editor.createModel(
      versions.value.previous,
      language
  );

  modifiedModelInstance = monaco.editor.createModel(
      versions.value.current,
      language
  );

  if (monacoDiffEditor) {
    monacoDiffEditor.dispose();
  }

  monacoDiffEditor = monaco.editor.createDiffEditor(
      editorContainer.value,
      {
        enableSplitViewResizing: false,
        readOnly: true,
        renderSideBySide: false,
        roundedSelection: false,
        scrollBeyondLastLine: false,
        theme: "vs-dark",
        automaticLayout: true,
      }
  );

  monacoDiffEditor.setModel({
    original: originalModelInstance,
    modified: modifiedModelInstance,
  });

  const originalEditor = monacoDiffEditor.getOriginalEditor();
  const modifiedEditor = monacoDiffEditor.getModifiedEditor();

  originalEditor.onMouseDown(e => handleEditorMouseDown(e, originalEditor, 'original'));
  modifiedEditor.onMouseDown(e => handleEditorMouseDown(e, modifiedEditor, 'modified'));
};

const handleEditorMouseDown = (event, editorInstance, editorType) => {
  const target = event.target;
  if (target.type !== monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS) return;
  if (!target.position) return;

  const lineNumber = target.position.lineNumber;
  const model = editorInstance.getModel();
  const lineContent = model ? model.getLineContent(lineNumber) : '';
  console.log(`Clique na linha ${ lineNumber } do editor ${ editorType }. Conteúdo: "${ lineContent }"`);

  emit('line-click', {
    file: props.file,
    lineNumber: lineNumber,
    lineContent: lineContent
  });
};

const loadVersions = async () => {
  try {
    const response = await gitApi.getContentVersions(props.task.id, props.file.path);
    versions.value = response.data;
  } catch (error) {
    console.error('Failed to fetch file versions:', error);
    versions.value = null;
  }
};

onMounted(async () => {
  await loadVersions();

  if (versions.value) {
    initEditor();
  }
});

onUnmounted(() => {
  disposables.forEach(d => d.dispose());
  disposables.length = 0;

  if (monacoDiffEditor) {
    monacoDiffEditor.dispose();
    monacoDiffEditor = null;
  }

  if (originalModelInstance) {
    originalModelInstance.dispose();
    originalModelInstance = null;
  }

  if (modifiedModelInstance) {
    modifiedModelInstance.dispose();
    modifiedModelInstance = null;
  }
});
</script>
