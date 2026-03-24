<script setup lang="ts">
/**
 * TypographySection — Full typography controls
 */
import { inject, computed, h, watch } from 'vue'
import { NSelect } from 'naive-ui'
import { STYLE_CTX } from '../styleContext'
import CssValueInput from '../CssValueInput.vue'
import PropLabel from '../PropLabel.vue'
import ColorPicker from '../ColorPicker.vue'
import { useThemeConfig } from '../../../composables/useThemeConfig'
import { getThemeFontOptionsFromSnapshot } from '../../../services/theme/font-options'
import { ensureGoogleFontPreview } from '../../../services/theme/google-fonts'
import { getThemeFontFamilies } from '../../../services/theme/theme-fonts'

const ctx = inject(STYLE_CTX)!
const { theme } = useThemeConfig()

const WEIGHT_OPTIONS = [
  { value: '100', label: '100 — Thin' },
  { value: '200', label: '200 — ExtraLight' },
  { value: '300', label: '300 — Light' },
  { value: '400', label: '400 — Regular' },
  { value: '500', label: '500 — Medium' },
  { value: '600', label: '600 — SemiBold' },
  { value: '700', label: '700 — Bold' },
  { value: '800', label: '800 — ExtraBold' },
  { value: '900', label: '900 — Black' },
]

const STYLE_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'italic', label: 'Italic' },
  { value: 'oblique', label: 'Oblique' },
]

const ALIGN_OPTIONS = [
  { value: 'left',    label: 'Left' },
  { value: 'center',  label: 'Center' },
  { value: 'right',   label: 'Right' },
  { value: 'justify', label: 'Justify' },
]

const DECORATION_OPTIONS = [
  { value: 'none',         label: 'None' },
  { value: 'underline',    label: 'Underline' },
  { value: 'overline',     label: 'Overline' },
  { value: 'line-through', label: 'Strikethrough' },
]

const TRANSFORM_OPTIONS = [
  { value: 'none',       label: 'None' },
  { value: 'uppercase',  label: 'UPPERCASE' },
  { value: 'lowercase',  label: 'lowercase' },
  { value: 'capitalize', label: 'Capitalize' },
]

const WHITESPACE_OPTIONS = [
  { value: 'normal',   label: 'Normal' },
  { value: 'nowrap',   label: 'No Wrap' },
  { value: 'pre',      label: 'Pre' },
  { value: 'pre-wrap', label: 'Pre Wrap' },
  { value: 'pre-line', label: 'Pre Line' },
]

const OVERFLOW_OPTIONS = [
  { value: 'clip',     label: 'Clip' },
  { value: 'ellipsis', label: 'Ellipsis (…)' },
]

const WORD_BREAK_OPTIONS = [
  { value: 'normal',    label: 'Normal' },
  { value: 'break-all', label: 'Break All' },
  { value: 'keep-all',  label: 'Keep All' },
  { value: 'break-word', label: 'Break Word' },
]

const FS_UNITS   = ['px', 'rem', 'em', '%', 'vw']
const LH_UNITS   = ['', 'px', 'rem', 'em', '%']
const LS_UNITS   = ['px', 'rem', 'em']

const textColor = computed(() => ctx.get('color') || '#000000')
const fontOptions = computed(() => getThemeFontOptionsFromSnapshot(theme.value))

function renderFontOptionLabel(option: { label?: string; value?: string }) {
  const label = typeof option.label === 'string' ? option.label : String(option.value ?? '')
  const value = typeof option.value === 'string' ? option.value : ''

  return h('div', { class: 'flex items-center justify-between gap-3 min-w-0' }, [
    h('span', {
      class: 'truncate text-[12px] text-[var(--editor-text)]',
      style: value ? { fontFamily: value } : undefined,
    }, label),
    h('span', {
      class: 'text-[11px] text-[var(--editor-text-subtle)]',
      style: value ? { fontFamily: value } : undefined,
    }, 'Ag'),
  ])
}

watch(() => theme.value, (snapshot) => {
  getThemeFontFamilies(snapshot).forEach((family) => ensureGoogleFontPreview(family))
}, { immediate: true, deep: true })
</script>

