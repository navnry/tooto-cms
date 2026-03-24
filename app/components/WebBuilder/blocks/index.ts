/**
 * blocks/index.ts — Register all blocks with GrapesJS
 *
 * Each category lives in its own file. Import and call its register function here.
 */
import type { Editor } from 'grapesjs'
import { registerLayout }    from './layout'
import { registerTypography } from './typography'
import { registerMedia }     from './media'
import { registerButton }    from './button'
import { registerBasicUI }   from './basic-ui'
import { registerSections }  from './sections'
import { registerForm }      from './form'
import { registerTabs }      from './tabs'
import { registerNavbar }    from './navbar'
import { registerSearch }    from './search'
import { registerLogo }      from './logo'
import { registerFooter }    from './footer'
import { registerVideo }     from './video'

export function registerBlocks(editor: Editor): void {
  registerLayout(editor)
  registerTypography(editor)
  registerMedia(editor)
  registerButton(editor)
  registerBasicUI(editor)
  registerSections(editor)
  registerForm(editor)
  registerTabs(editor)
  registerNavbar(editor)
  registerSearch(editor)
  registerLogo(editor)
  registerFooter(editor)
  registerVideo(editor)
}
