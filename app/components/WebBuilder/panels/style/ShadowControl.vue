<script setup lang="ts">
/**
 * ShadowControl — Multi-layer box-shadow / text-shadow editor
 *
 * Parses the CSS shadow string into individual layers.
 * Each layer: inset? x y blur spread color
 *
 * Emits the re-serialized CSS string on change.
 */
import { ref, computed, watch } from 'vue'
import { NInput, NInputNumber, NButton, NCheckbox, NDivider } from 'naive-ui'
import ColorPicker from './ColorPicker.vue'

const props = defineProps<{
  /** Full CSS value, e.g. "2px 4px 8px 0px rgba(0,0,0,0.2), inset 0 0 4px #fff" */
  value: string
  /** 'box' includes spread + inset; 'text' omits them */
  type?: 'box' | 'text'
}>()

const emit = defineEmits<{
  change: [value: string]
}>()

// ── Shadow layer type ─────────────────────────────────────────────────────────

interface ShadowLayer {
  inset: boolean
  x: string
  y: string
  blur: string
  spread: string
  color: string
}

function defaultLayer(): ShadowLayer {
  return { inset: false, x: '2px', y: '2px', blur: '4px', spread: '0px', color: 'rgba(0,0,0,0.2)' }
}

// ── Parse / serialize ─────────────────────────────────────────────────────────

/**
 * Split by top-level commas (not inside parentheses).
 */
function splitTopLevel(value: string): string[] {
  const parts: string[] = []
  let depth = 0
  let buf = ''
  for (const ch of value) {
    if (ch === '(') depth++
    else if (ch === ')') depth--
    if (ch === ',' && depth === 0) {
      const s = buf.trim()
      if (s) parts.push(s)
      buf = ''
    } else {
      buf += ch
    }
  }
  if (buf.trim()) parts.push(buf.trim())
  return parts
}

function parseLayer(s: string): ShadowLayer {
  let rest = s.trim()
  const inset = rest.startsWith('inset')
  if (inset) rest = rest.slice(5).trim()

  // Extract trailing color (rgb/rgba/hsl/hsla/hex/named)
  const colorRe = /(rgba?\s*\([^)]+\)|hsla?\s*\([^)]+\)|#[0-9a-fA-F]{3,8})\s*$/
  let color = 'rgba(0,0,0,0.2)'
  const colorMatch = colorRe.exec(rest)
  if (colorMatch) {
    color = colorMatch[1]!
    rest = rest.slice(0, colorMatch.index).trim()
  }

  const parts = rest.split(/\s+/)
  return {
    inset,
    x:      parts[0] ?? '0px',
    y:      parts[1] ?? '0px',
    blur:   parts[2] ?? '0px',
    spread: parts[3] ?? '0px',
    color,
  }
}

function serializeLayer(l: ShadowLayer, isBox: boolean): string {
  const parts: string[] = []
  if (isBox && l.inset) parts.push('inset')
  parts.push(l.x, l.y, l.blur)
  if (isBox) parts.push(l.spread)
  parts.push(l.color)
  return parts.join(' ')
}

function parseLayers(value: string): ShadowLayer[] {
  if (!value || value === 'none') return []
  return splitTopLevel(value).map(parseLayer)
}

function serializeLayers(layers: ShadowLayer[]): string {
  const isBox = props.type !== 'text'
  if (layers.length === 0) return 'none'
  return layers.map(l => serializeLayer(l, isBox)).join(', ')
}

// ── State ─────────────────────────────────────────────────────────────────────

const layers = ref<ShadowLayer[]>(parseLayers(props.value))

watch(() => props.value, (v) => {
  layers.value = parseLayers(v)
}, { immediate: false })

function commit() {
  emit('change', serializeLayers(layers.value))
}

function addLayer() {
  layers.value = [...layers.value, defaultLayer()]
  commit()
}

function removeLayer(i: number) {
  layers.value = layers.value.filter((_, idx) => idx !== i)
  commit()
}

function updateField(i: number, field: keyof ShadowLayer, val: string | boolean) {
  layers.value = layers.value.map((l, idx) =>
    idx === i ? { ...l, [field]: val } : l,
  )
  commit()
}

const isBox = computed(() => props.type !== 'text')
</script>

<template>
  <div>
    <!-- Layer list -->
    <div v-for="(layer, i) in layers" :key="i" class="mb-2">
      <!-- Layer header -->
      <div class="flex items-center mb-1">
        <span class="text-xs text-[var(--editor-text-muted)]">Layer {{ i + 1 }}</span>
        <div class="flex items-center gap-2">
          <n-checkbox
            v-if="isBox"
            :checked="layer.inset"
            size="small"
            @update:checked="v => updateField(i, 'inset', v)"
          >
            <span class="text-xs">Inset</span>
          </n-checkbox>
          <button
            type="button"
            class="text-[var(--editor-text-subtle)] hover:text-red-400 text-xs transition-colors"
            @click="removeLayer(i)"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- X / Y / Blur / Spread -->
      <div class="grid grid-cols-2 gap-1 mb-1">
        <div>
          <span class="text-[9px] text-[var(--editor-text-subtle)] uppercase tracking-wide">X</span>
          <n-input
            :value="layer.x"
            size="small"
            placeholder="0px"
            @update:value="v => updateField(i, 'x', v)"
            @blur="commit"
          />
        </div>
        <div>
          <span class="text-[9px] text-[var(--editor-text-subtle)] uppercase tracking-wide">Y</span>
          <n-input
            :value="layer.y"
            size="small"
            placeholder="0px"
            @update:value="v => updateField(i, 'y', v)"
            @blur="commit"
          />
        </div>
        <div>
          <span class="text-[9px] text-[var(--editor-text-subtle)] uppercase tracking-wide">Blur</span>
          <n-input
            :value="layer.blur"
            size="small"
            placeholder="0px"
            @update:value="v => updateField(i, 'blur', v)"
            @blur="commit"
          />
        </div>
        <div v-if="isBox">
          <span class="text-[9px] text-[var(--editor-text-subtle)] uppercase tracking-wide">Spread</span>
          <n-input
            :value="layer.spread"
            size="small"
            placeholder="0px"
            @update:value="v => updateField(i, 'spread', v)"
            @blur="commit"
          />
        </div>
      </div>

      <!-- Color -->
      <ColorPicker
        :value="layer.color"
        :actions="['confirm']"
        @confirm="v => updateField(i, 'color', v)"
      />

      <n-divider v-if="i < layers.length - 1" style="margin: 6px 0" />
    </div>

    <!-- Add layer -->
    <n-button
      size="small"
      block
      dashed
      @click="addLayer"
    >
      + Add {{ isBox ? 'Shadow' : 'Text Shadow' }}
    </n-button>
  </div>
</template>
