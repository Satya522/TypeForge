'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShieldCheck, FileText, Cookie, Info } from '@phosphor-icons/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

gsap.registerPlugin(ScrollTrigger);

interface Section {
  title: string;
  content: React.ReactNode;
}

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  icon: 'privacy' | 'terms' | 'cookies';
  sections: Section[];
}

export default function LegalLayout({ title, subtitle, lastUpdated, icon, sections }: LegalLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.legal-section',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const IconComponent = 
    icon === 'privacy' ? ShieldCheck :
    icon === 'terms' ? FileText :
    icon === 'cookies' ? Cookie : Info;

  return (
    <div className="min-h-screen bg-[#020302] selection:bg-[#39ff14]/30 selection:text-white flex flex-col pt-24 font-sans border-t-[3px] border-[#39ff14]">
      <Navbar />
      
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-[#39ff14]/[0.02] rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-[#39ff14]/[0.015] rounded-full blur-[120px]" />
      </div>

      <main className="flex-grow flex justify-center py-16 px-6 lg:px-8 relative z-10" ref={containerRef}>
        <div className="w-full max-w-4xl">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-16 text-center"
          >
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#39ff14]/10 border border-[#39ff14]/20 text-[#39ff14] shadow-[0_0_30px_rgba(57,255,20,0.15)] mb-6">
              <IconComponent weight="duotone" className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              {title}
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-6">
              {subtitle}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]">
              <span className="w-2 h-2 rounded-full bg-[#39ff14] shadow-[0_0_10px_#39ff14]" />
              <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
                Last Updated: {lastUpdated}
              </span>
            </div>
          </motion.div>

          {/* Content Area */}
          <div className="space-y-12">
            {sections.map((section, idx) => (
              <div 
                key={idx} 
                className="legal-section bg-gradient-to-b from-white/[0.03] to-transparent border border-white/[0.05] rounded-3xl p-8 md:p-10 hover:border-white/[0.08] transition-colors duration-500 backdrop-blur-sm"
              >
                <div className="flex items-center gap-4 mb-6 relative">
                  {/* Decorative line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#39ff14]/80 to-transparent rounded-full -ml-8 md:-ml-10 hidden sm:block h-6 my-auto opacity-70" />
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {section.title}
                  </h2>
                </div>
                <div className="text-gray-400 text-base leading-relaxed space-y-4 font-medium prose prose-invert prose-p:text-gray-400 prose-a:text-[#39ff14] prose-a:no-underline hover:prose-a:text-[#39ff14]/80 prose-strong:text-white max-w-none">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom call to action / contact */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-20 text-center bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8"
          >
            <h3 className="text-xl font-bold text-white mb-2">Have Questions?</h3>
            <p className="text-gray-400 mb-6">If you need clarification about our terms or policies, we're here to help.</p>
            <a 
              href="mailto:support@typeforge.com" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#39ff14] text-black font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-white hover:text-black transition-all hover:shadow-[0_0_20px_rgba(57,255,20,0.4)]"
            >
              Contact Support
            </a>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
