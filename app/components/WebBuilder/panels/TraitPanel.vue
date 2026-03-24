<script setup lang="ts">
/**
 * TraitPanel.vue
 *
 * Custom Trait Manager UI using GrapesJS trait:custom event.
 *
 * GrapesJS docs (modules/Traits.md):
 *   traitManager: { custom: true }
 *   editor.on('trait:custom', props => { props.container })
 *
 * API used:
 *   editor.Traits.getTraitsByCategory() → Array<{ category?, items: Trait[] }>
 *   trait.getType()      — 'text' | 'number' | 'checkbox' | 'switch' | 'select' | 'color' | 'button'
 *   trait.getLabel()
 *   trait.getValue({ useType: true })
 *   trait.setValue(value)
 *   trait.setValue(value, { partial: true })
 *   trait.getOptions()   — for select type
 *   trait.getOptionId(opt), trait.getOptionLabel(opt)
 *   trait.runCommand()   — for button type
 */
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  NInput,
  NInputNumber,
  NCheckbox,
  NSwitch,
  NSelect,
  NButton,
  NEmpty,
} from 'naive-ui'
import { useEditor } from '../composables/useEditor'
import type { TraitOption, TraitGetValueOptions, TraitSetValueOptions } from 'grapesjs'

/** Structural type for GrapesJS trait models — avoids `any` and class/instance mismatch in templates */
interface GjsTrait {
  getId(): string | number
  getType(): string
  getLabel(): string
  get(key: string): unknown
  getValue(opts?: TraitGetValueOptions): unknown
  setValue(value: unknown, opts?: TraitSetValueOptions): void
  getOptions?(): TraitOption[]
  getOptionId(option: TraitOption): string
  getOptionLabel(id: string | TraitOption): string
  runCommand(): unknown
}
import ColorPicker from './style/ColorPicker.vue'

const { editor, ready } = useEditor()

interface TraitCategory {
  category?: { getLabel: () => string; id: string }
  items: GjsTrait[]
}

const traitCategories = ref<TraitCategory[]>([])
const hasTraits = ref(false)

// During input, avoid triggering expensive rerenders/scripts on every keystroke.
// We use GrapesJS Trait partial updates and only commit on blur/confirm.
const _lastTraitValues = new Map<string, unknown>()
const _commitTimers = new Map<string, number>()
const _COMMIT_DEBOUNCE_MS = 200

function onTraitCustom() {
  if (!editor.value) return
  const cats = editor.value.Traits.getTraitsByCategory() as TraitCategory[]
  traitCategories.value = cats
  hasTraits.value = cats.some(c => c.items.length > 0)
}

function bindEvents() {
  editor.value?.on('trait:custom', onTraitCustom)
  editor.value?.on('component:selected', onTraitCustom)
  editor.value?.on('component:deselected', onTraitCustom)
  // Sync immediately in case a component is already selected
  onTraitCustom()
}

onMounted(() => {
  if (ready.value) bindEvents()
  else {
    const stop = watch(ready, (r) => { if (r) { bindEvents(); stop() } })
  }
})

onBeforeUnmount(() => {
  editor.value?.off('trait:custom', onTraitCustom)
  editor.value?.off('component:selected', onTraitCustom)
  editor.value?.off('component:deselected', onTraitCustom)
})

function getValue(trait: GjsTrait): unknown {
  return trait.getValue({ useType: true })
}

function setTraitValue(trait: GjsTrait, value: unknown, opts?: TraitSetValueOptions) {
  const id = String(trait.getId())
  _lastTraitValues.set(id, value)
  trait.setValue(value, opts)
}

function commitTraitValue(trait: GjsTrait) {
  const id = String(trait.getId())
  const t = _commitTimers.get(id)
  if (t) {
    window.clearTimeout(t)
    _commitTimers.delete(id)
  }
  const pending = _lastTraitValues.get(id)
  if (pending === undefined) return
  trait.setValue(pending)
}

