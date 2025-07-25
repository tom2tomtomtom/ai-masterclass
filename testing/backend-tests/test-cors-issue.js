// Test CORS and domain restrictions
require('dotenv').config();

async function testCorsIssue() {
  console.log('🌐 TESTING CORS AND DOMAIN RESTRICTIONS');
  console.log('======================================');
  
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  
  console.log('Testing different request contexts...\n');
  
  // Test 1: Simulate browser request (with Origin header)
  console.log('1️⃣ Testing with browser-like Origin header...');
  try {
    const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Origin': 'http://localhost:3000',  // Browser adds this
        'Referer': 'http://localhost:3000/' // Browser adds this
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    });
    
    const text = await response.text();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${text.substring(0, 100)}...`);
    
    if (response.status === 401 && text.includes('Invalid API key')) {
      console.log('   🔥 CORS/Domain restriction detected!');
    } else if (response.status === 400) {
      console.log('   ✅ API key accepted (normal auth error)');
    }
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`);
  }
  
  // Test 2: Test without Origin (server-like)
  console.log('\n2️⃣ Testing without Origin header (server-like)...');
  try {
    const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`
        // No Origin or Referer headers
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    });
    
    const text = await response.text();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${text.substring(0, 100)}...`);
    
    if (response.status === 400) {
      console.log('   ✅ API key accepted (normal auth error)');
    }
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`);
  }
  
  console.log('\n🎯 SOLUTION:');
  console.log('============');
  console.log('If Test 1 fails but Test 2 succeeds, the issue is CORS/domain restrictions.');
  console.log('');
  console.log('🔧 TO FIX:');
  console.log('1. Go to Supabase Dashboard → Settings → API');
  console.log('2. Look for "Site URL" or "Allowed Origins" settings');
  console.log('3. Add: http://localhost:3000');
  console.log('4. Or try disabling domain restrictions temporarily');
  console.log('');
  console.log('💡 ALTERNATIVE:');
  console.log('Try accessing your app at http://127.0.0.1:3000 instead of localhost:3000');
  console.log('Some CORS policies treat these differently.');
}

testCorsIssue();