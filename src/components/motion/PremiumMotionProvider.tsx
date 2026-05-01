'use client'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  motionCssVariables,
  motionGroupDistancesPx,
  motionGroupStaggerMs,
  type MotionGroupName,
} from './tokens'

gsap.registerPlugin(ScrollTrigger)

const REVEAL_SELECTOR = [
  '[data-motion-group] > :where(header, section, article, aside, footer, li, div):not([data-motion-skip])',
  '[data-motion-section]',
  'main > :where(header, section, article, form, div):not([data-motion-skip])',
  '.section-shell > :where(header, section, article, div):not([data-motion-skip])',
  '.panel:not([data-motion-skip])',
  '.panel-muted:not([data-motion-skip])',
].join(',')

const MOTION_EXCLUDE_SELECTOR = [
  '[data-motion-disabled]',
  '[data-motion-skip]',
  '[role="dialog"]',
  '[data-radix-popper-content-wrapper]',
].join(',')

const LENIS_PREVENT_SELECTOR = [
  '[data-lenis-prevent]',
  '[data-lenis-prevent-wheel]',
  '[data-lenis-prevent-touch]',
  '[data-native-scroll]',
  '[role="dialog"]',
  '[data-radix-popper-content-wrapper]',
  'input',
  'textarea',
  'select',
  '[contenteditable="true"]',
].join(',')

let nextMotionGroupId = 0

function getMotionGroupDetails(node: HTMLElement) {
  const groupNode = node.closest<HTMLElement>('[data-motion-group]')

  if (!groupNode) {
    return null
  }

  if (!groupNode.dataset.motionGroupId) {
    groupNode.dataset.motionGroupId = `motion-group-${nextMotionGroupId}`
    nextMotionGroupId += 1
  }

  const name = (groupNode.dataset.motionGroup || 'default') as MotionGroupName

  return {
    id: groupNode.dataset.motionGroupId,
    name: name in motionGroupStaggerMs ? name : 'default',
  }
}

function isNestedScrollContainer(node: HTMLElement) {
  const style = window.getComputedStyle(node)
  const scrollableY =
    /(auto|scroll|overlay)/.test(style.overflowY) &&
    node.scrollHeight > node.clientHeight + 1
  const scrollableX =
    /(auto|scroll|overlay)/.test(style.overflowX) &&
    node.scrollWidth > node.clientWidth + 1

  return scrollableY || scrollableX
}

function shouldPreventSmoothScroll(node: HTMLElement | null) {
  let current = node

  while (
    current &&
    current !== document.body &&
    current !== document.documentElement
  ) {
    if (current.matches(LENIS_PREVENT_SELECTOR) || isNestedScrollContainer(current)) {
      return true
    }

    current = current.parentElement
  }

  return false
}

function setupPremiumSmoothScroll() {
  const root = document.documentElement

  const lenis = new Lenis({
    smoothWheel: true,
    syncTouch: true,
    syncTouchLerp: 0.09,
    touchInertiaExponent: 1.45,
    lerp: 0.085,
    wheelMultiplier: 0.92,
    gestureOrientation: 'vertical',
    overscroll: true,
    autoResize: true,
    anchors: {
      offset: -96,
      duration: 1.15,
      lock: true,
    },
    stopInertiaOnNavigate: true,
    prevent: (node) => shouldPreventSmoothScroll(node),
    virtualScroll: ({ event }) => {
      return !(event instanceof WheelEvent && (event.ctrlKey || event.metaKey))
    },
  })

  const updateAmbientState = (scroll: number, limit: number) => {
    root.style.setProperty('--motion-ambient-y', `${Math.round(scroll * -0.04)}px`)
    root.style.setProperty(
      '--scroll-progress',
      limit > 0 ? Math.min(1, scroll / limit).toFixed(4) : '0'
    )
  }

  const handleLenisScroll = (instance: Lenis) => {
    updateAmbientState(instance.scroll, instance.limit)
    ScrollTrigger.update()
  }

  const handleTicker = (time: number) => {
    lenis.raf(time * 1000)
  }

  const handleResize = () => {
    lenis.resize()
    ScrollTrigger.refresh()
  }

  lenis.on('scroll', handleLenisScroll)
  updateAmbientState(lenis.scroll, lenis.limit)

  gsap.ticker.add(handleTicker)
  gsap.ticker.lagSmoothing(0)
  window.addEventListener('resize', handleResize)

  return {
    lenis,
    destroy: () => {
      window.removeEventListener('resize', handleResize)
      lenis.off('scroll', handleLenisScroll)
      gsap.ticker.remove(handleTicker)
      lenis.destroy()
      root.style.removeProperty('--motion-ambient-y')
      root.style.removeProperty('--scroll-progress')
    },
  }
}

