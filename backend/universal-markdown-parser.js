// Universal Markdown Parser for AI Masterclass
// Handles all standardized markdown files consistently
// Eliminates JSON encoding issues and ensures reliable seeding

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class UniversalMarkdownParser {
  constructor() {
    this.contentDirectory = path.join(__dirname, '..');
    this.minLessonLength = 2000; // Minimum characters per lesson
    this.minCourseDescriptionLength = 500; // Minimum characters for course description
  }

  /**
   * Parse a standardized markdown file into course and lessons
   * @param {string} filename - Name of the markdown file
   * @returns {Object} Parsed course data with lessons
   */
  parseMarkdownFile(filename) {
    try {
      const filePath = path.join(this.contentDirectory, filename);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filename}`);
      }

      const content = fs.readFileSync(filePath, 'utf8');
      return this.parseContent(content, filename);
    } catch (error) {
      logger.error(`Error parsing ${filename}:`, error.message);
      return null;
    }
  }

  /**
   * Parse markdown content into structured data
   * @param {string} content - Raw markdown content
   * @param {string} filename - Source filename for reference
   * @returns {Object} Structured course data
   */
  parseContent(content, filename) {
    // Clean content of problematic characters
    const cleanContent = this.cleanContent(content);
    
    // Extract course title (first # header)
    const titleMatch = cleanContent.match(/^# (.+)$/m);
    if (!titleMatch) {
      throw new Error('No course title found (missing # header)');
    }
    const courseTitle = titleMatch[1].trim();

    // Extract course description (## Course Description section)
    const descriptionMatch = cleanContent.match(/## Course Description\s*\n([\s\S]*?)(?=\n## [^C]|\n$)/);
    if (!descriptionMatch) {
      logger.info('Debug: Looking for course description in content...');
      logger.info('First 500 chars:', cleanContent.substring(0, 500));
      throw new Error('No course description found (missing ## Course Description)');
    }
    const courseDescription = descriptionMatch[1].trim();

    // Validate course description length
    if (courseDescription.length < this.minCourseDescriptionLength) {
      logger.warn(`Course description too short in ${filename}: ${courseDescription.length} characters`);
    }

    // Extract lessons (## Lesson X: format)
    const lessons = this.extractLessons(cleanContent, filename);

    // Validate lessons
    this.validateLessons(lessons, filename);

    return {
      title: courseTitle,
      description: courseDescription,
      filename: filename,
      lessons: lessons,
      totalLessons: lessons.length,
      totalWords: this.countWords(cleanContent),
      isValid: true
    };
  }

  /**
   * Clean content of problematic characters that break JSON encoding
   * @param {string} content - Raw content
   * @returns {string} Cleaned content
   */
  cleanContent(content) {
    return content
      // Remove emojis and special Unicode characters
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      // Remove other problematic Unicode characters
      .replace(/[^\x00-\x7F\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\n\r]/g, '')
      // Clean up multiple spaces but preserve line breaks
      .replace(/ +/g, ' ')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // Remove markdown artifacts that cause issues
      .replace(/```[\s\S]*?```/g, (match) => {
        // Clean code blocks but preserve structure
        return match.replace(/[^\x00-\x7F\n\r]/g, '');
      })
      .trim();
  }

  /**
   * Extract lessons from cleaned content
   * @param {string} content - Cleaned markdown content
   * @param {string} filename - Source filename for error reporting
   * @returns {Array} Array of lesson objects
   */
  extractLessons(content, filename) {
    const lessons = [];
    
    // Split content by lesson headers (## Lesson X: format)
    const lessonRegex = /## Lesson (\d+):\s*(.+?)(?=\n## Lesson \d+:|\n## [^L]|$)/gs;
    let match;
    let lessonIndex = 1;

    while ((match = lessonRegex.exec(content)) !== null) {
      const lessonNumber = parseInt(match[1]);
      const lessonContent = match[0];
      
      // Extract lesson title (everything after "Lesson X: ")
      const titleMatch = lessonContent.match(/## Lesson \d+:\s*(.+?)$/m);
      const title = titleMatch ? titleMatch[1].trim() : `Lesson ${lessonNumber}`;
      
      // Extract lesson body (everything after the title line)
      const bodyMatch = lessonContent.match(/## Lesson \d+:.*?\n([\s\S]*)/);
      const body = bodyMatch ? bodyMatch[1].trim() : '';

      // Create lesson object
      const lesson = {
        title: title,
        content: body,
        order_index: lessonIndex,
        lesson_type: 'lesson',
        estimated_minutes: this.estimateReadingTime(body),
        word_count: this.countWords(body),
        character_count: body.length,
        isValid: body.length >= this.minLessonLength
      };

      lessons.push(lesson);
      lessonIndex++;
    }

    // If no lessons found with standard format, try alternative parsing
    if (lessons.length === 0) {
      logger.warn(`No standard lessons found in ${filename}, attempting alternative parsing`);
      return this.parseAlternativeFormat(content, filename);
    }

    return lessons;
  }

  /**
   * Parse files that don't follow the standard ## Lesson X: format
   * @param {string} content - Content to parse
   * @param {string} filename - Source filename
   * @returns {Array} Array of lesson objects
   */
  parseAlternativeFormat(content, filename) {
    const lessons = [];
    
    // Try to find any ## headers that could be lessons
    const headerRegex = /## ([^#\n]+)(?:\n([\s\S]*?)(?=\n## |$))/g;
    let match;
    let lessonIndex = 1;

    while ((match = headerRegex.exec(content)) !== null) {
      const title = match[1].trim();
      const body = match[2] ? match[2].trim() : '';

      // Skip course description and other non-lesson sections
      if (title.toLowerCase().includes('course description') ||
          title.toLowerCase().includes('overview') ||
          title.toLowerCase().includes('completion') ||
          body.length < this.minLessonLength) {
        continue;
      }

      const lesson = {
        title: title,
        content: body,
        order_index: lessonIndex,
        lesson_type: 'lesson',
        estimated_minutes: this.estimateReadingTime(body),
        word_count: this.countWords(body),
        character_count: body.length,
        isValid: body.length >= this.minLessonLength
      };

      lessons.push(lesson);
      lessonIndex++;
    }

    return lessons;
  }

  /**
   * Validate extracted lessons
   * @param {Array} lessons - Array of lesson objects
   * @param {string} filename - Source filename for error reporting
   */
  validateLessons(lessons, filename) {
    if (lessons.length === 0) {
      throw new Error(`No lessons found in ${filename}`);
    }

    if (lessons.length < 3) {
      logger.warn(`Only ${lessons.length} lessons found in ${filename}, expected at least 3`);
    }

    const invalidLessons = lessons.filter(lesson => !lesson.isValid);
    if (invalidLessons.length > 0) {
      logger.warn(`${invalidLessons.length} lessons in ${filename} are too short (< ${this.minLessonLength} characters)`);
      invalidLessons.forEach(lesson => {
        logger.warn(`  - "${lesson.title}": ${lesson.character_count} characters`);
      });
    }
  }

  /**
   * Estimate reading time based on content length
   * @param {string} content - Content to analyze
   * @returns {number} Estimated reading time in minutes
   */
  estimateReadingTime(content) {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = this.countWords(content);
    return Math.max(5, Math.ceil(wordCount / wordsPerMinute));
  }

  /**
   * Count words in content
   * @param {string} content - Content to count
   * @returns {number} Word count
   */
  countWords(content) {
    return content.trim().split(/\s+/).length;
  }

  /**
   * Parse multiple markdown files
   * @param {Array} filenames - Array of markdown filenames
   * @returns {Array} Array of parsed course objects
   */
  parseMultipleFiles(filenames) {
    const results = [];
    
    for (const filename of filenames) {
      logger.info(`Parsing ${filename}...`);
      const parsed = this.parseMarkdownFile(filename);
      
      if (parsed) {
        results.push(parsed);
        logger.info(`✅ Successfully parsed ${filename}: ${parsed.lessons.length} lessons, ${parsed.totalWords} words`);
      } else {
        logger.info(`❌ Failed to parse ${filename}`);
      }
    }

    return results;
  }

  /**
   * Generate parsing report
   * @param {Array} parsedCourses - Array of parsed course objects
   * @returns {Object} Parsing report
   */
  generateReport(parsedCourses) {
    const totalCourses = parsedCourses.length;
    const totalLessons = parsedCourses.reduce((sum, course) => sum + course.lessons.length, 0);
    const totalWords = parsedCourses.reduce((sum, course) => sum + course.totalWords, 0);
    const validLessons = parsedCourses.reduce((sum, course) => 
      sum + course.lessons.filter(lesson => lesson.isValid).length, 0);

    return {
      totalCourses,
      totalLessons,
      validLessons,
      invalidLessons: totalLessons - validLessons,
      totalWords,
      averageLessonsPerCourse: Math.round(totalLessons / totalCourses),
      averageWordsPerLesson: Math.round(totalWords / totalLessons),
      successRate: Math.round((validLessons / totalLessons) * 100)
    };
  }

  /**
   * Validate file against standard format
   * @param {string} filename - Markdown filename to validate
   * @returns {Object} Validation results
   */
  validateFile(filename) {
    try {
      const parsed = this.parseMarkdownFile(filename);
      if (!parsed) {
        return { isValid: false, errors: ['Failed to parse file'] };
      }

      const errors = [];
      const warnings = [];

      // Check course title
      if (!parsed.title || parsed.title.length < 10) {
        errors.push('Course title missing or too short');
      }

      // Check course description
      if (!parsed.description || parsed.description.length < this.minCourseDescriptionLength) {
        errors.push(`Course description too short (${parsed.description?.length || 0} < ${this.minCourseDescriptionLength})`);
      }

      // Check lessons
      if (parsed.lessons.length < 3) {
        warnings.push(`Only ${parsed.lessons.length} lessons found, recommended minimum is 3`);
      }

      const shortLessons = parsed.lessons.filter(lesson => lesson.character_count < this.minLessonLength);
      if (shortLessons.length > 0) {
        warnings.push(`${shortLessons.length} lessons are shorter than ${this.minLessonLength} characters`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        stats: {
          lessons: parsed.lessons.length,
          totalWords: parsed.totalWords,
          averageWordsPerLesson: Math.round(parsed.totalWords / parsed.lessons.length)
        }
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [error.message],
        warnings: []
      };
    }
  }
}

module.exports = UniversalMarkdownParser;

// Example usage and testing
if (require.main === module) {
  const parser = new UniversalMarkdownParser();
  
  // Test with all standardized files
  const testFiles = [
    // Core Courses
    'ai-foundations-comprehensive.md',
    'marketing-analytics-ai-strategy.md',
    'ai-ethics-responsible-ai.md',
    'vibe-coding-fundamentals.md',

    // AI Automation & Agents
    'ai-automation-agents-custom-agents.md',
    'ai-automation-agents-n8n.md',
    'ai-automation-agents-zapier.md',

    // Avatars & Virtual Humans
    'avatars-virtual-humans-heygen.md',
    'avatars-virtual-humans-synthesia.md',
    'avatars-virtual-humans-virtual-influencers.md',

    // Music & Sound Mastery
    'music-sound-mastery-audio-branding.md',
    'music-sound-mastery-content-creator-music.md',
    'music-sound-mastery-sound-effects.md',
    'music-sound-mastery-suno-ai.md',

    // Video Generation
    'video-generation-mastery-google-veo.md',
    'video-generation-mastery-openai-sora.md',
    'video-generation-mastery-runway-ml.md',

    // Voice & Audio
    'voice-audio-mastery-adobe-speech.md',
    'voice-audio-mastery-audiobook-production.md',
    'voice-audio-mastery-elevenlabs.md'
  ];

  logger.info('🔍 Testing Universal Markdown Parser...\n');

  // Parse all test files
  const results = parser.parseMultipleFiles(testFiles);
  
  // Generate report
  const report = parser.generateReport(results);
  
  logger.info('\n📊 PARSING REPORT');
  logger.info('==================');
  logger.info(`Total Courses: ${report.totalCourses}`);
  logger.info(`Total Lessons: ${report.totalLessons}`);
  logger.info(`Valid Lessons: ${report.validLessons}`);
  logger.info(`Invalid Lessons: ${report.invalidLessons}`);
  logger.info(`Total Words: ${report.totalWords.toLocaleString()}`);
  logger.info(`Average Lessons per Course: ${report.averageLessonsPerCourse}`);
  logger.info(`Average Words per Lesson: ${report.averageWordsPerLesson}`);
  logger.info(`Success Rate: ${report.successRate}%`);

  // Validate each file
  logger.info('\n🔍 FILE VALIDATION');
  logger.info('===================');
  
  testFiles.forEach(filename => {
    const validation = parser.validateFile(filename);
    logger.info(`\n${filename}:`);
    logger.info(`  Valid: ${validation.isValid ? '✅' : '❌'}`);
    
    if (validation.errors.length > 0) {
      logger.info(`  Errors: ${validation.errors.join(', ')}`);
    }
    
    if (validation.warnings && validation.warnings.length > 0) {
      logger.info(`  Warnings: ${validation.warnings.join(', ')}`);
    }
    
    if (validation.stats) {
      logger.info(`  Stats: ${validation.stats.lessons} lessons, ${validation.stats.totalWords} words`);
    }
  });

  logger.info('\n✅ Universal Markdown Parser testing complete!');
}
