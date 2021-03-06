import ActionCode from '../action-code'
import {InternalMenuOptions} from '../menu-options'

import {ButtonInfo} from './types'

export function generateBackButtons(actionCode: string, options: InternalMenuOptions): ButtonInfo[] {
  const {depth, hasMainMenu, backButtonText, mainMenuButtonText} = options
  if (actionCode === 'main' || depth === 0) {
    return []
  }

  const buttons: ButtonInfo[] = []

  if (depth > 1 && backButtonText) {
    buttons.push({
      text: backButtonText,
      action: new ActionCode(actionCode).parent().getString(),
      root: true
    })
  }

  if (depth > 0 && hasMainMenu && mainMenuButtonText) {
    buttons.push({
      text: mainMenuButtonText,
      action: 'main',
      root: true
    })
  }

  return buttons
}
