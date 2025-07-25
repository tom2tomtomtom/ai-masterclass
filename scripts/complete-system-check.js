const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function completeSystemCheck() {
  console.log('🔍 COMPLETE SYSTEM CHECK - STARTING FROM SCRATCH');
  console.log('================================================\n');

  // Step 1: Check all markdown files
  console.log('1. 📁 CHECKING ALL MARKDOWN FILES...');
  const markdownFiles = [];
  
  function findMarkdownFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
        findMarkdownFiles(fullPath);
      } else if (file.endsWith('.md') && !file.includes('README')) {
        markdownFiles.push(fullPath);
      }
    }
  }
  
  findMarkdownFiles('.');
  console.log(`   Found ${markdownFiles.length} markdown files:`);
  markdownFiles.forEach(file => {
    const size = fs.statSync(file).size;
    console.log(`   - ${file} (${Math.round(size/1024)}KB)`);
  });

  // Step 2: Check database content
  console.log('\n2. 🗄️ CHECKING DATABASE CONTENT...');
  
  try {
    // Check modules
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .order('created_at');
    
    if (modulesError) {
      console.log(`   ❌ Modules error: ${modulesError.message}`);
    } else {
      console.log(`   ✅ Found ${modules.length} modules in database`);
      modules.slice(0, 5).forEach(module => {
        console.log(`      - ${module.title} (${module.id})`);
      });
      if (modules.length > 5) {
        console.log(`      ... and ${modules.length - 5} more`);
      }
    }

    // Check lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .order('created_at');
    
    if (lessonsError) {
      console.log(`   ❌ Lessons error: ${lessonsError.message}`);
    } else {
      console.log(`   ✅ Found ${lessons.length} lessons in database`);
      
      // Group by module
      const lessonsByModule = {};
      lessons.forEach(lesson => {
        if (!lessonsByModule[lesson.module_id]) {
          lessonsByModule[lesson.module_id] = [];
        }
        lessonsByModule[lesson.module_id].push(lesson);
      });
      
      console.log(`   📊 Lessons distribution:`);
      Object.keys(lessonsByModule).forEach(moduleId => {
        const module = modules.find(m => m.id === moduleId);
        const moduleName = module ? module.title : 'Unknown Module';
        console.log(`      - ${moduleName}: ${lessonsByModule[moduleId].length} lessons`);
      });
    }

  } catch (error) {
    console.log(`   ❌ Database connection error: ${error.message}`);
  }

  // Step 3: Check if content matches files
  console.log('\n3. 🔄 CHECKING CONTENT SYNC...');
  
  const expectedModules = markdownFiles.length;
  const actualModules = modules ? modules.length : 0;
  
  console.log(`   📁 Markdown files: ${expectedModules}`);
  console.log(`   🗄️ Database modules: ${actualModules}`);
  
  if (expectedModules !== actualModules) {
    console.log(`   ⚠️ MISMATCH! Need to reseed content`);
  } else {
    console.log(`   ✅ Content count matches`);
  }

  // Step 4: Check backend endpoints
  console.log('\n4. 🔌 CHECKING BACKEND ENDPOINTS...');
  
  const endpoints = [
    'http://localhost:8000/api/health',
    'http://localhost:8000/api/courses',
    'http://localhost:8000/api/modules',
    'http://localhost:8000/api/lessons'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`   ✅ ${endpoint} - Status: ${response.status}`);
        if (Array.isArray(data)) {
          console.log(`      📊 Returned ${data.length} items`);
        } else if (data.success !== undefined) {
          console.log(`      📊 Success: ${data.success}`);
        }
      } else {
        console.log(`   ❌ ${endpoint} - Status: ${response.status}`);
        console.log(`      Error: ${data.message || data.msg || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint} - Connection failed: ${error.message}`);
    }
  }

  // Step 5: Check frontend
  console.log('\n5. 🌐 CHECKING FRONTEND...');
  
  try {
    const response = await fetch('http://localhost:3001');
    if (response.ok) {
      console.log(`   ✅ Frontend accessible - Status: ${response.status}`);
    } else {
      console.log(`   ❌ Frontend error - Status: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Frontend not accessible: ${error.message}`);
  }

  // Step 6: Recommendations
  console.log('\n6. 💡 RECOMMENDATIONS...');
  
  if (expectedModules !== actualModules) {
    console.log('   🔄 Need to reseed database with all content');
  }
  
  console.log('   🧪 Need to test complete user flow');
  console.log('   🔧 Need to fix backend query handling');
  console.log('   🎨 Need to verify frontend displays content properly');

  console.log('\n📋 NEXT STEPS:');
  console.log('1. Clear and reseed database with ALL content');
  console.log('2. Fix backend database query wrapper');
  console.log('3. Test complete user journey');
  console.log('4. Verify lesson content displays properly');
}

completeSystemCheck().catch(console.error);
