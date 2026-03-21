import React, { useState } from 'react';
import GenerateProjections from './components/GenerateProjections';

// Simulated live transcript — replace with your real transcription state
const DEMO_TRANSCRIPT = `
Consultant: Thanks for joining today. Can you walk me through your current business?
Entrepreneur: Sure. I run a small bakery in Detroit. We do about $8,000 a month in revenue right now,
mostly walk-in customers. I want to expand catering and maybe open a second location.
Consultant: What are your main costs right now?
Entrepreneur: Ingredients are about $2,500, rent is $1,800, staff is two part-time people at around $2,200
combined. So maybe $6,500 total costs, leaving about $1,500 profit a month.
Consultant: And what's your vision for growth over the next three years?
Entrepreneur: Year one I want catering to add another $3,000 a month. Year two I want to open that second
location and hopefully double overall revenue. Year three I'm thinking franchising or at least licensing
the brand to another operator.
Consultant: What's your biggest risk right now?
Entrepreneur: Supply chain honestly. Flour and butter prices have been volatile. And finding reliable staff.
Consultant: Any regulatory concerns with the second location?
Entrepreneur: Health permits take forever in Detroit. That's a real timeline risk.
`;

export default function App() {
  const [liveTranscript] = useState(DEMO_TRANSCRIPT);

  return (
    <div style={{ minHeight: '100vh', background: '#0D0F14', padding: '32px 24px' }}>
      <header style={{ marginBottom: 32, borderBottom: '1px solid #1E2130', paddingBottom: 20 }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: '#4EFFC4', letterSpacing: 2, textTransform: 'uppercase' }}>
          Risus Platform
        </span>
        <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, color: '#E8EAF0', marginTop: 6 }}>
          Live Consulting Call
        </h1>
      </header>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Simulated transcript panel */}
        <div style={{
          flex: '0 0 340px',
          background: '#13161E',
          borderRadius: 12,
          border: '1px solid #1E2130',
          padding: 20,
          height: 'fit-content',
        }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#4EFFC4', letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>
            ● Live Transcript
          </div>
          <div style={{ fontSize: 13, color: '#A0A8C0', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 480, overflowY: 'auto' }}>
            {liveTranscript.trim()}
          </div>
        </div>

        {/* Projections panel */}
        <div style={{ flex: 1, minWidth: 320 }}>
          <GenerateProjections transcript={liveTranscript} />
        </div>
      </div>
    </div>
  );
}
