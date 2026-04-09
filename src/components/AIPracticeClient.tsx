"use client";

import { useState } from 'react';
import CustomPracticeClient from '@/components/CustomPracticeClient';
import { Button } from '@/components/ui/button';

/**
 * AIPracticeClient provides a simple interface for generating random
 * practice content based on a chosen interest category. The server
 * endpoint (/api/ai/generate) returns a paragraph of text tailored to
 * the selected category. Users can then immediately practise typing
 * the generated passage using the same typing engine used elsewhere
 * in the app. This component keeps state local and does not persist
 * results to the database.
 */
export default function AIPracticeClient() {
  // Predefined interest categories. Additional categories can be
  // added without modifying the client logic.
  const categories = [
    'Sci‑Fi',
    'Finance',
    'Cooking',
    'Technology',
    'Fantasy',
  ];
  const [selected, setSelected] = useState<string>(categories[0]);
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [practising, setPractising] = useState(false);

  // Fetch a generated passage from the server based on the selected category
  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setText(null);
    setPractising(false);
    try {
      const res = await fetch(`/api/ai/generate?category=${encodeURIComponent(selected)}`);
      if (!res.ok) {
        throw new Error('Failed to generate content');
      }
      const data = await res.json();
      setText(data.text);
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <label className="text-sm font-medium text-gray-300" htmlFor="category">
          Interest
        </label>
        <select
          id="category"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="bg-surface-200 border border-surface-300 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-200"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat} className="bg-surface-200">
              {cat}
            </option>
          ))}
        </select>
        <Button variant="secondary" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate'}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {text && !practising && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-surface-300 bg-surface-200">
            <p className="text-gray-300 whitespace-pre-line">{text}</p>
          </div>
          <Button variant="primary" onClick={() => setPractising(true)}>
            Start Practice
          </Button>
        </div>
      )}
      {practising && text && (
        <div className="mt-6">
          <CustomPracticeClient text={text} />
        </div>
      )}
    </div>
  );
}