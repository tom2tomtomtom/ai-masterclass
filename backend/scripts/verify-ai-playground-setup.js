#!/usr/bin/env node

/**
 * AI Playground Setup Verification Script
 * Checks if the database has the required tables and structure for AI Playground
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*', { head: true, count: 'exact' });
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        return { exists: false, error: null };
      }
      return { exists: false, error };
    }
    
    return { exists: true, error: null };
  } catch (error) {
    return { exists: false, error };
  }
}

async function checkCurrentDatabaseStructure() {
  console.log('🔍 Checking current database structure...\n');

  const requiredTables = [
    'users',
    'ai_models',
    'prompt_templates',
    'ai_conversations', 
    'ai_responses',
    'user_progress',
    'community_posts',
    'community_comments',
    'mentor_profiles',
    'mentorship_requests',
    'user_achievements'
  ];

  const tableStatus = {};

  for (const table of requiredTables) {
    const { exists, error } = await checkTableExists(table);
    tableStatus[table] = { exists, error };
    
    if (exists) {
      console.log(`✅ ${table} - Table exists`);
    } else {
      console.log(`❌ ${table} - Table missing`);
      if (error) {
        console.log(`   Error: ${error.message}`);
      }
    }
  }

  return tableStatus;
}

async function checkExistingUserTable() {
  console.log('\n🔍 Checking users table structure...');
  
  try {
    // Check if users table has the new columns we need
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at')
      .limit(1);
    
    if (error) {
      console.log('❌ Users table check failed:', error.message);
      return false;
    }
    
    console.log('✅ Users table exists and is accessible');
    console.log(`   Found ${data ? data.length : 0} sample records`);
    
    // Note: We can't directly check column existence via Supabase API
    // The migration will add industry and experience_level columns
    
    return true;
  } catch (error) {
    console.log('❌ Users table verification error:', error.message);
    return false;
  }
}

async function generateMigrationPlan(tableStatus) {
  console.log('\n📋 AI Playground Migration Plan:\n');

  const missingTables = Object.entries(tableStatus)
    .filter(([table, status]) => !status.exists)
    .map(([table]) => table);

  if (missingTables.length === 0) {
    console.log('🎉 All required tables already exist!');
    console.log('✅ Database is ready for AI Playground features');
    return;
  }

  console.log('📝 Tables to create:');
  missingTables.forEach(table => {
    console.log(`   • ${table}`);
  });

  console.log('\n🔧 Recommended steps:');
  console.log('1. Apply the migration SQL file in Supabase dashboard:');
  console.log('   File: database/migrations/20250729000001_create_ai_playground_schema.sql');
  console.log('2. Run seed data to populate AI models and sample templates');
  console.log('3. Run this verification script again to confirm setup');

  console.log('\n📍 Manual Migration Steps:');
  console.log('1. Open your Supabase dashboard');
  console.log('2. Go to SQL Editor');
  console.log('3. Copy and paste the migration SQL file contents');
  console.log('4. Execute the SQL');
  console.log('5. Run: node database/seeds/ai_playground_seed.js');
}

async function runDatabaseCheck() {
  console.log('🚀 AI Playground Database Setup Verification\n');
  console.log(`📡 Connecting to: ${supabaseUrl}\n`);

  try {
    // 1. Check basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Database connection failed:', error);
      return;
    }

    console.log('✅ Database connection successful\n');

    // 2. Check current table structure
    const tableStatus = await checkCurrentDatabaseStructure();

    // 3. Check users table specifically
    await checkExistingUserTable();

    // 4. Generate migration plan
    await generateMigrationPlan(tableStatus);

    console.log('\n🏁 Verification completed!');

  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  }
}

// Run verification if called directly
if (require.main === module) {
  runDatabaseCheck()
    .then(() => {
      console.log('\n✅ AI Playground setup verification completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Verification process failed:', error);
      process.exit(1);
    });
}

module.exports = { runDatabaseCheck, checkTableExists };