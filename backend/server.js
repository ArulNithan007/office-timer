const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { stmts } = require('./db');

const app = express();
app.set('trust proxy', 1);
const PORT = 3001;

const USERS = {
  arul: { password: 'arul123', role: 'employee' },
  venky: { password: 'venky123', role: 'manager' },
};

app.use(
  cors({
    origin: ["http://localhost:5173", "https://office-timer.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: 'office-timer-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'none',
      secure: true,
    },
  })
);

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

function requireEmployee(req, res, next) {
  if (req.session.user?.role !== 'employee') {
    return res.status(403).json({ error: 'Employees only' });
  }
  next();
}

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const key = (username || '').toLowerCase().trim();
  const user = USERS[key];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  req.session.user = { username: key, role: user.role };
  res.json({ username: key, role: user.role });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

app.get('/api/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.session.user);
});

app.get('/api/timer/status', requireAuth, requireEmployee, (req, res) => {
  const { username } = req.session.user;
  const row = stmts.getActiveTimer.get(username);

  if (!row) {
    return res.json({ running: false, startTime: null });
  }

  res.json({ running: true, startTime: row.start_time });
});

app.post('/api/timer/start', requireAuth, requireEmployee, (req, res) => {
  const { username } = req.session.user;
  const existing = stmts.getActiveTimer.get(username);

  if (existing) {
    return res.status(400).json({ error: 'Timer is already running' });
  }

  const startTime = new Date().toISOString();
  stmts.setActiveTimer.run(username, startTime);
  res.json({ running: true, startTime });
});

app.post('/api/timer/stop', requireAuth, requireEmployee, (req, res) => {
  const { username } = req.session.user;
  const row = stmts.getActiveTimer.get(username);

  if (!row) {
    return res.status(400).json({ error: 'No active timer' });
  }

  const start = new Date(row.start_time);
  const end = new Date();
  const durationMinutes = (end - start) / 60000;

  stmts.insertSession.run(
    username,
    row.start_time,
    end.toISOString(),
    durationMinutes
  );
  stmts.clearActiveTimer.run(username);

  res.json({
    running: false,
    startTime: row.start_time,
    endTime: end.toISOString(),
    durationMinutes,
  });
});

app.get('/api/sessions', requireAuth, (req, res) => {
  const { username, role } = req.session.user;
  let rows;

  if (role === 'manager') {
    rows = stmts.getSessionsForEmployee.all();
  } else {
    rows = stmts.getSessionsByUser.all(username);
  }

  res.json(rows);
});

const server = app.listen(PORT, () => {
  console.log(`Office Timer API running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\nPort ${PORT} is already in use.`);
    console.error('Another copy of the server is probably still running.');
    console.error('\nFix (Windows PowerShell):');
    console.error('  netstat -ano | findstr :3001');
    console.error('  taskkill /PID <number_from_last_column> /F');
    console.error('\nThen run: node server.js\n');
  } else {
    console.error(err);
  }
  process.exit(1);
});
