export type LanguageCode =
  | "en"
  | "fr"
  | "es"
  | "ar"
  | "uk"
  | "so"
  | "tl"
  | "zh";

export type ParticipantRole =
  | "consultant"
  | "client"
  | "interpreter"
  | "observer";

export type SessionStatus =
  | "scheduled"
  | "live"
  | "processing"
  | "completed";

export type TranscriptItemType = "speech" | "system" | "action";

export type MetricTone = "neutral" | "positive" | "warning" | "critical";

export type RiskSeverity = "low" | "medium" | "high";

export type SummaryStatus = "draft" | "ready" | "shared";

export type DocumentStatus =
  | "queued"
  | "extracting"
  | "translating"
  | "ready"
  | "error";

export type DocumentType = "uploaded" | "translated" | "generated";

export type DeliverableStatus = "draft" | "processing" | "ready";

export type DeliverableKind = "summary" | "document" | "packet";

export interface Participant {
  id: string;
  name: string;
  role: ParticipantRole;
  language: LanguageCode;
  avatar?: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
  isPinned?: boolean;
  isSpeaking?: boolean;
}

export interface Session {
  id: string;
  title: string;
  orgName: string;
  status: SessionStatus;
  startedAt?: string;
  scheduledFor?: string;
  durationMinutes: number;
  sourceLanguage: LanguageCode;
  targetLanguages: LanguageCode[];
  participants: Participant[];
  agenda: string[];
  consultantOwner: string;
  locationLabel?: string;
  nextActionLabel?: string;
}

export interface TranscriptItem {
  id: string;
  sessionId: string;
  timestamp: string;
  speakerId: string;
  speakerName: string;
  originalText: string;
  translatedText?: string;
  sourceLanguage: LanguageCode;
  targetLanguage?: LanguageCode;
  confidence: number;
  type: TranscriptItemType;
}

export interface InsightMetric {
  id: string;
  label: string;
  value: string;
  change?: string;
  tone?: MetricTone;
}

export interface InsightRisk {
  id: string;
  title: string;
  severity: RiskSeverity;
  description: string;
  mitigation: string;
  owner?: string;
}

export interface InsightQuestion {
  id: string;
  question: string;
  priority: "low" | "medium" | "high";
  context?: string;
}

export interface ProjectionPoint {
  label: string;
  revenue: number;
  profitLoss: number;
}

export interface WorkspaceInsight {
  sessionId: string;
  revenueSummary: string;
  profitLossSummary: string;
  metrics: InsightMetric[];
  projections: ProjectionPoint[];
  risks: InsightRisk[];
  mitigations: string[];
  openQuestions: InsightQuestion[];
  recommendations: string[];
  generatedAt: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  type: DocumentType;
  sourceLanguage: LanguageCode;
  targetLanguage?: LanguageCode;
  status: DocumentStatus;
  updatedAt: string;
  relatedSessionId?: string;
  pageCount?: number;
  previewText: string;
}

export interface SummaryActionItem {
  id: string;
  owner: string;
  text: string;
  due?: string;
}

export interface SummaryRecord {
  id: string;
  sessionId: string;
  title: string;
  generatedAt: string;
  status: SummaryStatus;
  overview: string;
  actionItems: SummaryActionItem[];
  keyQuestions: string[];
  risks: InsightRisk[];
  transcriptDigest: string;
  linkedDocumentIds: string[];
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
}

export interface WorkspaceOutput {
  id: string;
  title: string;
  kind: "projection" | "note" | "risk" | "document";
  updatedAt: string;
  status: "fresh" | "review" | "shared";
}

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone?: MetricTone;
}

export interface DeliverableRecord {
  id: string;
  title: string;
  kind: DeliverableKind;
  status: DeliverableStatus;
  updatedAt: string;
  languageLabel: string;
  summary: string;
}
