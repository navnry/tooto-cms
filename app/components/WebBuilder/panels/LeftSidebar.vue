<script setup lang="ts">
/**
 * LeftSidebar.vue — Icon rail + panel content
 *
 * Layout: flex-row
 *   ├── Icon rail (40px) — vertical icon tabs, always visible
 *   └── Panel content (flex-1) — Blocks / Properties / Pages / Symbols / Styles
 *
 * Clicking an active icon collapses the panel (toggle behaviour).
 * Layers panel is a floating window toggled from the top toolbar.
 *
 * Properties tab (Style + Settings) auto-activates when a canvas component
 * is selected via the shared editor bridge.
 */
import { ref, watch } from 'vue'
import { NTooltip, NTabs, NTabPane } from 'naive-ui'
import AppIcon from '../ui/AppIcon.vue'
import BlockPanel from './BlockPanel.vue'
import PagesPanel from './PagesPanel.vue'
import SymbolsPanel from './SymbolsPanel.vue'
import GlobalStylesPanel from './GlobalStylesPanel.vue'
import StylePanel from './StylePanel.vue'
import TraitPanel from './TraitPanel.vue'
import AssetsPanel from './AssetsPanel.vue'
import { useEditorBridge } from '../bridge/useEditorBridge'

type TabKey = 'blocks' | 'properties' | 'pages' | 'symbols' | 'styles' | 'assets'

const activeTab        = ref<TabKey | null>('blocks')
const propertiesSubTab = ref<'style' | 'settings'>('style')

const tabs: Array<{ key: TabKey; icon: string; label: string }> = [
  { key: 'blocks',     icon: 'qlementine-icons:blocks-16',       label: 'Blocks'       },
  { key: 'properties', icon: 'lucide:palette', label: 'Properties'  },
  { key: 'assets',     icon: 'lucide:image',                     label: 'Assets'       },
  { key: 'pages',      icon: 'iconoir:multiple-pages',          label: 'Pages'        },
  { key: 'symbols',    icon: 'lucide:component',          label: 'Symbols'      },
  { key: 'styles',     icon: 'ant-design:setting-outlined',            label: 'Global Styles'},
]

function selectTab(key: TabKey) {
  activeTab.value = activeTab.value === key ? null : key
}

// ── Auto-switch to Properties on component selection ─────────────────────────

const { selectionRevision, selectedComponentId } = useEditorBridge()

watch(() => selectionRevision.value, () => {
  if (selectedComponentId.value) {
    activeTab.value = 'properties'
  }
}, { immediate: true })
</script>

<template>
  <div class="flex h-full">

    <!-- ── Icon rail ──────────────────────────────────────────────────────── -->
    <div
      class="
        glass-surface
        flex flex-col items-center pt-2 pb-2 gap-1
        w-10 flex-shrink-0 h-full
        border-r border-[rgba(255,255,255,0.08)]
        z-10
      "
    >
      <div v-for="tab in tabs" :key="tab.key">
        <n-tooltip placement="right">
          <template #trigger>
            <button
              :class="[
                'rail-btn',
                activeTab === tab.key && 'rail-btn--active',
              ]"
              @click="selectTab(tab.key)"
            >
              <AppIcon :icon="tab.icon" :size="16" />
              <span v-if="activeTab === tab.key" class="rail-indicator" />
            </button>
          </template>
          {{ tab.label }}
        </n-tooltip>
      </div>
    </div>

    <!-- ── Panel content ─────────────────────────────────────────────────── -->
    <Transition name="panel-slide">
      <div
        v-if="activeTab !== null"
        class="
          glass-surface
          flex flex-col h-full flex-shrink-0
          border-r border-[rgba(255,255,255,0.08)]
          overflow-hidden
          w-72
        "
      >
        <!-- Panel header — hidden for Properties (NTabs acts as the header) -->
        <div
          v-if="activeTab !== 'properties'"
          class="flex items-center justify-between px-3 py-2 flex-shrink-0 border-b border-[rgba(255,255,255,0.06)]"
        >
          <span class="text-xs font-semibold uppercase tracking-widest text-[var(--editor-text-muted)]">
            {{ tabs.find(t => t.key === activeTab)?.label }}
          </span>
        </div>

        <!-- Panel body -->
        <div class="flex-1 overflow-hidden min-h-0">
          <BlockPanel        v-if="activeTab === 'blocks'"  />
          <AssetsPanel       v-if="activeTab === 'assets'"  />

          <!-- Properties: Style + Settings sub-tabs -->
          <n-tabs
            v-if="activeTab === 'properties'"
            v-model:value="propertiesSubTab"
            type="line"
            size="small"
            justify-content="center"
            class="h-full flex flex-col min-h-0"
          >
            <n-tab-pane name="style" tab="Style" class="flex-1 h-full overflow-y-auto">
              <StylePanel />
            </n-tab-pane>
            <n-tab-pane name="settings" tab="Settings" class="flex-1 overflow-y-auto">
              <TraitPanel />
            </n-tab-pane>
          </n-tabs>

          <PagesPanel        v-if="activeTab === 'pages'"   />
          <SymbolsPanel      v-if="activeTab === 'symbols'" />
          <GlobalStylesPanel v-if="activeTab === 'styles'"  />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ── Icon rail button ────────────────────────────────────────────────────── */
.rail-btn {
  position: relative;
  width: 2rem; height: 2rem;
  display: flex; align-items: center; justify-content: center;
  border-radius: 0.5rem;
  border: none; background: transparent; cursor: pointer;
  color: var(--editor-text-muted);
  transition: color 0.15s, background 0.15s;
  flex-shrink: 0;
}
.rail-btn:hover {
  color: var(--editor-text);
  background: var(--editor-surface-overlay);
}
.rail-btn--active {
  color: var(--editor-accent);
  background: var(--editor-accent-subtle);
}
.rail-btn--active:hover {
  background: var(--editor-accent-subtle);
}

/* Active indicator — thin left-edge bar */
.rail-indicator {
  position: absolute;
  left: -0.5rem; /* reaches outside to the rail edge */
  top: 50%; transform: translateY(-50%);
  width: 2px; height: 1rem;
  border-radius: 0 2px 2px 0;
  background: var(--editor-accent);
}

/* ── Panel slide transition ───────────────────────────────────────────────── */
.panel-slide-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.panel-slide-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.panel-slide-enter-from   { opacity: 0; transform: translateX(-6px); }
.panel-slide-leave-to     { opacity: 0; transform: translateX(-4px); }
</style>
