// Comprehensive frontend issue diagnosis
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function diagnoseFrontendIssue() {
  console.log('🔍 COMPREHENSIVE FRONTEND DIAGNOSIS');
  console.log('===================================');
  
  // Step 1: Check all environment files
  console.log('1️⃣ ENVIRONMENT FILES ANALYSIS');
  console.log('==============================');
  
  const envFiles = [
    '../frontend/.env',
    '../frontend/.env.local',
    '../frontend/.env.development',
    '../frontend/.env.development.local'
  ];
  
  let frontendConfig = {};
  
  for (const envFile of envFiles) {
    try {
      if (fs.existsSync(envFile)) {
        const content = fs.readFileSync(envFile, 'utf8');
        console.log(`\n📁 ${envFile}:`);
        console.log('   File exists: ✅');
        
        // Extract Supabase config
        const urlMatch = content.match(/REACT_APP_SUPABASE_URL=(.+)/);
        const keyMatch = content.match(/REACT_APP_SUPABASE_ANON_KEY=(.+)/);
        
        if (urlMatch) {
          const url = urlMatch[1].trim();
          console.log(`   URL: ${url}`);
          frontendConfig.url = url;
        }
        
        if (keyMatch) {
          const key = keyMatch[1].trim();
          console.log(`   Key: ${key.substring(0, 30)}...`);
          frontendConfig.key = key;
        }
      } else {
        console.log(`\n📁 ${envFile}: File not found`);
      }
    } catch (error) {
      console.log(`\n📁 ${envFile}: Error reading - ${error.message}`);
    }
  }
  
  // Step 2: Compare with backend config
  console.log('\n2️⃣ BACKEND VS FRONTEND COMPARISON');
  console.log('=================================');
  
  const backendUrl = process.env.SUPABASE_URL;
  const backendKey = process.env.SUPABASE_ANON_KEY;
  
  console.log(`Backend URL:  ${backendUrl}`);
  console.log(`Frontend URL: ${frontendConfig.url || 'NOT FOUND'}`);
  console.log(`URLs match: ${backendUrl === frontendConfig.url ? '✅' : '❌'}`);
  
  console.log(`\nBackend Key:  ${backendKey?.substring(0, 30)}...`);
  console.log(`Frontend Key: ${frontendConfig.key?.substring(0, 30) || 'NOT FOUND'}...`);
  console.log(`Keys match: ${backendKey === frontendConfig.key ? '✅' : '❌'}`);
  
  // Step 3: Test with frontend config
  console.log('\n3️⃣ TESTING WITH FRONTEND CONFIGURATION');
  console.log('======================================');
  
  if (frontendConfig.url && frontendConfig.key) {
    try {
      const frontendClient = createClient(frontendConfig.url, frontendConfig.key);
      
      // Test session check (what frontend does first)
      console.log('\nTesting session check...');
      const { data: sessionData, error: sessionError } = await frontendClient.auth.getSession();
      
      if (sessionError) {
        console.log(`❌ Session check failed: ${sessionError.message}`);
        
        if (sessionError.message.includes('Invalid API key')) {
          console.log('🔥 FRONTEND CONFIG HAS INVALID API KEY!');
        }
      } else {
        console.log('✅ Session check working');
      }
      
      // Test login with a dummy user (simulating what frontend does)
      console.log('\nTesting login attempt...');
      const { data: loginData, error: loginError } = await frontendClient.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpass123'
      });
      
      if (loginError) {
        console.log(`Login error: ${loginError.message}`);
        
        if (loginError.message.includes('Invalid API key')) {
          console.log('🔥 CONFIRMED: Frontend configuration has invalid API key!');
          console.log('📋 Root cause identified!');
        } else {
          console.log('✅ API key working (normal auth error expected)');
        }
      }
      
    } catch (error) {
      console.log(`❌ Frontend config test failed: ${error.message}`);
    }
  } else {
    console.log('❌ Cannot test - frontend config incomplete');
  }
  
  // Step 4: Check if frontend is using cached build
  console.log('\n4️⃣ FRONTEND BUILD ANALYSIS');
  console.log('==========================');
  
  const buildPath = '../frontend/build';
  if (fs.existsSync(buildPath)) {
    console.log('📦 Build directory exists');
    
    // Check if there are any compiled config files
    const staticJsPath = path.join(buildPath, 'static', 'js');
    if (fs.existsSync(staticJsPath)) {
      console.log('📁 Static JS files exist (built app may use cached config)');
      console.log('💡 Try: npm run build to rebuild with new environment variables');
    }
  } else {
    console.log('📦 No build directory (development mode)');
  }
  
  // Step 5: Generate fresh config
  console.log('\n5️⃣ SOLUTION GENERATOR');
  console.log('=====================');
  
  if (backendKey && backendUrl) {
    console.log('🛠️ CORRECTED FRONTEND CONFIG:');
    console.log('');
    console.log('Create/update your frontend/.env file with:');
    console.log('');
    console.log(`REACT_APP_SUPABASE_URL=${backendUrl}`);
    console.log(`REACT_APP_SUPABASE_ANON_KEY=${backendKey}`);
    console.log('REACT_APP_API_URL=http://localhost:8000');
    console.log('');
    console.log('🔄 THEN RUN THESE COMMANDS:');
    console.log('cd ../frontend');
    console.log('rm -rf build node_modules/.cache');
    console.log('npm start');
    console.log('');
    console.log('🌐 BROWSER STEPS:');
    console.log('1. Clear all browser data for localhost:3000');
    console.log('2. Open incognito/private window');
    console.log('3. Go to http://localhost:3000');
    console.log('4. Try login again');
    
    // Write corrected config
    const correctedConfig = `REACT_APP_SUPABASE_URL=${backendUrl}
REACT_APP_SUPABASE_ANON_KEY=${backendKey}
REACT_APP_API_URL=http://localhost:8000
REACT_APP_CLIENT_URL=http://localhost:3000
`;
    
    try {
      fs.writeFileSync('../frontend/.env', correctedConfig);
      console.log('\n✅ CORRECTED CONFIG WRITTEN TO frontend/.env');
    } catch (error) {
      console.log(`\n❌ Could not write corrected config: ${error.message}`);
    }
  }
}

diagnoseFrontendIssue();