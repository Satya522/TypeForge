"use client";

import { Suspense } from 'react';
import Link from 'next/link';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { BarChart3, Github, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

type FormValues = z.infer<typeof formSchema>;

function getAuthErrorMessage(error?: string | null) {
  if (!error) {
    return 'Unable to sign in right now.';
  }

  if (error === 'CredentialsSignin' || error === 'Invalid credentials') {
    return 'Email ya password match nahi hua.';
  }

  if (error.includes('Google or GitHub')) {
    return 'Ye account social login se bana tha. Google ya GitHub button use karo.';
  }

  if (error.includes('restricted')) {
    return 'Is account ka access restricted hai.';
  }

  return error;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.6 2.6 12 2.6A9.4 9.4 0 0 0 2.6 12 9.4 9.4 0 0 0 12 21.4c5.4 0 8.9-3.8 8.9-9.1 0-.6-.1-1.2-.2-1.7H12Z"
      />
      <path
        fill="#34A853"
        d="M3.7 7.5 6.9 9.9A5.9 5.9 0 0 1 12 6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.6 2.6 12 2.6c-3.6 0-6.8 2-8.3 4.9Z"
      />
      <path
        fill="#FBBC05"
        d="M12 21.4c2.5 0 4.6-.8 6.2-2.3l-2.9-2.3c-.8.5-1.8.9-3.3.9-2.5 0-4.6-1.7-5.4-4l-3.3 2.5c1.5 3 4.6 5.2 8.7 5.2Z"
      />
      <path
        fill="#4285F4"
        d="M3.3 16.2 6.6 13.7a6.3 6.3 0 0 1-.3-1.7c0-.6.1-1.2.3-1.8L3.3 7.7A9.4 9.4 0 0 0 2.6 12c0 1.5.3 2.9.7 4.2Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') ?? '/dashboard';

  const onSubmit = async (values: FormValues) => {
    const result = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password,
      callbackUrl,
    });
    if (result?.error) {
      toast.error(getAuthErrorMessage(result.error));
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-surface-100 via-surface-200/70 to-surface-100" />
      <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-accent-300/8 blur-3xl" />
      <div className="section-shell flex min-h-screen items-center py-20 sm:py-24">
        <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="text-center lg:text-left">
            <div className="eyebrow">Welcome Back</div>
            <h1 className="mt-5 text-4xl font-bold text-gray-100 sm:text-5xl">Login to TypeForge</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-400 sm:text-base lg:max-w-md">
              Jump back into your lessons, review analytics and continue building fast, clean muscle memory across every device.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="panel-muted flex items-center gap-3 p-4">
                <Zap className="h-5 w-5 text-accent-200" />
                <span className="text-sm text-gray-300">Quick social sign-in</span>
              </div>
              <div className="panel-muted flex items-center gap-3 p-4">
                <BarChart3 className="h-5 w-5 text-accent-200" />
                <span className="text-sm text-gray-300">Progress synced instantly</span>
              </div>
              <div className="panel-muted flex items-center gap-3 p-4">
                <ShieldCheck className="h-5 w-5 text-accent-200" />
                <span className="text-sm text-gray-300">Secure account access</span>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-xl">
            <div className="panel space-y-6 p-6 sm:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in...' : 'Login'}
                </Button>
              </form>
              <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-xs leading-6 text-gray-400">
                Agar account pehle Google ya GitHub se bana tha, to credentials form `401` dega. Us case me neeche wale
                social buttons use karo.
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-b border-surface-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-surface-200 px-2 text-gray-400">or continue with</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 justify-center gap-2 rounded-xl px-3"
                  onClick={() => signIn('google', { callbackUrl })}
                >
                  <GoogleIcon />
                  <span>Google</span>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 justify-center gap-2 rounded-xl px-3"
                  onClick={() => signIn('github', { callbackUrl })}
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                </Button>
              </div>
              <div className="text-center text-sm text-gray-400">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-accent-200 hover:underline">
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginPageFallback() {
  return (
    <div className="section-shell flex min-h-screen items-center py-20 sm:py-24">
      <div className="panel mx-auto w-full max-w-xl space-y-4 p-6 text-center sm:p-8">
        <h1 className="text-2xl font-semibold text-gray-100">Login to TypeForge</h1>
        <p className="text-sm text-gray-400">Loading sign-in options...</p>
      </div>
    </div>
  );
}
