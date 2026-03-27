<script setup lang="ts">
/**
 * StyleHeader — State selector + Class manager + Apply target + CSS editor
 */
import { ref, inject, computed, nextTick, watch } from 'vue'
import { NTabs, NTab, NInput, NTag } from 'naive-ui'
import { Icon } from '@iconify/vue'
import { STYLE_CTX } from './styleContext'
import { useEditor } from '../../composables/useEditor'

const ctx = inject(STYLE_CTX)!
const { editor } = useEditor()

// ── Class input ────────────────────────────────────────────────────────────────
const adding = ref(false)
const newClass = ref('')
const inputRef = ref<InstanceType<typeof NInput> | null>(null)

async function startAdding() {
  adding.value = true
  newClass.value = ''
  await nextTick()
  inputRef.value?.focus()
}

function commitAdd() {
  const name = newClass.value.trim().replace(/^\./, '')
  if (name) ctx.addClass(name)
  adding.value = false
  newClass.value = ''
}

function cancelAdd() {
  adding.value = false
  newClass.value = ''
}

// ── Apply target ───────────────────────────────────────────────────────────────
const hasClasses = computed(() => ctx.classes.value.length > 0)

// ── CSS editor ─────────────────────────────────────────────────────────────────
const showCssEditor = ctx.showCssEditor
const cssText = ref('')
const cssEditorRef = ref<HTMLTextAreaElement | null>(null)

/** Build the CSS selector for the current target (mirrors StylePanel logic) */
function currentSelector(): string {
  const cmp = editor.value?.getSelected()
  if (!cmp) return ''
  const stateSuffix = ctx.state.value ? `:${ctx.state.value}` : ''
  if (ctx.applyMode.value === 'classes') {
    const cls = cmp.getClasses() as string[]
    return cls.length ? cls.map(c => `.${c}`).join('') + stateSuffix : `#${cmp.getId()}${stateSuffix}`
  }
  return `#${cmp.getId()}${stateSuffix}`
}

/** Read styles for the current target + device via the native StyleManager API */
function syncCssText() {
  const cmp = editor.value?.getSelected()
  if (!cmp) { cssText.value = ''; return }

  const sm = editor.value?.StyleManager
  const smSelected = sm?.getSelected()
  const styles = (smSelected?.getStyle() ?? {}) as Record<string, string>
  const selector = currentSelector()
  const mediaText = smSelected?.get('mediaText') as string | undefined

  if (mediaText) {
    const inner = Object.entries(styles).map(([k, v]) => `    ${k}: ${v};`).join('\n')
    cssText.value = `@media ${mediaText} {\n  ${selector} {\n${inner}\n  }\n}`
  } else {
    const inner = Object.entries(styles).map(([k, v]) => `  ${k}: ${v};`).join('\n')
    cssText.value = `${selector} {\n${inner}\n}`
  }
}

/** Parse CSS text and apply via the native StyleManager API (device-aware) */
function applyCssText() {
  const cmp = editor.value?.getSelected()
  if (!cmp) return

  const text = cssText.value.trim()

  // Handle @media { selector { ... } } — extract the innermost declarations block
  let declarationsText: string
  const innerBlock = text.match(/\{[^{}]*\{([\s\S]*?)\}[^{}]*\}/)
  if (innerBlock) {
    declarationsText = innerBlock[1]
  } else {
    const outerBlock = text.match(/\{([\s\S]*)\}/)
    declarationsText = outerBlock ? outerBlock[1] : text
  }

  const parsed: Record<string, string> = {}
  for (const line of declarationsText.split('\n')) {
    const idx = line.indexOf(':')
    if (idx < 0) continue
    const prop = line.slice(0, idx).trim()
    const val  = line.slice(idx + 1).replace(/;$/, '').trim()
    if (prop && val) parsed[prop] = val
  }

  // Get the current rule's styles so we can clear removed properties
  const sm = editor.value?.StyleManager
  const smSelected = sm?.getSelected()
  const currentStyles = (smSelected?.getStyle() ?? {}) as Record<string, string>
  for (const prop of Object.keys(currentStyles)) {
    if (!(prop in parsed)) ctx.clear(prop)
  }
  ctx.setMany(parsed)
}

// Sync when editor opens, context changes, or device switches (device:change → ctx.tick via StylePanel)
watch(showCssEditor, v => { if (v) syncCssText() })
watch([ctx.state, ctx.applyMode, ctx.tick], () => { if (showCssEditor.value) syncCssText() })
</script>

