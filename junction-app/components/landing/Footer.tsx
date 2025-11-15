import { Github, Linkedin, Shield, Twitter } from "lucide-react";

const productLinks = ["Documentation", "API", "Example reports", "Changelog"];
const resourceLinks = ["Security", "Privacy", "Terms", "Support"];

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-white text-zinc-950 shadow-lg">
                <Shield className="size-6" strokeWidth={2} />
              </div>
              <span className="text-xl tracking-tight">Aegis</span>
            </div>
            <p className="max-w-md text-sm text-zinc-500">
              AI-powered security intelligence for modern security teams. Moving
              from reactive firefighting to proactive enablement.
            </p>
          </div>
          <div>
            <div className="text-sm uppercase tracking-wide text-zinc-500">
              Product
            </div>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              {productLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="transition hover:text-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-sm uppercase tracking-wide text-zinc-500">
              Resources
            </div>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              {resourceLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="transition hover:text-white">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-8 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
          <span>Built for the WithSecure GenAI Security Challenge</span>
          <div className="flex items-center gap-4">
            {[
              { icon: Github, label: "GitHub" },
              { icon: Twitter, label: "Twitter" },
              { icon: Linkedin, label: "LinkedIn" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:border-white/20 hover:bg-white/10"
              >
                <Icon className="size-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
