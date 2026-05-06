"use client";

import { Suspense } from "react";
import TerminalAuth from "@/components/TerminalAuth";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center bg-[#030712]" style={{ height: "calc(100vh - 5rem)" }}><div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#4f8dfd]" /></div>}>
      <TerminalAuth mode="login" />
    </Suspense>
  );
}
