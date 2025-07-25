const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function completeSystemRebuild() {
  console.log('🚀 COMPLETE SYSTEM REBUILD');
  console.log('==========================\n');

  // Step 1: Clear database
  console.log('1. 🧹 CLEARING DATABASE...');
  try {
    await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('modules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('   ✅ Database cleared');
  } catch (error) {
    console.log(`   ❌ Error clearing database: ${error.message}`);
  }

  // Step 2: Find all markdown files
  console.log('\n2. 📁 FINDING ALL MARKDOWN FILES...');
  const markdownFiles = [];
  
  function findMarkdownFiles(dir, relativePath = '') {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const relativeFilePath = path.join(relativePath, file);
        
        try {
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && 
              !file.includes('node_modules') && 
              !file.includes('.git') && 
              !file.includes('backend') &&
              !file.includes('frontend')) {
            findMarkdownFiles(fullPath, relativeFilePath);
          } else if (file.endsWith('.md') && 
                     !file.includes('README') && 
                     !file.includes('readme')) {
            markdownFiles.push({
              fullPath,
              relativePath: relativeFilePath,
              name: file.replace('.md', ''),
              size: stat.size
            });
          }
        } catch (statError) {
          // Skip files we can't stat
        }
      }
    } catch (readError) {
      // Skip directories we can't read
    }
  }
  
  findMarkdownFiles('.');
  console.log(`   ✅ Found ${markdownFiles.length} markdown files`);

  // Step 3: Process files in batches
  console.log('\n3. 📚 PROCESSING FILES IN BATCHES...');
  
  const batchSize = 50;
  let processedCount = 0;
  let moduleCount = 0;
  let lessonCount = 0;

  for (let i = 0; i < markdownFiles.length; i += batchSize) {
    const batch = markdownFiles.slice(i, i + batchSize);
    console.log(`   Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(markdownFiles.length/batchSize)} (${batch.length} files)...`);
    
    const modules = [];
    const lessons = [];
    
    for (const file of batch) {
      try {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        
        if (content.length < 100) continue; // Skip very small files
        
        const moduleId = uuidv4();
        
        // Create module
        const module = {
          id: moduleId,
          title: file.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: `Course module: ${file.name}`,
          difficulty: 'intermediate',
          order_index: moduleCount,
          estimated_minutes: Math.max(10, Math.floor(content.length / 100)),
          module_type: 'course',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        modules.push(module);
        moduleCount++;
        
        // Split content into lessons (by headers or chunks)
        const lessonChunks = splitIntoLessons(content, file.name);
        
        lessonChunks.forEach((chunk, index) => {
          const lesson = {
            id: uuidv4(),
            module_id: moduleId,
            title: chunk.title || `${module.title} - Part ${index + 1}`,
            content: chunk.content,
            order_index: index,
            estimated_minutes: Math.max(5, Math.floor(chunk.content.length / 200)),
            lesson_type: 'content',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          lessons.push(lesson);
          lessonCount++;
        });
        
        processedCount++;
        
      } catch (error) {
        console.log(`     ⚠️ Error processing ${file.relativePath}: ${error.message}`);
      }
    }
    
    // Insert batch
    if (modules.length > 0) {
      try {
        await supabase.from('modules').insert(modules);
        console.log(`     ✅ Inserted ${modules.length} modules`);
      } catch (error) {
        console.log(`     ❌ Error inserting modules: ${error.message}`);
      }
    }
    
    if (lessons.length > 0) {
      try {
        await supabase.from('lessons').insert(lessons);
        console.log(`     ✅ Inserted ${lessons.length} lessons`);
      } catch (error) {
        console.log(`     ❌ Error inserting lessons: ${error.message}`);
      }
    }
    
    // Progress update
    console.log(`     📊 Progress: ${processedCount}/${markdownFiles.length} files processed`);
  }

  console.log(`\n✅ SEEDING COMPLETE!`);
  console.log(`   📚 Total modules created: ${moduleCount}`);
  console.log(`   📖 Total lessons created: ${lessonCount}`);
  console.log(`   📁 Files processed: ${processedCount}/${markdownFiles.length}`);
}

function splitIntoLessons(content, filename) {
  // Split by major headers or into reasonable chunks
  const lessons = [];
  
  // Try to split by # headers first
  const headerSections = content.split(/^# /m).filter(section => section.trim());
  
  if (headerSections.length > 1) {
    headerSections.forEach((section, index) => {
      const lines = section.split('\n');
      const title = lines[0] ? lines[0].trim() : `${filename} - Section ${index + 1}`;
      const content = section;
      
      if (content.length > 200) {
        lessons.push({ title, content });
      }
    });
  } else {
    // Split into chunks if no clear headers
    const chunkSize = 3000; // characters per lesson
    for (let i = 0; i < content.length; i += chunkSize) {
      const chunk = content.slice(i, i + chunkSize);
      if (chunk.trim().length > 200) {
        lessons.push({
          title: `${filename.replace(/-/g, ' ')} - Part ${Math.floor(i/chunkSize) + 1}`,
          content: chunk
        });
      }
    }
  }
  
  // Ensure at least one lesson
  if (lessons.length === 0) {
    lessons.push({
      title: filename.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      content: content
    });
  }
  
  return lessons;
}

// Run the rebuild
completeSystemRebuild().then(() => {
  console.log('\n🎉 SYSTEM REBUILD COMPLETE!');
  console.log('Next steps:');
  console.log('1. Start backend server');
  console.log('2. Start frontend server');
  console.log('3. Test complete user journey');
}).catch(error => {
  console.error('❌ Rebuild failed:', error);
});
