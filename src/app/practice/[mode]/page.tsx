import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PracticeClient from './PracticeClient';
import { redirect, notFound } from 'next/navigation';
import { CONTENT_LIBRARY } from '@/lib/practiceContent';
import { DEV_CONTENT } from '@/lib/practiceContentDev';
import { SPECIALIZED_CONTENT } from '@/lib/practiceContentSpecialized';

export const dynamic = 'force-dynamic';

interface PracticePageProps {
  params: Promise<{ mode: string }>;
}

// Merged content library for all modes
function getContentForMode(mode: string): string[] | null {
  return CONTENT_LIBRARY[mode] || DEV_CONTENT[mode] || SPECIALIZED_CONTENT[mode] || null;
}

// Pick random text from library
function pickRandomText(mode: string, fallback: string): string {
  const pool = getContentForMode(mode);
  if (!pool || pool.length === 0) return fallback;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

// Map route param to ContentType and description
const modeMap: Record<string, { type: string; title: string; description: string; defaultText: string; timeLimitSeconds?: number }> = {
  words: { type: 'WORDS', title: 'Random Words', description: 'Random words practice', defaultText: 'the be to of and a in that have I it for not on with he as you do at' },
  sentences: { type: 'SENTENCE', title: 'Sentences', description: 'Sentence practice', defaultText: 'The quick brown fox jumps over the lazy dog. Practice makes perfect. Keep typing!' },
  paragraphs: { type: 'PARAGRAPH', title: 'Paragraphs', description: 'Paragraph practice', defaultText: 'Endurance is key. When you type for longer durations, you train your muscle memory to become resilient against physical fatigue and minor distractions.' },
  numbers: { type: 'NUMBER', title: 'Numbers', description: 'Numbers practice', defaultText: '482 103 592 748 290 846 195 932 674 105 832 940 371' },
  punctuation: { type: 'PUNCTUATION', title: 'Punctuation', description: 'Punctuation practice', defaultText: 'Wait, what? "I can\'t believe it!" You\'re telling me this: (A) true; or (B) false?' },
  code: { type: 'CODE', title: 'Code Mix', description: 'Mixed code practice', defaultText: 'function run() { return true; } const a = [1, 2];' },
  quotes: { type: 'QUOTE', title: 'Famous Quotes', description: 'Quotes practice', defaultText: '"I have not failed. I\'ve just found 10,000 ways that won\'t work." - Thomas A. Edison' },
  javascript: { type: 'CODE', title: 'JavaScript', description: 'JS syntax practice', defaultText: 'const fetchUser = async (id) => { const res = await api.get(`/users/${id}`); return res.data; };' },
  typescript: { type: 'CODE', title: 'TypeScript', description: 'TS interfaces and types', defaultText: 'interface User {\n  id: number;\n  name: string;\n}\nconst getUser = (id: number): User => ({ id, name: "Admin" });' },
  react: { type: 'CODE', title: 'React JSX', description: 'React components practice', defaultText: 'import React, { useState } from "react";\n\nexport const Counter = () => {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n};' },
  python: { type: 'CODE', title: 'Python', description: 'Python syntax practice', defaultText: 'def calculate_sum(a, b):\n    return a + b\n\nif __name__ == "__main__":\n    print("Hello")' },
  'html-css': { type: 'CODE', title: 'HTML & CSS', description: 'Web Dev practice', defaultText: '<div class="container">\n  <h1>Title</h1>\n</div>\n\n.container {\n  display: flex;\n}' },
  sql: { type: 'CODE', title: 'SQL Queries', description: 'Database query practice', defaultText: 'SELECT id, first_name, last_name, email FROM users WHERE status = "active" ORDER BY created_at DESC LIMIT 50;' },
  cpp: { type: 'CODE', title: 'C++', description: 'C++ algorithms practice', defaultText: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World!";\n    return 0;\n}' },
  java: { type: 'CODE', title: 'Java', description: 'Java classes practice', defaultText: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}' },
  rust: { type: 'CODE', title: 'Rust', description: 'Rust syntax and lifetimes', defaultText: 'fn main() {\n    let message = String::from("Hello");\n    println!("{}", message);\n}' },
  go: { type: 'CODE', title: 'Go', description: 'Go routines and syntax', defaultText: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello")\n}' },
  bash: { type: 'CODE', title: 'Bash Script', description: 'Terminal commands practice', defaultText: '#!/bin/bash\necho "Starting build..."\nnpm i && npm run build\necho "Done!"' },
  numpad: { type: 'NUMBER', title: 'Numpad Mastery', description: 'Numpad heavy practice', defaultText: '456 789 123 000 741 852 963 159 357 555 456' },
  'home-row': { type: 'WORDS', title: 'Home Row', description: 'ASDF JKL; practice', defaultText: 'asdf jkl; asdf jkl; a s d f j k l ; sad glad flask fall glass salad dad dash flash' },
  'top-row': { type: 'WORDS', title: 'Top Row', description: 'QWERTYUIOP practice', defaultText: 'qwerty uiop qwer tyui opqr tyuo piou peer tree pure out put quit quiet required report router rope' },
  'bottom-row': { type: 'WORDS', title: 'Bottom Row', description: 'ZXCVBNM practice', defaultText: 'zxcv bnm zxc vbn mzx cvb nmv cbx zmcb cbz nmb cvz bnm comma period moon zoom xeno cvcx bnvz' },
  'left-hand': { type: 'WORDS', title: 'Left Hand Only', description: 'QWERT ASDFG ZXCVB', defaultText: 'qwert asdfg zxcvb qwas zx er df cv few sad case water great exact fast vast west' },
  'right-hand': { type: 'WORDS', title: 'Right Hand Only', description: 'YUIOP HJKL NM', defaultText: 'yuiop hjkl nm yuhj inmk oplk jump hoop look monk plin plnk poly up in on no him nip mop poly link' },
  zen: { type: 'TEXT', title: 'Zen Mode', description: 'No constraints', defaultText: 'Breathe in, breathe out. Keep your fingers loose and let your mind wander across the keys without worrying about the time or the score.' },
  
  // Time-based challenges
  'time-15': { type: 'PARAGRAPH', title: '15s Sprint', description: 'Type as fast as you can for 15 seconds.', timeLimitSeconds: 15, defaultText: Array(10).fill('The quick brown fox jumps over the lazy dog as the bright sun sets slowly across the vast mountain ranges giving way to a starry dark night sky.').join(' ') },
  'time-30': { type: 'PARAGRAPH', title: '30s Sprint', description: 'Type as fast as you can for 30 seconds.', timeLimitSeconds: 30, defaultText: Array(20).fill('Success is not final, failure is not fatal: it is the courage to continue that counts. A journey of a thousand miles begins with a single step.').join(' ') },
  'time-60': { type: 'PARAGRAPH', title: '60s Test', description: '1 minute typing test.', timeLimitSeconds: 60, defaultText: Array(40).fill('Endurance is key. When you type for longer durations, you train your muscle memory to become resilient against physical fatigue and minor distractions, improving your overall performance.').join(' ') },
  'time-300': { type: 'PARAGRAPH', title: '5m Marathon', description: '5 minute typing endurance test.', timeLimitSeconds: 300, defaultText: Array(150).fill('This is a marathon. Maintain a steady pace and focus on accuracy. Breathing properly and sitting with correct posture will ensure that you do not exhaust your hands prematurely. Focus fully.').join(' ') },
  
  // Story mode & Professional
  'story': { type: 'TEXT', title: 'English Story', description: 'Type a short story.', defaultText: 'Once upon a time in a distant land, there was a small village nested between two mountains. The villagers were known for their legendary craftsmanship in forging intricate pieces of art from metals deep within the earth. Every hundred years, a grand festival was held to showcase their greatest masterpiece to the visiting scholars from far away kingdoms. It was said that the grandmaster blacksmith possessed a secret hammer that could never miss its strike. Many tried to replicate it, but all failed. Only the chosen apprentice could truly wield its power when the time came to forge the ultimate artifact.' },
  'scientific': { type: 'WORDS', title: 'Scientific Terms', description: 'Biology, chemistry, and physics', defaultText: 'photosynthesis mitochondria electromagnetism thermodynamics relativity particle organic genome celestial galaxy gravity quantum nucleus cell theory hypothesis' },
  'medical': { type: 'WORDS', title: 'Medical Terms', description: 'Anatomy and medical vocabulary', defaultText: 'cardiovascular neurological respiratory antibiotics intravenous surgery anesthesia plasma pathogen symptom diagnostic orthopedic pediatric' },
  'legal': { type: 'WORDS', title: 'Legal Terms', description: 'Law and legal vocabulary', defaultText: 'jurisdiction affidavit deposition litigation subpoena liability defendant plaintiff testimony verdict arbitration precedent constitutional' },
  'dictionary': { type: 'WORDS', title: 'Dictionary Definitions', description: 'Vocabulary Builder', defaultText: 'Ebullient: cheerful and full of energy. Fastidious: very attentive to and concerned about accuracy and detail. Ineffable: too great or extreme to be expressed or described in words.' },
};

export default async function PracticeModePage({ params }: PracticePageProps) {
  const { mode } = await params;
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/practice/${mode}`);
  }
  const modeConfig = modeMap[mode];
  if (!modeConfig) notFound();
  // Fetch random practice content for the mode
  const contents = await prisma.practiceContent.findMany({
    where: { type: modeConfig.type as any },
    orderBy: { createdAt: 'asc' },
    take: 5,
  });
  let text: string;
  if (contents.length) {
    // pick a random DB content entry
    const randomDbIdx = Math.floor(Math.random() * contents.length);
    text = contents[randomDbIdx].content;
  } else {
    // pick a random text from the massive content library 
    text = pickRandomText(mode, modeConfig.defaultText || 'Practice makes perfect. Keep typing!');
  }
  const title = modeConfig.title;
  const description = modeConfig.description;
  return (
    <>
      <div className="pt-6 pb-12 px-4 sm:px-8 xl:px-12 mx-auto w-full max-w-[1600px] flex-1 flex flex-col">
        <PracticeClient
          text={text}
          mode={mode}
          title={title}
          description={description}
          timeLimitSeconds={modeConfig.timeLimitSeconds}
        />
      </div>
    </>
  );
}
