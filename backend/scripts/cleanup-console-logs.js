#!/usr/bin/env node

/**
 * Cleanup script to replace remaining console.log statements with proper logging
 * Fixes production readiness issues
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Files to process and their console.log replacements
const replacements = [
  {
    file: '../supabase-server.js',
    replacements: [
      {
        search: 'logger.info(\'✅ Supabase authentication routes loaded\');',
        replace: 'logger.info(\'Supabase authentication routes loaded\');'
      },
      {
        search: 'logger.info(\'❌ Supabase auth routes not available:\', error.message);',
        replace: 'logger.error(\'Supabase auth routes not available\', { error: error.message });'
      },
      {
        search: 'logger.info(\'✅ Supabase progress routes loaded\');',
        replace: 'logger.info(\'Supabase progress routes loaded\');'
      },
      {
        search: 'logger.info(\'❌ Supabase progress routes not available:\', error.message);',
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
        logger.info(`✅ Replaced console.log in ${file}`);
      }
    });
    
    // Ensure logger is imported
    if (modified && !content.includes('require(\'./utils/logger\')')) {
      // Add logger import at the top
      const lines = content.split('\n');
      const insertIndex = lines.findIndex(line => line.includes('require(')) || 0;
      lines.splice(insertIndex, 0, 'const logger = require(\'./utils/logger\');');
      content = lines.join('\n');
      logger.info(`✅ Added logger import to ${file}`);
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      logger.info(`✅ Updated ${file}`);
    } else {
      logger.info(`ℹ️  No changes needed in ${file}`);
    }
    
  } catch (error) {
    logger.error(`❌ Error processing ${file}:`, error.message);
  }
});

logger.info('\n🧹 Console.log cleanup completed!');
logger.info('📝 Remaining console.logs are in seed/test files (acceptable for development)');