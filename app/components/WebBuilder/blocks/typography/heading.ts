import type { Editor } from 'grapesjs'
import { makeSelectTrait } from '../../utils/traitFactory'

export const WB_HEADING_TYPE = 'wb-heading'

/**
 * 注册标题组件 + Block
 * - 继承 GrapesJS 内置 text 类型，支持双击直接在画布内联编辑文本
 * - headingTag prop 驱动 tagName，变更时 GrapesJS 自动触发 view re-render
 */
export function registerHeading(editor: Editor) {
  const { DomComponents, BlockManager } = editor

  if (DomComponents.getType(WB_HEADING_TYPE)) return

  DomComponents.addType(WB_HEADING_TYPE, {
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
        attributes: { 'data-wb-component': 'heading' },
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
      init(this: any) {
        this.on('change:headingTag', this.applyHeadingTag)
        this.applyHeadingTag()
      },
      applyHeadingTag(this: any) {
        const tag = `${this.get('headingTag') || 'h2'}`.toLowerCase()
        if (this.get('tagName') !== tag) {
          this.set('tagName', tag)
        }
      },
    },
  })

  BlockManager.add('heading', {
    label: 'Heading',
    category: 'Typography',
    media: 'lucide:heading',
    content: { type: WB_HEADING_TYPE },
  })
}
