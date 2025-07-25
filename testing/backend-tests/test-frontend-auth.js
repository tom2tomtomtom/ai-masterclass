// Test frontend authentication scenario
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testFrontendAuth() {
  console.log('🔐 TESTING FRONTEND AUTHENTICATION SCENARIO');
  console.log('============================================');
  
  // Use the exact same configuration as frontend
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  
  console.log('📱 Frontend Configuration:');
  console.log(`   URL: ${process.env.SUPABASE_URL}`);
  console.log(`   Anon Key: ${process.env.SUPABASE_ANON_KEY?.substring(0, 30)}...`);
  
  try {
    // Test 1: Check current session
    console.log('\n1️⃣ Checking current session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log(`   ❌ Session check failed: ${sessionError.message}`);
    } else {
      console.log(`   ✅ Session check working: ${sessionData.session ? 'Active session' : 'No session'}`);
    }
    
    // Test 2: Try signing up with a fresh email
    const testEmail = `test-${Date.now()}@example.com`;
    console.log(`\n2️⃣ Testing signup with: ${testEmail}`);
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpass123',
      options: {
        data: {
          name: 'Test User'
        }
      }
    });
    
    if (signupError) {
      console.log(`   ⚠️ Signup result: ${signupError.message}`);
      
      if (signupError.message.includes('Invalid API key') || signupError.message.includes('invalid_api_key')) {
        console.log('   🔥 CONFIRMED: Invalid API key error detected!');
        console.log('   📋 Troubleshooting steps:');
        console.log('   1. Check Supabase dashboard → Settings → API');
        console.log('   2. Verify project URL and anon key are correct');
        console.log('   3. Ensure authentication is enabled in Supabase');
        return;
      } else if (signupError.message.includes('invalid') && signupError.message.includes('email')) {
        console.log('   ✅ API key working (email format validation error)');
      }
    } else {
      console.log(`   ✅ Signup working: ${signupData.user?.email || 'User created'}`);
    }
    
    // Test 3: Try login with non-existent user (should give proper auth error)
    console.log('\n3️⃣ Testing login with non-existent user...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'nonexistent@example.com',
      password: 'wrongpass'
    });
    
    if (loginError) {
      console.log(`   Login error: ${loginError.message}`);
      
      if (loginError.message.includes('Invalid API key')) {
        console.log('   🔥 INVALID API KEY ERROR CONFIRMED!');
        console.log('   🛠️ The frontend anonymous key is incorrect or expired');
      } else if (loginError.message.includes('Invalid login credentials') || loginError.message.includes('user not found')) {
        console.log('   ✅ API key working (proper auth validation)');
      }
    } else {
      console.log(`   ⚠️ Login unexpectedly succeeded`);
    }
    
    // Test 4: Direct database access test
    console.log('\n4️⃣ Testing database access with anon key...');
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select('id, title')
      .limit(1);
      
    if (coursesError) {
      console.log(`   ❌ Database access failed: ${coursesError.message}`);
      
      if (coursesError.message.includes('Invalid API key')) {
        console.log('   🔥 DATABASE ACCESS: Invalid API key error!');
      }
    } else {
      console.log(`   ✅ Database access working: ${coursesData?.[0]?.title || 'Data retrieved'}`);
    }
    
    console.log('\n🎯 AUTHENTICATION DIAGNOSIS');
    console.log('============================');
    
    // Check if the user is seeing this error in the browser console
    console.log('If you see "Invalid API key" errors in your browser:');
    console.log('');
    console.log('1. 🔧 FRONTEND RESTART REQUIRED');
    console.log('   - The frontend may be using cached environment variables');
    console.log('   - Stop the frontend (Ctrl+C) and restart: npm start');
    console.log('');
    console.log('2. 🌐 BROWSER CACHE');
    console.log('   - Clear browser cache or open incognito/private window');
    console.log('   - Old API keys may be cached by the browser');
    console.log('');
    console.log('3. ⚙️ SUPABASE PROJECT SETTINGS');
    console.log('   - Go to Supabase Dashboard → Settings → API');
    console.log('   - Verify authentication is enabled');
    console.log('   - Check if email confirmation is required');
    
  } catch (error) {
    console.error('❌ Frontend auth test failed:', error);
    
    if (error.message.includes('Invalid API key')) {
      console.log('\n🔥 ROOT CAUSE IDENTIFIED: Invalid API Key');
      console.log('The Supabase anonymous key is incorrect, expired, or not authorized.');
      console.log('');
      console.log('🛠️ SOLUTIONS:');
      console.log('1. Get fresh keys from Supabase Dashboard');
      console.log('2. Update both backend and frontend .env files');
      console.log('3. Restart both servers');
      console.log('4. Enable authentication in Supabase project settings');
    }
  }
}

testFrontendAuth();