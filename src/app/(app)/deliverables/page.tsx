"use client";

import { useState, useMemo } from "react";
import { Search, Filter, CheckCircle2, Circle, Lock, X } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { caseRepository, userCaseProfile, organization } from "@/lib/mock-data";
import type { CaseRecord, CaseSector } from "@/lib/types";

// ─── Flag image ───────────────────────────────────────────────────
function FlagImage({ countryCode, country }: { countryCode: string; country: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png 2x`}
      width={28}
      height={20}
      alt={country}
      title={country}
      className="rounded-sm object-cover shrink-0 mt-0.5 shadow-sm"
      style={{ minWidth: 28 }}
    />
  );
}

// ─── Sector colours ────────────────────────────────────────────────
const SECTOR_COLOURS: Record<string, string> = {
  "Housing & Social Services": "bg-blue-50 text-blue-700 border-blue-200",
  "Food & Agriculture":        "bg-green-50 text-green-700 border-green-200",
  "Healthcare":                "bg-rose-50 text-rose-700 border-rose-200",
  "Retail & Trade":            "bg-amber-50 text-amber-700 border-amber-200",
  "Logistics & Transport":     "bg-orange-50 text-orange-700 border-orange-200",
  "Artisan & Craft":           "bg-purple-50 text-purple-700 border-purple-200",
  "Education":                 "bg-sky-50 text-sky-700 border-sky-200",
  "Finance & Insurance":       "bg-teal-50 text-teal-700 border-teal-200",
};

// ─── Case card ────────────────────────────────────────────────────
function CaseCard({
  item,
  justPublished,
}: {
  item: CaseRecord;
  justPublished: boolean;
}) {
  const sectorClass =
    SECTOR_COLOURS[item.sector] ?? "bg-slate-50 text-slate-600 border-slate-200";
  const isPublished = item.isOwn || justPublished;

  return (
    <article
      className={`rounded-2xl border bg-[var(--panel)] p-5 shadow-[var(--shadow-sm)] flex flex-col gap-3 hover:shadow-[var(--shadow-md)] transition-all ${
        justPublished
          ? "border-[var(--accent)] ring-1 ring-[var(--accent)] ring-offset-1"
          : "border-[var(--border)]"
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <FlagImage countryCode={item.countryCode} country={item.country} />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-[var(--foreground)] leading-snug">
            {item.title}
          </h3>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            {item.isAnonymous ? "Anonymous Contributor" : item.orgName}
            {" · "}
            {new Date(item.publishedAt).toLocaleDateString("en-CA", {
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${sectorClass}`}>
          {item.sector}
        </span>
        <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-white/60 px-2.5 py-0.5 text-xs font-medium text-[var(--muted)]">
          {item.city ? `${item.city}, ` : ""}{item.country}
        </span>
        <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-white/60 px-2.5 py-0.5 text-xs font-medium text-[var(--muted)]">
          {item.year}
        </span>
        {item.status === "verified" && (
          <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
            <CheckCircle2 className="h-3 w-3" />
            Verified Case
          </span>
        )}
        {justPublished && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent)] bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
            <CheckCircle2 className="h-3 w-3" />
            Just Published
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--muted)] leading-relaxed line-clamp-3">
        {item.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        {isPublished && !item.isAnonymous ? (
          <p className="text-xs font-medium text-[var(--accent)]">
            🏅 {item.isOwn ? organization.name.split(" ")[0] : item.orgName.split(" ")[0]} earned{" "}
            {item.pointsEarned || 150} pts for publishing
          </p>
        ) : item.isAnonymous ? (
          <p className="text-xs text-[var(--muted)] flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Contributor chose to remain anonymous
          </p>
        ) : (
          <p className="text-xs font-medium text-[var(--accent)]">
            🏅 {item.orgName.split(" ")[0]} earned {item.pointsEarned} pts for publishing
          </p>
        )}
        <button className="text-xs font-medium text-[var(--accent)] hover:underline shrink-0">
          View Full Case →
        </button>
      </div>
    </article>
  );
}

// ─── Publish modal ────────────────────────────────────────────────
function PublishModal({
  unpublished,
  onPublish,
  onClose,
}: {
  unpublished: CaseRecord[];
  onPublish: (id: string) => void;
  onClose: () => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)" }}
    >
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--panel-strong)] shadow-[var(--shadow-md)] overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Publish a case</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Select an analysis to share publicly and earn +150 pts
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4 text-[var(--muted)]" />
          </button>
        </div>

        {/* Case list */}
        <div className="divide-y divide-[var(--border)] max-h-72 overflow-y-auto">
          {unpublished.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-[var(--muted)]">
              All your cases are already published. 🎉
            </p>
          ) : (
            unpublished.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left px-5 py-4 flex items-start gap-3 transition-colors ${
                  selectedId === c.id
                    ? "bg-[var(--accent-soft)]"
                    : "hover:bg-slate-50"
                }`}
              >
                <FlagImage countryCode={c.countryCode} country={c.country} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--foreground)] leading-snug line-clamp-2">
                    {c.title}
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{c.sector} · {c.country}</p>
                </div>
                <div
                  className={`mt-0.5 shrink-0 h-4 w-4 rounded-full border-2 transition-colors ${
                    selectedId === c.id
                      ? "border-[var(--accent)] bg-[var(--accent)]"
                      : "border-slate-300 bg-white"
                  }`}
                />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!selectedId}
            onClick={() => selectedId && onPublish(selectedId)}
            className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            🏅 Publish — earn +150 pts
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Gamification sidebar ─────────────────────────────────────────
function GamificationPanel({
  points,
  casesPublished,
  onPublishClick,
  allPublished,
}: {
  points: number;
  casesPublished: number;
  onPublishClick: () => void;
  allPublished: boolean;
}) {
  const profile = userCaseProfile;
  const progress = Math.min(100, Math.round((points / profile.nextRewardThreshold) * 100));
  const remaining = Math.max(0, profile.nextRewardThreshold - points);

  return (
    <aside className="space-y-4">
      {/* Points card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-sm)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          Risus — Your Points
        </p>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
            {profile.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">{profile.name}</p>
            <p className="text-xs text-[var(--muted)]">
              Active since {profile.activeSince} · {casesPublished} cases published
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-3xl font-bold tracking-tight text-[var(--foreground)] tabular-nums transition-all">
            {points}
          </p>
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Risus Points
          </p>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1.5">
            <span>Progress to Free Hours Reward</span>
            <span className="font-medium text-[var(--foreground)]">
              {points} / {profile.nextRewardThreshold} pts
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {remaining > 0 ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs text-amber-800 leading-relaxed">
              🎁{" "}
              <span className="font-semibold">
                Publish {Math.ceil(remaining / 150)} more case{Math.ceil(remaining / 150) !== 1 ? "s" : ""}
              </span>{" "}
              to earn 5 free hours on Risus. You&rsquo;re{" "}
              <span className="font-semibold">{remaining} points</span> away.
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3">
            <p className="text-xs text-green-800 leading-relaxed font-medium">
              🎉 You&rsquo;ve earned 5 free hours on Risus!
            </p>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-sm)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)] mb-3">
          Achievement Badges
        </p>
        <div className="grid grid-cols-3 gap-2">
          {profile.achievements.map((ach) => (
            <div
              key={ach.id}
              title={ach.title}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition-colors ${
                ach.earned
                  ? "border-[var(--border)] bg-white/80"
                  : "border-dashed border-[var(--border)] bg-white/30 opacity-50 grayscale"
              }`}
            >
              <span className="text-xl leading-none">{ach.icon}</span>
              <p className="text-[10px] font-medium text-[var(--foreground)] leading-tight">
                {ach.title}
              </p>
              {!ach.earned && <Circle className="h-3 w-3 text-[var(--muted)]" />}
            </div>
          ))}
        </div>
      </div>

      {/* Publish CTA */}
      <div className="rounded-2xl border border-[var(--border)] bg-slate-900 p-5 shadow-[var(--shadow-sm)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-1">
          Publish Your Latest Case
        </p>
        <p className="text-sm text-slate-300 leading-relaxed mt-2">
          Your completed analyses are automatically saved. Choose to publish under{" "}
          {profile.name.split(" ")[0]}&rsquo;s name and earn points — or keep it anonymous.
        </p>
        <button
          onClick={onPublishClick}
          disabled={allPublished}
          className="mt-4 w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          🏅 Publish publicly — earn{" "}
          <span className="text-green-300">+150 points</span> toward free hours
        </button>
      </div>
    </aside>
  );
}

// ─── Filters ─────────────────────────────────────────────────────
const ALL_COUNTRIES = Array.from(new Set(caseRepository.map((c) => c.country))).sort();
const ALL_SECTORS   = Array.from(new Set(caseRepository.map((c) => c.sector))).sort() as CaseSector[];
const ALL_YEARS     = Array.from(new Set(caseRepository.map((c) => c.year))).sort((a, b) => b - a);

// Cases already published by the user at load time
const INITIALLY_PUBLISHED = new Set(
  caseRepository.filter((c) => c.isOwn && !c.isAnonymous).map((c) => c.id)
);

// ─── Page ────────────────────────────────────────────────────────
export default function CaseRepositoryPage() {
  const [query, setQuery]               = useState("");
  const [countryFilter, setCountryFilter] = useState("All Countries");
  const [sectorFilter, setSectorFilter]   = useState("All Sectors");
  const [yearFilter, setYearFilter]       = useState("All Years");
  const [showModal, setShowModal]         = useState(false);

  // Gamification state
  const [points, setPoints]             = useState(userCaseProfile.totalPoints);
  const [publishedIds, setPublishedIds] = useState<Set<string>>(new Set(INITIALLY_PUBLISHED));

  const unpublishedCases = useMemo(
    () => caseRepository.filter((c) => !publishedIds.has(c.id)),
    [publishedIds]
  );

  function handlePublish(id: string) {
    setPublishedIds((prev) => new Set([...prev, id]));
    setPoints((prev) => prev + 150);
    setShowModal(false);
  }

  const filtered = useMemo(() => {
    return caseRepository.filter((c) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.sector.toLowerCase().includes(q) ||
        c.orgName.toLowerCase().includes(q);
      const matchesCountry = countryFilter === "All Countries" || c.country === countryFilter;
      const matchesSector  = sectorFilter  === "All Sectors"  || c.sector   === sectorFilter;
      const matchesYear    = yearFilter    === "All Years"    || c.year     === Number(yearFilter);
      return matchesQuery && matchesCountry && matchesSector && matchesYear;
    });
  }, [query, countryFilter, sectorFilter, yearFilter]);

  return (
    <>
      {showModal && (
        <PublishModal
          unpublished={unpublishedCases}
          onPublish={handlePublish}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="space-y-6">
        <PageHeader
          eyebrow="Case Repository"
          title="📂 Browse Cases"
          description="Browse anonymised cases from across the platform. Earn points by publishing yours."
        />

        {/* Search + filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search cases, countries, sectors…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--panel)] py-2.5 pl-10 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] shadow-[var(--shadow-sm)]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-[var(--muted)] shrink-0" />

            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] shadow-[var(--shadow-sm)] cursor-pointer"
            >
              <option>All Countries</option>
              {ALL_COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>

            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] shadow-[var(--shadow-sm)] cursor-pointer"
            >
              <option>All Sectors</option>
              {ALL_SECTORS.map((s) => <option key={s}>{s}</option>)}
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] shadow-[var(--shadow-sm)] cursor-pointer"
            >
              <option>All Years</option>
              {ALL_YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>

            {countryFilter !== "All Countries" && (
              <button
                onClick={() => setCountryFilter("All Countries")}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
              >
                {countryFilter} ×
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-[var(--muted)]">
          <span className="font-semibold text-[var(--foreground)]">{filtered.length} cases</span>{" "}
          found
          {query && (
            <> for <span className="font-medium text-[var(--foreground)]">&ldquo;{query}&rdquo;</span></>
          )}
          {(countryFilter !== "All Countries" || sectorFilter !== "All Sectors" || yearFilter !== "All Years") && (
            <button
              onClick={() => { setCountryFilter("All Countries"); setSectorFilter("All Sectors"); setYearFilter("All Years"); }}
              className="ml-2 text-[var(--accent)] hover:underline"
            >
              Clear filters
            </button>
          )}
        </p>

        {/* Two-column layout */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* Case list */}
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel)] p-10 text-center">
                <p className="text-sm text-[var(--muted)]">No cases match your search.</p>
              </div>
            ) : (
              filtered.map((item) => (
                <CaseCard
                  key={item.id}
                  item={item}
                  justPublished={!item.isOwn && publishedIds.has(item.id)}
                />
              ))
            )}
          </div>

          {/* Gamification sidebar */}
          <GamificationPanel
            points={points}
            casesPublished={publishedIds.size}
            onPublishClick={() => setShowModal(true)}
            allPublished={unpublishedCases.length === 0}
          />
        </div>
      </div>
    </>
  );
}
