"use client";

import { useEffect, useState } from "react";
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
  Loader2,
} from "lucide-react";

interface AccessedReport {
  entity_name: string;
  accessed_at: string;
  trust_score: number | null;
  product_name: string;
  vendor: string | null;
  report?: any;
  cached_at?: string;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [accessedReports, setAccessedReports] = useState<AccessedReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }

    fetchAccessedReports();
  }, [user, router]);

  const fetchAccessedReports = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/user/accessed-reports?userId=${user.uid}`,
      );
      const data = await response.json();

      if (response.ok) {
        setAccessedReports(data.accessed_reports || []);
      }
    } catch (error) {
      console.error("Error fetching accessed reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (score: number | null) => {
    if (!score) return "Unknown";
    if (score >= 85) return "Low";
    if (score >= 70) return "Moderate";
    if (score >= 50) return "Elevated";
    return "High";
  };

  const getConfidenceLevel = (report: any) => {
    const confidence = report?.trust_score?.confidence;
    if (confidence === "high") return "High Confidence";
    if (confidence === "medium") return "Medium Confidence";
    if (confidence === "low") return "Low Confidence";
    return "Medium Confidence";
  };

  const getTimeSince = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} min ago`;
    return "Just now";
  };

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
                label: "Reports accessed",
                value: loading ? "..." : accessedReports.length.toString(),
                subtext: "Total assessments viewed",
              },
              {
                icon: Shield,
                label: "Average trust score",
                value: loading
                  ? "..."
                  : accessedReports.length > 0
                    ? Math.round(
                        accessedReports.reduce(
                          (acc, r) => acc + (r.trust_score || 0),
                          0,
                        ) / accessedReports.length,
                      ).toString()
                    : "0",
                subtext: "Across accessed reports",
              },
              {
                icon: BarChart3,
                label: "Total sources",
                value: loading
                  ? "..."
                  : accessedReports
                      .reduce(
                        (acc, r) => acc + (r.report?.sources?.length || 0),
                        0,
                      )
                      .toString(),
                subtext: "Intelligence sources used",
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
                Your accessed reports
              </h2>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-white/60">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
                <ListChecks className="size-4 text-emerald-400" />
                {accessedReports.length} report
                {accessedReports.length !== 1 ? "s" : ""}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
                <TrendingUp className="size-4 text-blue-400" />
                Sorted by most recent
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="mx-auto size-12 animate-spin text-emerald-400" />
                <p className="mt-4 text-white/60">Loading your reports...</p>
              </div>
            </div>
          ) : accessedReports.length === 0 ? (
            <div className="rounded-3xl border border-white/10 border-dashed bg-white/5 p-12 text-center">
              <Shield className="mx-auto size-16 text-white/20" />
              <h3 className="mt-4 text-xl font-semibold text-white">
                No reports yet
              </h3>
              <p className="mt-2 text-white/60">
                Start by running a security assessment from the dashboard
              </p>
              <Link
                href="/dashboard"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
              >
                New assessment
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {accessedReports
                .sort(
                  (a, b) =>
                    new Date(b.accessed_at).getTime() -
                    new Date(a.accessed_at).getTime(),
                )
                .map((accessedReport) => {
                  const report = accessedReport.report;
                  const trustScore =
                    accessedReport.trust_score ||
                    report?.trust_score?.score ||
                    0;
                  const riskLevel = getRiskLevel(trustScore);
                  const productName =
                    accessedReport.product_name ||
                    report?.product_name ||
                    accessedReport.entity_name;
                  const vendor =
                    accessedReport.vendor || report?.vendor || productName;
                  const url = report?.url || "";
                  const category = report?.taxonomy?.[0] || "Unknown";
                  const sourceCount = report?.sources?.length || 0;

                  return (
                    <Link
                      key={accessedReport.entity_name}
                      href={`/reports/${accessedReport.entity_name}`}
                      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-white/30 hover:bg-white/10"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 opacity-0 transition group-hover:opacity-100" />
                      <div className="relative flex flex-col gap-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-white/50">
                              {url
                                .replace(/^https?:\/\//, "")
                                .replace(/\/$/, "")}
                            </p>
                            <h3 className="text-2xl font-semibold">{vendor}</h3>
                            <p className="text-sm text-white/60">{category}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-4xl font-semibold text-white">
                              {trustScore}
                            </div>
                            <p className="text-xs uppercase tracking-wide text-emerald-300">
                              Trust score
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-white/60">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-white/40">
                              Confidence
                            </p>
                            <p className="text-white">
                              {getConfidenceLevel(report)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-white/40">
                              Sources
                            </p>
                            <p className="text-white">{sourceCount}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-white/40">
                              Accessed
                            </p>
                            <p className="text-white">
                              {getTimeSince(accessedReport.accessed_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-white/60">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs uppercase tracking-wide ${
                              riskLevel === "Low"
                                ? "border border-emerald-400/40 text-emerald-300"
                                : riskLevel === "Elevated" ||
                                    riskLevel === "High"
                                  ? "border border-yellow-400/40 text-yellow-300"
                                  : "border border-blue-400/40 text-blue-300"
                            }`}
                          >
                            Risk: {riskLevel}
                          </span>
                          <span className="inline-flex items-center gap-2 text-white">
                            View report
                            <ArrowRight className="size-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
