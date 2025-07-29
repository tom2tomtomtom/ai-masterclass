const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testAiModelsTable() {
  console.log('🔍 Testing ai_models table...');

  try {
    // Test 1: Check if table exists by selecting
    console.log('1. Testing table access...');
    const { data: selectData, error: selectError } = await supabase
      .from('ai_models')
      .select('*')
      .limit(5);

    if (selectError) {
      console.error('❌ Select error:', JSON.stringify(selectError, null, 2));
    } else {
      console.log('✅ Table accessible');
      console.log(`   Found ${selectData.length} existing records`);
    }

    // Test 2: Try simple insert
    console.log('2. Testing simple insert...');
    const testModel = {
      name: 'Test-Model-' + Date.now(),
      provider: 'Test Provider',
      is_active: true
    };

    const { data: insertData, error: insertError } = await supabase
      .from('ai_models')
      .insert([testModel])
      .select();

    if (insertError) {
      console.error('❌ Insert error:', JSON.stringify(insertError, null, 2));
    } else {
      console.log('✅ Insert successful');
      console.log('   Inserted:', insertData);

      // Clean up test record
      if (insertData && insertData[0]) {
        await supabase.from('ai_models').delete().eq('id', insertData[0].id);
        console.log('   Test record cleaned up');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAiModelsTable();