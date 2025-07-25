// Validate Supabase configuration and provide guidance
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('🔍 Validating Supabase Configuration...');
console.log('URL:', supabaseUrl);
console.log('Anon Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');

async function validateSupabase() {
  try {
    // Test 1: Create client
    console.log('\n1️⃣ Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Client created successfully');

    // Test 2: Check connection with a simple query
    console.log('\n2️⃣ Testing database connection...');
    const { data, error } = await supabase
      .from('courses')
      .select('id, title')
      .limit(1);

    if (error) {
      console.log('❌ Database connection failed:', error.message);
      
      if (error.message.includes('JWT')) {
        console.log('\n🔑 JWT/API Key Issues Detected:');
        console.log('   - The API key might be expired or invalid');
        console.log('   - The project might have been reset or recreated');
        console.log('   - The URL might be incorrect');
      }
    } else {
      console.log('✅ Database connection successful');
      console.log('   Sample course:', data[0]?.title || 'No courses found');
    }

    // Test 3: Try auth session
    console.log('\n3️⃣ Testing auth system...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Auth system error:', sessionError.message);
    } else {
      console.log('✅ Auth system accessible');
      console.log('   Current session:', sessionData.session ? 'Active' : 'None');
    }

    // Test 4: Test user registration (dry run)
    console.log('\n4️⃣ Testing registration capability...');
    const testResult = await supabase.auth.signUp({
      email: 'test-dry-run@example.com',
      password: 'test12345678'
    });

    if (testResult.error) {
      if (testResult.error.message.includes('Invalid API key')) {
        console.log('❌ Registration failed: Invalid API key');
        console.log('\n🚨 SOLUTION NEEDED:');
        console.log('1. Go to https://supabase.com/dashboard');
        console.log('2. Find your AI-Masterclass project');
        console.log('3. Go to Settings > API');
        console.log('4. Copy the correct URL and anon key');
        console.log('5. Update both frontend/.env and backend/.env files');
      } else if (testResult.error.message.includes('already registered')) {
        console.log('✅ Registration system working (test user already exists)');
      } else {
        console.log('⚠️ Registration error:', testResult.error.message);
      }
    } else {
      console.log('✅ Registration test successful');
    }

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
  }

  console.log('\n📋 NEXT STEPS:');
  console.log('1. If API key is invalid, get fresh keys from Supabase dashboard');
  console.log('2. Update both .env files with correct keys');
  console.log('3. Restart both frontend and backend servers');
  console.log('4. Test registration at http://localhost:3000');
}

validateSupabase();