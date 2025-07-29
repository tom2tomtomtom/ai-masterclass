#!/usr/bin/env node

/**
 * SIMPLIFIED MASTER SEEDING SCRIPT
 * Quick test version to verify the approach works
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');
require('dotenv').config();

logger.info('🚀 SIMPLIFIED MASTER SEEDING TEST');
logger.info('=================================');

// Check environment
logger.info('📋 Environment Check:');
logger.info('- Supabase URL:', process.env.SUPABASE_URL ? 'Found' : 'Missing');
logger.info('- Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Found' : 'Missing');
logger.info('- Current Dir:', process.cwd());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function simpleSeed() {
  try {
    logger.info('\n1️⃣ Testing database connection...');
    
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('courses')
      .select('count', { count: 'exact', head: true });
    
    if (testError) {
      logger.error('❌ Database connection failed:', testError);
      return false;
    }
    
    logger.info('✅ Database connection successful');
    logger.info(`📊 Current courses: ${testData || 0}`);
    
    logger.info('\n2️⃣ Finding markdown files...');
    
    // Find markdown files
    const rootDir = path.join(__dirname, '..');
    const markdownFiles = [];
    
    function findFiles(dir, depth = 0) {
      if (depth > 3) return; // Limit depth to avoid infinite loops
      
      try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          if (item.startsWith('.') || item === 'node_modules') continue;
          
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            findFiles(fullPath, depth + 1);
          } else if (item.endsWith('.md') && !item.toLowerCase().includes('readme')) {
            markdownFiles.push({
              path: fullPath,
              name: item,
              size: stat.size
            });
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }
    
    findFiles(rootDir);
    
    logger.info(`📄 Found ${markdownFiles.length} markdown files`);
    
    // Show top 10 largest files
    const sortedFiles = markdownFiles
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);
    
    logger.info('\n📋 Top 10 largest files:');
    sortedFiles.forEach((file, i) => {
      logger.info(`  ${i + 1}. ${path.basename(file.name)} (${Math.round(file.size / 1024)}KB)`);
    });
    
    logger.info('\n3️⃣ Testing content processing...');
    
    // Process first few files as test
    const testFiles = sortedFiles.slice(0, 3);
    let processedCount = 0;
    
    for (const file of testFiles) {
      try {
        const content = fs.readFileSync(file.path, 'utf8');
        const title = path.basename(file.name, '.md')
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        
        logger.info(`  📝 ${title}: ${content.length} characters`);
        processedCount++;
        
      } catch (error) {
        logger.error(`  ❌ Error reading ${file.name}:`, error.message);
      }
    }
    
    logger.info(`✅ Successfully processed ${processedCount}/${testFiles.length} test files`);
    
    logger.info('\n4️⃣ Database seeding test...');
    
    // Clear existing test data
    await supabase.from('lessons').delete().eq('title', 'Test Lesson');
    await supabase.from('modules').delete().eq('title', 'Test Module');
    await supabase.from('courses').delete().eq('title', 'Test Course');
    
    // Create test course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        title: 'Test Course',
        description: 'Test course for master seeding',
        level: 1,
        order_index: 999,
        estimated_hours: 1,
        status: 'published',
        objectives: ['Test objective']
      })
      .select()
      .single();
    
    if (courseError) {
      logger.error('❌ Course creation failed:', courseError);
      return false;
    }
    
    logger.info('✅ Test course created');
    
    // Create test module
    const { data: module, error: moduleError } = await supabase
      .from('modules')
      .insert({
        course_id: course.id,
        title: 'Test Module',
        description: 'Test module for master seeding',
        order_index: 1,
        module_type: 'lesson',
        estimated_minutes: 30,
        difficulty: 'beginner'
      })
      .select()
      .single();
    
    if (moduleError) {
      logger.error('❌ Module creation failed:', moduleError);
      return false;
    }
    
    logger.info('✅ Test module created');
    
    // Create test lesson with real content
    const testContent = testFiles.length > 0 ? 
      fs.readFileSync(testFiles[0].path, 'utf8').substring(0, 5000) : 
      'Test lesson content';
    
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        module_id: module.id,
        title: 'Test Lesson',
        content: testContent,
        order_index: 1,
        lesson_type: 'content',
        estimated_minutes: 15,
        difficulty: 'beginner',
        status: 'published'
      })
      .select()
      .single();
    
    if (lessonError) {
      logger.error('❌ Lesson creation failed:', lessonError);
      return false;
    }
    
    logger.info('✅ Test lesson created with real content');
    
    logger.info('\n🎉 SIMPLIFIED SEEDING TEST SUCCESSFUL!');
    logger.info('=====================================');
    logger.info(`📄 Files found: ${markdownFiles.length}`);
    logger.info(`📝 Files processed: ${processedCount}`);
    logger.info('✅ Database operations: Working');
    logger.info('✅ Content processing: Working');
    logger.info('✅ Ready for full seeding');
    
    // Clean up test data
    await supabase.from('lessons').delete().eq('id', lesson.id);
    await supabase.from('modules').delete().eq('id', module.id);
    await supabase.from('courses').delete().eq('id', course.id);
    
    logger.info('🧹 Test data cleaned up');
    
    return {
      success: true,
      filesFound: markdownFiles.length,
      filesProcessed: processedCount
    };
    
  } catch (error) {
    logger.error('❌ Simplified seeding test failed:', error);
    return { success: false, error: error.message };
  }
}

// Run the test
simpleSeed()
  .then(result => {
    if (result.success) {
      logger.info('\n✅ ALL SYSTEMS GO! Ready for full master seeding.');
      logger.info(`📊 Found ${result.filesFound} files ready for processing`);
      process.exit(0);
    } else {
      logger.info('\n❌ Test failed:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    logger.error('💥 Unexpected error:', error);
    process.exit(1);
  });