function setupSectionReveals(reducedMotion: boolean) {
  if (reducedMotion) {
    let mutationFrame = 0

    const revealAll = () => {
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)
      ).filter((node) => !node.closest(MOTION_EXCLUDE_SELECTOR))

      nodes.forEach((node) => {
        node.dataset.motionSection = node.dataset.motionSection || 'reveal'
        node.dataset.motionVisible = 'true'
      })
    }

    const mutationObserver = new MutationObserver(() => {
      if (mutationFrame) {
        return
      }

      mutationFrame = window.requestAnimationFrame(() => {
        mutationFrame = 0
        revealAll()
      })
    })

    revealAll()
    mutationObserver.observe(document.body, { childList: true, subtree: true })
    document.documentElement.dataset.premiumMotion = 'reduced'

    return () => {
      mutationObserver.disconnect()

      if (mutationFrame) {
        window.cancelAnimationFrame(mutationFrame)
      }
    }
  }

  const seen = new WeakSet<HTMLElement>()
  let mutationFrame = 0
  let revealIndex = 0
  const groupedRevealIndexes = new Map<string, number>()

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return
        }

        const element = entry.target as HTMLElement
        element.dataset.motionVisible = 'true'
        observer.unobserve(element)
      })
    },
    {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.08,
    }
  )

  const attachNodes = () => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)
    ).filter((node) => !node.closest(MOTION_EXCLUDE_SELECTOR))

    nodes.forEach((node) => {
      if (seen.has(node)) {
        return
      }

      seen.add(node)
      node.dataset.motionSection = node.dataset.motionSection || 'reveal'

      const group = getMotionGroupDetails(node)
      const groupIndex = group
        ? (groupedRevealIndexes.get(group.id) ?? 0)
        : revealIndex
      const staggerMs = group
        ? motionGroupStaggerMs[group.name]
        : motionGroupStaggerMs.default
      const distancePx = group
        ? motionGroupDistancesPx[group.name]
        : motionGroupDistancesPx.default

      node.style.setProperty(
        '--motion-delay',
        `${Math.min(groupIndex, 7) * staggerMs}ms`
      )
      node.style.setProperty('--motion-node-distance', `${distancePx}px`)

      if (group) {
        groupedRevealIndexes.set(group.id, groupIndex + 1)
      } else {
        revealIndex += 1
      }

      const rect = node.getBoundingClientRect()
      const isInitiallyVisible =
        rect.top < window.innerHeight * 0.92 && rect.bottom > 0

      if (isInitiallyVisible) {
        node.dataset.motionVisible = 'true'
        return
      }

      node.dataset.motionVisible = 'false'
      observer.observe(node)
    })
  }

  const mutationObserver = new MutationObserver(() => {
    if (mutationFrame) {
      return
    }

    mutationFrame = window.requestAnimationFrame(() => {
      mutationFrame = 0
      attachNodes()
    })
  })

  attachNodes()
  mutationObserver.observe(document.body, { childList: true, subtree: true })
  document.documentElement.dataset.premiumMotion = 'ready'

  return () => {
    observer.disconnect()
    mutationObserver.disconnect()

    if (mutationFrame) {
      window.cancelAnimationFrame(mutationFrame)
    }
  }
}

type PremiumMotionProviderProps = {
  children: ReactNode
}

export function PremiumMotionProvider({
  children,
}: PremiumMotionProviderProps) {
  const pathname = usePathname()
  const [reducedMotion, setReducedMotion] = useState(false)
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const root = document.documentElement

    Object.entries(motionCssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    return () => {
      Object.keys(motionCssVariables).forEach((key) => {
        root.style.removeProperty(key)
      })
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncPreference = () => setReducedMotion(media.matches)

    syncPreference()
    media.addEventListener('change', syncPreference)

    return () => media.removeEventListener('change', syncPreference)
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.dataset.premiumMotion = 'reduced'
      lenisRef.current = null
      return undefined
    }

    const scrollEngine = setupPremiumSmoothScroll()
    lenisRef.current = scrollEngine.lenis

    return () => {
      lenisRef.current = null
      scrollEngine.destroy()
    }
  }, [reducedMotion])

  useEffect(() => {
    let cleanupReveals: (() => void) | undefined

    // Delay motion setup to ensure React hydration is fully complete
    // before mutating data-motion-* attributes on DOM elements.
    const timeout = window.setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          cleanupReveals = setupSectionReveals(reducedMotion)
          lenisRef.current?.resize()
          ScrollTrigger.refresh()
        })
      })
    }, 80)

    return () => {
      window.clearTimeout(timeout)
      cleanupReveals?.()
    }
  }, [pathname, reducedMotion])

  return <>{children}</>
}
