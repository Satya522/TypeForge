import Link from 'next/link';
import { 
  Keyboard, AlignLeft, Calculator, Hand, Code, 
  FileJson, Terminal, Layout, GripHorizontal, 
  Quote, Coffee, Asterisk, Play, Database, FileCode2,
  Atom, Box, FileTerminal, ArrowUp, ArrowDown, MoveLeft,
  MoveRight, Timer, BookOpen, TestTube, Activity, Scale, Library
} from 'lucide-react';

import Footer from '@/components/Footer';

const moduleCategories = [
  {
    title: 'Core Drills',
    desc: 'Master the fundamentals and build raw muscle memory.',
    modes: [
      { slug: 'words', title: 'Random Words', desc: 'The classic speed test. Build raw WPM with frequent words.', icon: <Keyboard className="w-5 h-5 text-accent-300" /> },
      { slug: 'sentences', title: 'Sentences', desc: 'Real-world sentence structures with basic punctuation.', icon: <AlignLeft className="w-5 h-5 text-accent-300" /> },
      { slug: 'home-row', title: 'Home Row Focus', desc: 'Strict ASDF JKL; practice to enforce proper static hand placement.', icon: <Hand className="w-5 h-5 text-accent-300" /> },
      { slug: 'top-row', title: 'Top Row Focus', desc: 'Master QWERTYUIOP keys efficiently.', icon: <ArrowUp className="w-5 h-5 text-accent-300" /> },
      { slug: 'bottom-row', title: 'Bottom Row Focus', desc: 'Master ZXCVBNM keys and symbols.', icon: <ArrowDown className="w-5 h-5 text-accent-300" /> },
      { slug: 'left-hand', title: 'Left Hand Only', desc: 'Strict training for the left hemisphere layout.', icon: <MoveLeft className="w-5 h-5 text-accent-300" /> },
      { slug: 'right-hand', title: 'Right Hand Only', desc: 'Strict training for the right hemisphere layout.', icon: <MoveRight className="w-5 h-5 text-accent-300" /> },
      { slug: 'numpad', title: 'Numpad Mastery', desc: 'Strict numerical entry for data processing speed.', icon: <Calculator className="w-5 h-5 text-accent-300" /> },
    ]
  },
  {
    title: 'Developer Packs',
    desc: 'Real-world language syntax, brackets, and logical keywords.',
    modes: [
      { slug: 'code', title: 'Mixed Code', desc: 'General programming syntax and challenging mixed characters.', icon: <Code className="w-5 h-5 text-[#34D399]" /> },
      { slug: 'javascript', title: 'JavaScript', desc: 'Arrow functions, brackets, and typical JS boilerplate.', icon: <FileJson className="w-5 h-5 text-[#FCD34D]" /> },
      { slug: 'typescript', title: 'TypeScript', desc: 'Interfaces, types, and generic syntax forms.', icon: <FileCode2 className="w-5 h-5 text-[#3178C6]" /> },
      { slug: 'react', title: 'React JSX', desc: 'Component syntax, hooks, and markup elements.', icon: <Atom className="w-5 h-5 text-[#61DAFB]" /> },
      { slug: 'python', title: 'Python', desc: 'Indentation, underscores, and Pythonic grammar.', icon: <Terminal className="w-5 h-5 text-[#60A5FA]" /> },
      { slug: 'html-css', title: 'HTML & CSS', desc: 'Tags, angles, css classes, and style brackets.', icon: <Layout className="w-5 h-5 text-[#C084FC]" /> },
      { slug: 'sql', title: 'SQL Queries', desc: 'Database language structures and keywords.', icon: <Database className="w-5 h-5 text-[#FBBF24]" /> },
      { slug: 'cpp', title: 'C++', desc: 'Pointers, headers, and algorithm syntax.', icon: <Box className="w-5 h-5 text-[#3B82F6]" /> },
      { slug: 'java', title: 'Java', desc: 'Verbose class typing, public static methods.', icon: <Coffee className="w-5 h-5 text-[#EA580C]" /> },
      { slug: 'rust', title: 'Rust', desc: 'Lifetimes, matching, and system memory logic.', icon: <Box className="w-5 h-5 text-[#EF4444]" /> },
      { slug: 'go', title: 'Go', desc: 'Goroutines, defer, structs, and interfaces.', icon: <Box className="w-5 h-5 text-[#38BDF8]" /> },
      { slug: 'bash', title: 'Bash Script', desc: 'Terminal commands and standard automation.', icon: <FileTerminal className="w-5 h-5 text-[#A3E635]" /> },
    ]
  },
  {
    title: 'Timed Sprints',
    desc: 'Push your limits against a heavy reverse countdown.',
    modes: [
      { slug: 'time-15', title: '15s Sprint', desc: 'Intense short-burst raw speed test.', icon: <Timer className="w-5 h-5 text-[#F43F5E]" /> },
      { slug: 'time-30', title: '30s Sprint', desc: 'High-speed typing challenge for 30 seconds.', icon: <Timer className="w-5 h-5 text-[#F43F5E]" /> },
      { slug: 'time-60', title: '60s Test', desc: 'Official 1-minute standard typing test.', icon: <Timer className="w-5 h-5 text-[#F43F5E]" /> },
      { slug: 'time-300', title: '5m Marathon', desc: 'Grueling 5-minute typing endurance challenge.', icon: <Timer className="w-5 h-5 text-[#F43F5E]" /> },
    ]
  },
  {
    title: 'Specialized & Literature',
    desc: 'Push your limits with advanced vocabularies and formats.',
    modes: [
      { slug: 'story', title: 'English Story', desc: 'Immersive reading-length short stories.', icon: <BookOpen className="w-5 h-5 text-gray-300" /> },
      { slug: 'paragraphs', title: 'Endurance', desc: 'Long-form paragraphs to build focus and typing stamina.', icon: <GripHorizontal className="w-5 h-5 text-gray-300" /> },
      { slug: 'scientific', title: 'Scientific Terms', desc: 'Biology, chemistry, physics, and complex terms.', icon: <Atom className="w-5 h-5 text-gray-300" /> },
      { slug: 'medical', title: 'Medical Terms', desc: 'Anatomical terms and complex health vocabulary.', icon: <Activity className="w-5 h-5 text-gray-300" /> },
      { slug: 'legal', title: 'Legal Terms', desc: 'Jurisprudential and lawyer terminology.', icon: <Scale className="w-5 h-5 text-gray-300" /> },
      { slug: 'dictionary', title: 'Dictionary', desc: 'Learn and type complex builder words.', icon: <Library className="w-5 h-5 text-gray-300" /> },
      { slug: 'punctuation', title: 'Punctuation', desc: 'Drill heavy symbols to eliminate awkward finger stretching.', icon: <Asterisk className="w-5 h-5 text-gray-300" /> },
      { slug: 'numbers', title: 'Numbers Mix', desc: 'Master number row and frequent digits.', icon: <Calculator className="w-5 h-5 text-gray-300" /> },
      { slug: 'quotes', title: 'Famous Quotes', desc: 'Type inspiring historical and cinematic quotes.', icon: <Quote className="w-5 h-5 text-gray-300" /> },
      { slug: 'zen', title: 'Zen Mode', desc: 'No timer, no stats. Just an infinite stream of words.', icon: <Coffee className="w-5 h-5 text-gray-300" /> },
    ]
  }
];

