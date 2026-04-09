"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faq = [
  {
    question: 'Is TypeForge free to use?',
    answer: 'TypeForge offers a generous free tier with core lessons and practice modes. Premium features and advanced analytics may require a subscription.',
  },
  {
    question: 'Do I need to create an account?',
    answer: 'An account is required to save your progress, track analytics, compete on leaderboards and access advanced features. You can sign up with Google or email.',
  },
  {
    question: 'Can I practice coding in TypeForge?',
    answer: 'Absolutely! There is a dedicated coding mode with real code snippets to help you improve your typing skills in programming languages.',
  },
  {
    question: 'How is my data stored?',
    answer: 'We store your progress securely in our database. You can delete your account and data at any time through the settings page.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="section-space bg-surface-200/65">
      <div className="section-shell max-w-5xl">
        <div className="text-center">
          <div className="eyebrow">Support</div>
        </div>
        <h2 className="mt-5 text-center text-3xl font-bold text-gray-100 sm:text-4xl">Frequently Asked Questions</h2>
        <p className="mx-auto mb-8 mt-4 max-w-2xl text-center text-sm leading-7 text-gray-400 sm:text-base">
          Still have questions? Reach out to us via the contact form and we&apos;ll be happy to help.
        </p>
        <div className="space-y-4">
          {faq.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={item.question} className="panel overflow-hidden">
                <button
                  className="flex w-full items-center justify-between gap-4 bg-surface-300/80 px-4 py-4 text-left transition-colors hover:bg-surface-400 sm:px-5"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                >
                  <span className="pr-4 text-sm font-medium text-gray-100 sm:text-base">{item.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-accent-200 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="bg-surface-200/75 px-4 py-4 text-sm leading-7 text-gray-400 sm:px-5">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