function commitTraitValueDebounced(trait: GjsTrait) {
  const id = String(trait.getId())
  const t = _commitTimers.get(id)
  if (t) window.clearTimeout(t)
  _commitTimers.set(id, window.setTimeout(() => commitTraitValue(trait), _COMMIT_DEBOUNCE_MS))
}

function toSelectOptions(trait: GjsTrait) {
  const options = trait.getOptions?.() ?? []
  return options.map((o) => ({
    value: trait.getOptionId(o),
    label: trait.getOptionLabel(o),
  }))
}

</script>

<template>
  <div class="h-full p-2">
    <div v-if="!hasTraits" class="flex items-center justify-center h-24">
      <n-empty description="Select an element to edit its settings" size="small" />
    </div>

    <template v-else>
      <template v-for="trc in traitCategories" :key="trc.category?.id ?? 'none'">
        <!-- Category header (if any) -->
        <p
          v-if="trc.category"
          class="text-xs uppercase tracking-wider mt-3 mb-1"
        >
          {{ trc.category.getLabel() }}
        </p>

        <div class="space-y-2">
          <div
            v-for="trait in trc.items"
            :key="trait.getId()"
            class="flex flex-col gap-[3px]"
          >
            <!-- Label (hidden for checkbox & button) -->
            <span
              v-if="!['checkbox', 'switch', 'button'].includes(trait.getType())"
              class="text-xs"
            >
              {{ trait.getLabel() }}
            </span>

            <n-input
              v-if="trait.getType() === 'text' || !['number','checkbox','switch','select','color','button'].includes(trait.getType())"
              :value="String(getValue(trait) ?? '')"
              :placeholder="trait.get('placeholder') as string"
              size="small"
              @update:value="(v) => { setTraitValue(trait, v, { partial: true }); commitTraitValueDebounced(trait) }"
              @blur="() => commitTraitValue(trait)"
            />

            <!-- number -->
            <n-input-number
              v-else-if="trait.getType() === 'number'"
              :value="Number(getValue(trait)) || 0"
              :min="trait.get('min') as number"
              :max="trait.get('max') as number"
              :step="trait.get('step') as number ?? 1"
              size="small"
              @update:value="(v) => { setTraitValue(trait, v ?? 0, { partial: true }); commitTraitValueDebounced(trait) }"
              @blur="() => commitTraitValue(trait)"
            />

            <!-- switch (e.g. AOS 启用动画) — n-switch -->
            <div
              v-else-if="trait.getType() === 'switch'"
              class="flex items-center justify-between gap-2 min-h-7"
            >
              <span class="text-xs">{{ trait.getLabel() }}</span>
              <n-switch
                :value="Boolean(getValue(trait))"
                size="small"
                @update:value="(v) => trait.setValue(v)"
              />
            </div>

            <!-- checkbox -->
            <n-checkbox
              v-else-if="trait.getType() === 'checkbox'"
              :checked="Boolean(getValue(trait))"
              @update:checked="(v) => trait.setValue(v)"
            >
              {{ trait.getLabel() }}
            </n-checkbox>

            <!-- select -->
            <n-select
              v-else-if="trait.getType() === 'select'"
              :value="String(getValue(trait) ?? '')"
              :options="toSelectOptions(trait)"
              size="small"
              @update:value="(v) => setTraitValue(trait, v)"
            />

            <!-- color -->
            <ColorPicker
              v-else-if="trait.getType() === 'color'"
              :value="(String(getValue(trait) ?? '') || undefined)"
              size="small"
              @confirm="(v) => trait.setValue(v)"
              @clear="() => trait.setValue('')"
            />

            <!-- button -->
            <n-button
              v-else-if="trait.getType() === 'button'"
              size="small"
              block
              @click="trait.runCommand()"
            >
              {{ trait.get('text') ?? trait.getLabel() }}
            </n-button>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
