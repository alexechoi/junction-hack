"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Search,
  FileSearch,
  Link as LinkIcon,
  AlertTriangle,
  Award,
  Globe,
} from "lucide-react";

interface StreamEvent {
  event: string;
  data: unknown;
  id: string;
  timestamp: number;
}

interface ResearchPhase {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "complete";
  icon: React.ReactNode;
  timestamp?: number;
  details?: string[];
}

interface ResearchStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityName: string;
  onComplete?: () => void;
}

export default function ResearchStreamModal({
  isOpen,
  onClose,
  entityName,
  onComplete,
}: ResearchStreamModalProps) {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [researchBrief, setResearchBrief] = useState<string>("");
  const [phases, setPhases] = useState<ResearchPhase[]>([]);
  const [findings, setFindings] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [trustScore, setTrustScore] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    eventsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const parseEventData = (data: any) => {
    // Extract research brief
    if (data.write_research_brief?.research_brief) {
      setResearchBrief(data.write_research_brief.research_brief);
      updatePhaseStatus("research-synthesis", "complete");
    }

    // Detect different research phases from node names
    const nodeKey = Object.keys(data)[0];

    if (nodeKey?.includes("entity") || nodeKey?.includes("identify")) {
      updatePhaseStatus("entity-identification", "active");
    }

    if (nodeKey?.includes("security") || nodeKey?.includes("vuln") || nodeKey?.includes("cve")) {
      updatePhaseStatus("entity-identification", "complete");
      updatePhaseStatus("security-analysis", "active");

      // Extract CVE findings
      const content = JSON.stringify(data);
      const cveMatches = content.match(/CVE-\d{4}-\d+/g);
      if (cveMatches) {
        cveMatches.forEach(cve => {
          setFindings(prev => {
            if (!prev.includes(`Vulnerability detected: ${cve}`)) {
              return [...prev, `Vulnerability detected: ${cve}`];
            }
            return prev;
          });
        });
      }
    }

    if (nodeKey?.includes("compliance") || nodeKey?.includes("cert")) {
      updatePhaseStatus("security-analysis", "complete");
      updatePhaseStatus("compliance-check", "active");
    }

    if (nodeKey?.includes("source") || nodeKey?.includes("search") || nodeKey?.includes("web")) {
      updatePhaseStatus("compliance-check", "complete");
      updatePhaseStatus("source-gathering", "active");

      // Extract sources
      const urls = extractUrls(JSON.stringify(data));
      urls.forEach(url => {
        setSources(prev => {
          if (!prev.includes(url) && prev.length < 10) {
            return [...prev, url];
          }
          return prev;
        });
      });
    }

    if (nodeKey?.includes("write") || nodeKey?.includes("brief")) {
      updatePhaseStatus("source-gathering", "complete");
      updatePhaseStatus("research-synthesis", "active");
    }

    // Extract trust score if present
    const dataStr = JSON.stringify(data);
    const scoreMatch = dataStr.match(/trust[_\s]?score["\s:]+(\d+)/i);
    if (scoreMatch) {
      setTrustScore(parseInt(scoreMatch[1]));
    }
  };

  const updatePhaseStatus = (phaseId: string, status: "pending" | "active" | "complete") => {
    setPhases(prev => prev.map(phase =>
      phase.id === phaseId
        ? { ...phase, status, timestamp: status !== "pending" ? Date.now() : phase.timestamp }
        : phase
    ));
  };

  const extractUrls = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s,"}\]]+)/g;
    const matches = text.match(urlRegex) || [];
    return [...new Set(matches)].slice(0, 10);
  };

  useEffect(() => {
    scrollToBottom();
  }, [phases, findings]);

  // Initialize phases on open
  useEffect(() => {
    if (isOpen) {
      setPhases([
        {
          id: "entity-identification",
          title: "Entity Identification",
          description: "Identifying and validating the entity",
          status: "pending",
          icon: <Search className="size-5" />,
        },
        {
          id: "security-analysis",
          title: "Security Analysis",
          description: "Analyzing vulnerabilities and CVEs",
          status: "pending",
          icon: <Shield className="size-5" />,
        },
        {
          id: "compliance-check",
          title: "Compliance Verification",
          description: "Checking certifications and compliance",
          status: "pending",
          icon: <Award className="size-5" />,
        },
        {
          id: "source-gathering",
          title: "Source Collection",
          description: "Gathering intelligence from multiple sources",
          status: "pending",
          icon: <Globe className="size-5" />,
        },
        {
          id: "research-synthesis",
          title: "Research Synthesis",
          description: "Generating comprehensive security brief",
          status: "pending",
          icon: <FileSearch className="size-5" />,
        },
      ]);
      setFindings([]);
      setSources([]);
      setTrustScore(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      startStreaming();
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isOpen]);

  const startStreaming = async () => {
    setIsStreaming(true);
    setError(null);
    setEvents([]);

    abortControllerRef.current = new AbortController();
    const langgraphUrl = process.env.NEXT_PUBLIC_DEEP_SECURITY_API_URL;

    if (!langgraphUrl) {
      setError("Deep security API URL not configured");
      setIsStreaming(false);
      return;
    }

    try {
      const response = await fetch(`${langgraphUrl}/runs/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assistant_id: "Deep Researcher",
          input: {
            messages: [
              {
                role: "user",
                content: `Research the security and safety of: ${entityName}`,
              },
            ],
          },
          stream_mode: ["updates", "messages", "custom"],
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Research failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "" || line.startsWith(": heartbeat")) {
            continue;
          }

          if (line.startsWith("event:")) {
            const eventType = line.substring(6).trim();
            continue;
          }

          if (line.startsWith("data:")) {
            try {
              const jsonData = line.substring(5).trim();
              const data = JSON.parse(jsonData);

              const event: StreamEvent = {
                event: "update",
                data,
                id: Date.now().toString(),
                timestamp: Date.now(),
              };

              setEvents((prev) => [...prev, event]);

              // Parse event data to update UI
              parseEventData(data);
            } catch (e) {
              console.error("Failed to parse event:", e);
            }
          }
        }
      }

      setIsStreaming(false);
      onComplete?.();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Stream aborted");
      } else {
        console.error("Stream error:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
      }
      setIsStreaming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative h-screen w-screen overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />
        </div>

        {/* Header */}
        <div className="relative z-10 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 shadow-lg shadow-emerald-500/20">
                {isStreaming ? (
                  <Loader2 className="size-6 animate-spin text-white" />
                ) : error ? (
                  <AlertCircle className="size-6 text-white" />
                ) : (
                  <CheckCircle2 className="size-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Deep Security Research
                </h2>
                <p className="text-sm text-white/60">
                  Analyzing:{" "}
                  <span className="text-emerald-400">{entityName}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex size-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-white/30 hover:bg-white/5 hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Status bar */}
          <div className="px-8 pb-4">
            <div className="flex items-center gap-3 text-sm">
              <div
                className={`flex items-center gap-2 rounded-full px-3 py-1 ${
                  isStreaming
                    ? "bg-emerald-500/20 text-emerald-400"
                    : error
                      ? "bg-red-500/20 text-red-400"
                      : "bg-blue-500/20 text-blue-400"
                }`}
              >
                <div
                  className={`size-2 rounded-full ${
                    isStreaming
                      ? "animate-pulse bg-emerald-400"
                      : error
                        ? "bg-red-400"
                        : "bg-blue-400"
                  }`}
                />
                {isStreaming ? "Streaming..." : error ? "Error" : "Complete"}
              </div>
              <span className="text-white/60">
                {events.length} events received
              </span>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="relative z-10 h-[calc(100vh-180px)] overflow-y-auto p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Trust Score Card */}
            {trustScore !== null && (
              <div className="animate-in slide-in-from-top fade-in duration-700 rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-white/60">
                      Security Trust Score
                    </p>
                    <div className="mt-2 flex items-baseline gap-3">
                      <span className="text-6xl font-bold text-white">
                        {trustScore}
                      </span>
                      <span className="text-2xl text-white/40">/100</span>
                    </div>
                  </div>
                  <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-blue-400 shadow-2xl shadow-emerald-500/20">
                    <Shield className="size-12 text-white" />
                  </div>
                </div>
                <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-400 transition-all duration-1000 ease-out"
                    style={{ width: `${trustScore}%` }}
                  />
                </div>
              </div>
            )}

            {/* Research Phases */}
            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8 backdrop-blur-xl">
              <h3 className="mb-6 text-xl font-semibold text-white">
                Research Progress
              </h3>
              <div className="space-y-4">
                {phases.map((phase, index) => (
                  <div
                    key={phase.id}
                    className="animate-in slide-in-from-left fade-in duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-transparent p-5 transition-all hover:border-white/20">
                      {/* Active phase animated background */}
                      {phase.status === "active" && (
                        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-emerald-500/10 to-blue-500/10" />
                      )}

                      <div className="relative flex items-center gap-4">
                        {/* Icon */}
                        <div
                          className={`flex size-12 items-center justify-center rounded-xl transition-all duration-500 ${
                            phase.status === "complete"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : phase.status === "active"
                                ? "animate-pulse bg-blue-500/20 text-blue-400"
                                : "bg-white/5 text-white/40"
                          }`}
                        >
                          {phase.status === "complete" ? (
                            <CheckCircle2 className="size-6" />
                          ) : phase.status === "active" ? (
                            <Loader2 className="size-6 animate-spin" />
                          ) : (
                            phase.icon
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-white">
                              {phase.title}
                            </h4>
                            {phase.status === "active" && (
                              <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400">
                                In Progress
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-white/60">
                            {phase.description}
                          </p>
                        </div>

                        {/* Status indicator */}
                        <div className="flex items-center">
                          {phase.status === "complete" && (
                            <div className="flex size-3 items-center justify-center">
                              <div className="size-3 animate-ping rounded-full bg-emerald-400 opacity-75" />
                              <div className="absolute size-3 rounded-full bg-emerald-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Findings */}
            {findings.length > 0 && (
              <div className="animate-in slide-in-from-bottom fade-in duration-700 rounded-3xl border border-white/10 bg-zinc-900/60 p-8 backdrop-blur-xl">
                <div className="mb-6 flex items-center gap-3">
                  <AlertTriangle className="size-6 text-yellow-400" />
                  <h3 className="text-xl font-semibold text-white">
                    Key Findings
                  </h3>
                  <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
                    {findings.length} detected
                  </span>
                </div>
                <div className="space-y-3">
                  {findings.map((finding, index) => (
                    <div
                      key={index}
                      className="animate-in slide-in-from-right fade-in duration-500 flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-yellow-500/20">
                        <div className="size-2 rounded-full bg-yellow-400" />
                      </div>
                      <p className="text-sm text-white/80">{finding}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sources */}
            {sources.length > 0 && (
              <div className="animate-in slide-in-from-bottom fade-in duration-700 rounded-3xl border border-white/10 bg-zinc-900/60 p-8 backdrop-blur-xl">
                <div className="mb-6 flex items-center gap-3">
                  <LinkIcon className="size-6 text-blue-400" />
                  <h3 className="text-xl font-semibold text-white">
                    Intelligence Sources
                  </h3>
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400">
                    {sources.length} sources
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {sources.map((source, index) => (
                    <a
                      key={index}
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="animate-in slide-in-from-left fade-in duration-500 group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-blue-400/50 hover:bg-blue-500/10"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Globe className="size-5 shrink-0 text-blue-400" />
                      <span className="truncate text-sm text-white/70 group-hover:text-white">
                        {new URL(source).hostname}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Research Brief */}
            {researchBrief && (
              <div className="animate-in slide-in-from-bottom fade-in duration-700 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 backdrop-blur-xl">
                <div className="mb-6 flex items-center gap-3">
                  <FileSearch className="size-6 text-emerald-400" />
                  <h3 className="text-xl font-semibold text-white">
                    Security Research Brief
                  </h3>
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="whitespace-pre-wrap rounded-2xl border border-white/5 bg-black/20 p-6 text-base leading-relaxed text-white/80">
                    {researchBrief}
                  </div>
                </div>
              </div>
            )}

            {/* Loading state */}
            {!error && phases.every(p => p.status === "pending") && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="size-20 animate-spin rounded-full border-4 border-white/10 border-t-emerald-400" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="size-8 text-emerald-400" />
                  </div>
                </div>
                <p className="mt-6 text-lg text-white/60">
                  Initializing deep security research...
                </p>
                <p className="mt-2 text-sm text-white/40">
                  This may take a few moments
                </p>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="animate-in fade-in zoom-in duration-500 rounded-3xl border border-red-500/20 bg-red-500/10 p-8 backdrop-blur-xl">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-red-500/20">
                    <AlertCircle className="size-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-400">
                      Research Error
                    </h3>
                    <p className="mt-2 text-sm text-red-300/80">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div ref={eventsEndRef} />
          </div>
        </div>

        {/* Animated particles effect */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute size-1 animate-pulse rounded-full bg-emerald-400/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
