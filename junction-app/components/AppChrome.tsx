"use client";

import Nav from "@/components/Nav";

type AppChromeProps = {
  children: React.ReactNode;
};

export function AppChrome({ children }: AppChromeProps) {
  const theme = "bg-zinc-950 text-white";

  return (
    <div className={`${theme} min-h-screen`}>
      <Nav />
      {children}
    </div>
  );
}
