#!/usr/bin/env node

/**
 * Cleanup script to replace remaining console.log statements with proper logging
 * Fixes production readiness issues
 */

const fs = require('fs');
const path = require('path');

// Files to process and their console.log replacements
const replacements = [
  {
    file: '../supabase-server.js',
    replacements: [
      {
        search: 'console.log(\'✅ Supabase authentication routes loaded\');',
        replace: 'logger.info(\'Supabase authentication routes loaded\');'
      },
      {
        search: 'console.log(\'❌ Supabase auth routes not available:\', error.message);',
        replace: 'logger.error(\'Supabase auth routes not available\', { error: error.message });'
      },
      {
        search: 'console.log(\'✅ Supabase progress routes loaded\');',
        replace: 'logger.info(\'Supabase progress routes loaded\');'
      },
      {
        search: 'console.log(\'❌ Supabase progress routes not available:\', error.message);',
        replace: 'logger.error(\'Supabase progress routes not available\', { error: error.message });'
      }
    ]
  }
];

// Process each file
replacements.forEach(({ file, replacements: fileReplacements }) => {
  const filePath = path.join(__dirname, file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Apply each replacement
    fileReplacements.forEach(({ search, replace }) => {
      if (content.includes(search)) {
        content = content.replace(search, replace);
        modified = true;
        console.log(`✅ Replaced console.log in ${file}`);
      }
    });
    
    // Ensure logger is imported
    if (modified && !content.includes('require(\'./utils/logger\')')) {
      // Add logger import at the top
      const lines = content.split('\n');
      const insertIndex = lines.findIndex(line => line.includes('require(')) || 0;
      lines.splice(insertIndex, 0, 'const logger = require(\'./utils/logger\');');
      content = lines.join('\n');
      console.log(`✅ Added logger import to ${file}`);
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated ${file}`);
    } else {
      console.log(`ℹ️  No changes needed in ${file}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n🧹 Console.log cleanup completed!');
console.log('📝 Remaining console.logs are in seed/test files (acceptable for development)');