require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Supabase configuration
const supabaseUrl = 'process.env.SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseServiceKey) {
      throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY');
    };

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function validateSchemaForSeeding() {
  try {
    logger.info('🔍 VALIDATING DATABASE SCHEMA FOR SEEDING');
    logger.info('==========================================');
    logger.info('Checking if database is ready for AI Masterclass seeding...\n');
    
    // Define exactly what seeding scripts expect
    const requiredTables = [
      {
        name: 'courses',
        requiredColumns: ['id', 'title', 'description', 'level', 'order_index', 'estimated_hours', 'status', 'objectives'],
        usedBy: 'seed-master-complete-platform.js'
      },
      {
        name: 'modules', 
        requiredColumns: ['id', 'course_id', 'title', 'description', 'order_index', 'module_type', 'estimated_minutes', 'difficulty'],
        usedBy: 'seed-all-modules-complete.js'
      },
      {
        name: 'lessons',
        requiredColumns: ['id', 'module_id', 'title', 'content', 'order_index', 'lesson_type', 'estimated_minutes', 'status'],
        usedBy: 'seed-all-lessons-complete.js'
      }
    ];
    
    let allValid = true;
    const validationResults = [];
    
    // Check each required table
    for (const table of requiredTables) {
      logger.info(`📋 Validating table: ${table.name}`);
      logger.info(`   Used by: ${table.usedBy}`);
      
      // Test basic table access
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(1);
      
      if (error) {
        logger.info(`   ❌ Table '${table.name}' not accessible: ${error.message}`);
        allValid = false;
        validationResults.push({
          table: table.name,
          status: 'missing',
          error: error.message
        });
        continue;
      }
      
      logger.info(`   ✅ Table '${table.name}' exists and is accessible`);
      
      // Test required columns by attempting to select them
      try {
        const columnTest = await supabase
          .from(table.name)
          .select(table.requiredColumns.join(', '))
          .limit(1);
        
        if (columnTest.error) {
          logger.info(`   ❌ Missing required columns: ${columnTest.error.message}`);
          allValid = false;
          validationResults.push({
            table: table.name,
            status: 'invalid_columns',
            error: columnTest.error.message
          });
        } else {
          logger.info(`   ✅ All required columns present`);
          validationResults.push({
            table: table.name,
            status: 'valid'
          });
        }
      } catch (columnError) {
        logger.info(`   ❌ Column validation failed: ${columnError.message}`);
        allValid = false;
        validationResults.push({
          table: table.name,
          status: 'column_error',
          error: columnError.message
        });
      }
      
      logger.info(''); // Empty line for readability
    }
    
    // Test foreign key relationships
    logger.info('🔗 Validating foreign key relationships...');
    
    // Test courses -> modules relationship
    try {
      const fkTest1 = await supabase
        .from('modules')
        .select('course_id, courses!inner(id)')
        .limit(1);
      
      if (fkTest1.error && !fkTest1.error.message.includes('0 rows')) {
        logger.info('   ⚠️ courses -> modules relationship may have issues');
      } else {
        logger.info('   ✅ courses -> modules relationship valid');
      }
    } catch (fkError1) {
      logger.info('   ⚠️ Could not test courses -> modules relationship');
    }
    
    // Test modules -> lessons relationship  
    try {
      const fkTest2 = await supabase
        .from('lessons')
        .select('module_id, modules!inner(id)')
        .limit(1);
      
      if (fkTest2.error && !fkTest2.error.message.includes('0 rows')) {
        logger.info('   ⚠️ modules -> lessons relationship may have issues');
      } else {
        logger.info('   ✅ modules -> lessons relationship valid');
      }
    } catch (fkError2) {
      logger.info('   ⚠️ Could not test modules -> lessons relationship');
    }
    
    // Final validation summary
    logger.info('\n📊 VALIDATION SUMMARY');
    logger.info('=====================');
    
    const validTables = validationResults.filter(r => r.status === 'valid').length;
    const totalTables = requiredTables.length;
    
    logger.info(`✅ Valid tables: ${validTables}/${totalTables}`);
    
    if (allValid) {
      logger.info('\n🎉 SCHEMA VALIDATION SUCCESSFUL!');
      logger.info('================================');
      logger.info('Your database is ready for AI Masterclass seeding!');
      logger.info('');
      logger.info('Next steps:');
      logger.info('1. Run: npm run seed:complete-platform');
      logger.info('2. Wait for seeding to complete (2-5 minutes)');
      logger.info('3. Verify results with database queries');
      logger.info('');
      logger.info('Expected results after seeding:');
      logger.info('• 16 courses');
      logger.info('• 49+ modules');  
      logger.info('• 130+ lessons');
      
      return { success: true, ready: true, validationResults };
    } else {
      logger.info('\n❌ SCHEMA VALIDATION FAILED');
      logger.info('============================');
      logger.info('Database is not ready for seeding.');
      logger.info('');
      logger.info('Issues found:');
      validationResults.forEach(result => {
        if (result.status !== 'valid') {
          logger.info(`• ${result.table}: ${result.status} - ${result.error || 'Unknown error'}`);
        }
      });
      logger.info('');
      logger.info('Solutions:');
      logger.info('1. Run the database schema setup:');
      logger.info('   • Copy backend/MINIMAL-SEEDING-SCHEMA.sql');
      logger.info('   • Paste into Supabase SQL Editor');
      logger.info('   • Execute the schema');
      logger.info('2. Or follow the complete setup guide:');
      logger.info('   • backend/DATABASE-SETUP-GUIDE.md');
      logger.info('3. Then run this validation again');
      
      return { success: false, ready: false, validationResults };
    }
    
  } catch (error) {
    logger.error('❌ Schema validation failed:', error);
    return { success: false, error: error.message };
  }
}

