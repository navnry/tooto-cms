/**
 * useDevice — Singleton composable for device-switcher state
 *
 * Shared so Toolbar and PreviewControls always show the same active device.
 * Syncs with GrapesJS via editor.setDevice() + editor.on('device:change').
 */
import { ref, watch } from 'vue'
import { useEditor } from './useEditor'

export type Device = 'Desktop' | 'Tablet' | 'Mobile'

export const deviceOptions: Array<{ key: Device; icon: string; label: string }> = [
  { key: 'Desktop', icon: 'lucide:monitor',    label: 'Desktop' },
  { key: 'Tablet',  icon: 'lucide:tablet',     label: 'Tablet (768px)' },
  { key: 'Mobile',  icon: 'lucide:smartphone', label: 'Mobile (375px)' },
]

// Singleton state
const _currentDevice = ref<Device>('Desktop')

export function useDevice() {
  const { editor, ready } = useEditor()

  // Sync from GrapesJS when editor is ready
  watch(ready, (isReady) => {
    if (!isReady || !editor.value) return
    editor.value.on('device:change', () => {
      const name = editor.value?.getDevice() as Device | undefined
      if (name) _currentDevice.value = name
    })
  }, { immediate: true })

  function setDevice(device: Device) {
    editor.value?.setDevice(device)
    _currentDevice.value = device
  }

  return {
    currentDevice: _currentDevice,
    deviceOptions,
    setDevice,
  }
}
