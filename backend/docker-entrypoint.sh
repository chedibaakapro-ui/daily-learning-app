#!/bin/sh
set -e

echo "🔄 Waiting for database to be ready..."
until nc -z db 5432; do
  echo "⏳ Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

echo "🔄 Running database migrations..."
npx prisma migrate deploy

echo "✅ Migrations complete!"

echo "🚀 Starting application..."
exec "$@"