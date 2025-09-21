# 🚀 TeachEasy Production Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free)
- Railway account (free tier available)
- MongoDB Atlas account (free tier)

## Step 1: Set Up MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (choose the free M0 tier)
4. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Username: `teacheasy-user`
   - Password: Generate a strong password
5. Whitelist IP addresses:
   - Go to "Network Access" → "Add IP Address"
   - Add `0.0.0.0/0` (allows access from anywhere)
6. Get connection string:
   - Go to "Clusters" → "Connect" → "Connect your application"
   - Copy the connection string (replace `<password>` with your password)

## Step 2: Set Up Auth0 (Authentication)

1. Go to [Auth0](https://auth0.com)
2. Create a free account
3. Create a new application:
   - Type: "Single Page Application"
   - Name: "TeachEasy"
4. Configure settings:
   - Allowed Callback URLs: `http://localhost:3000, https://your-vercel-app.vercel.app`
   - Allowed Logout URLs: `http://localhost:3000, https://your-vercel-app.vercel.app`
   - Allowed Web Origins: `http://localhost:3000, https://your-vercel-app.vercel.app`
5. Note down:
   - Domain
   - Client ID
   - Client Secret

## Step 3: Deploy Backend to Railway

1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Create new project → "Deploy from GitHub repo"
4. Select your TeachEasy repository
5. Configure environment variables:
   ```
   MONGODB_URI=mongodb+srv://teacheasy-user:password@cluster.mongodb.net/teacheasy
   NODE_ENV=production
   PORT=5001
   AUTH0_DOMAIN=your-auth0-domain.auth0.com
   AUTH0_CLIENT_ID=your-auth0-client-id
   AUTH0_CLIENT_SECRET=your-auth0-client-secret
   AUTH0_AUDIENCE=your-auth0-audience
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
6. Deploy! Railway will give you a URL like: `https://your-app.railway.app`

## Step 4: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Import your repository
4. Configure build settings:
   - Framework Preset: "Create React App"
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Add environment variables:
   ```
   REACT_APP_API_URL=https://your-app.railway.app
   REACT_APP_AUTH0_DOMAIN=your-auth0-domain.auth0.com
   REACT_APP_AUTH0_CLIENT_ID=your-auth0-client-id
   REACT_APP_AUTH0_AUDIENCE=your-auth0-audience
   REACT_APP_AUTH0_REDIRECT_URI=https://your-vercel-app.vercel.app
   ```
6. Deploy!

## Step 5: Update Auth0 Settings

1. Go back to Auth0 dashboard
2. Update your application settings:
   - Allowed Callback URLs: Add your Vercel URL
   - Allowed Logout URLs: Add your Vercel URL
   - Allowed Web Origins: Add your Vercel URL

## Step 6: Test Your Deployment

1. Visit your Vercel URL
2. Test sign-in functionality
3. Test Essay Assist feature
4. Check that data persists in MongoDB Atlas

## Troubleshooting

### Common Issues:
1. **CORS errors**: Make sure FRONTEND_URL in backend matches your Vercel URL
2. **Auth0 errors**: Check that all URLs are updated in Auth0 settings
3. **Database connection**: Verify MongoDB Atlas connection string and IP whitelist
4. **Environment variables**: Double-check all environment variables are set correctly

### Getting Help:
- Check Railway logs: Railway dashboard → Your project → Deployments → View logs
- Check Vercel logs: Vercel dashboard → Your project → Functions → View logs
- Check MongoDB Atlas logs: Atlas dashboard → Monitoring

## Cost Breakdown (Free Tiers):
- **Vercel**: Free (unlimited personal projects)
- **Railway**: $5/month after free tier (500 hours)
- **MongoDB Atlas**: Free (512MB storage)
- **Auth0**: Free (7,000 active users)

Total: ~$5/month for production deployment
