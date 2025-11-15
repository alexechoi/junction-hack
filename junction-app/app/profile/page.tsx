"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold tracking-tight">Profile</h2>
            <p className="mt-2 text-white/60">Manage your account settings</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-6">
              <div className="flex size-16 items-center justify-center rounded-full bg-white/10">
                <User className="size-8 text-white/70" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-medium text-white">
                  {user?.displayName || "Unknown User"}
                </p>
                <p className="text-sm text-white/60">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-3 text-base font-medium text-white transition hover:bg-white/10"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
