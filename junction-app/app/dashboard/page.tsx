"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { FileUp, Loader, Upload } from "lucide-react";
import ResearchStreamModal from "@/components/ResearchStreamModal";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStreamModal, setShowStreamModal] = useState(false);
  const [streamingEntityName, setStreamingEntityName] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
  }, [user, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim() && !fileName) return;
    setIsSubmitting(true);

    try {
      // Call the research API
      const response = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      // If entity was found in Firestore
      if (data.found) {
        router.push(`/entity/${data.entity.id}`);
      } else {
        // Entity not found, open streaming modal
        setStreamingEntityName(data.entityName);
        setShowStreamModal(true);
      }
    } catch (error) {
      console.error("Error submitting query:", error);
      alert(
        error instanceof Error ? error.message : "Failed to process request",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStreamComplete = async () => {
    // Save accessed report to user's collection
    if (user && streamingEntityName) {
      try {
        await fetch("/api/user/accessed-reports", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.uid,
            entityName: streamingEntityName,
          }),
        });
      } catch (error) {
        console.error("Error saving accessed report:", error);
      }
    }

    // Redirect to reports page after streaming completes
    router.push("/reports");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-10">
        <section className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8 shadow-2xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-emerald-400">
                Trust assessment
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Run a new analysis
              </h2>
              <p className="mt-2 text-white/60">
                Enter a vendor/app name or upload a binary, installer, or config
                file for inspection.
              </p>
            </div>
            <button
              onClick={() => router.push("/reports")}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
            >
              View reports
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/30 to-blue-500/30 opacity-0 blur-xl transition group-focus-within:opacity-40" />
              <div className="relative rounded-2xl border border-white/10 bg-black/30 p-1">
                <textarea
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="e.g. Slack, notion.so, AWS S3, or describe the artifact you want assessed."
                  className="h-40 w-full resize-none rounded-2xl border border-white/10 bg-black/50 p-6 text-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-4 py-3 text-sm text-white/60">
                  <span>
                    We auto-enrich your query with SOC 2, CVE, and vendor intel.
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-widest text-white/50">
                    Text input
                  </span>
                </div>
              </div>
            </div>

            <label
              htmlFor="file-upload"
              className="flex cursor-pointer flex-col gap-4 rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 transition hover:border-white/40 hover:bg-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10">
                  <Upload className="size-6 text-white/70" />
                </div>
                <div>
                  <p className="text-lg font-medium text-white">
                    Upload executable or package
                  </p>
                  <p className="text-sm text-white/60">
                    .exe, .msi, .zip, .dmg, .pkg, .deb, .rpm (max 250MB)
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-white/60">
                <span>{fileName ?? "No file selected"}</span>
                <div className="flex items-center gap-2 text-emerald-400">
                  <FileUp className="size-4" />
                  <span>Attach file</span>
                </div>
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".exe,.msi,.zip,.dmg,.pkg,.deb,.rpm"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={isSubmitting || (!query.trim() && !fileName)}
                className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-zinc-950 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 size-5 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Start assessment"
                )}
              </button>
              <p className="text-sm text-white/60">
                Average processing time: 2 minutes • 15+ sources cited
              </p>
            </div>
          </form>
        </section>
      </div>

      {/* Research Stream Modal */}
      <ResearchStreamModal
        isOpen={showStreamModal}
        onClose={() => setShowStreamModal(false)}
        entityName={streamingEntityName}
        onComplete={handleStreamComplete}
      />
    </div>
  );
}
