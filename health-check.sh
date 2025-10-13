#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🏥 Daily Learning App - Health Check"
echo "====================================="
echo ""

# Check if backend is running
echo "🔍 Checking Backend..."
BACKEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5001/health)

if [ "$BACKEND_RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
    
    # Get detailed health info
    HEALTH_DATA=$(curl -s http://localhost:5001/health)
    echo "$HEALTH_DATA" | jq '.' 2>/dev/null || echo "$HEALTH_DATA"
else
    echo -e "${RED}❌ Backend is not responding (HTTP $BACKEND_RESPONSE)${NC}"
    echo "   Expected: 200"
    echo "   Make sure backend is running: npm run dev (in backend directory)"
fi

echo ""

# Check if frontend is running
echo "🔍 Checking Frontend..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

if [ "$FRONTEND_RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend is not responding (HTTP $FRONTEND_RESPONSE)${NC}"
    echo "   Expected: 200"
    echo "   Make sure frontend is running: npm run dev (in frontend directory)"
fi

echo ""

# Check if Docker containers are running (if using Docker)
if command -v docker &> /dev/null; then
    echo "🔍 Checking Docker Containers..."
    
    if docker ps | grep -q "dailylearn"; then
        echo -e "${GREEN}✅ Docker containers are running${NC}"
        docker ps --filter "name=dailylearn" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        echo -e "${YELLOW}⚠️  No Docker containers found${NC}"
        echo "   If using Docker, run: docker-compose up"
    fi
fi

echo ""
echo "====================================="

# Overall status
if [ "$BACKEND_RESPONSE" -eq 200 ] && [ "$FRONTEND_RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✅ All systems operational!${NC}"
    echo ""
    echo "🔗 Access the app:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:5001"
    echo "   - Health Check: http://localhost:5001/health"
    echo ""
    echo "🔑 Test Account:"
    echo "   - Email: test@dailylearn.app"
    echo "   - Password: Test123!@#"
    exit 0
else
    echo -e "${RED}❌ Some systems are not operational${NC}"
    echo ""
    echo "📋 Troubleshooting:"
    echo "   1. Check if services are running"
    echo "   2. Review error logs"
    echo "   3. Try restarting services"
    exit 1
fi