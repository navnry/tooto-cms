<script setup lang="ts">
/**
 * PageSettingsModal.vue — Per-page metadata editor
 *
 * GrapesJS storage strategy:
 *   Page extends Backbone Model → arbitrary props via page.set(key, value) / page.get(key)
 *   All custom props are serialised in editor.getProjectData().pages[n] automatically.
 *
 * Props managed:
 *   name        — display name in editor  (page.setName / page.getName — built-in)
 *   slug        — URL path, e.g. /about   (page.set/get)
 *   title       — browser / SEO title     (page.set/get)
 *   description — meta description        (page.set/get)
 *   canonical   — canonical URL           (page.set/get)
 *   ogTitle     — OG title                (page.set/get)
 *   ogDesc      — OG description          (page.set/get)
 *   ogImage     — OG image URL            (page.set/get)
 */
import { ref, watch } from 'vue'
import {
  NModal, NTabs, NTabPane,
  NForm, NFormItem, NInput, NButton,
  NSpace,
} from 'naive-ui'
import { useEditor } from '../composables/useEditor'
import type { Page } from 'grapesjs'

// ── Props / emits ─────────────────────────────────────────────────────────────

const props = defineProps<{
  show:   boolean
  pageId: string
}>()

const emit = defineEmits<{
  'update:show': [v: boolean]
}>()

// ── State ─────────────────────────────────────────────────────────────────────

const { editor } = useEditor()

interface Form {
  name:        string
  slug:        string
  title:       string
  description: string
  canonical:   string
  ogTitle:     string
  ogDesc:      string
  ogImage:     string
}

const form = ref<Form>({
  name: '', slug: '', title: '', description: '',
  canonical: '', ogTitle: '', ogDesc: '', ogImage: '',
})

const activeTab = ref<'general' | 'seo' | 'social'>('general')

// ── Load page data when modal opens ──────────────────────────────────────────

function getPage(): Page | undefined {
  return editor.value?.Pages.get(props.pageId)
}

function loadForm() {
  const page = getPage()
  if (!page) return
  form.value = {
    name:        page.getName()          || '',
    slug:        (page.get('slug')       as string) || '',
    title:       (page.get('title')      as string) || '',
    description: (page.get('description')as string) || '',
    canonical:   (page.get('canonical')  as string) || '',
    ogTitle:     (page.get('ogTitle')    as string) || '',
    ogDesc:      (page.get('ogDesc')     as string) || '',
    ogImage:     (page.get('ogImage')    as string) || '',
  }
  activeTab.value = 'general'
}

watch(() => props.show, (v) => { if (v) loadForm() })

// ── Save ──────────────────────────────────────────────────────────────────────

function save() {
  const page = getPage()
  if (!page) return

  const f = form.value

  // Name — built-in setter
  const name = f.name.trim() || 'Untitled'
  if (name !== page.getName()) page.setName(name)

  // Slug — normalise to /kebab-case
  let slug = f.slug.trim()
  if (slug && !slug.startsWith('/')) slug = `/${slug}`

  // Custom metadata — stored as Backbone model props (auto-serialised)
  page.set('slug',        slug)
  page.set('title',       f.title.trim())
  page.set('description', f.description.trim())
  page.set('canonical',   f.canonical.trim())
  page.set('ogTitle',     f.ogTitle.trim())
  page.set('ogDesc',      f.ogDesc.trim())
  page.set('ogImage',     f.ogImage.trim())

  emit('update:show', false)
}

function cancel() { emit('update:show', false) }
</script>

<template>
  <n-modal
    :show="show"
    :mask-closable="false"
    preset="card"
    style="width: 520px"
    title="Page Settings"
    size="small"
    @update:show="emit('update:show', $event)"
  >
    <n-tabs v-model:value="activeTab" type="line" size="small">

      <!-- ── General ─────────────────────────────────────────────────────── -->
      <n-tab-pane name="general" tab="General">
        <n-form label-placement="top" label-width="auto" size="small" class="mt-2">
          <n-form-item label="Page Name" required>
            <n-input
              v-model:value="form.name"
              placeholder="Home"
            />
          </n-form-item>
          <n-form-item label="URL Slug">
            <n-input
              v-model:value="form.slug"
              placeholder="/about"
            >
              <template #prefix>
                <span class="text-[var(--editor-text-subtle)] text-[11px]">path</span>
              </template>
            </n-input>
            <template #feedback>
              Start with / (e.g. /about-us). Leave blank for homepage.
            </template>
          </n-form-item>
        </n-form>
      </n-tab-pane>

      <!-- ── SEO ────────────────────────────────────────────────────────── -->
      <n-tab-pane name="seo" tab="SEO">
        <n-form label-placement="top" size="small" class="mt-2">
          <n-form-item label="Browser / Tab Title">
            <n-input
              v-model:value="form.title"
              placeholder="My Page — Site Name"
              :maxlength="70"
              show-count
            />
          </n-form-item>
          <n-form-item label="Meta Description">
            <n-input
              v-model:value="form.description"
              type="textarea"
              placeholder="A brief summary of this page for search engines."
              :maxlength="160"
              show-count
              :rows="3"
            />
          </n-form-item>
          <n-form-item label="Canonical URL">
            <n-input
              v-model:value="form.canonical"
              placeholder="https://example.com/about"
            />
          </n-form-item>
        </n-form>
      </n-tab-pane>

      <!-- ── Social ─────────────────────────────────────────────────────── -->
      <n-tab-pane name="social" tab="Social">
        <n-form label-placement="top" size="small" class="mt-2">
          <n-form-item label="OG Title">
            <n-input
              v-model:value="form.ogTitle"
              placeholder="Fallback: Browser Title → Page Name"
              :maxlength="95"
              show-count
            />
          </n-form-item>
          <n-form-item label="OG Description">
            <n-input
              v-model:value="form.ogDesc"
              type="textarea"
              placeholder="Fallback: Meta Description"
              :maxlength="200"
              show-count
              :rows="3"
            />
          </n-form-item>
          <n-form-item label="OG Image URL">
            <n-input
              v-model:value="form.ogImage"
              placeholder="https://example.com/og-image.png"
            />
            <template #feedback>
              Recommended: 1200 × 630 px
            </template>
          </n-form-item>
        </n-form>
      </n-tab-pane>
    </n-tabs>

    <!-- Footer actions -->
    <template #footer>
      <n-space justify="end">
        <n-button size="small" @click="cancel">Cancel</n-button>
        <n-button size="small" type="primary" @click="save">Save</n-button>
      </n-space>
    </template>
  </n-modal>
</template>
