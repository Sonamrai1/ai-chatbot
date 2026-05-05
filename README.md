# 🤖 AI Chatbot — Gemini + Node.js + MySQL

A full-stack AI chatbot powered by Google Gemini 2.0 Flash, with chat history stored in MySQL.

---

## 📁 Project Structure

```
chatbot_project/
├── backend/
│   ├── server.js              ← Express server (also serves frontend)
│   ├── db.js                  ← MySQL connection
│   ├── routes/chat.js         ← API routes
│   ├── controllers/chatController.js
│   ├── .env                   ← Your secrets (create from .env.example)
│   └── package.json
├── public/                    ← Frontend (served by backend)
│   ├── index.html
│   ├── script.js
│   └── style.css
└── database/
    └── init.sql               ← Run this once to set up DB
```

---

## ⚙️ Local Setup

### 1. Clone / unzip the project

### 2. Setup MySQL database
Open MySQL and run:
```sql
source /path/to/chatbot_project/database/init.sql
```
Or paste the contents of `database/init.sql` into phpMyAdmin / MySQL Workbench.

### 3. Configure environment
```bash
cd backend
cp .env.example .env
```
Edit `.env` and add your values:
```
GEMINI_API_KEY=your_key_here   ← Get from https://aistudio.google.com/app/apikey
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=chatbot_db
PORT=5000
```

### 4. Install dependencies & run
```bash
cd backend
npm install
npm start
```

### 5. Open in browser
```
http://localhost:5000
```

---

## 🚀 Live Deployment (Railway — Free)

Railway provides free Node.js hosting with a MySQL database.

### Step 1 — Sign up
Go to [railway.app](https://railway.app) and sign up with GitHub.

### Step 2 — Create a new project
- Click **"New Project"** → **"Deploy from GitHub repo"**
- Connect your GitHub and push this project

### Step 3 — Add MySQL
- In your Railway project → click **"+ New"** → **"Database"** → **"MySQL"**
- Railway will give you connection variables automatically

### Step 4 — Set environment variables
In Railway project settings → **Variables**, add:
```
GEMINI_API_KEY = your_gemini_key
DB_HOST        = ${{MySQL.MYSQL_HOST}}
DB_USER        = ${{MySQL.MYSQL_USER}}
DB_PASSWORD    = ${{MySQL.MYSQL_PASSWORD}}
DB_NAME        = ${{MySQL.MYSQL_DATABASE}}
PORT           = 5000
```

### Step 5 — Set root directory
In Railway → Settings → **Root Directory**: set to `backend`

### Step 6 — Initialize the DB
In Railway MySQL → click **"Connect"** → run the contents of `database/init.sql`

### Step 7 — Deploy!
Push to GitHub → Railway auto-deploys. Your chatbot goes live! 🎉

---

## 🌟 Features
- ✅ Multi-turn conversation (Gemini remembers context)
- ✅ Chat history saved in MySQL
- ✅ Multiple chat sessions (sidebar)
- ✅ Markdown rendering for AI responses
- ✅ Typing indicator
- ✅ Suggestion chips on welcome screen
- ✅ Responsive design (mobile-friendly)
- ✅ Auto-resize text input

---

## 🔑 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/chat/session` | Create new chat session |
| GET | `/api/chat/sessions` | Get all sessions (sidebar) |
| POST | `/api/chat/message` | Send message, get AI reply |
| GET | `/api/chat/history/:id` | Get message history |

---

## ⚠️ Security Notes
- Never commit your `.env` file to GitHub
- Add `.env` to your `.gitignore`
- Your Gemini API key in the original `.env` was exposed — generate a new one at [aistudio.google.com](https://aistudio.google.com/app/apikey)
