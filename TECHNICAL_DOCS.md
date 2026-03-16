# TimeSplit v2.0 - Technical Documentation

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)               │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Pages:    Dashboard, Tasks, Schedule, Resources... │ │
│  │ Services: API client, Auth, Data fetching         │ │
│  │ Components: Layout, Icons, Cards, Forms           │ │
│  └────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/REST API
┌────────────────────────▼────────────────────────────────┐
│              Backend (Node.js + Express)                │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Routes:       Auth, Tasks, Schedules, Resources   │ │
│  │ Controllers:  Request handlers & business logic   │ │
│  │ Services:     File processing, AI scheduling      │ │
│  │ Middleware:   Auth, Validation, Error handling    │ │
│  │ Models:       User, Task, Schedule, ChatHistory   │ │
│  └────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │ Database Connection
┌────────────────────────▼────────────────────────────────┐
│              MongoDB (Data Storage)                     │
│  Collections: users, tasks, schedules, chats, stress   │
└─────────────────────────────────────────────────────────┘

External Services:
├─ Google Gemini API (AI)
├─ SMTP Server (Email)
└─ File Processing (PDF, Word, etc)
```

---

## 📁 File Structure

### Backend Structure

```
backend/
├── config/
│   └── db.js                 # MongoDB connection
│
├── controllers/
│   ├── authController.js     # Auth logic
│   ├── taskController.js     # Task CRUD
│   ├── resourceController.js # ⭐ File upload (UPDATED)
│   └── ...
│
├── routes/
│   ├── authRoutes.js
│   ├── resourceRoutes.js     # ⭐ File upload routes (UPDATED)
│   └── ...
│
├── services/
│   ├── fileService.js        # ⭐ NEW - File processing
│   ├── knowledgeService.js   # Knowledge base management
│   └── ...
│
├── middleware/
│   ├── auth.js               # JWT verification
│   ├── validation.js         # Input validation
│   └── errorHandler.js       # Error handling
│
├── models/
│   ├── User.js
│   ├── Task.js
│   ├── Schedule.js
│   └── ...
│
├── data/
│   └── knowledge/            # User knowledge base files
│       ├── userid1.txt
│       ├── userid2.txt
│       └── ...
│
├── server.js                 # Entry point
├── package.json
├── .env
└── .gitignore
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Icons.jsx          # ⭐ UPDATED - Lucide icons
│   │   │   ├── Navbar.jsx         # ⭐ UPDATED - Light theme
│   │   │   ├── Sidebar.jsx        # ⭐ UPDATED - Light theme
│   │   │   └── Layout.jsx
│   │   ├── auth/
│   │   ├── tasks/
│   │   ├── chat/
│   │   └── ...
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx    # ⭐ UPDATED - Light theme
│   │   ├── Resources.jsx    # ⭐ UPDATED - Multi-file upload
│   │   ├── Tasks.jsx
│   │   └── ...
│   │
│   ├── services/
│   │   ├── api.js           # Axios instance
│   │   ├── resourceService.js # ⭐ UPDATED - New endpoints
│   │   └── ...
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── App.jsx              # ⭐ UPDATED - Light theme
│   └── main.jsx
│
├── tailwind.config.js       # ⭐ UPDATED - Light theme config
├── vite.config.js
├── package.json
├── .env
└── .gitignore
```

---

## 🔄 Data Flow Examples

### Example 1: Multi-File Upload Flow

```
1. User Interface (Resources.jsx)
   └─ User selects multiple files
   └─ Files added to state with id & status
   └─ Click Upload button
   └─ FormData created with files

2. API Request (resourceService.js)
   └─ POST /api/resources/upload
   └─ Headers: Content-Type: multipart/form-data
   └─ Body: FormData with files array

3. Backend Route (resourceRoutes.js)
   └─ upload.array('files', 10) - Multer processes
   └─ Returns array of file buffers
   └─ Calls uploadFiles controller

4. Controller (resourceController.js)
   └─ Validates files one by one
   └─ Calls fileService for each file

5. File Service (fileService.js)
   └─ validateFile() - Check type/size
   └─ extractTextFromFile() - Parse based on MIME
   └─ Returns extracted text

6. Knowledge Service (knowledgeService.js)
   └─ appendKnowledge() - Adds to user file
   └─ File: data/knowledge/{userId}.txt

7. Response
   └─ Returns upload statistics
   └─ Success/error count
   └─ Details of uploaded files

8. Frontend
   └─ Updates file list with status
   └─ Displays success/error messages
   └─ Shows statistics
```

### Example 2: File Type Processing

```
PDF File (.pdf)
    ↓
Multer stores in memory → req.file.buffer
    ↓
fileService.extractTextFromFile(buffer, 'application/pdf')
    ↓
extractTextFromPdf() using pdf-parse
    ↓
Returns: "Lorem ipsum dolor sit amet..."
    ↓
