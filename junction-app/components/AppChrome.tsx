"use client";

import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";

type AppChromeProps = {
  children: React.ReactNode;
};

export function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  const isDarkShell = isLanding || pathname?.startsWith("/dashboard");
  const theme = isDarkShell
    ? "bg-zinc-950 text-white"
    : "bg-white text-zinc-900";

  return (
    <div className={`${theme} min-h-screen`}>
      <Nav />
      {children}
    </div>
  );
}
