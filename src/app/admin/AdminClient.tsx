'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus, ChevronDown, ChevronUp, X } from 'lucide-react';
import {
  createLessonPath,
  updateLessonPath,
  deleteLessonPath,
  createLesson,
  updateLesson,
  deleteLesson
} from './actions';

type Lesson = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  order: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  xpReward: number;
  targetKeys: string | null;
  lessonPathId: string;
};

type LessonPath = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  order: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  lessons: Lesson[];
};

export default function AdminClient({ initialPaths }: { initialPaths: LessonPath[] }) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  
  // Modals state
  const [pathModal, setPathModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; data: Partial<LessonPath> | null }>({ isOpen: false, mode: 'create', data: null });
  const [lessonModal, setLessonModal] = useState<{ isOpen: boolean; mode: 'create' | 'edit'; data: Partial<Lesson> | null }>({ isOpen: false, mode: 'create', data: null });

  const togglePath = (id: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSavePath = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      order: parseInt(formData.get('order') as string),
      difficulty: formData.get('difficulty') as 'EASY' | 'MEDIUM' | 'HARD',
    };

    if (pathModal.mode === 'create') {
      await createLessonPath(data);
    } else if (pathModal.data?.id) {
      await updateLessonPath(pathModal.data.id, data);
    }
    setPathModal({ isOpen: false, mode: 'create', data: null });
  };

  const handleDeletePath = async (id: string) => {
    if (confirm('Are you sure you want to delete this Lesson Path and all its lessons?')) {
      await deleteLessonPath(id);
    }
  };

  const handleSaveLesson = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      lessonPathId: formData.get('lessonPathId') as string,
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      order: parseInt(formData.get('order') as string),
      difficulty: formData.get('difficulty') as 'EASY' | 'MEDIUM' | 'HARD',
      xpReward: parseInt(formData.get('xpReward') as string),
      targetKeys: formData.get('targetKeys') as string,
    };

    if (lessonModal.mode === 'create') {
      await createLesson(data);
    } else if (lessonModal.data?.id) {
      await updateLesson(lessonModal.data.id, data);
    }
    setLessonModal({ isOpen: false, mode: 'create', data: null });
  };

  const handleDeleteLesson = async (id: string) => {
    if (confirm('Are you sure you want to delete this Lesson?')) {
      await deleteLesson(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Lesson Paths</h2>
        <Button onClick={() => setPathModal({ isOpen: true, mode: 'create', data: null })}>
          <Plus className="w-4 h-4 mr-2" /> Add Path
        </Button>
      </div>

      <div className="space-y-4">
        {initialPaths.map((path) => (
          <div key={path.id} className="bg-surface-200 border border-surface-300 rounded-lg overflow-hidden">
            {/* Path Header */}
            <div className="p-4 flex items-center justify-between bg-surface-300/30 hover:bg-surface-300/50 transition-colors">
              <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => togglePath(path.id)}>
                {expandedPaths.has(path.id) ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                <div>
                  <h3 className="text-lg font-medium text-white">{path.title}</h3>
                  <p className="text-sm text-gray-400">{path.lessons.length} lessons • Order: {path.order}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setLessonModal({ isOpen: true, mode: 'create', data: { lessonPathId: path.id } })}>
                  <Plus className="w-4 h-4 text-accent-200" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setPathModal({ isOpen: true, mode: 'edit', data: path })}>
                  <Edit className="w-4 h-4 text-gray-300" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeletePath(path.id)}>
                  <Trash2 className="w-4 h-4 text-rose-400" />
                </Button>
              </div>
            </div>

            {/* Lessons List */}
            {expandedPaths.has(path.id) && (
              <div className="p-4 border-t border-surface-300 space-y-2">
                {path.lessons.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">No lessons in this path yet.</p>
                ) : (
                  path.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex justify-between items-center p-3 bg-surface-300 rounded-md">
                      <div>
                        <h4 className="text-white font-medium">{lesson.title}</h4>
                        <p className="text-xs text-gray-400">Order: {lesson.order} • XP: {lesson.xpReward} • Keys: {lesson.targetKeys || 'N/A'}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setLessonModal({ isOpen: true, mode: 'edit', data: lesson })}>
                          <Edit className="w-4 h-4 text-gray-300" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteLesson(lesson.id)}>
                          <Trash2 className="w-4 h-4 text-rose-400" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
        {initialPaths.length === 0 && <p className="text-gray-400 text-center py-8">No lesson paths found.</p>}
      </div>

      {/* Path Modal */}
      {pathModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-200 border border-surface-300 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{pathModal.mode === 'create' ? 'Create Lesson Path' : 'Edit Lesson Path'}</h2>
              <button onClick={() => setPathModal({ isOpen: false, mode: 'create', data: null })} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePath} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input required name="title" defaultValue={pathModal.data?.title} className="w-full bg-surface-300 border border-surface-400 rounded-md px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Slug</label>
                <input required name="slug" defaultValue={pathModal.data?.slug} className="w-full bg-surface-300 border border-surface-400 rounded-md px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea name="description" defaultValue={pathModal.data?.description || ''} className="w-full bg-surface-300 border border-surface-400 rounded-md px-3 py-2 text-white" rows={3} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">Order</label>
                  <input required type="number" name="order" defaultValue={pathModal.data?.order ?? 0} className="w-full bg-surface-300 border border-surface-400 rounded-md px-3 py-2 text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">Difficulty</label>
                  <select name="difficulty" defaultValue={pathModal.data?.difficulty || 'EASY'} className="w-full bg-surface-300 border border-surface-400 rounded-md px-3 py-2 text-white">
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full mt-6">Save Path</Button>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {lessonModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-200 border border-surface-300 rounded-xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{lessonModal.mode === 'create' ? 'Create Lesson' : 'Edit Lesson'}</h2>
              <button onClick={() => setLessonModal({ isOpen: false, mode: 'create', data: null })} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveLesson} className="space-y-4">
              <input type="hidden" name="lessonPathId" value={lessonModal.data?.lessonPathId} />
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input required name="title" defaultValue={lessonModal.data?.title} className="w-full bg-surface-300 border border-surface-400 rounded-md px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Slug</label>
                <input required name="slug" defaultValue={lessonModal.data?.slug} className="w-full bg-surface-300 border border-surface-400 rounded-md px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea name="description" defaultValue={lessonModal.data?.description || ''} className="w-full bg-surface-300 border border-surface-400 rounded-md px-3 py-2 text-white" rows={2} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Target Keys (e.g., 'asdf')</label>
                <input name="targetKeys" defaultValue={lessonModal.data?.targetKeys || ''} className="w-full bg-surface-300 border border-surface-400 rounded-md px-3 py-2 text-white" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">Order</label>
                  <input required type="number" name="order" defaultValue={lessonModal.data?.order ?? 0} className="w-full bg-surface-300 border border-surface-400 rounded-md px-3 py-2 text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">XP Reward</label>
                  <input required type="number" name="xpReward" defaultValue={lessonModal.data?.xpReward ?? 10} className="w-full bg-surface-300 border border-surface-400 rounded-md px-3 py-2 text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Difficulty</label>
                <select name="difficulty" defaultValue={lessonModal.data?.difficulty || 'EASY'} className="w-full bg-surface-300 border border-surface-400 rounded-md px-3 py-2 text-white">
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <Button type="submit" className="w-full mt-6">Save Lesson</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
