import type { Component, Editor } from 'grapesjs'
import { makeSelectTrait } from '../../utils/traitFactory'
import { createBlockSuite, defineComponentBlock } from '../registry'

export const WB_HEADING_TYPE = 'wb-heading'

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

function normalizeHeadingTag(value: unknown): string {
  const tag = `${value || 'h2'}`.toLowerCase()
  return HEADING_TAGS.has(tag) ? tag : 'h2'
}

function applyHeadingTag(this: Component) {
  const tag = normalizeHeadingTag(this.get('headingTag'))
  this.set('headingTag', tag, { silent: true })
  this.addAttributes({ 'data-heading-tag': tag })
  if (this.get('tagName') !== tag) {
    this.set('tagName', tag)
  }
}

/**
 * 注册标题组件 + Block
 * - 继承 GrapesJS 内置 text 类型，支持双击直接在画布内联编辑文本
 * - headingTag prop 驱动 tagName 切换，同时同步一个 data-heading-tag 语义属性
 */
export function registerHeading(editor: Editor) {
  createBlockSuite({
    componentBlocks: [
      defineComponentBlock({
        type: WB_HEADING_TYPE,
        component: {
          extend: 'text',
          // isComponent 仅在解析原始 HTML 字符串时触发（从 JSON/对象创建时跳过）
          isComponent: (el: HTMLElement) =>
            el?.getAttribute?.('data-wb-component') === 'heading'
              ? { type: WB_HEADING_TYPE }
              : false,
          model: {
            defaults: {
              name: '标题',
              tagName: 'h2',
              droppable: false,
              attributes: {
                'data-wb-component': 'heading',
                'data-heading-tag': 'h2',
              },
              style: {
                margin: '0 0 16px 0',
                color: 'var(--color-text-primary, #111827)',
                'font-weight': '700',
                'line-height': '1.3',
              },
              headingTag: 'h2',
              components: '标题',
              traits: [
                makeSelectTrait('HTML 标签', 'headingTag', [
                  { value: 'h1', label: 'H1' },
                  { value: 'h2', label: 'H2' },
                  { value: 'h3', label: 'H3' },
                  { value: 'h4', label: 'H4' },
                  { value: 'h5', label: 'H5' },
                  { value: 'h6', label: 'H6' },
                ]),
              ],
            },
            init(this: Component) {
              const initialTag = normalizeHeadingTag(this.get('tagName') || this.get('headingTag'))
              if (this.get('headingTag') !== initialTag) {
                this.set('headingTag', initialTag, { silent: true })
              }
              this.addAttributes({ 'data-heading-tag': initialTag }, { silent: true })
              this.on('change:headingTag', applyHeadingTag)
            },
            applyHeadingTag,
          },
        },
        block: {
          id: 'heading',
          definition: {
            label: 'Heading',
            category: 'Typography',
            media: 'lucide:heading',
          },
        },
      }),
    ],
  })(editor)
}
