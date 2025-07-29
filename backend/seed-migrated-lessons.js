#!/usr/bin/env node
/**
 * 🚀 INTELLIGENT LESSON SEEDING SCRIPT
 * Seeds the database with correctly formatted lessons from migration
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { createClient } = require('@supabase/supabase-js');

// Logger fallback
const logger = {
  info: (...args) => console.log('📚', ...args),
  success: (...args) => console.log('✅', ...args),
  warning: (...args) => console.log('⚠️', ...args),
  error: (...args) => console.log('❌', ...args),
  progress: (...args) => console.log('🔄', ...args)
};

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  logger.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

class IntelligentLessonSeeder {
  constructor() {
    this.coursesDir = path.join(__dirname, '..', 'courses-complete');
    this.stats = {
      processed: 0,
      seeded: 0,
      updated: 0,
      errors: 0
    };
  }

  async seedDatabase() {
    logger.info('🚀 Starting Intelligent Lesson Database Seeding...');
    logger.info('===================================================');

    try {
      // Clear existing lessons to avoid duplicates
      await this.clearExistingLessons();

      // Find all migrated lesson files
      const lessonFiles = await this.findAllLessonFiles();
      logger.info(`Found ${lessonFiles.length} lesson files to process`);

      // Process each lesson file
      for (const lessonFile of lessonFiles) {
        await this.processLessonFile(lessonFile);
      }

      // Generate final report
      await this.generateSeedingReport();

    } catch (error) {
      logger.error('Seeding failed:', error.message);
      process.exit(1);
    }
  }

  async clearExistingLessons() {
    logger.progress('Clearing existing lessons from database...');
    
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all lessons

      if (error) {
        logger.warning('Error clearing lessons:', error.message);
      } else {
        logger.success('Existing lessons cleared successfully');
      }
    } catch (error) {
      logger.warning('Could not clear existing lessons:', error.message);
    }
  }

  async findAllLessonFiles() {
    const lessonFiles = [];

    function scanDirectory(dirPath) {
      if (!fs.existsSync(dirPath)) return;

      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
          scanDirectory(itemPath);
        } else if (item.endsWith('.md') && item.startsWith('lesson-')) {
          lessonFiles.push(itemPath);
        }
      }
    }

    scanDirectory(this.coursesDir);
    return lessonFiles;
  }

  async processLessonFile(filePath) {
    logger.progress(`Processing: ${path.basename(filePath)}`);
    this.stats.processed++;

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract YAML front matter
      const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontMatterMatch) {
        logger.warning(`No YAML front matter found in ${path.basename(filePath)}`);
        this.stats.errors++;
        return;
      }

      // Parse metadata
      const metadata = yaml.load(frontMatterMatch[1]);
      const lessonContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');

      // Validate required fields
      if (!metadata.title || !metadata.level) {
        logger.warning(`Missing required metadata in ${path.basename(filePath)}`);
        this.stats.errors++;
        return;
      }

      // Create lesson record
      const lessonRecord = {
        title: metadata.title,
        description: metadata.description || '',
        content: lessonContent,
        order_index: metadata.lesson || 1, // Add required order_index
        level: metadata.level,
        module: metadata.module || 1,
        lesson: metadata.lesson || 1,
        course_path: metadata.course_path || `level-${metadata.level}/module-${metadata.module}/lesson-${metadata.lesson}`,
        estimated_time: metadata.estimated_time || 45,
        difficulty: metadata.difficulty || 'intermediate',
        keywords: metadata.keywords || metadata.tags || [],
        learning_objectives: metadata.learning_objectives || [],
        deliverables: metadata.deliverables || [],
        prerequisites: metadata.prerequisites || [],
        status: metadata.status || 'active',
        content_type: metadata.content_type || 'lesson',
        content_length: lessonContent.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Insert into database
      const { data, error } = await supabase
        .from('lessons')
        .insert([lessonRecord])
        .select();

      if (error) {
        logger.error(`Failed to seed ${path.basename(filePath)}:`, error.message);
        this.stats.errors++;
      } else {
        logger.success(`✓ Seeded: ${metadata.title}`);
        this.stats.seeded++;
      }

    } catch (error) {
      logger.error(`Error processing ${path.basename(filePath)}:`, error.message);
      this.stats.errors++;
    }
  }

  async generateSeedingReport() {
    logger.info('\n📊 LESSON SEEDING REPORT');
    logger.info('========================');
    logger.info(`Total files processed: ${this.stats.processed}`);
    logger.success(`Successfully seeded: ${this.stats.seeded}`);
    logger.warning(`Updated existing: ${this.stats.updated}`);
    logger.error(`Failed with errors: ${this.stats.errors}`);
    
    const successRate = Math.round((this.stats.seeded / this.stats.processed) * 100);
    logger.info(`\n✨ Seeding Success Rate: ${successRate}%`);
    
    if (this.stats.seeded > 0) {
      logger.success('\n🎉 Database seeding completed successfully!');
      logger.info('Next steps:');
      logger.info('1. Test frontend lesson loading');
      logger.info('2. Verify lesson content display');
      logger.info('3. Run comprehensive system tests');

      // Verify seeded data
      const { data, error } = await supabase
        .from('lessons')
        .select('count')
        .single();

      if (!error && data) {
        logger.info(`\n📚 Total lessons in database: ${data.count || this.stats.seeded}`);
      }
    }
  }
}

// Execute seeding if run directly
if (require.main === module) {
  const seeder = new IntelligentLessonSeeder();
  seeder.seedDatabase().catch(error => {
    logger.error('Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = IntelligentLessonSeeder;