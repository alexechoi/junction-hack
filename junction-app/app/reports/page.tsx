"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Files,
  ListChecks,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const reportSummaries = [
  {
    id: "slack-trust-001",
    vendor: "Slack Technologies, LLC",
    website: "slack.com",
    score: 82,
    status: "High Confidence",
    category: "SaaS Collaboration",
    updated: "2 min ago",
    sources: 18,
    risk: "Low",
  },
  {
    id: "notion-trust-004",
    vendor: "Notion Labs, Inc.",
    website: "notion.so",
    score: 78,
    status: "Medium Confidence",
    category: "Knowledge Base",
    updated: "12 min ago",
    sources: 15,
    risk: "Moderate",
  },
  {
    id: "datadog-trust-007",
    vendor: "Datadog, Inc.",
    website: "datadoghq.com",
    score: 88,
    status: "High Confidence",
    category: "Observability",
    updated: "33 min ago",
    sources: 22,
    risk: "Low",
  },
  {
    id: "claude-trust-002",
    vendor: "Anthropic PBC",
    website: "anthropic.com",
    score: 71,
    status: "Medium Confidence",
    category: "AI Assistant",
    updated: "1 hr ago",
    sources: 16,
    risk: "Elevated",
  },
];

export default function ReportsPage() {
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
      <div className="mx-auto max-w-6xl space-y-10">
        <section className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8 shadow-2xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-400/80">
                Intelligence Vault
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                Reports & Assessments
              </h1>
              <p className="mt-3 max-w-2xl text-white/60">
                Your latest trust briefs, ready to share with procurement,
                security, and legal teams. Each report is grounded in verified
                sources and scored transparently.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
                <Files className="size-4" />
                Upload artifact
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
              >
                New assessment
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Sparkles,
                label: "Reports generated this week",
                value: "12",
                subtext: "+3 vs last week",
              },
              {
                icon: Shield,
                label: "Average trust score",
                value: "80",
                subtext: "High confidence coverage",
              },
              {
                icon: BarChart3,
                label: "Sources verified",
                value: "63",
                subtext: "Across 18 vendors",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="mb-3 flex items-center gap-3 text-sm text-white/60">
                  <stat.icon className="size-4 text-emerald-400" />
                  {stat.label}
                </div>
                <div className="text-3xl font-semibold tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs uppercase tracking-wide text-emerald-300">
                  {stat.subtext}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-white/40">
                Library
              </p>
              <h2 className="text-3xl font-semibold tracking-tight">
                Recent trust briefs
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-white/60">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
                <ListChecks className="size-4 text-emerald-400" />
                Filter: High confidence
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
                <TrendingUp className="size-4 text-blue-400" />
                Sorted by Trust score
              </span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {reportSummaries.map((report) => (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-white/30 hover:bg-white/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 opacity-0 transition group-hover:opacity-100" />
                <div className="relative flex flex-col gap-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-white/50">{report.website}</p>
                      <h3 className="text-2xl font-semibold">
                        {report.vendor}
                      </h3>
                      <p className="text-sm text-white/60">{report.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-semibold text-white">
                        {report.score}
                      </div>
                      <p className="text-xs uppercase tracking-wide text-emerald-300">
                        Trust score
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-white/60">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/40">
                        Status
                      </p>
                      <p className="text-white">{report.status}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/40">
                        Sources
                      </p>
                      <p className="text-white">{report.sources}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/40">
                        Last updated
                      </p>
                      <p className="text-white">{report.updated}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-white/60">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs uppercase tracking-wide ${
                        report.risk === "Low"
                          ? "border border-emerald-400/40 text-emerald-300"
                          : report.risk === "Elevated"
                            ? "border border-yellow-400/40 text-yellow-300"
                            : "border border-blue-400/40 text-blue-300"
                      }`}
                    >
                      Risk: {report.risk}
                    </span>
                    <span className="inline-flex items-center gap-2 text-white">
                      View report
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
