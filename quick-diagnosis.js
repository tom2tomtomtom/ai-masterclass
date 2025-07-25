const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function quickDiagnosis() {
  console.log('🔍 QUICK SYSTEM DIAGNOSIS');
  console.log('=========================\n');

  try {
    // Check database content
    console.log('1. 🗄️ DATABASE CONTENT CHECK...');
    const { data: modules, error: mError } = await supabase.from('modules').select('*');
    const { data: lessons, error: lError } = await supabase.from('lessons').select('*');
    
    if (mError) {
      console.log(`   ❌ Modules error: ${mError.message}`);
    } else {
      console.log(`   ✅ Modules in database: ${modules.length}`);
    }
    
    if (lError) {
      console.log(`   ❌ Lessons error: ${lError.message}`);
    } else {
      console.log(`   ✅ Lessons in database: ${lessons.length}`);
    }

    // Check backend status
    console.log('\n2. 🔌 BACKEND STATUS CHECK...');
    try {
      const response = await fetch('http://localhost:8000/api/health');
      if (response.ok) {
        console.log('   ✅ Backend is running');
      } else {
        console.log('   ❌ Backend responding with error:', response.status);
      }
    } catch (error) {
      console.log('   ❌ Backend not accessible:', error.message);
    }

    // Check frontend status
    console.log('\n3. 🌐 FRONTEND STATUS CHECK...');
    try {
      const response = await fetch('http://localhost:3001');
      if (response.ok) {
        console.log('   ✅ Frontend is running');
      } else {
        console.log('   ❌ Frontend responding with error:', response.status);
      }
    } catch (error) {
      console.log('   ❌ Frontend not accessible:', error.message);
    }

    console.log('\n📊 SUMMARY:');
    console.log('===========');
    console.log(`Database modules: ${modules ? modules.length : 'ERROR'}`);
    console.log(`Database lessons: ${lessons ? lessons.length : 'ERROR'}`);
    console.log('Expected content: ~3,162 markdown files');
    console.log(`Missing content: ~${3162 - (modules ? modules.length : 0)} modules`);
    
    console.log('\n🎯 ISSUES IDENTIFIED:');
    if (!modules || modules.length < 100) {
      console.log('❌ CRITICAL: Most content missing from database');
    }
    console.log('❌ Backend/Frontend may not be running');
    console.log('❌ Need complete system restart and content seeding');

    console.log('\n📋 ACTION PLAN:');
    console.log('1. Clear database completely');
    console.log('2. Seed ALL markdown files properly');
    console.log('3. Start backend and frontend servers');
    console.log('4. Test complete user journey');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
}

quickDiagnosis();
