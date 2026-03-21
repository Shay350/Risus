import type {
  DashboardStat,
  DeliverableRecord,
  DocumentRecord,
  Participant,
  QuickAction,
  Session,
  SummaryRecord,
  TranscriptItem,
  WorkspaceInsight,
  WorkspaceOutput,
} from "@/lib/types";

export const organization = {
  name: "Northbridge Advisory Network",
  workspace: "Community Impact Operations",
  consultantName: "Shayan Syed",
  role: "Lead Consultant",
};

export const participants: Participant[] = [
  {
    id: "p1",
    name: "Amina Hassan",
    role: "client",
    language: "so",
    videoEnabled: true,
    audioEnabled: true,
    isPinned: true,
    isSpeaking: true,
  },
  {
    id: "p2",
    name: "Sofia Chen",
    role: "consultant",
    language: "en",
    videoEnabled: true,
    audioEnabled: true,
  },
];

export const activeSession: Session = {
  id: "session-live-101",
  title: "Emergency housing intake consultation",
  orgName: organization.name,
  status: "live",
  startedAt: "2026-03-21T10:10:00-04:00",
  durationMinutes: 46,
  sourceLanguage: "so",
  targetLanguages: ["en"],
  participants,
  agenda: [
    "Confirm current housing needs",
    "Review income and grant eligibility",
    "Identify next-week paperwork blockers",
  ],
  consultantOwner: "Sofia Chen",
  locationLabel: "Remote, Toronto + Ottawa",
  nextActionLabel: "Open Workspace",
};

export const upcomingSession: Session = {
  id: "session-setup-102",
  title: "Benefits appeal preparation",
  orgName: organization.name,
  status: "scheduled",
  scheduledFor: "2026-03-21T14:30:00-04:00",
  durationMinutes: 30,
  sourceLanguage: "ar",
  targetLanguages: ["en"],
  participants,
  agenda: [
    "Review translated evidence pack",
    "Flag missing signatures",
    "Prepare summary for case worker",
  ],
  consultantOwner: "Sofia Chen",
  nextActionLabel: "Stage Session",
};

export const recentSessions: Session[] = [
  activeSession,
  upcomingSession,
  {
    id: "session-complete-103",
    title: "Small charity cashflow review",
    orgName: organization.name,
    status: "completed",
    startedAt: "2026-03-20T15:00:00-04:00",
    durationMinutes: 38,
    sourceLanguage: "fr",
    targetLanguages: ["en"],
    participants: participants.slice(1),
    agenda: ["Validate revenue assumptions", "Assign compliance follow-ups"],
    consultantOwner: "Sofia Chen",
    nextActionLabel: "Review Summary",
  },
];

export const dashboardStats: DashboardStat[] = [
  {
    id: "stat-1",
    label: "Live sessions",
    value: "03",
    helper: "2 with translation enabled",
    tone: "positive",
  },
  {
    id: "stat-2",
    label: "AI outputs pending review",
    value: "08",
    helper: "3 revenue projections, 5 summary drafts",
    tone: "warning",
  },
  {
    id: "stat-3",
    label: "Documents in queue",
    value: "12",
    helper: "Average extract time 2m 14s",
  },
  {
    id: "stat-4",
    label: "Translation coverage",
    value: "7 langs",
    helper: "English, Somali, Arabic, French, Spanish, Ukrainian, Tagalog",
  },
];

export const quickActions: QuickAction[] = [
  {
    id: "action-1",
    title: "Join live call",
    description: "Resume the active consultation and open the transcript pane.",
    href: "/calls/live",
  },
  {
    id: "action-2",
    title: "Open consultant workspace",
    description: "Review AI-generated projections, risks, and open questions.",
    href: "/workspace",
  },
  {
    id: "action-3",
    title: "Translate a document",
    description: "Upload a source file and queue extraction or generation actions.",
    href: "/documents",
  },
  {
    id: "action-4",
    title: "Review call summary",
    description: "Inspect draft deliverables before sharing with the client team.",
    href: "/summaries",
  },
];