export const metadata = {
  title: 'Practice Modules – TypeForge',
  description: 'Select a practice module to hone specific typing skills.',
};

export default function PracticePage() {
  return (
    <div className="min-h-screen bg-[#050706] flex flex-col font-sans">
      
      
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 xl:px-12 pt-24 pb-20 sm:pt-32">
        {/* Header Hero Section */}
        <div className="relative mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-accent-400/10 border border-accent-400/20 text-accent-300 text-xs font-bold tracking-widest uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
            Practice Arena
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
            Module <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-emerald-500">Selection</span>
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
            Choose from a vast library of typing modules. Whether you're warming up with core drills, 
            mastering developer syntax, or building raw endurance, there's a specialized mode for you.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="space-y-16">
          {moduleCategories.map((category, catIdx) => (
            <section key={catIdx} className="relative">
              {/* Category Header */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.04] pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
                    {category.title}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">{category.desc}</p>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {category.modes.map((mode) => (
                  <Link 
                    key={mode.slug} 
                    href={`/practice/${mode.slug}`}
                    className="group relative flex flex-col p-5 bg-[#090C0B] rounded-2xl border border-white/[0.04] transition-all duration-300 hover:bg-[#0c100e] hover:border-accent-300/30 hover:shadow-[0_10px_40px_-10px_rgba(57,255,20,0.15)] hover:-translate-y-1 overflow-hidden"
                  >
                    {/* Top Accent Gradient Line */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent-300/0 to-transparent group-hover:via-accent-300/50 transition-all duration-500" />
                    
                    {/* Icon & Title */}
                    <div className="flex items-start gap-4 mb-3">
                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] group-hover:bg-[#111814] transition-colors">
                        {mode.icon}
                      </div>
                      <div className="pt-1">
                        <h3 className="text-[17px] font-semibold text-gray-200 group-hover:text-white transition-colors leading-tight">
                          {mode.title}
                        </h3>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-500 leading-relaxed flex-grow group-hover:text-gray-400 transition-colors">
                      {mode.desc}
                    </p>

                    {/* Quick Access Button Overlay */}
                    <div className="mt-6 flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity">
                      <span className="text-[11px] uppercase tracking-widest font-bold text-gray-600 group-hover:text-accent-300/80">
                        Launch Module
                      </span>
                      <div className="w-8 h-8 rounded-full bg-accent-300/10 flex items-center justify-center text-accent-300 group-hover:bg-accent-300 group-hover:text-black transition-colors">
                        <Play className="w-3.5 h-3.5 ml-0.5" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
