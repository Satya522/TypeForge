"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

type Step = {
  title: string;
  description: string;
};

type OnboardingClientProps = {
  steps: Step[];
};

export default function OnboardingClient({ steps }: OnboardingClientProps) {
  const [step, setStep] = useState(0);
  const next = () => setStep((current) => Math.min(current + 1, steps.length - 1));
  const prev = () => setStep((current) => Math.max(current - 1, 0));
  const { title, description } = steps[step];

  return (
    <div className="rounded-lg border border-surface-300 bg-surface-200 p-6 shadow">
      <h1 className="mb-3 text-2xl font-bold text-gray-100">{title}</h1>
      <p className="mb-6 text-gray-300">{description}</p>
      <div className="flex justify-between">
        <Button variant="secondary" onClick={prev} disabled={step === 0}>
          Previous
        </Button>
        {step === steps.length - 1 ? (
          <Link href="/dashboard">
            <Button variant="primary">Finish Tour</Button>
          </Link>
        ) : (
          <Button variant="primary" onClick={next}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
