'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import {
  motionCssVariables,
  motionGroupDistancesPx,
  motionGroupStaggerMs,
  type MotionGroupName,
} from './tokens'

const REVEAL_SELECTOR = [
  '[data-motion-group] > :where(header, section, article, aside, footer, li, div):not([data-motion-skip])',
  '[data-motion-section]',
  'main > :where(header, section, article, form, div):not([data-motion-skip])',
  '.section-shell > :where(header, section, article, div):not([data-motion-skip])',
  '.panel:not([data-motion-skip])',
  '.panel-muted:not([data-motion-skip])',
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

const MOTION_EXCLUDE_SELECTOR = [
  '[data-motion-disabled]',
  '[data-motion-skip]',
  '[role="dialog"]',
  '[data-radix-popper-content-wrapper]',
].join(',')

function isScrollableElement(element: Element | null, deltaY: number) {
  let current = element instanceof HTMLElement ? element : null

  while (current && current !== document.body) {
    const style = window.getComputedStyle(current)
    const overflowY = style.overflowY
    const canScroll =
      /(auto|scroll|overlay)/.test(overflowY) &&
      current.scrollHeight > current.clientHeight + 1

    if (canScroll) {
      const goingDown = deltaY > 0
      const goingUp = deltaY < 0
      const canScrollDown =
        current.scrollTop + current.clientHeight < current.scrollHeight - 1
      const canScrollUp = current.scrollTop > 0

      return (goingDown && canScrollDown) || (goingUp && canScrollUp)
    }

    current = current.parentElement
  }

  return false
}

function getWheelDelta(event: WheelEvent) {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return event.deltaY * 16
  }

  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return event.deltaY * window.innerHeight
  }

  return event.deltaY
}

function setupSmoothWheelScroll() {
  const root = document.documentElement
  let targetY = window.scrollY
  let frame = 0

  const maxScroll = () => Math.max(0, root.scrollHeight - window.innerHeight)

  const clampTarget = (value: number) =>
    Math.min(maxScroll(), Math.max(0, value))

  const tick = () => {
    const currentY = window.scrollY
    const distance = targetY - currentY

    if (Math.abs(distance) < 0.6) {
      window.scrollTo(0, targetY)
      frame = 0
      return
    }

    window.scrollTo(0, currentY + distance * 0.18)
    frame = window.requestAnimationFrame(tick)
  }

  const onWheel = (event: WheelEvent) => {
    if (
      event.defaultPrevented ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      maxScroll() <= 0
    ) {
      return
    }

    const target = event.target instanceof Element ? event.target : null

    if (
      target?.closest(
        'input, textarea, select, [contenteditable="true"], [data-native-scroll]'
      ) ||
      isScrollableElement(target, event.deltaY)
    ) {
      targetY = window.scrollY
      return
    }

    event.preventDefault()
    targetY = clampTarget(targetY + getWheelDelta(event) * 0.86)

    if (!frame) {
      frame = window.requestAnimationFrame(tick)
    }
  }

  const syncTarget = () => {
    targetY = window.scrollY
  }

  window.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('keydown', syncTarget)
  window.addEventListener('resize', syncTarget)

  return () => {
    window.removeEventListener('wheel', onWheel)
    window.removeEventListener('keydown', syncTarget)
    window.removeEventListener('resize', syncTarget)

    if (frame) {
      window.cancelAnimationFrame(frame)
    }
  }
}

function setupAmbientParallax() {
  let frame = 0

  const update = () => {
    document.documentElement.style.setProperty(
      '--motion-ambient-y',
      `${Math.round(window.scrollY * -0.035)}px`
    )
    frame = 0
  }

  const onScroll = () => {
    if (!frame) {
      frame = window.requestAnimationFrame(update)
    }
  }

  update()
  window.addEventListener('scroll', onScroll, { passive: true })

  return () => {
    window.removeEventListener('scroll', onScroll)

    if (frame) {
      window.cancelAnimationFrame(frame)
    }

    document.documentElement.style.removeProperty('--motion-ambient-y')
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
      return undefined
    }

    const cleanupScroll = setupSmoothWheelScroll()
    const cleanupParallax = setupAmbientParallax()

    return () => {
      cleanupScroll()
      cleanupParallax()
    }
  }, [reducedMotion])

  useEffect(() => {
    let cleanupReveals: (() => void) | undefined

    const timeout = window.setTimeout(() => {
      cleanupReveals = setupSectionReveals(reducedMotion)
    }, 40)

    return () => {
      window.clearTimeout(timeout)
      cleanupReveals?.()
    }
  }, [pathname, reducedMotion])

  return <>{children}</>
}
