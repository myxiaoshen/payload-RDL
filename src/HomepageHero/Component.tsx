import React from 'react'

import type { HomepageHero as HomepageHeroGlobal } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'

import {
  DEFAULT_AUTOPLAY,
  DEFAULT_AUTOPLAY_INTERVAL_MS,
  DEFAULT_MENU_ITEMS,
  DEFAULT_SLIDES,
} from './defaults'
import {
  HomepageHeroClient,
  type HomepageHeroMenuItem,
  type HomepageHeroSlide,
} from './Component.client'

export async function HomepageHero() {
  const data: HomepageHeroGlobal = await getCachedGlobal('homepage-hero', 1)()

  const menuItems: HomepageHeroMenuItem[] =
    data.menuItems && data.menuItems.length > 0
      ? (data.menuItems as HomepageHeroMenuItem[])
      : DEFAULT_MENU_ITEMS

  const slides: HomepageHeroSlide[] =
    data.slides && data.slides.length > 0
      ? (data.slides as HomepageHeroSlide[])
      : (DEFAULT_SLIDES as HomepageHeroSlide[])

  const autoplay = data.autoplay ?? DEFAULT_AUTOPLAY
  const autoplayIntervalMs = data.autoplayIntervalMs ?? DEFAULT_AUTOPLAY_INTERVAL_MS

  return (
    <HomepageHeroClient
      menuItems={menuItems}
      slides={slides}
      autoplay={autoplay}
      autoplayIntervalMs={autoplayIntervalMs}
    />
  )
}
