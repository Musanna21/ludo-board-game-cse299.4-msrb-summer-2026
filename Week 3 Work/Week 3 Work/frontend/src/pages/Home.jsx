import React, { useState } from 'react';
import { registerUser, loginUser, loginGuest } from '../api.js';

const TABS = { GUEST: 'guest', LOGIN: 'login', REGISTER: 'register' };

export default function Home({ onAuthenticated }) {
  const [tab, setTab] = useState(TABS.GUEST);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleGuest(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { token, user } = await loginGuest(username);
      onAuthenticated(token, user);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start a guest session');
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { token, user } = await loginUser(username, password);
      onAuthenticated(token, user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { token, user } = await registerUser(username, password);
      onAuthenticated(token, user);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  const tabClasses = (t) =>
    `flex-1 py-2 rounded-lg font-display font-semibold text-sm transition-colors ${
      tab === t ? 'bg-board-cream text-board-bg' : 'text-board-cream/60 hover:text-board-cream'
    }`;

  return (
    <div className="w-full max-w-sm bg-board-panel rounded-2xl shadow-panel p-6">
      <div className="flex gap-2 mb-6" role="tablist">
        <button role="tab" className={tabClasses(TABS.GUEST)} onClick={() => setTab(TABS.GUEST)}>
          Guest
        </button>
        <button role="tab" className={tabClasses(TABS.LOGIN)} onClick={() => setTab(TABS.LOGIN)}>
          Log in
        </button>
        <button role="tab" className={tabClasses(TABS.REGISTER)} onClick={() => setTab(TABS.REGISTER)}>
          Sign up
        </button>
      </div>

      {tab === TABS.GUEST && (
        <form onSubmit={handleGuest} className="space-y-4">
          <p className="text-board-cream/70 text-sm">
            Jump straight into a game. Your progress won't be saved after you leave.
          </p>
          <div>
            <label htmlFor="guest-name" className="block text-sm mb-1 text-board-cream/80">
              Display name
            </label>
            <input
              id="guest-name"
              className="w-full rounded-lg bg-board-bg border border-board-line px-3 py-2 text-board-cream placeholder:text-board-cream/30"
              placeholder="e.g. Rafi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
            />
          </div>
          <SubmitButton busy={busy} label="Play as guest" />
        </form>
      )}

      {tab === TABS.LOGIN && (
        <form onSubmit={handleLogin} className="space-y-4">
          <UsernameField value={username} onChange={setUsername} />
          <PasswordField value={password} onChange={setPassword} />
          <SubmitButton busy={busy} label="Log in" />
        </form>
      )}

      {tab === TABS.REGISTER && (
        <form onSubmit={handleRegister} className="space-y-4">
          <UsernameField value={username} onChange={setUsername} />
          <PasswordField value={password} onChange={setPassword} helper="At least 6 characters" />
          <SubmitButton busy={busy} label="Create account" />
        </form>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-ludo-red bg-ludo-red/10 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}

function UsernameField({ value, onChange }) {
  return (
    <div>
      <label htmlFor="username" className="block text-sm mb-1 text-board-cream/80">
        Username
      </label>
      <input
        id="username"
        className="w-full rounded-lg bg-board-bg border border-board-line px-3 py-2 text-board-cream placeholder:text-board-cream/30"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={20}
        required
        minLength={3}
      />
    </div>
  );
}

function PasswordField({ value, onChange, helper }) {
  return (
    <div>
      <label htmlFor="password" className="block text-sm mb-1 text-board-cream/80">
        Password
      </label>
      <input
        id="password"
        type="password"
        className="w-full rounded-lg bg-board-bg border border-board-line px-3 py-2 text-board-cream placeholder:text-board-cream/30"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        minLength={6}
      />
      {helper && <p className="text-xs text-board-cream/40 mt-1">{helper}</p>}
    </div>
  );
}

function SubmitButton({ busy, label }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full rounded-lg bg-ludo-yellow text-board-bg font-display font-bold py-2.5 hover:brightness-105 disabled:opacity-50 transition"
    >
      {busy ? 'Please wait…' : label}
    </button>
  );
}
