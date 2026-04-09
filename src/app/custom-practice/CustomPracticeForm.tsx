"use client";

import { useState } from 'react';
import CustomPracticeClient from '@/components/CustomPracticeClient';
import { Button } from '@/components/ui/button';

export default function CustomPracticeForm() {
  const [text, setText] = useState('');
  const [started, setStarted] = useState(false);

  return (
    <div className="space-y-6">
      {!started ? (
        <>
          <div>
            <label htmlFor="customText" className="mb-1 block text-sm font-medium text-gray-300">
              Enter text for practice
            </label>
            <textarea
              id="customText"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="w-full rounded-md border border-surface-300 bg-surface-100 px-3 py-2 text-gray-100 placeholder-gray-500 focus:border-accent-200 focus:outline-none"
              placeholder="Type or paste any text here..."
            />
          </div>
          <Button disabled={!text.trim()} onClick={() => setStarted(true)}>
            Start Practice
          </Button>
        </>
      ) : (
        <CustomPracticeClient text={text} />
      )}
    </div>
  );
}
