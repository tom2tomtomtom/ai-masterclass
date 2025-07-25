// Simple test script to verify Supabase Auth is working
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://fsohtauqtcftdjcjfdpq.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzb2h0YXVxdGNmdGRqY2pmZHBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMjY3ODAsImV4cCI6MjA2NzgwMjc4MH0.lKAb1jN0vqgYH4OUq64KvG0y40VpnHqE0sXEFq2JSQI';

console.log('🔍 Testing Supabase Auth Configuration...');
console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key length:', supabaseAnonKey?.length || 0);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseAuth() {
  try {
    console.log('\n🧪 Testing Supabase connection...');
    
    // Test 1: Basic connection
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('❌ Session check error:', error.message);
    } else {
      console.log('✅ Supabase connection successful');
      console.log('Current session:', data.session ? 'Active' : 'None');
    }
    
    // Test 2: Try to register a test user (this will fail if user exists, which is expected)
    console.log('\n🧪 Testing user registration (expect failure if user exists)...');
    const testEmail = 'test@aimasterclass.com';
    const testPassword = 'testpassword123';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          full_name: 'Test User'
        }
      }
    });
    
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('✅ Registration test passed (user already exists)');
      } else {
        console.log('⚠️ Registration error:', signUpError.message);
      }
    } else {
      console.log('✅ Registration successful for test user');
      console.log('User ID:', signUpData.user?.id);
    }
    
    console.log('\n🎉 Supabase Auth tests completed!');
    console.log('\nNext steps:');
    console.log('1. Visit http://localhost:3000 to test the auth UI');
    console.log('2. Try registering a new account');
    console.log('3. Check your email for verification link');
    console.log('4. Try logging in after verification');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSupabaseAuth();