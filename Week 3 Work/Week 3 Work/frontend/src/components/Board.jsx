import React from 'react';
import {
  BOARD_SIZE,
  RING_POINTS,
  SAFE_RING_INDEXES,
  HOME_COLUMNS,
  YARD_SLOTS,
  YARD_BOUNDS,
  YARD_SIZE,
  COLOR_ORDER,
  tokenPosition,
} from './boardGeometry.js';

const FILL = {
  red: '#e0483e',
  green: '#3fae5a',
  yellow: '#f4b53e',
  blue: '#3f7dd9',
};

export default function Board({ tokens, myColor, currentColor, legalMoves, onMoveToken }) {
  const isMyTurn = myColor === currentColor;

  return (
    <svg
      viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}
      className="w-full max-w-[560px] mx-auto select-none"
      role="img"
      aria-label="Ludo board"
    >
      <rect width={BOARD_SIZE} height={BOARD_SIZE} rx="18" fill="#f3ecd8" />

      {/* Yards */}
      {COLOR_ORDER.map((color) => (
        <g key={color}>
          <rect
            x={YARD_BOUNDS[color].x + 10}
            y={YARD_BOUNDS[color].y + 10}
            width={YARD_SIZE - 20}
            height={YARD_SIZE - 20}
            rx="16"
            fill={FILL[color]}
            fillOpacity="0.18"
            stroke={FILL[color]}
            strokeWidth="3"
          />
        </g>
      ))}

      {/* Center hub */}
      <g>
        <polygon points="300,220 380,300 300,380 220,300" fill="#f3ecd8" stroke="#33397a" strokeWidth="2" />
        <polygon points="300,300 380,300 300,220" fill={FILL.green} fillOpacity="0.85" />
        <polygon points="300,300 380,300 300,380" fill={FILL.yellow} fillOpacity="0.85" />
        <polygon points="300,300 220,300 300,380" fill={FILL.blue} fillOpacity="0.85" />
        <polygon points="300,300 220,300 300,220" fill={FILL.red} fillOpacity="0.85" />
      </g>

      {/* Home columns */}
      {COLOR_ORDER.map((color) =>
        HOME_COLUMNS[color].map((p, i) => (
          <rect
            key={`${color}-hc-${i}`}
            x={p.x - 13}
            y={p.y - 13}
            width="26"
            height="26"
            fill={FILL[color]}
            fillOpacity="0.5"
            stroke={FILL[color]}
            strokeWidth="1"
          />
        ))
      )}

      {/* Ring cells */}
      {RING_POINTS.map((p, i) => (
        <g key={`ring-${i}`}>
          <rect
            x={p.x - 13}
            y={p.y - 13}
            width="26"
            height="26"
            fill="#ffffff"
            stroke="#33397a"
            strokeWidth="1"
          />
          {SAFE_RING_INDEXES.includes(i) && (
            <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="14" fill="#33397a" opacity="0.5">
              ★
            </text>
          )}
        </g>
      ))}

      {/* Tokens */}
      {COLOR_ORDER.map((color) =>
        tokens[color].map((token, idx) => {
          const canMove = isMyTurn && color === myColor && legalMoves.includes(idx);
          const pos = token.steps === 0 ? YARD_SLOTS[color][idx] : tokenPosition(color, token.steps);
          if (!pos) return null;
          return (
            <g
              key={`${color}-${idx}`}
              transform={`translate(${pos.x}, ${pos.y})`}
              onClick={() => canMove && onMoveToken(idx)}
              style={{ cursor: canMove ? 'pointer' : 'default' }}
            >
              {canMove && <circle r="14" fill="none" stroke={FILL[color]} strokeWidth="2" strokeDasharray="3 2">
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3s" repeatCount="indefinite" />
              </circle>}
              <circle r="10" fill={FILL[color]} stroke="#161a3a" strokeWidth="1.5" />
              <circle r="4" fill="#ffffff" fillOpacity="0.85" />
            </g>
          );
        })
      )}
    </svg>
  );
}
