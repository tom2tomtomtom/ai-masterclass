// Analyze the gap between database content and available markdown files
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeDatabaseContentGap() {
  console.log('🔍 DATABASE CONTENT GAP ANALYSIS');
  console.log('=====================================\n');

  try {
    // 1. Query current database state
    console.log('📊 CURRENT DATABASE STATE:');
    console.log('─'.repeat(50));

    // Get courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .order('order_index');

    if (coursesError) {
      console.error('❌ Error fetching courses:', coursesError);
      return;
    }

    console.log(`📚 COURSES (${courses.length} total):`);
    courses.forEach(course => {
      console.log(`  ${course.order_index}. ${course.title} (ID: ${course.id})`);
    });

    // Get modules
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select(`
        id,
        title,
        course_id,
        order_index,
        courses!inner(title, order_index)
      `)
      .order('course_id, order_index');

    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError);
      return;
    }

    console.log(`\n🎯 MODULES (${modules.length} total):`);
    let currentCourseId = null;
    modules.forEach(module => {
      if (module.course_id !== currentCourseId) {
        console.log(`\n  📖 Course: ${module.courses.title}`);
        currentCourseId = module.course_id;
      }
      console.log(`    ${module.order_index}. ${module.title} (ID: ${module.id})`);
    });

    // Get lesson count and sample
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select(`
        id,
        title,
        module_id,
        order_index,
        lesson_type,
        estimated_minutes,
        content,
        modules!inner(title, course_id)
      `)
      .order('module_id, order_index')
      .limit(5);

    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError);
      return;
    }

    // Get total lesson count
    const { count: totalLessons, error: countError } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting lessons:', countError);
      return;
    }

    console.log(`\n📝 LESSONS (${totalLessons || 0} total) - Sample of first 5:`);
    if (lessons && lessons.length > 0) {
      lessons.forEach(lesson => {
        console.log(`  ${lesson.order_index}. ${lesson.title}`);
        console.log(`     Module: ${lesson.modules.title}`);
        console.log(`     Type: ${lesson.lesson_type}, Duration: ${lesson.estimated_minutes}min`);
        console.log(`     Content Preview: ${lesson.content ? lesson.content.substring(0, 100) + '...' : 'No content'}\n`);
      });
    } else {
      console.log('  ❌ No lessons found in database');
    }

    console.log('\n' + '='.repeat(70));

    // 2. Analyze available markdown files
    console.log('\n📂 AVAILABLE MARKDOWN FILES ANALYSIS:');
    console.log('─'.repeat(50));

    // Look in parent directory for markdown files
    const parentDir = path.join(__dirname, '..');
    const markdownFiles = [];

    function findMarkdownFiles(dir, relativePath = '') {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const itemRelativePath = path.join(relativePath, item);
        
        if (fs.statSync(fullPath).isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          findMarkdownFiles(fullPath, itemRelativePath);
        } else if (item.endsWith('.md')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          markdownFiles.push({
            filename: item,
            path: itemRelativePath,
            fullPath,
            size: content.length,
            content: content.substring(0, 500) + '...'
          });
        }
      });
    }

    findMarkdownFiles(parentDir);

    console.log(`📄 Found ${markdownFiles.length} markdown files:`);
    markdownFiles.forEach(file => {
      console.log(`  📝 ${file.filename}`);
      console.log(`     Path: ${file.path}`);
      console.log(`     Size: ${file.size} characters`);
      console.log(`     Preview: ${file.content.substring(0, 100).replace(/\n/g, ' ')}...\n`);
    });

    // 3. Analyze seeding script mappings
    console.log('\n🔧 SEEDING SCRIPT ANALYSIS:');
    console.log('─'.repeat(50));

    // Check the moduleFileMapping from the seeding script
    const moduleFileMapping = {
      // AI Masterclass modules
      'Runway ML Video Creation': 'video-generation-mastery-runway-ml.md',
      'OpenAI Sora Professional Videos': 'video-generation-mastery-openai-sora.md',
      'Google Veo Enterprise Video': 'video-generation-mastery-google-veo.md',
      'ElevenLabs Voice Cloning': 'voice-audio-mastery-elevenlabs.md',
      'Adobe Speech Enhancement': 'voice-audio-mastery-adobe-speech.md',
      'Professional Audiobook Production': 'voice-audio-mastery-audiobook-production.md',
      'Suno AI Hit Song Creation': 'music-sound-mastery-suno-ai.md',
      'Professional Sound Effects': 'music-sound-mastery-sound-effects.md',
      'Content Creator Music': 'music-sound-mastery-content-creator-music.md',
      'Audio Branding Strategies': 'music-sound-mastery-audio-branding.md',
      'HeyGen Professional Avatars': 'avatars-virtual-humans-heygen.md',
      'Synthesia Custom Avatars': 'avatars-virtual-humans-synthesia.md',
      'Virtual Influencer Creation': 'avatars-virtual-humans-virtual-influencers.md',
      'Zapier AI Workflows': 'ai-automation-agents-zapier.md',
      'N8N Open Source Automation': 'ai-automation-agents-n8n.md',
      'Custom AI Agents': 'ai-automation-agents-custom-agents.md',
      'Foundations of Artificial Intelligence': 'ai-foundations-comprehensive.md',
      'Statistical Foundations for AI': 'ai-foundations-comprehensive.md',
      'Machine Learning Fundamentals': 'ai-foundations-comprehensive.md',
      'Marketing Metrics & AI-Powered KPIs': 'marketing-analytics-ai-strategy.md',
      'Advanced Customer Segmentation': 'marketing-analytics-ai-strategy.md',
      'Predictive Analytics & Forecasting': 'marketing-analytics-ai-strategy.md',
      'AI Ethics Foundations & Frameworks': 'ai-ethics-responsible-ai.md',
      'Bias Detection & Fairness in AI': 'ai-ethics-responsible-ai.md',
      'Privacy, Security & Regulatory Compliance': 'ai-ethics-responsible-ai.md'
    };

    console.log('📋 Module-to-File Mappings from Seeding Script:');
    Object.entries(moduleFileMapping).forEach(([moduleTitle, filename]) => {
      const fileExists = markdownFiles.some(f => f.filename === filename);
      const moduleExists = modules.some(m => m.title === moduleTitle);
      
      console.log(`  🎯 "${moduleTitle}"`);
      console.log(`     → ${filename} ${fileExists ? '✅ EXISTS' : '❌ MISSING'}`);
      console.log(`     → Module in DB: ${moduleExists ? '✅ YES' : '❌ NO'}\n`);
    });

    // 4. Gap Analysis
    console.log('\n🚨 GAP ANALYSIS:');
    console.log('─'.repeat(50));

    // Files that exist but aren't mapped
    const unmappedFiles = markdownFiles.filter(file => 
      !Object.values(moduleFileMapping).includes(file.filename)
    );

    if (unmappedFiles.length > 0) {
      console.log('📄 UNMAPPED MARKDOWN FILES (Rich content not being used):');
      unmappedFiles.forEach(file => {
        console.log(`  ❌ ${file.filename} (${file.size} chars) - NOT BEING SEEDED`);
      });
    }

    // Mapped files that don't exist
    const missingFiles = Object.entries(moduleFileMapping).filter(([moduleTitle, filename]) => 
      !markdownFiles.some(f => f.filename === filename)
    );

    if (missingFiles.length > 0) {
      console.log('\n🔍 MAPPED FILES THAT DON\'T EXIST:');
      missingFiles.forEach(([moduleTitle, filename]) => {
        console.log(`  ❌ ${filename} (needed for "${moduleTitle}") - FILE MISSING`);
      });
    }

    // Modules without lessons
    const modulesWithoutLessons = modules.filter(module => {
      const hasMapping = moduleFileMapping[module.title];
      const fileExists = hasMapping && markdownFiles.some(f => f.filename === moduleFileMapping[module.title]);
      return !hasMapping || !fileExists;
    });

    if (modulesWithoutLessons.length > 0) {
      console.log('\n🎯 MODULES WITHOUT PROPER CONTENT MAPPING:');
      modulesWithoutLessons.forEach(module => {
        console.log(`  ❌ "${module.title}" (Course: ${module.courses.title})`);
      });
    }

    // 5. Summary and Recommendations
    console.log('\n' + '='.repeat(70));
    console.log('📊 SUMMARY:');
    console.log('─'.repeat(30));
    console.log(`📚 Courses in DB: ${courses.length}`);
    console.log(`🎯 Modules in DB: ${modules.length}`);
    console.log(`📝 Lessons in DB: ${totalLessons || 0}`);
    console.log(`📄 Markdown files found: ${markdownFiles.length}`);
    console.log(`🔗 Files mapped for seeding: ${Object.keys(moduleFileMapping).length}`);
    console.log(`❌ Unmapped files: ${unmappedFiles.length}`);
    console.log(`❌ Missing mapped files: ${missingFiles.length}`);
    console.log(`❌ Modules without lessons: ${modulesWithoutLessons.length}`);

    const totalMarkdownContent = markdownFiles.reduce((total, file) => total + file.size, 0);
    console.log(`📊 Total markdown content: ${Math.round(totalMarkdownContent / 1000)}K characters`);

    console.log('\n🔧 RECOMMENDATIONS:');
    console.log('─'.repeat(30));
    
    if (totalLessons === 0) {
      console.log('🚨 CRITICAL: No lessons in database! Run the seeding script.');
    } else if (totalLessons < modules.length * 3) {
      console.log('⚠️  LOW LESSON COUNT: Expected ~3 lessons per module, run seeding script.');
    }
    
    if (unmappedFiles.length > 0) {
      console.log(`📄 CONTENT WASTE: ${unmappedFiles.length} markdown files with rich content are not being used.`);
      console.log('   → Update moduleFileMapping to include these files');
    }
    
    if (missingFiles.length > 0) {
      console.log(`🔍 MISSING FILES: ${missingFiles.length} files expected by seeding script don't exist.`);
      console.log('   → Create missing files or update mapping');
    }

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

// Run the analysis
analyzeDatabaseContentGap();