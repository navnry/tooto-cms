import type { InjectionKey, ShallowRef, Ref } from 'vue'
import type { Component } from 'grapesjs'

export interface LayerCtx {
  /** The component that just fired layer:component */
  updatedCmp: ShallowRef<Component | null>
  /** Increments each time layer:component fires */
  tick: Ref<number>
  /** The component currently being dragged */
  dragSrc: ShallowRef<Component | null>
}

export const LAYER_CTX: InjectionKey<LayerCtx> = Symbol('layerCtx')
