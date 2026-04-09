"use client";

import Link from 'next/link';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { Rocket, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const formSchema = z
  .object({
    name: z.string().min(1, { message: 'Please provide your name' }),
    email: z.string().email({ message: 'Invalid email' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: values.name, email: values.email, password: values.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Registration failed');
        return;
      }
      toast.success('Account created!');
      await signIn('credentials', {
        email: values.email,
        password: values.password,
        callbackUrl: '/dashboard',
      });
    } catch (err: any) {
      console.error(err);
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-surface-100 via-surface-200/70 to-surface-100" />
      <div className="absolute right-0 top-16 -z-10 h-72 w-72 rounded-full bg-accent-300/10 blur-3xl" />
      <div className="section-shell flex min-h-screen items-center py-20 sm:py-24">
        <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="text-center lg:text-left">
            <div className="eyebrow">Create Your Account</div>
            <h1 className="mt-5 text-4xl font-bold text-gray-100 sm:text-5xl">Start your TypeForge journey</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-400 sm:text-base lg:max-w-md">
              Build a profile, save every session and keep your lessons, streaks and analytics synced beautifully across screens.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="panel-muted flex items-center gap-3 p-4">
                <Rocket className="h-5 w-5 text-accent-200" />
                <span className="text-sm text-gray-300">Fast onboarding flow</span>
              </div>
              <div className="panel-muted flex items-center gap-3 p-4">
                <Sparkles className="h-5 w-5 text-accent-200" />
                <span className="text-sm text-gray-300">Premium typing workspace</span>
              </div>
              <div className="panel-muted flex items-center gap-3 p-4">
                <ShieldCheck className="h-5 w-5 text-accent-200" />
                <span className="text-sm text-gray-300">Secure credentials setup</span>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-xl">
            <div className="panel p-6 sm:p-8">
              <h2 className="mb-6 text-center text-2xl font-semibold text-gray-100">Create an account</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-300">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name')}
                    className="w-full rounded-xl border border-surface-300 bg-surface-100 px-4 py-3 text-gray-100 placeholder-gray-500 focus:border-accent-200 focus:outline-none"
                    placeholder="Jane Doe"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="w-full rounded-xl border border-surface-300 bg-surface-100 px-4 py-3 text-gray-100 placeholder-gray-500 focus:border-accent-200 focus:outline-none"
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                </div>
                <div>
                  <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    {...register('password')}
                    className="w-full rounded-xl border border-surface-300 bg-surface-100 px-4 py-3 text-gray-100 placeholder-gray-500 focus:border-accent-200 focus:outline-none"
                    placeholder="Your password"
                  />
                  {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-300">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    {...register('confirmPassword')}
                    className="w-full rounded-xl border border-surface-300 bg-surface-100 px-4 py-3 text-gray-100 placeholder-gray-500 focus:border-accent-200 focus:outline-none"
                    placeholder="Repeat password"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="text-accent-200 hover:underline">
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
