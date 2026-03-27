import type { Editor } from 'grapesjs'
import { CHILD, ICON_CLOSE, TYPE_VIDEO, VIDEO_BLOCK_ICON } from './constants'
import { videoScript as script } from './script'
import { VIDEO_STYLES } from './styles'
import { createBlockSuite, defineComponentBlock } from '../registry'

export function registerVideo(editor: Editor): void {
  createBlockSuite({
    componentBlocks: [
      defineComponentBlock({
        type: TYPE_VIDEO,
        component: {
          isComponent: (el: HTMLElement) =>
            el.classList?.contains('gjs-video') ? { type: TYPE_VIDEO } : undefined,
          model: {
            defaults: {
              name: 'Video',
              tagName: 'div',
              draggable: true,
              droppable: false,
              attributes: {
                class: 'gjs-video',
                'data-video-url': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                'data-cover': '',
                'data-play-icon': 'circle-outline',
                'data-play-size': '64',
              },
              traits: [
                {
                  type: 'text',
                  name: 'data-video-url',
                  label: 'Video URL',
                  placeholder: 'https://www.youtube.com/embed/...',
                },
                {
                  type: 'text',
                  name: 'data-cover',
                  label: 'Cover Image',
                  placeholder: 'https://example.com/cover.jpg',
                },
                {
                  type: 'select',
                  name: 'data-play-icon',
                  label: 'Play Icon',
                  options: [
                    { id: 'circle-outline', name: 'Circle Outline' },
                    { id: 'circle-filled', name: 'Circle Filled' },
                    { id: 'minimal', name: 'Minimal' },
                  ],
                },
                {
                  type: 'select',
                  name: 'data-play-size',
                  label: 'Play Size',
                  options: [
                    { id: '48', name: 'Small (48)' },
                    { id: '64', name: 'Medium (64)' },
                    { id: '80', name: 'Large (80)' },
                  ],
                },
              ],
              script,
              'script-export': script,
              styles: VIDEO_STYLES,
              components: [
                {
                  tagName: 'div',
                  classes: ['gjs-video__cover'],
                  ...CHILD,
                  components: [
                    {
                      tagName: 'img',
                      classes: ['gjs-video__thumb'],
                      attributes: { alt: 'Video cover' },
                      ...CHILD,
                    },
                    {
                      tagName: 'div',
                      classes: ['gjs-video__play'],
                      ...CHILD,
                    },
                  ],
                },
                {
                  tagName: 'div',
                  classes: ['gjs-video__modal'],
                  ...CHILD,
                  components: [
                    {
                      tagName: 'div',
                      classes: ['gjs-video__modal-inner'],
                      ...CHILD,
                      components: [
                        {
                          tagName: 'button',
                          classes: ['gjs-video__close'],
                          attributes: { 'aria-label': 'Close video', type: 'button' },
                          content: ICON_CLOSE,
                          ...CHILD,
                        },
                        {
                          tagName: 'div',
                          classes: ['gjs-video__iframe-wrap'],
                          ...CHILD,
                          components: [
                            {
                              tagName: 'iframe',
                              classes: ['gjs-video__iframe'],
                              attributes: { allowfullscreen: 'true', title: 'Video player' },
                              ...CHILD,
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
        block: {
          id: 'video',
          definition: {
            label: 'Video',
            category: 'Media',
            media: VIDEO_BLOCK_ICON,
          },
        },
      }),
    ],
  })(editor)
}
