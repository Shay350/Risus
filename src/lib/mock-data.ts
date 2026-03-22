import type {
  Achievement,
  CaseRecord,
  DashboardStat,
  DeliverableRecord,
  DocumentRecord,
  Participant,
  QuickAction,
  Session,
  SummaryRecord,
  TranscriptItem,
  UserCaseProfile,
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
      "Dakhligeyga bishiiba waa $2,480. Kiraddu waa $1,650 bishiiba, taasoo ka dhigtay aad iyo aad u adag.",
    translatedText:
      "My monthly income is $2,480. Rent is $1,650 per month, which makes things very tight.",
    sourceLanguage: "so",
    targetLanguage: "en",
    confidence: 0.97,
    type: "speech",
  },
  {
    id: "t-2",
    sessionId: activeSession.id,
    timestamp: "10:14",
    speakerId: "p2",
    speakerName: "Sofia Chen",
    originalText:
      "So after rent you have about $830 left. What are your other fixed monthly costs — utilities, transport, groceries?",
    translatedText:
      "So after rent you have about $830 left. What are your other fixed monthly costs — utilities, transport, groceries?",
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
      "Korontada iyo biyaha waa ku dhawaad $180. Gaadiidka $120. Raashinka $350. Waxaan sidoo kale leeyahay canshuurta daryeelka carruurta $200 bishiiba.",
    translatedText:
      "Utilities are around $180. Transport $120. Groceries $350. I also have childcare costs of $200 per month.",
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
      "That puts total costs at roughly $2,500 — leaving a monthly shortfall of about $320. If the rent support subsidy of $400 is approved, you'd have a small surplus of $80. What does your income look like over the next year if your hours stay the same?",
    translatedText:
      "That puts total costs at roughly $2,500 — leaving a monthly shortfall of about $320. If the rent support subsidy of $400 is approved, you'd have a small surplus of $80. What does your income look like over the next year if your hours stay the same?",
    sourceLanguage: "en",
    targetLanguage: "en",
    confidence: 0.99,
    type: "speech",
  },
  {
    id: "t-5",
    sessionId: activeSession.id,
    timestamp: "10:21",
    speakerId: "p1",
    speakerName: "Amina Hassan",
    originalText:
      "Haddii saacadahaygii la iga dhimo, waxay noqon kartaa $1,900 bishiiba. Laakiin haddii aan helo shaqada wakhtiga buuxa ee la ballanqaaday, waxay ahaanaysaa $3,100.",
    translatedText:
      "If my hours are reduced it could drop to $1,900 a month. But if I get the full-time position that was promised, it would be $3,100.",
    sourceLanguage: "so",
    targetLanguage: "en",
    confidence: 0.95,
    type: "speech",
  },
  {
    id: "t-6",
    sessionId: activeSession.id,
    timestamp: "10:24",
    speakerId: "p2",
    speakerName: "Sofia Chen",
    originalText:
      "Let me model three scenarios then. Current income of $2,480 with the $320 gap. Reduced hours at $1,900 widening the gap to $600. And the full-time outcome at $3,100 giving a $600 surplus. The biggest risks I see are the missing paystub, the April 30th filing deadline, and childcare eligibility if your employment status changes.",
    translatedText:
      "Let me model three scenarios then. Current income of $2,480 with the $320 gap. Reduced hours at $1,900 widening the gap to $600. And the full-time outcome at $3,100 giving a $600 surplus. The biggest risks I see are the missing paystub, the April 30th filing deadline, and childcare eligibility if your employment status changes.",
    sourceLanguage: "en",
    targetLanguage: "en",
    confidence: 0.99,
    type: "speech",
  },
  {
    id: "t-7",
    sessionId: activeSession.id,
    timestamp: "10:27",
    speakerId: "p1",
    speakerName: "Amina Hassan",
    originalText:
      "Waxaan rajeynayaa inaan helo jawaabta shaqada gudahood laba toddobaad. Haddaan helo, dakhligaygu sannadkan guud ahaan wuxuu noqon doonaa $34,000.",
    translatedText:
      "I expect to hear about the job within two weeks. If I get it, my total income this year should be around $34,000.",
    sourceLanguage: "so",
    targetLanguage: "en",
    confidence: 0.94,
    type: "speech",
  },
  {
    id: "t-8",
    sessionId: activeSession.id,
    timestamp: "10:29",
    speakerId: "p2",
    speakerName: "Sofia Chen",
    originalText:
      "Good. I'll prepare the rent support application using the current $2,480 figure, flag the paystub as pending, and add a note about the potential income change. Priority actions are: get the paystub from your employer this week, confirm the April 30th deadline in writing, and we'll file the subsidy claim by April 25th to leave buffer time.",
    translatedText:
      "Good. I'll prepare the rent support application using the current $2,480 figure, flag the paystub as pending, and add a note about the potential income change. Priority actions are: get the paystub from your employer this week, confirm the April 30th deadline in writing, and we'll file the subsidy claim by April 25th to leave buffer time.",
    sourceLanguage: "en",
    targetLanguage: "en",
    confidence: 0.99,
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

export const caseRepository: CaseRecord[] = [
  {
    id: "case-1",
    title: "Emergency Housing Intake — Income & Rent Support Analysis",
    orgName: "Northbridge Advisory Network",
    country: "Canada",
    countryCode: "CA",
    city: "Toronto",
    sector: "Housing & Social Services",
    status: "verified",
    publishedAt: "2026-03-21",
    year: 2026,
    description:
      "Refugee client facing a $320/month shortfall on $2,480 income with $1,650 rent. Analysis modelled three income scenarios, identified paystub and visa renewal risks, and produced a bilingual rent support application with an April 25th filing path.",
    keyOutcome: "Subsidy filing path secured; monthly gap reduced to zero under support-bridge scenario.",
    languages: ["so", "en"],
    pointsEarned: 150,
    isAnonymous: false,
    isOwn: true,
    sessionId: "session-live-101",
  },
  {
    id: "case-2",
    title: "Artisan Bakery — Revenue Optimisation & CFDI Compliance, Mexico City",
    orgName: "Merasta Consulting Partners",
    country: "Mexico",
    countryCode: "MX",
    city: "Mexico City",
    sector: "Retail & Trade",
    status: "verified",
    publishedAt: "2026-02-14",
    year: 2026,
    description:
      "Pan dulce bakery generating 160,000 MXN/month facing peso depreciation, 85% oven utilisation, and SAT CFDI compliance gaps. Advisory covered corporate catering expansion, accountant engagement for RFC setup, and a three-year export roadmap to US diaspora markets.",
    keyOutcome: "Revenue path to 280,000 MXN/month identified; CFDI compliance plan delivered.",
    languages: ["es", "en"],
    pointsEarned: 150,
    isAnonymous: false,
    isOwn: false,
  },
  {
    id: "case-3",
    title: "Community Health Clinic — Funding Resilience & FX Risk, Lagos",
    orgName: "Global Health Advisory Group",
    country: "Nigeria",
    countryCode: "NG",
    city: "Lagos",
    sector: "Healthcare",
    status: "published",
    publishedAt: "2026-01-30",
    year: 2026,
    description:
      "Dual-site clinic serving 200 patients/month with USD-denominated grants and naira cost base. 60% currency purchasing-power loss identified. Advisory covered supply hedging, FIRS tax-exempt status clarification, and a 320-patient expansion model requiring 2 additional nurses.",
    keyOutcome: "Funding resilience plan delivered; expansion staffing model validated at $80–120 USD/nurse.",
    languages: ["en"],
    pointsEarned: 150,
    isAnonymous: false,
    isOwn: false,
  },
  {
    id: "case-4",
    title: "Ethical Womenswear Brand — Cross-Border Compliance & Growth, Toronto",
    orgName: "Northbridge Advisory Network",
    country: "Canada",
    countryCode: "CA",
    city: "Toronto",
    sector: "Artisan & Craft",
    status: "verified",
    publishedAt: "2025-12-10",
    year: 2025,
    description:
      "Kerala artisan cooperative brand generating CAD $18,000/month facing INR/CAD FX volatility, 18% MFN import duties, and overdue HST registration. Advisory structured wholesale channel entry, a customs duty model, and a CRA compliance remediation plan.",
    keyOutcome: "HST remediation path defined; wholesale channel model projected to add CAD $6,000–12,000/month.",
    languages: ["en"],
    pointsEarned: 150,
    isAnonymous: false,
    isOwn: true,
    sessionId: "session-complete-104",
  },
  {
    id: "case-5",
    title: "Worker-Owned Delivery Co-op — Operational Efficiency & BEE Compliance, Johannesburg",
    orgName: "Southern Africa Advisors",
    country: "South Africa",
    countryCode: "ZA",
    city: "Johannesburg",
    sector: "Logistics & Transport",
    status: "published",
    publishedAt: "2025-11-22",
    year: 2025,
    description:
      "22-driver worker co-op with R1.2M/month revenue and 88% on-time rate against 93% contract threshold. Analysis identified rand depreciation fuel risk, B-BBEE Level 4 contract exposure, and an EV financing path via IDC green economy fund.",
    keyOutcome: "Route optimisation model projected to lift OTD to 94%; BEE upgrade plan scoped.",
    languages: ["en"],
    pointsEarned: 150,
    isAnonymous: false,
    isOwn: false,
  },
  {
    id: "case-6",
    title: "Refugee Benefits Appeal — Evidence Package & Filing Strategy",
    orgName: "Anonymous Contributor",
    country: "Canada",
    countryCode: "CA",
    city: "Ottawa",
    sector: "Housing & Social Services",
    status: "published",
    publishedAt: "2025-10-05",
    year: 2025,
    description:
      "Arabic-speaking client navigating benefits appeal with translation barriers and missing documentation. Bilingual evidence checklist produced with signature field translations and a submission timeline aligned to case worker requirements.",
    keyOutcome: "Complete bilingual appeal package submitted within 10-day window.",
    languages: ["ar", "en"],
    pointsEarned: 0,
    isAnonymous: true,
    isOwn: false,
  },
];

const achievements: Achievement[] = [
  { id: "ach-1", title: "First Case Published", icon: "🏅", earned: true },
  { id: "ach-2", title: "Canada Expert", icon: "🌍", earned: true },
  { id: "ach-3", title: "Community Contributor", icon: "🤝", earned: true },
  { id: "ach-4", title: "10 Cases Published", icon: "🔟", earned: false },
  { id: "ach-5", title: "Top Contributor", icon: "⭐", earned: false },
  { id: "ach-6", title: "Multi-Region Expert", icon: "🌐", earned: false },
];

export const userCaseProfile: UserCaseProfile = {
  name: organization.name,
  orgName: organization.workspace,
  activeSince: "Jan 2025",
  totalPoints: 450,
  nextRewardThreshold: 1000,
  casesPublished: 3,
  achievements,
};

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
