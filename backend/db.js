const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'office_timer.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    duration_minutes REAL
  );

  CREATE TABLE IF NOT EXISTS active_timer (
    username TEXT PRIMARY KEY,
    start_time TEXT NOT NULL
  );
`);

const stmts = {
  getActiveTimer: db.prepare('SELECT start_time FROM active_timer WHERE username = ?'),
  setActiveTimer: db.prepare(
    'INSERT INTO active_timer (username, start_time) VALUES (?, ?) ON CONFLICT(username) DO UPDATE SET start_time = excluded.start_time'
  ),
  clearActiveTimer: db.prepare('DELETE FROM active_timer WHERE username = ?'),
  insertSession: db.prepare(
    'INSERT INTO sessions (username, start_time, end_time, duration_minutes) VALUES (?, ?, ?, ?)'
  ),
  getSessionsByUser: db.prepare(
    'SELECT * FROM sessions WHERE username = ? ORDER BY start_time DESC'
  ),
  getSessionsForEmployee: db.prepare(
    "SELECT * FROM sessions WHERE username = 'arul' ORDER BY start_time DESC"
  ),
  getAllSessions: db.prepare('SELECT * FROM sessions ORDER BY start_time DESC'),
};

module.exports = { db, stmts };
