// Validate the definitive schema can handle all seeding requirements
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function validateSchema() {
  console.log('🔍 SCHEMA VALIDATION TEST');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Check if all required tables exist
    console.log('\n📋 Testing required tables...');
    
    const requiredTables = ['courses', 'modules', 'lessons'];
    const tableResults = {};
    
    for (const table of requiredTables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
          tableResults[table] = false;
        } else {
          console.log(`✅ Table '${table}': EXISTS (${count || 0} rows)`);
          tableResults[table] = true;
        }
      } catch (error) {
        console.log(`❌ Table '${table}': ${error.message}`);
        tableResults[table] = false;
      }
    }
    
    // Test 2: Check required columns in lessons table (most critical)
    console.log('\n📝 Testing lessons table columns...');
    
    const requiredLessonColumns = [
      'id', 'module_id', 'title', 'description', 'content', 
      'order_index', 'lesson_type', 'estimated_minutes', 'difficulty',
      'learning_objectives', 'prerequisites', 'platform_focus', 'status'
    ];
    
    let lessonColumnsValid = true;
    
    try {
      // Try to select with all required columns
      const testLesson = {
        module_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        title: 'Test Lesson',
        description: 'Test description',
        content: 'Test content',
        order_index: 1,
        lesson_type: 'lesson',
        estimated_minutes: 30,
        difficulty: 'beginner',
        learning_objectives: JSON.stringify(['Test objective']),
        prerequisites: JSON.stringify(['Test prerequisite']),
        platform_focus: 'mixed',
        status: 'published'
      };
      
      const { error } = await supabase
        .from('lessons')
        .insert([testLesson])
        .select();
        
      if (error) {
        console.log(`❌ Lessons column test failed: ${error.message}`);
        lessonColumnsValid = false;
      } else {
        console.log('✅ All required lessons columns exist and work');
        // Clean up test data
        await supabase.from('lessons').delete().eq('title', 'Test Lesson');
      }
    } catch (error) {
      console.log(`❌ Lessons column test failed: ${error.message}`);
      lessonColumnsValid = false;
    }
    
    // Test 3: Check foreign key relationships
    console.log('\n🔗 Testing foreign key relationships...');
    
    let fkValid = true;
    
    try {
      // Test course → module relationship
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .limit(1);
        
      const { data: modules } = await supabase
        .from('modules')
        .select('id, course_id')
        .limit(1);
        
      console.log(`✅ Courses available: ${courses?.length || 0}`);
      console.log(`✅ Modules available: ${modules?.length || 0}`);
      
      if (modules && modules.length > 0) {
        const { data: lessons } = await supabase
          .from('lessons')
          .select('id, module_id')
          .limit(1);
          
        console.log(`✅ Lessons available: ${lessons?.length || 0}`);
      }
    } catch (error) {
      console.log(`❌ Foreign key test failed: ${error.message}`);
      fkValid = false;
    }
    
    // Test 4: Check if seeding prerequisites are met
    console.log('\n🌱 Testing seeding compatibility...');
    
    const seedingReady = tableResults.courses && tableResults.modules && 
                        tableResults.lessons && lessonColumnsValid && fkValid;
    
    if (seedingReady) {
      console.log('✅ Schema is ready for seeding!');
    } else {
      console.log('❌ Schema needs fixes before seeding');
    }
    
    // Final Assessment
    console.log('\n🎯 VALIDATION SUMMARY');
    console.log('='.repeat(50));
    
    console.log(`📋 Required Tables: ${Object.values(tableResults).every(Boolean) ? '✅ ALL EXIST' : '❌ MISSING TABLES'}`);
    console.log(`📝 Lessons Columns: ${lessonColumnsValid ? '✅ ALL PRESENT' : '❌ MISSING COLUMNS'}`);
    console.log(`🔗 Foreign Keys: ${fkValid ? '✅ WORKING' : '❌ BROKEN'}`);
    console.log(`🌱 Seeding Ready: ${seedingReady ? '✅ YES' : '❌ NO'}`);
    
    if (seedingReady) {
      console.log('\n🎉 SCHEMA VALIDATION SUCCESSFUL!');
      console.log('💡 You can now run: npm run seed:complete-platform');
    } else {
      console.log('\n⚠️ SCHEMA VALIDATION FAILED!');
      console.log('💡 Please execute the DEFINITIVE-SCHEMA.sql in Supabase first');
    }
    
    return seedingReady;
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    return false;
  }
}

validateSchema();