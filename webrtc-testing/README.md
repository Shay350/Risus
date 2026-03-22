# WebRTC Two-Client Demo

This repository contains a deterministic two-role WebRTC demo:

- `client/`: React + TypeScript
- `server/`: Node + Express + Socket.IO signaling server

## Core behavior

- Exactly two roles exist: `alpha` and `beta`
- Links are deterministic and fixed:
  - `http://localhost:5173/join/alpha`
  - `http://localhost:5173/join/beta`
- No sessions and no tokens
- One active socket per role (second join to same role is rejected)

## Signaling events

Server -> client:

- `joined { role }`
- `waiting { message }`
- `peer-ready {}`
- `offer { type, sdp }`
- `answer { type, sdp }`
- `ice-candidate { ... }`
- `peer-left { role }`
- `signal-error { code, message }`

Client -> server:

- `offer { type, sdp }`
- `answer { type, sdp }`
- `ice-candidate { ... }`
- `leave {}`

`alpha` is the deterministic initiator and creates the offer.

## Local setup

### 1) Server

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### 2) Client

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Use the home page to configure signaling URL and optional TURN settings. It shows deterministic Alpha/Beta join links.

## API endpoints

- `GET /health`
- `GET /status`

## Stable demo mode

The home page includes "Demo stable mode" and TURN fields. These settings are persisted in local storage and appended to deterministic join links.

Stable mode:

- lowers video capture profile
- uses websocket-only signaling transport
- when TURN is configured, forces relay transport (`iceTransportPolicy: relay`)

## Camera access note

For browser camera/microphone permissions, use:

- `http://localhost:5173` (recommended for local dev), or
- HTTPS origin

Plain HTTP on raw IPs may block `getUserMedia`.
