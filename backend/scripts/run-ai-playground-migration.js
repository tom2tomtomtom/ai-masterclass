#!/usr/bin/env node

/**
 * AI Playground Database Migration Runner
 * Executes the database migration and seeding for AI Playground features
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

async function createSchemaVersionsTable() {
  console.log('📋 Ensuring schema_migrations table exists...');
  
  // For now, we'll check if we can create a simple table to test connection
  // This will be handled differently in production
  try {
    const { data, error } = await supabase
      .from('ai_models')
      .select('id', { head: true, count: 'exact' });
    
    if (error && error.code === 'PGRST116') {
      // Table doesn't exist yet, which is expected
      console.log('✅ Database connection verified, ready for migration');
    } else if (error) {
      throw error;
    } else {
      console.log('✅ Database connection verified');
    }
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw error;
  }
}

async function checkMigrationStatus(version) {
  const { data, error } = await supabase
    .from('schema_migrations')
    .select('version')
    .eq('version', version)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('❌ Error checking migration status:', error);
    throw error;
  }

  return !!data;
}

async function runMigration() {
  console.log('🚀 Starting AI Playground database migration...\n');

  try {
    // 1. Ensure schema_migrations table exists
    await createSchemaVersionsTable();

    // 2. Check if migration already ran
    const migrationVersion = '20250729000001';
    const alreadyMigrated = await checkMigrationStatus(migrationVersion);
    
    if (alreadyMigrated) {
      console.log('⚠️  Migration already executed. Skipping...');
      return;
    }

    // 3. Read migration file
    const migrationPath = path.join(__dirname, '../../database/migrations/20250729000001_create_ai_playground_schema.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Migration file loaded successfully');

    // 4. Execute migration
    console.log('⚡ Executing database migration...');
    
    // Split migration into statements to handle complex SQL
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`   Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error);
          console.error(`Statement: ${statement.substring(0, 100)}...`);
          throw error;
        }
      }
    }

    console.log('✅ Migration executed successfully');

    // 5. Run seeding
    console.log('\n🌱 Running seed data...');
    const { seedAiPlaygroundData } = require('../../database/seeds/ai_playground_seed');
    await seedAiPlaygroundData();

    console.log('\n🎉 AI Playground migration and seeding completed successfully!');
    console.log('\n📋 Migration Summary:');
    console.log('   ✅ Enhanced users table with industry and experience_level');
    console.log('   ✅ Created ai_models table');
    console.log('   ✅ Created prompt_templates table');
    console.log('   ✅ Created ai_conversations table');
    console.log('   ✅ Created ai_responses table');
    console.log('   ✅ Enhanced user_progress table');
    console.log('   ✅ Created community_posts table');
    console.log('   ✅ Created community_comments table');
    console.log('   ✅ Created mentor_profiles table');
    console.log('   ✅ Created mentorship_requests table');
    console.log('   ✅ Created user_achievements table');
    console.log('   ✅ Added performance indexes');
    console.log('   ✅ Seeded AI models and sample templates');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

async function validateMigration() {
  console.log('\n🔍 Validating migration...');

  const tablesToCheck = [
    'ai_models',
    'prompt_templates', 
    'ai_conversations',
    'ai_responses',
    'community_posts',
    'community_comments',
    'mentor_profiles',
    'mentorship_requests',
    'user_achievements'
  ];

  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error(`❌ Error validating table ${table}:`, error);
        return false;
      }

      console.log(`   ✅ Table ${table} exists and is accessible`);
    } catch (error) {
      console.error(`❌ Error checking table ${table}:`, error);
      return false;
    }
  }

  console.log('✅ All tables validated successfully');
  return true;
}

// Run migration if called directly
if (require.main === module) {
  runMigration()
    .then(() => validateMigration())
    .then((isValid) => {
      if (isValid) {
        console.log('\n🎉 AI Playground migration completed and validated!');
        process.exit(0);
      } else {
        console.error('\n❌ Migration validation failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n❌ Migration process failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration, validateMigration };