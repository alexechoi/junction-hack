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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(), // Start with all sections collapsed
  );
  const abortControllerRef = useRef<AbortController | null>(null);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const parseBriefIntoSections = (brief: string) => {
    // Split by common markdown headers or double line breaks
    const sections: { title: string; content: string; id: string }[] = [];

    // Try to split by headers first
    const headerRegex = /^#{1,3}\s+(.+)$/gm;
    const parts = brief.split(headerRegex);

    if (parts.length > 1) {
      // Has headers
      for (let i = 1; i < parts.length; i += 2) {
        const title = parts[i].trim();
        const content = parts[i + 1]?.trim() || "";
        sections.push({
          title,
          content,
          id: title.toLowerCase().replace(/\s+/g, "-"),
        });
      }

      // Add intro if exists
      if (parts[0]?.trim()) {
        sections.unshift({
          title: "Summary",
          content: parts[0].trim(),
          id: "summary",
        });
      }
    } else {
      // No headers, split by paragraphs and group
      const paragraphs = brief.split(/\n\n+/);

      if (paragraphs.length > 3) {
        sections.push({
          title: "Summary",
          content: paragraphs.slice(0, 2).join("\n\n"),
          id: "summary",
        });
        sections.push({
          title: "Detailed Analysis",
          content: paragraphs.slice(2).join("\n\n"),
          id: "details",
        });
      } else {
        sections.push({
          title: "Research Brief",
          content: brief,
          id: "summary",
        });
      }
    }

    return sections;
  };

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

    if (
      nodeKey?.includes("security") ||
      nodeKey?.includes("vuln") ||
      nodeKey?.includes("cve")
    ) {
      updatePhaseStatus("entity-identification", "complete");
      updatePhaseStatus("security-analysis", "active");

      // Extract CVE findings
      const content = JSON.stringify(data);
      const cveMatches = content.match(/CVE-\d{4}-\d+/g);
      if (cveMatches) {
        cveMatches.forEach((cve) => {
          setFindings((prev) => {
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

    if (
      nodeKey?.includes("source") ||
      nodeKey?.includes("search") ||
      nodeKey?.includes("web")
    ) {
      updatePhaseStatus("compliance-check", "complete");
      updatePhaseStatus("source-gathering", "active");

      // Extract sources
      const urls = extractUrls(JSON.stringify(data));
      urls.forEach((url) => {
        setSources((prev) => {
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

  const updatePhaseStatus = (
    phaseId: string,
    status: "pending" | "active" | "complete",
  ) => {
    setPhases((prev) =>
      prev.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              status,
              timestamp: status !== "pending" ? Date.now() : phase.timestamp,
            }
          : phase,
      ),
    );
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
                content: `${entityName}`,
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

        {/* Main content area - Split Screen */}
        <div className="relative z-10 flex h-[calc(100vh-180px)] gap-6 p-8">
          {/* Left Panel - Research Progress & Findings */}
          <div className="flex w-1/2 flex-col gap-6 overflow-y-auto">
            {/* Trust Score Card */}
            {trustScore !== null && (
              <div className="animate-in slide-in-from-left fade-in duration-700 shrink-0 rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/60">
                      Security Trust Score
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-white">
                        {trustScore}
                      </span>
                      <span className="text-xl text-white/40">/100</span>
                    </div>
                  </div>
                  <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-blue-400 shadow-2xl shadow-emerald-500/20">
                    <Shield className="size-10 text-white" />
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-400 transition-all duration-1000 ease-out"
                    style={{ width: `${trustScore}%` }}
                  />
                </div>
              </div>
            )}

            {/* Research Phases */}
            <div className="shrink-0 rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Research Progress
              </h3>
              <div className="space-y-3">
                {phases.map((phase, index) => (
                  <div
                    key={phase.id}
                    className="animate-in slide-in-from-left fade-in duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-transparent p-4 transition-all hover:border-white/20">
                      {/* Active phase animated background */}
                      {phase.status === "active" && (
                        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-emerald-500/10 to-blue-500/10" />
                      )}

                      <div className="relative flex items-center gap-3">
                        {/* Icon */}
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-lg transition-all duration-500 ${
                            phase.status === "complete"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : phase.status === "active"
                                ? "animate-pulse bg-blue-500/20 text-blue-400"
                                : "bg-white/5 text-white/40"
                          }`}
                        >
                          {phase.status === "complete" ? (
                            <CheckCircle2 className="size-5" />
                          ) : phase.status === "active" ? (
                            <Loader2 className="size-5 animate-spin" />
                          ) : (
                            phase.icon
                          )}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="truncate font-medium text-white text-sm">
                              {phase.title}
                            </h4>
                            {phase.status === "active" && (
                              <span className="shrink-0 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-white/60">
                            {phase.description}
                          </p>
                        </div>

                        {/* Status indicator */}
                        <div className="flex shrink-0 items-center">
                          {phase.status === "complete" && (
                            <div className="relative flex size-3 items-center justify-center">
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
              <div className="animate-in slide-in-from-bottom fade-in duration-700 shrink-0 rounded-3xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-2">
                  <AlertTriangle className="size-5 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Key Findings
                  </h3>
                  <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-400">
                    {findings.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {findings.map((finding, index) => (
                    <div
                      key={index}
                      className="animate-in slide-in-from-right fade-in duration-500 flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="mt-1 flex size-4 shrink-0 items-center justify-center rounded-full bg-yellow-500/20">
                        <div className="size-1.5 rounded-full bg-yellow-400" />
                      </div>
                      <p className="text-sm text-white/80">{finding}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading state - Left Panel */}
            {!error && phases.every((p) => p.status === "pending") && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="size-16 animate-spin rounded-full border-4 border-white/10 border-t-emerald-400" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="size-6 text-emerald-400" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-white/60">
                  Initializing research...
                </p>
              </div>
            )}

            {/* Error state - Left Panel */}
            {error && (
              <div className="animate-in fade-in zoom-in duration-500 rounded-3xl border border-red-500/20 bg-red-500/10 p-6 backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/20">
                    <AlertCircle className="size-5 text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-red-400">
                      Research Error
                    </h3>
                    <p className="mt-1 text-sm text-red-300/80">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Research Brief & Sources */}
          <div className="flex w-1/2 flex-col gap-6">
            {/* Research Brief */}
            {researchBrief ? (
              <div className="animate-in slide-in-from-right fade-in duration-700 flex flex-1 flex-col rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl">
                <div className="shrink-0 border-b border-white/10 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FileSearch className="size-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Security Research Brief
                    </h3>
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                  <div className="space-y-3">
                    {parseBriefIntoSections(researchBrief).map(
                      (section, index) => (
                        <div
                          key={section.id}
                          className="animate-in slide-in-from-bottom fade-in duration-500 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-white/20"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:bg-white/5"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-all ${
                                  expandedSections.has(section.id)
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-white/10 text-white/60"
                                }`}
                              >
                                {index === 0 ? (
                                  <FileSearch className="size-4" />
                                ) : (
                                  <div className="flex size-2 rounded-full bg-current" />
                                )}
                              </div>
                              <h4 className="font-semibold text-white text-sm">
                                {section.title}
                              </h4>
                            </div>
                            <div
                              className={`shrink-0 transition-transform duration-300 ${
                                expandedSections.has(section.id)
                                  ? "rotate-180"
                                  : ""
                              }`}
                            >
                              <svg
                                className="size-5 text-white/60"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </button>

                          {expandedSections.has(section.id) && (
                            <div className="animate-in slide-in-from-top fade-in duration-300 border-t border-white/10 p-4">
                              <div className="space-y-3">
                                {section.content
                                  .split("\n\n")
                                  .map((paragraph, pIndex) => {
                                    // Check if it's a list item
                                    if (paragraph.trim().match(/^[-*•]\s/)) {
                                      const items = paragraph
                                        .split("\n")
                                        .filter((line) => line.trim());
                                      return (
                                        <ul key={pIndex} className="space-y-2">
                                          {items.map((item, iIndex) => (
                                            <li
                                              key={iIndex}
                                              className="flex items-start gap-2 text-sm leading-relaxed text-white/80"
                                            >
                                              <span className="mt-2 flex size-1.5 shrink-0 rounded-full bg-emerald-400" />
                                              <span>
                                                {item
                                                  .replace(/^[-*•]\s/, "")
                                                  .trim()}
                                              </span>
                                            </li>
                                          ))}
                                        </ul>
                                      );
                                    }

                                    // Check if it's a numbered list
                                    if (paragraph.trim().match(/^\d+\.\s/)) {
                                      const items = paragraph
                                        .split("\n")
                                        .filter((line) => line.trim());
                                      return (
                                        <ol key={pIndex} className="space-y-2">
                                          {items.map((item, iIndex) => (
                                            <li
                                              key={iIndex}
                                              className="flex items-start gap-2 text-sm leading-relaxed text-white/80"
                                            >
                                              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-400">
                                                {iIndex + 1}
                                              </span>
                                              <span>
                                                {item
                                                  .replace(/^\d+\.\s/, "")
                                                  .trim()}
                                              </span>
                                            </li>
                                          ))}
                                        </ol>
                                      );
                                    }

                                    // Regular paragraph
                                    return (
                                      <p
                                        key={pIndex}
                                        className="text-sm leading-relaxed text-white/80"
                                      >
                                        {paragraph}
                                      </p>
                                    );
                                  })}
                              </div>
                            </div>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-3xl border border-white/10 border-dashed bg-white/5 backdrop-blur-xl">
                <div className="text-center">
                  <FileSearch className="mx-auto size-12 text-white/20" />
                  <p className="mt-4 text-sm text-white/40">
                    Research brief will appear here
                  </p>
                </div>
              </div>
            )}

            {/* Intelligence Sources */}
            <div className="flex max-h-80 min-h-0 flex-col rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl">
              <div className="shrink-0 border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-2">
                  <LinkIcon className="size-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Intelligence Sources
                  </h3>
                  {sources.length > 0 && (
                    <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
                      {sources.length}
                    </span>
                  )}
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {sources.length > 0 ? (
                  <div className="space-y-2">
                    {sources.map((source, index) => (
                      <a
                        key={index}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="animate-in slide-in-from-bottom fade-in duration-500 group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3 transition-all hover:border-blue-400/50 hover:bg-blue-500/10"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <Globe className="size-4 shrink-0 text-blue-400" />
                        <span className="min-w-0 truncate text-sm text-white/70 group-hover:text-white">
                          {new URL(source).hostname}
                        </span>
                      </a>
                    ))}
                  </div>
                ) : isStreaming ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="relative mx-auto mb-3">
                        <div className="size-10 animate-spin rounded-full border-2 border-white/10 border-t-blue-400" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Globe className="size-4 text-blue-400" />
                        </div>
                      </div>
                      <p className="text-xs text-white/40">
                        Gathering intelligence sources...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-xs text-white/40">
                      No sources available yet
                    </p>
                  </div>
                )}
              </div>
            </div>

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
