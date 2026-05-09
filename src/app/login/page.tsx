import { Suspense } from "react";
import { redirect } from "next/navigation";
import TerminalAuth from "@/components/TerminalAuth";
import { getServerAuthSession } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
};

function getSafeRedirect(callbackUrl?: string) {
  if (!callbackUrl) return "/dashboard";

  try {
    const parsed = new URL(callbackUrl, "http://typeforge.local");
    if (parsed.origin !== "http://typeforge.local") return "/dashboard";
    if (parsed.pathname === "/login" || parsed.pathname === "/register") return "/dashboard";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/dashboard";
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [session, params] = await Promise.all([getServerAuthSession(), searchParams]);

  if (session?.user) {
    redirect(getSafeRedirect(params?.callbackUrl));
  }

  return (
    <Suspense fallback={<div className="flex min-h-[100dvh] items-center justify-center bg-[#030712]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#4f8dfd]" /></div>}>
      <TerminalAuth mode="login" />
    </Suspense>
  );
}
