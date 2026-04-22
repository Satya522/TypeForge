import { randomUUID } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

const AVATAR_DIRECTORY = path.join(process.cwd(), 'public', 'uploads', 'avatars')
const LOCAL_AVATAR_PREFIX = '/uploads/avatars/'

function getExtensionFromType(type?: string) {
  switch (type) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    default:
      return 'png'
  }
}

export async function saveAvatarFile(userId: string, file: File) {
  await mkdir(AVATAR_DIRECTORY, { recursive: true })

  const extension = getExtensionFromType(file.type)
  const fileName = `${userId}-${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`
  const filePath = path.join(AVATAR_DIRECTORY, fileName)
  const buffer = Buffer.from(await file.arrayBuffer())

  await writeFile(filePath, buffer)

  return `${LOCAL_AVATAR_PREFIX}${fileName}`
}

export async function removeStoredAvatar(avatarUrl?: string | null) {
  if (!avatarUrl || !avatarUrl.startsWith(LOCAL_AVATAR_PREFIX)) {
    return
  }

  const filePath = path.join(process.cwd(), 'public', avatarUrl.replace(/^\//, ''))

  try {
    await unlink(filePath)
  } catch (error: any) {
    if (error?.code !== 'ENOENT') {
      throw error
    }
  }
}
