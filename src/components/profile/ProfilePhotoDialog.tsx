'use client'

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Loader2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { RangeSlider } from '@/components/ui/range-slider'
import {
  createCenteredSquareAvatarBlob,
  type ProfileImageCrop,
} from '@/lib/profile-image'

type ProfilePhotoDialogProps = {
  file: File | null
  isOpen: boolean
  onClose: () => void
  onSave: (blob: Blob) => Promise<void> | void
}

type CropState = Required<ProfileImageCrop>

type DragStart = {
  clientX: number
  clientY: number
  positionX: number
  positionY: number
}

const DEFAULT_CROP: CropState = {
  positionX: 50,
  positionY: 50,
  zoom: 1,
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

export function ProfilePhotoDialog({
  file,
  isOpen,
  onClose,
  onSave,
}: ProfilePhotoDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [crop, setCrop] = useState<CropState>(DEFAULT_CROP)
  const cropAreaRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef<DragStart | null>(null)
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  )
  const previewImageStyle = useMemo<CSSProperties>(
    () => ({
      objectPosition: `${crop.positionX}% ${crop.positionY}%`,
      transform: `scale(${crop.zoom})`,
      transformOrigin: `${crop.positionX}% ${crop.positionY}%`,
    }),
    [crop]
  )

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  useEffect(() => {
    setCrop(DEFAULT_CROP)
  }, [file])

  function updateCrop(value: Partial<CropState>) {
    setCrop((currentCrop) => ({
      positionX: clamp(value.positionX ?? currentCrop.positionX, 0, 100),
      positionY: clamp(value.positionY ?? currentCrop.positionY, 0, 100),
      zoom: clamp(value.zoom ?? currentCrop.zoom, 1, 3),
    }))
  }

  function handleCropPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (isSaving) return

    dragStartRef.current = {
      clientX: event.clientX,
      clientY: event.clientY,
      positionX: crop.positionX,
      positionY: crop.positionY,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handleCropPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const dragStart = dragStartRef.current
    const bounds = cropAreaRef.current?.getBoundingClientRect()

    if (!dragStart || !bounds) return

    const sensitivity = 100 / crop.zoom
    const deltaX =
      ((event.clientX - dragStart.clientX) / bounds.width) * sensitivity
    const deltaY =
      ((event.clientY - dragStart.clientY) / bounds.height) * sensitivity

    updateCrop({
      positionX: dragStart.positionX - deltaX,
      positionY: dragStart.positionY - deltaY,
    })
  }

  function handleCropPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    dragStartRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  async function handleSave() {
    if (!file) return

    setIsSaving(true)
    try {
      const blob = await createCenteredSquareAvatarBlob(file, 512, crop)
      await onSave(blob)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && file && previewUrl ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!isSaving) {
                onClose()
              }
            }}
            aria-label="Close photo crop dialog"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto max-h-[calc(100dvh-2rem)] w-[min(94vw,48rem)] overflow-hidden rounded-[28px] bg-[#101216]/96 shadow-[0_28px_90px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.07] backdrop-blur-xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-photo-title"
            >
              <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
                <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-5 sm:px-6">
                  <div>
                    <h2
                      id="profile-photo-title"
                      className="text-[18px] font-semibold tracking-[-0.02em] text-white"
                    >
                      Preview photo
                    </h2>
                    <p className="mt-1.5 max-w-xl text-[13px] leading-5 text-zinc-400">
                      Drag the photo or tune the controls if the automatic crop
                      misses the framing.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSaving}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-600 transition-colors duration-150 ease-out hover:bg-white/[0.05] hover:text-zinc-300 disabled:pointer-events-none disabled:opacity-40"
                    aria-label="Close photo preview"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6">
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_12rem]">
                    <div className="rounded-[24px] bg-white/[0.025] p-2 ring-1 ring-white/[0.055]">
                      <div
                        ref={cropAreaRef}
                        className="relative flex aspect-square max-h-[min(56vh,24rem)] w-full touch-none select-none items-center justify-center overflow-hidden rounded-[18px] bg-black/35 cursor-grab active:cursor-grabbing"
                        onPointerDown={handleCropPointerDown}
                        onPointerMove={handleCropPointerMove}
                        onPointerUp={handleCropPointerEnd}
                        onPointerCancel={handleCropPointerEnd}
                        aria-label="Drag photo to reposition crop"
                      >
                        <img
                          src={previewUrl}
                          alt="Selected profile preview"
                          className="h-full w-full object-cover transition-transform duration-150 ease-out will-change-transform"
                          draggable={false}
                          style={previewImageStyle}
                        />
                        <div className="pointer-events-none absolute inset-4 rounded-[18px] ring-1 ring-white/25" />
                        <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-[11px] text-zinc-300 backdrop-blur">
                          Drag to reposition
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center rounded-[24px] bg-white/[0.025] px-4 py-5 ring-1 ring-white/[0.055]">
                      <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-600">
                        Circle
                      </span>
                      <div className="mt-4 h-24 w-24 overflow-hidden rounded-full bg-black/30 ring-1 ring-white/10">
                        <img
                          src={previewUrl}
                          alt=""
                          aria-hidden="true"
                          className="h-full w-full object-cover transition-transform duration-150 ease-out will-change-transform"
                          draggable={false}
                          style={previewImageStyle}
                        />
                      </div>
                      <p className="mt-4 text-center text-[12px] leading-5 text-zinc-500">
                        This is how it will appear in chat and members.
                      </p>
                      <div className="mt-5 w-full space-y-4">
                        <RangeSlider
                          label="Zoom"
                          value={crop.zoom}
                          min={1}
                          max={3}
                          step={0.05}
                          displayValue={`${Math.round(crop.zoom * 100)}%`}
                          disabled={isSaving}
                          onChange={(zoom) => updateCrop({ zoom })}
                        />
                        <RangeSlider
                          label="Horizontal"
                          value={crop.positionX}
                          min={0}
                          max={100}
                          step={1}
                          displayValue={`${Math.round(crop.positionX)}%`}
                          disabled={isSaving}
                          onChange={(positionX) => updateCrop({ positionX })}
                        />
                        <RangeSlider
                          label="Vertical"
                          value={crop.positionY}
                          min={0}
                          max={100}
                          step={1}
                          displayValue={`${Math.round(crop.positionY)}%`}
                          disabled={isSaving}
                          onChange={(positionY) => updateCrop({ positionY })}
                        />
                        <button
                          type="button"
                          onClick={() => setCrop(DEFAULT_CROP)}
                          disabled={isSaving}
                          className="text-[12px] text-zinc-500 transition-colors duration-150 ease-out hover:text-zinc-300 disabled:pointer-events-none disabled:opacity-45"
                        >
                          Reset crop
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-white/[0.06] bg-white/[0.018] px-5 py-4 sm:px-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    disabled={isSaving}
                    className="rounded-2xl px-4 text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-2xl px-5"
                  >
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Save
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