<template>
  <div class="border-b border-[var(--editor-surface-border)] pb-2 pt-1 px-3 space-y-2">

    <!-- Row 1: Pseudo-state selector -->
    <n-tabs
      :value="ctx.state.value"
      type="segment"
      size="small"
      @update:value="ctx.setState"
    >
      <n-tab name="" title="No pseudo-state">
        <span class="flex items-center gap-1 text-[11px]">
          <Icon icon="lucide:mouse-pointer-off" :size="12" />
          Neutral
        </span>
      </n-tab>
      <n-tab name="hover" title=":hover state">
        <span class="flex items-center gap-1 text-[11px]">
          <Icon icon="lucide:mouse-pointer" :size="12" />
          Hover
        </span>
      </n-tab>
      <n-tab name="focus" title=":focus state">
        <span class="flex items-center gap-1 text-[11px]">
          <Icon icon="lucide:focus" :size="12" />
          Focused
        </span>
      </n-tab>
    </n-tabs>

    <!-- Row 2: Class manager -->
    <div class="flex items-center gap-1.5 flex-wrap min-h-[26px]">
      <n-tag
        v-for="cls in ctx.classes.value"
        :key="cls"
        size="small"
        closable
        @close="ctx.removeClass(cls)"
      >
        .{{ cls }}
      </n-tag>

      <n-input
        v-if="adding"
        ref="inputRef"
        v-model:value="newClass"
        size="tiny"
        placeholder="class-name"
        style="width: 90px"
        @blur="commitAdd"
        @keydown="(e: KeyboardEvent) => { if (e.key === 'Enter') commitAdd(); else if (e.key === 'Escape') cancelAdd() }"
      />
      <button
        v-else
        class="flex items-center justify-center w-5 h-5 rounded
               border border-dashed border-[var(--editor-surface-border)]
               text-[var(--editor-text-subtle)] hover:text-[var(--editor-text)]
               hover:border-[var(--editor-text-subtle)] transition-colors"
        title="Add class"
        @click="startAdding"
      >
        <Icon icon="lucide:plus" :size="11" />
      </button>
    </div>

    <!-- Row 3: Apply target + CSS editor toggle -->
    <div class="flex items-center gap-1.5">
      <button
        :class="[
          'flex items-center gap-1.5 px-2 h-6 rounded text-[11px] transition-colors border',
          ctx.applyMode.value === 'component'
            ? 'bg-[var(--editor-surface-2)] border-[var(--editor-surface-border)] text-[var(--editor-text)]'
            : 'bg-transparent border-transparent text-[var(--editor-text-subtle)] hover:text-[var(--editor-text)]',
        ]"
        title="Apply styles to this component only"
        @click="ctx.setApplyMode('component')"
      >
        <Icon icon="lucide:box" :size="12" />
        Component
      </button>

      <button
        :class="[
          'flex items-center gap-1.5 px-2 h-6 rounded text-[11px] transition-colors border',
          !hasClasses
            ? 'opacity-35 cursor-not-allowed bg-transparent border-transparent text-[var(--editor-text-subtle)]'
            : ctx.applyMode.value === 'classes'
              ? 'bg-[var(--editor-surface-2)] border-[var(--editor-surface-border)] text-[var(--editor-text)]'
              : 'bg-transparent border-transparent text-[var(--editor-text-subtle)] hover:text-[var(--editor-text)]',
        ]"
        :disabled="!hasClasses"
        title="Apply styles to the component's CSS classes"
        @click="hasClasses && ctx.setApplyMode('classes')"
      >
        <Icon icon="lucide:hash" :size="12" />
        Classes
      </button>

      <!-- CSS editor toggle -->
      <button
        :class="[
          'ml-auto flex items-center justify-center w-6 h-6 rounded transition-colors border',
          showCssEditor
            ? 'bg-[var(--editor-surface-2)] border-[var(--editor-surface-border)] text-[var(--editor-text)]'
            : 'bg-transparent border-transparent text-[var(--editor-text-subtle)] hover:text-[var(--editor-text)]',
        ]"
        title="Edit CSS"
        @click="showCssEditor = !showCssEditor"
      >
        <Icon icon="gravity-ui:curly-brackets" :size="13" />
      </button>
    </div>

    <!-- CSS editor panel -->
    <div v-if="showCssEditor" class="rounded overflow-hidden border border-[var(--editor-surface-border)]">
      <textarea
        ref="cssEditorRef"
        v-model="cssText"
        class="w-full font-mono text-[11px] leading-relaxed resize-none outline-none
               bg-[#1a1a2e] text-[#a9dc76] p-2 block"
        style="min-height: 140px; tab-size: 2;"
        spellcheck="false"
        @keydown="(e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); applyCssText() } }"
        @blur="applyCssText"
      />
      <div class="flex items-center justify-between px-2 py-1
                  bg-[var(--editor-surface-1)] border-t border-[var(--editor-surface-border)]">
        <span class="text-[10px] text-[var(--editor-text-subtle)]">Ctrl+Enter 应用</span>
        <button
          class="text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
          @click="applyCssText"
        >
          Apply
        </button>
      </div>
    </div>

  </div>
</template>
