<script setup lang="ts">
/**
 * CodeEditorModal.vue — Full-page HTML/CSS source editor
 *
 * Libraries:
 *   vue-codemirror  — Vue 3 CodeMirror 6 wrapper
 *   @codemirror/lang-html / lang-css — syntax highlighting + completion
 *   @codemirror/theme-one-dark       — dark editor theme
 *   js-beautify                      — pretty-print HTML/CSS on open
 *
 * GrapesJS API:
 *   editor.getHtml()           → current page inner HTML
 *   editor.getCss()            → all page CSS (serialised rules)
 *   editor.setComponents(html) → replace canvas from HTML string
 *   editor.setStyle(css)       → replace canvas styles from CSS string
 */
import { ref, computed, watch } from 'vue'
import { NModal, NCard, NTabs, NTabPane, NButton, NSpace, NTag } from 'naive-ui'
import { Codemirror } from 'vue-codemirror'
import { html as langHtml } from '@codemirror/lang-html'
import { css as langCss } from '@codemirror/lang-css'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from 'codemirror'
import { html_beautify, css_beautify } from 'js-beautify'
import { useEditor } from '../composables/useEditor'

// ── Props / emits ─────────────────────────────────────────────────────────────

const props = defineProps<{ show: boolean }>()
const emit  = defineEmits<{ 'update:show': [v: boolean] }>()

// ── Editor state ──────────────────────────────────────────────────────────────

const { editor } = useEditor()

const activeTab = ref<'html' | 'css'>('html')
const htmlDraft = ref('')
const cssDraft  = ref('')

/** Snapshot taken on open — used to detect dirty state and Discard */
let _snapHtml = ''
let _snapCss  = ''

const htmlDirty = computed(() => htmlDraft.value !== _snapHtml)
const cssDirty  = computed(() => cssDraft.value  !== _snapCss)
const anyDirty  = computed(() => htmlDirty.value  || cssDirty.value)

// ── Beautify options ──────────────────────────────────────────────────────────

const BEAUTIFY_HTML_OPTS: Parameters<typeof html_beautify>[1] = {
  indent_size:        2,
  indent_char:        ' ',
  wrap_line_length:   0,        // no hard wrap
  preserve_newlines:  true,
  max_preserve_newlines: 2,
  indent_inner_html:  true,
  end_with_newline:   true,
}

const BEAUTIFY_CSS_OPTS: Parameters<typeof css_beautify>[1] = {
  indent_size:      2,
  indent_char:      ' ',
  end_with_newline: true,
  newline_between_rules: true,
}

// ── CodeMirror extension sets ─────────────────────────────────────────────────

