# WebRTC Two-Client Demo

This repo contains a role-based WebRTC demo with:

- `client/`: React + TypeScript app
- `server/`: Node + Express + Socket.IO signaling server

The system is intentionally built for exactly two roles per session:

- `alpha`
- `beta`

Only one connected socket per role is allowed in each session.

## Features implemented

- Session creation endpoint that returns one link for Alpha and one link for Beta
- Signed join tokens (JWT) containing `sessionId` and `role`
- Socket.IO auth validates token and enforces single occupancy per role
- Deterministic initiator (`alpha` creates the offer)
- SDP + ICE candidate relay through the signaling server
- Disconnect handling (`peer-left` event)
- Reconnect support (client retries signaling connection)
- Session status endpoint and stale session cleanup
- Basic CORS + request/socket rate limiting

## Architecture

1. Open the client home page and click **Create Session**.
2. Client calls `POST /sessions` on the server.
3. Server returns `alphaLink` and `betaLink` with signed tokens.
4. Each participant opens their role-specific `/join?token=...` link.
5. Socket auth verifies token and reserves role in that session.
6. Once both are present, server emits `peer-ready`.
7. `alpha` creates offer, `beta` answers, both exchange ICE candidates.
8. Browser media flows peer-to-peer over WebRTC.

## Message contract

Server -> client:

- `joined { sessionId, role }`
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

## Local setup

### 1) Server

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Server defaults to links/CORS compatible with `http://172.18.0.1:5173`.

### 2) Client

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Client runs on `http://172.18.0.1:5173` when Vite is started with host binding.

If needed, run Vite as:

```bash
npm run dev -- --host 0.0.0.0
```

## API endpoints

- `GET /health`
- `POST /sessions`
- `GET /sessions/:id`

Example create session response:

```json
{
  "sessionId": "c8a0b3f3-....",
  "alphaLink": "http://localhost:5173/join?token=...",
  "betaLink": "http://localhost:5173/join?token=...",
  "expiresInSeconds": 3600
}
```

## Build checks

- `client`: `npm run lint`, `npm run build`
- `server`: `npm run build`

## Camera access note

If you open the client over plain HTTP on an IP address (for example `http://172.18.0.1:5173`), many browsers disable `navigator.mediaDevices.getUserMedia`.

For camera/microphone access, use one of:

- `http://localhost:5173` (treated as secure context by browsers)
- HTTPS for your IP/domain (recommended for non-localhost access)
