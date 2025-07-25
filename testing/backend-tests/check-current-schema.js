// Check current database schema to understand column names and types
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

async function checkSchema() {
  console.log('🔍 Checking current database schema...');
  
  try {
    // Check quizzes table structure
    console.log('\n📋 Checking quizzes table structure...');
    const { data: quizSample, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .limit(1);
      
    if (quizSample && quizSample[0]) {
      console.log('Quizzes table columns:', Object.keys(quizSample[0]));
    } else if (quizError) {
      console.log('Quizzes table error:', quizError.message);
    } else {
      console.log('Quizzes table is empty');
    }
    
    // Check tasks table structure
    console.log('\n✋ Checking tasks table structure...');
    const { data: taskSample, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);
      
    if (taskSample && taskSample[0]) {
      console.log('Tasks table columns:', Object.keys(taskSample[0]));
    } else if (taskError) {
      console.log('Tasks table error:', taskError.message);
    } else {
      console.log('Tasks table is empty');
    }
    
    // Test a simple insert to see exact error
    console.log('\n🧪 Testing simple quiz insert...');
    const { error: testQuizError } = await supabase
      .from('quizzes')
      .insert({
        question: 'Test question?',
        question_type: 'multiple_choice',
        options: [
          { text: 'Option A', value: 'A' },
          { text: 'Option B', value: 'B' }
        ],
        correct_answer: 'A',
        explanation: 'Test explanation'
      });
      
    if (testQuizError) {
      console.log('Quiz insert error:', testQuizError);
    } else {
      console.log('✅ Quiz insert successful - cleaning up');
      await supabase.from('quizzes').delete().eq('question', 'Test question?');
    }
    
    console.log('\n🧪 Testing simple task insert...');
    const { error: testTaskError } = await supabase
      .from('tasks')
      .insert({
        title: 'Test task',
        description: 'Test description',
        instructions: 'Test instructions',
        validation_criteria: 'Test criteria'
      });
      
    if (testTaskError) {
      console.log('Task insert error:', testTaskError);
    } else {
      console.log('✅ Task insert successful - cleaning up');
      await supabase.from('tasks').delete().eq('title', 'Test task');
    }
    
  } catch (error) {
    console.error('❌ Schema check error:', error);
  }
}

checkSchema();