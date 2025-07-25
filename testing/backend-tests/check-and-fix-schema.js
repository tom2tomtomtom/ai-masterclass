// Check current schema and fix it for rich interactive content
require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function checkAndFixSchema() {
  console.log('🔍 Checking current schema and fixing for rich content...');
  
  try {
    // Check current table schemas by trying to get one record from each
    console.log('\n📋 Checking prompts table...');
    const { data: promptSample, error: promptError } = await supabase
      .from('prompts')
      .select('*')
      .limit(1);
      
    if (promptSample && promptSample[0]) {
      console.log('Current prompts schema:', Object.keys(promptSample[0]));
    } else if (promptError) {
      console.log('Prompts table error or empty:', promptError.message);
    }
    
    console.log('\n🎯 Checking quizzes table...');
    const { data: quizSample, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .limit(1);
      
    if (quizSample && quizSample[0]) {
      console.log('Current quizzes schema:', Object.keys(quizSample[0]));
    } else if (quizError) {
      console.log('Quizzes table error or empty:', quizError.message);
    }
    
    console.log('\n✋ Checking tasks table...');
    const { data: taskSample, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);
      
    if (taskSample && taskSample[0]) {
      console.log('Current tasks schema:', Object.keys(taskSample[0]));
    } else if (taskError) {
      console.log('Tasks table error or empty:', taskError.message);
    }
    
    // Now let's add the missing columns using SQL
    console.log('\n🔧 Adding missing columns...');
    
    // Add missing columns to prompts table
    const promptAlterCommands = [
      `ALTER TABLE prompts ADD COLUMN IF NOT EXISTS description TEXT;`,
      `ALTER TABLE prompts ADD COLUMN IF NOT EXISTS use_case TEXT;`,
      `ALTER TABLE prompts ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'beginner';`,
      `ALTER TABLE prompts ADD COLUMN IF NOT EXISTS lesson_title TEXT;`,
      `ALTER TABLE prompts ADD COLUMN IF NOT EXISTS lesson_id UUID;`
    ];
    
    // Add missing columns to quizzes table  
    const quizAlterCommands = [
      `ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'beginner';`,
      `ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS lesson_title TEXT;`,
      `ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS lesson_id UUID;`
    ];
    
    // Add missing columns to tasks table
    const taskAlterCommands = [
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 30;`,
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS submission_format TEXT DEFAULT 'document';`,
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT true;`,
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS lesson_title TEXT;`,
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS lesson_id UUID;`
    ];
    
    const allCommands = [...promptAlterCommands, ...quizAlterCommands, ...taskAlterCommands];
    
    for (const command of allCommands) {
      try {
        console.log(`Executing: ${command}`);
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.log(`❌ Failed: ${error.message}`);
          // Try alternative approach for adding columns
          console.log('Trying alternative approach...');
          
          // Extract table and column info from command
          const match = command.match(/ALTER TABLE (\w+) ADD COLUMN IF NOT EXISTS (\w+) (.+);/);
          if (match) {
            const [, table, column, definition] = match;
            console.log(`Adding ${column} to ${table}...`);
            
            // We'll handle this differently - let's just try inserting with minimal data first
          }
        } else {
          console.log(`✅ Success`);
        }
      } catch (error) {
        console.log(`❌ Exception: ${error.message}`);
      }
    }
    
    // Test inserting with minimal schema
    console.log('\n🧪 Testing insertion with minimal required fields...');
    
    // Get a lesson ID to link to
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, title')
      .eq('title', 'Debugging and Troubleshooting Prompts')
      .limit(1);
      
    if (lessons && lessons[0]) {
      const lesson = lessons[0];
      
      // Try inserting a minimal prompt
      console.log('Testing minimal prompt insertion...');
      const minimalPrompt = {
        title: 'Test Systematic Debug Framework',
        prompt_text: 'Test prompt content for debugging',
        platform: 'claude',
        lesson_id: lesson.id
      };
      
      const { error: insertError } = await supabase
        .from('prompts')
        .insert(minimalPrompt);
        
      if (insertError) {
        console.log('❌ Minimal insert failed:', insertError.message);
        console.log('Available columns seem to be different. Let me create a simpler approach...');
      } else {
        console.log('✅ Minimal insert worked! Schema supports basic fields.');
        
        // Clean up test record
        await supabase
          .from('prompts')
          .delete()
          .eq('title', 'Test Systematic Debug Framework');
      }
    }
    
  } catch (error) {
    console.error('❌ Schema check error:', error);
  }
}

// Helper function to execute raw SQL (if available)
async function executeSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    return { data, error };
  } catch (error) {
    return { error };
  }
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
} else {
  checkAndFixSchema();
}