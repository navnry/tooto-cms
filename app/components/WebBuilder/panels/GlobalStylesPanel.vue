<script setup lang="ts">
/**
 * GlobalStylesPanel — Theme-driven global styles orchestration.
 *
 * Theme tokens are stored in GrapesJS DataSources and then translated into
 * :root variables + a small set of derived global rules.
 * Custom CSS remains as an advanced override layer.
 */
import { NCollapse, NCollapseItem } from 'naive-ui'
import ColorsSection from './global-styles/ColorsSection.vue'
import TypographySection from './global-styles/TypographySection.vue'
import LayoutSection from './global-styles/LayoutSection.vue'
import EffectsSection from './global-styles/EffectsSection.vue'
import CustomCssSection from './global-styles/CustomCssSection.vue'
</script>

<template>
  <div class="h-full overflow-y-auto">
    <n-collapse
      :default-expanded-names="['colors', 'typography', 'layout', 'effects', 'custom']"
      class="style-panel-collapse"
    >
      <n-collapse-item name="colors" title="Colors">
        <ColorsSection />
      </n-collapse-item>

      <n-collapse-item name="typography" title="Typography">
        <TypographySection />
      </n-collapse-item>

      <n-collapse-item name="layout" title="Layout">
        <LayoutSection />
      </n-collapse-item>

      <n-collapse-item name="effects" title="Effects">
        <EffectsSection />
      </n-collapse-item>

      <n-collapse-item name="custom" title="Advanced CSS">
        <CustomCssSection />
      </n-collapse-item>
    </n-collapse>
  </div>
</template>