// Test seeding compatibility
async function testSeedingCompatibility() {
  try {
    logger.info('🧪 TESTING SEEDING COMPATIBILITY');
    logger.info('=================================');
    
    // Test course insertion (what seed-master-complete-platform.js does)
    logger.info('Testing course insertion...');
    const testCourse = {
      title: 'Test Course',
      description: 'Test Description', 
      level: 1,
      order_index: 999,
      estimated_hours: 1,
      status: 'published',
      objectives: ['Test objective']
    };
    
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .insert([testCourse])
      .select();
    
    if (courseError) {
      logger.info('❌ Course insertion test failed:', courseError.message);
      return { success: false, error: courseError.message };
    }
    
    logger.info('✅ Course insertion test passed');
    const courseId = courseData[0].id;
    
    // Test module insertion (what seed-all-modules-complete.js does)
    logger.info('Testing module insertion...');
    const testModule = {
      course_id: courseId,
      title: 'Test Module',
      description: 'Test Description',
      order_index: 1,
      module_type: 'test',
      estimated_minutes: 30,
      difficulty: 'beginner'
    };
    
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .insert([testModule])
      .select();
    
    if (moduleError) {
      logger.info('❌ Module insertion test failed:', moduleError.message);
      // Clean up course
      await supabase.from('courses').delete().eq('id', courseId);
      return { success: false, error: moduleError.message };
    }
    
    logger.info('✅ Module insertion test passed');
    const moduleId = moduleData[0].id;
    
    // Test lesson insertion (what seed-all-lessons-complete.js does)
    logger.info('Testing lesson insertion...');
    const testLesson = {
      module_id: moduleId,
      title: 'Test Lesson',
      content: '# Test Content\n\nThis is test content.',
      order_index: 1,
      lesson_type: 'lesson',
      estimated_minutes: 15,
      status: 'published'
    };
    
    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .insert([testLesson])
      .select();
    
    if (lessonError) {
      logger.info('❌ Lesson insertion test failed:', lessonError.message);
      // Clean up
      await supabase.from('modules').delete().eq('id', moduleId);
      await supabase.from('courses').delete().eq('id', courseId);
      return { success: false, error: lessonError.message };
    }
    
    logger.info('✅ Lesson insertion test passed');
    
    // Clean up test data
    logger.info('Cleaning up test data...');
    await supabase.from('lessons').delete().eq('id', lessonData[0].id);
    await supabase.from('modules').delete().eq('id', moduleId);
    await supabase.from('courses').delete().eq('id', courseId);
    
    logger.info('\n🎉 SEEDING COMPATIBILITY TEST SUCCESSFUL!');
    logger.info('Your database is fully compatible with all seeding scripts.');
    
    return { success: true, compatible: true };
    
  } catch (error) {
    logger.error('❌ Compatibility test failed:', error);
    return { success: false, error: error.message };
  }
}

// Command line interface
if (require.main === module) {
  const command = process.argv[2] || 'validate';
  
  if (command === 'test') {
    testSeedingCompatibility()
      .then(result => {
        process.exit(result.success ? 0 : 1);
      })
      .catch(error => {
        logger.error('💥 Unexpected error:', error);
        process.exit(1);
      });
  } else {
    validateSchemaForSeeding()
      .then(result => {
        process.exit(result.success ? 0 : 1);
      })
      .catch(error => {
        logger.error('💥 Unexpected error:', error);
        process.exit(1);
      });
  }
}

module.exports = { validateSchemaForSeeding, testSeedingCompatibility };
