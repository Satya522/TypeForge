"use client";

import React, { useEffect, useRef } from 'react';
import Prism from 'prismjs';
// Import languages you wish to support
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
// Import a theme for syntax highlighting. This will apply scoped styles to
// code blocks. You can choose another theme from the Prism distribution.
import 'prismjs/themes/prism-tomorrow.css';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = 'typescript' }: CodeBlockProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current) {
      Prism.highlightElement(ref.current);
    }
  }, [code, language]);

  return (
    <pre className="rounded-md border border-surface-300 bg-surface-200 overflow-auto p-4 text-sm">
      <code ref={ref} className={`language-${language}`}>{code}</code>
    </pre>
  );
}