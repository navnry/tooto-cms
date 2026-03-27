<script setup lang="ts">
/**
 * PreviewControls.vue — Floating left-center panel in preview mode
 *
 * Collapsed (default):
 *   [X]  Exit preview
 *   ─────────────────
 *   [current device icon]  ← click to expand
 *
 * Expanded (click device):
 *   [X]  Exit preview
 *   ─────────────────
 *   [Desktop]
 *   [Tablet]
 *   [Mobile]
 *
 * Selecting a device switches it and collapses back.
 * Clicking outside also collapses.
 */
import { ref, computed } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { usePreview } from '../composables/usePreview'
import { useDevice, type Device } from '../composables/useDevice'
import AppIcon from '../ui/AppIcon.vue'

const { isPreview, togglePreview } = usePreview()
const { currentDevice, deviceOptions, setDevice } = useDevice()

const expanded  = ref(false)
const panelRef  = ref<HTMLElement | null>(null)

const activeOption = computed(() =>
  deviceOptions.find(d => d.key === currentDevice.value) ?? deviceOptions[0],
)

function handleDeviceClick(key: Device) {
  setDevice(key)
  expanded.value = false
}

function toggleExpand() {
  expanded.value = !expanded.value
}

onClickOutside(panelRef, () => { expanded.value = false })
</script>

<template>
  <Teleport to="body">
    <Transition name="float">
      <div v-if="isPreview" ref="panelRef" class="preview-float">

        <!-- Exit preview -->
        <button class="float-btn float-btn--exit" title="Exit Preview" @click="togglePreview">
          <AppIcon icon="lucide:x" :size="15" />
        </button>

        <div class="float-divider" />

        <!-- Collapsed: show only current device button -->
        <template v-if="!expanded">
          <button
            class="float-btn float-btn--active"
            :title="`${activeOption.label} — click to switch device`"
            @click="toggleExpand"
          >
            <AppIcon :icon="activeOption.icon" :size="14" />
          </button>
          <!-- Expand indicator -->
          <AppIcon
            icon="lucide:chevrons-up-down"
            :size="10"
            class="expand-hint"
            @click="toggleExpand"
          />
        </template>

        <!-- Expanded: all device buttons -->
        <template v-else>
          <button
            v-for="d in deviceOptions"
            :key="d.key"
            :class="['float-btn', currentDevice === d.key && 'float-btn--active']"
            :title="d.label"
            @click="handleDeviceClick(d.key)"
          >
            <AppIcon :icon="d.icon" :size="14" />
          </button>
        </template>

      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.preview-float {
  position: fixed;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 9999;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px;

  background: var(--editor-surface-raised);
  backdrop-filter: blur(20px) saturate(1.4);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  border: 1px solid var(--editor-surface-border);
  border-radius: 14px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.10),
    0 8px 32px rgba(0, 0, 0, 0.28);
  transition: height 0.2s ease;
}

[data-theme='light'] .preview-float {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.90),
    0 8px 32px rgba(0, 0, 0, 0.10);
}

/* ── Buttons ─────────────────────────────────────────────────────────────── */
.float-btn {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--editor-text-muted);
  transition: color 0.15s, background 0.15s;
  flex-shrink: 0;
}
.float-btn:hover       { color: var(--editor-text); background: var(--editor-surface-overlay); }
.float-btn--active     { color: var(--editor-accent); background: var(--editor-accent-subtle); }
.float-btn--active:hover { background: var(--editor-accent-subtle); }
.float-btn--exit:hover { color: #f87171; background: rgba(248, 113, 113, 0.08); }

/* ── Expand hint icon below the collapsed device button ──────────────────── */
.expand-hint {
  color: var(--editor-text-subtle);
  cursor: pointer;
  margin-top: -2px;
  transition: color 0.15s;
}
.expand-hint:hover { color: var(--editor-text-muted); }

/* ── Divider ─────────────────────────────────────────────────────────────── */
.float-divider {
  width: 20px;
  height: 1px;
  background: var(--editor-surface-border);
  margin: 2px 0;
  flex-shrink: 0;
}

/* ── Float in/out transition ─────────────────────────────────────────────── */
.float-enter-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.float-leave-active { transition: opacity 0.14s ease, transform 0.14s ease; }
.float-enter-from   { opacity: 0; transform: translateY(-50%) translateX(-8px); }
.float-leave-to     { opacity: 0; transform: translateY(-50%) translateX(-6px); }
</style>
