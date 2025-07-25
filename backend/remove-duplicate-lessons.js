// Remove duplicate lessons, keeping only the ones with rich content
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

async function removeDuplicateLessons() {
  console.log('🧹 Removing duplicate lessons...');
  
  try {
    // Get all lessons
    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('*')
      .order('created_at');
      
    if (error) {
      console.error('❌ Error fetching lessons:', error);
      return;
    }
    
    console.log(`📚 Found ${lessons.length} total lessons`);
    
    // Group lessons by title to find duplicates
    const lessonGroups = {};
    lessons.forEach(lesson => {
      const title = lesson.title;
      if (!lessonGroups[title]) {
        lessonGroups[title] = [];
      }
      lessonGroups[title].push(lesson);
    });
    
    // Find titles with multiple lessons
    const duplicates = Object.entries(lessonGroups).filter(([title, lessons]) => lessons.length > 1);
    console.log(`🔍 Found ${duplicates.length} lesson titles with duplicates`);
    
    // For each duplicate group, keep the one with rich content and delete the others
    let deleted = 0;
    for (const [title, duplicateLessons] of duplicates) {
      console.log(`\\n📄 Processing "${title}" (${duplicateLessons.length} duplicates)`);
      
      // Sort by content length (keep the longest one)
      duplicateLessons.sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0));
      
      const keepLesson = duplicateLessons[0]; // Keep the longest content
      const deleteTargets = duplicateLessons.slice(1); // Delete the rest
      
      console.log(`   ✅ Keeping: ${keepLesson.id} (${keepLesson.content?.length || 0} chars)`);
      
      for (const deleteTarget of deleteTargets) {
        console.log(`   ❌ Deleting: ${deleteTarget.id} (${deleteTarget.content?.length || 0} chars)`);
        
        const { error: deleteError } = await supabase
          .from('lessons')
          .delete()
          .eq('id', deleteTarget.id);
          
        if (deleteError) {
          console.error(`   💥 Delete failed for ${deleteTarget.id}:`, deleteError);
        } else {
          deleted++;
          console.log(`   ✅ Deleted ${deleteTarget.id}`);
        }
      }
    }
    
    console.log(`\\n🎉 Successfully deleted ${deleted} duplicate lessons!`);
    
    // Verify cleanup
    const { data: remainingLessons } = await supabase
      .from('lessons')
      .select('title, content, id')
      .order('title');
      
    const updatedGroups = {};
    remainingLessons?.forEach(lesson => {
      const title = lesson.title;
      if (!updatedGroups[title]) {
        updatedGroups[title] = [];
      }
      updatedGroups[title].push(lesson);
    });
    
    console.log(`\\n🔍 Post-cleanup verification:`);
    console.log(`   Total lessons: ${remainingLessons?.length || 0}`);
    
    // Check specific Google AI lessons
    const googleAILessons = remainingLessons?.filter(l => 
      l.title.includes('Google AI') || 
      l.title.includes('Gemini') || 
      l.title.includes('AI Studio')
    );
    
    console.log(`\\n📊 Google AI lessons remaining:`);
    googleAILessons?.forEach(lesson => {
      console.log(`   📝 ${lesson.title}: ${lesson.content?.length || 0} chars (${lesson.id})`);
    });
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
} else {
  removeDuplicateLessons();
}