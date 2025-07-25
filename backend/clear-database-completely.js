#!/usr/bin/env node

/**
 * Complete Database Clear Script
 * Removes ALL existing content to prepare for complete rebuild
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function clearDatabaseCompletely() {
  console.log('🧹 COMPLETE DATABASE CLEAR - PREPARING FOR REBUILD');
  console.log('==================================================');
  console.log('⚠️  This will remove ALL existing content from the database');
  console.log('📊 Current content will be permanently deleted\n');

  try {
    // Step 1: Check current content
    console.log('1️⃣ Checking current database content...');
    
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title');
    
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, title');
    
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, title');

    if (coursesError || modulesError || lessonsError) {
      console.error('❌ Error checking database:', coursesError || modulesError || lessonsError);
      return false;
    }

    console.log(`📚 Current courses: ${courses?.length || 0}`);
    console.log(`🎯 Current modules: ${modules?.length || 0}`);
    console.log(`📝 Current lessons: ${lessons?.length || 0}`);

    if ((courses?.length || 0) === 0 && (modules?.length || 0) === 0 && (lessons?.length || 0) === 0) {
      console.log('✅ Database is already empty - no clearing needed');
      return true;
    }

    // Step 2: Clear in dependency order (lessons -> modules -> courses)
    console.log('\n2️⃣ Clearing database content...');
    
    // Clear lessons first (they depend on modules)
    console.log('🗑️ Clearing lessons...');
    const { error: lessonsDeleteError } = await supabase
      .from('lessons')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (lessonsDeleteError) {
      console.error('❌ Error clearing lessons:', lessonsDeleteError);
      return false;
    }
    console.log('✅ Lessons cleared');

    // Clear modules (they depend on courses)
    console.log('🗑️ Clearing modules...');
    const { error: modulesDeleteError } = await supabase
      .from('modules')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (modulesDeleteError) {
      console.error('❌ Error clearing modules:', modulesDeleteError);
      return false;
    }
    console.log('✅ Modules cleared');

    // Clear courses
    console.log('🗑️ Clearing courses...');
    const { error: coursesDeleteError } = await supabase
      .from('courses')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (coursesDeleteError) {
      console.error('❌ Error clearing courses:', coursesDeleteError);
      return false;
    }
    console.log('✅ Courses cleared');

    // Step 3: Verify clearing
    console.log('\n3️⃣ Verifying database is empty...');
    
    const { count: courseCount } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });
    
    const { count: moduleCount } = await supabase
      .from('modules')
      .select('*', { count: 'exact', head: true });
    
    const { count: lessonCount } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true });

    console.log(`📚 Remaining courses: ${courseCount || 0}`);
    console.log(`🎯 Remaining modules: ${moduleCount || 0}`);
    console.log(`📝 Remaining lessons: ${lessonCount || 0}`);

    if ((courseCount || 0) === 0 && (moduleCount || 0) === 0 && (lessonCount || 0) === 0) {
      console.log('\n🎉 DATABASE COMPLETELY CLEARED!');
      console.log('✅ Ready for complete content rebuild');
      console.log('📊 All tables are now empty and ready for seeding');
      return true;
    } else {
      console.log('\n⚠️ Some content may still remain');
      return false;
    }

  } catch (error) {
    console.error('❌ Database clearing failed:', error);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  clearDatabaseCompletely()
    .then(success => {
      if (success) {
        console.log('\n🚀 READY FOR COMPLETE SYSTEM REBUILD!');
        console.log('Next step: Create master seeding script for all 3,162 files');
        process.exit(0);
      } else {
        console.log('\n❌ Database clearing failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { clearDatabaseCompletely };
