import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

// ─── Design tokens ────────────────────────────────────────────────
const C = {
  bg: '#0D0F14',
  surface: '#13161E',
  surfaceHigh: '#1A1E2A',
  border: '#1E2130',
  accent: '#4EFFC4',
  danger: '#FF6B7A',
  gold: '#F5C842',
  blue: '#5B9FFF',
  muted: '#6B7394',
  text: '#E8EAF0',
  textSub: '#A0A8C0',
};

const TYPE_COLOR = {
  foundation: C.blue,
  growth: C.accent,
  scale: C.gold,
};

// ─── Mock transcript used when no prop provided ────────────────────
const MOCK_TRANSCRIPT = `
Consultant: Thanks for joining today. Can you walk me through your current business?
Entrepreneur: Sure. I run a small bakery in Detroit. We do about $8,000 a month in revenue right now,
mostly walk-in customers. I want to expand catering and maybe open a second location.
Consultant: What are your main costs right now?
Entrepreneur: Ingredients are about $2,500, rent is $1,800, staff is two part-time people at around $2,200
combined. So maybe $6,500 total costs, leaving about $1,500 profit a month.
Consultant: And what's your vision for growth over the next three years?
Entrepreneur: Year one I want catering to add another $3,000 a month. Year two I want to open that second
location and hopefully double overall revenue. Year three I'm thinking franchising.
Consultant: What's your biggest risk right now?
Entrepreneur: Supply chain honestly. And finding reliable staff. Health permits in Detroit take forever.
`;

// ─── Shared card wrapper ───────────────────────────────────────────
function Card({ emoji, title, summary, children }) {
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 12,
      padding: '20px 20px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>{emoji}</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.text, letterSpacing: 1, textTransform: 'uppercase' }}>
          {title}
        </span>
      </div>
      {summary && (
        <p style={{ fontStyle: 'italic', fontSize: 12, color: C.muted, lineHeight: 1.5, margin: 0 }}>
          {summary}
        </p>
      )}
      {children}
    </div>
  );
}

