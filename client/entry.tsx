import type { ComponentType } from 'react'
import { IconFileText } from '@tabler/icons-react'

import { App } from './App'
import { createTextTranslator, dictionaries, I18nProvider, type LocaleSnapshot, type LocaleSource } from './i18n'

type Disposer = () => void

type ClientContext = {
  effect: (effect: () => Disposer | void) => unknown
  slots: {
    inject: (owner: string, effect: () => Disposer | void) => Disposer
    register: <P>(options: Record<string, unknown>, component: ComponentType<P>) => Disposer
  }
  locale: {
    register: (namespace: string, locale: string, dictionary: Record<string, string>) => Disposer
    bind: (namespace: string) => (key: string) => string
    getSnapshot: () => LocaleSnapshot
    subscribe: (listener: () => void) => Disposer
  }
}

const ID = 'dsh-doc-converter'
export const inject = ['slots', 'locale']

export function apply(ctx: ClientContext) {
  ctx.effect(() => ctx.locale.register(ID, 'zh', dictionaries.zh))
  ctx.effect(() => ctx.locale.register(ID, 'en', dictionaries.en))

  const source: LocaleSource = {
    subscribe: (listener) => ctx.locale.subscribe(listener),
    getSnapshot: () => ctx.locale.getSnapshot(),
    translate: ctx.locale.bind(ID),
  }
  const text = createTextTranslator(source.translate)

  function Page() {
    return <I18nProvider source={source}><App /></I18nProvider>
  }

  function PanelIcon({ size = 20 }: { size?: number; active?: boolean }) {
    return <IconFileText aria-hidden="true" size={size} stroke={1.75} />
  }

  ctx.effect(() => ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist', id: ID, order: 50, label: () => text('文档转换'),
  }, PanelIcon)))

  ctx.effect(() => ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main', key: ID,
  }, Page)))
}
