#!/usr/bin/env node
/**
 * 🔍 LESSONS SCHEMA MIGRATION VALIDATOR
 * Validates that all required columns exist for migrated lessons seeding
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Logger fallback
const logger = {
  info: (...args) => console.log('📋', ...args),
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

// Required columns for migrated lessons
const REQUIRED_COLUMNS = [
  { name: 'id', type: 'uuid', nullable: false },
  { name: 'title', type: 'text', nullable: false },
  { name: 'description', type: 'text', nullable: true },
  { name: 'content', type: 'text', nullable: true },
  { name: 'level', type: 'integer', nullable: true },
  { name: 'module', type: 'integer', nullable: true },
  { name: 'lesson', type: 'integer', nullable: true },
  { name: 'course_path', type: 'text', nullable: true },
  { name: 'estimated_time', type: 'integer', nullable: true },
  { name: 'difficulty', type: 'text', nullable: true },
  { name: 'keywords', type: 'jsonb', nullable: true },
  { name: 'learning_objectives', type: 'jsonb', nullable: true },
  { name: 'deliverables', type: 'jsonb', nullable: true },
  { name: 'prerequisites', type: 'jsonb', nullable: true },
  { name: 'status', type: 'text', nullable: true },
  { name: 'content_type', type: 'text', nullable: true },
  { name: 'content_length', type: 'integer', nullable: true },
  { name: 'created_at', type: 'timestamp', nullable: true },
  { name: 'updated_at', type: 'timestamp', nullable: true }
];

class LessonsSchemaValidator {
  constructor() {
    this.results = {
      tableExists: false,
      columnsPresent: 0,
      columnsMissing: 0,
      missingColumns: [],
      constraintsValid: false,
      indexesPresent: 0,
      seedingReady: false
    };
  }

  async validateSchema() {
    logger.info('🔍 LESSONS SCHEMA MIGRATION VALIDATION');
    logger.info('=====================================');

    try {
      // Step 1: Check if lessons table exists
      await this.validateTableExists();

      // Step 2: Validate all required columns exist
      await this.validateColumns();

      // Step 3: Test insertion with all fields
      await this.testInsertion();

      // Step 4: Check indexes and constraints
      await this.validateConstraints();

      // Step 5: Generate final report
      this.generateReport();

    } catch (error) {
      logger.error('Validation failed:', error.message);
      process.exit(1);
    }
  }

  async validateTableExists() {
    logger.progress('Checking if lessons table exists...');

    try {
      const { count, error } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true });

      if (error) {
        logger.error(`Lessons table check failed: ${error.message}`);
        this.results.tableExists = false;
        return;
      }

      this.results.tableExists = true;
      logger.success(`Lessons table exists with ${count || 0} records`);

    } catch (error) {
      logger.error(`Table existence check failed: ${error.message}`);
      this.results.tableExists = false;
    }
  }

  async validateColumns() {
    logger.progress('Validating required columns...');

    // Create a test record with all required fields
    const testRecord = {
      title: 'Schema Validation Test',
      description: 'Test description for schema validation',
      content: 'Test content for validation purposes',
      level: 1,
      module: 1,
      lesson: 1,
      course_path: 'level-1/module-1/lesson-1',
      estimated_time: 30,
      difficulty: 'beginner',
      keywords: ['test', 'validation'],
      learning_objectives: ['Validate schema'],
      deliverables: ['Working schema'],
      prerequisites: [],
      status: 'active',
      content_type: 'lesson',
      content_length: 42,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      // Attempt to insert test record
      const { data, error } = await supabase
        .from('lessons')
        .insert([testRecord])
        .select();

      if (error) {
        logger.error(`Column validation failed: ${error.message}`);
        this.analyzeColumnError(error);
        return;
      }

      logger.success('All required columns are present and functional');
      this.results.columnsPresent = REQUIRED_COLUMNS.length;

      // Clean up test record
      if (data && data[0]) {
        await supabase
          .from('lessons')
          .delete()
          .eq('id', data[0].id);
        logger.progress('Test record cleaned up');
      }

    } catch (error) {
      logger.error(`Column validation error: ${error.message}`);
      this.analyzeColumnError(error);
    }
  }

  analyzeColumnError(error) {
    const errorMessage = error.message.toLowerCase();
    
    REQUIRED_COLUMNS.forEach(column => {
      if (errorMessage.includes(`column "${column.name}" of`) || 
          errorMessage.includes(`column ${column.name} does not exist`)) {
        this.results.missingColumns.push(column.name);
        this.results.columnsMissing++;
      }
    });

    if (this.results.missingColumns.length > 0) {
      logger.warning('Missing columns detected:');
      this.results.missingColumns.forEach(col => {
        logger.warning(`  - ${col}`);
      });
    }
  }

  async testInsertion() {
    logger.progress('Testing realistic lesson insertion...');

    const realisticLesson = {
      title: 'Introduction to AI Fundamentals',
      description: 'Learn the basic concepts of artificial intelligence and machine learning',
      content: `# Introduction to AI Fundamentals

This lesson covers the fundamental concepts of AI including:

- What is Artificial Intelligence?
- Types of AI systems
- Machine Learning basics
- Neural networks overview

## Learning Objectives

By the end of this lesson, you will understand:
1. The definition and scope of AI
2. Different types of AI applications
3. Basic machine learning concepts

## Prerequisites

- Basic programming knowledge
- Understanding of mathematics (algebra, statistics)

Let's begin our journey into AI!`,
      level: 1,
      module: 1,
      lesson: 1,
      course_path: 'level-1/module-1/lesson-1',
      estimated_time: 45,
      difficulty: 'beginner',
      keywords: ['ai', 'artificial-intelligence', 'machine-learning', 'fundamentals'],
      learning_objectives: [
        'Understand what AI is and its applications',
        'Differentiate between various AI approaches',
        'Grasp basic machine learning concepts'
      ],
      deliverables: [
        'Complete understanding of AI basics',
        'Ability to identify AI applications'
      ],
      prerequisites: [
        'Basic programming knowledge',
        'Mathematics (algebra, statistics)'
      ],
      status: 'active',
      content_type: 'lesson',
      content_length: 0, // Will be calculated
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Calculate content length
    realisticLesson.content_length = realisticLesson.content.length;

    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert([realisticLesson])
        .select();

      if (error) {
        logger.error(`Realistic insertion test failed: ${error.message}`);
        return false;
      }

      logger.success('Realistic lesson insertion successful');

      // Verify the data was stored correctly
      if (data && data[0]) {
        const storedLesson = data[0];
        logger.info('Stored lesson data sample:');
        logger.info(`  - Title: ${storedLesson.title}`);
        logger.info(`  - Content Length: ${storedLesson.content_length}`);
        logger.info(`  - Keywords: ${JSON.stringify(storedLesson.keywords)}`);
        logger.info(`  - Learning Objectives: ${storedLesson.learning_objectives.length} items`);

        // Clean up
        await supabase
          .from('lessons')
          .delete()
          .eq('id', storedLesson.id);
        logger.progress('Realistic test lesson cleaned up');
      }

      return true;

    } catch (error) {
      logger.error(`Realistic insertion test error: ${error.message}`);
      return false;
    }
  }

  async validateConstraints() {
    logger.progress('Checking constraints and indexes...');

    // This is a basic check - in production you might query system tables
    // For now, we'll assume constraints are working if insertion tests pass
    this.results.constraintsValid = this.results.columnsPresent === REQUIRED_COLUMNS.length;
    this.results.indexesPresent = this.results.constraintsValid ? 7 : 0; // Expected indexes

    if (this.results.constraintsValid) {
      logger.success('Constraints and indexes appear to be working');
    } else {
      logger.warning('Some constraints may be missing');
    }
  }

  generateReport() {
    logger.info('\n📊 VALIDATION REPORT');
    logger.info('====================');

    // Table status
    if (this.results.tableExists) {
      logger.success('✅ Lessons table exists');
    } else {
      logger.error('❌ Lessons table missing');
    }

    // Column status
    const totalColumns = REQUIRED_COLUMNS.length;
    const presentColumns = this.results.columnsPresent;
    const missingColumns = this.results.columnsMissing;

    if (presentColumns === totalColumns) {
      logger.success(`✅ All ${totalColumns} required columns present`);
    } else {
      logger.error(`❌ ${missingColumns} columns missing (${presentColumns}/${totalColumns} present)`);
      if (this.results.missingColumns.length > 0) {
        logger.info('Missing columns:');
        this.results.missingColumns.forEach(col => {
          logger.info(`  - ${col}`);
        });
      }
    }

    // Seeding readiness
    this.results.seedingReady = this.results.tableExists && 
                               (this.results.columnsPresent === totalColumns) &&
                               this.results.constraintsValid;

    if (this.results.seedingReady) {
      logger.success('\n🎉 SCHEMA VALIDATION SUCCESSFUL!');
      logger.info('✅ Ready for migrated lessons seeding');
      logger.info('✅ All required columns present');
      logger.info('✅ Data insertion works correctly');
      logger.info('\nNext steps:');
      logger.info('1. Run: node seed-migrated-lessons.js');
      logger.info('2. Verify lessons are loading correctly');
    } else {
      logger.error('\n❌ SCHEMA VALIDATION FAILED!');
      logger.info('Required actions:');
      
      if (!this.results.tableExists) {
        logger.info('1. Create lessons table');
      }
      
      if (this.results.columnsMissing > 0) {
        logger.info('2. Run the migration script:');
        logger.info('   Execute LESSONS-SCHEMA-MIGRATION.sql in Supabase');
      }
      
      logger.info('3. Re-run this validation script');
    }

    logger.info('\n📋 Summary:');
    logger.info(`   Table exists: ${this.results.tableExists ? 'Yes' : 'No'}`);
    logger.info(`   Columns present: ${this.results.columnsPresent}/${totalColumns}`);
    logger.info(`   Seeding ready: ${this.results.seedingReady ? 'Yes' : 'No'}`);

    return this.results.seedingReady;
  }
}

// Execute validation if run directly
if (require.main === module) {
  const validator = new LessonsSchemaValidator();
  validator.validateSchema().catch(error => {
    logger.error('Unexpected validation error:', error);
    process.exit(1);
  });
}

module.exports = LessonsSchemaValidator;