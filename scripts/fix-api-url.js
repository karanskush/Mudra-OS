#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the current .env file
const envPath = path.join(__dirname, '..', '.env');

try {
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace the VITE_API_URL with the correct Railway backend URL
  const newEnvContent = envContent.replace(
    /VITE_API_URL=.*/,
    'VITE_API_URL=https://backend-api-production-2efe.up.railway.app'
  );
  
  // Write the updated content back
  fs.writeFileSync(envPath, newEnvContent);
  
  console.log('✅ Successfully updated VITE_API_URL in .env file');
  console.log('🔗 New API URL: https://backend-api-production-2efe.up.railway.app');
  console.log('');
  console.log('📝 You may need to restart your development server for changes to take effect.');
  
} catch (error) {
  console.error('❌ Error updating .env file:', error.message);
  console.log('');
  console.log('🔧 Manual fix required:');
  console.log('1. Open the .env file');
  console.log('2. Change VITE_API_URL=/api to VITE_API_URL=https://backend-api-production-2efe.up.railway.app');
  console.log('3. Save the file and restart your development server');
} 