import dotenv from 'dotenv';

// Try loading from the backend directory
dotenv.config();

// If DATABASE_URL still not found, try explicit path
if (!process.env.DATABASE_URL) {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
}

// Final check
if (!process.env.DATABASE_URL) {
  console.error('❌ Could not load .env file');
  console.error('Looking in:', require('path').resolve(__dirname, '../.env'));
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('DATABASE_URL found:', process.env.DATABASE_URL.substring(0, 30) + '...');