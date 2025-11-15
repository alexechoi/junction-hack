"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

  const navTheme = isLanding
    ? scrolled
      ? "border-white/10 bg-zinc-950/80 text-white shadow-lg shadow-black/30"
      : "border-transparent bg-transparent text-white"
    : "border-gray-200 bg-white text-gray-900 shadow-sm";
  const linkTheme = isLanding
    ? "text-sm font-medium text-white/80 hover:text-white"
    : "text-sm font-medium text-gray-700 hover:text-gray-900";
  const buttonTheme = isLanding
    ? "bg-white text-zinc-950 hover:bg-zinc-100"
    : "bg-blue-600 text-white hover:bg-blue-700";
  const secondaryLinkTheme = isLanding ? "text-white" : "text-gray-900";

  const landingLinks = [
    { href: "/#how-it-works", label: "How it works" },
    { href: "/#features", label: "Features" },
    { href: "/#demo", label: "Demo" },
    { href: "/#trust-score", label: "Trust score" },
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

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`${linkTheme} rounded-md px-3 py-2`}
                >
                  Dashboard
                </Link>
                <span
                  className={`text-sm ${
                    isLanding ? "text-white/70" : "text-gray-600"
                  }`}
                >
                  {user.email}
                </span>
              </>
            ) : (
              <>
                <Link href="/" className={`${linkTheme} rounded-md px-3 py-2`}>
                  Home
                </Link>
                <Link
                  href="/auth"
                  className={`${buttonTheme} rounded-full px-4 py-2 text-sm font-medium transition`}
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
