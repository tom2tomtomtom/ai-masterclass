// Comprehensive frontend issue diagnosis
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

async function diagnoseFrontendIssue() {
  logger.info('🔍 COMPREHENSIVE FRONTEND DIAGNOSIS');
  logger.info('===================================');
  
  // Step 1: Check all environment files
  logger.info('1️⃣ ENVIRONMENT FILES ANALYSIS');
  logger.info('==============================');
  
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
        logger.info(`\n📁 ${envFile}:`);
        logger.info('   File exists: ✅');
        
        // Extract Supabase config
        const urlMatch = content.match(/REACT_APP_SUPABASE_URL=(.+)/);
        const keyMatch = content.match(/REACT_APP_SUPABASE_ANON_KEY=(.+)/);
        
        if (urlMatch) {
          const url = urlMatch[1].trim();
          logger.info(`   URL: ${url}`);
          frontendConfig.url = url;
        }
        
        if (keyMatch) {
          const key = keyMatch[1].trim();
          logger.info(`   Key: ${key.substring(0, 30)}...`);
          frontendConfig.key = key;
        }
      } else {
        logger.info(`\n📁 ${envFile}: File not found`);
      }
    } catch (error) {
      logger.info(`\n📁 ${envFile}: Error reading - ${error.message}`);
    }
  }
  
  // Step 2: Compare with backend config
  logger.info('\n2️⃣ BACKEND VS FRONTEND COMPARISON');
  logger.info('=================================');
  
  const backendUrl = process.env.SUPABASE_URL;
  const backendKey = process.env.SUPABASE_ANON_KEY;
  
  logger.info(`Backend URL:  ${backendUrl}`);
  logger.info(`Frontend URL: ${frontendConfig.url || 'NOT FOUND'}`);
  logger.info(`URLs match: ${backendUrl === frontendConfig.url ? '✅' : '❌'}`);
  
  logger.info(`\nBackend Key:  ${backendKey?.substring(0, 30)}...`);
  logger.info(`Frontend Key: ${frontendConfig.key?.substring(0, 30) || 'NOT FOUND'}...`);
  logger.info(`Keys match: ${backendKey === frontendConfig.key ? '✅' : '❌'}`);
  
  // Step 3: Test with frontend config
  logger.info('\n3️⃣ TESTING WITH FRONTEND CONFIGURATION');
  logger.info('======================================');
  
  if (frontendConfig.url && frontendConfig.key) {
    try {
      const frontendClient = createClient(frontendConfig.url, frontendConfig.key);
      
      // Test session check (what frontend does first)
      logger.info('\nTesting session check...');
      const { data: sessionData, error: sessionError } = await frontendClient.auth.getSession();
      
      if (sessionError) {
        logger.info(`❌ Session check failed: ${sessionError.message}`);
        
        if (sessionError.message.includes('Invalid API key')) {
          logger.info('🔥 FRONTEND CONFIG HAS INVALID API KEY!');
        }
      } else {
        logger.info('✅ Session check working');
      }
      
      // Test login with a dummy user (simulating what frontend does)
      logger.info('\nTesting login attempt...');
      const { data: loginData, error: loginError } = await frontendClient.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpass123'
      });
      
      if (loginError) {
        logger.info(`Login error: ${loginError.message}`);
        
        if (loginError.message.includes('Invalid API key')) {
          logger.info('🔥 CONFIRMED: Frontend configuration has invalid API key!');
          logger.info('📋 Root cause identified!');
        } else {
          logger.info('✅ API key working (normal auth error expected)');
        }
      }
      
    } catch (error) {
      logger.info(`❌ Frontend config test failed: ${error.message}`);
    }
  } else {
    logger.info('❌ Cannot test - frontend config incomplete');
  }
  
  // Step 4: Check if frontend is using cached build
  logger.info('\n4️⃣ FRONTEND BUILD ANALYSIS');
  logger.info('==========================');
  
  const buildPath = '../frontend/build';
  if (fs.existsSync(buildPath)) {
    logger.info('📦 Build directory exists');
    
    // Check if there are any compiled config files
    const staticJsPath = path.join(buildPath, 'static', 'js');
    if (fs.existsSync(staticJsPath)) {
      logger.info('📁 Static JS files exist (built app may use cached config)');
      logger.info('💡 Try: npm run build to rebuild with new environment variables');
    }
  } else {
    logger.info('📦 No build directory (development mode)');
  }
  
  // Step 5: Generate fresh config
  logger.info('\n5️⃣ SOLUTION GENERATOR');
  logger.info('=====================');
  
  if (backendKey && backendUrl) {
    logger.info('🛠️ CORRECTED FRONTEND CONFIG:');
    logger.info('');
    logger.info('Create/update your frontend/.env file with:');
    logger.info('');
    logger.info(`REACT_APP_SUPABASE_URL=${backendUrl}`);
    logger.info(`REACT_APP_SUPABASE_ANON_KEY=${backendKey}`);
    logger.info('REACT_APP_API_URL=http://localhost:8000');
    logger.info('');
    logger.info('🔄 THEN RUN THESE COMMANDS:');
    logger.info('cd ../frontend');
    logger.info('rm -rf build node_modules/.cache');
    logger.info('npm start');
    logger.info('');
    logger.info('🌐 BROWSER STEPS:');
    logger.info('1. Clear all browser data for localhost:3000');
    logger.info('2. Open incognito/private window');
    logger.info('3. Go to http://localhost:3000');
    logger.info('4. Try login again');
    
    // Write corrected config
    const correctedConfig = `REACT_APP_SUPABASE_URL=${backendUrl}
REACT_APP_SUPABASE_ANON_KEY=${backendKey}
REACT_APP_API_URL=http://localhost:8000
REACT_APP_CLIENT_URL=http://localhost:3000
`;
    
    try {
      fs.writeFileSync('../frontend/.env', correctedConfig);
      logger.info('\n✅ CORRECTED CONFIG WRITTEN TO frontend/.env');
    } catch (error) {
      logger.info(`\n❌ Could not write corrected config: ${error.message}`);
    }
  }
}

diagnoseFrontendIssue();