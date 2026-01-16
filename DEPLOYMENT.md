# Deployment Guide

## Production Deployment Summary

### Backend (Railway)
- **Live API URL**: `https://number-discussion-backend-production.up.railway.app`
- **GitHub Repository**: `https://github.com/AdhamMohamedSaleh/number-discussion-backend`
- **Database**: PostgreSQL on Railway
- **Status**: ✅ Deployed and Active

### Frontend (Vercel)
- **Live App URL**: [Your Vercel URL]
- **GitHub Repository**: [Your Frontend Repo]
- **Connected to**: Railway Backend API
- **Status**: ✅ Deployed and Active

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  Next.js        │────────▶│  Express.js     │────────▶│  PostgreSQL     │
│  Frontend       │  HTTPS  │  Backend API    │         │  Database       │
│  (Vercel)       │         │  (Railway)      │         │  (Railway)      │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Calculations
- `GET /api/calculations` - Get all calculations
- `GET /api/calculations/:id` - Get specific calculation tree
- `POST /api/calculations` - Create new calculation (protected)
- `POST /api/calculations/:id/respond` - Respond to calculation (protected)

### Health Check
- `GET /health` - Service health status

## Environment Variables

### Backend (Railway)
```
NODE_ENV=production
JWT_SECRET=[auto-generated]
DATABASE_URL=[auto-injected from Postgres service]
PORT=3000
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://number-discussion-backend-production.up.railway.app/api
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Calculations Table
```sql
CREATE TABLE calculations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  parent_id INTEGER REFERENCES calculations(id) NULL,
  value DECIMAL NOT NULL,
  operation VARCHAR(10) NULL,
  operand DECIMAL NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing the Deployment

### 1. Health Check
```bash
curl https://number-discussion-backend-production.up.railway.app/health
```

Expected: `{"status":"ok"}`

### 2. Register User
```bash
curl -X POST https://number-discussion-backend-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'
```

### 3. Create Calculation
```bash
curl -X POST https://number-discussion-backend-production.up.railway.app/api/calculations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"value":10}'
```

### 4. Get All Calculations
```bash
curl https://number-discussion-backend-production.up.railway.app/api/calculations
```

## Local Development

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Update frontend `.env.local` to point to local backend:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Updating the Deployment

### Backend Updates
1. Make changes to the code
2. Commit and push to GitHub
3. Railway automatically deploys

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

### Frontend Updates
1. Make changes to the code
2. Commit and push to GitHub
3. Vercel automatically deploys

### Database Updates
To update the database schema:

```bash
# Login to Railway CLI
railway login

# Link to project
railway link

# Run SQL commands
railway run psql $DATABASE_URL -c "YOUR SQL COMMAND"
```

## Monitoring

### Backend Logs (Railway)
- Go to Railway Dashboard
- Click on backend service
- View "Deployments" tab for logs

### Frontend Logs (Vercel)
- Go to Vercel Dashboard
- Click on your project
- View "Logs" section

### Database Monitoring (Railway)
- Go to Railway Dashboard
- Click on Postgres service
- View "Metrics" tab

## Troubleshooting

### Backend Not Responding
1. Check Railway deployment logs
2. Verify environment variables are set
3. Check DATABASE_URL is connected

### Frontend Can't Connect to Backend
1. Verify `NEXT_PUBLIC_API_URL` in Vercel environment variables
2. Check CORS settings in backend
3. Test backend endpoints directly

### Database Connection Issues
1. Verify DATABASE_URL reference is added to backend service
2. Check Postgres service is running
3. Verify database tables are initialized

## Security Considerations

### Production Checklist
- ✅ JWT_SECRET is randomly generated
- ✅ Passwords are hashed with bcrypt
- ✅ Database credentials are not exposed
- ✅ HTTPS enabled on both frontend and backend
- ✅ Environment variables properly configured
- ⚠️ CORS configured (currently allows all origins - consider restricting in production)
- ⚠️ Rate limiting not implemented (consider adding for production)

### Recommended Improvements
1. Add rate limiting to API endpoints
2. Configure CORS to only allow your frontend domain
3. Add request logging and monitoring
4. Implement database backups
5. Add input validation middleware
6. Set up error tracking (e.g., Sentry)

## Cost Estimation

### Railway (Free Tier)
- $5 credit / 500 hours of usage
- Enough for testing and small projects

### Vercel (Free Tier)
- 100 GB bandwidth
- Unlimited deployments
- Perfect for personal projects

## Support

- Backend Issues: [Create issue on GitHub](https://github.com/AdhamMohamedSaleh/number-discussion-backend/issues)
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs

---

**Deployment Date**: January 16, 2026
**Status**: ✅ Fully Operational
