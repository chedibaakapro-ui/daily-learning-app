# 🚀 Daily Learning App - Deployment Guide

## 📋 Table of Contents
1. [Quick Start (Docker)](#quick-start-docker)
2. [Local Development Setup](#local-development-setup)
3. [Production Deployment](#production-deployment)
4. [Testing](#testing)
5. [Troubleshooting](#troubleshooting)

---

## 🐳 Quick Start (Docker)

The **easiest and most reliable** way to run the app:

### Prerequisites
- Docker Desktop installed
- 8GB RAM minimum
- 10GB free disk space

### Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd dailylearn-app

# 2. Start everything with one command
docker-compose up --build

# 3. Wait 60 seconds for services to initialize

# 4. Open browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:5001/health

# 5. Login with test account
# Email: test@dailylearn.app
# Password: Test123!@#
```

**That's it!** The database is auto-seeded with test data.

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 20+ installed
- PostgreSQL 16+ installed and running
- npm or yarn

### Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Edit .env with your database credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/dailylearn"

# 5. Run database migrations
npx prisma migrate deploy

# 6. Seed database (automatic on first run, or manual)
npm run seed

# 7. Start backend
npm run dev

# Backend runs on http://localhost:5001
```

### Frontend Setup

```bash
# 1. Open new terminal, navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env.local file (optional)
echo "NEXT_PUBLIC_API_URL=http://localhost:5001" > .env.local

# 4. Start frontend
npm run dev

# Frontend runs on http://localhost:3000
```

### Verify Setup

```bash
# Run health check script
chmod +x health-check.sh
./health-check.sh

# Should show:
# ✅ Backend is healthy
# ✅ Frontend is accessible
# ✅ All systems operational!
```

---

## 🌐 Production Deployment

### Option 1: Docker on VPS (Recommended)

```bash
# 1. SSH into your server
ssh user@your-server.com

# 2. Clone repository
git clone <your-repo-url>
cd dailylearn-app

# 3. Update environment variables in docker-compose.yml
# IMPORTANT: Change JWT_SECRET and database password!

# 4. Start services
docker-compose up -d

# 5. Check health
curl http://localhost:5001/health

# 6. Setup reverse proxy (Nginx example)
# See nginx-config-example below
```

### Option 2: Platform as a Service

#### Render.com
```yaml
# Create render.yaml in project root
services:
  - type: web
    name: dailylearn-backend
    env: node
    buildCommand: cd backend && npm install && npx prisma generate && npm run build
    startCommand: cd backend && npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: dailylearn-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
```

#### Vercel (Frontend) + Railway (Backend)
- Deploy frontend to Vercel
- Deploy backend to Railway
- Connect PostgreSQL database on Railway

### Environment Variables for Production

**Backend (.env):**
```bash
DATABASE_URL="postgresql://user:password@host:5432/dailylearn"
JWT_SECRET="<generate-strong-secret-here>"
FRONTEND_URL="https://your-domain.com"
SENDGRID_API_KEY="<your-sendgrid-api-key>"
FROM_EMAIL="noreply@yourdomain.com"
NODE_ENV="production"
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL="https://api.your-domain.com"
```

---

## 🧪 Testing

### Automated Testing

```bash
# Run health check
./health-check.sh

# Expected output:
# ✅ All systems operational!
```

### Manual Testing Checklist

Follow the complete testing protocol: [TESTING_PROTOCOL.md](./TESTING_PROTOCOL.md)

**Critical Tests:**
1. ✅ Login with `test@dailylearn.app`
2. ✅ Daily topics ALWAYS show exactly 3 cards (test 10 times)
3. ✅ Forgot password flow works
4. ✅ Auto-seeding works on empty database
5. ✅ Complete topic flow (read + quiz)

---

## 🔧 Troubleshooting

### Backend Won't Start

**Error: "DATABASE_URL not found"**
```bash
# Solution:
cd backend
cp .env.example .env
# Edit .env with correct database URL
```

**Error: "Port 5001 already in use"**
```bash
# Solution:
# Find and kill the process
lsof -ti:5001 | xargs kill -9
# Or change port in backend/.env
PORT=5002
```

### Frontend Won't Start

**Error: "Cannot connect to API"**
```bash
# Solution:
# Check backend is running
curl http://localhost:5001/health

# Update frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### Database Issues

**Error: "Database connection failed"**
```bash
# Solution:
# Check PostgreSQL is running
# macOS: brew services list | grep postgresql
# Linux: sudo systemctl status postgresql
# Windows: Check Services app

# Test connection manually
psql -U dailylearn -d dailylearn -h localhost
```

**Database needs reset:**
```bash
cd backend

# Drop all data and recreate
npx prisma migrate reset

# Will automatically re-seed
```

### Docker Issues

**Containers won't start:**
```bash
# Clean slate
docker-compose down -v
docker system prune -a
docker-compose up --build
```

**Database volume is corrupted:**
```bash
# Remove all volumes
docker-compose down -v

# Restart
docker-compose up -d
```

### Daily Topics Showing < 3 Cards

**This is the critical bug that was fixed!**

```bash
# Check backend logs
docker-compose logs backend | grep "GENERATE"

# Should see:
# ✅ FINAL: Creating set with exactly 3 topics

# If still failing:
# 1. Check database has at least 3 topics
curl http://localhost:5001/health

# 2. Clear browser cache
# Chrome: Ctrl+Shift+Delete

# 3. Delete and recreate daily set
# Login to database and run:
DELETE FROM "DailyTopicSet" WHERE "userId" = '<your-user-id>';

# 4. Refresh page - should generate new 3 topics
```

### SendGrid Email Not Working

```bash
# If emails not sending:
# 1. Verify API key is correct
# 2. Check SendGrid dashboard for blocks
# 3. Check backend logs for errors

# Temporary workaround (testing):
# Leave SENDGRID_API_KEY empty in .env
# Reset link will be printed in backend console
```

---

## 🔐 Security Checklist for Production

```bash
□ Change default JWT_SECRET
□ Use strong database password
□ Enable HTTPS with SSL certificate
□ Set NODE_ENV=production
□ Restrict CORS origins
□ Enable rate limiting
□ Set secure cookie flags
□ Keep dependencies updated
□ Regular database backups
□ Monitor error logs
```

---

## 📊 Monitoring

### Health Check Endpoint

```bash
# Check application health
curl https://api.your-domain.com/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "database": {
    "connected": true,
    "users": 150,
    "topics": 100,
    "categories": 8
  }
}
```

### Setting Up Monitoring (Optional)

- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics, Plausible
- **Logs**: CloudWatch, Datadog

---

## 🔄 Updating the Application

```bash
# Pull latest changes
git pull origin main

# Docker deployment
docker-compose down
docker-compose up --build -d

# Manual deployment
cd backend && npm install && npm run build
cd frontend && npm install && npm run build

# Run migrations if needed
cd backend && npx prisma migrate deploy
```

---

## 📞 Support

If you encounter issues:

1. Check [TESTING_PROTOCOL.md](./TESTING_PROTOCOL.md) for common scenarios
2. Run `./health-check.sh` for system diagnostics
3. Review logs: `docker-compose logs backend`
4. Create an issue with bug report template

---

## 🎯 Success Criteria

Your deployment is successful when:

```bash
□ Health check returns "healthy"
□ Can login with test@dailylearn.app
□ Daily topics ALWAYS show exactly 3 cards
□ Forgot password flow works
□ Can complete full topic → quiz → results flow
□ No console errors
□ Auto-seeding works on empty database
```

---

**Need help?** Check the troubleshooting section above or create an issue!