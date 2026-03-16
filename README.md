# Time-Split - Intelligent Study Scheduler

A production-ready full-stack application that helps students manage their study schedule using AI-powered adaptive scheduling, stress tracking, and an AI chatbot assistant.

**Version:** 2.0 (Recently Upgraded!) ✨

## 🎉 What's New in v2.0

### 📤 Multi-File Upload Support
- Upload **PDF, Word, PowerPoint, Text, CSV, JSON** files
- **Batch upload** up to 10 files at once
- **Drag & drop** interface
- File size up to **50MB** each
- Real-time upload status tracking

### 🎨 Beautiful Light Theme
- Modern **light theme** throughout the app
- Professional **blue/gray/white** color palette
- Enhanced **accessibility** (WCAG AA compliant)
- Better contrast for readability
- Responsive design on all devices

### 🎯 Professional Icons
- **100+ Lucide React icons** for consistent styling
- Icons throughout the UI for better UX
- Professional appearance
- Easy to maintain and extend

### 💄 Enhanced UI/UX
- Gradient cards on Dashboard
- Better typography and spacing
- Improved error messages
- Educational info cards
- Modern button styling
- Helpful tips and hints

**See full details in [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md) or [UPGRADE_REPORT.md](UPGRADE_REPORT.md)**

---

## 🚀 Features

### Core Features
- **User Authentication**: Secure JWT-based authentication with role-based access (Student/Admin)
- **Task Management**: Create, update, delete, and track tasks with priorities and deadlines
- **AI-Based Adaptive Scheduler**: Generates personalized study schedules based on:
  - Task priority and deadlines
  - Available study hours
  - Stress levels
  - Preferred time slots
- **Stress Tracking**: Daily stress level logging with analytics and trend visualization
- **AI Chatbot**: Google Gemini-powered chatbot for academic assistance
- **Study Resources**: Upload your study materials for AI-enhanced learning
- **Dashboard**: Comprehensive analytics including:
  - Today's schedule
  - Upcoming deadlines
  - Stress analytics with charts
  - Completion statistics
  - Productivity summary

### Advanced Features
- Smart rescheduling algorithm for missed tasks
- Automatic workload adjustment based on stress levels
- Weekly performance reports
- Admin panel capabilities
- **Multi-file upload** for knowledge base
- **Professional UI** with light theme and icons

## 🛠️ Tech Stack


### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **Google Gemini API** - AI scheduling and chatbot

### Frontend
- **React.js** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## 📁 Project Structure

```
TimeSplit/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/            # Route controllers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── taskController.js
│   │   ├── scheduleController.js
│   │   ├── stressController.js
│   │   ├── chatController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   ├── errorHandler.js    # Error handling
│   │   └── validation.js      # Input validation
│   ├── models/                # MongoDB schemas
│   │   ├── User.js
│   │   ├── Task.js
│   │   ├── Schedule.js
│   │   ├── StressLog.js
│   │   └── ChatHistory.js
│   ├── routes/                # API routes
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── scheduleRoutes.js
│   │   ├── stressRoutes.js
│   │   ├── chatRoutes.js
│   │   └── dashboardRoutes.js
│   ├── services/              # Business logic
│   │   └── schedulerService.js
│   ├── utils/
│   │   └── generateToken.js
│   ├── server.js              # Entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/          # Auth components
    │   │   ├── common/        # Layout, Navbar, Sidebar
    │   │   ├── dashboard/    # Dashboard components
    │   │   ├── tasks/        # Task components
    │   │   ├── scheduler/    # Schedule components
    │   │   ├── stress/       # Stress tracking components
    │   │   └── chat/         # Chatbot components
    │   ├── pages/            # Page components
    │   ├── services/         # API services
    │   ├── context/          # React context (Auth)
    │   ├── utils/            # Utilities
    │   └── App.jsx           # Main app component
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Google Gemini API key (optional, for AI features)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd TimeSplit/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/timesplit
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   GEMINI_API_KEY=your_gemini_api_key_here
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start MongoDB**
   - If using local MongoDB: `mongod`
   - Or use MongoDB Atlas cloud database

5. **Run the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd TimeSplit/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:5173`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `GET /api/users` - Get all users (Admin only)