appendKnowledge(userId, text, 'notes.pdf')
    ↓
Saves to: data/knowledge/{userId}.txt
    ├─ ===== NEW DOCUMENT: notes.pdf - 2026-03-16T15:30:00.000Z =====
    ├─ Lorem ipsum dolor sit amet...
    └─ (appended to file)
```

---

## 🔐 Security Implementation

### File Upload Security

```javascript
// 1. File Validation
validateFile(file) {
  // Check MIME type (whitelist only)
  if (!supportedTypes[file.mimetype]) throw error;
  
  // Check file size (max 50MB)
  if (file.size > 50MB) throw error;
  
  // Additional checks could be added:
  // - Virus scanning (ClamAV)
  // - Magic number verification
  // - Content inspection
}

// 2. Memory Safety
upload.array('files', 10) {
  // Limits to 10 files
  // Stores in memory (temp, not persisted)
  // Cleaned up after processing
}

// 3. User Association
// Files automatically associated with authenticated user
POST /api/resources/upload
Authorization: Bearer {token}
↓
Verified via JWT middleware → req.user.id
↓
Knowledge base: data/knowledge/{userId}.txt
↓
Only that user can access their files
```

### Authentication Flow

```
1. User logs in
   └─ POST /api/auth/login
   └─ Password hashed with bcryptjs
   └─ Returns JWT token

2. Token stored in localStorage
   └─ Frontend stores: localStorage.setItem('token', token)
   └─ Token expires in 7 days (JWT_EXPIRE=7d)

3. Protected routes
   └─ All /api/resources routes require JWT
   └─ Middleware checks Authorization header
   └─ Extracts userId from token
   └─ Validates signature

4. Request with token
   └─ Frontend includes: Authorization: Bearer {token}
   └─ Backend verifies signature
   └─ Grants access to user's data
```

---

## 📦 Dependency Management

### Backend Dependencies (New/Updated)

```json
{
  "mammoth": "^1.6.0",          // DOCX text extraction
  "adm-zip": "^0.5.x",          // PPTX ZIP handling
  "docx-parser": "latest",      // DOCX parsing
  "pptx-parser": "latest",      // PPTX parsing
  "pdf-parse": "^1.1.1",        // PDF parsing (existing)
  "multer": "^1.4.5-lts.1",     // File upload (existing)
  "express": "^4.18.2",         // Web server (existing)
  "mongoose": "^8.0.3"          // MongoDB (existing)
}
```

### Frontend Dependencies (New/Updated)

```json
{
  "lucide-react": "^latest",    // Icon library (NEW)
  "react": "^18.2.0",           // React (existing)
  "react-router-dom": "^6.20.1",// Routing (existing)
  "tailwindcss": "^4.0.0"       // Styling (updated for light theme)
}
```

---

## 🎯 API Endpoint Documentation

### Resource Endpoints

#### 1. Get Supported File Types
```
GET /api/resources/supported-types

Authentication: Required (Bearer Token)

Response (200):
{
  success: true,
  data: [
    {
      mime: "application/pdf",
      ext: "pdf",
      label: "PDF Document"
    },
    {
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ext: "docx",
      label: "Word Document"
    },
    ...
  ]
}

Errors:
- 401: Unauthorized (missing/invalid token)
- 500: Server error
```

#### 2. Upload Multiple Files
```
POST /api/resources/upload

Authentication: Required (Bearer Token)
Content-Type: multipart/form-data

Request:
FormData {
  files: [File1, File2, File3, ...] (max 10)
}

Response (201):
{
  success: true,
  message: "All files processed...",
  uploadedCount: 3,
  totalCount: 3,
  uploadedFiles: [
    {
      fileName: "notes.pdf",
      size: 2048000,
      sizeMb: "2.00",
      mimetype: "application/pdf"
    }
  ],
  errors: [] // Only if some files failed
}

Errors:
- 400: No files uploaded / Invalid files
- 401: Unauthorized
- 413: File too large
- 415: Unsupported media type
- 500: Server error
```

#### 3. Upload Single File (Legacy)
```
POST /api/resources/upload-single

Authentication: Required (Bearer Token)
Content-Type: multipart/form-data

Request:
FormData {
  file: File (max 50MB)
}

Response (201):
{
  success: true,
  message: "File processed...",
  fileName: "notes.pdf",
  size: 2048000,
  sizeMb: "2.00"
}

Errors:
- 400: No file / Invalid file
- 401: Unauthorized
- 413: File too large
- 415: Unsupported media type
- 500: Server error
```

---

## 🔧 Configuration Files

### Backend .env
```env
# Server
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/timesplit

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=7d

# API Keys
GEMINI_API_KEY=your_gemini_api_key

