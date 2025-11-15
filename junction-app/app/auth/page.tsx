"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, signIn, signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const inputClassName =
    "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 focus:outline-none";

  // if logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, firstName, lastName);
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const pageStats = useMemo(
    () => [
      {
        value: "~2 min",
        label: "Average approval time",
      },
      {
        value: "15+",
        label: "Signals per assessment",
      },
      {
        value: "0–100",
        label: "Transparent trust score",
      },
    ],
    [],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>
      <div className="absolute -right-32 top-0 h-[600px] w-[600px] rounded-full bg-emerald-500/20 blur-[160px]" />
      <div className="absolute -left-32 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[160px]" />

      <div className="relative mx-auto flex min-h-screen w-full items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-6xl gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur">
              Junction One • Zero-trust intake
            </div>
            <div>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Join the trust layer for{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  security decisions
                </span>
              </h1>
              <p className="mt-6 text-lg text-white/70">
                One login gives you SOC 2 ready assessments, audit trails, and
                explainable AI recommendations so your team never ships blind.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {pageStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="text-2xl font-semibold">{stat.value}</div>
                  <p className="mt-2 text-sm text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>

            <p className="text-sm uppercase tracking-[0.3em] text-white/40">
              Trusted by security teams in EMEA &amp; the Nordics
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-zinc-900/70 p-8 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-widest text-emerald-400">
                  Access portal
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {isLogin ? "Welcome back" : "Create your account"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-white/60 transition hover:text-white"
              >
                {isLogin ? "Need access?" : "Have an account?"}
              </button>
            </div>

            <div className="mt-6 flex rounded-full bg-white/5 p-1 text-sm text-white/70">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 rounded-full px-4 py-2 transition ${
                  isLogin ? "bg-white text-zinc-900" : "text-white/60"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 rounded-full px-4 py-2 transition ${
                  !isLogin ? "bg-white text-zinc-900" : "text-white/60"
                }`}
              >
                Create account
              </button>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {!isLogin && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="first-name"
                      className="mb-2 block text-sm text-white/70"
                    >
                      First name
                    </label>
                    <input
                      id="first-name"
                      name="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={inputClassName}
                      placeholder="Alex"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="last-name"
                      className="mb-2 block text-sm text-white/70"
                    >
                      Last name
                    </label>
                    <input
                      id="last-name"
                      name="lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={inputClassName}
                      placeholder="Choi"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="email-address"
                  className="text-sm text-white/70"
                >
                  Work email
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClassName}
                  placeholder="ciso@company.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm text-white/70">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClassName}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-base font-semibold text-zinc-950 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Loader2 className="size-5 animate-spin" />}
                {isLogin ? "Secure sign in" : "Create secure access"}
              </button>

              <div className="flex items-center gap-3 text-sm text-white/50">
                <div className="h-px flex-1 bg-white/10" />
                Or continue with
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm font-medium text-white/90 transition hover:border-white/30 hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Google Workspace
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
