"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { RouteTransitionShell } from "@/components/motion";

interface AppChromeProps {
  children: ReactNode;
}

const AUTH_ROUTE_PREFIXES = ["/login", "/register"];

export default function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTE_PREFIXES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  return (
    <>
      {!isAuthRoute && <Navbar />}
      <RouteTransitionShell>{children}</RouteTransitionShell>
    </>
  );
}
