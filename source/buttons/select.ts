import {ContextMessageUpdate} from 'telegraf'

import {ButtonInfo} from '../build-keyboard'
import {getRowsOfButtons} from '../align-buttons'
import {prefixEmoji} from '../prefix'

type ContextFunc<T> = (ctx: ContextMessageUpdate) => Promise<T> | T
type ContextKeyFunc<T> = (ctx: ContextMessageUpdate, key: string) => Promise<T> | T
type ContextKeyIndexArrFunc<T> = (ctx: ContextMessageUpdate, key: string, index: number, array: string[]) => Promise<T> | T

interface SelectButtonOptions {
  columns?: number;
  maxRows?: number;
  currentPage?: number;
  textFunc: ContextKeyIndexArrFunc<string>;
  hide?: ContextKeyFunc<boolean>;
}

export function generateSelectButtons(actionBase: string, options: string[], selectOptions: SelectButtonOptions): ButtonInfo[][] {
  const {textFunc, hide, columns, maxRows, currentPage} = selectOptions
  const buttons = options.map((key, i, arr) => {
    const action = `${actionBase}-${key}`
    const textKey = async (ctx: any): Promise<string> => textFunc(ctx, key, i, arr)
    const hideKey = async (ctx: any): Promise<boolean> => hide ? hide(ctx, key) : false
    return {
      text: textKey,
      action,
      hide: hideKey
    }
  })

  return getRowsOfButtons(buttons, columns, maxRows, currentPage)
}

export interface SelectButtonCreatorOptions {
  getCurrentPage?: ContextFunc<number>;
  textFunc?: ContextKeyIndexArrFunc<string>;
  prefixFunc?: ContextKeyIndexArrFunc<string>;
  isSetFunc?: ContextKeyFunc<boolean>;
  multiselect?: boolean;
  hide?: ContextKeyFunc<boolean>;
}

export function selectButtonCreator(action: string, optionsFunc: ContextFunc<string[] | {[key: string]: string}>, additionalArgs: SelectButtonCreatorOptions): (ctx: any) => Promise<ButtonInfo[][]> {
  const {getCurrentPage, textFunc, prefixFunc, isSetFunc, multiselect} = additionalArgs
  return async (ctx: any) => {
    const optionsResult = await optionsFunc(ctx)
    const keys = Array.isArray(optionsResult) ? optionsResult : Object.keys(optionsResult)
    const currentPage = (getCurrentPage && await getCurrentPage(ctx)) || 1
    const fallbackKeyTextFunc = Array.isArray(optionsResult) ? ((_ctx: any, key: string) => key) : ((_ctx: any, key: string) => optionsResult[key])
    const textOnlyFunc = textFunc || fallbackKeyTextFunc
    const keyTextFunc = (...args: any[]): Promise<string> => prefixEmoji(textOnlyFunc, prefixFunc || isSetFunc, {
      hideFalseEmoji: !multiselect
    }, ...args)
    return generateSelectButtons(action, keys, {
      textFunc: keyTextFunc,
      currentPage,
      ...additionalArgs
    })
  }
}