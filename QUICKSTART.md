# TimeSplit - Quick Start Guide (v2.0)

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js v16 or higher
- MongoDB (local or MongoDB Atlas)
- Your favorite code editor

---

## 📦 Installation

### 1️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your settings
# Required variables:
# - MONGODB_URI (MongoDB connection string)
# - JWT_SECRET (any random string for production)
# - GEMINI_API_KEY (optional, for AI features)
# - FRONTEND_URL (http://localhost:5173 for development)

# Start the server
npm run dev
```

**Backend runs on:** `http://localhost:4000` (or PORT from .env)

---

### 2️⃣ Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# .env should contain:
# VITE_API_URL=http://localhost:4000/api

# Start development server
npm run dev
```

**Frontend runs on:** `http://localhost:5173`

---

## ✨ New Features in v2.0

### 1. 📤 Multi-File Upload
- Upload PDF, Word, PowerPoint, Text, CSV, JSON files
- Drag & drop support
- Batch upload (up to 10 files)
- File size up to 50MB each

**Where:** Resources page → Upload section

### 2. 🎨 Light Theme UI
- Professional light theme throughout
- Better readability and accessibility
- Modern color scheme (blue/gray/white)
- Responsive design

**Everywhere:** All pages have been redesigned

### 3. 🎯 Enhanced Icons
- 100+ professional Lucide icons
- Consistent icon usage across app
- Better visual hierarchy

**Locations:** Navigation, buttons, cards, status indicators

---

## 📚 How to Use Each Feature

### Dashboard
1. Open the app and go to Dashboard
2. See your task completion stats
3. View today's schedule
4. Check stress trends and deadlines

### Tasks
1. Click "Tasks" in sidebar
2. Create new tasks with priority
3. Set deadlines and subjects
4. Track completion status

### Schedule
1. Go to Schedule page
2. Create tasks first (if not done)
3. Click "Generate Schedule"
4. AI will create your study schedule

### Resources (NEW!)
1. Go to Resources page
2. Drag files OR click to browse
3. Select multiple files (up to 10)
4. Click "Upload" button
5. AI chatbot will use your documents for answers

### Chatbot
1. Go to AI Chatbot
2. Ask questions about your studies
3. AI uses your uploaded materials for better answers

### Stress Tracking
1. Log daily stress levels (1-10)
2. View trends over time
3. AI adjusts your schedule based on stress

---

## 🔐 Authentication

### Create Account
1. Click "Register" on login page
2. Enter name, email, password
3. Click "Sign Up"

### Login
1. Enter your email and password
2. Click "Login"
3. Redirected to Dashboard automatically

### Logout
1. Click profile avatar (top right)
2. Click "Logout"

---

## 🎮 Keyboard Shortcuts (Optional to Add)

Coming in future update:
- `Ctrl+K` - Search
- `Ctrl+/` - Command menu
- `Escape` - Close modals

---

## 🛠️ Troubleshooting

### Backend won't start?
```bash
# Make sure you're in backend folder
cd backend

# Check Node.js version
node --version  # Should be 16+

# Reinstall dependencies
npm install

# Check .env file exists and has MONGODB_URI
cat .env
```

### Frontend won't load?
```bash
# Make sure you're in frontend folder
cd frontend

# Check .env has correct API URL
cat .env

# Reinstall and start fresh
rm -rf node_modules
npm install
npm run dev
```

### Can't upload files?
1. Check backend is running: `npm run dev` in backend folder
2. Check .env in frontend has correct VITE_API_URL
3. Try uploading PDF first
4. Check browser console for errors (F12)

### Database connection issues?
```bash
# Test MongoDB URI in .env
# Format: mongodb://localhost:27017/timesplit (local)
# Or: mongodb+srv://user:pass@cluster.mongodb.net/timesplit (Atlas)

# Make sure MongoDB is running locally:
mongod  # Start MongoDB service
```

---

## 📊 API Endpoints

### Authentication
```
POST   /api/auth/register          - Create account
POST   /api/auth/login             - Login
GET    /api/auth/me                - Get current user
```

### Resources (NEW!)
```
GET    /api/resources/supported-types    - Get file types
POST   /api/resources/upload             - Upload multiple files
POST   /api/resources/upload-single      - Upload single file (legacy)
```

### Tasks
```
GET    /api/tasks                   - Get all tasks
POST   /api/tasks                   - Create task
PUT    /api/tasks/:id              - Update task
DELETE /api/tasks/:id              - Delete task
```

### Schedule
```
POST   /api/schedules/generate     - Generate AI schedule
GET    /api/schedules              - Get schedules
PUT    /api/schedules/:id          - Update schedule
```

