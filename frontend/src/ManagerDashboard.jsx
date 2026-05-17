import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import {
  formatDate,
  formatDuration,
  formatTime,
  sessionDateKey,
  totalMinutes,
} from './timeUtils';

export default function ManagerDashboard({ user, onLogout }) {
  const [sessions, setSessions] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSessions = useCallback(async () => {
    try {
      const data = await api.sessions();
      setSessions(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const filtered = filterDate
    ? sessions.filter((s) => sessionDateKey(s.start_time) === filterDate)
    : sessions;

  const total = totalMinutes(filtered);

  return (
    <div className="dashboard">
      <header className="app-header">
        <h1>Office Timer</h1>
        <div className="header-right">
          <span className="user-badge">Venky · Manager</span>
          <button type="button" className="btn btn-ghost" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main manager-main">
        <section className="sessions-panel full-width">
          <div className="panel-header">
            <h2>Arul&apos;s work sessions</h2>
            <label className="filter-label">
              Filter by date
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
              {filterDate && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setFilterDate('')}
                >
                  Clear
                </button>
              )}
            </label>
          </div>

          {error && <p className="error-msg">{error}</p>}

          {loading ? (
            <p className="muted">Loading sessions…</p>
          ) : filtered.length === 0 ? (
            <p className="muted">
              {filterDate ? 'No sessions on this date.' : 'No sessions recorded yet.'}
            </p>
          ) : (
            <>
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
                    {filtered.map((s) => (
                      <tr key={s.id}>
                        <td>{formatDate(s.start_time)}</td>
                        <td>{formatTime(s.start_time)}</td>
                        <td>{formatTime(s.end_time)}</td>
                        <td>{formatDuration(s.duration_minutes)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="total-label">
                        Total Hours
                      </td>
                      <td className="total-value">{formatDuration(total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
