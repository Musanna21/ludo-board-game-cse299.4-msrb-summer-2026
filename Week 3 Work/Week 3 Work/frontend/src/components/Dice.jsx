import React, { useEffect, useState } from 'react';

const PIP_LAYOUTS = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

export default function Dice({ value, rolling, disabled, onRoll }) {
  const [displayValue, setDisplayValue] = useState(value || 1);

  useEffect(() => {
    if (!rolling) {
      if (value) setDisplayValue(value);
      return;
    }
    const interval = setInterval(() => {
      setDisplayValue(1 + Math.floor(Math.random() * 6));
    }, 80);
    return () => clearInterval(interval);
  }, [rolling, value]);

  const pips = PIP_LAYOUTS[displayValue] || PIP_LAYOUTS[1];

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onRoll}
        disabled={disabled || rolling}
        aria-label="Roll the dice"
        className="w-16 h-16 bg-board-cream rounded-xl shadow-panel relative disabled:opacity-40 transition-transform active:scale-95"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {pips.map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="7" fill="#161a3a" />
          ))}
        </svg>
      </button>
      <span className="text-xs text-board-cream/60">
        {disabled ? 'Waiting for your turn' : rolling ? 'Rolling…' : 'Tap to roll'}
      </span>
    </div>
  );
}
