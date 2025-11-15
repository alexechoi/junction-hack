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
  Lock,
  Settings,
  Share2,
  TrendingDown,
  Users,
} from "lucide-react";

type ReportDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const strengths = [
  {
    title: "Enterprise Security",
    description: "SOC 2 Type II certified with annual audits",
    source: "vendor",
    link: "slack.com/trust/compliance",
  },
  {
    title: "Encryption Standards",
    description: "TLS 1.2+ in transit, AES-256 at rest",
    source: "independent",
    link: "docs.slack.com/security",
  },
  {
    title: "Bug Bounty Program",
    description: "Active HackerOne program since 2016",
    source: "independent",
    link: "hackerone.com/slack",
  },
  {
    title: "Security Response",
    description: "Dedicated PSIRT team with 24h SLA",
    source: "vendor",
    link: "slack.com/security/report",
  },
];

const considerations = [
  {
    title: "Data Residency",
    description: "Default US storage; EKM required for EU residency",
    severity: "medium",
  },
  {
    title: "Third-Party Apps",
    description: "800+ integrations require individual security review",
    severity: "medium",
  },
  {
    title: "Mobile App Security",
    description: "1 CVE in iOS app (Q2 2025, patched)",
    severity: "low",
  },
];

const compliance = [
  {
    cert: "SOC 2 Type II",
    issued: "2024-09-15",
    expires: "2025-09-15",
    scope: "Security, Availability, Confidentiality",
    auditor: "Deloitte & Touche LLP",
  },
  {
    cert: "ISO 27001:2013",
    issued: "2024-06-20",
    expires: "2027-06-20",
    scope: "Information Security Management",
    auditor: "BSI Group",
  },
  {
    cert: "GDPR Compliance",
    issued: "2018-05-25",
    expires: "Ongoing",
    scope: "Data Protection & Privacy",
    auditor: "Self-certified with DPA",
  },
  {
    cert: "HIPAA BAA Available",
    issued: "2023-01-10",
    expires: "Ongoing",
    scope: "Healthcare data (Enterprise Grid)",
    auditor: "Vendor-provided",
  },
];

const cves = [
  {
    id: "CVE-2025-1234",
    severity: "medium",
    cvss: "6.5",
    title: "Authentication bypass in Slack iOS app",
    published: "2025-06-15",
    patched: "2025-06-17",
    kev: false,
  },
  {
    id: "CVE-2025-0987",
    severity: "low",
    cvss: "3.1",
    title: "XSS in custom emoji upload feature",
    published: "2025-04-22",
    patched: "2025-04-23",
    kev: false,
  },
  {
    id: "CVE-2024-9876",
    severity: "medium",
    cvss: "5.3",
    title: "Information disclosure in workspace analytics",
    published: "2024-12-10",
    patched: "2024-12-12",
    kev: false,
  },
];

const sources = [
  {
    type: "vendor",
    source: "Slack Security White Paper",
    url: "slack.com/security/white-paper",
    date: "2025-09-01",
  },
  {
    type: "vendor",
    source: "Slack Trust Center - Compliance",
    url: "slack.com/trust/compliance",
    date: "2025-11-10",
  },
  {
    type: "independent",
    source: "SOC 2 Type II Report (Deloitte)",
    url: "Available upon request",
    date: "2024-09-15",
  },
  {
    type: "independent",
    source: "ISO 27001 Certificate (BSI Group)",
    url: "Available upon request",
    date: "2024-06-20",
  },
  {
    type: "independent",
    source: "National Vulnerability Database (NVD)",
    url: "nvd.nist.gov",
    date: "2025-11-15",
  },
  {
    type: "independent",
    source: "CISA Known Exploited Vulnerabilities",
    url: "cisa.gov/kev",
    date: "2025-11-15",
  },
  {
    type: "independent",
    source: "HackerOne Bug Bounty Program",
    url: "hackerone.com/slack",
    date: "2025-11-12",
  },
  {
    type: "vendor",
    source: "Slack Data Processing Addendum",
    url: "slack.com/dpa",
    date: "2025-01-15",
  },
];

