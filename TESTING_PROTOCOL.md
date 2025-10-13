# 🧪 Daily Learning App - Testing Protocol

## 📋 Overview
This document provides a step-by-step testing checklist to ensure the application works correctly across all environments.

---

## 🔑 Test Account Credentials

**Shared Test Account (Use This for All Testing):**
- 📧 Email: `test@dailylearn.app`
- 🔒 Password: `Test123!@#`

This account is automatically created when you seed the database.

---

## ✅ Pre-Testing Checklist

Before testing ANY feature, verify:

```bash
□ Backend is running (http://localhost:5001/health returns healthy)
□ Frontend is running (http://localhost:3000 loads)
□ Database has test data (see health check)
□ Using Chrome Incognito window (fresh state)
□ Console is open (F12) to check for errors
```

---

## 🧪 Testing Procedure

### **Phase 1: Environment Verification**

#### 1.1 Health Check
```bash
# Run health check
curl http://localhost:5001/health

# Expected response:
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

**Checklist:**
```
□ Status is "healthy"
□ Database is connected
□ Users count is at least 1
□ Topics count is at least 3
□ Categories count is at least 8
```

---

### **Phase 2: Authentication Flow Testing**

#### 2.1 Login Test (3 attempts required)
```bash
Test Account: test@dailylearn.app
Password: Test123!@#
```

**Test Steps:**
```
□ Open http://localhost:3000/login in Incognito
□ Enter test@dailylearn.app
□ Enter Test123!@#
□ Click "Login"
□ VERIFY: Redirects to home page
□ VERIFY: No console errors
□ REPEAT 2 more times (total 3 tests)
```

#### 2.2 Forgot Password Test (Bug Fix Verification)
```bash
# Test forgot password flow 3 times
```

**Test Steps (Attempt 1):**
```
□ Go to http://localhost:3000/auth/forgot-password
□ Enter: test@dailylearn.app
□ Click "Send Reset Link"
□ VERIFY: Success message appears
□ VERIFY: Check backend console for email log
□ VERIFY: Reset link is shown in console (if SendGrid not configured)
□ VERIFY: No errors in browser console
```

**Test Steps (Attempt 2 & 3):**
```
□ Repeat above steps
□ VERIFY: Consistent behavior each time
```

**If SendGrid Configured:**
```
□ Check email inbox
□ VERIFY: Email received within 1 minute
□ Click reset link
□ Enter new password
□ VERIFY: Password reset successful
□ Login with new password
□ VERIFY: Login works
```

---

### **Phase 3: Daily Topics Testing (Bug Fix Verification)**

#### 3.1 Initial Daily Topics Load
```bash
# THIS IS THE CRITICAL BUG FIX TEST
# Must ALWAYS show exactly 3 cards
```

**Test Steps (10 attempts required):**
```
For each attempt (1-10):
□ Login with test@dailylearn.app
□ Navigate to home page
□ COUNT the number of topic cards displayed
□ VERIFY: Exactly 3 cards are shown
□ VERIFY: Each card has:
  - Category icon and name
  - Topic title
  - Estimated read time
  - Three difficulty buttons (Simple, Medium, Advanced)
□ Check browser console - no errors
□ Logout
□ Clear browser cache (Ctrl+Shift+Delete)
□ Repeat
```

**Expected Result:**
```
ALL 10 attempts MUST show exactly 3 cards.
NO attempt should show 0, 1, 2, or 4+ cards.
```

#### 3.2 Daily Topics Refresh Test
```bash
# Test the manual refresh feature
```

**Test Steps:**
```
□ Login and view daily topics (count = 3)
□ Click "🔄 Refresh Topics" button
□ VERIFY: Loading state appears
□ VERIFY: New 3 topics appear
□ VERIFY: Topics are different from before
□ Check console - no errors
□ Repeat refresh 5 times
□ VERIFY: Always get exactly 3 topics
```

#### 3.3 Complete Topic Flow Test
```bash
# Test reading and quiz for each difficulty
```

**For SIMPLE difficulty:**
```
□ Click "Simple" button on first topic
□ VERIFY: Topic content loads
□ VERIFY: Content is at simple reading level
□ Read content
□ Click "Mark as Read"
□ VERIFY: Quiz appears with 1 question
□ Answer the question
□ Click "Submit Quiz"
□ VERIFY: Results page appears
□ VERIFY: Score is displayed
□ Click "Continue Learning"
□ VERIFY: Returns to daily topics
□ VERIFY: Progress shows 1/3 completed
```

**For MEDIUM difficulty:**
```
□ Repeat above steps with "Medium" button on second topic
□ VERIFY: Content is more detailed than simple
□ VERIFY: Progress shows 2/3 completed
```

**For ADVANCED difficulty:**
```
□ Repeat above steps with "Advanced" button on third topic
□ VERIFY: Content is most technical
□ VERIFY: Progress shows 3/3 completed
□ VERIFY: Celebration message/animation appears
```

---

### **Phase 4: Auto-Seeding Verification (Bug Fix Verification)**

#### 4.1 Test Auto-Seed on Empty Database
```bash
# Stop all services
docker-compose down -v  # This deletes the database

