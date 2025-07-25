// Quick verification of current database state
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function quickVerification() {
  console.log('🔍 QUICK DATABASE VERIFICATION');
  console.log('===============================\n');

  try {
    // 1. Check courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, order_index')
      .order('order_index');

    if (coursesError) {
      console.error('❌ Error fetching courses:', coursesError);
      return;
    }

    console.log(`📚 COURSES: ${courses.length} total`);
    courses.forEach(course => {
      console.log(`  ${course.order_index}. ${course.title}`);
    });

    // 2. Check modules count by course
    console.log('\n🎯 MODULES BY COURSE:');
    for (const course of courses) {
      const { count, error } = await supabase
        .from('modules')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id);
      
      if (!error) {
        console.log(`  ${course.title}: ${count || 0} modules`);
      }
    }

    // 3. Check lessons count by course
    console.log('\n📝 LESSONS BY COURSE:');
    for (const course of courses) {
      const { count, error } = await supabase
        .from('lessons')
        .select('modules!inner(course_id)', { count: 'exact', head: true })
        .eq('modules.course_id', course.id);
      
      if (!error) {
        console.log(`  ${course.title}: ${count || 0} lessons`);
      }
    }

    // 4. Sample lesson content quality
    console.log('\n📄 SAMPLE LESSON CONTENT QUALITY:');
    const { data: sampleLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select(`
        title,
        content,
        modules!inner(title, courses!inner(title))
      `)
      .limit(3);

    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError);
    } else {
      sampleLessons.forEach((lesson, index) => {
        console.log(`\n  ${index + 1}. "${lesson.title}"`);
        console.log(`     Course: ${lesson.modules.courses.title}`);
        console.log(`     Module: ${lesson.modules.title}`);
        
        const contentPreview = lesson.content ? lesson.content.substring(0, 150) : 'No content';
        const isGeneric = contentPreview.includes('This lesson covers the fundamentals');
        const isRich = contentPreview.includes('#') || contentPreview.includes('**') || contentPreview.length > 100;
        
        console.log(`     Content Type: ${isGeneric ? '🔴 GENERIC TEMPLATE' : isRich ? '🟢 RICH CONTENT' : '🟡 BASIC'}`);
        console.log(`     Preview: ${contentPreview.replace(/\n/g, ' ')}...`);
      });
    }

    // 5. Check for empty or template-based lessons
    const { data: templateLessons, error: templateError } = await supabase
      .from('lessons')
      .select('title, content')
      .ilike('content', '%This lesson covers the fundamentals%')
      .limit(5);

    if (!templateError && templateLessons.length > 0) {
      console.log(`\n🔴 TEMPLATE-BASED LESSONS FOUND: ${templateLessons.length} examples`);
      templateLessons.forEach(lesson => {
        console.log(`  - "${lesson.title}"`);
      });
      console.log('  ⚠️ These should be replaced with rich markdown content');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

quickVerification();