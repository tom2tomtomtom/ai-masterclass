// Remove duplicate lessons, keeping only the ones with rich content
require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

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
  logger.info('🧹 Removing duplicate lessons...');
  
  try {
    // Get all lessons
    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('*')
      .order('created_at');
      
    if (error) {
      logger.error('❌ Error fetching lessons:', error);
      return;
    }
    
    logger.info(`📚 Found ${lessons.length} total lessons`);
    
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
    logger.info(`🔍 Found ${duplicates.length} lesson titles with duplicates`);
    
    // For each duplicate group, keep the one with rich content and delete the others
    let deleted = 0;
    for (const [title, duplicateLessons] of duplicates) {
      logger.info(`\\n📄 Processing "${title}" (${duplicateLessons.length} duplicates)`);
      
      // Sort by content length (keep the longest one)
      duplicateLessons.sort((a, b) => (b.content?.length || 0) - (a.content?.length || 0));
      
      const keepLesson = duplicateLessons[0]; // Keep the longest content
      const deleteTargets = duplicateLessons.slice(1); // Delete the rest
      
      logger.info(`   ✅ Keeping: ${keepLesson.id} (${keepLesson.content?.length || 0} chars)`);
      
      for (const deleteTarget of deleteTargets) {
        logger.info(`   ❌ Deleting: ${deleteTarget.id} (${deleteTarget.content?.length || 0} chars)`);
        
        const { error: deleteError } = await supabase
          .from('lessons')
          .delete()
          .eq('id', deleteTarget.id);
          
        if (deleteError) {
          logger.error(`   💥 Delete failed for ${deleteTarget.id}:`, deleteError);
        } else {
          deleted++;
          logger.info(`   ✅ Deleted ${deleteTarget.id}`);
        }
      }
    }
    
    logger.info(`\\n🎉 Successfully deleted ${deleted} duplicate lessons!`);
    
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
    
    logger.info(`\\n🔍 Post-cleanup verification:`);
    logger.info(`   Total lessons: ${remainingLessons?.length || 0}`);
    
    // Check specific Google AI lessons
    const googleAILessons = remainingLessons?.filter(l => 
      l.title.includes('Google AI') || 
      l.title.includes('Gemini') || 
      l.title.includes('AI Studio')
    );
    
    logger.info(`\\n📊 Google AI lessons remaining:`);
    googleAILessons?.forEach(lesson => {
      logger.info(`   📝 ${lesson.title}: ${lesson.content?.length || 0} chars (${lesson.id})`);
    });
    
  } catch (error) {
    logger.error('❌ Script error:', error);
  }
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  logger.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
} else {
  removeDuplicateLessons();
}