### Stress
```
POST   /api/stress                  - Log stress level
GET    /api/stress                  - Get stress history
```

### Chatbot
```
POST   /api/chat                    - Send message
GET    /api/chat                    - Get chat history
DELETE /api/chat                    - Clear chat
```

### Dashboard
```
GET    /api/dashboard               - Get dashboard data
```

---

## 🎨 Customization

### Change Theme Colors
Edit `frontend/tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: { 500: '#YOUR_COLOR' },
      // ... more colors
    }
  }
}
```

### Change Primary Color
In `frontend/src/App.jsx`, change:
```jsx
<div data-theme="light" className="...">
```

To use DaisyUI theme:
```jsx
<div data-theme="light" className="...">  {/* Available: light, dark, etc */}
```

### Add Custom Icons
In `frontend/src/components/common/Icons.jsx`:
```javascript
import { YourIcon } from 'lucide-react';

export const IconYourName = ({ className = 'w-5 h-5' }) => (
  <YourIcon className={className} strokeWidth={2} />
);
```

---

## 📈 Performance Tips

1. **Optimize large files:**
   - Compress PDFs before uploading
   - Split large documents into chunks
   - Remove unnecessary images

2. **Database optimization:**
   - Index frequently queried fields
   - Archive old stress logs monthly
   - Limit knowledge base file size

3. **Frontend optimization:**
   - Enable lazy loading for pages
   - Cache API responses
   - Minify production build

---

## 🚀 Production Deployment

### Backend
```bash
# Set environment
NODE_ENV=production

# Install only production dependencies
npm install --production

# Start with process manager
npm install -g pm2
pm2 start server.js --name timesplit-backend
pm2 save
```

### Frontend
```bash
# Build for production
npm run build

# This creates 'dist' folder
# Upload 'dist' to your hosting (Vercel, Netlify, etc)

# Or run with Node.js
npm install -g serve
serve -s dist -p 3000
```

### Environment Variables
Make sure all these are set in production:
```
BACKEND:
- NODE_ENV=production
- MONGODB_URI=your_production_db
- JWT_SECRET=long_random_string
- JWT_EXPIRE=7d
- GEMINI_API_KEY=your_key
- FRONTEND_URL=https://yourdomain.com

FRONTEND:
- VITE_API_URL=https://api.yourdomain.com
```

---

## 📞 Quick Help

### Can't login?
- Check email is correct
- Password is case-sensitive
- Try registering if account doesn't exist

### Tasks not showing?
- Create a task first
- Refresh page
- Check browser console for errors

### AI not using my documents?
- Upload documents first (Resources page)
- Wait 5 seconds after upload
- Ask chatbot a question about uploaded content

### Schedule not generating?
- Create at least 2 tasks
- Set deadlines for tasks
- Try again after page refresh

---

## 📚 Additional Resources

### Learn More
- **React:** https://react.dev
- **Tailwind:** https://tailwindcss.com
- **Lucide Icons:** https://lucide.dev
- **Express:** https://expressjs.com
- **MongoDB:** https://docs.mongodb.com

### Community
- GitHub Issues: For bug reports
- Discussions: For feature requests
- Stack Overflow: For general questions

---

## ✅ Checklist for First Time Use

- [ ] Install Node.js v16+
- [ ] Clone/download TimeSplit
- [ ] Install backend dependencies
- [ ] Configure backend .env
- [ ] Start MongoDB
- [ ] Start backend server
- [ ] Install frontend dependencies
- [ ] Configure frontend .env
- [ ] Start frontend server
- [ ] Open http://localhost:5173
- [ ] Register new account
- [ ] Create a task
- [ ] Generate schedule
- [ ] Upload a document
- [ ] Ask chatbot a question

---

## 🎯 Next Steps

1. **Explore the Dashboard** - See your progress
2. **Create Some Tasks** - Add real study tasks
3. **Upload Documents** - Use the new multi-file upload
4. **Generate Schedule** - Let AI create your study plan
5. **Track Stress** - Log your stress levels
6. **Use Chatbot** - Ask questions about your materials

---

## 🆘 Emergency Support

If something breaks:
1. Check error messages in browser console (F12)
2. Check terminal output where server is running
3. Look at the backend logs for errors
4. Check .env files are properly configured
5. Try restarting both frontend and backend

---

**Version:** 2.0 (Upgraded)
**Last Updated:** March 16, 2026
**Status:** ✅ Ready to Use

Enjoy your upgraded TimeSplit! 🎉
