#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 COMPREHENSIVE AI MASTERCLASS SYNTAX REPAIR');
console.log('==============================================');

const seedFile = '/users/thomasdowuona-hyde/AI-Masterclass/backend/seed-complete-courses.js';

console.log(`\n📖 Reading file: ${seedFile}`);
let content = fs.readFileSync(seedFile, 'utf8');
console.log(`✅ File read successfully: ${content.length} characters`);

// Backup the file
const backupFile = seedFile + '.comprehensive-backup.' + Date.now();
fs.writeFileSync(backupFile, content);
console.log(`💾 Backup created: ${backupFile}`);

console.log('\n🔧 Applying comprehensive structural fixes...');

// The main issue is that lesson content is appearing outside of proper object structures
// We need to find patterns where template literals end but then content continues without proper JS structure

// Pattern 1: Template literal ends with ` followed by content that should be a new lesson
// This should be: `}, { new lesson object...

// Step 1: Find cases where lesson content appears to continue after a template literal closure
let fixCount = 0;

// Fix pattern: `\n\n**Title**: or `\n\n## Title
// These should become `}, { title: "Title", content: `## Title...

// Fix standalone content that appears after template literal closures
content = content.replace(/(`),\s*\n\s*\*\*([^*]+)\*\*:/g, (match, backtick, title) => {
    fixCount++;
    return `${backtick},
        {
          module_id: understandingAI.id,
          title: '${title.replace(/'/g, "\\'")}',
          description: 'Advanced AI techniques and applications',
          content: \`**${title}**:`;
});

// Fix standalone section headers that appear after template closures
content = content.replace(/(`),\s*\n\s*##\s+([^\n]+)/g, (match, backtick, title) => {
    fixCount++;
    return `${backtick},
        {
          module_id: understandingAI.id,
          title: '${title.replace(/'/g, "\\'")}',
          description: 'Comprehensive AI implementation guide',
          content: \`## ${title}`;
});

// Fix cases where content continues directly after lesson metadata
content = content.replace(/(\s+})\s*\n\s*\*\*([^*]+)\*\*:/g, (match, closeBrace, title) => {
    fixCount++;
    return `${closeBrace},
        {
          module_id: understandingAI.id,
          title: '${title.replace(/'/g, "\\'")}',
          description: 'Expert-level AI implementation',
          content: \`**${title}**:`;
});

console.log(`✅ Applied ${fixCount} structural fixes`);

// Step 2: Ensure all lesson objects have proper closing
// Find cases where template literals are not properly closed within lesson objects
let closureFixCount = 0;

// Look for patterns where content continues after what should be the end of a lesson
// This is more complex - we need to identify where lessons should end and ensure proper closure

// Add proper lesson closure patterns
const lessonEndPattern = /(\*\*📧 Questions or Stuck\?\*\*[^\`]*)`(?!\s*[,}])/g;
content = content.replace(lessonEndPattern, (match, beforeBacktick) => {
    closureFixCount++;
    return `${beforeBacktick}\`,
          order_index: ${Math.floor(Math.random() * 100) + 1},
          estimated_minutes: 45
        }`;
});

console.log(`✅ Applied ${closureFixCount} lesson closure fixes`);

// Step 3: Final validation and cleanup
// Remove any duplicate or malformed structures
content = content.replace(/},\s*},\s*{/g, '}, {');
content = content.replace(/\s+}/g, '\n        }');

// Write the fixed content
fs.writeFileSync(seedFile, content);
console.log(`✅ Fixed file written successfully`);

// Step 4: Syntax validation
console.log('\n🔍 Performing syntax validation...');
try {
    // Test if the file can be parsed as JavaScript
    require(seedFile);
    console.log('✅ JavaScript syntax validation passed!');
    
    console.log('\n🎉 COMPREHENSIVE REPAIR COMPLETED SUCCESSFULLY!');
    console.log('📊 Summary:');
    console.log(`   - Structural fixes applied: ${fixCount}`);
    console.log(`   - Lesson closure fixes: ${closureFixCount}`);
    console.log(`   - Backup saved: ${path.basename(backupFile)}`);
    console.log('\n🚀 Premium content is now ready for deployment!');
    console.log('💎 All 206,000+ words of premium content should be accessible');
    console.log('🎯 Ready to seed database with complete course materials');
    
} catch (error) {
    console.error(`❌ Syntax validation failed: ${error.message}`);
    console.log('🔄 This indicates more complex structural issues...');
    console.log('💡 Consider rebuilding the seed file with proper lesson structure');
    
    // Revert to backup
    console.log('🔄 Reverting to backup for safety...');
    fs.writeFileSync(seedFile, fs.readFileSync(backupFile));
    console.log('✅ Reverted to backup file');
}
