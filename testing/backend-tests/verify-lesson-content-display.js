// Verify what users should actually see when clicking on lessons
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 VERIFYING LESSON CONTENT DISPLAY');
console.log('==================================');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyLessonDisplay() {
  try {
    console.log('\n1. 📝 CHECKING ACTUAL LESSON CONTENT FIELDS...');
    
    // Get sample lessons to see their actual content
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, title, content, status, estimated_minutes')
      .limit(10);
    
    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError.message);
      return;
    }
    
    console.log(`✅ Retrieved ${lessons.length} sample lessons`);
    
    lessons.forEach((lesson, index) => {
      console.log(`\n📖 LESSON ${index + 1}: ${lesson.title}`);
      console.log(`   📊 Content length: ${lesson.content?.length || 0} characters`);
      console.log(`   ⏱️  Estimated time: ${lesson.estimated_minutes || 0} minutes`);
      console.log(`   📋 Status: ${lesson.status}`);
      
      if (lesson.content && lesson.content.length > 0) {
        console.log(`   ✅ HAS CONTENT - Preview:`);
        console.log(`   "${lesson.content.substring(0, 200)}..."`);
        
        // Check for rich content indicators
        const hasMarkdown = /#{1,6}\s|```|\*\*|\*|\n\n/.test(lesson.content);
        const hasBusinessContent = /revenue|roi|business|client|agency|profit/i.test(lesson.content);
        const hasTechnicalContent = /api|code|development|programming|claude|chatgpt/i.test(lesson.content);
        const hasStepByStep = /step\s*\d+|##\s|###\s/i.test(lesson.content);
        
        console.log(`   🎨 Rich formatting: ${hasMarkdown ? 'YES' : 'NO'}`);
        console.log(`   💰 Business content: ${hasBusinessContent ? 'YES' : 'NO'}`);
        console.log(`   🔧 Technical content: ${hasTechnicalContent ? 'YES' : 'NO'}`);
        console.log(`   📋 Step-by-step: ${hasStepByStep ? 'YES' : 'NO'}`);
      } else {
        console.log(`   ❌ NO CONTENT - This lesson is empty!`);
      }
    });
    
    console.log('\n2. 🔗 CHECKING COURSE-MODULE-LESSON HIERARCHY...');
    
    // Get a complete course with modules and lessons
    const { data: courseWithLessons, error: courseError } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        status,
        modules(
          id,
          title,
          lessons(
            id,
            title,
            content,
            status
          )
        )
      `)
      .limit(1)
      .single();
    
    if (courseError) {
      console.error('❌ Error fetching course hierarchy:', courseError.message);
      return;
    }
    
    console.log(`📚 COURSE: ${courseWithLessons.title} (${courseWithLessons.status})`);
    console.log(`📂 Modules: ${courseWithLessons.modules.length}`);
    
    let totalLessons = 0;
    let lessonsWithContent = 0;
    let richContentLessons = 0;
    
    courseWithLessons.modules.forEach((module, moduleIndex) => {
      console.log(`\n   📂 MODULE ${moduleIndex + 1}: ${module.title}`);
      console.log(`      📝 Lessons: ${module.lessons.length}`);
      
      module.lessons.forEach((lesson, lessonIndex) => {
        totalLessons++;
        const hasContent = lesson.content && lesson.content.length > 0;
        const isRichContent = lesson.content && lesson.content.length > 1000;
        
        if (hasContent) lessonsWithContent++;
        if (isRichContent) richContentLessons++;
        
        console.log(`         📖 Lesson ${lessonIndex + 1}: ${lesson.title}`);
        console.log(`            Content: ${hasContent ? lesson.content.length + ' chars' : 'EMPTY'} (${lesson.status})`);
        
        // Show content preview for first few lessons
        if (lessonIndex < 3 && hasContent) {
          console.log(`            Preview: "${lesson.content.substring(0, 100)}..."`);
        }
      });
    });
    
    console.log(`\n📊 CONTENT SUMMARY:`);
    console.log(`   📝 Total lessons: ${totalLessons}`);
    console.log(`   ✅ Lessons with content: ${lessonsWithContent} (${Math.round(lessonsWithContent/totalLessons*100)}%)`);
    console.log(`   💎 Rich content lessons: ${richContentLessons} (${Math.round(richContentLessons/totalLessons*100)}%)`);
    
    console.log('\n3. 🎯 CHECKING INTERACTIVE CONTENT AVAILABILITY...');
    
    // Check for prompts, quizzes, tasks
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select('id, title')
      .limit(5);
    
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('id, title')
      .limit(5);
    
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title')
      .limit(5);
    
    console.log(`📋 Interactive Content:`);
    console.log(`   🎯 Prompts: ${prompts?.length || 0} found`);
    console.log(`   ❓ Quizzes: ${quizzes?.length || 0} found`);
    console.log(`   ✋ Tasks: ${tasks?.length || 0} found`);
    
    console.log('\n4. 🌐 SIMULATING API RESPONSE FOR FRONTEND...');
    
    // Simulate what the frontend should receive for a lesson
    const sampleLesson = lessons.find(l => l.content && l.content.length > 500);
    if (sampleLesson) {
      const apiResponse = {
        success: true,
        data: {
          lesson: {
            id: sampleLesson.id,
            title: sampleLesson.title,
            content: sampleLesson.content,
            status: sampleLesson.status,
            estimated_minutes: sampleLesson.estimated_minutes
          },
          prompts: prompts || [],
          quizzes: quizzes || [],
          tasks: tasks || []
        }
      };
      
      console.log(`✅ Sample API Response Structure:`);
      console.log(`   📖 Lesson title: ${apiResponse.data.lesson.title}`);
      console.log(`   📊 Content length: ${apiResponse.data.lesson.content?.length || 0} chars`);
      console.log(`   🎯 Interactive elements: ${apiResponse.data.prompts.length + apiResponse.data.quizzes.length + apiResponse.data.tasks.length}`);
      
      // Show what the user should see
      console.log(`\n👁️  WHAT USER SHOULD SEE:`);
      console.log(`   📄 Rich lesson content with markdown formatting`);
      console.log(`   🎯 ${apiResponse.data.prompts.length} copy-paste prompts`);
      console.log(`   ❓ ${apiResponse.data.quizzes.length} knowledge check quizzes`);
      console.log(`   ✋ ${apiResponse.data.tasks.length} hands-on tasks`);
    }
    
    console.log('\n5. 🚨 PROBLEM DIAGNOSIS...');
    
    const problems = [];
    
    if (lessonsWithContent < totalLessons * 0.8) {
      problems.push(`Only ${Math.round(lessonsWithContent/totalLessons*100)}% of lessons have content`);
    }
    
    if (richContentLessons < totalLessons * 0.4) {
      problems.push(`Only ${Math.round(richContentLessons/totalLessons*100)}% of lessons have rich content`);
    }
    
    if (!prompts || prompts.length === 0) {
      problems.push('No interactive prompts available');
    }
    
    if (!quizzes || quizzes.length === 0) {
      problems.push('No knowledge check quizzes available');
    }
    
    if (!tasks || tasks.length === 0) {
      problems.push('No hands-on tasks available');
    }
    
    if (problems.length === 0) {
      console.log('✅ NO MAJOR CONTENT ISSUES DETECTED');
      console.log('🔍 Problem likely in frontend data fetching or display logic');
    } else {
      console.log('❌ CONTENT ISSUES IDENTIFIED:');
      problems.forEach(problem => console.log(`   - ${problem}`));
    }
    
    console.log('\n🎯 RECOMMENDATION:');
    if (lessonsWithContent > totalLessons * 0.8 && richContentLessons > 0) {
      console.log('✅ Backend content is good - focus on fixing frontend display');
      console.log('🔧 Check LessonDetails component rendering logic');
      console.log('🔧 Check API endpoints are being called correctly');
      console.log('🔧 Check markdown rendering in frontend');
    } else {
      console.log('❌ Backend content needs improvement');
      console.log('🔧 Run comprehensive content seeding');
      console.log('🔧 Populate interactive elements (prompts, quizzes, tasks)');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

// Run verification
verifyLessonDisplay()
  .then(() => {
    console.log('\n✅ Lesson content verification completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  });