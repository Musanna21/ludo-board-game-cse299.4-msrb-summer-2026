import React, { useState } from 'react';

const COLOR_DOT = {
  red: 'bg-ludo-red',
  green: 'bg-ludo-green',
  yellow: 'bg-ludo-yellow',
  blue: 'bg-ludo-blue',
};

export function PlayerPanel({ players, currentColor }) {
  return (
    <ul className="space-y-2">
      {players.map((p) => (
        <li
          key={p.id}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${
            p.color === currentColor ? 'border-ludo-yellow bg-board-cream/5' : 'border-board-line'
          }`}
        >
          <span className={`w-3 h-3 rounded-full ${COLOR_DOT[p.color]}`} />
          <span className="flex-1 text-sm font-medium">{p.name}</span>
          {!p.connected && <span className="text-xs text-board-cream/40">offline</span>}
          {p.color === currentColor && <span className="text-xs text-ludo-yellow">turn</span>}
        </li>
      ))}
    </ul>
  );
}

export function ChatPanel({ messages, onSend }) {
  const [text, setText] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  }

  return (
    <div className="flex flex-col h-56 bg-board-bg rounded-lg border border-board-line">
      <div className="flex-1 overflow-y-auto p-2 space-y-1 text-sm">
        {messages.length === 0 && <p className="text-board-cream/30 text-xs px-1">No messages yet.</p>}
        {messages.map((m, i) => (
          <p key={i}>
            <span className="font-semibold">{m.from}:</span> <span className="text-board-cream/80">{m.text}</span>
          </p>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex border-t border-board-line">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Say something…"
          maxLength={200}
          className="flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-board-cream/30 outline-none"
        />
        <button type="submit" className="px-3 text-sm text-ludo-yellow font-semibold">
          Send
        </button>
      </form>
    </div>
  );
}
