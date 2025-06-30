<template>
  <dialog ref="dialogRef" class="p-0 rounded-lg shadow-lg bg-gray-900 text-white" @click="handleClick">
    <div class="w-full h-full flex flex-col gap-2">
      <div class="flex justify-between items-center p-2 text-gray-300">
        <div class="text-sm cursor-pointer hover:text-gray-100" @click="copyPathToClipboard">
          {{ file.path }}
        </div>
        <div class="flex justify-between items-center px-2 text-gray-400 gap-4">
          <FontAwesomeIcon :icon="faRightLeft" @click="toggleSplitView" class="text-gray-400 hover:text-gray-300 cursor-pointer"/>
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
import { nextTick, ref } from "vue";
import { gitApi } from "@/api/git.api.js";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { faRightLeft, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { languageDetector } from "@/services/language.detector.js";
import "@/services/monaco.worker.js";
import { shortcutService } from "@/services/shortcut.service.js";

const props = defineProps({
  task: {
    type: Object
  },
  file: {
    type: Object
  }
});

const dialogRef = ref(null);
const versions = ref();
const editorContainer = ref();
let monacoDiffEditor = null;
const isSplitView = ref(false);

const toggleSplitView = () => {
  isSplitView.value = !isSplitView.value;
  monacoDiffEditor.updateOptions({
    renderSideBySide: isSplitView.value
  });
};

let originalModelInstance = null;
let modifiedModelInstance = null;

const initEditor = () => {
  if (!editorContainer.value || !versions.value) {
    console.warn("Editor container or versions not ready for editor initialization.");
    return;
  }

  const language = languageDetector.getLanguage(props.file.path);

  originalModelInstance = monaco.editor.createModel(versions.value.previous, language);
  modifiedModelInstance = monaco.editor.createModel(versions.value.current, language);

  monacoDiffEditor = monaco.editor.createDiffEditor(
      editorContainer.value,
      {
        enableSplitViewResizing: false,
        readOnly: true,
        renderSideBySide: isSplitView.value,
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

const copyPathToClipboard = () => {
  navigator.clipboard.writeText(props.file.path);
};

const handleEditorMouseDown = (event, editorInstance) => {
  const target = event.target;
  if (target.type !== monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS) return;
  if (!target.position) return;

  const lineNumber = target.position.lineNumber;
  const model = editorInstance.getModel();
  const lineContent = model ? model.getLineContent(lineNumber) : '';
  const lineTrimmedContent = lineContent.trim();

  const textToCopy = `Ref: ${ props.file.path }\nLine ${ lineNumber }: ${ lineTrimmedContent }`;
  navigator.clipboard.writeText(textToCopy);
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

const handleClose = () => {
  close();
};

const open = async () => {
  shortcutService.on('close', handleClose);
  await nextTick();
  await loadVersions();
  initEditor();

  dialogRef.value.showModal();
};

const close = () => {
  shortcutService.off('close', handleClose);
  monacoDiffEditor?.dispose();
  originalModelInstance?.dispose();
  modifiedModelInstance?.dispose();

  monacoDiffEditor = null;
  originalModelInstance = null;
  modifiedModelInstance = null;


  dialogRef.value.close();
};

const handleClick = (event) => {
  if (event.target === dialogRef.value) {
    close();
  }
}

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
  width: 90vw;
  height: 90vh;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
}
</style>
