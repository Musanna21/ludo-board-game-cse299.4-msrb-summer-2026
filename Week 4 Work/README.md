# Ludo Online — Web-Based Real-Time Multiplayer Ludo

A full-stack implementation of classic Ludo, playable in the browser with
real-time multiplayer via Socket.io. Built for the CSE299 project brief:
server-authoritative game rules, room codes, JWT auth with guest play,
MongoDB-backed accounts and match history, live dice/board sync, in-room
chat, and basic reconnection handling.

## Project layout

```
ludo-project/
  backend/     Node.js + Express + Socket.io + MongoDB (Mongoose)
  frontend/    React + Vite + Tailwind CSS
```

## How the game works (quick tour of the code)

- `backend/game/ludoEngine.js` — the entire rule set (dice rolls, legal
  moves, captures, extra turns on six, three-sixes forfeit, win detection).
  This is the only place game rules live; the client never decides outcomes,
  it only sends intents ("roll", "move token 2") and renders whatever the
  server confirms.
- `backend/game/roomManager.js` — lobby/room lifecycle: create, join, start,
  color assignment, disconnect handling.
- `backend/sockets/index.js` — the Socket.io event layer wiring the above
  two together for real-time play, plus a lightweight chat channel.
- `backend/routes/auth.js` + `backend/middleware/auth.js` — JWT-based
  register/login, plus a no-database "guest" login so people can play
  without an account.
- `frontend/src/components/boardGeometry.js` — computes every pixel
  position on the board parametrically (not hand-typed), so the 52-square
  ring, the four home columns, and the yards are all guaranteed consistent
  with the server's square numbering.

There's also a small standalone sanity check for the engine itself:

```
cd backend
npm install
npm run test:engine
```

This exercises dice rules, capture detection, and win detection directly
against the engine, independent of the network layer.

## Running it locally

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env — see "Setting up MongoDB" below
npm run dev
```

The server starts on `http://localhost:4000` (health check at `/health`).

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. You can open it in two browser tabs (or two
browsers) to test multiplayer locally — create a room in one tab, copy the
6-digit room code, join from the other.

### Setting up MongoDB (for real accounts + match history)

Guest play works with **no database at all** — it's a good way to test the
game itself immediately. Accounts (register/login) and saved match history
need a real MongoDB connection:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and
   create a free account + free (M0) cluster.
2. **Database Access** → add a database user with a username and password.
3. **Network Access** → add your current IP address (or `0.0.0.0/0` while
   developing, and lock it down before sharing the project).
4. **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
5. Paste it into `backend/.env` as `MONGODB_URI`, replacing `<username>`,
   `<password>`, and adding a database name, e.g. `/ludo` before the `?`:
   ```
   MONGODB_URI=mongodb+srv://alice:mypassword@cluster0.abcde.mongodb.net/ludo?retryWrites=true&w=majority
   ```
6. Restart the backend (`npm run dev`). You should see
   `[db] Connected to MongoDB` in the terminal.

If `MONGODB_URI` is missing or the connection fails, the server logs a
warning and keeps running — guest play and live gameplay are unaffected,
only `/api/auth/register` and `/api/auth/login` will return a friendly
"unavailable" error until it's configured.

## Game rules implemented

- 2–4 players, standard 52-square shared track + 6-square private home
  stretch per color.
- Roll a 6 to leave the yard; six also grants an extra roll.
- Landing on an opponent's token sends it back to the yard, unless it's on
  a safe square (marked with a ★ on the board — the four start squares plus
  four star squares).
- Capturing a token or reaching home also grants an extra roll.
- Three sixes in a row forfeits the turn.
- First player to get all four tokens home wins, and the match ends
  immediately.

## What's deliberately out of scope for this build

These are natural follow-ups if you want to extend the project further:

- Spectator mode
- An AI/bot opponent for solo practice
- Tournament brackets / ranked matchmaking
- Full reconnection UI (the server keeps a room alive for 2 minutes after a
  disconnect so a refresh can rejoin, but the client doesn't yet auto-retry
  the reconnect on load)

## Deploying

- **Backend**: any Node host works (Render, Railway, Fly.io, a VPS). Set
  `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN` (your deployed frontend's
  URL) as environment variables.
- **Frontend**: `npm run build` produces a static `dist/` folder — deploy it
  to Vercel, Netlify, or any static host. Set `VITE_SERVER_URL` to your
  deployed backend's URL at build time.
