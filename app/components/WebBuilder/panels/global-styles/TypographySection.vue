<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import { NButton, NInput, NSelect, NTabs, NTab } from 'naive-ui'
import { useDevice, type Device } from '../../composables/useDevice'
import { useThemeConfig } from '../../composables/useThemeConfig'
import { getThemeFontOptionsFromSnapshot } from '../../services/theme/font-options'
import { ensureGoogleFontPreview, fetchGoogleFontsCatalog, type GoogleFontEntry } from '../../services/theme/google-fonts'
import { resolveTypographyForDevice } from '../../services/theme/theme-css'
import { getThemeFontFamilies } from '../../services/theme/theme-fonts'
import type { ThemeHeadingStyle, ThemeTypographyDevice, ThemeTypographyOverride } from '../../services/theme/theme-types'
import CssValueInput from '../style/CssValueInput.vue'

const { theme, setTypography, setResponsiveTypography, installFont, removeInstalledFont } = useThemeConfig()
const { currentDevice, setDevice } = useDevice()

const headingLevels = [
  { key: 'h1', label: 'H1' },
  { key: 'h2', label: 'H2' },
  { key: 'h3', label: 'H3' },
  { key: 'h4', label: 'H4' },
  { key: 'h5', label: 'H5' },
  { key: 'h6', label: 'H6' },
] as const

const headingWeightOptions = [
  { value: '400', label: '400' },
  { value: '500', label: '500' },
  { value: '600', label: '600' },
  { value: '700', label: '700' }
]

const activeDevice = computed(() => currentDevice.value as ThemeTypographyDevice)
const desktopTypography = computed(() => resolveTypographyForDevice(theme.value.typography, 'Desktop'))
const tabletTypography = computed(() => resolveTypographyForDevice(theme.value.typography, 'Tablet'))
const mobileTypography = computed(() => resolveTypographyForDevice(theme.value.typography, 'Mobile'))
const fontOptions = computed(() => getThemeFontOptionsFromSnapshot(theme.value))
const googleFontQuery = ref('')
const googleFontsLoading = ref(false)
const googleFontsLoaded = ref(false)
const googleFontsError = ref('')
const googleFontsCatalog = ref<GoogleFontEntry[]>([])
const installedFontsSet = computed(() => new Set(theme.value.typography.installedFonts.map((item) => item.toLowerCase())))
const googleFontResults = computed(() => {
  const query = googleFontQuery.value.trim().toLowerCase()
  const candidates = query
    ? googleFontsCatalog.value.filter((item) => item.family.toLowerCase().includes(query))
    : googleFontsCatalog.value

  return candidates
    .filter((item) => !installedFontsSet.value.has(item.family.toLowerCase()))
    .slice(0, 8)
})

const inheritedTypography = computed(() => {
  if (activeDevice.value === 'Mobile') return tabletTypography.value
  return desktopTypography.value
})

function getResponsiveOverride(device: Exclude<ThemeTypographyDevice, 'Desktop'>): ThemeTypographyOverride {
  return theme.value.typography.responsive[device] ?? {}
}

function setTypographyField(patch: Partial<ThemeTypographyOverride & Omit<typeof theme.value.typography, 'id' | 'responsive'>>) {
  if (activeDevice.value === 'Desktop') {
    setTypography(patch)
    return
  }
  setResponsiveTypography(activeDevice.value, patch)
}

function updateHeadingStyle(level: keyof Pick<typeof theme.value.typography, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'>, patch: Partial<ThemeHeadingStyle>) {
  if (activeDevice.value === 'Desktop') {
    setTypography({
      [level]: {
        ...theme.value.typography[level],
        ...patch,
      },
    })
    return
  }

  const responsive = getResponsiveOverride(activeDevice.value)
  setResponsiveTypography(activeDevice.value, {
    [level]: {
      ...(responsive[level] ?? {}),
      ...patch,
    },
  })
}

function setBaseTextSize(value: string) {
  setTypographyField({ textBase: value })
}

async function ensureGoogleFontsCatalog() {
  if (googleFontsLoaded.value || googleFontsLoading.value) return
  googleFontsLoading.value = true
  googleFontsError.value = ''
  try {
    googleFontsCatalog.value = await fetchGoogleFontsCatalog()
    googleFontsLoaded.value = true
  } catch (error) {
    googleFontsError.value = error instanceof Error ? error.message : 'Failed to load Google Fonts'
  } finally {
    googleFontsLoading.value = false
  }
}

function installGoogleFont(family: string) {
  installFont(family)
  googleFontQuery.value = ''
}

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

watch(googleFontResults, (items) => {
  items.forEach((item) => ensureGoogleFontPreview(item.family))
}, { immediate: true })

