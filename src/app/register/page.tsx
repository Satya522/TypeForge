import { Suspense } from "react";
import { redirect } from "next/navigation";
import TerminalAuth from "@/components/TerminalAuth";
import { getServerAuthSession } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getServerAuthSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<div className="flex min-h-[100dvh] items-center justify-center bg-[#030712]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#4f8dfd]" /></div>}>
      <TerminalAuth mode="register" />
    </Suspense>
  );
}