const alternatives = [
  {
    name: "Microsoft Teams",
    score: 85,
    icon: "💼",
    reason:
      "Higher trust score with native Microsoft 365 integration and more granular compliance controls",
    pros: [
      "Native AD integration",
      "Advanced compliance center",
      "Enterprise certifications",
    ],
    cons: ["More complex setup", "Higher learning curve"],
  },
  {
    name: "Mattermost",
    score: 79,
    icon: "🔓",
    reason:
      "Self-hosted option provides full data control and eliminates third-party risk",
    pros: ["Full data sovereignty", "Open source", "On-prem deployment"],
    cons: ["Self-managed infrastructure", "Smaller ecosystem"],
  },
];

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

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
  }, [user, router]);

  const severityBadge = (severity: string) => {
    if (severity === "high" || severity === "critical") {
      return "border-red-500/30 bg-red-500/20 text-red-300";
    }
    if (severity === "medium") {
      return "border-yellow-500/30 bg-yellow-500/20 text-yellow-300";
    }
    return "border-blue-500/30 bg-blue-500/20 text-blue-300";
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
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
          <header className="space-y-8 rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-6">
                <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-3xl shadow-xl">
                  #️⃣
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-4xl font-semibold tracking-tight">
                      Slack Technologies, LLC
                    </h1>
                    <span className="rounded-full border border-blue-500/30 bg-blue-500/20 px-3 py-1 text-sm text-blue-100">
                      Verified
                    </span>
                  </div>
                  <p className="mt-1 text-white/60">slack.com</p>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/30">
                    {params.id}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-white/80">
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
                      SaaS Collaboration Platform
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
                      Business Communication
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
                <div className="text-7xl font-semibold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  82
                </div>
                <p className="mt-1 text-sm text-white/60">Trust score</p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-wide text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-300" />
                  High confidence • 18 sources
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              {[
                {
                  icon: CheckCircle2,
                  label: "Active certifications",
                  value: "4",
                },
                {
                  icon: AlertTriangle,
                  label: "CVEs (12 months)",
                  value: "3",
                },
                {
                  icon: TrendingDown,
                  label: "Vulnerability trend",
                  value: "-23%",
                },
                {
                  icon: Clock,
                  label: "Avg. patch time",
                  value: "4.2d",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-black/30 p-5"
                >
                  <div className="mb-2 flex items-center gap-3 text-sm text-white/60">
                    <stat.icon className="size-4 text-emerald-300" />
                    {stat.label}
                  </div>
                  <div className="text-2xl font-semibold">{stat.value}</div>
                </div>
              ))}
            </div>
          </header>

          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 p-8">
            <div className="flex items-center gap-3 text-2xl font-semibold">
              <FileText className="size-6" />
              Executive summary
            </div>
            <p className="mt-4 text-lg leading-relaxed text-white/70">
              Slack is a widely adopted enterprise collaboration platform with a
              strong security posture. The platform maintains SOC 2 Type II and
              ISO 27001 certifications, implements robust encryption standards,
              and demonstrates a declining CVE trend. While generally secure,
              teams should be aware of data residency considerations and
              configure SSO/SAML properly.
            </p>
            <div className="mt-4 flex items-start gap-2 text-sm text-white/60">
              <Info className="mt-0.5 size-4" />
              Assessment generated on November 15, 2025 at 14:32 UTC. Cached
              data may be up to 24 hours old.
            </div>
          </section>

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
              {activeTab === "security" && (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                      <h3 className="mb-6 text-xl font-semibold">
                        Key strengths
                      </h3>
                      <div className="space-y-4">
                        {strengths.map((item) => (
                          <div
                            key={item.title}
                            className="border-l-2 border-emerald-400 pl-4"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">
                                {item.title}
                              </p>
                              <span
                                className={`rounded-full border px-2 py-0.5 text-xs uppercase tracking-wide ${
                                  item.source === "vendor"
                                    ? "border-blue-500/30 bg-blue-500/20 text-blue-200"
                                    : "border-emerald-500/30 bg-emerald-500/20 text-emerald-200"
                                }`}
                              >
                                {item.source === "vendor"
                                  ? "Vendor"
                                  : "Independent"}
                              </span>
                            </div>
                            <p className="text-xs text-white/60">
                              {item.description}
                            </p>
                            <a
                              href="#"
                              className="mt-1 inline-flex items-center gap-1 text-xs text-white/50 transition hover:text-white/80"
                            >
                              {item.link}
                              <ExternalLink className="size-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                      <h3 className="mb-6 text-xl font-semibold">
                        Considerations
                      </h3>
                      <div className="space-y-4">
                        {considerations.map((item) => (
                          <div
                            key={item.title}
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
                            <p className="text-xs text-white/60">
                              {item.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                    <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                      <Building2 className="size-5" />
                      Vendor reputation
                    </h3>
                    <div className="grid gap-6 md:grid-cols-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-white/50">
                          Company
                        </p>
                        <p className="mt-1 text-white/80">
                          Salesforce, Inc. (acquired 2021)
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-white/50">
                          Market presence
                        </p>
                        <p className="mt-1 text-white/80">
                          20M+ DAU, Fortune 100 clients
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-white/50">
                          Transparency
                        </p>
                        <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-emerald-300">
                          <CheckCircle2 className="size-3" />
                          Public security documentation
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "compliance" && (
                <div className="grid gap-6 md:grid-cols-2">
                  {compliance.map((cert) => (
                    <div
                      key={cert.cert}
                      className="rounded-3xl border border-white/10 bg-white/5 p-6"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-lg font-semibold">{cert.cert}</p>
                        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs uppercase tracking-wide text-emerald-200">
                          Active
                        </span>
                      </div>
                      <dl className="mt-4 space-y-2 text-sm text-white/70">
                        <div className="flex justify-between">
                          <dt className="text-white/50">Issued</dt>
                          <dd>{cert.issued}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-white/50">Expires</dt>
                          <dd>{cert.expires}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-white/50">Scope</dt>
                          <dd className="text-right">{cert.scope}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-white/50">Auditor</dt>
                          <dd className="text-right">{cert.auditor}</dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "vulnerabilities" && (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">
                        CVE history (past 12 months)
                      </h3>
                      <span className="inline-flex items-center gap-2 text-sm text-emerald-300">
                        <TrendingDown className="size-4" />
                        -23% vs previous year
                      </span>
                    </div>
                    <div className="mt-6 space-y-4">
                      {cves.map((cve) => (
                        <div
                          key={cve.id}
                          className="rounded-2xl border border-white/10 p-6"
                        >
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="text-lg font-semibold">{cve.id}</p>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-xs uppercase tracking-wide ${severityBadge(
                                cve.severity
                              )}`}
                            >
                              {cve.severity} • CVSS {cve.cvss}
                            </span>
                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs uppercase text-emerald-200">
                              Patched
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-white/70">
                            {cve.title}
                          </p>
                          <div className="mt-4 grid gap-4 text-xs text-white/60 md:grid-cols-2">
                            <span>Published: {cve.published}</span>
                            <span>Patched: {cve.patched}</span>
                          </div>
                          {!cve.kev && (
                            <p className="mt-3 inline-flex items-center gap-2 text-xs text-white/50">
                              <Info className="size-3" />
                              Not listed in CISA KEV catalog
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-white/70">
                      <CheckCircle2 className="mb-2 size-5 text-emerald-300" />
                      No critical vulnerabilities in the last 12 months. Average
                      patch time of 4.2 days demonstrates strong response.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "data" && (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                      <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                        <Lock className="size-5" />
                        Encryption & storage
                      </h3>
                      <div className="space-y-4">
                        {[
                          {
                            label: "Data in transit",
                            value: "TLS 1.2+, perfect forward secrecy",
                          },
                          {
                            label: "Data at rest",
                            value: "AES-256 encryption",
                          },
                          {
                            label: "Key management",
                            value: "EKM available (Enterprise Grid)",
                          },
                          {
                            label: "Backups",
                            value: "Encrypted with separate keys",
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="flex items-start justify-between border-b border-white/5 pb-3 last:border-0"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {item.label}
                              </p>
                              <p className="text-xs text-white/60">
                                {item.value}
                              </p>
                            </div>
                            <CheckCircle2 className="size-5 text-emerald-300" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                      <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                        <Database className="size-5" />
                        Data residency & retention
                      </h3>
                      <div className="space-y-4">
                        {[
                          {
                            label: "Primary storage",
                            value: "United States (AWS)",
                            status: "info",
                          },
                          {
                            label: "EU residency",
                            value: "Available with Enterprise Grid",
                            status: "info",
                          },
                          {
                            label: "Retention",
                            value: "Configurable (1 day – unlimited)",
                            status: "good",
                          },
                          {
                            label: "Portability",
                            value: "Export tooling available",
                            status: "good",
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="flex items-start justify-between border-b border-white/5 pb-3 last:border-0"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {item.label}
                              </p>
                              <p className="text-xs text-white/60">
                                {item.value}
                              </p>
                            </div>
                            {item.status === "good" ? (
                              <CheckCircle2 className="size-5 text-emerald-300" />
                            ) : (
                              <Info className="size-5 text-blue-300" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                    <h3 className="text-xl font-semibold">
                      Privacy & compliance
                    </h3>
                    <div className="mt-6 grid gap-6 md:grid-cols-3">
                      {[
                        "GDPR compliant (DPA available)",
                        "CCPA compliant",
                        "Standard Contractual Clauses",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-3">
                          <CheckCircle2 className="size-5 text-emerald-300" />
                          <p className="text-sm text-white/70">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "deployment" && (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                      <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                        <Users className="size-5" />
                        Access controls
                      </h3>
                      <div className="space-y-4 text-sm text-white/80">
                        {[
                          { feature: "SSO / SAML", plan: "Business+" },
                          { feature: "2FA / MFA", plan: "All plans" },
                          { feature: "Session management", plan: "All plans" },
                          {
                            feature: "SCIM provisioning",
                            plan: "Enterprise Grid",
                          },
                          { feature: "Role-based access", plan: "Business+" },
                          {
                            feature: "Guest access controls",
                            plan: "All plans",
                          },
                        ].map((item) => (
                          <div
                            key={item.feature}
                            className="flex items-center justify-between"
                          >
                            <span>{item.feature}</span>
                            <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/60">
                              {item.plan}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                      <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                        <Settings className="size-5" />
                        Admin controls
                      </h3>
                      <div className="space-y-4 text-sm text-white/80">
                        {[
                          { feature: "Audit logs", plan: "Business+" },
                          {
                            feature: "DLP integration",
                            plan: "Enterprise Grid",
                          },
                          {
                            feature: "eDiscovery API",
                            plan: "Enterprise Grid",
                          },
                          { feature: "Retention policies", plan: "Business+" },
                          { feature: "Admin analytics", plan: "Business+" },
                          { feature: "App management", plan: "All plans" },
                        ].map((item) => (
                          <div
                            key={item.feature}
                            className="flex items-center justify-between"
                          >
                            <span>{item.feature}</span>
                            <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/60">
                              {item.plan}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-6">
                    <div className="flex items-start gap-3 text-sm text-white/80">
                      <AlertTriangle className="mt-0.5 size-5 text-yellow-300" />
                      <div>
                        <p className="font-semibold">Recommendation</p>
                        <p className="mt-1 text-white/70">
                          For enterprise deployments, enable SSO/SAML and
                          enforce MFA. Consider Enterprise Grid for EKM, DLP,
                          and dedicated support. Review third-party app access
                          quarterly.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-semibold">Recommended alternatives</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {alternatives.map((alt) => (
                <div
                  key={alt.name}
                  className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-2xl">
                        {alt.icon}
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
                    <div>
                      <p className="text-white/40">Advantages</p>
                      <ul className="mt-2 space-y-1">
                        {alt.pros.map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <CheckCircle2 className="size-3 text-emerald-300" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-white/40">Trade-offs</p>
                      <ul className="mt-2 space-y-1">
                        {alt.cons.map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <AlertCircle className="size-3 text-yellow-300" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-semibold">Sources & citations</h2>
            <div className="mt-6 space-y-4">
              {sources.map((source) => (
                <div
                  key={source.source}
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
                    <span>{source.date}</span>
                    <a
                      href="#"
                      className="inline-flex items-center gap-1 text-white/60 transition hover:text-white"
                    >
                      {source.url}
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-xs text-white/70">
              <Info className="mb-1 size-4 text-blue-300" />
              All sources accessed and verified between November 10–15, 2025.
              Vendor-stated claims are labeled and corroborated when possible.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
