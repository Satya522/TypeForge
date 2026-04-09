"use client";

import { useState, useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript.js';
import 'prismjs/components/prism-typescript.js';
import 'prismjs/components/prism-python.js';
import CustomPracticeClient from '@/components/CustomPracticeClient';
import { Button } from '@/components/ui/button';

/**
 * CodeEditorClient provides a minimal in‑browser code editor with syntax
 * highlighting via Prism.js. Users can select a language, type or paste
 * code into a textarea, preview the highlighted output, and then start
 * a typing practice session based on the editor contents. This client
 * does not save any results to the database and is intended as a tool
 * for developers to practise typing real code snippets.
 */
export default function CodeEditorClient() {
  const languages = [
    { label: 'JavaScript', value: 'javascript' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'Python', value: 'python' },
  ];
  const [language, setLanguage] = useState<string>('javascript');
  const [code, setCode] = useState<string>('');
  const [practising, setPractising] = useState<boolean>(false);

  // Highlight the code using Prism; memoise to avoid unnecessary recalculations
  const highlighted = useMemo(() => {
    const grammar = (Prism as any).languages[language];
    if (!grammar) return Prism.util.encode(code);
    return Prism.highlight(code, grammar, language);
  }, [code, language]);

  if (practising) {
    return (
      <div className="space-y-6">
        <CustomPracticeClient text={code} />
        <Button variant="secondary" onClick={() => setPractising(false)}>Back to Editor</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <label htmlFor="language" className="text-sm font-medium text-gray-300">
          Language
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-surface-200 border border-surface-300 rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-200"
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value} className="bg-surface-200">
              {lang.label}
            </option>
          ))}
        </select>
        <Button variant="primary" onClick={() => setPractising(true)} disabled={!code.trim()}>
          Start Practice
        </Button>
      </div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Type or paste your code here..."
        className="w-full min-h-[8rem] bg-surface-200 border border-surface-300 rounded-md p-3 text-gray-200 font-mono focus:outline-none focus:ring-2 focus:ring-accent-200"
      />
      <div className="p-4 rounded-lg border border-surface-300 bg-surface-200 overflow-auto">
        <pre className={`language-${language} text-sm`} dangerouslySetInnerHTML={{ __html: highlighted }} />
      </div>
    </div>
  );
}