# Start services
docker-compose up -d

# Watch backend logs
docker-compose logs -f backend
```

**Expected Logs:**
```
□ "🔍 Checking if database needs seeding..."
□ "📦 Database is empty. Running auto-seed..."
□ "✅ Database seeded successfully!"
□ "🔑 Test User Credentials:"
□ "   📧 Email: test@dailylearn.app"
□ "🚀 Server running..."
```

**Verification:**
```
□ No manual `npm run seed` was needed
□ Database was automatically populated
□ Test account was created
□ Can login immediately
□ Daily topics load with 3 cards
```

---

### **Phase 5: Docker Environment Testing**

#### 5.1 Full Docker Stack Test
```bash
# Clean start
docker-compose down -v
docker-compose up --build

# Wait for services to start (30-60 seconds)
```

**Test Steps:**
```
□ VERIFY: All 3 containers running (db, backend, frontend)
□ VERIFY: http://localhost:5001/health returns healthy
□ VERIFY: http://localhost:3000 loads
□ VERIFY: Can login with test@dailylearn.app
□ VERIFY: Daily topics show exactly 3 cards
□ VERIFY: Can complete a full topic flow
□ VERIFY: No console errors anywhere
```

#### 5.2 Service Restart Test
```bash
# Test that data persists across restarts
```

**Test Steps:**
```
□ Complete 1 topic
□ Note which topic was completed
□ Stop services: docker-compose down
□ Start services: docker-compose up -d
□ Login again
□ VERIFY: Previous progress is saved
□ VERIFY: Completed topic is marked complete
□ VERIFY: Still showing exactly 3 topics
```

---

## 🎬 Screen Recording Checklist

Record your screen during testing and verify:

```
□ Login works smoothly
□ Forgot password shows proper messages
□ Daily topics always show exactly 3 cards
□ Refresh button generates new topics
□ Topic reading flow works end-to-end
□ Quiz submission and results display correctly
□ No errors visible in console
□ No UI glitches or broken layouts
```

---

## 🐛 Bug Report Template

If you find a bug, report it with this format:

```markdown
### Bug Description
[Clear description of what went wrong]

### Steps to Reproduce
1. [First step]
2. [Second step]
3. [Third step]

### Expected Behavior
[What should have happened]

### Actual Behavior
[What actually happened]

### Environment
- Browser: [Chrome/Firefox/Safari]
- Environment: [Local/Docker/Production]
- Test Account: test@dailylearn.app

### Console Errors
[Copy any errors from browser console]

### Screenshots/Video
[Attach if available]
```

---

## ✅ Final Deployment Checklist

Before deploying to production:

```bash
□ All tests pass locally
□ All tests pass in Docker
□ Auto-seeding works
□ Daily topics ALWAYS show exactly 3 cards
□ Forgot password flow works (with SendGrid configured)
□ No console errors
□ Health check endpoint returns healthy
□ Screen recording shows everything working
□ Test account verified in production database
□ Production environment variables configured
□ JWT_SECRET changed from default
□ SendGrid API key configured (if using email)
```

---

## 🆘 Common Issues & Solutions

### Issue: "Not enough topics in database"
**Solution:** Run seed manually: `npm run seed` in backend directory

### Issue: Daily topics showing < 3 cards
**Solution:** 
1. Check backend logs for errors
2. Verify database has at least 3 topics
3. Clear user's completed topics if needed

### Issue: Forgot password email not sending
**Solution:**
1. Check SENDGRID_API_KEY is set
2. Check backend console logs
3. If testing without SendGrid, check console for reset link

### Issue: Docker containers not starting
**Solution:**
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Issue: Database connection failed
**Solution:**
```bash
# Check PostgreSQL is running
docker-compose ps
# Restart database
docker-compose restart db
```

---

## 📞 Support

If you encounter issues:
1. Check console errors first
2. Review backend logs: `docker-compose logs backend`
3. Verify health check: `curl http://localhost:5001/health`
4. Create bug report using template above

---

**Remember:** Always test with the shared test account `test@dailylearn.app` for consistency!