"""Graph state definitions and data structures for the Deep Research agent."""

import operator
from typing import Annotated, Optional, List, Literal

from langchain_core.messages import MessageLikeRepresentation
from langgraph.graph import MessagesState
from pydantic import BaseModel, Field
from typing_extensions import TypedDict


###################
# Structured Outputs
###################
class ConductResearch(BaseModel):
    """Call this tool to conduct research on a specific topic."""
    research_topic: str = Field(
        description="The topic to research. Should be a single topic, and should be described in high detail (at least a paragraph).",
    )

class ResearchComplete(BaseModel):
    """Call this tool to indicate that the research is complete."""

class Summary(BaseModel):
    """Research summary with key findings."""

    summary: str
    key_excerpts: str

class ClarifyWithUser(BaseModel):
    """Model for user clarification requests."""

    need_clarification: bool = Field(
        description="Whether the user needs to be asked a clarifying question.",
    )
    question: str = Field(
        description="A question to ask the user to clarify the report scope",
    )
    verification: str = Field(
        description="Verify message that we will start research after the user has provided the necessary information.",
    )

class ResearchQuestion(BaseModel):
    """Research question and brief for guiding research."""

    research_brief: str = Field(
        description="A research question that will be used to guide the research.",
    )

###################
# Security Assessment Structured Outputs
###################
class SourceAttribution(BaseModel):
    """Source citation with attribution."""
    type: Literal["vendor", "independent"] = Field(
        description="Whether source is vendor-stated or independent verification"
    )
    source: str = Field(description="Name/title of the source")
    url: str = Field(description="URL to the source")
    date: str = Field(description="Date accessed or published (YYYY-MM-DD)")
    relevance: str = Field(description="What this source was used to verify")

class KeyStrength(BaseModel):
    """Security strength finding with source."""
    title: str = Field(description="Brief title of the strength")
    description: str = Field(description="Detailed description")
    source_type: Literal["vendor", "independent"]
    source_url: str = Field(description="URL reference for this claim")

class Consideration(BaseModel):
    """Security consideration or risk."""
    title: str = Field(description="Brief title of the consideration")
    description: str = Field(description="Detailed description")
    severity: Literal["low", "medium", "high", "critical"]

class ComplianceCertification(BaseModel):
    """Compliance certification details."""
    cert: str = Field(description="Certification name (e.g., 'SOC 2 Type II')")
    issued: str = Field(description="Issue date (YYYY-MM-DD)")
    expires: str = Field(description="Expiration date or 'Ongoing'")
    scope: str = Field(description="Scope of certification")
    auditor: str = Field(description="Auditing organization")
    source_url: str = Field(description="URL to certificate or attestation")

class CVERecord(BaseModel):
    """CVE vulnerability record."""
    id: str = Field(description="CVE identifier (e.g., 'CVE-2024-1234')")
    severity: Literal["low", "medium", "high", "critical"]
    cvss: str = Field(description="CVSS score (e.g., '7.5')")
    title: str = Field(description="Vulnerability title/description")
    published: str = Field(description="Publication date (YYYY-MM-DD)")
    patched: Optional[str] = Field(description="Patch date if available (YYYY-MM-DD)")
    kev: bool = Field(description="Whether listed in CISA KEV catalog")

class TrustScore(BaseModel):
    """Trust score with transparent rationale."""
    score: int = Field(
        ge=0,
        le=100,
        description="Trust score from 0-100"
    )
    confidence: Literal["low", "medium", "high"] = Field(
        description="Confidence level based on source quantity and quality"
    )
    source_count: int = Field(description="Number of sources used in assessment")
    rationale: str = Field(
        description="Detailed explanation of how the score was calculated, including factors that increased/decreased the score"
    )

class Alternative(BaseModel):
    """Alternative product recommendation."""
    name: str = Field(description="Product name")
    score: int = Field(ge=0, le=100, description="Trust score of alternative")
    icon: str = Field(description="Emoji or icon representation")
    reason: str = Field(description="Why this is recommended as alternative")
    pros: List[str] = Field(description="Key advantages")
    cons: List[str] = Field(description="Trade-offs or disadvantages")

class VendorInfo(BaseModel):
    """Vendor reputation details."""
    company: str = Field(description="Parent company or ownership structure")
    market_presence: str = Field(description="Market position, customer base, establishment date")
    transparency: str = Field(description="Quality of public security documentation")
    psirt_presence: str = Field(description="Product Security Incident Response Team availability")

class EncryptionDetails(BaseModel):
    """Encryption standards and practices."""
    in_transit: str = Field(description="Encryption for data in transit (e.g., 'TLS 1.3')")
    at_rest: str = Field(description="Encryption for data at rest (e.g., 'AES-256')")
    key_management: str = Field(description="Key management options (e.g., 'EKM available')")
    backups: str = Field(description="Backup encryption details")

class DataResidency(BaseModel):
    """Data location and retention details."""
    primary_storage: str = Field(description="Primary data storage location")
    eu_residency: str = Field(description="EU data residency options")
    retention: str = Field(description="Data retention policies")
    portability: str = Field(description="Data export and portability options")

class AccessControl(BaseModel):
    """Access control feature."""
    feature: str = Field(description="Feature name (e.g., 'SSO/SAML')")
    plan: str = Field(description="Plan availability (e.g., 'Business+', 'All plans')")

