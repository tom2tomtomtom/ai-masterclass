const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://fsohtauqtcftdjcjfdpq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzb2h0YXVxdGNmdGRqY2pmZHBxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIyNjc4MCwiZXhwIjoyMDY3ODAyNzgwfQ.vLRzjcMIrpn8m3nEDI7pE7bSZg20Msdw60CHcsV1otI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function validateSchemaForSeeding() {
  try {
    console.log('🔍 VALIDATING DATABASE SCHEMA FOR SEEDING');
    console.log('==========================================');
    console.log('Checking if database is ready for AI Masterclass seeding...\n');
    
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
      console.log(`📋 Validating table: ${table.name}`);
      console.log(`   Used by: ${table.usedBy}`);
      
      // Test basic table access
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`   ❌ Table '${table.name}' not accessible: ${error.message}`);
        allValid = false;
        validationResults.push({
          table: table.name,
          status: 'missing',
          error: error.message
        });
        continue;
      }
      
      console.log(`   ✅ Table '${table.name}' exists and is accessible`);
      
      // Test required columns by attempting to select them
      try {
        const columnTest = await supabase
          .from(table.name)
          .select(table.requiredColumns.join(', '))
          .limit(1);
        
        if (columnTest.error) {
          console.log(`   ❌ Missing required columns: ${columnTest.error.message}`);
          allValid = false;
          validationResults.push({
            table: table.name,
            status: 'invalid_columns',
            error: columnTest.error.message
          });
        } else {
          console.log(`   ✅ All required columns present`);
          validationResults.push({
            table: table.name,
            status: 'valid'
          });
        }
      } catch (columnError) {
        console.log(`   ❌ Column validation failed: ${columnError.message}`);
        allValid = false;
        validationResults.push({
          table: table.name,
          status: 'column_error',
          error: columnError.message
        });
      }
      
      console.log(''); // Empty line for readability
    }
    
    // Test foreign key relationships
    console.log('🔗 Validating foreign key relationships...');
    
    // Test courses -> modules relationship
    try {
      const fkTest1 = await supabase
        .from('modules')
        .select('course_id, courses!inner(id)')
        .limit(1);
      
      if (fkTest1.error && !fkTest1.error.message.includes('0 rows')) {
        console.log('   ⚠️ courses -> modules relationship may have issues');
      } else {
        console.log('   ✅ courses -> modules relationship valid');
      }
    } catch (fkError1) {
      console.log('   ⚠️ Could not test courses -> modules relationship');
    }
    
    // Test modules -> lessons relationship  
    try {
      const fkTest2 = await supabase
        .from('lessons')
        .select('module_id, modules!inner(id)')
        .limit(1);
      
      if (fkTest2.error && !fkTest2.error.message.includes('0 rows')) {
        console.log('   ⚠️ modules -> lessons relationship may have issues');
      } else {
        console.log('   ✅ modules -> lessons relationship valid');
      }
    } catch (fkError2) {
      console.log('   ⚠️ Could not test modules -> lessons relationship');
    }
    
    // Final validation summary
    console.log('\n📊 VALIDATION SUMMARY');
    console.log('=====================');
    
    const validTables = validationResults.filter(r => r.status === 'valid').length;
    const totalTables = requiredTables.length;
    
    console.log(`✅ Valid tables: ${validTables}/${totalTables}`);
    
    if (allValid) {
      console.log('\n🎉 SCHEMA VALIDATION SUCCESSFUL!');
      console.log('================================');
      console.log('Your database is ready for AI Masterclass seeding!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Run: npm run seed:complete-platform');
      console.log('2. Wait for seeding to complete (2-5 minutes)');
      console.log('3. Verify results with database queries');
      console.log('');
      console.log('Expected results after seeding:');
      console.log('• 16 courses');
      console.log('• 49+ modules');  
      console.log('• 130+ lessons');
      
      return { success: true, ready: true, validationResults };
    } else {
      console.log('\n❌ SCHEMA VALIDATION FAILED');
      console.log('============================');
      console.log('Database is not ready for seeding.');
      console.log('');
      console.log('Issues found:');
      validationResults.forEach(result => {
        if (result.status !== 'valid') {
          console.log(`• ${result.table}: ${result.status} - ${result.error || 'Unknown error'}`);
        }
      });
      console.log('');
      console.log('Solutions:');
      console.log('1. Run the database schema setup:');
      console.log('   • Copy backend/MINIMAL-SEEDING-SCHEMA.sql');
      console.log('   • Paste into Supabase SQL Editor');
      console.log('   • Execute the schema');
      console.log('2. Or follow the complete setup guide:');
      console.log('   • backend/DATABASE-SETUP-GUIDE.md');
      console.log('3. Then run this validation again');
      
      return { success: false, ready: false, validationResults };
    }
    
  } catch (error) {
    console.error('❌ Schema validation failed:', error);
    return { success: false, error: error.message };
  }
}

// Test seeding compatibility
async function testSeedingCompatibility() {
  try {
    console.log('🧪 TESTING SEEDING COMPATIBILITY');
    console.log('=================================');
    
    // Test course insertion (what seed-master-complete-platform.js does)
    console.log('Testing course insertion...');
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
      console.log('❌ Course insertion test failed:', courseError.message);
      return { success: false, error: courseError.message };
    }
    
    console.log('✅ Course insertion test passed');
    const courseId = courseData[0].id;
    
    // Test module insertion (what seed-all-modules-complete.js does)
    console.log('Testing module insertion...');
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
      console.log('❌ Module insertion test failed:', moduleError.message);
      // Clean up course
      await supabase.from('courses').delete().eq('id', courseId);
      return { success: false, error: moduleError.message };
    }
    
    console.log('✅ Module insertion test passed');
    const moduleId = moduleData[0].id;
    
    // Test lesson insertion (what seed-all-lessons-complete.js does)
    console.log('Testing lesson insertion...');
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
      console.log('❌ Lesson insertion test failed:', lessonError.message);
      // Clean up
      await supabase.from('modules').delete().eq('id', moduleId);
      await supabase.from('courses').delete().eq('id', courseId);
      return { success: false, error: lessonError.message };
    }
    
    console.log('✅ Lesson insertion test passed');
    
    // Clean up test data
    console.log('Cleaning up test data...');
    await supabase.from('lessons').delete().eq('id', lessonData[0].id);
    await supabase.from('modules').delete().eq('id', moduleId);
    await supabase.from('courses').delete().eq('id', courseId);
    
    console.log('\n🎉 SEEDING COMPATIBILITY TEST SUCCESSFUL!');
    console.log('Your database is fully compatible with all seeding scripts.');
    
    return { success: true, compatible: true };
    
  } catch (error) {
    console.error('❌ Compatibility test failed:', error);
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
        console.error('💥 Unexpected error:', error);
        process.exit(1);
      });
  } else {
    validateSchemaForSeeding()
      .then(result => {
        process.exit(result.success ? 0 : 1);
      })
      .catch(error => {
        console.error('💥 Unexpected error:', error);
        process.exit(1);
      });
  }
}

module.exports = { validateSchemaForSeeding, testSeedingCompatibility };
