#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixCodeBlocks(filePath) {
  console.log(`Fixing code blocks in: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix code blocks - replace ``` with \`\`\`
  content = content.replace(/```/g, '\\`\\`\\`');
  
  // Fix any unescaped template literals within strings
  // This is more complex, but let's handle basic cases
  
  // Fix unescaped backticks in strings
  content = content.replace(/(?<!\\)`(?!\\)/g, '\\`');
  
  // Fix the escaped code blocks we just made to be properly escaped
  content = content.replace(/\\`\\`\\`/g, '\\`\\`\\`');
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed: ${filePath}`);
}

// Fix the main seed file
const seedFile = '/users/thomasdowuona-hyde/AI-Masterclass/backend/seed-complete-courses.js';
fixCodeBlocks(seedFile);

console.log('🎯 All code blocks fixed!');