### Tasks
- `GET /api/tasks` - Get all tasks (protected)
- `GET /api/tasks/:id` - Get single task (protected)
- `POST /api/tasks` - Create task (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)

### Schedules
- `POST /api/schedules/generate` - Generate schedule (protected)
- `GET /api/schedules` - Get schedules (protected)
- `PUT /api/schedules/:id` - Update schedule status (protected)
- `POST /api/schedules/reschedule` - Reschedule missed tasks (protected)

### Stress Tracking
- `POST /api/stress` - Log stress level (protected)
- `GET /api/stress` - Get stress history (protected)
- `GET /api/stress/current` - Get current stress level (protected)

### Chatbot
- `POST /api/chat` - Send message (protected)
- `GET /api/chat` - Get chat history (protected)
- `DELETE /api/chat` - Clear chat history (protected)

### Dashboard
- `GET /api/dashboard` - Get dashboard data (protected)

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens are automatically stored in localStorage after login and included in all API requests.

## 🎨 Usage Guide

1. **Register/Login**: Create an account or login with existing credentials
2. **Set Profile**: Update your profile with academic goals, available hours, and preferred time slots
3. **Add Tasks**: Create tasks with subjects, priorities, deadlines, and estimated time
4. **Generate Schedule**: Use the scheduler to automatically create a study schedule
5. **Track Stress**: Log your daily stress levels to help the scheduler adjust workload
6. **Use Chatbot**: Ask academic questions and get AI-powered assistance
7. **View Dashboard**: Monitor your progress, upcoming deadlines, and analytics

## 🔧 Configuration

### MongoDB Connection
Update `MONGODB_URI` in backend `.env`:
- Local: `mongodb://localhost:27017/timesplit`
- Atlas: `mongodb+srv://username:password@cluster.mongodb.net/timesplit`

### Google Gemini Integration
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to backend `.env`: `GEMINI_API_KEY=your_key_here`
3. Without API key, the app will use rule-based scheduling

### Email Notifications (Optional)
Configure email settings in backend `.env` for deadline reminders:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## 🧪 Testing

### Backend API Testing
Use tools like Postman or curl to test endpoints:
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name timesplit-backend
   ```

### Frontend Deployment
1. Build for production:
   ```bash
   npm run build
   ```
2. Deploy `dist` folder to hosting service (Vercel, Netlify, etc.)

### Environment Variables
Ensure all environment variables are set in production:
- Backend: MongoDB URI, JWT Secret, Google Gemini API Key
- Frontend: API URL

## 📝 Notes

- The scheduler works with or without Google Gemini API key
- Without Gemini API key, it uses a rule-based algorithm
- Stress levels above 7 automatically reduce workload by 30%
- Stress levels above 5 reduce workload by 15%
- Schedules are automatically rescheduled if tasks are missed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## � Documentation

### Available Guides
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md)** - v2.0 completion summary
- **[UPGRADE_REPORT.md](UPGRADE_REPORT.md)** - Detailed upgrade documentation
- **[VISUAL_GUIDE.md](VISUAL_GUIDE.md)** - UI/UX changes with examples
- **[TECHNICAL_DOCS.md](TECHNICAL_DOCS.md)** - Architecture & API reference
- **[CHANGELIST.md](CHANGELIST.md)** - Complete list of changes

### Quick Links
- [How to upload files](QUICKSTART.md#resources-new)
- [New API endpoints](TECHNICAL_DOCS.md#resource-endpoints)
- [Troubleshooting](QUICKSTART.md#troubleshooting)
- [Deployment guide](QUICKSTART.md#production-deployment)

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Time-Split Development Team

---

**Note**: Make sure to change the JWT_SECRET in production and keep your API keys secure!

**v2.0 Update**: This version includes multi-file upload support, light theme UI, and 100+ professional icons. See [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md) for details!
