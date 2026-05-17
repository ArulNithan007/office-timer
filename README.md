# Office Timer

A simple work hour tracker for two users: **Arul** (employee) logs work sessions with a start/stop timer, and **Venky** (manager) views all of Arul's recorded sessions.

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: SQLite (`better-sqlite3`)
- **Auth**: Session-based login with hardcoded credentials

## Credentials


| User  | Username | Password   | Role     |
| ----- | -------- | ---------- | -------- |
| Arul  | `arul`   | `arul123`  | Employee |
| Venky | `venky`  | `venky123` | Manager  |


## How to Run

### Backend

```bash
cd backend
npm install
node server.js
```

Runs on [http://localhost:3001](http://localhost:3001)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on [http://localhost:5173](http://localhost:5173)

Open [http://localhost:5173](http://localhost:5173) in your browser. Start the backend before the frontend.

## Features

- **Employee (Arul)**: Start/stop work timer, live elapsed time, session history
- **Manager (Venky)**: View all of Arul's sessions, filter by date, total hours summary
- Timer state persists in SQLite (survives page refresh)
- Durations displayed as `2h 35m`

## Project Structure

```
office_timer/
├── backend/
│   ├── server.js
│   ├── db.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Login.jsx
│   │   ├── EmployeeDashboard.jsx
│   │   ├── ManagerDashboard.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

