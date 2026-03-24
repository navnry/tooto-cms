/**
 * styleContext — Injection key + interface for the Style Panel's CSS API
 */
import type { InjectionKey, ComputedRef, Ref } from 'vue'

export interface StyleCtx {
  /** Get CSS property value for the currently selected component */
  get(prop: string): string
  /** Get computed/inherited CSS property value when there is no explicit current value */
  getPlaceholder(prop: string): string
  /** Set a single CSS property */
  set(prop: string, value: string): void
  /** Set multiple CSS properties atomically */
  setMany(props: Record<string, string>): void
  /** Remove a CSS property */
  clear(prop: string): void
  /** Whether the component has an explicit value for this property */
  hasValue(prop: string): boolean
  /** Whether any component is currently selected */
  hasSelection: ComputedRef<boolean>
  /** Reactive counter — increments on every style change */
  tick: ComputedRef<number>

  // ── Pseudo-state ──────────────────────────────────────────────────────────
  /** Current pseudo-state: '' | 'hover' | 'focus' */
  state: Ref<string>
  setState(s: string): void

  // ── Apply mode ────────────────────────────────────────────────────────────
  /** Whether styles are written to the component or to its CSS classes */
  applyMode: Ref<'component' | 'classes'>
  setApplyMode(m: 'component' | 'classes'): void

  // ── Class management ──────────────────────────────────────────────────────
  /** CSS classes on the currently selected component */
  classes: ComputedRef<string[]>
  addClass(name: string): void
  removeClass(name: string): void

  // ── CSS editor ────────────────────────────────────────────────────────────
  /** Whether the raw CSS editor is open (hides style sections when true) */
  showCssEditor: Ref<boolean>
}

export const STYLE_CTX: InjectionKey<StyleCtx> = Symbol('styleCtx')
