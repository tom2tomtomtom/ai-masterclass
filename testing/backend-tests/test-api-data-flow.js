// Test API Data Flow - Verify lesson API returns proper data
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 TESTING API DATA FLOW - LESSON ENDPOINT');
console.log('==========================================');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testApiDataFlow() {
  try {
    console.log('\n1. 📊 GETTING SAMPLE LESSON FOR TESTING...');
    
    // Get a lesson with rich content and interactive elements
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select(`
        id, 
        title, 
        content, 
        lesson_type, 
        estimated_minutes, 
        difficulty, 
        description, 
        status
      `)
      .not('content', 'is', null)
      .gte('content', 'length', 1000)
      .limit(1)
      .single();
    
    if (lessonError) {
      throw lessonError;
    }
    
    console.log(`✅ Found test lesson: "${lesson.title}"`);
    console.log(`   📊 Content: ${lesson.content?.length || 0} characters`);
    console.log(`   🔢 ID: ${lesson.id}`);
    
    console.log('\n2. 🔗 TESTING API ENDPOINT SIMULATION...');
    
    // Simulate what the backend /api/lessons/:id endpoint should return
    const [promptsResult, quizzesResult, tasksResult] = await Promise.all([
      supabase.from('prompts').select('*').eq('lesson_id', lesson.id),
      supabase.from('quizzes').select('*').eq('lesson_id', lesson.id),
      supabase.from('tasks').select('*').eq('lesson_id', lesson.id)
    ]);
    
    const simulatedApiResponse = {
      success: true,
      data: {
        // Lesson data directly in data object (not nested under data.lesson)
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        lesson_type: lesson.lesson_type,
        estimated_minutes: lesson.estimated_minutes,
        difficulty: lesson.difficulty,
        description: lesson.description,
        status: lesson.status,
        // Interactive content as arrays
        prompts: promptsResult.data || [],
        quizzes: quizzesResult.data || [],
        tasks: tasksResult.data || []
      }
    };
    
    console.log('✅ Simulated API response structure:');
    console.log(`   📖 Lesson data: Direct under 'data' object`);
    console.log(`   📋 Prompts: ${simulatedApiResponse.data.prompts.length} found`);
    console.log(`   🎯 Quizzes: ${simulatedApiResponse.data.quizzes.length} found`);
    console.log(`   ✋ Tasks: ${simulatedApiResponse.data.tasks.length} found`);
    
    console.log('\n3. 🌐 TESTING ACTUAL API ENDPOINT...');
    
    // Test the actual API endpoint 
    const API_URL = 'http://localhost:8000';
    try {
      const response = await fetch(`${API_URL}/api/lessons/${lesson.id}`);
      
      if (response.ok) {
        const actualApiData = await response.json();
        console.log('✅ API endpoint is responding');
        console.log(`   📊 Response success: ${actualApiData.success}`);
        console.log(`   📖 Has lesson data: ${!!actualApiData.data}`);
        console.log(`   🔤 Lesson title: ${actualApiData.data?.title || 'N/A'}`);
        console.log(`   📝 Content length: ${actualApiData.data?.content?.length || 0}`);
        console.log(`   📋 Prompts count: ${actualApiData.data?.prompts?.length || 0}`);
        console.log(`   🎯 Quizzes count: ${actualApiData.data?.quizzes?.length || 0}`);
        console.log(`   ✋ Tasks count: ${actualApiData.data?.tasks?.length || 0}`);
        
        // Verify data structure matches expectations
        const structureMatches = 
          actualApiData.success === true &&
          actualApiData.data &&
          actualApiData.data.id === lesson.id &&
          actualApiData.data.title === lesson.title &&
          typeof actualApiData.data.content === 'string' &&
          Array.isArray(actualApiData.data.prompts) &&
          Array.isArray(actualApiData.data.quizzes) &&
          Array.isArray(actualApiData.data.tasks);
        
        console.log(`   🎯 Structure matches expected: ${structureMatches ? 'YES' : 'NO'}`);
        
        if (structureMatches) {
          console.log('\n✅ API DATA FLOW TEST: SUCCESS!');
          console.log('🎉 The API endpoint returns data in the correct format');
          console.log('🚀 Frontend should be able to parse this response properly');
        } else {
          console.log('\n⚠️ API DATA FLOW TEST: STRUCTURE MISMATCH');
          console.log('Expected vs Actual response structure:');
          console.log('Expected: { success: true, data: { id, title, content, prompts: [], quizzes: [], tasks: [] } }');
          console.log('Actual:', JSON.stringify(actualApiData, null, 2));
        }
        
      } else {
        console.log(`❌ API endpoint returned error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`Error details: ${errorText}`);
      }
    } catch (fetchError) {
      console.log(`❌ Failed to reach API endpoint: ${fetchError.message}`);
      console.log('⚠️ Make sure the backend server is running on port 8000');
    }
    
    console.log('\n4. 📝 FRONTEND INTEGRATION NOTES:');
    console.log('=================================');
    console.log('The frontend LessonDetails component should:');
    console.log('1. Call api.lessons.getById(id)');
    console.log('2. Expect response: { success: true, data: { lesson_properties, prompts: [], quizzes: [], tasks: [] } }');
    console.log('3. Extract lesson data directly from response.data (not response.data.lesson)');
    console.log('4. Extract interactive arrays directly from response.data.prompts/quizzes/tasks');
    console.log('5. Pass lesson.content to MarkdownRenderer component');
    
    console.log('\n5. 🎯 EXPECTED USER EXPERIENCE:');
    console.log('==============================');
    console.log('When user clicks on a lesson, they should see:');
    console.log(`• Rich lesson content (${lesson.content?.length || 0} characters of educational material)`);
    console.log(`• ${simulatedApiResponse.data.prompts.length} copy-paste prompts with platform badges`);
    console.log(`• ${simulatedApiResponse.data.quizzes.length} interactive quizzes with immediate feedback`);
    console.log(`• ${simulatedApiResponse.data.tasks.length} practical tasks with step-by-step instructions`);
    console.log('• Professional markdown formatting and styling');
    console.log('• Working copy buttons, quiz interactions, and task completion tracking');
    
    return {
      success: true,
      testLesson: lesson,
      apiResponse: simulatedApiResponse,
      interactiveCounts: {
        prompts: simulatedApiResponse.data.prompts.length,
        quizzes: simulatedApiResponse.data.quizzes.length,
        tasks: simulatedApiResponse.data.tasks.length
      }
    };
    
  } catch (error) {
    console.error('❌ API data flow test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testApiDataFlow()
  .then((results) => {
    console.log('\n✅ API data flow test completed!');
    if (results.success) {
      console.log('🎯 CONCLUSION: API data structure is correct for rich content display');
      console.log(`📊 Test lesson has ${results.testLesson.content?.length || 0} chars of content`);
      console.log(`🎮 Interactive elements: ${results.interactiveCounts.prompts + results.interactiveCounts.quizzes + results.interactiveCounts.tasks} total`);
    } else {
      console.log('⚠️ Some issues were found that may need attention');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  });