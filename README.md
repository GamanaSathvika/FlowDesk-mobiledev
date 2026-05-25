# FlowDesk

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

> **Full Stack Productivity & Task Management App**

Smart productivity and task management application designed to help users organize work, stay focused, and track progress.

FlowDesk delivers task planning, Pomodoro focus sessions, analytics, and profile settings in one mobile experience—powered by **React Native (Expo)** on the client and a **Node.js / Express** REST API with **MongoDB**.

---

## Features

### Task Management

- Create tasks
- Edit tasks
- Delete tasks
- Archive completed tasks
- Auto archive cleanup (7 days)
- Task priorities (High / Medium / Low)
- Tags
- Search tasks
- Due date support

### Focus

- Pomodoro focus timer
- Session tracking

### Analytics

- Productivity statistics
- Completion tracking
- Historical analytics
- Progress monitoring

### UI

- Dark mode
- Responsive UI
- Modern design system

### Settings

- Profile management
- Theme persistence

---

## Tech Stack

| Frontend | Backend | Database | Tools |
| --- | --- | --- | --- |
| React Native | Node.js | MongoDB | REST APIs |
| Expo | Express.js | Mongoose | AsyncStorage |
| Axios | JWT Authentication | — | Theme Provider |
| React Native SVG | bcryptjs, CORS | — | Dark Mode System |

---

## Architecture

```text
React Native Frontend
         │
         ▼
      REST APIs
         │
         ▼
   Express Backend
         │
         ▼
       MongoDB
```

| Route | Description |
| --- | --- |
| `/api/auth` | User registration and login |
| `/api/tasks` | Task CRUD, archive, and search |
| `/api/focus` | Focus session tracking |
| `/api/analytics` | Productivity metrics |
| `/api/users` | Profile and settings |

---

## Folder Structure

```text
FlowDesk/
├── frontend/
│   ├── api/
│   ├── screens/
│   ├── components/
│   ├── theme/
│   └── utils/
│
└── backend/
    ├── models/
    ├── routes/
    ├── controllers/
    ├── middleware/
    ├── jobs/
    └── utils/
```

---

## Installation

### Prerequisites

- Node.js (v18+)
- MongoDB (local instance or MongoDB Atlas)
- Expo Go or an emulator/simulator

### Clone repository

```bash
git clone https://github.com/GamanaSathvika/FlowDesk-mobiledev.git
cd FlowDesk
```

### Backend

```bash
cd backend
npm install
```

Create `backend/.env` using the [environment variables](#environment-variables) below, then run:

```bash
npm run dev
```

Server default: `http://localhost:4000`

### Frontend

In a separate terminal:

```bash
cd frontend
npm install
npx expo start
```

Use Expo Go to scan the QR code, or run on iOS/Android simulator.

> Update the API base URL in `frontend/api/client.js` when testing on a physical device (use your LAN IP or tunnel URL).

---

## Environment Variables

Create `backend/.env`:

```env
MONGO_URI=
JWT_SECRET=
PORT=
```

| Variable | Description |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT token signing |
| `PORT` | Express server port (default: `4000`) |

Example:

```env
MONGO_URI=mongodb://127.0.0.1:27017/flowdesk
JWT_SECRET=your_secure_secret
PORT=4000
```

Do not commit production secrets to version control.

---

## Future Improvements

- Notifications
- Calendar integration
- AI productivity suggestions
- Cloud sync

---

## Contributors

- R Gamana Sathvika
- Priya KC
- Ruchitha B
- Bhoomika

---

Built with focus on productivity, consistency, and modern user experience.
