'use client'

import {
  PROFILE_ALLOWED_IMAGE_TYPES,
  PROFILE_IMAGE_MAX_BYTES,
} from '@/lib/profile'

function readFileAsArrayBuffer(file: File) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () =>
      reject(reader.error ?? new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

async function isAnimatedGif(file: File) {
  const buffer = await readFileAsArrayBuffer(file)
  const bytes = new Uint8Array(buffer)

  if (bytes.length < 14) return false

  const signature = String.fromCharCode(...bytes.slice(0, 6))
  if (signature !== 'GIF87a' && signature !== 'GIF89a') {
    return false
  }

  let offset = 13
  const packed = bytes[10]
  const hasGlobalColorTable = (packed & 0x80) !== 0
  if (hasGlobalColorTable) {
    const size = 3 * 2 ** ((packed & 0x07) + 1)
    offset += size
  }

  let frames = 0

  while (offset < bytes.length) {
    const blockType = bytes[offset]

    if (blockType === 0x3b) {
      break
    }

    if (blockType === 0x21) {
      const label = bytes[offset + 1]
      if (label === 0xf9) {
        offset += 8
        continue
      }

      offset += 2
      while (offset < bytes.length) {
        const blockLength = bytes[offset]
        offset += 1
        if (blockLength === 0) {
          break
        }
        offset += blockLength
      }
      continue
    }

    if (blockType === 0x2c) {
      frames += 1
      if (frames > 1) return true

      if (offset + 10 > bytes.length) {
        break
      }

      const descriptorPacked = bytes[offset + 9]
      offset += 10

      if ((descriptorPacked & 0x80) !== 0) {
        const localColorTableSize = 3 * 2 ** ((descriptorPacked & 0x07) + 1)
        offset += localColorTableSize
      }

      offset += 1
      while (offset < bytes.length) {
        const blockLength = bytes[offset]
        offset += 1
        if (blockLength === 0) {
          break
        }
        offset += blockLength
      }
      continue
    }

    break
  }

  return false
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load image preview'))
    image.src = url
  })
}

export type ProfileImageCrop = {
  positionX?: number
  positionY?: number
  zoom?: number
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

export async function validateProfileImageFile(file: File) {
  if (!PROFILE_ALLOWED_IMAGE_TYPES.has(file.type)) {
    return 'Choose a JPG, PNG, WEBP, or static GIF under 2MB.'
  }

  if (file.size > PROFILE_IMAGE_MAX_BYTES) {
    return 'Choose an image smaller than 2MB.'
  }

  if (file.type === 'image/gif' && (await isAnimatedGif(file))) {
    return 'Animated GIFs are not supported for profile photos.'
  }

  return null
}

export async function createCenteredSquareAvatarBlob(
  file: File,
  size = 512,
  crop: ProfileImageCrop = {}
) {
  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await loadImage(objectUrl)
    const zoom = clamp(crop.zoom ?? 1, 1, 3)
    const positionX = clamp(crop.positionX ?? 50, 0, 100)
    const positionY = clamp(crop.positionY ?? 50, 0, 100)
    const cropSize = Math.min(image.naturalWidth, image.naturalHeight) / zoom
    const centerX = (image.naturalWidth * positionX) / 100
    const centerY = (image.naturalHeight * positionY) / 100
    const cropX = clamp(
      centerX - cropSize / 2,
      0,
      image.naturalWidth - cropSize
    )
    const cropY = clamp(
      centerY - cropSize / 2,
      0,
      image.naturalHeight - cropSize
    )

    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Profile photo canvas could not be created')
    }

    context.clearRect(0, 0, size, size)
    context.drawImage(image, cropX, cropY, cropSize, cropSize, 0, 0, size, size)

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error('Failed to prepare cropped avatar'))
            return
          }
          resolve(result)
        },
        'image/png',
        0.92
      )
    })

    return blob
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
