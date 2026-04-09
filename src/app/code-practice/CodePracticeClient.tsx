"use client";

import { useState } from 'react';
import CodeBlock from '@/components/CodeBlock';
import { Button } from '@/components/ui/button';

export default function CodePracticeClient() {
  const [gistId, setGistId] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    setCode('');

    try {
      const id = gistId.trim();
      if (!id) {
        setError('Please enter a Gist ID or URL');
        setLoading(false);
        return;
      }

      const match = id.match(/([0-9a-fA-F]{20,32})/);
      const actualId = match ? match[1] : id;
      const res = await fetch(`https://api.github.com/gists/${actualId}`);

      if (!res.ok) {
        throw new Error('Failed to fetch gist');
      }

      const data = await res.json();
      const files = data.files as Record<string, { content: string; filename: string }>;
      const firstFile = files[Object.keys(files)[0]];
      const extMatch = firstFile.filename.match(/\.([a-zA-Z0-9]+)$/);
      const ext = extMatch ? extMatch[1] : 'typescript';

      setLanguage(ext.toLowerCase());
      setCode(firstFile.content);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Enter Gist ID or URL"
          value={gistId}
          onChange={(e) => setGistId(e.target.value)}
          className="flex-1 rounded-md border border-surface-300 bg-surface-200 px-3 py-2 text-gray-200 focus:outline-none"
        />
        <Button onClick={handleFetch} disabled={loading}>
          {loading ? 'Fetching...' : 'Fetch'}
        </Button>
      </div>
      {error && <p className="mb-4 text-red-500">{error}</p>}
      {code && (
        <div className="mb-6">
          <CodeBlock code={code} language={language} />
        </div>
      )}
    </>
  );
}