export const transcriptItems: TranscriptItem[] = [
  {
    id: "t-1",
    sessionId: activeSession.id,
    timestamp: "10:12",
    speakerId: "p1",
    speakerName: "Amina Hassan",
    originalText:
      "Waxaan rabaa inaan fahmo haddii dakhliga usbuucan uu saameynayo kaalmada kirada.",
    translatedText:
      "I need to understand whether this week's income affects the rent support application.",
    sourceLanguage: "so",
    targetLanguage: "en",
    confidence: 0.97,
    type: "speech",
  },
  {
    id: "t-2",
    sessionId: activeSession.id,
    timestamp: "10:13",
    speakerId: "p2",
    speakerName: "Sofia Chen",
    originalText:
      "We can model both the current income and the reduced-hours scenario before we submit anything.",
    translatedText:
      "We can model both the current income and the reduced-hours scenario before we submit anything.",
    sourceLanguage: "en",
    targetLanguage: "en",
    confidence: 0.99,
    type: "speech",
  },
  {
    id: "t-3",
    sessionId: activeSession.id,
    timestamp: "10:16",
    speakerId: "p1",
    speakerName: "Amina Hassan",
    originalText:
      "Waxaan hayaa warqaddii kirada, laakiin mushaharka ugu dambeeya wali lama soo dejin.",
    translatedText:
      "I have the rent letter, but the latest paystub still has not been downloaded.",
    sourceLanguage: "so",
    targetLanguage: "en",
    confidence: 0.96,
    type: "speech",
  },
  {
    id: "t-4",
    sessionId: activeSession.id,
    timestamp: "10:18",
    speakerId: "p2",
    speakerName: "Sofia Chen",
    originalText:
      "If we cannot confirm the paystub today, I will generate a checklist and a cover note for the case worker.",
    translatedText:
      "If we cannot confirm the paystub today, I will generate a checklist and a cover note for the case worker.",
    sourceLanguage: "en",
    targetLanguage: "en",
    confidence: 0.95,
    type: "speech",
  },
];

export const workspaceInsight: WorkspaceInsight = {
  sessionId: activeSession.id,
  revenueSummary:
    "Household income is stable enough for a provisional filing, but the missing paystub weakens the current rent-support claim.",
  profitLossSummary:
    "Projected monthly balance remains negative by $320 under the present schedule and improves to negative $110 if reduced-hours support is approved.",
  metrics: [
    {
      id: "m-1",
      label: "Projected monthly revenue",
      value: "$2,480",
      change: "+$140 vs prior filing",
      tone: "positive",
    },
    {
      id: "m-2",
      label: "Projected monthly gap",
      value: "-$320",
      change: "High pressure on April rent",
      tone: "critical",
    },
    {
      id: "m-3",
      label: "Evidence completeness",
      value: "78%",
      change: "Missing paystub + landlord letter",
      tone: "warning",
    },
    {
      id: "m-4",
      label: "Confidence score",
      value: "0.86",
      change: "Translation quality remains high",
      tone: "neutral",
    },
  ],
  projections: [
    { label: "Current", revenue: 2480, profitLoss: -320 },
    { label: "Reduced hours", revenue: 2260, profitLoss: -110 },
    { label: "Support bridge", revenue: 2720, profitLoss: 140 },
    { label: "Delayed filing", revenue: 2180, profitLoss: -540 },
  ],
  risks: [
    {
      id: "r-1",
      title: "Missing paystub delays eligibility review",
      severity: "high",
      description:
        "The current package cannot prove weekly income fluctuations without a current paystub.",
      mitigation:
        "Generate a case worker note and request employer confirmation as alternate evidence.",
      owner: "Sofia Chen",
    },
    {
      id: "r-2",
      title: "Deadline wording still needs confirmation",
      severity: "medium",
      description:
        "The deadline explanation had to be restated before both sides confirmed the same filing date.",
      mitigation:
        "Carry the deadline note into the generated checklist and the deliverables packet.",
      owner: "Sofia Chen",
    },
  ],
  mitigations: [
    "Issue a same-day checklist in Somali and English.",
    "Generate a landlord letter template with translated signature fields.",
    "Schedule a follow-up upload review before 3 p.m. Monday.",
  ],
  openQuestions: [
    {
      id: "q-1",
      question: "Can employer confirmation substitute for the paystub if the payroll portal is inaccessible?",
      priority: "high",
      context: "Needed before final submission.",
    },
    {
      id: "q-2",
      question: "Should reduced-hours assistance be filed separately or within the rent-support package?",
      priority: "medium",
      context: "Depends on current case worker preference.",
    },
    {
      id: "q-3",
      question: "Does the translated landlord letter require notarization?",
      priority: "low",
    },
  ],
  recommendations: [
    "Open a draft support-bridge document immediately after the call.",
    "Export a bilingual summary for the client and the case worker.",
    "Flag this session for deadline-sensitive monitoring.",
  ],
  generatedAt: "2026-03-21T10:24:00-04:00",
};

