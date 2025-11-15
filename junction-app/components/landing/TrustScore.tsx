import { AlertCircle, Shield, TrendingUp } from "lucide-react";

const categories = [
  {
    icon: Shield,
    score: "40pts",
    title: "Security & compliance",
    items: [
      "SOC 2 Type II",
      "ISO 27001",
      "Bug bounty programs",
      "Incident response",
    ],
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    scoreColor: "text-emerald-400",
  },
  {
    icon: AlertCircle,
    score: "35pts",
    title: "Vulnerability history",
    items: [
      "CVE frequency",
      "CISA KEV presence",
      "Patch response time",
      "Severity trends",
    ],
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-400",
    scoreColor: "text-blue-400",
  },
  {
    icon: TrendingUp,
    score: "25pts",
    title: "Vendor reputation",
    items: [
      "Market presence",
      "Public disclosures",
      "Third-party audits",
      "Transparency",
    ],
    iconBg: "bg-cyan-500/20",
    iconColor: "text-cyan-400",
    scoreColor: "text-cyan-400",
  },
];

export function TrustScore() {
  return (
    <section id="trust-score" className="relative overflow-hidden px-6 py-32">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-1/2 top-1/2 size-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
        <div className="absolute left-1/2 top-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
        <div className="absolute left-1/2 top-1/2 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
            <TrendingUp className="size-4" />
            Transparent methodology
          </div>
          <h2 className="text-5xl tracking-tight">
            How we calculate trust scores
          </h2>
          <p className="mt-4 text-xl text-zinc-400">
            Our 0–100 scoring system combines multiple security factors with
            clear confidence levels
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.title}
              className="group relative rounded-3xl border border-white/10 bg-white/5 p-8 transition duration-300 hover:bg-white/10"
            >
              <div
                className={`mb-6 inline-flex size-14 items-center justify-center rounded-2xl ${category.iconBg}`}
              >
                <category.icon
                  className={`size-7 ${category.iconColor}`}
                  strokeWidth={1.5}
                />
              </div>
              <div className={`text-3xl tracking-tight ${category.scoreColor}`}>
                {category.score}
              </div>
              <h3 className="mt-2 text-xl tracking-tight text-white">
                {category.title}
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                {category.items.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-zinc-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-zinc-500">
          Every score includes detailed rationale, confidence level, and cited
          sources.
        </p>
      </div>
    </section>
  );
}
