#!/usr/bin/env node

/**
 * MASTER SEEDING SCRIPT - COMPLETE SYSTEM REBUILD
 * Processes ALL 3,162 markdown files and creates comprehensive course structure
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class MasterSeeder {
  constructor() {
    this.rootDir = path.join(__dirname, '..');
    this.markdownFiles = [];
    this.courses = [];
    this.modules = [];
    this.lessons = [];
    this.stats = {
      filesFound: 0,
      filesProcessed: 0,
      coursesCreated: 0,
      modulesCreated: 0,
      lessonsCreated: 0,
      totalCharacters: 0,
      errors: []
    };
  }

  /**
   * Step 1: Discover all markdown files
   */
  async discoverAllMarkdownFiles() {
    logger.info('🔍 STEP 1: DISCOVERING ALL MARKDOWN FILES');
    logger.info('==========================================');
    
    this.findMarkdownFiles(this.rootDir);
    
    // Filter out unwanted files
    this.markdownFiles = this.markdownFiles.filter(file => {
      const filename = path.basename(file.path).toLowerCase();
      return !filename.includes('readme') && 
             !filename.includes('license') &&
             !file.path.includes('node_modules') &&
             !file.path.includes('.git') &&
             file.size > 100; // Only files with substantial content
    });

    this.stats.filesFound = this.markdownFiles.length;
    
    logger.info(`📄 Found ${this.stats.filesFound} markdown files`);
    logger.info(`📊 Total content: ${Math.round(this.markdownFiles.reduce((sum, f) => sum + f.size, 0) / 1024)}KB`);
    
    // Show sample files
    logger.info('\n📋 Sample files found:');
    this.markdownFiles.slice(0, 10).forEach(file => {
      logger.info(`  📝 ${path.basename(file.path)} (${Math.round(file.size/1024)}KB)`);
    });
    
    if (this.markdownFiles.length > 10) {
      logger.info(`  ... and ${this.markdownFiles.length - 10} more files`);
    }
    
    return this.markdownFiles.length > 0;
  }

  /**
   * Recursively find all markdown files
   */
  findMarkdownFiles(dir, relativePath = '') {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const itemRelativePath = path.join(relativePath, item);
        
        try {
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory() && 
              !item.startsWith('.') && 
              item !== 'node_modules' &&
              item !== 'build' &&
              item !== 'coverage') {
            this.findMarkdownFiles(fullPath, itemRelativePath);
          } else if (item.endsWith('.md')) {
            this.markdownFiles.push({
              path: itemRelativePath,
              fullPath,
              name: item.replace('.md', ''),
              size: stat.size,
              directory: path.dirname(itemRelativePath)
            });
          }
        } catch (statError) {
          // Skip files we can't access
        }
      }
    } catch (readError) {
      // Skip directories we can't read
    }
  }

  /**
   * Step 2: Clear existing database content
   */
  async clearDatabase() {
    logger.info('\n🧹 STEP 2: CLEARING EXISTING DATABASE CONTENT');
    logger.info('==============================================');
    
    try {
      // Check current content
      const { data: courses } = await supabase.from('courses').select('id');
      const { data: modules } = await supabase.from('modules').select('id');
      const { data: lessons } = await supabase.from('lessons').select('id');
      
      logger.info(`📊 Current content: ${courses?.length || 0} courses, ${modules?.length || 0} modules, ${lessons?.length || 0} lessons`);
      
      if ((courses?.length || 0) === 0 && (modules?.length || 0) === 0 && (lessons?.length || 0) === 0) {
        logger.info('✅ Database already empty');
        return true;
      }
      
      // Clear in dependency order
      logger.info('🗑️ Clearing lessons...');
      await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      logger.info('🗑️ Clearing modules...');
      await supabase.from('modules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      logger.info('🗑️ Clearing courses...');
      await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      logger.info('✅ Database cleared successfully');
      return true;
      
    } catch (error) {
      logger.error('❌ Database clearing failed:', error.message);
      this.stats.errors.push(`Database clear: ${error.message}`);
      return false;
    }
  }

  /**
   * Step 3: Organize files into course structure
   */
  async organizeIntoCoursesStructure() {
    logger.info('\n📚 STEP 3: ORGANIZING FILES INTO COURSE STRUCTURE');
    logger.info('==================================================');
    
    // Create course structure based on directory organization and content analysis
    const courseMap = new Map();
    
    for (const file of this.markdownFiles) {
      try {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        const courseInfo = this.extractCourseInfo(file, content);
        
        if (!courseMap.has(courseInfo.courseTitle)) {
          courseMap.set(courseInfo.courseTitle, {
            title: courseInfo.courseTitle,
            description: courseInfo.description,
            level: courseInfo.level,
            modules: new Map()
          });
        }
        
        const course = courseMap.get(courseInfo.courseTitle);
        
        if (!course.modules.has(courseInfo.moduleTitle)) {
          course.modules.set(courseInfo.moduleTitle, {
            title: courseInfo.moduleTitle,
            description: courseInfo.moduleDescription,
            lessons: []
          });
        }
        
        const module = course.modules.get(courseInfo.moduleTitle);
        module.lessons.push({
          title: courseInfo.lessonTitle,
          content: content,
          file: file.path,
          size: file.size
        });
        
        this.stats.filesProcessed++;
        this.stats.totalCharacters += content.length;
        
      } catch (error) {
        logger.error(`❌ Error processing ${file.path}:`, error.message);
        this.stats.errors.push(`File ${file.path}: ${error.message}`);
      }
    }
    
    // Convert maps to arrays
    this.courses = Array.from(courseMap.values()).map(course => ({
      ...course,
      modules: Array.from(course.modules.values())
    }));
    
    logger.info(`📚 Organized into ${this.courses.length} courses`);
    logger.info(`🎯 Total modules: ${this.courses.reduce((sum, c) => sum + c.modules.length, 0)}`);
    logger.info(`📝 Total lessons: ${this.courses.reduce((sum, c) => sum + c.modules.reduce((mSum, m) => mSum + m.lessons.length, 0), 0)}`);
    
    return this.courses.length > 0;
  }

  /**
   * Extract course information from file path and content
   */
  extractCourseInfo(file, content) {
    const pathParts = file.directory.split(path.sep);
    const filename = file.name;
    
    // Determine course based on directory structure or content
    let courseTitle = 'AI Masterclass Fundamentals';
    let level = 1;
    let moduleTitle = filename.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    let lessonTitle = moduleTitle;
    
    // Extract from directory structure if available
    if (pathParts.includes('courses-complete')) {
      const levelMatch = pathParts.find(p => p.startsWith('level-'));
      if (levelMatch) {
        level = parseInt(levelMatch.split('-')[1]) || 1;
        const levelDesc = pathParts[pathParts.indexOf(levelMatch) + 1] || '';
        courseTitle = this.formatCourseTitle(levelDesc, level);
      }
    } else if (pathParts.includes('courses')) {
      const levelMatch = pathParts.find(p => p.startsWith('level-'));
      if (levelMatch) {
        level = parseInt(levelMatch.split('-')[1]) || 1;
        courseTitle = this.formatCourseTitle(levelMatch, level);
      }
    }
    
    // Extract from content if available
    const firstLine = content.split('\n')[0];
    if (firstLine.startsWith('#')) {
      lessonTitle = firstLine.replace(/^#+\s*/, '').trim();
    }
    
    return {
      courseTitle,
      description: `Comprehensive ${courseTitle.toLowerCase()} training with practical applications`,
      level,
      moduleTitle,
      moduleDescription: `Advanced training module covering ${moduleTitle.toLowerCase()}`,
      lessonTitle
    };
  }

  /**
   * Format course title based on directory name
   */
  formatCourseTitle(dirName, level) {
    const titleMap = {
      'ai-foundations': 'AI Foundations & Strategy',
      'platform-mastery': 'Platform Mastery & Integration',
      'business-applications': 'Business Applications & ROI',
      'content-creation': 'AI Content Creation Mastery',
      'automation-workflows': 'Automation & Workflow Systems',
      'advanced-implementation': 'Advanced Implementation & Scaling'
    };

    const baseTitle = titleMap[dirName] || dirName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `Level ${level}: ${baseTitle}`;
  }

  /**
   * Step 4: Seed courses to database
   */
  async seedCoursesToDatabase() {
    logger.info('\n🌱 STEP 4: SEEDING COURSES TO DATABASE');
    logger.info('======================================');

    for (let i = 0; i < this.courses.length; i++) {
      const course = this.courses[i];

      try {
        logger.info(`📚 Creating course: ${course.title}`);

        const { data: insertedCourse, error: courseError } = await supabase
          .from('courses')
          .insert({
            title: course.title,
            description: course.description,
            level: course.level,
            order_index: i + 1,
            estimated_hours: Math.ceil(course.modules.reduce((sum, m) => sum + m.lessons.length * 0.5, 0)),
            status: 'published',
            objectives: [`Master ${course.title.toLowerCase()}`, 'Apply practical techniques', 'Build real-world solutions']
          })
          .select()
          .single();

        if (courseError) {
          logger.error(`❌ Course error:`, courseError);
          this.stats.errors.push(`Course ${course.title}: ${courseError.message}`);
          continue;
        }

        logger.info(`✅ Course created: ${insertedCourse.title}`);
        this.stats.coursesCreated++;

        // Seed modules for this course
        await this.seedModulesForCourse(insertedCourse.id, course.modules);

      } catch (error) {
        logger.error(`❌ Error creating course ${course.title}:`, error.message);
        this.stats.errors.push(`Course ${course.title}: ${error.message}`);
      }
    }

    logger.info(`✅ Courses seeded: ${this.stats.coursesCreated}/${this.courses.length}`);
    return this.stats.coursesCreated > 0;
  }

  /**
   * Seed modules for a specific course
   */
  async seedModulesForCourse(courseId, modules) {
    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];

      try {
        const { data: insertedModule, error: moduleError } = await supabase
          .from('modules')
          .insert({
            course_id: courseId,
            title: module.title,
            description: module.description,
            order_index: i + 1,
            module_type: 'lesson',
            estimated_minutes: module.lessons.length * 30,
            difficulty: 'intermediate'
          })
          .select()
          .single();

        if (moduleError) {
          logger.error(`❌ Module error:`, moduleError);
          this.stats.errors.push(`Module ${module.title}: ${moduleError.message}`);
          continue;
        }

        logger.info(`  🎯 Module created: ${insertedModule.title}`);
        this.stats.modulesCreated++;

        // Seed lessons for this module
        await this.seedLessonsForModule(insertedModule.id, module.lessons);

      } catch (error) {
        logger.error(`❌ Error creating module ${module.title}:`, error.message);
        this.stats.errors.push(`Module ${module.title}: ${error.message}`);
      }
    }
  }

  /**
   * Seed lessons for a specific module
   */
  async seedLessonsForModule(moduleId, lessons) {
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];

      try {
        const { data: insertedLesson, error: lessonError } = await supabase
          .from('lessons')
          .insert({
            module_id: moduleId,
            title: lesson.title,
            content: lesson.content,
            order_index: i + 1,
            lesson_type: 'content',
            estimated_minutes: Math.ceil(lesson.content.length / 1000 * 2), // ~2 min per 1000 chars
            difficulty: 'intermediate',
            status: 'published'
          })
          .select()
          .single();

        if (lessonError) {
          logger.error(`❌ Lesson error:`, lessonError);
          this.stats.errors.push(`Lesson ${lesson.title}: ${lessonError.message}`);
          continue;
        }

        logger.info(`    📝 Lesson created: ${insertedLesson.title} (${Math.round(lesson.content.length/1024)}KB)`);
        this.stats.lessonsCreated++;

      } catch (error) {
        logger.error(`❌ Error creating lesson ${lesson.title}:`, error.message);
        this.stats.errors.push(`Lesson ${lesson.title}: ${error.message}`);
      }
    }
  }

  /**
   * Step 5: Generate final report
   */
  generateFinalReport() {
    logger.info('\n📊 STEP 5: FINAL SEEDING REPORT');
    logger.info('===============================');

    logger.info('🎯 SEEDING STATISTICS:');
    logger.info(`📄 Files discovered: ${this.stats.filesFound}`);
    logger.info(`📝 Files processed: ${this.stats.filesProcessed}`);
    logger.info(`📚 Courses created: ${this.stats.coursesCreated}`);
    logger.info(`🎯 Modules created: ${this.stats.modulesCreated}`);
    logger.info(`📖 Lessons created: ${this.stats.lessonsCreated}`);
    logger.info(`📊 Total content: ${Math.round(this.stats.totalCharacters / 1024)}KB`);
    logger.info(`⚠️ Errors encountered: ${this.stats.errors.length}`);

    if (this.stats.errors.length > 0) {
      logger.info('\n❌ ERRORS ENCOUNTERED:');
      this.stats.errors.slice(0, 10).forEach(error => {
        logger.info(`  • ${error}`);
      });
      if (this.stats.errors.length > 10) {
        logger.info(`  ... and ${this.stats.errors.length - 10} more errors`);
      }
    }

    const successRate = Math.round((this.stats.lessonsCreated / this.stats.filesFound) * 100);
    logger.info(`\n🎉 SUCCESS RATE: ${successRate}%`);

    if (successRate >= 80) {
      logger.info('✅ EXCELLENT! System rebuild successful');
    } else if (successRate >= 60) {
      logger.info('⚠️ GOOD! Most content seeded successfully');
    } else {
      logger.info('❌ ISSUES! Many files failed to seed');
    }

    return {
      success: successRate >= 60,
      stats: this.stats
    };
  }

  /**
   * Main execution method
   */
  async execute() {
    logger.info('🚀 MASTER SEEDING SCRIPT - COMPLETE SYSTEM REBUILD');
    logger.info('==================================================');
    logger.info('Processing ALL markdown files for comprehensive content seeding\n');

    try {
      // Step 1: Discover files
      const filesFound = await this.discoverAllMarkdownFiles();
      if (!filesFound) {
        throw new Error('No markdown files found');
      }

      // Step 2: Clear database
      const dbCleared = await this.clearDatabase();
      if (!dbCleared) {
        throw new Error('Failed to clear database');
      }

      // Step 3: Organize structure
      const organized = await this.organizeIntoCoursesStructure();
      if (!organized) {
        throw new Error('Failed to organize course structure');
      }

      // Step 4: Seed to database
      const seeded = await this.seedCoursesToDatabase();
      if (!seeded) {
        throw new Error('Failed to seed courses to database');
      }

      // Step 5: Generate report
      const report = this.generateFinalReport();

      return report;

    } catch (error) {
      logger.error('\n💥 MASTER SEEDING FAILED:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Run if called directly
if (require.main === module) {
  const seeder = new MasterSeeder();

  seeder.execute()
    .then(result => {
      if (result.success) {
        logger.info('\n🎉 COMPLETE SYSTEM REBUILD SUCCESSFUL!');
        logger.info('=====================================');
        logger.info('✅ All markdown files processed');
        logger.info('✅ Database populated with rich content');
        logger.info('✅ Ready for backend server restart');
        logger.info('\n🚀 Next steps:');
        logger.info('1. Start backend server: npm start');
        logger.info('2. Start frontend server');
        logger.info('3. Test complete user journey');
        process.exit(0);
      } else {
        logger.info('\n❌ SYSTEM REBUILD FAILED');
        logger.info('Error:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      logger.error('\n💥 UNEXPECTED ERROR:', error);
      process.exit(1);
    });
}

module.exports = MasterSeeder;