export const documents: DocumentRecord[] = [
  {
    id: "doc-1",
    title: "Lease addendum - Somali scan",
    type: "uploaded",
    sourceLanguage: "so",
    targetLanguage: "en",
    status: "extracting",
    updatedAt: "2026-03-21T10:19:00-04:00",
    relatedSessionId: activeSession.id,
    pageCount: 4,
    previewText:
      "Scanned lease addendum pending OCR. Early extraction shows landlord amendment language and payment dates.",
  },
  {
    id: "doc-2",
    title: "Case worker cover note",
    type: "generated",
    sourceLanguage: "en",
    targetLanguage: "so",
    status: "ready",
    updatedAt: "2026-03-21T10:08:00-04:00",
    relatedSessionId: activeSession.id,
    pageCount: 2,
    previewText:
      "Draft cover note summarizing eligibility concerns, missing evidence, and a request for conditional review.",
  },
  {
    id: "doc-3",
    title: "Benefit office checklist",
    type: "translated",
    sourceLanguage: "en",
    targetLanguage: "ar",
    status: "ready",
    updatedAt: "2026-03-20T18:11:00-04:00",
    relatedSessionId: "session-complete-103",
    pageCount: 1,
    previewText:
      "Translated checklist with deadlines, signatures required, and recommended attachments for the benefits office.",
  },
  {
    id: "doc-4",
    title: "Income verification request",
    type: "generated",
    sourceLanguage: "en",
    targetLanguage: "fr",
    status: "queued",
    updatedAt: "2026-03-21T10:23:00-04:00",
    relatedSessionId: activeSession.id,
    pageCount: 1,
    previewText:
      "Queued for generation once the revenue projection is approved by the consultant.",
  },
];

