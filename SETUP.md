# TeachEasy - Setup Guide

This guide will walk you through setting up the TeachEasy application step by step.

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB Atlas account** - [Sign up here](https://www.mongodb.com/atlas)
- **Auth0 account** (optional for MVP) - [Sign up here](https://auth0.com/)

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Navigate to the project directory
cd TeachEasy-HackRice15

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier is fine)
3. Create a database user with read/write permissions
4. Get your connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/teacheasy`)
5. Copy `backend/env.example` to `backend/.env` and update the `MONGODB_URI`

### 3. Set Up Auth0 (Optional for MVP)

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new application (Single Page Application)
3. Copy your domain, client ID, and audience
4. Copy `frontend/env.example` to `frontend/.env` and update the Auth0 values

### 4. Seed the Database

```bash
# From the backend directory
npm run seed
```

This will populate your database with sample scholarship data.

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
TeachEasy-HackRice15/
├── backend/
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── scripts/          # Database seeding
│   ├── server.js         # Express server
│   └── package.json
├── frontend/
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── App.js        # Main app component
│   │   └── index.js      # Entry point
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env` with:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/teacheasy
PORT=5000
NODE_ENV=development
```

### Frontend Environment Variables

Create `frontend/.env` with:

```env
REACT_APP_AUTH0_DOMAIN=your-auth0-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-auth0-client-id
REACT_APP_AUTH0_AUDIENCE=your-auth0-audience
```

## 🎯 Features Implemented

### ✅ Core Features
- **User Authentication** - Auth0 integration for secure login/signup
- **User Profiles** - Teachers can create detailed profiles with school info
- **Scholarship Database** - Comprehensive scholarship/grants database
- **Smart Filtering** - Filter by region, amount, grade level, subjects, funding types
- **Search Functionality** - Full-text search across scholarships
- **Bookmarking** - Save interesting opportunities
- **View History** - Track recently viewed scholarships
- **Responsive Design** - Works on desktop and mobile

### 🔍 Filtering Options
- **Amount Range** - Min/max funding amounts
- **Regions** - Geographic filtering
- **Grade Levels** - Pre-K through College
- **Subjects** - All major teaching subjects
- **Funding Types** - Classroom supplies, technology, PD, etc.

### 📊 Dashboard Features
- **Personalized Recommendations** - Based on user profile
- **Sorting Options** - By deadline, amount, popularity, date
- **Pagination** - Handle large result sets
- **Real-time Search** - Instant filtering as you type

## 🛠️ API Endpoints

### Scholarships
- `GET /api/scholarships` - List scholarships with filtering
- `GET /api/scholarships/:id` - Get specific scholarship
- `GET /api/scholarships/featured` - Get featured scholarships
- `POST /api/scholarships/:id/bookmark` - Bookmark scholarship
- `DELETE /api/scholarships/:id/bookmark` - Remove bookmark

### Users
- `GET /api/users/profile/:auth0Id` - Get user profile
- `POST /api/users/profile` - Create/update profile
- `GET /api/users/:auth0Id/bookmarks` - Get user's bookmarks
- `GET /api/users/:auth0Id/history` - Get view history
- `GET /api/users/:auth0Id/recommendations` - Get personalized recommendations

## 🎨 UI/UX Features

### Design System
- **Modern UI** - Clean, professional design
- **Responsive Layout** - Mobile-first approach
- **Accessibility** - WCAG compliant components
- **Loading States** - Smooth user experience
- **Error Handling** - User-friendly error messages

### Color Scheme
- Primary: Blue (#3b82f6)
- Success: Green (#059669)
- Warning: Yellow (#f59e0b)
- Danger: Red (#ef4444)
- Neutral: Gray scale

## 🚀 Deployment

### Backend Deployment (Heroku)
1. Create a Heroku app
2. Add MongoDB Atlas addon
3. Set environment variables
4. Deploy with Git

### Frontend Deployment (Netlify/Vercel)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set environment variables
4. Deploy

## 🔒 Security Features

- **JWT Authentication** - Secure user sessions
- **Rate Limiting** - Prevent API abuse
- **Input Validation** - Sanitize all inputs
- **CORS Protection** - Secure cross-origin requests
- **Environment Variables** - Keep secrets secure

## 📈 Performance Optimizations

- **Database Indexing** - Optimized queries
- **Pagination** - Handle large datasets
- **Caching** - Reduce API calls
- **Code Splitting** - Faster page loads
- **Image Optimization** - Compressed assets

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your connection string
   - Ensure your IP is whitelisted in MongoDB Atlas
   - Verify database user permissions

2. **Auth0 Login Issues**
   - Check your Auth0 configuration
   - Verify callback URLs are set correctly
   - Ensure environment variables are loaded

3. **CORS Errors**
   - Check that the frontend is running on port 3000
   - Verify the backend proxy configuration

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all environment variables are set

### Getting Help

- Check the console for error messages
- Verify all environment variables are set
- Ensure all dependencies are installed
- Check MongoDB Atlas connection

## 🎉 Next Steps

### MVP Enhancements
1. **Email Notifications** - Deadline reminders
2. **Application Tracking** - Track application status
3. **Document Upload** - Resume/CV upload functionality
4. **Advanced Search** - More sophisticated filtering
5. **Export Features** - Export bookmarked opportunities

### Future Features
1. **AI-Powered Matching** - Machine learning recommendations
2. **Application Assistance** - Auto-fill application forms
3. **Community Features** - Teacher forums and discussions
4. **Analytics Dashboard** - Track success rates
5. **Mobile App** - Native mobile application

## 📞 Support

If you encounter any issues:

1. Check this setup guide
2. Review the error messages in the console
3. Verify all configuration steps
4. Check the GitHub issues page

---

**Happy Teaching! 🎓**

This application is designed to help educators find the funding they need to support their students and classrooms. We hope it makes a positive impact on education!
