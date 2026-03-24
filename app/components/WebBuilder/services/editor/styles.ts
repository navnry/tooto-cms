import type { Component as GjsComponent, Editor } from 'grapesjs'

export type StyleApplyMode = 'component' | 'classes'

export function buildStyleSelector(
  component: GjsComponent,
  applyMode: StyleApplyMode,
  state: string,
): string {
  const stateSuffix = state ? `:${state}` : ''
  if (applyMode === 'classes') {
    const classes = component.getClasses() as string[]
    return classes.length ? classes.map((name) => `.${name}`).join('') + stateSuffix : ''
  }
  return `#${component.getId()}${stateSuffix}`
}

export function getStyleValue(
  editor: Editor,
  component: GjsComponent,
  applyMode: StyleApplyMode,
  state: string,
  prop: string,
): string {
  if (applyMode === 'component' && state === '') {
    return (component.getStyle() as Record<string, string>)[prop] ?? ''
  }

  const selector = buildStyleSelector(component, applyMode, state)
  if (!selector) return ''
  const rule = editor.Css.getRule(selector)
  return ((rule?.getStyle() ?? {}) as Record<string, string>)[prop] ?? ''
}

export function getComputedStyleValue(
  component: GjsComponent,
  prop: string,
): string {
  const element = component.getEl()
  if (!element) return ''

  const view = element.ownerDocument?.defaultView
  if (!view) return ''

  const value = view.getComputedStyle(element).getPropertyValue(prop).trim()
  return value === 'normal' ? '' : value
}

export function setStyleValue(
  editor: Editor,
  component: GjsComponent,
  applyMode: StyleApplyMode,
  state: string,
  prop: string,
  value: string,
): void {
  if (applyMode === 'component' && state === '') {
    if (!value) {
      const styles = { ...(component.getStyle() as Record<string, string>) }
      delete styles[prop]
      component.setStyle(styles as Parameters<typeof component.setStyle>[0])
    } else {
      component.addStyle({ [prop]: value } as Parameters<typeof component.addStyle>[0])
    }
    return
  }

  const selector = buildStyleSelector(component, applyMode, state)
  if (!selector) return

  if (!value) {
    const rule = editor.Css.getRule(selector)
    if (!rule) return
    const styles = { ...(rule.getStyle() as Record<string, string>) }
    delete styles[prop]
    rule.setStyle(styles as Parameters<typeof rule.setStyle>[0])
    return
  }

  editor.Css.setRule(selector, { [prop]: value }, { addStyles: true })
}