watch(() => theme.value.typography.installedFonts, (families) => {
  families.forEach((family) => ensureGoogleFontPreview(family))
}, { immediate: true })

watch(() => theme.value, (snapshot) => {
  getThemeFontFamilies(snapshot).forEach((family) => ensureGoogleFontPreview(family))
}, { immediate: true, deep: true })
</script>

<template>
  <div class="px-3 py-2 space-y-3">
    <n-tabs
      :value="currentDevice"
      type="segment"
      size="small"
      @update:value="(value: string) => setDevice(value as Device)"
    >
      <n-tab name="Desktop" tab="Desktop" />
      <n-tab name="Tablet" tab="Tablet" />
      <n-tab name="Mobile" tab="Mobile" />
    </n-tabs>

    <div class="space-y-2 rounded-md border border-[var(--editor-border)] bg-[var(--editor-surface-subtle)] p-2">
      <div class="flex items-center justify-between gap-2">
        <span class="prop-label">Installed Google Fonts</span>
        <span class="text-[10px] text-[var(--editor-text-subtle)]">{{ theme.typography.installedFonts.length }}</span>
      </div>

      <div class="space-y-2">
        <n-input
          v-model:value="googleFontQuery"
          size="small"
          placeholder="Search Google Fonts..."
          @focus="ensureGoogleFontsCatalog"
        />

        <div v-if="googleFontsLoading" class="rounded-md border border-dashed border-[var(--editor-border)] px-2.5 py-2 text-[11px] text-[var(--editor-text-subtle)]">
          Loading Google Fonts...
        </div>

        <div v-else-if="googleFontsError" class="space-y-2 rounded-md border border-dashed border-[var(--editor-border)] p-2">
          <p class="text-[11px] text-[var(--editor-text-subtle)]">{{ googleFontsError }}</p>
          <n-button size="tiny" @click="ensureGoogleFontsCatalog">Retry</n-button>
        </div>

        <div
          v-else-if="googleFontsLoaded"
          class="rounded-md border border-[var(--editor-border)] bg-[var(--editor-surface)] overflow-hidden"
        >
          <button
            v-for="item in googleFontResults"
            :key="item.family"
            type="button"
            class="flex w-full items-center justify-between gap-3 border-b border-[var(--editor-border)] px-2.5 py-2 text-left last:border-b-0 hover:bg-[var(--editor-surface-subtle)]"
            @click="installGoogleFont(item.family)"
          >
            <span class="min-w-0">
              <span
                class="block truncate text-[14px] text-[var(--editor-text)]"
                :style="{ fontFamily: `'${item.family}', sans-serif` }"
              >
                {{ item.family }}
              </span>
              <span
                class="block truncate text-[11px] text-[var(--editor-text-subtle)]"
                :style="{ fontFamily: `'${item.family}', sans-serif` }"
              >
                The quick brown fox jumps over the lazy dog
              </span>
              <span class="block text-[10px] uppercase tracking-[0.08em] text-[var(--editor-text-subtle)]">{{ item.category }}</span>
            </span>
            <span class="text-[11px] font-medium text-[var(--editor-accent)]">Install</span>
          </button>

          <div
            v-if="!googleFontResults.length"
            class="px-2.5 py-3 text-[11px] text-[var(--editor-text-subtle)]"
          >
            No matching Google Fonts found.
          </div>
        </div>
      </div>

      <div v-if="theme.typography.installedFonts.length" class="flex flex-wrap gap-1.5">
        <button
          v-for="family in theme.typography.installedFonts"
          :key="family"
          type="button"
          class="inline-flex items-center gap-1 rounded-full border border-[var(--editor-border)] bg-[var(--editor-surface)] px-2 py-1 text-[11px] text-[var(--editor-text)]"
          :style="{ fontFamily: `'${family}', sans-serif` }"
          @click="removeInstalledFont(family)"
        >
          <span>{{ family }}</span>
          <span class="text-[var(--editor-text-subtle)]">×</span>
        </button>
      </div>
    </div>

    <div class="space-y-1">
      <span class="prop-label">Body Font</span>
      <n-select
        :value="activeDevice === 'Desktop' ? theme.typography.fontBody : (theme.typography.responsive[activeDevice]?.fontBody ?? '')"
        :placeholder="activeDevice === 'Desktop' ? '' : inheritedTypography.fontBody"
        :options="fontOptions"
        filterable
        clearable
        size="small"
        :render-label="renderFontOptionLabel"
        @update:value="(value) => setTypographyField({ fontBody: String(value ?? '') })"
      />
    </div>

    <div class="space-y-1">
      <span class="prop-label">Heading Font</span>
      <n-select
        :value="activeDevice === 'Desktop' ? theme.typography.fontHeading : (theme.typography.responsive[activeDevice]?.fontHeading ?? '')"
        :placeholder="activeDevice === 'Desktop' ? '' : inheritedTypography.fontHeading"
        :options="fontOptions"
        filterable
        clearable
        size="small"
        :render-label="renderFontOptionLabel"
        @update:value="(value) => setTypographyField({ fontHeading: String(value ?? '') })"
      />
    </div>

    <div class="space-y-1">
      <span class="prop-label">Mono Font</span>
      <n-select
        :value="activeDevice === 'Desktop' ? theme.typography.fontMono : (theme.typography.responsive[activeDevice]?.fontMono ?? '')"
        :placeholder="activeDevice === 'Desktop' ? '' : inheritedTypography.fontMono"
        :options="fontOptions"
        filterable
        clearable
        size="small"
        :render-label="renderFontOptionLabel"
        @update:value="(value) => setTypographyField({ fontMono: String(value ?? '') })"
      />
    </div>

    <div class="grid grid-cols-2 gap-2">
      <div class="space-y-1">
        <span class="prop-label">Base Size</span>
        <CssValueInput
          :value="activeDevice === 'Desktop' ? theme.typography.textBase : (theme.typography.responsive[activeDevice]?.textBase ?? '')"
          :inherited="activeDevice === 'Desktop' ? '' : inheritedTypography.textBase"
          :units="['px', 'rem']"
          @preview="setBaseTextSize"
          @change="setBaseTextSize"
        />
      </div>

      <div class="space-y-1">
        <span class="prop-label">Line Height</span>
        <input
          :value="activeDevice === 'Desktop' ? theme.typography.lineHeightBase : (theme.typography.responsive[activeDevice]?.lineHeightBase ?? '')"
          class="css-text-input"
          :placeholder="activeDevice === 'Desktop' ? '' : inheritedTypography.lineHeightBase"
          @blur="(e) => setTypographyField({ lineHeightBase: (e.target as HTMLInputElement).value })"
        >
      </div>
    </div>
    <div class="space-y-2">
      <span class="prop-label">Heading Styles</span>
      <div
        v-for="item in headingLevels"
        :key="item.key"
        class="rounded-md border border-[var(--editor-border)] bg-[var(--editor-surface-subtle)] p-2 space-y-2"
      >
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-[var(--editor-text)]">{{ item.label }}</span>
          <n-select
            :value="activeDevice === 'Desktop'
              ? theme.typography[item.key].weight
              : (theme.typography.responsive[activeDevice]?.[item.key]?.weight ?? undefined)"
            :options="headingWeightOptions"
            size="small"
            class="w-[88px]"
            :placeholder="activeDevice === 'Desktop' ? undefined : inheritedTypography[item.key].weight"
            @update:value="(value: string | number) => updateHeadingStyle(item.key, { weight: String(value) })"
          />
        </div>

        <div class="space-y-1">
          <span class="prop-label">Font</span>
          <n-select
            :value="activeDevice === 'Desktop'
              ? theme.typography[item.key].fontFamily
              : (theme.typography.responsive[activeDevice]?.[item.key]?.fontFamily ?? '')"
            :placeholder="activeDevice === 'Desktop' ? '' : inheritedTypography[item.key].fontFamily"
            :options="fontOptions"
            filterable
            clearable
            size="small"
            :render-label="renderFontOptionLabel"
            @update:value="(value) => updateHeadingStyle(item.key, { fontFamily: String(value ?? '') })"
          />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div class="space-y-1">
            <span class="prop-label">Size</span>
            <CssValueInput
              :value="activeDevice === 'Desktop'
                ? theme.typography[item.key].size
                : (theme.typography.responsive[activeDevice]?.[item.key]?.size ?? '')"
              :inherited="activeDevice === 'Desktop' ? '' : inheritedTypography[item.key].size"
              :units="['px', 'rem']"
              @preview="(value) => updateHeadingStyle(item.key, { size: value })"
              @change="(value) => updateHeadingStyle(item.key, { size: value })"
            />
          </div>

          <div class="space-y-1">
            <span class="prop-label">Line Height</span>
            <input
              :value="activeDevice === 'Desktop'
                ? theme.typography[item.key].lineHeight
                : (theme.typography.responsive[activeDevice]?.[item.key]?.lineHeight ?? '')"
              class="css-text-input"
              :placeholder="activeDevice === 'Desktop' ? '' : inheritedTypography[item.key].lineHeight"
              @blur="(e) => updateHeadingStyle(item.key, { lineHeight: (e.target as HTMLInputElement).value })"
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
