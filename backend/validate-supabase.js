// Validate Supabase configuration and provide guidance
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

logger.info('🔍 Validating Supabase Configuration...');
logger.info('URL:', supabaseUrl);
logger.info('Anon Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');

async function validateSupabase() {
  try {
    // Test 1: Create client
    logger.info('\n1️⃣ Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    logger.info('✅ Client created successfully');

    // Test 2: Check connection with a simple query
    logger.info('\n2️⃣ Testing database connection...');
    const { data, error } = await supabase
      .from('courses')
      .select('id, title')
      .limit(1);

    if (error) {
      logger.info('❌ Database connection failed:', error.message);
      
      if (error.message.includes('JWT')) {
        logger.info('\n🔑 JWT/API Key Issues Detected:');
        logger.info('   - The API key might be expired or invalid');
        logger.info('   - The project might have been reset or recreated');
        logger.info('   - The URL might be incorrect');
      }
    } else {
      logger.info('✅ Database connection successful');
      logger.info('   Sample course:', data[0]?.title || 'No courses found');
    }

    // Test 3: Try auth session
    logger.info('\n3️⃣ Testing auth system...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      logger.info('❌ Auth system error:', sessionError.message);
    } else {
      logger.info('✅ Auth system accessible');
      logger.info('   Current session:', sessionData.session ? 'Active' : 'None');
    }

    // Test 4: Test user registration (dry run)
    logger.info('\n4️⃣ Testing registration capability...');
    const testResult = await supabase.auth.signUp({
      email: 'test-dry-run@example.com',
      password: 'test12345678'
    });

    if (testResult.error) {
      if (testResult.error.message.includes('Invalid API key')) {
        logger.info('❌ Registration failed: Invalid API key');
        logger.info('\n🚨 SOLUTION NEEDED:');
        logger.info('1. Go to https://supabase.com/dashboard');
        logger.info('2. Find your AI-Masterclass project');
        logger.info('3. Go to Settings > API');
        logger.info('4. Copy the correct URL and anon key');
        logger.info('5. Update both frontend/.env and backend/.env files');
      } else if (testResult.error.message.includes('already registered')) {
        logger.info('✅ Registration system working (test user already exists)');
      } else {
        logger.info('⚠️ Registration error:', testResult.error.message);
      }
    } else {
      logger.info('✅ Registration test successful');
    }

  } catch (error) {
    logger.error('❌ Validation failed:', error.message);
  }

  logger.info('\n📋 NEXT STEPS:');
  logger.info('1. If API key is invalid, get fresh keys from Supabase dashboard');
  logger.info('2. Update both .env files with correct keys');
  logger.info('3. Restart both frontend and backend servers');
  logger.info('4. Test registration at http://localhost:3000');
}

validateSupabase();