class AdminControl(BaseModel):
    """Admin control feature."""
    feature: str = Field(description="Feature name (e.g., 'Audit logs')")
    plan: str = Field(description="Plan availability (e.g., 'Enterprise Grid')")

class SecurityAssessmentReport(BaseModel):
    """Complete CISO-ready security assessment report.

    This structured output is designed for WithSecure's Hack Challenge:
    'Reputation Recon: AI-Powered Software Trust Assessment'
    """

    # === ENTITY IDENTIFICATION ===
    company_name: str = Field(description="Official company/vendor name")
    product_name: str = Field(description="Product or service name")
    vendor: str = Field(description="Parent company or vendor entity")
    url: str = Field(description="Primary official website URL")
    taxonomy: List[str] = Field(
        description="Software classification (e.g., 'SaaS Collaboration Platform', 'File Sharing')"
    )

    # === TRUST ASSESSMENT ===
    trust_score: TrustScore = Field(
        description="Comprehensive trust score with transparent rationale"
    )
    executive_summary: str = Field(
        description="2-3 paragraph executive summary for CISO review"
    )

    # === SECURITY POSTURE ===
    strengths: List[KeyStrength] = Field(
        description="Key security strengths with source attribution"
    )
    considerations: List[Consideration] = Field(
        description="Security considerations, risks, or areas of concern"
    )

    # === COMPLIANCE & CERTIFICATIONS ===
    compliance: List[ComplianceCertification] = Field(
        description="Active compliance certifications (SOC 2, ISO 27001, etc.)"
    )

    # === VULNERABILITY DATA ===
    cves: List[CVERecord] = Field(
        description="Recent CVEs from past 12-24 months"
    )
    vulnerability_trend: str = Field(
        description="Trend analysis (e.g., '-23% vs previous year', 'Increasing')"
    )
    avg_patch_time: str = Field(
        description="Average time to patch vulnerabilities (e.g., '4.2d', '2 weeks')"
    )

    # === VENDOR REPUTATION ===
    vendor_info: VendorInfo = Field(
        description="Vendor reputation details including company ownership, market presence, transparency, and PSIRT"
    )

    # === DATA HANDLING ===
    encryption: EncryptionDetails = Field(
        description="Encryption standards for data in transit, at rest, key management, and backups"
    )
    data_residency: DataResidency = Field(
        description="Data location, EU residency options, retention policies, and portability"
    )
    privacy_compliance: List[str] = Field(
        description="Privacy frameworks: GDPR, CCPA, HIPAA, etc."
    )

    # === DEPLOYMENT & ADMIN CONTROLS ===
    access_controls: List[AccessControl] = Field(
        description="List of access control features with plan availability"
    )
    admin_controls: List[AdminControl] = Field(
        description="List of admin control features with plan availability"
    )
    deployment_recommendations: str = Field(
        description="Specific recommendations for enterprise deployment"
    )

    # === ALTERNATIVES ===
    alternatives: List[Alternative] = Field(
        description="1-2 recommended alternatives with higher trust scores or better security posture"
    )

    # === SOURCES (CRITICAL FOR JUDGING) ===
    sources: List[SourceAttribution] = Field(
        description="Complete list of all sources used in the assessment, with clear vendor vs independent attribution. This is critical for the 24% 'Evidence & citation quality' judging criteria."
    )

    # === METADATA ===
    generated_at: str = Field(description="Report generation timestamp (ISO 8601)")
    assessment_id: str = Field(description="Unique identifier for this assessment")
    insufficient_data_areas: Optional[List[str]] = Field(
        default=None,
        description="Areas where insufficient public evidence was found"
    )


###################
# State Definitions
###################

def override_reducer(current_value, new_value):
    """Reducer function that allows overriding values in state."""
    if isinstance(new_value, dict) and new_value.get("type") == "override":
        return new_value.get("value", new_value)
    else:
        return operator.add(current_value, new_value)

class AgentInputState(MessagesState):
    """InputState is only 'messages'."""

class AgentState(MessagesState):
    """Main agent state containing messages and research data."""

    supervisor_messages: Annotated[list[MessageLikeRepresentation], override_reducer]
    research_brief: Optional[str]
    raw_notes: Annotated[list[str], override_reducer] = []
    notes: Annotated[list[str], override_reducer] = []
    final_report: str  # JSON string
    structured_report: Optional[dict] = None  # Parsed structured report for easy access

class SupervisorState(TypedDict):
    """State for the supervisor that manages research tasks."""

    supervisor_messages: Annotated[list[MessageLikeRepresentation], override_reducer]
    research_brief: str
    notes: Annotated[list[str], override_reducer] = []
    research_iterations: int = 0
    raw_notes: Annotated[list[str], override_reducer] = []

class ResearcherState(TypedDict):
    """State for individual researchers conducting research."""

    researcher_messages: Annotated[list[MessageLikeRepresentation], operator.add]
    tool_call_iterations: int = 0
    research_topic: str
    compressed_research: str
    raw_notes: Annotated[list[str], override_reducer] = []

class ResearcherOutputState(BaseModel):
    """Output state from individual researchers."""

    compressed_research: str
    raw_notes: Annotated[list[str], override_reducer] = []
