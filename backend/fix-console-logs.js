#!/usr/bin/env node
/**
 * Quick script to replace console.log statements with logger in production routes
 */

const fs = require('fs');
const path = require('path');

// Files that need console.log replacements
const files = [
  'routes/supabase-auth.js',
  'routes/supabase-progress.js', 
  'routes/supabase-interactive.js',
  'routes/interactive.js'
];

// Logger import to add at the top
const loggerImport = `
// Try to import logger, fallback to silent for production
let logger;
try {
  logger = require('../utils/logger');
} catch (error) {
  // Silent fallback for production
  logger = {
    info: () => {},
    error: () => {},
    warn: () => {},
    log: () => {}
  };
}
`;

function fixConsoleLogsInFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⏭️  Skipping ${filePath} - file does not exist`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if logger is already imported
    if (!content.includes('require(\'../utils/logger\')')) {
      // Add logger import after the first require statement
      const firstRequireIndex = content.indexOf('require(');
      if (firstRequireIndex !== -1) {
        const lineEnd = content.indexOf('\n', firstRequireIndex);
        content = content.slice(0, lineEnd + 1) + loggerImport + content.slice(lineEnd + 1);
        modified = true;
      }
    }

    // Replace console.log statements
    const replacements = [
      // console.log -> logger.info (for informational messages)
      { from: /console\.log\(/g, to: 'logger.info(' },
      
      // console.error -> logger.error (keep as is, but ensure consistency)
      { from: /console\.error\(/g, to: 'logger.error(' },
      
      // console.warn -> logger.warn
      { from: /console\.warn\(/g, to: 'logger.warn(' },
      
      // console.info -> logger.info  
      { from: /console\.info\(/g, to: 'logger.info(' }
    ];

    replacements.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed console.log statements in ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed in ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log('🧹 Cleaning up console.log statements in production routes...\n');

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  fixConsoleLogsInFile(fullPath);
});

console.log('\n🎉 Console.log cleanup completed!');
console.log('📝 All console statements replaced with proper logger calls');
console.log('🔇 Logger will be silent in production if utils/logger is not available');