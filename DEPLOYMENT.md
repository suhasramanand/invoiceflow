# Deployment Guide - InvoiceFlow

## Deploying to Vercel

### Frontend Deployment (Vercel)

Vercel is the recommended platform for deploying the InvoiceFlow frontend.

#### Prerequisites
- GitHub account with the InvoiceFlow repository
- Vercel account (free tier available)

#### Steps

1. **Prepare the Frontend**
   - The frontend is already configured for Vercel deployment
   - Build command: `npm run build` (runs in `frontend` directory)
   - Output directory: `dist`
   - Install command: `npm install`

2. **Deploy via Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository: `suhasramanand/invoiceflow`
   - Configure the project:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `npm install`

3. **Environment Variables**
   Add these in Vercel project settings:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```
   Replace `your-backend-url.com` with your backend API URL.

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your frontend
   - Your app will be live at `https://your-project.vercel.app`

#### Automatic Deployments
- Every push to `master` branch will trigger a new deployment
- Preview deployments are created for pull requests

### Backend Deployment Options

The backend needs to be deployed separately. Here are recommended options:

#### Option 1: Railway (Recommended for PostgreSQL)
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL database
4. Add Node.js service
5. Connect your GitHub repository
6. Set environment variables:
   ```
   DB_HOST=your-db-host
   DB_PORT=5432
   DB_NAME=invoiceflow
   DB_USER=postgres
   DB_PASSWORD=your-password
   PORT=3001
   NODE_ENV=production
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
7. Set root directory to `backend`
8. Build command: `npm run build`
9. Start command: `npm start`

#### Option 2: Render
1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add PostgreSQL database
6. Set environment variables (same as Railway)

#### Option 3: Heroku
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create invoiceflow-backend`
4. Add PostgreSQL: `heroku addons:create heroku-postgresql:hobby-dev`
5. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
   ```
6. Deploy: `git push heroku master`

### Database Setup

After deploying the backend:

1. **Run Migrations**
   ```bash
   npm run db:migrate
   ```

2. **Seed Database (Optional)**
   ```bash
   npm run db:seed
   ```

### Post-Deployment Checklist

- [ ] Frontend deployed on Vercel
- [ ] Backend deployed (Railway/Render/Heroku)
- [ ] Database created and connected
- [ ] Migrations run successfully
- [ ] Environment variables configured
- [ ] Frontend API URL updated to backend URL
- [ ] Test login functionality
- [ ] Test invoice creation
- [ ] Test PDF generation
- [ ] Verify CORS settings

### Troubleshooting

**Frontend can't connect to backend:**
- Check `VITE_API_URL` environment variable
- Verify backend CORS settings include frontend URL
- Check backend is running and accessible

**Database connection errors:**
- Verify database credentials
- Check database is accessible from backend host
- Ensure migrations have been run

**Build failures:**
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check build logs for specific errors

### Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