<template>
  <div class="space-y-2">
    <!-- Font family -->
    <div>
      <PropLabel label="Font Family" prop="font-family" />
      <n-select
        :value="ctx.get('font-family') || undefined"
        :placeholder="ctx.getPlaceholder('font-family')"
        :options="fontOptions"
        size="small"
        filterable
        clearable
        :render-label="renderFontOptionLabel"
        @update:value="v => ctx.set('font-family', String(v ?? ''))"
      />
    </div>

    <!-- Size + Weight -->
    <div class="grid grid-cols-2 gap-2">
      <div>
        <PropLabel label="Size" prop="font-size" />
        <CssValueInput :value="ctx.get('font-size')" :units="FS_UNITS" :inherited="ctx.getPlaceholder('font-size')"
          @change="v => ctx.set('font-size', v)" @preview="v => ctx.set('font-size', v)" />
      </div>
      <div>
        <PropLabel label="Style" prop="font-style" />
        <n-select :value="ctx.get('font-style') || 'normal'" :options="STYLE_OPTIONS" size="small"
          @update:value="v => ctx.set('font-style', v)" />
      </div>
    </div>

    <div>
      <PropLabel label="Weight" prop="font-weight" />
      <n-select :value="ctx.get('font-weight') || '400'" :options="WEIGHT_OPTIONS" size="small"
        @update:value="v => ctx.set('font-weight', v)" />
    </div>

    <!-- Line height + Letter spacing -->
    <div class="grid grid-cols-2 gap-2">
      <div>
        <PropLabel label="Line Height" prop="line-height" />
        <CssValueInput :value="ctx.get('line-height')" :units="LH_UNITS" :inherited="ctx.getPlaceholder('line-height')" placeholder="1.5"
          @change="v => ctx.set('line-height', v)" @preview="v => ctx.set('line-height', v)" />
      </div>
      <div>
        <PropLabel label="Letter Spacing" prop="letter-spacing" />
        <CssValueInput :value="ctx.get('letter-spacing')" :units="LS_UNITS" :inherited="ctx.getPlaceholder('letter-spacing')"
          @change="v => ctx.set('letter-spacing', v)" @preview="v => ctx.set('letter-spacing', v)" />
      </div>
    </div>

    <!-- Color -->
    <div>
      <PropLabel label="Color" prop="color" />
      <ColorPicker
        :value="textColor"
        @confirm="v => ctx.set('color', v)"
        @clear="() => ctx.clear('color')"
      />
    </div>

    <!-- Align + Decoration -->
    <div class="grid grid-cols-2 gap-2">
      <div>
        <PropLabel label="Align" prop="text-align" />
        <n-select :value="ctx.get('text-align') || 'left'" :options="ALIGN_OPTIONS" size="small"
          @update:value="v => ctx.set('text-align', v)" />
      </div>
      <div>
        <PropLabel label="Decoration" prop="text-decoration" />
        <n-select :value="ctx.get('text-decoration') || 'none'" :options="DECORATION_OPTIONS" size="small"
          @update:value="v => ctx.set('text-decoration', v)" />
      </div>
    </div>

    <!-- Transform + Whitespace -->
    <div class="grid grid-cols-2 gap-2">
      <div>
        <PropLabel label="Transform" prop="text-transform" />
        <n-select :value="ctx.get('text-transform') || 'none'" :options="TRANSFORM_OPTIONS" size="small"
          @update:value="v => ctx.set('text-transform', v)" />
      </div>
      <div>
        <PropLabel label="White Space" prop="white-space" />
        <n-select :value="ctx.get('white-space') || 'normal'" :options="WHITESPACE_OPTIONS" size="small"
          @update:value="v => ctx.set('white-space', v)" />
      </div>
    </div>

    <!-- Text overflow + Word break -->
    <div class="grid grid-cols-2 gap-2">
      <div>
        <PropLabel label="Overflow" prop="text-overflow" />
        <n-select :value="ctx.get('text-overflow') || 'clip'" :options="OVERFLOW_OPTIONS" size="small"
          @update:value="v => ctx.set('text-overflow', v)" />
      </div>
      <div>
        <PropLabel label="Word Break" prop="word-break" />
        <n-select :value="ctx.get('word-break') || 'normal'" :options="WORD_BREAK_OPTIONS" size="small"
          @update:value="v => ctx.set('word-break', v)" />
      </div>
    </div>
  </div>
</template>
