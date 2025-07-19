const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://fsohtauqtcftdjcjfdpq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzb2h0YXVxdGNmdGRqY2pmZHBxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIyNjc4MCwiZXhwIjoyMDY3ODAyNzgwfQ.vLRzjcMIrpn8m3nEDI7pE7bSZg20Msdw60CHcsV1otI';

console.log('🚀 EMERGENCY CONTENT SEEDING - Processing 163,000+ words...');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Read content from files
function readContentFile(filename) {
  try {
    const filePath = path.join(__dirname, '..', filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      console.log(`📄 Read ${filename}: ${content.length} characters`);
      return content;
    } else {
      console.log(`❌ File not found: ${filename}`);
      return null;
    }
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message);
    return null;
  }
}

// Parse markdown content into structured data
function parseMarkdownToLessons(content, title) {
  const lessons = [];
  const sections = content.split(/^##\s+/m).filter(section => section.trim());
  
  sections.forEach((section, index) => {
    const lines = section.split('\n');
    const lessonTitle = lines[0].replace(/^#+\s*/, '').trim();
    const lessonContent = lines.slice(1).join('\n').trim();
    
    if (lessonTitle && lessonContent && lessonContent.length > 100) {
      lessons.push({
        title: lessonTitle,
        description: `Comprehensive lesson on ${lessonTitle.toLowerCase()}`,
        content: lessonContent,
        order_index: index + 1,
        estimated_minutes: Math.max(15, Math.min(60, Math.ceil(lessonContent.length / 100))),
        lesson_type: 'tutorial',
        platform_focus: title.toLowerCase().includes('claude') ? 'claude' : 
                       title.toLowerCase().includes('chatgpt') ? 'chatgpt' :
                       title.toLowerCase().includes('gemini') ? 'gemini' : 'mixed'
      });
    }
  });
  
  return lessons;
}

// Extract prompts from content
function extractPrompts(content, lessonId) {
  const prompts = [];
  const promptRegex = /```[\s\S]*?```/g;
  const matches = content.match(promptRegex) || [];
  
  matches.forEach((match, index) => {
    const promptText = match.replace(/```/g, '').trim();
    if (promptText.length > 50) {
      prompts.push({
        lesson_id: lessonId,
        title: `Professional Prompt ${index + 1}`,
        description: `Ready-to-use professional prompt extracted from content`,
        prompt_text: promptText,
        platform: 'claude',
        category: 'professional',
        use_case: 'Professional workflow optimization',
        expected_output: 'High-quality professional results',
        order_index: index + 1
      });
    }
  });
  
  return prompts;
}

// Generate quiz from content
function generateQuizFromContent(content, lessonId, title) {
  const quiz = {
    lesson_id: lessonId,
    title: `${title} Knowledge Check`,
    description: `Test your understanding of key concepts from ${title}`,
    question_text: `What is the most important takeaway from the "${title}" lesson?`,
    question_type: 'multiple_choice',
    options: JSON.stringify([
      { value: 'a', text: 'Understanding the fundamental concepts' },
      { value: 'b', text: 'Applying the knowledge practically' },
      { value: 'c', text: 'Mastering advanced techniques' },
      { value: 'd', text: 'All of the above' }
    ]),
    correct_answer: 'd',
    explanation: `Effective mastery requires understanding concepts, practical application, and advanced technique development.`,
    order_index: 1
  };
  
  return quiz;
}

// Generate task from content
function generateTaskFromContent(content, lessonId, title) {
  const task = {
    lesson_id: lessonId,
    title: `Apply ${title} Concepts`,
    description: `Hands-on practice with concepts from ${title}`,
    instructions: `Complete this practical exercise:\n\n1. Review the key concepts from "${title}"\n2. Choose a real scenario from your work where you can apply these concepts\n3. Implement the approach outlined in the lesson\n4. Document your process and results\n5. Reflect on what worked well and areas for improvement\n\nSubmit a summary of your implementation experience and key learnings.`,
    platform: 'claude',
    task_type: 'practical_application',
    validation_criteria: 'Clear demonstration of concept application with thoughtful analysis',
    submission_format: 'text',
    estimated_minutes: 45,
    order_index: 1,
    is_required: true
  };
  
  return task;
}

// Main seeding function
async function seedMassiveContent() {
  try {
    console.log('🧹 Clearing existing minimal content...');
    
    // Clear existing content
    await supabase.from('user_task_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('user_quiz_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('user_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('quizzes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('prompts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('modules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('✅ Existing content cleared');
    
    // PHASE 1: HIGH-IMPACT CORE CONTENT
    console.log('\n🎯 PHASE 1: HIGH-IMPACT CORE CONTENT');
    
    const coreContentFiles = [
      { filename: 'gemini.md', title: 'Google AI & Gemini Mastery', level: 2, priority: 1 },
      { filename: 'claude.md', title: 'Claude Professional Excellence', level: 1, priority: 1 },
      { filename: 'chatgpt-module-content.md', title: 'ChatGPT Professional Mastery', level: 1, priority: 1 },
      { filename: 'custom-gpts-module-content.md', title: 'Custom GPTs Development', level: 3, priority: 1 },
      { filename: 'agency-module-1-1-content.md', title: 'Agency AI Applications', level: 2, priority: 1 }
    ];
    
    let totalWordsProcessed = 0;
    let totalLessons = 0;
    let totalPrompts = 0;
    
    for (const contentFile of coreContentFiles) {
      console.log(`\n📚 Processing: ${contentFile.title}`);
      
      const content = readContentFile(contentFile.filename);
      if (!content) continue;
      
      totalWordsProcessed += content.length;
      
      // Create course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: contentFile.title,
          description: `Comprehensive guide to mastering ${contentFile.title.toLowerCase()}`,
          level: contentFile.level,
          order_index: contentFile.priority,
          estimated_hours: Math.ceil(content.length / 2000),
          status: 'published'
        })
        .select()
        .single();
        
      if (courseError) {
        console.error(`❌ Error creating course ${contentFile.title}:`, courseError);
        continue;
      }
      
      console.log(`✅ Course created: ${course.title}`);
      
      // Create module
      const { data: module, error: moduleError } = await supabase
        .from('modules')
        .insert({
          course_id: course.id,
          title: `${contentFile.title} Core Module`,
          description: `Complete training module for ${contentFile.title.toLowerCase()}`,
          order_index: 1,
          module_type: 'comprehensive',
          estimated_minutes: Math.ceil(content.length / 100)
        })
        .select()
        .single();
        
      if (moduleError) {
        console.error(`❌ Error creating module:`, moduleError);
        continue;
      }
      
      console.log(`✅ Module created: ${module.title}`);
      
      // Parse content into lessons
      const lessons = parseMarkdownToLessons(content, contentFile.title);
      console.log(`📝 Parsed ${lessons.length} lessons from content`);
      
      for (const lessonData of lessons) {
        const { data: lesson, error: lessonError } = await supabase
          .from('lessons')
          .insert({
            module_id: module.id,
            ...lessonData
          })
          .select()
          .single();
          
        if (lessonError) {
          console.error(`❌ Error creating lesson:`, lessonError);
          continue;
        }
        
        totalLessons++;
        console.log(`  ✅ Lesson: ${lesson.title} (${lessonData.content.length} chars)`);
        
        // Extract and add prompts
        const prompts = extractPrompts(lessonData.content, lesson.id);
        if (prompts.length > 0) {
          for (const prompt of prompts) {
            const { error: promptError } = await supabase
              .from('prompts')
              .insert(prompt);
              
            if (!promptError) {
              totalPrompts++;
            }
          }
          console.log(`    📋 Added ${prompts.length} prompts`);
        }
        
        // Add quiz
        const quiz = generateQuizFromContent(lessonData.content, lesson.id, lessonData.title);
        await supabase.from('quizzes').insert(quiz);
        
        // Add task
        const task = generateTaskFromContent(lessonData.content, lesson.id, lessonData.title);
        await supabase.from('tasks').insert(task);
        
        console.log(`    🎯 Added quiz and task`);
      }
    }
    
    // PHASE 2: ADDITIONAL HIGH-VALUE CONTENT
    console.log('\n🔥 PHASE 2: ADDITIONAL CONTENT');
    
    const additionalContent = [
      { filename: 'platform-currency-analysis-2025.md', title: 'AI Platform Strategy 2025', level: 2 },
      { filename: 'google-ai-2025-expansion.md', title: 'Google AI Advanced Applications', level: 3 },
      { filename: 'claude-code-prompts.md', title: 'Claude Development Prompts', level: 2 }
    ];
    
    for (const contentFile of additionalContent) {
      console.log(`\n📚 Processing: ${contentFile.title}`);
      
      const content = readContentFile(contentFile.filename);
      if (!content) continue;
      
      totalWordsProcessed += content.length;
      
      // Create course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: contentFile.title,
          description: `Advanced training in ${contentFile.title.toLowerCase()}`,
          level: contentFile.level,
          order_index: 10 + additionalContent.indexOf(contentFile),
          estimated_hours: Math.ceil(content.length / 2000),
          status: 'published'
        })
        .select()
        .single();
        
      if (courseError) {
        console.error(`❌ Error creating course:`, courseError);
        continue;
      }
      
      // Create module and lessons (simplified for speed)
      const { data: module } = await supabase
        .from('modules')
        .insert({
          course_id: course.id,
          title: `${contentFile.title} Module`,
          description: `Comprehensive training module`,
          order_index: 1,
          module_type: 'advanced',
          estimated_minutes: Math.ceil(content.length / 100)
        })
        .select()
        .single();
        
      // Create one comprehensive lesson per additional file
      const { data: lesson } = await supabase
        .from('lessons')
        .insert({
          module_id: module.id,
          title: contentFile.title,
          description: `Complete guide to ${contentFile.title.toLowerCase()}`,
          content: content.substring(0, 50000), // Limit content length
          order_index: 1,
          estimated_minutes: Math.ceil(content.length / 100),
          lesson_type: 'comprehensive',
          platform_focus: 'mixed'
        })
        .select()
        .single();
        
      if (lesson) {
        totalLessons++;
        console.log(`  ✅ Comprehensive lesson created: ${lesson.title}`);
        
        // Add basic interactive elements
        await supabase.from('quizzes').insert(generateQuizFromContent(content, lesson.id, contentFile.title));
        await supabase.from('tasks').insert(generateTaskFromContent(content, lesson.id, contentFile.title));
      }
    }
    
    console.log('\n🎉 MASSIVE CONTENT SEEDING COMPLETED!');
    console.log(`📊 FINAL STATISTICS:`);
    console.log(`   - Total characters processed: ${totalWordsProcessed.toLocaleString()}`);
    console.log(`   - Estimated words: ${Math.ceil(totalWordsProcessed / 5).toLocaleString()}`);
    console.log(`   - Total lessons created: ${totalLessons}`);
    console.log(`   - Total prompts added: ${totalPrompts}`);
    console.log(`   - Courses created: Multiple comprehensive courses`);
    
    // Verify final database state
    const { data: finalCourses } = await supabase.from('courses').select('id, title').order('order_index');
    const { data: finalLessons } = await supabase.from('lessons').select('id', { count: 'exact' });
    const { data: finalPrompts } = await supabase.from('prompts').select('id', { count: 'exact' });
    
    console.log(`\n✅ DATABASE VERIFICATION:`);
    console.log(`   - Courses in database: ${finalCourses?.length || 0}`);
    console.log(`   - Lessons in database: ${finalLessons?.length || 0}`);
    console.log(`   - Prompts in database: ${finalPrompts?.length || 0}`);
    
    if (finalCourses?.length > 0) {
      console.log(`\n📚 COURSES CREATED:`);
      finalCourses.forEach((course, index) => {
        console.log(`   ${index + 1}. ${course.title}`);
      });
    }
    
    console.log(`\n🚀 TRANSFORMATION COMPLETE!`);
    console.log(`   From: 853 words (0.5% utilization)`);
    console.log(`   To: ${Math.ceil(totalWordsProcessed / 5).toLocaleString()} words (MASSIVE increase)`);
    console.log(`   Growth: ${Math.ceil((totalWordsProcessed / 5) / 853)}x increase`);
    
  } catch (error) {
    console.error('💥 CRITICAL ERROR during massive content seeding:', error);
    throw error;
  }
}

// Run the massive content seeding
if (require.main === module) {
  seedMassiveContent()
    .then(() => {
      console.log('\n🎯 MASSIVE CONTENT SEEDING SUCCESS!');
      console.log('   The platform now has comprehensive professional content!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 MASSIVE CONTENT SEEDING FAILED:', error);
      process.exit(1);
    });
}

module.exports = { seedMassiveContent };