// ─── Legend row helper ────────────────────────────────────────────
function LegendRow({ items }) {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 6 }}>
      {items.map(({ color, label }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.muted }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Custom tooltip ────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.surfaceHigh, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px' }}>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.textSub, marginBottom: 6 }}>{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ fontSize: 12, color: p.color }}>{p.name}</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.text }}>
            {typeof p.value === 'number' && p.value > 999
              ? `$${(p.value / 1000).toFixed(0)}k`
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Chart cards ──────────────────────────────────────────────────
function FinancialCard({ data, summary }) {
  return (
    <Card emoji="💰" title="Financial Forecast" summary={summary}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barCategoryGap="25%" barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
          <XAxis dataKey="year" tick={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="revenue" name="Revenue" fill={C.accent} radius={[3, 3, 0, 0]} />
          <Bar dataKey="costs" name="Costs" fill={C.danger} radius={[3, 3, 0, 0]} />
          <Bar dataKey="profit" name="Profit" fill={C.gold} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <LegendRow items={[
        { color: C.accent, label: 'Revenue' },
        { color: C.danger, label: 'Costs' },
        { color: C.gold, label: 'Profit' },
      ]} />
    </Card>
  );
}

function MarketCard({ data, summary }) {
  return (
    <Card emoji="📈" title="Market Opportunity" summary={summary}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" barCategoryGap="30%" barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
          <XAxis type="number" tick={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
          <YAxis type="category" dataKey="segment" width={80}
            tick={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="current" name="Current" fill={C.blue} radius={[0, 3, 3, 0]} />
          <Bar dataKey="projected" name="Projected" fill={C.accent} radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <LegendRow items={[
        { color: C.blue, label: 'Current' },
        { color: C.accent, label: 'Projected' },
      ]} />
    </Card>
  );
}

function RiskCard({ data, summary }) {
  return (
    <Card emoji="⚠️" title="Risk Assessment" summary={summary}>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke={C.border} />
          <PolarAngleAxis dataKey="risk"
            tick={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fill: C.muted }} />
          <Radar name="Risk Score" dataKey="score" stroke={C.danger} fill={C.danger} fillOpacity={0.18} dot={{ r: 3, fill: C.danger }} />
        </RadarChart>
      </ResponsiveContainer>
      <LegendRow items={[{ color: C.danger, label: 'Risk score (0–10)' }]} />
    </Card>
  );
}

function TimelineCard({ milestones, summary }) {
  return (
    <Card emoji="🗓" title="Milestone Timeline" summary={summary}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, paddingLeft: 4, marginTop: 4 }}>
        {milestones.map((m, i) => {
          const color = TYPE_COLOR[m.type] || C.muted;
          const isLast = i === milestones.length - 1;
          return (
            <div key={i} style={{ display: 'flex', gap: 12, position: 'relative' }}>
              {/* Dot + connector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: color, marginTop: 3,
                  boxShadow: `0 0 6px ${color}80`,
                  flexShrink: 0,
                }} />
                {!isLast && (
                  <div style={{ width: 1, flex: 1, background: C.border, minHeight: 28, margin: '2px 0' }} />
                )}
              </div>
              {/* Content */}
              <div style={{ paddingBottom: isLast ? 0 : 16, paddingTop: 0 }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: color, display: 'block', marginBottom: 1 }}>
                  {m.month}
                </span>
                <span style={{ fontSize: 12, color: C.text }}>{m.label}</span>
                <span style={{
                  display: 'inline-block', marginLeft: 8,
                  fontFamily: "'DM Mono', monospace", fontSize: 9,
                  color: color, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  {m.type}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <LegendRow items={[
        { color: C.blue, label: 'Foundation' },
        { color: C.accent, label: 'Growth' },
        { color: C.gold, label: 'Scale' },
      ]} />
    </Card>
  );
}

// ─── Loading dots animation ────────────────────────────────────────
const dotKeyframes = `
@keyframes risus-pulse {
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}`;

function LoadingDots() {
  useEffect(() => {
    if (!document.getElementById('risus-dot-style')) {
      const el = document.createElement('style');
      el.id = 'risus-dot-style';
      el.textContent = dotKeyframes;
      document.head.appendChild(el);
    }
  }, []);

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: C.accent,
          animation: `risus-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────
export default function GenerateProjections({ transcript }) {
  const effectiveTranscript = transcript || MOCK_TRANSCRIPT;
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const hasGenerated = useRef(false);

  const generate = async () => {
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/projections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: effectiveTranscript }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error ${res.status}`);
      }

      const json = await res.json();
      setData(json);
      setStatus('done');
      hasGenerated.current = true;
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  const isLoading = status === 'loading';
  const isDone = status === 'done';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Button ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={generate}
          disabled={isLoading}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 24px',
            background: isLoading ? C.surfaceHigh : 'transparent',
            border: `1px solid ${isLoading ? C.border : C.accent}`,
            borderRadius: 8,
            color: isLoading ? C.muted : C.accent,
            fontFamily: "'DM Mono', monospace",
            fontSize: 13,
            letterSpacing: 0.5,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: isLoading ? 'none' : `0 0 16px ${C.accent}30`,
            outline: 'none',
          }}
          onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.boxShadow = `0 0 24px ${C.accent}55`; }}
          onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.boxShadow = `0 0 16px ${C.accent}30`; }}
        >
          {isLoading ? (
            <>
              <LoadingDots />
              <span>Analyzing transcript…</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 15 }}>✦</span>
              <span>{hasGenerated.current ? '↺ Regenerate' : 'Generate Projections'}</span>
            </>
          )}
        </button>

        {status === 'error' && (
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: C.danger }}>
            {errorMsg}
          </span>
        )}
      </div>

      {/* ── Charts grid ── */}
      {isDone && data && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
        }}>
          <FinancialCard data={data.financial?.data} summary={data.financial?.summary} />
          <MarketCard data={data.market?.data} summary={data.market?.summary} />
          <RiskCard data={data.risk?.data} summary={data.risk?.summary} />
          <TimelineCard milestones={data.timeline?.milestones} summary={data.timeline?.summary} />
        </div>
      )}

      {/* ── Empty state hint ── */}
      {status === 'idle' && (
        <div style={{
          border: `1px dashed ${C.border}`,
          borderRadius: 12,
          padding: '40px 32px',
          textAlign: 'center',
          color: C.muted,
          fontFamily: "'DM Mono', monospace",
          fontSize: 12,
          letterSpacing: 0.5,
        }}>
          Click <span style={{ color: C.accent }}>✦ Generate Projections</span> to analyse the live transcript
          and surface financial forecasts, market opportunity, risk scores, and growth milestones.
        </div>
      )}
    </div>
  );
}
