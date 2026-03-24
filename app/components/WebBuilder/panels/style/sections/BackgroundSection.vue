<script setup lang="ts">
/**
 * BackgroundSection — background-color, image/gradient, size, position, repeat
 */
import { computed, inject, ref } from 'vue'
import { NSelect, NInput } from 'naive-ui'
import PropLabel from '../PropLabel.vue'
import { STYLE_CTX } from '../styleContext'
import ColorPicker from '../ColorPicker.vue'

const ctx = inject(STYLE_CTX)!

const BG_SIZE_OPTIONS = [
  { value: 'auto',      label: 'Auto' },
  { value: 'cover',     label: 'Cover' },
  { value: 'contain',   label: 'Contain' },
  { value: '100% 100%', label: 'Stretch' },
  { value: '100%',      label: '100% wide' },
]

const BG_POSITION_OPTIONS = [
  { value: 'center',       label: 'Center' },
  { value: 'top',          label: 'Top' },
  { value: 'bottom',       label: 'Bottom' },
  { value: 'left',         label: 'Left' },
  { value: 'right',        label: 'Right' },
  { value: 'top left',     label: 'Top Left' },
  { value: 'top right',    label: 'Top Right' },
  { value: 'bottom left',  label: 'Bottom Left' },
  { value: 'bottom right', label: 'Bottom Right' },
]

const BG_REPEAT_OPTIONS = [
  { value: 'no-repeat', label: 'No Repeat' },
  { value: 'repeat',    label: 'Repeat (tile)' },
  { value: 'repeat-x',  label: 'Repeat X' },
  { value: 'repeat-y',  label: 'Repeat Y' },
  { value: 'space',     label: 'Space' },
  { value: 'round',     label: 'Round' },
]

const BG_CLIP_OPTIONS = [
  { value: 'border-box',  label: 'Border Box' },
  { value: 'padding-box', label: 'Padding Box' },
  { value: 'content-box', label: 'Content Box' },
  { value: 'text',        label: 'Text (clip to text)' },
]

const BG_ATTACHMENT_OPTIONS = [
  { value: 'scroll', label: 'Scroll (default)' },
  { value: 'fixed',  label: 'Fixed (parallax)' },
  { value: 'local',  label: 'Local' },
]

const bgColor = computed(() => ctx.get('background-color') || 'transparent')
const bgImage = computed(() => ctx.get('background-image') || '')


// Simple gradient builder
const gradStart   = ref('#3b82f6')
const gradEnd     = ref('#8b5cf6')
const gradAngle   = ref(135)

function applyGradient() {
  ctx.set('background-image', `linear-gradient(${gradAngle.value}deg, ${gradStart.value}, ${gradEnd.value})`)
}
</script>

<template>
  <div class="space-y-2">
    <!-- Color -->
    <div>
      <PropLabel label="Color" prop="background-color" />
      <ColorPicker
        :value="bgColor"
        @confirm="v => ctx.set('background-color', v)"
        @clear="() => ctx.clear('background-color')"
      />
    </div>

    <!-- Image / Gradient -->
    <div>
      <PropLabel label="Image / Gradient" prop="background-image" />
      <n-input :value="bgImage" size="small" :placeholder="ctx.getPlaceholder('background-image') || 'url(...) or linear-gradient(...)'"
        @blur="e => ctx.set('background-image', (e.target as HTMLInputElement).value)" />
    </div>

    <!-- Quick gradient builder -->
    <div class="rounded border border-[var(--editor-surface-border)] p-2 space-y-2">
      <p class="text-xs text-[var(--editor-text-subtle)] uppercase tracking-wide">Quick Gradient</p>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <p class="prop-label">From</p>
          <ColorPicker
            v-model:value="gradStart"
            :actions="['confirm']"
            @confirm="applyGradient"
          />
        </div>
        <div>
          <p class="prop-label">To</p>
          <ColorPicker
            v-model:value="gradEnd"
            :actions="['confirm']"
            @confirm="applyGradient"
          />
        </div>
      </div>
      <div>
        <p class="prop-label">Angle: {{ gradAngle }}°</p>
        <input type="range" :value="gradAngle" min="0" max="360"
          class="w-full accent-blue-500"
          @input="e => { gradAngle = Number((e.target as HTMLInputElement).value); applyGradient() }" />
      </div>
    </div>

    <!-- Size + Position -->
    <div class="grid grid-cols-2 gap-2">
      <div>
        <PropLabel label="Size" prop="background-size" />
        <n-select :value="ctx.get('background-size') || 'auto'" :options="BG_SIZE_OPTIONS" size="small"
          @update:value="v => ctx.set('background-size', v)" />
      </div>
      <div>
        <PropLabel label="Position" prop="background-position" />
        <n-select :value="ctx.get('background-position') || 'center'" :options="BG_POSITION_OPTIONS" size="small"
          @update:value="v => ctx.set('background-position', v)" />
      </div>
    </div>

    <!-- Repeat + Attachment -->
    <div class="grid grid-cols-2 gap-2">
      <div>
        <PropLabel label="Repeat" prop="background-repeat" />
        <n-select :value="ctx.get('background-repeat') || 'no-repeat'" :options="BG_REPEAT_OPTIONS" size="small"
          @update:value="v => ctx.set('background-repeat', v)" />
      </div>
      <div>
        <PropLabel label="Attachment" prop="background-attachment" />
        <n-select :value="ctx.get('background-attachment') || 'scroll'" :options="BG_ATTACHMENT_OPTIONS" size="small"
          @update:value="v => ctx.set('background-attachment', v)" />
      </div>
    </div>

    <!-- Clip -->
    <div>
      <PropLabel label="Clip" prop="background-clip" />
      <n-select :value="ctx.get('background-clip') || 'border-box'" :options="BG_CLIP_OPTIONS" size="small"
        @update:value="v => ctx.set('background-clip', v)" />
    </div>
  </div>
</template>
