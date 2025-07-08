#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the API URL from environment variable
const apiUrl = process.env.VITE_API_URL || 'http://localhost:8080';
const grpcUrl = process.env.VITE_GRPC_URL || 'http://localhost:50051';

console.log('🔧 Replacing API URLs in built files...');
console.log('API URL:', apiUrl);
console.log('gRPC URL:', grpcUrl);

// Function to recursively find and replace in files
function replaceInDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      replaceInDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.html')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace localhost URLs with production URLs
      const originalContent = content;
      content = content.replace(/http:\/\/localhost:8080/g, apiUrl);
      content = content.replace(/http:\/\/localhost:50051/g, grpcUrl);
      content = content.replace(/https:\/\/localhost:8080/g, apiUrl);
      content = content.replace(/https:\/\/localhost:50051/g, grpcUrl);
      
      // If content changed, write it back
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
      }
    }
  }
}

// Start from the dist directory
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  replaceInDirectory(distPath);
  console.log('✅ API URL replacement completed!');
} else {
  console.error('❌ dist directory not found. Run "npm run build" first.');
  process.exit(1);
} 