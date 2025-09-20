# Auth0 Setup Guide for TeachEasy

This guide will help you set up Auth0 authentication for the TeachEasy application.

## 🔐 Step 1: Create Auth0 Account

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Sign up for a free account
3. Choose your region (closest to your users)

## 🚀 Step 2: Create Application

1. In the Auth0 Dashboard, go to **Applications** → **Applications**
2. Click **Create Application**
3. Choose **Single Page Application**
4. Name it "TeachEasy Frontend"
5. Click **Create**

## ⚙️ Step 3: Configure Application Settings

1. Go to your application's **Settings** tab
2. Update the following settings:

### Allowed Callback URLs
```
http://localhost:3000
http://localhost:3000/
```

### Allowed Logout URLs
```
http://localhost:3000
http://localhost:3000/
```

### Allowed Web Origins
```
http://localhost:3000
```

### Allowed Origins (CORS)
```
http://localhost:3000
```

## 🔑 Step 4: Get Your Credentials

From your application's **Settings** tab, copy:

- **Domain** (e.g., `your-domain.auth0.com`)
- **Client ID** (e.g., `abc123def456ghi789`)

## 🎯 Step 5: Create API (Optional for MVP)

1. Go to **Applications** → **APIs**
2. Click **Create API**
3. Name: "TeachEasy API"
4. Identifier: `https://api.teacheasy.com` (or any unique identifier)
5. Signing Algorithm: RS256
6. Click **Create**

## 📝 Step 6: Update Environment Variables

### Frontend (.env)
```env
REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_AUDIENCE=https://api.teacheasy.com
```

### Backend (.env) - Optional for MVP
```env
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=https://api.teacheasy.com
```

## 🧪 Step 7: Test Authentication

1. Start your application:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm start
   ```

2. Go to http://localhost:3000
3. Click "Login / Sign Up"
4. You should see the Auth0 login page
5. Create a test account or use social login

## 🔧 Step 8: Configure User Metadata (Optional)

To store additional user information:

1. Go to **User Management** → **Users**
2. Click on a user
3. Go to **User Metadata** tab
4. Add custom fields like:
   ```json
   {
     "schoolName": "Example Elementary",
     "schoolRegion": "North",
     "gradeLevel": ["K", "1", "2"]
   }
   ```

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid redirect_uri" Error**
   - Check that your callback URLs are exactly: `http://localhost:3000`
   - Make sure there are no trailing slashes

2. **CORS Errors**
   - Verify Allowed Origins includes `http://localhost:3000`
   - Check that Allowed Web Origins is set

3. **"Invalid audience" Error**
   - Make sure the audience in your frontend matches your API identifier
   - Check that the API is created and active

4. **Login Redirects to Wrong URL**
   - Verify Allowed Callback URLs in Auth0 settings
   - Check the redirect_uri in your Auth0Provider configuration

### Debug Steps

1. **Check Browser Console**
   - Look for Auth0-related errors
   - Check network tab for failed requests

2. **Verify Environment Variables**
   - Make sure `.env` file is in the frontend root
   - Restart the development server after changes

3. **Test Auth0 Configuration**
   - Use Auth0's test tool in the dashboard
   - Check the application logs

## 🔒 Security Best Practices

1. **Never commit .env files** to version control
2. **Use environment-specific configurations** for production
3. **Enable MFA** for your Auth0 account
4. **Regularly rotate secrets** and update them
5. **Monitor authentication logs** for suspicious activity

## 📚 Additional Resources

- [Auth0 React SDK Documentation](https://auth0.com/docs/quickstart/spa/react)
- [Auth0 Management API](https://auth0.com/docs/api/management/v2)
- [Auth0 Security Best Practices](https://auth0.com/docs/security)

## 🎉 You're All Set!

Once configured, users will be able to:
- Sign up with email/password
- Use social logins (Google, Facebook, etc.)
- Have their profile data stored securely
- Access protected routes in your application

The authentication will work seamlessly with your TeachEasy application!
