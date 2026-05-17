import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import {
  elapsedFromStart,
  formatClock,
  formatDate,
  formatDuration,
  formatTime,
  formatToday,
} from './timeUtils';

export default function EmployeeDashboard({ user, onLogout }) {
  const [now, setNow] = useState(() => new Date());
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [status, sessionList] = await Promise.all([
        api.timerStatus(),
        api.sessions(),
      ]);
      setRunning(status.running);
      setStartTime(status.startTime);
      setSessions(sessionList);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleStart = async () => {
    setActionLoading(true);
    setError('');
    try {
      const result = await api.timerStart();
      setRunning(result.running);
      setStartTime(result.startTime);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStop = async () => {
    setActionLoading(true);
    setError('');
    try {
      await api.timerStop();
      setRunning(false);
      setStartTime(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="app-header">
        <h1>Office Timer</h1>
        <div className="header-right">
          <span className="user-badge">Arul · Employee</span>
          <button type="button" className="btn btn-ghost" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="timer-panel">
          <p className="today-label">{formatToday(now)}</p>
          <p className="live-clock">{formatClock(now)}</p>

          {running && startTime && (
            <div className="elapsed-box running">
              <span className="status-dot running" />
              <span>Timer running</span>
              <strong className="elapsed-time">{elapsedFromStart(startTime)}</strong>
            </div>
          )}

          {!running && (
            <div className="elapsed-box stopped">
              <span className="status-dot stopped" />
              <span>Timer stopped</span>
            </div>
          )}

          {error && <p className="error-msg">{error}</p>}

          <div className="timer-actions">
            <button
              type="button"
              className="btn btn-start"
              onClick={handleStart}
              disabled={running || actionLoading || loading}
            >
              Start
            </button>
            <button
              type="button"
              className="btn btn-stop"
              onClick={handleStop}
              disabled={!running || actionLoading || loading}
            >
              Stop
            </button>
          </div>
        </section>

        <section className="sessions-panel">
          <h2>Your sessions</h2>
          {loading ? (
            <p className="muted">Loading sessions…</p>
          ) : sessions.length === 0 ? (
            <p className="muted">No sessions recorded yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id}>
                      <td>{formatDate(s.start_time)}</td>
                      <td>{formatTime(s.start_time)}</td>
                      <td>{formatTime(s.end_time)}</td>
                      <td>{formatDuration(s.duration_minutes)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
