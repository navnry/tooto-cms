<script setup lang="ts">
/**
 * CustomCssSection — Free-form CSS textarea for global rules
 *
 * Strategy:
 *   "Custom" rules = all CssRules where getComponent() is null AND selector is not ':root'.
 *   These are rules NOT tied to any specific component — i.e. global class/element rules.
 *
 * Load:  collect matching rules → join with rule.toCSS()
 * Save:  remove old matching rules → editor.Css.addRules(newText)
 *
 * GrapesJS serialises all CssRules in project data, so custom rules are
 * persisted automatically with Save.
 */
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useEditor } from '../../composables/useEditor'

import type { CssRule } from 'grapesjs'

const { editor, ready } = useEditor()

// ── State ─────────────────────────────────────────────────────────────────────

/** Text currently displayed in the textarea */
const cssText  = ref('')
/** Working copy that the user edits */
const draftCss = ref('')
/** Whether draft differs from applied */
const isDirty  = computed(() => draftCss.value !== cssText.value)

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Identify rules that are "user global CSS" (not component-bound, not :root) */
function isCustomRule(rule: CssRule): boolean {
  if (rule.getComponent()) return false
  const sel = rule.selectorsToString()
  if (sel === ':root') return false
  return true
}

// ── Read ──────────────────────────────────────────────────────────────────────

let _suppressReload = false

function loadCss() {
  if (_suppressReload || !editor.value) return
  const rules = editor.value.Css.getRules() as unknown as CssRule[]
  const text = rules
    .filter(isCustomRule)
    .map(r => r.toCSS())
    .join('\n')
  cssText.value  = text
  draftCss.value = text
}

// ── Write ─────────────────────────────────────────────────────────────────────

function applyCss() {
  if (!editor.value) return
  const ed = editor.value
  // Remove old custom rules
  const oldRules = (ed.Css.getRules() as unknown as CssRule[]).filter(isCustomRule)
  if (oldRules.length) ed.Css.remove(oldRules as unknown as Parameters<typeof ed.Css.remove>[0])
  // Add new rules
  const text = draftCss.value.trim()
  if (text) ed.Css.addRules(text)
  _suppressReload = true
  cssText.value = draftCss.value
  _suppressReload = false
}

function discardDraft() {
  draftCss.value = cssText.value
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

let _handler: (() => void) | null = null

onMounted(() => {
  const bind = () => {
    loadCss()
    _handler = () => loadCss()
    editor.value?.on('update', _handler)
  }
  if (ready.value) bind()
  else {
    const stop = watch(ready, (r) => { if (r) { bind(); stop() } })
  }
})

onBeforeUnmount(() => {
  if (_handler) editor.value?.off('update', _handler)
})
</script>

<template>
  <div class="px-3 py-2 space-y-2">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <span class="text-[10px] font-semibold uppercase tracking-widest text-[var(--editor-text-subtle)]">
        Advanced CSS
      </span>
      <div v-if="isDirty" class="flex items-center gap-1">
        <button
          type="button"
          class="
            text-[11px] text-[var(--editor-text-subtle)]
            hover:text-[var(--editor-text)] transition-colors
            px-1.5 py-0.5 rounded
            hover:bg-[var(--editor-surface-overlay)]
          "
          @click="discardDraft"
        >
          Discard
        </button>
        <button
          type="button"
          class="
            text-[11px] font-medium text-[var(--editor-accent)]
            hover:opacity-80 transition-opacity
            px-2 py-0.5 rounded
            bg-[var(--editor-accent)]/10
          "
          @click="applyCss"
        >
          Apply
        </button>
      </div>
    </div>

    <!-- Code textarea -->
    <div class="relative">
      <textarea
        v-model="draftCss"
        class="custom-css-editor"
        placeholder=".my-class {
  color: var(--primary);
  font-weight: 600;
}

h1, h2, h3 {
  font-family: var(--font-heading);
}"
        spellcheck="false"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
      />
    </div>

    <!-- Hint -->
    <p class="text-[10px] text-[var(--editor-text-subtle)] leading-relaxed">
      CSS rules apply globally to the canvas. Use
      <code class="font-mono text-[var(--editor-accent)]">var(--name)</code>
      to reference theme variables generated from the Theme sections above.
    </p>
  </div>
</template>

<style scoped>
.custom-css-editor {
  width: 100%;
  min-height: 180px;
  padding: 10px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace;
  font-size: 11.5px;
  line-height: 1.65;
  background: var(--editor-surface);
  color: var(--editor-text);
  border: 1px solid var(--editor-input-border);
  border-radius: 4px;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  tab-size: 2;
  white-space: pre;
  transition: border-color 0.15s;
}
.custom-css-editor:hover {
  border-color: var(--editor-input-hover-border);
}
.custom-css-editor:focus {
  border-color: var(--editor-accent);
}
</style>
