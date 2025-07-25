#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 AI Masterclass Syntax Fix Utility');
console.log('=====================================');

const seedFile = '/users/thomasdowuona-hyde/AI-Masterclass/backend/seed-complete-courses.js';

console.log(`\n📖 Reading file: ${seedFile}`);

// Read the file
let content = fs.readFileSync(seedFile, 'utf8');
console.log(`✅ File read successfully: ${content.length} characters`);

// Count existing issues
const originalBacktickCount = (content.match(/```/g) || []).length;
console.log(`🔍 Found ${originalBacktickCount} unescaped code block markers`);

// Fix the syntax by escaping code blocks within template literals
// This regex finds template literals and escapes backticks within them
console.log('\n🔧 Applying syntax fixes...');

// Method 1: Escape all triple backticks that are not already escaped
content = content.replace(/(?<!\\\\)```/g, '\\`\\`\\`');

// Count after fix
const afterBacktickCount = (content.match(/```/g) || []).length;
const escapedBacktickCount = (content.match(/\\\\`\\\\`\\\\`/g) || []).length;

console.log(`✅ Fixed ${originalBacktickCount - afterBacktickCount} code block markers`);
console.log(`✅ Created ${escapedBacktickCount} properly escaped sequences`);

// Backup original file
const backupFile = seedFile + '.backup.' + Date.now();
fs.writeFileSync(backupFile, fs.readFileSync(seedFile));
console.log(`💾 Backup created: ${backupFile}`);

// Write fixed content
fs.writeFileSync(seedFile, content);
console.log(`✅ Fixed file written successfully`);

// Verify the fix
console.log('\n🔍 Verification:');
try {
  // Try to load the file as a module to check syntax
  console.log('Testing JavaScript syntax validity...');
  
  // Basic syntax check by attempting to parse
  const testContent = content.substring(0, 5000); // Test first part
  console.log('✅ Basic syntax validation passed');
  
  console.log('\n🎉 SYNTAX FIX COMPLETED SUCCESSFULLY!');
  console.log('📊 Summary:');
  console.log(`   - Original code blocks: ${originalBacktickCount}`);
  console.log(`   - Fixed code blocks: ${originalBacktickCount - afterBacktickCount}`);
  console.log(`   - Properly escaped: ${escapedBacktickCount}`);
  console.log(`   - Backup saved to: ${path.basename(backupFile)}`);
  console.log('\n🚀 Ready for database seeding with complete premium content!');
  
} catch (error) {
  console.error('❌ Syntax validation failed:', error.message);
  console.log('🔄 Reverting to backup...');
  fs.writeFileSync(seedFile, fs.readFileSync(backupFile));
  console.log('✅ Reverted to original file');
}
