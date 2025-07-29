const { createClient } = require('@supabase/supabase-js');
const templateService = require('./services/templateService');
const logger = require('./utils/logger');

// Load environment variables
require('dotenv').config();

// Test configuration
const TEST_CONFIG = {
  runTests: true,
  verbose: true,
  skipSeeding: false
};

// Initialize Supabase client for testing
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

/**
 * Template System Test Suite
 */
class TemplateSystemTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  /**
   * Log test results
   */
  log(message, isError = false) {
    if (TEST_CONFIG.verbose) {
      if (isError) {
        console.error(`❌ ${message}`);
        this.testResults.errors.push(message);
      } else {
        console.log(`✅ ${message}`);
      }
    }
  }

  /**
   * Test database connectivity
   */
  async testDatabaseConnection() {
    try {
      console.log('\n🔍 Testing Database Connection...');
      
      const { data, error } = await supabase
        .from('ai_models')
        .select('id, name, provider')
        .limit(1);

      if (error) {
        this.log(`Database connection failed: ${error.message}`, true);
        this.testResults.failed++;
        return false;
      }

      this.log('Database connection successful');
      this.testResults.passed++;
      return true;
    } catch (error) {
      this.log(`Database connection error: ${error.message}`, true);
      this.testResults.failed++;
      return false;
    }
  }

  /**
   * Test template service functionality
   */
  async testTemplateService() {
    try {
      console.log('\n🔍 Testing Template Service...');

      // Test getCategories
      const categories = await templateService.getCategories();
      if (categories.industry_categories && categories.use_case_categories) {
        this.log('Template categories retrieved successfully');
        this.testResults.passed++;
      } else {
        this.log('Failed to retrieve template categories', true);
        this.testResults.failed++;
      }

      // Test getTemplates with pagination
      const templatesResult = await templateService.getTemplates({ 
        page: 1, 
        limit: 10,
        is_public: true 
      });
      
      if (templatesResult.templates && Array.isArray(templatesResult.templates)) {
        this.log(`Retrieved ${templatesResult.templates.length} templates`);
        this.testResults.passed++;
      } else {
        this.log('Failed to retrieve templates', true);
        this.testResults.failed++;
      }

      // Test searchTemplates
      const searchResult = await templateService.searchTemplates({
        query: 'marketing',
        page: 1,
        limit: 5
      });

      if (searchResult.templates && Array.isArray(searchResult.templates)) {
        this.log(`Search returned ${searchResult.templates.length} templates`);
        this.testResults.passed++;
      } else {
        this.log('Template search failed', true);
        this.testResults.failed++;
      }

      // Test getPopularTemplates
      const popularTemplates = await templateService.getPopularTemplates(5);
      if (Array.isArray(popularTemplates)) {
        this.log(`Retrieved ${popularTemplates.length} popular templates`);
        this.testResults.passed++;
      } else {
        this.log('Failed to retrieve popular templates', true);
        this.testResults.failed++;
      }

    } catch (error) {
      this.log(`Template service test error: ${error.message}`, true);
      this.testResults.failed++;
    }
  }

  /**
   * Test database functions
   */
  async testDatabaseFunctions() {
    try {
      console.log('\n🔍 Testing Database Functions...');

      // Test get_category_statistics function
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_category_statistics');

      if (statsError) {
        this.log(`Category statistics function failed: ${statsError.message}`, true);
        this.testResults.failed++;
      } else {
        this.log('Category statistics function working');
        this.testResults.passed++;
      }

      // Test search_templates_fulltext function
      const { data: searchData, error: searchError } = await supabase
        .rpc('search_templates_fulltext', {
          search_query: 'email',
          limit_count: 5,
          offset_count: 0
        });

      if (searchError) {
        this.log(`Full-text search function failed: ${searchError.message}`, true);
        this.testResults.failed++;
      } else {
        this.log(`Full-text search returned ${searchData?.length || 0} results`);
        this.testResults.passed++;
      }

    } catch (error) {
      this.log(`Database functions test error: ${error.message}`, true);
      this.testResults.failed++;
    }
  }

  /**
   * Test template data quality
   */
  async testTemplateDataQuality() {
    try {
      console.log('\n🔍 Testing Template Data Quality...');

      // Get all templates for analysis
      const { data: templates, error } = await supabase
        .from('prompt_templates')
        .select('*')
        .eq('is_public', true);

      if (error) {
        this.log(`Failed to retrieve templates for quality check: ${error.message}`, true);
        this.testResults.failed++;
        return;
      }

      // Check template count
      if (templates.length >= 50) {
        this.log(`Template count check passed: ${templates.length} templates`);
        this.testResults.passed++;
      } else {
        this.log(`Insufficient templates: ${templates.length} (expected >= 50)`, true);
        this.testResults.failed++;
      }

      // Check category distribution
      const industryCategories = [...new Set(templates.map(t => t.industry_category))];
      const useCaseCategories = [...new Set(templates.map(t => t.use_case_category))];

      if (industryCategories.length >= 8) {
        this.log(`Industry category diversity check passed: ${industryCategories.length} categories`);
        this.testResults.passed++;
      } else {
        this.log(`Insufficient industry diversity: ${industryCategories.length} categories`, true);
        this.testResults.failed++;
      }

      if (useCaseCategories.length >= 10) {
        this.log(`Use case category diversity check passed: ${useCaseCategories.length} categories`);
        this.testResults.passed++;
      } else {
        this.log(`Insufficient use case diversity: ${useCaseCategories.length} categories`, true);
        this.testResults.failed++;
      }

      // Check content quality
      const contentIssues = templates.filter(t => 
        !t.title || t.title.length < 10 ||
        !t.description || t.description.length < 20 ||
        !t.content || t.content.length < 100
      );

      if (contentIssues.length === 0) {
        this.log('Template content quality check passed');
        this.testResults.passed++;
      } else {
        this.log(`Content quality issues found in ${contentIssues.length} templates`, true);
        this.testResults.failed++;
      }

    } catch (error) {
      this.log(`Template data quality test error: ${error.message}`, true);
      this.testResults.failed++;
    }
  }

  /**
   * Test API endpoints (basic connectivity)
   */
  async testAPIEndpoints() {
    try {
      console.log('\n🔍 Testing API Endpoint Structure...');

      // Check if routes file exists and is properly structured
      const fs = require('fs');
      const path = require('path');

      const routesPath = path.join(__dirname, 'routes', 'templates.js');
      if (fs.existsSync(routesPath)) {
        this.log('Template routes file exists');
        this.testResults.passed++;

        const routesContent = fs.readFileSync(routesPath, 'utf8');
        
        // Check for essential endpoints
        const requiredEndpoints = [
          'GET /api/templates',
          'POST /api/templates',
          'GET /api/templates/:id',
          'PUT /api/templates/:id',
          'DELETE /api/templates/:id',
          'POST /api/templates/search',
          'GET /api/templates/categories',
          'GET /api/templates/popular'
        ];

        const foundEndpoints = requiredEndpoints.filter(endpoint => {
          const [method, path] = endpoint.split(' ');
          const routePattern = path.replace(/:\w+/g, ':\\w+').replace(/\//g, '\\/');
          const regex = new RegExp(`router\\.${method.toLowerCase()}\\(.*${routePattern}`);
          return regex.test(routesContent);
        });

        if (foundEndpoints.length >= requiredEndpoints.length - 2) {
          this.log(`API endpoints structure check passed: ${foundEndpoints.length}/${requiredEndpoints.length}`);
          this.testResults.passed++;
        } else {
          this.log(`Missing API endpoints: ${requiredEndpoints.length - foundEndpoints.length}`, true);
          this.testResults.failed++;
        }

      } else {
        this.log('Template routes file not found', true);
        this.testResults.failed++;
      }

    } catch (error) {
      this.log(`API endpoints test error: ${error.message}`, true);
      this.testResults.failed++;
    }
  }

  /**
   * Test system performance
   */
  async testPerformance() {
    try {
      console.log('\n🔍 Testing System Performance...');

      // Test template retrieval performance
      const startTime = Date.now();
      await templateService.getTemplates({ page: 1, limit: 50 });
      const retrievalTime = Date.now() - startTime;

      if (retrievalTime < 2000) {
        this.log(`Template retrieval performance: ${retrievalTime}ms (good)`);
        this.testResults.passed++;
      } else {
        this.log(`Template retrieval performance: ${retrievalTime}ms (slow)`, true);
        this.testResults.failed++;
      }

      // Test search performance
      const searchStartTime = Date.now();
      await templateService.searchTemplates({ query: 'business strategy', limit: 20 });
      const searchTime = Date.now() - searchStartTime;

      if (searchTime < 3000) {
        this.log(`Search performance: ${searchTime}ms (good)`);
        this.testResults.passed++;
      } else {
        this.log(`Search performance: ${searchTime}ms (slow)`, true);
        this.testResults.failed++;
      }

    } catch (error) {
      this.log(`Performance test error: ${error.message}`, true);
      this.testResults.failed++;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting Template System Test Suite...');
    console.log('=' .repeat(60));

    await this.testDatabaseConnection();
    await this.testTemplateService();
    await this.testDatabaseFunctions();
    await this.testTemplateDataQuality();
    await this.testAPIEndpoints();
    await this.testPerformance();

    // Print final results
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`📈 Success Rate: ${Math.round((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100)}%`);

    if (this.testResults.errors.length > 0) {
      console.log('\n🔍 Error Details:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    console.log('\n🎉 Template System Test Suite Complete!');
    
    // Return success/failure status
    return this.testResults.failed === 0;
  }
}

/**
 * Seed templates if needed
 */
async function seedTemplatesIfNeeded() {
  if (TEST_CONFIG.skipSeeding) {
    console.log('⏭️  Skipping template seeding (skipSeeding = true)');
    return;
  }

  try {
    console.log('🌱 Checking if templates need to be seeded...');

    const { data: existingTemplates, error } = await supabase
      .from('prompt_templates')
      .select('id')
      .limit(10);

    if (error) {
      console.error('❌ Error checking existing templates:', error.message);
      return;
    }

    if (existingTemplates.length < 10) {
      console.log('🌱 Seeding business templates...');
      const { seedBusinessTemplates } = require('./seeds/businessTemplatesSeed');
      await seedBusinessTemplates();
      console.log('✅ Template seeding completed');
    } else {
      console.log('✅ Templates already exist, skipping seeding');
    }

  } catch (error) {
    console.error('❌ Error during template seeding:', error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
      process.exit(1);
    }

    // Seed templates if needed
    await seedTemplatesIfNeeded();

    // Run tests if enabled
    if (TEST_CONFIG.runTests) {
      const tester = new TemplateSystemTester();
      const success = await tester.runAllTests();
      
      if (success) {
        console.log('\n🎊 All tests passed! Template system is ready for use.');
        process.exit(0);
      } else {
        console.log('\n⚠️  Some tests failed. Please review the errors above.');
        process.exit(1);
      }
    } else {
      console.log('⏭️  Tests skipped (runTests = false)');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Fatal error during testing:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { TemplateSystemTester };