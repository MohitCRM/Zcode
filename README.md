# Zcode - Competitive Programming Platform

**Live Demo:** [https://zcode-five.vercel.app/](https://zcode-five.vercel.app/)

Zcode is a full-stack, secure, and competitive programming platform with isolated code execution, a dynamic seasonal structure, Elo-based ranking, and seamless video solutions. Designed for both authenticated users and guests, Zcode provides a competitive and educational environment for tackling algorithmic challenges.

## 🌟 Key Features

### 🏆 Seasonal Structure & Progressive Unlocking
- Features a live **Seasonal Calendar** structure (`OffSeason`, `Round1`, `Round2`, etc.) with automatic progression.
- Problems unlock incrementally day-by-day based on the season's launch date.
- Guest mode allows users to test the platform in a sandbox without affecting global leaderboards.

### ⚡ Secure Isolated Code Execution
- Integrates with **E2B SDK** for ultra-secure, containerized sandboxes to safely compile and run user-submitted code in multiple languages (like C++).
- Real-time compilation and execution feedback, complete with test cases, expected outputs, execution constraints (Time/Memory Limits), and stderr logs.
- Automatic traffic management for maximum concurrent sandbox capacity limits.

### 📈 Dynamic Ranking (Elo System)
- Implements a competitive Elo rating system for submissions.
- Users gain rating based on problem base rewards (and bonuses for same-day solves) and lose rating via penalties for wrong answers, time limit exceedances, or compilation errors.

### 🎥 Integrated Video Solutions
- Admins can upload video solutions directly to the platform for specific problems.
- Media handling is securely integrated with **Cloudinary** for scalable, fast delivery.

### 🛡️ Authentication & Role Management
- Secure JWT-based authentication using HTTP-only cookies.
- Role-based access control (`user`, `guest`, `admin`), enabling specific administrative dashboard views for managing problems and seasons.

## 🛠️ Technology Stack & Libraries

### Frontend (Vite + React)
The frontend is built for extreme performance, utilizing modern layout patterns (CSS Grid/Flexbox), glassmorphism UI accents, and state-of-the-art form validations.
- **Framework:** React (`react`, `react-dom`), Vite (`vite`)
- **Routing:** React Router (`react-router`, `react-router-dom`)
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Styling:** Tailwind CSS (`tailwindcss`, `@tailwindcss/vite`) with DaisyUI (`daisyui`)
- **Code Editor:** Monaco Editor (`@monaco-editor/react`) for the in-browser IDE experience.
- **Form Handling & Validation:** React Hook Form (`react-hook-form`) combined with Zod (`zod`, `@hookform/resolvers`).
- **Icons & Utilities:** Lucide React (`lucide-react`) for icons, Date-fns (`date-fns`) for time formatting.
- **Network Requests:** Axios (`axios`)

### Backend (Node.js + Express)
The backend is a robust REST API handling heavy computations, sandboxing, session caching, and database transactions.
- **Framework:** Express.js (`express`)
- **Database (NoSQL):** MongoDB managed with Mongoose (`mongoose`)
- **Caching & Quick Storage:** Redis (`redis`) for in-memory session/data optimizations.
- **Isolated Execution:** E2B SDK (`e2b`) for spawning secure code execution sandboxes.
- **Media Uploads:** Cloudinary SDK (`cloudinary`) for handling video uploads.
- **Security & Auth:** JSON Web Tokens (`jsonwebtoken`) for stateless auth, Bcrypt (`bcrypt`) for password hashing, Cookie Parser (`cookie-parser`), Cors (`cors`), and Validator (`validator`).
- **AI Integrations:** Google GenAI SDK (`@google/genai`) for potential AI-assisted features.
- **Environment & Testing:** Dotenv (`dotenv`), Sinon (`sinon`) for mocking dates/time logic, and Nodemon (`nodemon`) for development.

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed, as well as access to a MongoDB cluster (like MongoDB Atlas), a Cloudinary account, and an E2B API Key.

### 1. Clone the repository & Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend/vite
npm install
```

### 2. Configure Environment Variables
You will need to create `.env` files in both the `backend` and `frontend/vite` directories. 

**Backend (`backend/.env`):**
```env
PORT=8000
MONGODB_URL=mongodb+srv://<username>:<password>@cluster...
JWT_KEY=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
E2B_API_KEY=your_e2b_api_key
```

**Frontend (`frontend/vite/.env`):**
```env
VITE_BACKEND_URL=http://localhost:8000
```

### 3. Run the Development Servers

Start the backend (runs on port 8000 by default):
```bash
cd backend
npm run dev
```

Start the frontend Vite server:
```bash
cd frontend/vite
npm run dev
```

Open your browser to the URL provided by Vite (usually `http://localhost:5173`) to see the application!

## 📂 Project Architecture highlights
- **`/backend/src/models`**: Contains Mongoose schemas for `User`, `Problem`, `Season`, `Submission`, and `SolutionVideo`.
- **`/backend/src/controllers`**: Core business logic. Heavy-lifters include `usersubmission.js` (E2B sandbox runner) and `userproblem.js` (problem fetching/locking).
- **`/backend/src/middleware`**: Includes `phaseguard.js` to ensure operations match the current active competitive phase and `adminmiddleware.js` to secure routes.
- **`/frontend/vite/src/pages`**: Organizes all the main React views (Authentication, Dashboards, Problems, Admin Controls).
- **`/frontend/vite/src/slicers`**: Redux slices handling global auth state, user themes, and active season context.

---
*Built with modern tooling and scalability in mind for an unparalleled competitive programming experience.*
