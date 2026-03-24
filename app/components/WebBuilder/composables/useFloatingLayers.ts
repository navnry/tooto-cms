import { ref, reactive } from 'vue'

/**
 * Shared singleton state for the floating Layers panel.
 *
 * Position is stored as { right, top } — distance from the right/top edges —
 * so the panel stays anchored to the right side regardless of window width.
 */
const isVisible = ref(true)
const position  = reactive({ right: 16, top: 60 })
let positionInitialized = false

export function useFloatingLayers() {
  function toggle() {
    isVisible.value = !isVisible.value
  }

  function hide() {
    isVisible.value = false
  }

  /** Called once on first mount to set sensible defaults. */
  function initDefaultPosition() {
    if (positionInitialized) return
    positionInitialized = true
    position.right = 16
    position.top   = 60
  }

  function setPosition(right: number, top: number) {
    position.right = right
    position.top   = top
  }

  return { isVisible, position, toggle, hide, initDefaultPosition, setPosition }
}
