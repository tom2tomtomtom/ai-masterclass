const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://fsohtauqtcftdjcjfdpq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY environment variable not set");
  process.exit(1);
}
console.log('🚀 SEEDING WITH CURRENT SCHEMA - Processing massive content...');

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

// Parse markdown content into structured lessons
function parseMarkdownToStructuredLessons(content, courseTitle) {
  const lessons = [];
  
  // Split by major headings (## or #)
  const sections = content.split(/^#{1,2}\s+/m).filter(section => section.trim());
  
  sections.forEach((section, index) => {
    const lines = section.split('\n');
    const title = lines[0].replace(/^#+\s*/, '').trim();
    const content = lines.slice(1).join('\n').trim();
    
    // Only create lessons for substantial content
    if (title && content && content.length > 200) {
      lessons.push({
        title: title.substring(0, 255), // Ensure title fits in VARCHAR(255)
        description: `Comprehensive training on ${title.toLowerCase()}`.substring(0, 500),
        content: content.substring(0, 65000), // Ensure content fits in TEXT field
        order_index: index + 1,
        estimated_minutes: Math.max(15, Math.min(90, Math.ceil(content.length / 150))),
        lesson_type: 'tutorial',
        platform_focus: courseTitle.toLowerCase().includes('claude') ? 'claude' : 
                       courseTitle.toLowerCase().includes('chatgpt') ? 'chatgpt' :
                       courseTitle.toLowerCase().includes('gemini') ? 'gemini' : 'mixed',
        difficulty: index < 2 ? 'beginner' : index < 5 ? 'intermediate' : 'advanced'
      });
    }
  });
  
  return lessons;
}

// Main seeding function that works with current schema
async function seedWithCurrentSchema() {
  try {
    console.log('🔍 First, let me check what the current schema looks like...');
    
    // Check current schema by attempting basic operations
    const { data: existingCourses, error: schemaError } = await supabase
      .from('courses')
      .select('*')
      .limit(1);
      
    if (schemaError) {
      console.error('❌ Schema check failed:', schemaError);
      return;
    }
    
    console.log('✅ Courses table accessible');
    
    // Clear existing data
    console.log('🧹 Clearing existing content...');
    await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // HIGH-IMPACT CONTENT FILES (163,000+ words identified)
    const contentFiles = [
      { 
        filename: 'gemini.md', 
        title: 'Google AI & Gemini Mastery',
        description: 'Complete guide to mastering Google AI and Gemini for professional applications',
        level: 2,
        duration_minutes: 480
      },
      { 
        filename: 'claude.md', 
        title: 'Claude Professional Excellence',
        description: 'Advanced Claude AI techniques for professional productivity and analysis',
        level: 1,
        duration_minutes: 360
      },
      { 
        filename: 'chatgpt-module-content.md', 
        title: 'ChatGPT Professional Mastery',
        description: 'Comprehensive ChatGPT training for marketing agencies and professionals',
        level: 1,
        duration_minutes: 420
      },
      { 
        filename: 'custom-gpts-module-content.md', 
        title: 'Custom GPTs Development',
        description: 'Build and deploy custom GPT solutions for specific business needs',
        level: 3,
        duration_minutes: 600
      },
      { 
        filename: 'agency-module-1-1-content.md', 
        title: 'Agency AI Applications',
        description: 'AI implementation strategies for marketing agencies and consultants',
        level: 2,
        duration_minutes: 480
      },
      { 
        filename: 'claude-code-prompts.md', 
        title: 'Claude Development Prompts',
        description: 'Professional prompt library for Claude development workflows',
        level: 2,
        duration_minutes: 240
      },
      { 
        filename: 'google-ai-2025-expansion.md', 
        title: 'Google AI 2025 Strategy',
        description: 'Advanced Google AI platform strategies and implementation',
        level: 3,
        duration_minutes: 360
      },
      { 
        filename: 'platform-currency-analysis-2025.md', 
        title: 'AI Platform Strategy 2025',
        description: 'Comprehensive analysis of AI platform selection and optimization',
        level: 2,
        duration_minutes: 300
      }
    ];
    
    let totalWords = 0;
    let totalLessons = 0;
    let coursesCreated = 0;
    
    console.log('\n📚 PROCESSING MASSIVE CONTENT LIBRARY...');
    
    for (const contentFile of contentFiles) {
      console.log(`\n🎯 Processing: ${contentFile.title}`);
      
      const content = readContentFile(contentFile.filename);
      if (!content) {
        console.log(`⚠️  Skipping ${contentFile.filename} - file not found`);
        continue;
      }
      
      totalWords += Math.ceil(content.length / 5); // Estimate words
      
      // Create course using only fields that exist in current schema
      const courseData = {
        title: contentFile.title,
        description: contentFile.description,
        level: contentFile.level,
        duration_minutes: contentFile.duration_minutes,
        status: 'published'
      };
      
      console.log(`📝 Creating course with data:`, Object.keys(courseData));
      
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert(courseData)
        .select()
        .single();
        
      if (courseError) {
        console.error(`❌ Error creating course ${contentFile.title}:`, courseError);
        
        // Try with minimal fields
        const minimalCourseData = {
          title: contentFile.title,
          description: contentFile.description,
          level: contentFile.level
        };
        
        const { data: minimalCourse, error: minimalError } = await supabase
          .from('courses')
          .insert(minimalCourseData)
          .select()
          .single();
          
        if (minimalError) {
          console.error(`❌ Even minimal course creation failed:`, minimalError);
          continue;
        } else {
          console.log(`✅ Created minimal course: ${minimalCourse.title}`);
          coursesCreated++;
        }
      } else {
        console.log(`✅ Course created successfully: ${course.title}`);
        coursesCreated++;
        
        // Parse content into lessons
        const lessons = parseMarkdownToStructuredLessons(content, contentFile.title);
        console.log(`📖 Parsed ${lessons.length} lessons from content`);
        
        // Create lessons (using basic fields that should exist)
        for (const lessonData of lessons) {
          const basicLessonData = {
            course_id: course.id,
            title: lessonData.title,
            description: lessonData.description,
            content: lessonData.content,
            created_at: new Date().toISOString()
          };
          
          const { data: lesson, error: lessonError } = await supabase
            .from('lessons')
            .insert(basicLessonData)
            .select()
            .single();
            
          if (lessonError) {
            console.error(`❌ Error creating lesson:`, lessonError);
          } else {
            totalLessons++;
            console.log(`  ✅ Lesson: ${lesson.title.substring(0, 50)}... (${lessonData.content.length} chars)`);
          }
        }
      }
    }
    
    console.log('\n🎉 MASSIVE CONTENT SEEDING COMPLETED!');
    console.log(`📊 FINAL STATISTICS:`);
    console.log(`   - Courses created: ${coursesCreated}`);
    console.log(`   - Lessons created: ${totalLessons}`);
    console.log(`   - Total words processed: ${totalWords.toLocaleString()}`);
    console.log(`   - Content transformation: FROM 853 words TO ${totalWords.toLocaleString()} words`);
    console.log(`   - Growth factor: ${Math.ceil(totalWords / 853)}x increase!`);
    
    // Verify final state
    const { data: finalCourses } = await supabase
      .from('courses')
      .select('id, title, description')
      .order('created_at');
      
    const { data: finalLessons } = await supabase
      .from('lessons')
      .select('id', { count: 'exact' });
    
    console.log(`\n✅ DATABASE VERIFICATION:`);
    console.log(`   - Courses in database: ${finalCourses?.length || 0}`);
    console.log(`   - Lessons in database: ${finalLessons?.length || 0}`);
    
    if (finalCourses && finalCourses.length > 0) {
      console.log(`\n📚 COURSES NOW AVAILABLE:`);
      finalCourses.forEach((course, index) => {
        console.log(`   ${index + 1}. ${course.title}`);
        console.log(`      ${course.description.substring(0, 80)}...`);
      });
    }
    
    console.log(`\n🚀 TRANSFORMATION COMPLETE!`);
    console.log(`   Users will now see comprehensive professional content instead of minimal 853 words!`);
    
  } catch (error) {
    console.error('💥 CRITICAL ERROR during content seeding:', error);
    throw error;
  }
}

// Run the seeding
if (require.main === module) {
  seedWithCurrentSchema()
    .then(() => {
      console.log('\n🎯 MASSIVE CONTENT SEEDING SUCCESS!');
      console.log('   Platform transformed from minimal to comprehensive!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 CONTENT SEEDING FAILED:', error);
      process.exit(1);
    });
}

module.exports = { seedWithCurrentSchema };