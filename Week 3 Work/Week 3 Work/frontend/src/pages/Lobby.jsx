import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../socket.js';

const COLOR_DOT = {
  red: 'bg-ludo-red',
  green: 'bg-ludo-green',
  yellow: 'bg-ludo-yellow',
  blue: 'bg-ludo-blue',
};

export default function Lobby({ session, onLogout }) {
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function handleRoomUpdate(updatedRoom) {
      setRoom((prev) => (prev && prev.code === updatedRoom.code ? updatedRoom : prev));
    }
    function handleGameStarted(updatedRoom) {
      navigate(`/game/${updatedRoom.code}`);
    }

    socket.on('room-update', handleRoomUpdate);
    socket.on('game-started', handleGameStarted);
    return () => {
      socket.off('room-update', handleRoomUpdate);
      socket.off('game-started', handleGameStarted);
    };
  }, [navigate]);

  const createRoom = useCallback((isPrivate) => {
    setError('');
    setBusy(true);
    const socket = getSocket();
    socket.emit('create-room', { isPrivate }, (res) => {
      setBusy(false);
      if (res.ok) setRoom(res.room);
      else setError(res.error);
    });
  }, []);

  const joinRoom = useCallback(
    (e) => {
      e.preventDefault();
      setError('');
      setBusy(true);
      const socket = getSocket();
      socket.emit('join-room', { code: joinCode.trim() }, (res) => {
        setBusy(false);
        if (res.ok) setRoom(res.room);
        else setError(res.error);
      });
    },
    [joinCode]
  );

  const startGame = useCallback(() => {
    setError('');
    const socket = getSocket();
    socket.emit('start-game', {}, (res) => {
      if (!res.ok) setError(res.error);
    });
  }, []);

  const isHost = room?.players.find((p) => p.id === session.user.id)?.isHost;

  if (room) {
    return (
      <div className="w-full max-w-md bg-board-panel rounded-2xl shadow-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-board-cream/60 text-xs uppercase tracking-wide">Room code</p>
            <p className="font-display text-3xl font-bold tracking-widest">{room.code}</p>
          </div>
          <button
            className="text-sm text-board-cream/60 hover:text-board-cream underline"
            onClick={() => setRoom(null)}
          >
            Leave
          </button>
        </div>

        <ul className="space-y-2 mb-6">
          {room.players.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 bg-board-bg rounded-lg px-3 py-2 border border-board-line"
            >
              <span className={`w-3 h-3 rounded-full ${COLOR_DOT[p.color]}`} />
              <span className="flex-1 font-medium">{p.name}</span>
              {p.isHost && <span className="text-xs text-ludo-yellow">Host</span>}
              {!p.connected && <span className="text-xs text-board-cream/40">offline</span>}
            </li>
          ))}
          {Array.from({ length: Math.max(0, 4 - room.players.length) }).map((_, i) => (
            <li
              key={`empty-${i}`}
              className="flex items-center gap-3 bg-board-bg/40 rounded-lg px-3 py-2 border border-dashed border-board-line/60 text-board-cream/30"
            >
              Waiting for a player…
            </li>
          ))}
        </ul>

        {isHost ? (
          <button
            onClick={startGame}
            disabled={room.players.length < 2}
            className="w-full rounded-lg bg-ludo-green text-board-bg font-display font-bold py-2.5 disabled:opacity-40 hover:brightness-105 transition"
          >
            {room.players.length < 2 ? 'Need at least 2 players' : 'Start game'}
          </button>
        ) : (
          <p className="text-center text-board-cream/60 text-sm">Waiting for the host to start…</p>
        )}

        {error && <p className="mt-3 text-sm text-ludo-red">{error}</p>}
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="bg-board-panel rounded-2xl shadow-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-body text-sm text-board-cream/70">
            Signed in as <span className="font-semibold text-board-cream">{session.user.username}</span>
          </p>
          <button className="text-xs text-board-cream/50 hover:text-board-cream underline" onClick={onLogout}>
            Log out
          </button>
        </div>

        <div className="space-y-3">
          <button
            disabled={busy}
            onClick={() => createRoom(false)}
            className="w-full rounded-lg bg-ludo-yellow text-board-bg font-display font-bold py-2.5 hover:brightness-105 disabled:opacity-50 transition"
          >
            Create a room
          </button>

          <form onSubmit={joinRoom} className="flex gap-2">
            <input
              className="flex-1 rounded-lg bg-board-bg border border-board-line px-3 py-2 text-board-cream tracking-widest placeholder:tracking-normal placeholder:text-board-cream/30"
              placeholder="Room code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              maxLength={6}
            />
            <button
              type="submit"
              disabled={busy || joinCode.trim().length !== 6}
              className="rounded-lg bg-board-bg border border-board-line px-4 font-display font-semibold hover:border-ludo-yellow disabled:opacity-40 transition"
            >
              Join
            </button>
          </form>
        </div>

        {error && <p className="mt-3 text-sm text-ludo-red">{error}</p>}
      </div>
    </div>
  );
}
