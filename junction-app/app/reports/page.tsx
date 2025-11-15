"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold tracking-tight">Reports</h2>
            <p className="mt-2 text-white/60">
              View your reports on applications
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
