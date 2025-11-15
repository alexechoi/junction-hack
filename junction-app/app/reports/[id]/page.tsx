"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  Database,
  Download,
  ExternalLink,
  FileText,
  Info,
  Loader2,
  Lock,
  Settings,
  Share2,
  Shield,
  TrendingDown,
  Users,
} from "lucide-react";

type ReportDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

interface ReportData {
  cached_at: string;
  query: string;
  report: any;
}

const tabs = [
  { id: "security", label: "Security posture" },
  { id: "compliance", label: "Compliance" },
  { id: "vulnerabilities", label: "Vulnerabilities" },
  { id: "data", label: "Data handling" },
  { id: "deployment", label: "Deployment" },
];

export default function ReportDetailPage(props: ReportDetailPageProps) {
  const params = use(props.params);
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("security");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }

    fetchReport();
  }, [user, router, params.id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reports/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch report");
      }

      setReportData(data);
    } catch (err) {
      console.error("Error fetching report:", err);
      setError(err instanceof Error ? err.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const severityBadge = (severity: string) => {
    if (severity === "high" || severity === "critical") {
      return "border-red-500/30 bg-red-500/20 text-red-300";
    }
    if (severity === "medium") {
      return "border-yellow-500/30 bg-yellow-500/20 text-yellow-300";
    }
    return "border-blue-500/30 bg-blue-500/20 text-blue-300";
  };

  const getRiskLevel = (score: number) => {
    if (score >= 85) return { label: "Low", color: "emerald" };
    if (score >= 70) return { label: "Moderate", color: "blue" };
    if (score >= 50) return { label: "Elevated", color: "yellow" };
    return { label: "High", color: "red" };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <Loader2 className="mx-auto size-12 animate-spin text-emerald-400" />
          <p className="mt-4 text-white/60">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center">
          <AlertCircle className="mx-auto size-12 text-red-400" />
          <h2 className="mt-4 text-xl font-semibold text-white">
            Report Not Found
          </h2>
          <p className="mt-2 text-white/60">
            {error || "The requested report could not be found."}
          </p>
          <Link
            href="/reports"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
          >
            <ArrowLeft className="size-4" />
            Back to reports
          </Link>
        </div>
      </div>
    );
  }

  const report = reportData.report;
  const trustScore = report?.trust_score?.score || 0;
  const riskLevel = getRiskLevel(trustScore);
  const productName = report?.product_name || params.id;
  const vendor = report?.vendor || report?.vendor_info?.company || productName;
  const url = report?.url || "";
  const taxonomy = report?.taxonomy || [];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-zinc-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/reports"
            className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Back to reports
          </Link>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10">
              <Share2 className="size-4" />
              Share
            </button>
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100">
              <Download className="size-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-10">
        <div className="mx-auto max-w-6xl space-y-12">
          {/* Report Header */}
          <header className="space-y-8 rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-6">
                <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 text-3xl shadow-xl">
                  <Shield className="size-10 text-white" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-4xl font-semibold tracking-tight">
                      {vendor}
                    </h1>
                    {report?.trust_score?.confidence === "high" && (
                      <span className="rounded-full border border-blue-500/30 bg-blue-500/20 px-3 py-1 text-sm text-blue-100">
                        Verified
                      </span>
                    )}
                  </div>
                  {url && (
                    <p className="mt-1 text-white/60">
                      {url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </p>
                  )}
                  <p className="text-xs uppercase tracking-[0.4em] text-white/30">
                    {params.id}
                  </p>
                  {taxonomy.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-white/80">
                      {taxonomy
                        .slice(0, 3)
                        .map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="rounded-full border border-white/10 bg-white/10 px-3 py-1"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
                <div className="text-7xl font-semibold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  {trustScore}
                </div>
                <p className="mt-1 text-sm text-white/60">Trust score</p>
                <div
                  className={`mt-3 inline-flex items-center gap-2 rounded-full border border-${riskLevel.color}-400/40 bg-${riskLevel.color}-500/10 px-3 py-1 text-xs uppercase tracking-wide text-${riskLevel.color}-300`}
                >
                  <span
                    className={`size-1.5 rounded-full bg-${riskLevel.color}-300`}
                  />
                  {report?.trust_score?.confidence || "Medium"} confidence •{" "}
                  {report?.trust_score?.source_count ||
                    report?.sources?.length ||
                    0}{" "}
                  sources
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              {report?.compliance && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <div className="mb-2 flex items-center gap-3 text-sm text-white/60">
                    <CheckCircle2 className="size-4 text-emerald-300" />
                    Active certifications
                  </div>
                  <div className="text-2xl font-semibold">
                    {report.compliance.length}
                  </div>
                </div>
              )}
              {report?.cves && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <div className="mb-2 flex items-center gap-3 text-sm text-white/60">
                    <AlertTriangle className="size-4 text-yellow-300" />
                    CVEs (12 months)
                  </div>
                  <div className="text-2xl font-semibold">
                    {report.cves.length}
                  </div>
                </div>
              )}
              {report?.vendor_info?.vulnerability_trend && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <div className="mb-2 flex items-center gap-3 text-sm text-white/60">
                    <TrendingDown className="size-4 text-emerald-300" />
                    Vulnerability trend
                  </div>
                  <div className="text-2xl font-semibold">
                    {report.vendor_info.vulnerability_trend}
                  </div>
                </div>
              )}
              {report?.avg_patch_time && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <div className="mb-2 flex items-center gap-3 text-sm text-white/60">
                    <Clock className="size-4 text-blue-300" />
                    Avg. patch time
                  </div>
                  <div className="text-2xl font-semibold">
                    {report.avg_patch_time}
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Executive Summary */}
          {report?.executive_summary && (
            <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 p-8">
              <div className="flex items-center gap-3 text-2xl font-semibold">
                <FileText className="size-6" />
                Executive summary
              </div>
              <p className="mt-4 text-lg leading-relaxed text-white/70">
                {report.executive_summary}
              </p>
              {report?.generated_at && (
                <div className="mt-4 flex items-start gap-2 text-sm text-white/60">
                  <Info className="mt-0.5 size-4" />
                  Assessment generated on{" "}
                  {new Date(report.generated_at).toLocaleString()}
                </div>
              )}
            </section>
          )}

          {/* Tabs */}
          <section>
            <div className="flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/5 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-2xl px-4 py-2 text-sm transition ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-8 space-y-6">
              {/* Security Tab */}
              {activeTab === "security" && (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Strengths */}
                    {report?.strengths && report.strengths.length > 0 && (
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                        <h3 className="mb-6 text-xl font-semibold">
                          Key strengths
                        </h3>
                        <div className="space-y-4">
                          {report.strengths.map((item: any, index: number) => (
                            <div
                              key={index}
                              className="border-l-2 border-emerald-400 pl-4"
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">
                                  {item.title}
                                </p>
                                <span
                                  className={`rounded-full border px-2 py-0.5 text-xs uppercase tracking-wide ${
                                    item.source_type === "vendor"
                                      ? "border-blue-500/30 bg-blue-500/20 text-blue-200"
                                      : "border-emerald-500/30 bg-emerald-500/20 text-emerald-200"
                                  }`}
                                >
                                  {item.source_type || "vendor"}
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-white/60">
                                {item.description}
                              </p>
                              {item.source_url && (
                                <a
                                  href={item.source_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 inline-flex items-center gap-1 text-xs text-white/50 transition hover:text-white/80"
                                >
                                  View source
                                  <ExternalLink className="size-3" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Considerations */}
                    {report?.considerations &&
                      report.considerations.length > 0 && (
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                          <h3 className="mb-6 text-xl font-semibold">
                            Considerations
                          </h3>
                          <div className="space-y-4">
                            {report.considerations.map(
                              (item: any, index: number) => (
                                <div
                                  key={index}
                                  className="border-l-2 border-yellow-400 pl-4"
                                >
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">
                                      {item.title}
                                    </p>
                                    <span
                                      className={`rounded-full border px-2 py-0.5 text-xs uppercase tracking-wide ${severityBadge(item.severity)}`}
                                    >
                                      {item.severity}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs text-white/60">
                                    {item.description}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Vendor Info */}
                  {report?.vendor_info && (
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                      <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                        <Building2 className="size-5" />
                        Vendor information
                      </h3>
                      <div className="grid gap-6 md:grid-cols-3">
                        {report.vendor_info.company && (
                          <div>
                            <p className="text-xs uppercase tracking-wide text-white/50">
                              Company
                            </p>
                            <p className="mt-1 text-white/80">
                              {report.vendor_info.company}
                            </p>
                          </div>
                        )}
                        {report.vendor_info.market_presence && (
                          <div>
                            <p className="text-xs uppercase tracking-wide text-white/50">
                              Market presence
                            </p>
                            <p className="mt-1 text-white/80">
                              {report.vendor_info.market_presence}
                            </p>
                          </div>
                        )}
                        {report.vendor_info.transparency && (
                          <div>
                            <p className="text-xs uppercase tracking-wide text-white/50">
                              Transparency
                            </p>
                            <p className="mt-1 text-white/80">
                              {report.vendor_info.transparency}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Compliance Tab */}
              {activeTab === "compliance" && report?.compliance && (
                <div className="grid gap-6 md:grid-cols-2">
                  {report.compliance.map((cert: any, index: number) => (
                    <div
                      key={index}
                      className="rounded-3xl border border-white/10 bg-white/5 p-6"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-lg font-semibold">{cert.cert}</p>
                        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs uppercase tracking-wide text-emerald-200">
                          Active
                        </span>
                      </div>
                      <dl className="mt-4 space-y-2 text-sm text-white/70">
                        {cert.issued && (
                          <div className="flex justify-between">
                            <dt className="text-white/50">Issued</dt>
                            <dd>{cert.issued}</dd>
                          </div>
                        )}
                        {cert.expires && (
                          <div className="flex justify-between">
                            <dt className="text-white/50">Expires</dt>
                            <dd>{cert.expires}</dd>
                          </div>
                        )}
                        {cert.scope && (
                          <div className="flex justify-between">
                            <dt className="text-white/50">Scope</dt>
                            <dd className="text-right">{cert.scope}</dd>
                          </div>
                        )}
                        {cert.auditor && (
                          <div className="flex justify-between">
                            <dt className="text-white/50">Auditor</dt>
                            <dd className="text-right">{cert.auditor}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  ))}
                </div>
              )}

              {/* Vulnerabilities Tab */}
              {activeTab === "vulnerabilities" && report?.cves && (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">
                        CVE history (past 12 months)
                      </h3>
                      {report.vendor_info?.vulnerability_trend && (
                        <span className="inline-flex items-center gap-2 text-sm text-emerald-300">
                          <TrendingDown className="size-4" />
                          {report.vendor_info.vulnerability_trend}
                        </span>
                      )}
                    </div>
                    <div className="mt-6 space-y-4">
                      {report.cves.map((cve: any, index: number) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-white/10 p-6"
                        >
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="text-lg font-semibold">{cve.id}</p>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-xs uppercase tracking-wide ${severityBadge(cve.severity)}`}
                            >
                              {cve.severity} {cve.cvss && `• CVSS ${cve.cvss}`}
                            </span>
                            {cve.patched && (
                              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs uppercase text-emerald-200">
                                Patched
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-white/70">
                            {cve.title}
                          </p>
                          <div className="mt-4 grid gap-4 text-xs text-white/60 md:grid-cols-2">
                            {cve.published && (
                              <span>Published: {cve.published}</span>
                            )}
                            {cve.patched && <span>Patched: {cve.patched}</span>}
                          </div>
                          {cve.kev === false && (
                            <p className="mt-3 inline-flex items-center gap-2 text-xs text-white/50">
                              <Info className="size-3" />
                              Not listed in CISA KEV catalog
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Data Handling Tab */}
              {activeTab === "data" && (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Encryption */}
                    {report?.encryption && (
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                        <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                          <Lock className="size-5" />
                          Encryption & storage
                        </h3>
                        <div className="space-y-4">
                          {Object.entries(report.encryption).map(
                            ([key, value]: [string, any]) => (
                              <div
                                key={key}
                                className="flex items-start justify-between border-b border-white/5 pb-3 last:border-0"
                              >
                                <div>
                                  <p className="text-sm font-medium capitalize">
                                    {key.replace(/_/g, " ")}
                                  </p>
                                  <p className="text-xs text-white/60">
                                    {value}
                                  </p>
                                </div>
                                <CheckCircle2 className="size-5 text-emerald-300" />
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                    {/* Data Residency */}
                    {report?.data_residency && (
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                        <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                          <Database className="size-5" />
                          Data residency & retention
                        </h3>
                        <div className="space-y-4">
                          {Object.entries(report.data_residency).map(
                            ([key, value]: [string, any]) => (
                              <div
                                key={key}
                                className="flex items-start justify-between border-b border-white/5 pb-3 last:border-0"
                              >
                                <div>
                                  <p className="text-sm font-medium capitalize">
                                    {key.replace(/_/g, " ")}
                                  </p>
                                  <p className="text-xs text-white/60">
                                    {value}
                                  </p>
                                </div>
                                <Info className="size-5 text-blue-300" />
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Privacy Compliance */}
                  {report?.privacy_compliance &&
                    report.privacy_compliance.length > 0 && (
                      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                        <h3 className="text-xl font-semibold">
                          Privacy & compliance
                        </h3>
                        <div className="mt-6 grid gap-6 md:grid-cols-3">
                          {report.privacy_compliance.map(
                            (item: string, index: number) => (
                              <div
                                key={index}
                                className="flex items-center gap-3"
                              >
                                <CheckCircle2 className="size-5 text-emerald-300" />
                                <p className="text-sm text-white/70">{item}</p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Deployment Tab */}
              {activeTab === "deployment" && (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Access Controls */}
                    {report?.access_controls &&
                      report.access_controls.length > 0 && (
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                          <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                            <Users className="size-5" />
                            Access controls
                          </h3>
                          <div className="space-y-4 text-sm text-white/80">
                            {report.access_controls.map(
                              (item: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between"
                                >
                                  <span>{item.feature}</span>
                                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/60">
                                    {item.plan}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {/* Admin Controls */}
                    {report?.admin_controls &&
                      report.admin_controls.length > 0 && (
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                          <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                            <Settings className="size-5" />
                            Admin controls
                          </h3>
                          <div className="space-y-4 text-sm text-white/80">
                            {report.admin_controls.map(
                              (item: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between"
                                >
                                  <span>{item.feature}</span>
                                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/60">
                                    {item.plan}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Deployment Recommendations */}
                  {report?.deployment_recommendations && (
                    <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-6">
                      <div className="flex items-start gap-3 text-sm text-white/80">
                        <AlertTriangle className="mt-0.5 size-5 text-yellow-300" />
                        <div>
                          <p className="font-semibold">
                            Deployment Recommendations
                          </p>
                          <p className="mt-1 text-white/70">
                            {report.deployment_recommendations}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Alternatives */}
          {report?.alternatives && report.alternatives.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-3xl font-semibold">
                Recommended alternatives
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {report.alternatives.map((alt: any, index: number) => (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                          {alt.icon || "📦"}
                        </div>
                        <div>
                          <p className="text-xl font-semibold">{alt.name}</p>
                          <p className="text-sm text-white/60">
                            Trust Score: {alt.score}/100
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase text-white/60">
                        Alternative
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-white/70">{alt.reason}</p>
                    <div className="mt-6 grid gap-4 text-xs text-white/60 md:grid-cols-2">
                      {alt.pros && alt.pros.length > 0 && (
                        <div>
                          <p className="text-white/40">Advantages</p>
                          <ul className="mt-2 space-y-1">
                            {alt.pros.map((item: string, i: number) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle2 className="size-3 text-emerald-300" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {alt.cons && alt.cons.length > 0 && (
                        <div>
                          <p className="text-white/40">Trade-offs</p>
                          <ul className="mt-2 space-y-1">
                            {alt.cons.map((item: string, i: number) => (
                              <li key={i} className="flex items-center gap-2">
                                <AlertCircle className="size-3 text-yellow-300" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sources */}
          {report?.sources && report.sources.length > 0 && (
            <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-3xl font-semibold">Sources & citations</h2>
              <div className="mt-6 space-y-4">
                {report.sources.map((source: any, index: number) => (
                  <div
                    key={index}
                    className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-black/30 p-4 text-sm text-white/70 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wide ${
                          source.type === "vendor"
                            ? "border-blue-500/30 bg-blue-500/20 text-blue-200"
                            : "border-emerald-500/30 bg-emerald-500/20 text-emerald-200"
                        }`}
                      >
                        {source.type}
                      </span>
                      <span>{source.source}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-white/50">
                      {source.date && <span>{source.date}</span>}
                      {source.url && (
                        <a
                          href={
                            source.url.startsWith("http")
                              ? source.url
                              : `https://${source.url}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-white/60 transition hover:text-white"
                        >
                          {source.url}
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {report.generated_at && (
                <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-xs text-white/70">
                  <Info className="mb-1 size-4 text-blue-300" />
                  All sources accessed and verified. Generated on{" "}
                  {new Date(report.generated_at).toLocaleDateString()}.
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
