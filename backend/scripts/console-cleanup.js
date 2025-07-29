#!/usr/bin/env node

/**
 * Console Statement Cleanup Script for AI Masterclass
 * 
 * This script identifies and replaces console.log, console.error, console.warn, 
 * and console.debug statements with proper logging throughout the codebase.
 * 
 * Features:
 * - Preserves test files (keeps console statements for debugging)
 * - Replaces with appropriate logger calls
 * - Adds necessary imports
 * - Generates before/after statistics
 * - Creates backup files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ConsoleCleanup {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.stats = {
      filesProcessed: 0,
      consoleStatementsFound: 0,
      consoleStatementsReplaced: 0,
      errorsEncountered: 0,
      filesWithBackups: 0
    };
    
    // Patterns to identify console statements
    this.consolePatterns = {
      log: /console\.log\s*\(/g,
      error: /console\.error\s*\(/g,
      warn: /console\.warn\s*\(/g,
      debug: /console\.debug\s*\(/g,
      info: /console\.info\s*\(/g
    };
    
    // Files to exclude from processing
    this.excludePatterns = [
      /node_modules/,
      /\.git/,
      /logs\//,
      /dist\//,
      /build\//,
      /\.test\.js$/,
      /\.spec\.js$/,
      /jest\.config\.js$/,
      /jest\.setup\.js$/,
      /\.min\.js$/,
      /console-cleanup\.js$/  // Don't process this script itself
    ];
    
    // Test file patterns (preserve console statements but organize them)
    this.testPatterns = [
      /.*\.test\.js$/,
      /.*\.spec\.js$/,
      /__tests__\//,
      /e2e\//,
      /testing\//
    ];
  }

  /**
   * Main execution method
   */
  async run() {
    console.log('🧹 Starting Console Cleanup for AI Masterclass...\n');
    
    try {
      // Get initial statistics
      await this.generateInitialStats();
      
      // Find all JavaScript files
      const jsFiles = await this.findJavaScriptFiles();
      console.log(`📁 Found ${jsFiles.length} JavaScript files to analyze\n`);
      
      // Process files
      for (const filePath of jsFiles) {
        await this.processFile(filePath);
      }
      
      // Generate final report
      await this.generateFinalReport();
      
    } catch (error) {
      console.error('❌ Fatal error during cleanup:', error);
      process.exit(1);
    }
  }

  /**
   * Generate initial statistics
   */
  async generateInitialStats() {
    console.log('📊 Generating initial statistics...');
    
    try {
      const result = execSync(
        `find "${this.projectRoot}" -name "*.js" -not -path "*/node_modules/*" | xargs grep -c "console\\." 2>/dev/null || true`,
        { encoding: 'utf8' }
      );
      
      const lines = result.trim().split('\n').filter(line => line);
      let totalConsoleStatements = 0;
      
      lines.forEach(line => {
        const match = line.match(/:(\d+)$/);
        if (match) {
          totalConsoleStatements += parseInt(match[1]);
        }
      });
      
      console.log(`🔍 Initial scan found ${totalConsoleStatements} console statements across ${lines.length} files\n`);
      
    } catch (error) {
      console.log('⚠️  Could not generate initial stats, continuing with cleanup...\n');
    }
  }

  /**
   * Find all JavaScript files in the project
   */
  async findJavaScriptFiles() {
    const jsFiles = [];
    
    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const relativePath = path.relative(this.projectRoot, fullPath);
        
        // Skip excluded patterns
        if (this.excludePatterns.some(pattern => pattern.test(relativePath))) {
          return;
        }
        
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (stat.isFile() && fullPath.endsWith('.js')) {
          jsFiles.push(fullPath);
        }
      });
    };
    
    scanDirectory(this.projectRoot);
    return jsFiles;
  }

  /**
   * Process individual file
   */
  async processFile(filePath) {
    try {
      const relativePath = path.relative(this.projectRoot, filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      const isTestFile = this.testPatterns.some(pattern => pattern.test(relativePath));
      
      // Count console statements in this file
      let consoleCount = 0;
      Object.values(this.consolePatterns).forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) consoleCount += matches.length;
      });
      
      if (consoleCount === 0) {
        return; // No console statements, skip
      }
      
      this.stats.filesProcessed++;
      this.stats.consoleStatementsFound += consoleCount;
      
      console.log(`📝 Processing: ${relativePath} (${consoleCount} console statements)`);
      
      if (isTestFile) {
        // For test files, just organize and add context
        await this.processTestFile(filePath, content);
      } else {
        // For regular files, replace with proper logging
        await this.processRegularFile(filePath, content);
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
      this.stats.errorsEncountered++;
    }
  }

  /**
   * Process test files - organize console statements and add context
   */
  async processTestFile(filePath, content) {
    let modifiedContent = content;
    let hasChanges = false;
    
    // Add better context to existing console statements in tests
    const contextualPatterns = [
      {
        pattern: /console\.log\s*\(\s*(['"`])(.*?)\1\s*,\s*(.*?)\s*\)/g,
        replacement: "console.log('[TEST]', $1$2$1, $3)"
      },
      {
        pattern: /console\.log\s*\(\s*([^,)]+)\s*\)/g,
        replacement: "console.log('[TEST]', $1)"
      },
      {
        pattern: /console\.error\s*\(\s*(['"`])(.*?)\1\s*,\s*(.*?)\s*\)/g,
        replacement: "console.error('[TEST ERROR]', $1$2$1, $3)"
      },
      {
        pattern: /console\.error\s*\(\s*([^,)]+)\s*\)/g,
        replacement: "console.error('[TEST ERROR]', $1)"
      }
    ];
    
    contextualPatterns.forEach(({ pattern, replacement }) => {
      if (pattern.test(modifiedContent)) {
        modifiedContent = modifiedContent.replace(pattern, replacement);
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      await this.writeFileWithBackup(filePath, modifiedContent);
      console.log(`   ✅ Added test context to console statements`);
    }
  }

  /**
   * Process regular files - replace console statements with proper logging
   */
  async processRegularFile(filePath, content) {
    let modifiedContent = content;
    let replacementCount = 0;
    const isBackendFile = filePath.includes('/backend/');
    
    // Determine the correct logger import and calls based on file type
    const loggerConfig = isBackendFile ? {
      import: "const logger = require('../utils/logger');",
      calls: {
        log: 'logger.info',
        info: 'logger.info', 
        warn: 'logger.warn',
        error: 'logger.error',
        debug: 'logger.debug'
      }
    } : {
      import: "import logger from '../utils/logger';",
      calls: {
        log: 'logger.info',
        info: 'logger.info',
        warn: 'logger.warn', 
        error: 'logger.error',
        debug: 'logger.debug'
      }
    };

    // Replace console statements
    Object.entries(this.consolePatterns).forEach(([type, pattern]) => {
      const matches = modifiedContent.match(pattern);
      if (matches) {
        const loggerMethod = loggerConfig.calls[type];
        if (loggerMethod) {
          modifiedContent = modifiedContent.replace(pattern, `${loggerMethod}(`);
          replacementCount += matches.length;
        }
      }
    });

    // Add logger import if we made replacements and it's not already imported
    if (replacementCount > 0) {
      const hasLoggerImport = isBackendFile ? 
        /require\(['"`][^'"`]*logger['"`]\)/.test(modifiedContent) :
        /import.*logger.*from/.test(modifiedContent);
        
      if (!hasLoggerImport) {
        // Find the right place to add the import
        const lines = modifiedContent.split('\n');
        let insertIndex = 0;
        
        // Find last import/require statement
        for (let i = 0; i < lines.length; i++) {
          if (isBackendFile && /^const.*require\(/.test(lines[i])) {
            insertIndex = i + 1;
          } else if (!isBackendFile && /^import/.test(lines[i])) {
            insertIndex = i + 1;
          }
        }
        
        lines.splice(insertIndex, 0, loggerConfig.import);
        modifiedContent = lines.join('\n');
      }
      
      await this.writeFileWithBackup(filePath, modifiedContent);
      this.stats.consoleStatementsReplaced += replacementCount;
      console.log(`   ✅ Replaced ${replacementCount} console statements with logger calls`);
    }
  }

  /**
   * Write file with backup
   */
  async writeFileWithBackup(filePath, content) {
    // Create backup
    const backupPath = `${filePath}.backup`;
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(filePath, backupPath);
      this.stats.filesWithBackups++;
    }
    
    // Write new content
    fs.writeFileSync(filePath, content, 'utf8');
  }

  /**
   * Generate final report
   */
  async generateFinalReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 CONSOLE CLEANUP COMPLETE!');
    console.log('='.repeat(60));
    
    console.log('\n📊 STATISTICS:');
    console.log(`   Files Processed: ${this.stats.filesProcessed}`);
    console.log(`   Console Statements Found: ${this.stats.consoleStatementsFound}`);
    console.log(`   Console Statements Replaced: ${this.stats.consoleStatementsReplaced}`);
    console.log(`   Files with Backups: ${this.stats.filesWithBackups}`);
    console.log(`   Errors Encountered: ${this.stats.errorsEncountered}`);
    
    // Generate post-cleanup statistics
    console.log('\n🔍 POST-CLEANUP VERIFICATION:');
    try {
      const result = execSync(
        `find "${this.projectRoot}" -name "*.js" -not -path "*/node_modules/*" -not -name "*.backup" | xargs grep -c "console\\." 2>/dev/null || true`,
        { encoding: 'utf8' }
      );
      
      const lines = result.trim().split('\n').filter(line => line && !line.includes('console-cleanup.js'));
      let remainingConsoleStatements = 0;
      
      lines.forEach(line => {
        const match = line.match(/:(\d+)$/);
        if (match) {
          remainingConsoleStatements += parseInt(match[1]);
        }
      });
      
      console.log(`   Remaining Console Statements: ${remainingConsoleStatements}`);
      console.log(`   Cleanup Effectiveness: ${Math.round(((this.stats.consoleStatementsFound - remainingConsoleStatements) / this.stats.consoleStatementsFound) * 100)}%`);
      
    } catch (error) {
      console.log('   Could not generate post-cleanup stats');
    }
    
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Review the changes in files with .backup extensions');
    console.log('   2. Test your application to ensure logging works correctly');
    console.log('   3. Run ESLint to verify console-related warnings are resolved');
    console.log('   4. Remove .backup files once you\'re satisfied with the changes');
    
    console.log('\n🔧 TO RESTORE BACKUPS (if needed):');
    console.log('   find . -name "*.backup" -exec sh -c \'mv "$1" "${1%.backup}"\' _ {} \\;');
    
    console.log('\n✨ Happy coding with proper logging! ✨\n');
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  const cleanup = new ConsoleCleanup();
  cleanup.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ConsoleCleanup;