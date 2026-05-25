# FlowDesk

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

**Smart productivity and task management application designed to help users organize work, stay focused, and track progress.**

FlowDesk is a full-stack mobile productivity app that combines task management, Pomodoro focus sessions, analytics, and a polished dark-mode UI—built with React Native (Expo) and a Node.js REST API backed by MongoDB.

---

## Features

### Task Management

- Create, edit, and delete tasks
- Mark tasks complete with archive workflow
- Auto archive cleanup (7-day retention)
- Priorities: **High**, **Medium**, **Low**
- Category tags (College, Personal, Work, and custom)
- Search and filter tasks
- Due dates with smart display (today, tomorrow, overdue)

### Focus

- Pomodoro-style focus timer
- Session tracking and daily focus stats
- Integrated with dashboard progress

### Analytics

- Productivity statistics and completion tracking
- Historical analytics persistence
- Progress monitoring and insights

### UI

- Dark mode and light mode
- Theme Provider with AsyncStorage persistence
- Responsive, card-based design system
- Modern bottom navigation and screen polish

### Settings

- Profile management (name, email, phone, bio, organization)
- Theme preference saved locally and synced with profile
- App preferences and account controls

---

## Screenshots

> Add your screenshots under `docs/screenshots/` and replace the placeholders below.

| Dashboard | Tasks |
|:---:|:---:|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Tasks](docs/screenshots/tasks.png) |

| Focus | Analytics |
|:---:|:---:|
| ![Focus](docs/screenshots/focus.png) | ![Analytics](docs/screenshots/analytics.png) |

| Dark Mode |
|:---:|
| ![Dark Mode](docs/screenshots/dark-mode.png) |

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React Native, Expo, AsyncStorage, Axios, React Native SVG |
| **Backend** | Node.js, Express.js, JWT, bcryptjs, CORS |
| **Database** | MongoDB, Mongoose |
| **Tools** | REST APIs, Theme Provider, dotenv, Expo Vector Icons |

---

## Architecture

```text
React Native Frontend (Expo)
            │
            ▼
       REST APIs (JWT)
            │
            ▼
   Express.js Backend
            │
            ▼
         MongoDB
```

**API overview**

| Endpoint prefix | Purpose |
| --- | --- |
| `/api/auth` | Register, login, JWT tokens |
| `/api/tasks` | Task CRUD, archive, search |
| `/api/focus` | Focus session tracking |
| `/api/analytics` | Productivity metrics |
| `/api/users` | Profile and settings |

---

## Folder Structure

```text
FlowDesk/
├── frontend/
│   ├── api/                 # API clients (auth, tasks, user, analytics)
│   ├── components/          # Reusable UI (BottomTabBar, InputField, …)
│   ├── screens/
│   │   ├── main/            # Home, Tasks, Focus, Analytics, Settings
│   │   └── LoginScreen.js
│   ├── theme/               # Light/dark themes, ThemeProvider, screen styles
│   ├── utils/               # taskForm, dateHelpers
│   └── App.js
│
└── backend/
    ├── controllers/         # User, analytics logic
    ├── jobs/                # Archive cleanup scheduler
    ├── middleware/          # JWT auth
    ├── models/              # Task, User, Analytics, FocusSession
    ├── routes/              # auth, tasks, focus, analytics, user
    ├── utils/               # analyticsStore, archiveRetention
    └── server.js
```

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Expo CLI](https://docs.expo.dev/) / Expo Go on a device or emulator

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/FlowDesk.git
cd FlowDesk
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (see [Environment Variables](#environment-variables)), then start the server:

```bash
npm run dev
```

The API runs at `http://localhost:4000` by default.

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npx expo start
```

Scan the QR code with **Expo Go** (Android/iOS) or press `i` / `a` for simulators.

> **Note:** Update the API base URL in `frontend/api/client.js` (and related API modules) to match your machine IP or tunnel URL when testing on a physical device.

---

## Environment Variables

Create `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/flowdesk
JWT_SECRET=your_jwt_secret_here
PORT=4000
```

| Variable | Description |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing authentication tokens |
| `PORT` | Express server port (default: `4000`) |

Never commit real secrets to version control.

---

## Future Improvements

- Push notifications and reminders
- Calendar integration
- AI-powered productivity suggestions
- Multi-device cloud sync

---

## Contributors

**Gamana Sathvika**

---

Built with focus on productivity, consistency, and modern user experience.
