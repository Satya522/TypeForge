"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * DictationPage demonstrates the use of the Web Speech API for dictation
 * practice. When you start dictation, the browser will listen to your
 * microphone and transcribe your speech in real time. Not all browsers
 * support this API. This feature is experimental and should be treated
 * as a preview.
 */
export default function DictationPage() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const toggleListening = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (typeof window === 'undefined') return;
    // @ts-ignore - SpeechRecognition is not typed in TS by default
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          setTranscript((prev) => prev + result[0].transcript + ' ');
        } else {
          interim += result[0].transcript;
        }
      }
      // Optionally you could show interim transcription here
    };
    recognition.onerror = (event: any) => {
      setError(event.error);
    };
    recognition.onend = () => {
      setListening(false);
    };
    recognition.start();
    setListening(true);
    // Save reference for stop
    // @ts-ignore
    window._activeRecognition = recognition;
  };

  const stopListening = () => {
    // @ts-ignore
    const recognition = window._activeRecognition;
    if (recognition) {
      recognition.stop();
    }
    setListening(false);
  };

  return (
    <div className="mx-auto max-w-3xl py-16 px-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Dictation Practice</h1>
      <p className="text-gray-300 max-w-prose">
        Speak into your microphone and see your words transcribed in real time. Use
        this mode to practice clear articulation and become familiar with
        dictation-based workflows.
      </p>
      {error && <p className="text-red-400">{error}</p>}
      <div className="flex items-center gap-4">
        <Button variant={listening ? 'secondary' : 'primary'} onClick={toggleListening}>
          {listening ? 'Stop' : 'Start'} Dictation
        </Button>
        {listening && <span className="text-sm text-gray-400">Listening...</span>}
      </div>
      <div className="border border-surface-300 rounded-lg p-4 bg-surface-200 min-h-[200px] whitespace-pre-wrap">
        {transcript || <span className="text-gray-500">Your transcription will appear here.</span>}
      </div>
    </div>
  );
}