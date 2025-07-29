#!/usr/bin/env node
/**
 * 🧠 INTELLIGENT LESSON MIGRATION SCRIPT
 * Migrates correctly formatted lessons from Lessons_correct_format/ folder
 * to the appropriate course structure with robust YAML parsing and validation
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Intelligent logging system
const logger = {
  info: (...args) => console.log('📚', ...args),
  success: (...args) => console.log('✅', ...args),
  warning: (...args) => console.log('⚠️', ...args),
  error: (...args) => console.log('❌', ...args),
  progress: (...args) => console.log('🔄', ...args),
  debug: (...args) => console.log('🔍', ...args)
};

class RobustLessonMigrator {
  constructor() {
    this.sourceDir = path.join(__dirname, '..', 'Lessons_correct_format');
    this.targetDir = path.join(__dirname, '..', 'courses-complete');
    this.stats = {
      processed: 0,
      successful: 0,
      errors: 0,
      skipped: 0,
      warnings: 0
    };
    this.errorDetails = [];
    this.warningDetails = [];
  }

  async migrate() {
    logger.info('🚀 Starting Robust Lesson Migration...');
    logger.info('===============================================');
    
    try {
      // Check source directory exists
      if (!fs.existsSync(this.sourceDir)) {
        throw new Error(`Source directory not found: ${this.sourceDir}`);
      }

      // Get all lesson files
      const files = fs.readdirSync(this.sourceDir).filter(file => file.endsWith('.md'));
      logger.info(`Found ${files.length} lesson files to migrate`);

      // Process each file
      for (const file of files) {
        await this.processLesson(file);
      }

      // Generate detailed migration report
      this.generateDetailedReport();

    } catch (error) {
      logger.error('Migration failed:', error.message);
      process.exit(1);
    }
  }

  async processLesson(filename) {
    logger.progress(`Processing: ${filename}`);
    this.stats.processed++;

    try {
      const sourcePath = path.join(this.sourceDir, filename);
      const content = fs.readFileSync(sourcePath, 'utf8');

      // Extract YAML front matter with multiple strategies
      const extractionResult = this.extractYAMLFrontMatter(content, filename);
      
      if (!extractionResult.success) {
        logger.warning(`Skipping ${filename}: ${extractionResult.reason}`);
        this.stats.skipped++;
        this.warningDetails.push({
          filename,
          issue: extractionResult.reason,
          type: 'YAML_EXTRACTION'
        });
        return;
      }

      const { metadata, lessonContent } = extractionResult;

      // Validate and clean metadata
      const validationResult = this.validateAndCleanMetadata(metadata, filename);
      
      if (!validationResult.valid) {
        logger.warning(`Skipping ${filename}: ${validationResult.reason}`);
        this.stats.skipped++;
        this.warningDetails.push({
          filename,
          issue: validationResult.reason,
          type: 'METADATA_VALIDATION'
        });
        return;
      }

      const cleanMetadata = validationResult.metadata;

      // Generate target path based on metadata
      const targetPath = this.generateTargetPath(cleanMetadata, filename);
      
      // Ensure target directory exists
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Enhanced metadata for database compatibility
      const enhancedContent = this.enhanceContent(cleanMetadata, lessonContent, filename);

      // Write migrated lesson
      fs.writeFileSync(targetPath, enhancedContent);
      
      logger.success(`✓ Migrated to: ${path.relative(process.cwd(), targetPath)}`);
      this.stats.successful++;

    } catch (error) {
      logger.error(`Failed to process ${filename}:`, error.message);
      this.stats.errors++;
      this.errorDetails.push({
        filename,
        error: error.message,
        stack: error.stack
      });
    }
  }

  extractYAMLFrontMatter(content, filename) {
    logger.debug(`Extracting YAML from ${filename}`);
    
    // Strategy 1: Standard front matter at the beginning
    const standardMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (standardMatch) {
      try {
        const metadata = yaml.load(standardMatch[1], { 
          schema: yaml.CORE_SCHEMA,
          onWarning: (warning) => {
            logger.debug(`YAML warning in ${filename}:`, warning.toString());
          }
        });
        const lessonContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');
        return { 
          success: true, 
          metadata, 
          lessonContent,
          strategy: 'standard'
        };
      } catch (yamlError) {
        logger.debug(`Standard YAML parsing failed for ${filename}:`, yamlError.message);
        // Continue to next strategy
      }
    }

    // Strategy 2: YAML after title (like the Claude file)
    const titleYamlMatch = content.match(/^# [^\n]*\n---\n([\s\S]*?)\n---/);
    if (titleYamlMatch) {
      try {
        const metadata = yaml.load(titleYamlMatch[1], { 
          schema: yaml.CORE_SCHEMA,
          onWarning: (warning) => {
            logger.debug(`YAML warning in ${filename}:`, warning.toString());
          }
        });
        const lessonContent = content.replace(/^# [^\n]*\n---\n[\s\S]*?\n---\n/, '');
        return { 
          success: true, 
          metadata, 
          lessonContent,
          strategy: 'after-title'
        };
      } catch (yamlError) {
        logger.debug(`After-title YAML parsing failed for ${filename}:`, yamlError.message);
        // Continue to next strategy
      }
    }

    // Strategy 3: Manual parsing for problematic YAML
    const manualResult = this.manualYAMLParsing(content, filename);
    if (manualResult.success) {
      return manualResult;
    }

    // Strategy 4: Extract from anywhere in the file
    const anywhereMatch = content.match(/---\n([\s\S]*?)\n---/);
    if (anywhereMatch) {
      try {
        const metadata = yaml.load(anywhereMatch[1], { 
          schema: yaml.CORE_SCHEMA,
          onWarning: (warning) => {
            logger.debug(`YAML warning in ${filename}:`, warning.toString());
          }
        });
        const lessonContent = content.replace(/---\n[\s\S]*?\n---\n?/, '');
        return { 
          success: true, 
          metadata, 
          lessonContent,
          strategy: 'anywhere'
        };
      } catch (yamlError) {
        logger.debug(`Anywhere YAML parsing failed for ${filename}:`, yamlError.message);
      }
    }

    return { 
      success: false, 
      reason: 'No valid YAML front matter found or all parsing strategies failed'
    };
  }

  manualYAMLParsing(content, filename) {
    logger.debug(`Attempting manual YAML parsing for ${filename}`);
    
    // Extract YAML block
    const yamlMatch = content.match(/---\n([\s\S]*?)\n---/);
    if (!yamlMatch) {
      return { success: false, reason: 'No YAML block found' };
    }

    const yamlBlock = yamlMatch[1];
    const lines = yamlBlock.split('\n');
    const metadata = {};

    try {
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;

        // Handle different patterns
        if (trimmedLine.includes(':')) {
          const colonIndex = trimmedLine.indexOf(':');
          const key = trimmedLine.substring(0, colonIndex).trim();
          const value = trimmedLine.substring(colonIndex + 1).trim();

          if (!key) continue;

          // Parse different value types
          if (value.startsWith('[') && value.endsWith(']')) {
            // Array handling
            try {
              metadata[key] = JSON.parse(value.replace(/'/g, '"'));
            } catch {
              // Fallback: simple split
              const arrayValue = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, ''));
              metadata[key] = arrayValue.filter(v => v.length > 0);
            }
          } else if (value.startsWith('"') && value.endsWith('"')) {
            // Quoted string
            metadata[key] = value.slice(1, -1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            // Single quoted string
            metadata[key] = value.slice(1, -1);
          } else if (!isNaN(value) && value !== '') {
            // Number
            metadata[key] = parseInt(value, 10);
          } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
            // Boolean
            metadata[key] = value.toLowerCase() === 'true';
          } else if (value) {
            // Unquoted string
            metadata[key] = value;
          }
        }
      }

      if (Object.keys(metadata).length > 0) {
        const lessonContent = content.replace(/---\n[\s\S]*?\n---\n?/, '');
        return { 
          success: true, 
          metadata, 
          lessonContent,
          strategy: 'manual'
        };
      }
    } catch (error) {
      logger.debug(`Manual parsing failed for ${filename}:`, error.message);
    }

    return { success: false, reason: 'Manual YAML parsing failed' };
  }

  validateAndCleanMetadata(metadata, filename) {
    if (!metadata || typeof metadata !== 'object') {
      return { valid: false, reason: 'Metadata is not an object' };
    }

    // Create a clean copy
    const cleanMetadata = { ...metadata };

    // Validate required fields
    const requiredFields = ['level', 'module', 'lesson', 'title'];
    for (const field of requiredFields) {
      if (cleanMetadata[field] === undefined || cleanMetadata[field] === null) {
        return { valid: false, reason: `Missing required field: ${field}` };
      }
    }

    // Clean and validate level
    if (typeof cleanMetadata.level === 'string') {
      cleanMetadata.level = parseInt(cleanMetadata.level, 10);
    }
    if (!Number.isInteger(cleanMetadata.level) || cleanMetadata.level < 1 || cleanMetadata.level > 6) {
      return { valid: false, reason: `Invalid level: ${cleanMetadata.level}` };
    }

    // Clean and validate module
    if (typeof cleanMetadata.module === 'string') {
      cleanMetadata.module = parseInt(cleanMetadata.module, 10);
    }
    if (!Number.isInteger(cleanMetadata.module) || cleanMetadata.module < 1) {
      return { valid: false, reason: `Invalid module: ${cleanMetadata.module}` };
    }

    // Clean and validate lesson
    if (typeof cleanMetadata.lesson === 'string') {
      cleanMetadata.lesson = parseInt(cleanMetadata.lesson, 10);
    }
    if (!Number.isInteger(cleanMetadata.lesson) || cleanMetadata.lesson < 1) {
      return { valid: false, reason: `Invalid lesson: ${cleanMetadata.lesson}` };
    }

    // Ensure title is a string
    if (typeof cleanMetadata.title !== 'string') {
      cleanMetadata.title = String(cleanMetadata.title);
    }

    // Ensure description is a string if present
    if (cleanMetadata.description && typeof cleanMetadata.description !== 'string') {
      cleanMetadata.description = String(cleanMetadata.description);
    }

    // Ensure keywords is an array if present
    if (cleanMetadata.keywords) {
      if (!Array.isArray(cleanMetadata.keywords)) {
        if (typeof cleanMetadata.keywords === 'string') {
          cleanMetadata.keywords = [cleanMetadata.keywords];
        } else {
          cleanMetadata.keywords = [];
        }
      }
    } else {
      cleanMetadata.keywords = [];
    }

    return { valid: true, metadata: cleanMetadata };
  }

  generateTargetPath(metadata, filename) {
    const { level, module, lesson } = metadata;
    
    // Extract module name from filename or use generic
    let moduleName = 'general';
    
    if (filename.includes('chatgpt')) moduleName = 'chatgpt-mastery';
    else if (filename.includes('claude')) moduleName = 'claude-mastery';
    else if (filename.includes('gemini')) moduleName = 'google-gemini-mastery';
    else if (filename.includes('perplexity')) moduleName = 'perplexity-mastery';
    else if (filename.includes('visual-ai')) moduleName = 'visual-ai-mastery';
    else if (filename.includes('enterprise')) moduleName = 'enterprise-ai-platforms';
    else if (filename.includes('specialized')) moduleName = 'specialized-ai-tools';
    else if (filename.includes('content-creation')) moduleName = 'advanced-content-creation';
    else if (filename.includes('brand-consistency')) moduleName = 'brand-consistency-management';
    else if (filename.includes('video-generation')) moduleName = 'video-generation-mastery';
    else if (filename.includes('platform-selection')) moduleName = 'platform-mastery';
    else if (filename.includes('ai-integration')) moduleName = 'ai-integration-patterns';

    return path.join(
      this.targetDir,
      `level-${level}-platform-mastery`,
      `module-${module}-${moduleName}`,
      'lessons',
      `lesson-${lesson.toString().padStart(2, '0')}-${filename}`
    );
  }

  enhanceContent(metadata, content, filename) {
    // Create enhanced YAML front matter with additional fields for database compatibility
    const enhancedMetadata = {
      ...metadata,
      course_path: `level-${metadata.level}/module-${metadata.module}/lesson-${metadata.lesson}`,
      estimated_time: metadata.estimated_time || 45,
      difficulty: this.inferDifficulty(metadata.level),
      prerequisites: metadata.prerequisites || [],
      learning_objectives: metadata.learning_objectives || this.safeExtractObjectives(content),
      deliverables: metadata.deliverables || [],
      tags: metadata.keywords || [],
      status: 'active',
      content_type: 'lesson',
      migrated_from: filename,
      migration_date: new Date().toISOString(),
      content_length: content.length
    };

    return `---\n${yaml.dump(enhancedMetadata, { 
      lineWidth: -1,
      noRefs: true,
      sortKeys: false
    })}---\n\n${content}`;
  }

  inferDifficulty(level) {
    const difficulties = {
      1: 'beginner',
      2: 'intermediate',
      3: 'advanced',
      4: 'expert',
      5: 'master',
      6: 'expert'
    };
    return difficulties[level] || 'intermediate';
  }

  safeExtractObjectives(content) {
    // Safe extraction of learning objectives from content with null checks
    const objectivePatterns = [
      /upon completing.*?you will.*?:(.*?)(?=\n\n|\n\*|\n-|$)/gis,
      /learning objectives.*?:(.*?)(?=\n\n|\n#|$)/gis,
      /you will learn.*?:(.*?)(?=\n\n|\n#|$)/gis
    ];

    try {
      for (const pattern of objectivePatterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
          const objectives = match[1]
            .split(/\n\*|\n-/)
            .map(obj => obj.trim())
            .filter(obj => obj.length > 10)
            .slice(0, 5); // Max 5 objectives
          
          if (objectives.length > 0) {
            return objectives;
          }
        }
      }
    } catch (error) {
      logger.debug('Error extracting objectives:', error.message);
    }

    return ['Complete the lesson content and exercises'];
  }

  generateDetailedReport() {
    logger.info('\n📊 DETAILED MIGRATION REPORT');
    logger.info('===============================');
    logger.info(`Total files processed: ${this.stats.processed}`);
    logger.success(`Successfully migrated: ${this.stats.successful}`);
    logger.warning(`Skipped (issues found): ${this.stats.skipped}`);
    logger.error(`Failed with errors: ${this.stats.errors}`);
    
    const successRate = Math.round((this.stats.successful / this.stats.processed) * 100);
    logger.info(`\n✨ Migration Success Rate: ${successRate}%`);

    // Show detailed warnings
    if (this.warningDetails.length > 0) {
      logger.warning('\n⚠️  DETAILED WARNINGS:');
      for (const warning of this.warningDetails) {
        logger.warning(`  - ${warning.filename}: ${warning.issue} (${warning.type})`);
      }
    }

    // Show detailed errors
    if (this.errorDetails.length > 0) {
      logger.error('\n❌ DETAILED ERRORS:');
      for (const error of this.errorDetails) {
        logger.error(`  - ${error.filename}: ${error.error}`);
      }
    }
    
    if (this.stats.successful > 0) {
      logger.success('\n🎉 Migration completed with detailed reporting!');
      logger.info('Next steps:');
      logger.info('1. Review any warnings or errors above');
      logger.info('2. Run database seeding script to update lesson data');
      logger.info('3. Test frontend with new lesson structure');
      logger.info('4. Verify all lessons load correctly');
    } else {
      logger.error('\n😞 No files were successfully migrated');
      logger.info('Please review the detailed errors above and fix the source files');
    }
  }
}

// Execute migration if run directly
if (require.main === module) {
  const migrator = new RobustLessonMigrator();
  migrator.migrate().catch(error => {
    logger.error('Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = RobustLessonMigrator;