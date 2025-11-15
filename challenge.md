# Hack Challenge: Reputation Recon: AI-Powered Software Trust Assessment by WithSecure

## The Challenge

Build an AI assessor that turns an application name or URL into a CISO-ready trust brief with sources in minutes.

Security teams and CISOs (Chief Information Security Officer) are constantly asked to approve new tools they've never seen before. They need accurate, concise, and source-grounded snapshots of a product's security posture, fast. This challenge asks participants to build a GenAI-powered assessor that fetches reliable signals from the web and synthesizes them into a decision-ready brief. Help us move security from reactive firefighting to proactive enablement.

**Note:** Teams may optionally evaluate emerging integration frameworks (e.g., MCP services) as targets of assessment, but MCP is not required.

Given minimal input (product name, vendor, or URL), build a system that:

- Resolves the entity and vendor identity
- Classifies the software into a clear taxonomy (e.g., File sharing, GenAI tool, SaaS CRM, Endpoint agent)
- Produces a concise security posture summary with citations
- Covers:
  - Description
  - Usage
  - Vendor reputation
  - CVE trend summaries (Common Vulnerabilities and Exposures)
  - Incidents/abuse signals
  - Data handling/compliance
  - Deployment/admin controls
  - Transparent 0–100 trust/risk score with rationale and confidence
- Suggests 1–2 safer alternatives with short rationale

Deliverables can be a CLI (Command Line Interface), service, or bonus web UI with compare-view. A lightweight local cache with timestamps and reproducibility is required.

## Insight

Focus on high-signal sources:

- Vendor security/PSIRT pages (Product Security Incident Response Team)
- Terms of Service/Data Processing Agreement
- SOC 2 (System and Organization Controls Type II)
- ISO attestations
- Reputable advisories/CERTs (Notices from Computer Emergency Response Teams or vendors)
- CISA KEV (CISA Known Exploited Vulnerabilities catalog)

Guard against hallucinations by labeling vendor-stated vs. independent claims. When data is scarce, return "Insufficient public evidence."

## Resources

WithSecure will provide:

- Pre-prepared list of applications (names, optional binary hashes)
- Guidance on source prioritization and claim–evidence mapping
- Public references: CVE/CVSS (Common Vulnerability Scoring System) databases, CISA KEV, vendor security pages, disclosure/bug bounty sites
- Example prompts for entity resolution and categorization
- Mentors on-site during the weekend (technical + domain expertise)

**Bonus theme:** assessing MCP-style integrations.

**Required:** lightweight local cache (JSON/SQLite), snapshot mode, deterministic parameters.

**Example data:** [Here]

## Company Info

### WithSecure

At WithSecure™, we believe cyber security should empower, not overwhelm. That's why our Elements Cloud blends AI, expertise, and co-security to deliver results that matter. We've got your back — and we'll make it easy.

At Junction 2025, we bring cutting-edge cyber expertise straight to the builders shaping tomorrow.

**Website:** https://www.withsecure.com

## Judging Criteria

- Alternatives & quick compare (6%)
- Security posture synthesis (12%)
- Evidence & citation quality (24%)
- Technical execution & resilience (15%)
- Problem fit & clarity (15%)
- Entity resolution & categorization (20%)
- Trust/risk score transparency (8%)
