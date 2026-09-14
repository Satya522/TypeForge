'use server';

import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Middleware-like check for admin
async function ensureAdmin() {
  const session = await getServerAuthSession();
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
}

// --- Lesson Paths ---

export async function createLessonPath(data: {
  title: string;
  slug: string;
  description: string;
  order: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}) {
  await ensureAdmin();
  await prisma.lessonPath.create({ data });
  revalidatePath('/admin');
}

export async function updateLessonPath(id: string, data: {
  title: string;
  slug: string;
  description: string;
  order: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}) {
  await ensureAdmin();
  await prisma.lessonPath.update({ where: { id }, data });
  revalidatePath('/admin');
}

export async function deleteLessonPath(id: string) {
  await ensureAdmin();
  await prisma.lessonPath.delete({ where: { id } });
  revalidatePath('/admin');
}

// --- Lessons ---

export async function createLesson(data: {
  lessonPathId: string;
  title: string;
  slug: string;
  description: string;
  order: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  xpReward: number;
  targetKeys: string;
}) {
  await ensureAdmin();
  await prisma.lesson.create({ data });
  revalidatePath('/admin');
}

export async function updateLesson(id: string, data: {
  title: string;
  slug: string;
  description: string;
  order: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  xpReward: number;
  targetKeys: string;
}) {
  await ensureAdmin();
  await prisma.lesson.update({ where: { id }, data });
  revalidatePath('/admin');
}

export async function deleteLesson(id: string) {
  await ensureAdmin();
  await prisma.lesson.delete({ where: { id } });
  revalidatePath('/admin');
}