# Frontend
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=50485760  # 50MB in bytes
MAX_FILES=10
```

### Frontend .env
```env
VITE_API_URL=http://localhost:4000/api
```

### Tailwind Config (tailwind.config.js)
```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          700: '#0369a1'
        }
      }
    }
  },
  daisyui: {
    themes: ["light"]
  }
}
```

---

## 🧪 Testing Checklist

### Backend API Testing

```
1. Authentication
  ☐ Login returns valid JWT
  ☐ Protected routes require JWT
  ☐ Invalid JWT rejected
  ☐ Expired JWT rejected

2. File Upload
  ☐ Single PDF upload
  ☐ Multiple file upload
  ☐ File type validation
  ☐ File size validation
  ☐ Knowledge base file created
  ☐ Content appended correctly

3. File Types
  ☐ PDF extraction
  ☐ DOCX extraction
  ☐ PPTX extraction
  ☐ TXT extraction
  ☐ CSV extraction
  ☐ JSON extraction

4. Error Handling
  ☐ Missing files error
  ☐ Invalid file type error
  ☐ File too large error
  ☐ Corrupted file error
  ☐ Server error responses
```

### Frontend Testing

```
1. UI Components
  ☐ Light theme renders correctly
  ☐ All icons display properly
  ☐ Responsive on mobile
  ☐ Responsive on tablet
  ☐ Responsive on desktop

2. File Upload
  ☐ Drag & drop works
  ☐ Click to browse works
  ☐ File list displays
  ☐ Clear button works
  ☐ Upload button submits
  ☐ Progress shows during upload
  ☐ Success message displays
  ☐ Error message displays

3. Navigation
  ☐ Sidebar navigation works
  ☐ Active state highlights
  ☐ Mobile menu opens/closes
  ☐ All pages accessible

4. Data Display
  ☐ Dashboard stats display
  ☐ Charts render correctly
  ☐ Task lists display
  ☐ Dates format correctly
```

---

## 📊 Performance Considerations

### Optimization Tips

#### Backend
```javascript
// 1. Limit concurrent file processing
// - Process files sequentially to avoid memory issues
// - Implement queue system for large uploads

// 2. Stream large files
// - Don't load entire file in memory
// - Use streams for better performance

// 3. Cache operations
// - Cache supported file types list
// - Cache MIME type validation rules

// 4. Database indexing
// - Index userId in knowledge base lookups
// - Index created dates for sorting
```

#### Frontend
```javascript
// 1. Lazy load pages
// - Dashboard only load when visited
// - Charts only render when visible

// 2. Minimize re-renders
// - Use React.memo for icons
// - Memoize expensive calculations

// 3. Optimize bundle
// - Tree-shake unused Lucide icons
// - Code split by page

// 4. Cache API responses
// - Cache supported types list
// - Cache user profile data
```

---

## 🐛 Debugging Tips

### Backend Debugging

```bash
# Enable debug logging
DEBUG=timesplit* npm run dev

# Check MongoDB connection
mongo --uri "your_uri"

# Test file upload with curl
curl -X POST http://localhost:4000/api/resources/upload \
  -H "Authorization: Bearer {token}" \
  -F "files=@file1.pdf" \
  -F "files=@file2.docx"

# View knowledge base file
cat data/knowledge/{userId}.txt
```

### Frontend Debugging

```javascript
// Check token in console
console.log(localStorage.getItem('token'));

// Monitor API calls
// Open DevTools → Network tab → Filter XHR

// Check errors
// Open DevTools → Console tab

// Test file upload
// Add console.log in resourceService.js
```

---

## 📈 Scalability Plan

### Current Capacity
```
Max file size:     50MB
Max files/upload:  10
Max users:         Unlimited
Storage:           File system based
```

### Future Improvements

```
1. Move to Cloud Storage
   └─ S3 / Google Cloud Storage
   └─ Unlimited scalability

2. Async Processing
   └─ Queue system (Bull/RabbitMQ)
   └─ Background workers

3. Search & Indexing
   └─ Elasticsearch for knowledge base
   └─ Full-text search capability

4. Caching Layer
   └─ Redis for frequently accessed data
   └─ Reduce database load

5. CDN
   └─ Serve frontend from CDN
   └─ Faster content delivery
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

```
Backend:
☐ Set NODE_ENV=production
☐ Generate strong JWT_SECRET
☐ Use production MongoDB URI
☐ Set up Gemini API key
☐ Configure CORS for production domain
☐ Enable HTTPS
☐ Set up environment variables

Frontend:
☐ Run npm run build
☐ Check dist folder created
☐ Update API_URL to production backend
☐ Enable gzip compression
☐ Set up caching headers
☐ Configure CDN
```

### Post-Deployment

```
☐ Test login flow
☐ Test file upload
☐ Test all API endpoints
☐ Monitor error logs
☐ Check performance metrics
☐ Set up monitoring/alerts
☐ Backup database regularly
```

---

**Version:** 2.0 Technical Docs
**Last Updated:** March 16, 2026
**Status:** ✅ Complete

For more details, check inline code comments!
