/**
 * useDevice — Singleton composable for device-switcher state
 *
 * Shared so Toolbar, PreviewControls, and typography controls stay in sync.
 * State is bridged through `useEditorBridge()` so GrapesJS listeners stay centralized.
 */
import { useEditorBridge } from '../bridge/useEditorBridge'

export type Device = 'Desktop' | 'Tablet' | 'Mobile'

export const deviceOptions: Array<{ key: Device; icon: string; label: string }> = [
  { key: 'Desktop', icon: 'lucide:monitor',    label: 'Desktop' },
  { key: 'Tablet',  icon: 'lucide:tablet',     label: 'Tablet (768px)' },
  { key: 'Mobile',  icon: 'lucide:smartphone', label: 'Mobile (375px)' },
]

export function useDevice() {
  const bridge = useEditorBridge()

  function setDevice(device: Device) {
    bridge.setCurrentDevice(device)
  }

  return {
    currentDevice: bridge.currentDevice,
    deviceOptions,
    setDevice,
  }
}
