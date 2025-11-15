"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Search,
} from "lucide-react";

const securityHighlights = [
  {
    icon: CheckCircle2,
    text: "SOC 2 Type II certified",
    color: "text-emerald-400",
  },
  {
    icon: CheckCircle2,
    text: "ISO 27001 compliant",
    color: "text-emerald-400",
  },
  {
    icon: AlertTriangle,
    text: "3 CVEs in past 12 months",
    color: "text-yellow-400",
  },
];

const dataPractices = [
  {
    icon: CheckCircle2,
    text: "GDPR compliant",
    color: "text-emerald-400",
  },
  {
    icon: CheckCircle2,
    text: "Encryption at rest & transit",
    color: "text-emerald-400",
  },
  {
    icon: CheckCircle2,
    text: "Data residency controls",
    color: "text-emerald-400",
  },
];

const exampleApps = [
  { name: "Slack", icon: "💬" },
  { name: "Notion", icon: "📝" },
  { name: "Datadog", icon: "📊" },
  { name: "Claude", icon: "🤖" },
];

export function Demo() {
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 1800);
  };

  return (
    <section
      id="demo"
      className="relative bg-zinc-900/50 px-6 py-32 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-5xl tracking-tight">Try it now</h2>
          <p className="text-xl text-zinc-400">
            Enter any application name, vendor, or URL
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-12 max-w-3xl rounded-2xl border border-white/10 bg-zinc-950/80 p-2 shadow-2xl"
        >
          <div className="relative flex items-center rounded-xl bg-zinc-900">
            <Search className="pointer-events-none absolute left-6 size-6 text-zinc-500" />
            <input
              type="text"
              className="h-20 w-full rounded-xl bg-transparent pl-16 pr-44 text-lg text-white placeholder:text-zinc-600 focus:outline-none"
              placeholder="e.g., Slack, notion.so, or AWS S3"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={isAnalyzing}
            />
            <button
              type="submit"
              disabled={isAnalyzing || !input.trim()}
              className="absolute right-3 flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-medium text-zinc-950 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Analyzing
                </>
              ) : (
                "Assess"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm text-zinc-500">Quick try:</span>
          {exampleApps.map((app) => (
            <button
              key={app.name}
              onClick={() => setInput(app.name)}
              disabled={isAnalyzing}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 transition hover:scale-105 hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="mr-2">{app.icon}</span>
              {app.name}
            </button>
          ))}
        </div>

        <div className="mt-20">
          <div className="relative mx-auto max-w-5xl rounded-3xl border border-white/10 bg-zinc-950/80 p-10 shadow-2xl backdrop-blur">
            <div className="mb-8 flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-5">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-400 text-2xl shadow-lg">
                  📊
                </div>
                <div>
                  <h3 className="mb-2 text-2xl tracking-tight">
                    Slack Technologies, LLC
                  </h3>
                  <p className="text-zinc-400">SaaS Collaboration Platform</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-6xl tracking-tight text-transparent">
                  82
                </div>
                <div className="text-sm text-zinc-400">Trust score</div>
                <div className="mt-2 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                  High confidence
                </div>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {[securityHighlights, dataPractices].map((items, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="mb-4 text-sm uppercase tracking-wide text-zinc-500">
                    {index === 0 ? "Security posture" : "Data handling"}
                  </div>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.text} className="flex items-center gap-3">
                        <item.icon className={`size-5 ${item.color}`} />
                        <span className="text-sm text-zinc-300">
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-2 rounded-full bg-emerald-400" />
                15 sources verified • Updated 2 minutes ago
              </div>
              <button className="inline-flex items-center gap-2 text-white transition hover:text-zinc-300">
                <span>View full report</span>
                <ExternalLink className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
