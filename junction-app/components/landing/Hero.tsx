"use client";

import { ArrowRight, Shield, Sparkles } from "lucide-react";

const stats = [
  {
    value: "~2 min",
    label: "Average assessment time",
    gradient: "from-emerald-400",
  },
  {
    value: "15+",
    label: "Verified sources per report",
    gradient: "from-blue-400",
  },
  {
    value: "0–100",
    label: "Transparent trust score",
    gradient: "from-cyan-400",
  },
];

export function Hero() {
  const scrollToDemo = () => {
    if (typeof document === "undefined") return;
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden px-6 pb-32 pt-24 md:pb-48 md:pt-32">
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-emerald-500 opacity-20 blur-[150px]" />
      <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-blue-500 opacity-20 blur-[150px]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-20 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white text-zinc-950 shadow-lg shadow-white/20">
            <Shield className="size-6" strokeWidth={2} />
          </div>
          <span className="text-xl tracking-tight">Aegis</span>
        </div>

        <div className="max-w-5xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur-sm">
            <Sparkles className="size-4 text-emerald-400" />
            AI-powered security intelligence
          </div>

          <h1 className="mb-8 text-5xl leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
            Security decisions
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              in seconds
            </span>
          </h1>

          <p className="mb-12 max-w-2xl text-xl leading-relaxed text-zinc-400 md:text-2xl">
            Turn any application into a CISO-ready trust assessment.
            Source-grounded intelligence with zero hallucinations.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={scrollToDemo}
              className="group flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-medium text-zinc-950 shadow-xl shadow-white/20 transition hover:bg-zinc-100"
            >
              Start assessment
              <ArrowRight className="ml-2 size-5 transition group-hover:translate-x-1" />
            </button>
            <a
              href="#demo"
              className="flex h-14 items-center justify-center rounded-full border border-white/10 px-10 text-base text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              View example report
            </a>
          </div>
        </div>

        <div className="mt-28 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition duration-300 hover:scale-105 hover:bg-white/10"
            >
              <div
                className={`absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b ${stat.gradient} to-transparent`}
              />
              <div className="text-4xl tracking-tight">{stat.value}</div>
              <div className="mt-2 text-sm text-zinc-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
