import { subscribeTheme } from '@/features/theme/store'
import { useEffect } from 'react'

/** Pinta la barra de estado con el color de la parte superior de la pantalla mientras está montada. */
export function useThemeColor(cssVar: string) {
  useEffect(() => {
    const metas = [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')]
    const previous = metas.map((meta) => meta.content)

    const apply = () => {
      const color = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()
      if (color) for (const meta of metas) meta.content = color
    }

    apply()
    const unsub = subscribeTheme(apply)
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', apply)

    return () => {
      unsub()
      media.removeEventListener('change', apply)
      metas.forEach((meta, i) => {
        meta.content = previous[i]
      })
    }
  }, [cssVar])
}
