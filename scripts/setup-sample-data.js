#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDataDir = path.join(__dirname, '..', 'public', 'data');
const distDataDir = path.join(__dirname, '..', 'dist', 'data');

// Ensure directories exist
if (!fs.existsSync(distDataDir)) {
  fs.mkdirSync(distDataDir, { recursive: true });
}

// Copy data files from public to dist
const files = ['positions_current.json', 'snapshots.ndjson', 'transactions.ndjson'];

files.forEach(file => {
  const srcPath = path.join(publicDataDir, file);
  const destPath = path.join(distDataDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Copied ${file} to dist/data/`);
  } else {
    console.warn(`⚠️  Warning: ${file} not found in public/data/`);
  }
});

console.log('📊 Sample data setup complete!');