export const summaries: SummaryRecord[] = [
  {
    id: "sum-1",
    sessionId: "session-complete-103",
    title: "Cashflow review summary",
    generatedAt: "2026-03-20T16:04:00-04:00",
    status: "shared",
    overview:
      "The client can absorb payroll timing delays this month, but only if board approval lands before Friday.",
    actionItems: [
      {
        id: "a-1",
        owner: "Finance volunteer",
        text: "Confirm board-signature turnaround by noon Friday.",
        due: "2026-03-21",
      },
      {
        id: "a-2",
        owner: "Sofia Chen",
        text: "Send translated cover summary to the client director.",
        due: "2026-03-21",
      },
    ],
    keyQuestions: [
      "Can the client defer one vendor payment without affecting service continuity?",
      "Is a bridge grant application materially faster than the current appeal path?",
    ],
    risks: workspaceInsight.risks,
    transcriptDigest:
      "Call focused on near-term cashflow, payroll timing, and evidence quality. Translation was stable with one repeated clarification around filing dates.",
    linkedDocumentIds: ["doc-2", "doc-3"],
  },
  {
    id: "sum-2",
    sessionId: activeSession.id,
    title: "Housing intake summary draft",
    generatedAt: "2026-03-21T10:25:00-04:00",
    status: "draft",
    overview:
      "The client needs a bilingual evidence checklist, a clarified deadline note, and a projected filing path based on current household income.",
    actionItems: [
      {
        id: "a-3",
        owner: "Luis Ortega",
        text: "Validate the translated deadline note before export.",
        due: "2026-03-21",
      },
      {
        id: "a-4",
        owner: "Sofia Chen",
        text: "Generate the case worker cover note after workspace review.",
        due: "2026-03-21",
      },
    ],
    keyQuestions: workspaceInsight.openQuestions.map((item) => item.question),
    risks: workspaceInsight.risks,
    transcriptDigest:
      "The client requested clarity on whether recent income changes affect rent support. The team identified evidence gaps and agreed to produce a bilingual packet.",
    linkedDocumentIds: ["doc-1", "doc-2", "doc-4"],
  },
];

export const recentWorkspaceOutputs: WorkspaceOutput[] = [
  {
    id: "output-1",
    title: "April rent support projection",
    kind: "projection",
    updatedAt: "8 minutes ago",
    status: "fresh",
  },
  {
    id: "output-2",
    title: "Evidence gap note",
    kind: "risk",
    updatedAt: "14 minutes ago",
    status: "review",
  },
  {
    id: "output-3",
    title: "Bilingual cover letter draft",
    kind: "document",
    updatedAt: "31 minutes ago",
    status: "shared",
  },
];

export const deliverablesQueue: DeliverableRecord[] = [
  {
    id: "deliverable-1",
    title: "Housing intake summary",
    kind: "summary",
    status: "draft",
    updatedAt: "2026-03-21T10:25:00-04:00",
    languageLabel: "EN / SO",
    summary:
      "Post-call summary with action items, risks, and a transcript digest for the client handoff.",
  },
  {
    id: "deliverable-2",
    title: "Case worker cover note",
    kind: "document",
    status: "ready",
    updatedAt: "2026-03-21T10:08:00-04:00",
    languageLabel: "EN / SO",
    summary:
      "Bilingual cover note explaining the missing paystub and the requested review path.",
  },
  {
    id: "deliverable-3",
    title: "Evidence checklist",
    kind: "document",
    status: "processing",
    updatedAt: "2026-03-21T10:19:00-04:00",
    languageLabel: "SO scan to EN",
    summary:
      "OCR and translation queue for the supporting lease addendum and checklist package.",
  },
  {
    id: "deliverable-4",
    title: "Client handoff packet",
    kind: "packet",
    status: "draft",
    updatedAt: "2026-03-21T10:27:00-04:00",
    languageLabel: "EN / SO / ES",
    summary:
      "Merged packet that will bundle the summary, checklist, and translated support notes.",
  },
];

export const statusHighlights = [
  {
    id: "status-1",
    label: "Translation engine",
    value: "Healthy",
    helper: "Avg latency 1.2s",
  },
  {
    id: "status-2",
    label: "OCR throughput",
    value: "Moderate queue",
    helper: "4 docs extracting",
  },
  {
    id: "status-3",
    label: "Summary generation",
    value: "Ready",
    helper: "Drafts available in 45s",
  },
];

export const pageSummaries = {
  dashboard: "Operational overview, live work, and pending AI outputs.",
  calls: "Live multilingual consultation with transcript and translation context.",
  workspace: "AI-generated analysis, risks, questions, and document handoff.",
  documents: "Translated, extracted, and generated document management.",
  summaries: "Post-call deliverables, action items, and export controls.",
  settings: "Language, notification, and workspace defaults.",
};