const htmlExtensions = [
  langHtml({ autoCloseTags: true, matchClosingTags: true }),
  oneDark,
  EditorView.lineWrapping,
  EditorView.theme({
    '&': { height: '100%' },
    '.cm-scroller': { overflow: 'auto', fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace", fontSize: '13px', lineHeight: '1.65' },
  }),
]

const cssExtensions = [
  langCss(),
  oneDark,
  EditorView.lineWrapping,
  EditorView.theme({
    '&': { height: '100%' },
    '.cm-scroller': { overflow: 'auto', fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace", fontSize: '13px', lineHeight: '1.65' },
  }),
]

// ── Load from editor ──────────────────────────────────────────────────────────

function loadFromEditor() {
  if (!editor.value) return

  const rawHtml = editor.value.getHtml() ?? ''
  const rawCss  = editor.value.getCss()  ?? ''

  const prettyHtml = rawHtml ? html_beautify(rawHtml, BEAUTIFY_HTML_OPTS) : ''
  const prettyCss  = rawCss  ? css_beautify(rawCss,   BEAUTIFY_CSS_OPTS)  : ''

  htmlDraft.value = prettyHtml
  cssDraft.value  = prettyCss
  _snapHtml       = prettyHtml
  _snapCss        = prettyCss
  activeTab.value = 'html'
}

watch(() => props.show, (v) => { if (v) loadFromEditor() })

// ── Apply ─────────────────────────────────────────────────────────────────────

function apply() {
  if (!editor.value) return

  if (htmlDirty.value) {
    // setComponents() internally resets the CSS model, so always
    // re-apply CSS immediately after — even if the user didn't touch it.
    editor.value.setComponents(htmlDraft.value)
    editor.value.setStyle(cssDraft.value)
  } else if (cssDirty.value) {
    editor.value.setStyle(cssDraft.value)
  }

  _snapHtml = htmlDraft.value
  _snapCss  = cssDraft.value

  emit('update:show', false)
}

function discard() {
  emit('update:show', false)
}
</script>

<template>
  <n-modal
    :show="show"
    :mask-closable="false"
    style="width: min(960px, 96vw)"
    @update:show="emit('update:show', $event)"
  >
    <n-card
      title="Edit Code"
      size="small"
      role="dialog"
      :bordered="false"
      class="code-modal-card"
      content-style="flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 0;"
      footer-style="padding: 10px 16px;"
    >
      <template #header-extra>
        <n-button text size="small" @click="discard">
          <span style="font-size: 18px; line-height: 1; opacity: 0.6;">×</span>
        </n-button>
      </template>

      <!-- Tabs -->
      <n-tabs
        v-model:value="activeTab"
        type="line"
        size="small"
        class="code-tabs"
      >
        <!-- ── HTML tab ───────────────────────────────────────────────────── -->
        <n-tab-pane name="html" display-directive="show" class="code-pane">
          <template #tab>
            <span class="flex items-center gap-1.5">
              HTML
              <n-tag
                v-if="htmlDirty"
                size="small"
                type="warning"
                :bordered="false"
                style="font-size: 10px; padding: 0 5px; height: 16px; line-height: 16px;"
              >
                modified
              </n-tag>
            </span>
          </template>

          <Codemirror
            v-model="htmlDraft"
            :extensions="htmlExtensions"
            :autofocus="activeTab === 'html'"
            class="code-editor-wrap"
          />
        </n-tab-pane>

        <!-- ── CSS tab ───────────────────────────────────────────────────── -->
        <n-tab-pane name="css" display-directive="show" class="code-pane">
          <template #tab>
            <span class="flex items-center gap-1.5">
              CSS
              <n-tag
                v-if="cssDirty"
                size="small"
                type="warning"
                :bordered="false"
                style="font-size: 10px; padding: 0 5px; height: 16px; line-height: 16px;"
              >
                modified
              </n-tag>
            </span>
          </template>

          <Codemirror
            v-model="cssDraft"
            :extensions="cssExtensions"
            :autofocus="activeTab === 'css'"
            class="code-editor-wrap"
          />
        </n-tab-pane>
      </n-tabs>

      <!-- Footer -->
      <template #footer>
        <n-space justify="end">
          <n-button size="small" @click="discard">Cancel</n-button>
          <n-button size="small" type="primary" :disabled="!anyDirty" @click="apply">
            Apply
          </n-button>
        </n-space>
      </template>
    </n-card>
  </n-modal>
</template>

<style scoped>
/* Card fills the viewport height */
.code-modal-card {
  height: min(82vh, 720px);
  display: flex;
  flex-direction: column;
}

/* Tabs flex column, fill remaining space */
.code-tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

:deep(.code-tabs .n-tabs-nav) {
  flex-shrink: 0;
  padding: 0 16px;
}

:deep(.code-tabs .n-tabs-content) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

:deep(.code-tabs .n-tabs-content-wrapper) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* Each pane fills remaining space */
.code-pane {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 !important;
}

:deep(.n-tab-pane) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0;
}

/* CodeMirror wrapper fills the pane */
.code-editor-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

:deep(.code-editor-wrap .cm-editor) {
  flex: 1;
  min-height: 0;
  height: 100%;
  border-radius: 0;
}

:deep(.code-editor-wrap .cm-editor.cm-focused) {
  outline: none;
}
</style>
