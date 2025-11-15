"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "lucide-react";

export default function Nav() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isLanding) return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLanding]);

  // For now we will always go with the dark shell theme but this should be refactored later
  const isDarkShell = true;

  const navTheme = isDarkShell
    ? scrolled && isLanding
      ? "border-white/10 bg-zinc-950/80 text-white shadow-lg shadow-black/30"
      : "border-white/10 bg-zinc-950/60 text-white"
    : "border-gray-200 bg-white text-gray-900 shadow-sm";
  const linkTheme = isDarkShell
    ? "text-sm font-medium text-white/70 hover:text-white"
    : "text-sm font-medium text-gray-700 hover:text-gray-900";
  const buttonTheme = isDarkShell
    ? "bg-white text-zinc-950 hover:bg-zinc-100"
    : "bg-blue-600 text-white hover:bg-blue-700";
  const secondaryLinkTheme = isDarkShell ? "text-white" : "text-gray-900";

  const landingLinks = [
    { href: "/#how-it-works", label: "How it works" },
    { href: "/#demo", label: "Demo" },
  ];

  return (
    <nav className={`sticky top-0 z-50 border-b backdrop-blur ${navTheme}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`text-xl font-bold transition ${secondaryLinkTheme}`}
            >
              Aegis
            </Link>
            {isLanding && (
              <div className="hidden md:flex items-center gap-4">
                {landingLinks.map((link) => (
                  <Link key={link.label} href={link.href} className={linkTheme}>
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`${linkTheme} rounded-full px-4 py-2 transition`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/reports"
                  className={`${linkTheme} rounded-full px-4 py-2 transition`}
                >
                  Reports
                </Link>
                <Link
                  href="/profile"
                  className={`${linkTheme} rounded-full px-4 py-2 transition`}
                >
                  <User className="size-4" />
                </Link>
              </>
            ) : (
              <Link
                href="/auth"
                className={`${buttonTheme} rounded-full px-4 py-2 text-sm font-medium transition`}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
