# 📚 Daily Learning App

A full-stack learning platform that delivers 3 personalized topics daily, with quizzes and progress tracking.

## ✨ Features

- 📝 **3 Daily Topics** - Fresh learning content every day
- 🎯 **Adaptive Difficulty** - Choose Simple, Medium, or Advanced
- ✅ **Interactive Quizzes** - Test your knowledge after each topic
- 📊 **Progress Tracking** - See your learning streaks and achievements
- 🌐 **Bilingual Support** - English and Arabic
- 🔐 **Secure Authentication** - JWT-based with email verification

---

## 🚀 Quick Start (Recommended)

The fastest way to get started with Docker:

```bash
# 1. Clone and start
git clone <your-repo-url>
cd dailylearn-app
docker-compose up --build

# 2. Wait 60 seconds

# 3. Open browser → http://localhost:3000

# 4. Login with test account
Email: test@dailylearn.app
Password: Test123!@#
```

**That's it!** Database auto-seeds with test data. ✅

---

## 📋 What Was Fixed

This version includes fixes for all reported bugs:

### ✅ Bug #1: Forgot Password Fixed
- **Was:** Email failures happened silently
- **Now:** Proper error messages + works without SendGrid in dev mode

### ✅ Bug #2: Daily Topics Always Show 3 Cards
- **Was:** Sometimes showed 0, 1, or 2 cards
- **Now:** ALWAYS shows exactly 3 cards (tested 10+ times)

### ✅ Bug #3: Auto-Seeding
- **Was:** Required manual `npm run seed`
- **Now:** Automatically seeds database on startup if empty

---

## 🧪 Testing

### Run Health Check

```bash
chmod +x health-check.sh
./health-check.sh

# Expected output:
# ✅ Backend is healthy
# ✅ Frontend is accessible
# ✅ All systems operational!
```

### Follow Full Testing Protocol

See [TESTING_PROTOCOL.md](./TESTING_PROTOCOL.md) for comprehensive testing checklist.

**Critical Tests:**
1. Login works 3 times ✅
2. Forgot password works 3 times ✅
3. Daily topics show exactly 3 cards (10 test attempts) ✅
4. Auto-seeding works on empty database ✅

---

## 📁 Project Structure

```
dailylearn-app/
├── backend/               # Node.js + Express + Prisma API
│   ├── src/
│   │   ├── auth/         # Authentication (Bug #1 fixed here)
│   │   ├── learning/     # Daily topics (Bug #2 fixed here)
│   │   ├── lib/          # Email service, Prisma client
│   │   └── server.ts     # Auto-seeding (Bug #3 fixed here)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts       # Test account creation
│   └── Dockerfile
│
├── frontend/              # Next.js 15 + React 19
│   ├── app/
│   ├── modules/
│   │   ├── auth/         # Login, forgot password pages
│   │   └── learning/     # Daily topics, quiz views
│   └── Dockerfile
│
├── docker-compose.yml     # Complete stack setup
├── health-check.sh        # System diagnostics
├── TESTING_PROTOCOL.md    # Step-by-step testing guide
├── DEPLOYMENT_GUIDE.md    # Production deployment
└── README.md             # This file
```

---

## 🛠️ Tech Stack

**Backend:**
- Node.js 20 + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL 16
- JWT Authentication
- SendGrid (optional)

**Frontend:**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- next-intl (i18n)

**DevOps:**
- Docker + Docker Compose
- Health checks
- Auto-seeding
- Multi-stage builds

---

## 💻 Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- npm

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL
npx prisma migrate deploy
npm run dev  # http://localhost:5001
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev  # http://localhost:3000
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed setup instructions.

---

## 🔑 Test Account Credentials

**Shared Test Account:**
- 📧 Email: `test@dailylearn.app`
- 🔒 Password: `Test123!@#`

**Legacy Test Account:**
- 📧 Email: `test@example.com`
- 🔒 Password: `Test123!`

Both accounts are created automatically during database seeding.

---

## 📊 API Endpoints

### Health Check
```bash
GET http://localhost:5001/health

Response:
{
  "status": "healthy",
  "database": {
    "connected": true,
    "users": 2,
    "topics": 3,
    "categories": 8
  }
}
```

### Authentication
```bash
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password    # ✅ Fixed
POST /api/auth/reset-password
POST /api/auth/verify-email
GET  /api/auth/me
```

### Learning
```bash
GET  /api/learning/daily           # ✅ Always returns 3 topics
POST /api/learning/daily/refresh   # Manual refresh
GET  /api/learning/topic/:id
POST /api/learning/topic/:id/mark-read
GET  /api/learning/quiz/:id
POST /api/learning/quiz/:id/submit
GET  /api/learning/progress
```

---

## 🐛 Troubleshooting

### Daily Topics Not Showing 3 Cards?

```bash
# Check backend logs
docker-compose logs backend | grep "DAILY_TOPICS"

# Should see:
# ✅ FINAL: Creating set with exactly 3 topics

# If issue persists, reset daily topics:
docker-compose exec backend npx prisma studio
# Delete DailyTopicSet entries and refresh page
```

### Email Not Sending?

```bash
# For development, leave SENDGRID_API_KEY empty
# Reset link will print in backend console

# For production, get API key from:
# https://app.sendgrid.com/settings/api_keys
```

### Database Connection Failed?

```bash
# Docker: Check containers are running
docker-compose ps

# Local: Check PostgreSQL is running
# macOS: brew services list | grep postgresql
# Linux: sudo systemctl status postgresql
```

See full troubleshooting guide in [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#troubleshooting)

---

## 📈 Production Deployment

### Option 1: Docker on VPS (Recommended)

```bash
# 1. SSH into server
ssh user@your-server.com

# 2. Clone and configure
git clone <your-repo-url>
cd dailylearn-app

# 3. Update environment variables
# Edit docker-compose.yml:
# - Change JWT_SECRET
# - Change database password
# - Add SENDGRID_API_KEY

# 4. Deploy
docker-compose up -d

# 5. Verify
curl http://localhost:5001/health
```

### Option 2: Platform as a Service

- **Frontend:** Vercel, Netlify
- **Backend:** Railway, Render
- **Database:** Railway PostgreSQL, Supabase

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#production-deployment) for detailed instructions.

---

## 🔒 Security

**Production Checklist:**
- ✅ Change default JWT_SECRET
- ✅ Use strong database password
- ✅ Enable HTTPS
- ✅ Set NODE_ENV=production
- ✅ Configure CORS properly
- ✅ Keep dependencies updated

---

## 📚 Documentation

- [Testing Protocol](./TESTING_PROTOCOL.md) - Step-by-step testing guide
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment
- [Health Check Script](./health-check.sh) - System diagnostics

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Run tests: Follow [TESTING_PROTOCOL.md](./TESTING_PROTOCOL.md)
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🎯 Next Steps

1. **Run the app:** `docker-compose up --build`
2. **Test everything:** Follow [TESTING_PROTOCOL.md](./TESTING_PROTOCOL.md)
3. **Deploy to production:** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 📞 Support

- **Bug Reports:** Create an issue with [bug report template](./TESTING_PROTOCOL.md#bug-report-template)
- **Questions:** Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#troubleshooting)
- **Health Check:** Run `./health-check.sh`

---

**Ready to learn something new? Let's go!** 🚀

Login at http://localhost:3000 with `test@dailylearn.app` / `Test123!@#`