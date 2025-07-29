/**
 * Comprehensive Test Runner for Interactive AI Playground
 * 
 * Orchestrates all test suites and generates comprehensive reports
 * Supports different test environments and configurations
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

class TestRunner {
  constructor() {
    this.config = {
      testSuites: [
        {
          name: 'Unit Tests',
          command: 'npm test -- --testPathPattern=unit',
          timeout: 30000,
          critical: true
        },
        {
          name: 'Integration Tests',
          command: 'npm test -- --testPathPattern=integration',
          timeout: 120000,
          critical: true
        },
        {
          name: 'Security Tests',
          command: 'npm test -- --testPathPattern=security',
          timeout: 60000,
          critical: true
        },
        {
          name: 'Performance Tests',
          command: 'npm test -- --testPathPattern=performance',
          timeout: 180000,
          critical: false
        },
        {
          name: 'E2E Tests',
          command: 'npx playwright test',
          timeout: 300000,
          critical: false
        }
      ],
      reports: {
        outputDir: './test-results',
        formats: ['json', 'html', 'junit'],
        coverage: true
      },
      environments: {
        development: {
          database: 'test_db',
          apiUrl: 'http://localhost:5000',
          frontendUrl: 'http://localhost:3000'
        },
        ci: {
          database: 'ci_test_db',
          apiUrl: 'http://localhost:5000',
          frontendUrl: 'http://localhost:3000',
          headless: true
        }
      }
    };

    this.results = {
      suites: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      },
      coverage: null,
      startTime: null,
      endTime: null
    };
  }

  async run(options = {}) {
    console.log('🚀 Starting Interactive AI Playground Test Suite');
    console.log('================================================');
    
    this.results.startTime = Date.now();
    const environment = options.environment || 'development';
    
    await this.setupEnvironment(environment);
    await this.createOutputDirectories();
    
    if (options.coverage) {
      await this.setupCoverage();
    }

    // Run test suites based on options
    const suitesToRun = this.filterTestSuites(options);
    
    for (const suite of suitesToRun) {
      console.log(`\n📋 Running ${suite.name}...`);
      const suiteResult = await this.runTestSuite(suite, environment);
      this.results.suites.push(suiteResult);
      
      // Stop on critical failures unless --continue-on-error is set
      if (suiteResult.failed > 0 && suite.critical && !options.continueOnError) {
        console.log(`❌ Critical test suite failed: ${suite.name}`);
        console.log('Stopping test execution. Use --continue-on-error to run all tests.');
        break;
      }
    }

    this.results.endTime = Date.now();
    this.calculateSummary();
    
    if (options.coverage) {
      await this.generateCoverageReport();
    }
    
    await this.generateReports();
    this.displaySummary();
    
    return this.results;
  }

  filterTestSuites(options) {
    let suites = [...this.config.testSuites];
    
    if (options.suite) {
      suites = suites.filter(s => s.name.toLowerCase().includes(options.suite.toLowerCase()));
    }
    
    if (options.skip) {
      const skipPatterns = Array.isArray(options.skip) ? options.skip : [options.skip];
      suites = suites.filter(s => 
        !skipPatterns.some(pattern => s.name.toLowerCase().includes(pattern.toLowerCase()))
      );
    }
    
    if (options.critical) {
      suites = suites.filter(s => s.critical);
    }
    
    return suites;
  }

  async setupEnvironment(environment) {
    console.log(`🔧 Setting up ${environment} environment...`);
    
    const envConfig = this.config.environments[environment];
    if (!envConfig) {
      throw new Error(`Unknown environment: ${environment}`);
    }

    // Set environment variables
    process.env.NODE_ENV = 'test';
    process.env.TEST_ENVIRONMENT = environment;
    process.env.API_URL = envConfig.apiUrl;
    process.env.FRONTEND_URL = envConfig.frontendUrl;
    
    if (envConfig.headless) {
      process.env.HEADLESS = 'true';
    }

    // Ensure test database is available
    if (envConfig.database) {
      await this.ensureTestDatabase(envConfig.database);
    }

    console.log('✅ Environment setup complete');
  }

  async ensureTestDatabase(dbName) {
    return new Promise((resolve, reject) => {
      exec(`node scripts/setup-test-db.js ${dbName}`, (error, stdout, stderr) => {
        if (error) {
          console.warn(`⚠️  Database setup warning: ${error.message}`);
        }
        resolve();
      });
    });
  }

  async createOutputDirectories() {
    const dirs = [
      this.config.reports.outputDir,
      `${this.config.reports.outputDir}/coverage`,
      `${this.config.reports.outputDir}/screenshots`,
      `${this.config.reports.outputDir}/videos`
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  async setupCoverage() {
    console.log('📊 Setting up code coverage...');
    process.env.COLLECT_COVERAGE = 'true';
  }

  async runTestSuite(suite, environment) {
    const startTime = performance.now();
    const result = {
      name: suite.name,
      command: suite.command,
      duration: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      output: '',
      error: null
    };

    return new Promise((resolve) => {
      const process = spawn('bash', ['-c', suite.command], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env },
        timeout: suite.timeout
      });

      let output = '';
      let errorOutput = '';

      process.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        if (process.env.VERBOSE) {
          console.log(chunk);
        }
      });

      process.stderr.on('data', (data) => {
        const chunk = data.toString();
        errorOutput += chunk;
        if (process.env.VERBOSE) {
          console.error(chunk);
        }
      });

      process.on('close', (code) => {
        const endTime = performance.now();
        result.duration = Math.round(endTime - startTime);
        result.output = output;
        
        if (code === 0) {
          console.log(`✅ ${suite.name} completed successfully`);
          result.passed = this.extractTestCounts(output).passed;
          result.skipped = this.extractTestCounts(output).skipped;
        } else {
          console.log(`❌ ${suite.name} failed with code ${code}`);
          result.failed = this.extractTestCounts(output).failed || 1;
          result.error = errorOutput;
        }

        resolve(result);
      });

      process.on('error', (error) => {
        const endTime = performance.now();
        result.duration = Math.round(endTime - startTime);
        result.failed = 1;
        result.error = error.message;
        console.log(`❌ ${suite.name} encountered error: ${error.message}`);
        resolve(result);
      });

      // Handle timeout
      setTimeout(() => {
        if (!process.killed) {
          console.log(`⏰ ${suite.name} timed out after ${suite.timeout}ms`);
          process.kill('SIGKILL');
        }
      }, suite.timeout);
    });
  }

  extractTestCounts(output) {
    const counts = { passed: 0, failed: 0, skipped: 0, total: 0 };
    
    // Jest output patterns
    const jestMatch = output.match(/Tests:\s+(\d+)\s+failed,\s+(\d+)\s+passed,\s+(\d+)\s+total/);
    if (jestMatch) {
      counts.failed = parseInt(jestMatch[1]);
      counts.passed = parseInt(jestMatch[2]);
      counts.total = parseInt(jestMatch[3]);
      return counts;
    }

    // Playwright output patterns
    const playwrightMatch = output.match(/(\d+)\s+passed.*?(\d+)\s+failed/);
    if (playwrightMatch) {
      counts.passed = parseInt(playwrightMatch[1]);
      counts.failed = parseInt(playwrightMatch[2]);
      counts.total = counts.passed + counts.failed;
      return counts;
    }

    // Mocha output patterns
    const mochaMatch = output.match(/(\d+)\s+passing.*?(\d+)\s+failing/);
    if (mochaMatch) {
      counts.passed = parseInt(mochaMatch[1]);
      counts.failed = parseInt(mochaMatch[2]);
      counts.total = counts.passed + counts.failed;
      return counts;
    }

    return counts;
  }

  calculateSummary() {
    this.results.summary = this.results.suites.reduce((summary, suite) => ({
      total: summary.total + suite.passed + suite.failed + suite.skipped,
      passed: summary.passed + suite.passed,
      failed: summary.failed + suite.failed,
      skipped: summary.skipped + suite.skipped,
      duration: summary.duration + suite.duration
    }), { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 });
  }

  async generateCoverageReport() {
    console.log('📊 Generating coverage report...');
    
    return new Promise((resolve) => {
      exec('npx nyc report --reporter=html --reporter=json', (error, stdout, stderr) => {
        if (error) {
          console.warn(`⚠️  Coverage report warning: ${error.message}`);
        } else {
          console.log('✅ Coverage report generated');
        }
        resolve();
      });
    });
  }

  async generateReports() {
    console.log('📄 Generating test reports...');

    // JSON Report
    const jsonReport = {
      timestamp: new Date().toISOString(),
      environment: process.env.TEST_ENVIRONMENT,
      summary: this.results.summary,
      suites: this.results.suites,
      duration: this.results.endTime - this.results.startTime
    };

    fs.writeFileSync(
      `${this.config.reports.outputDir}/test-results.json`,
      JSON.stringify(jsonReport, null, 2)
    );

    // HTML Report
    const htmlReport = this.generateHtmlReport(jsonReport);
    fs.writeFileSync(
      `${this.config.reports.outputDir}/test-results.html`,
      htmlReport
    );

    // JUnit XML Report
    const junitReport = this.generateJunitReport(jsonReport);
    fs.writeFileSync(
      `${this.config.reports.outputDir}/junit.xml`,
      junitReport
    );

    console.log('✅ Test reports generated');
  }

  generateHtmlReport(data) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>AI Playground Test Results</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .metric { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #007acc; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric h3 { margin: 0 0 5px 0; color: #333; }
        .metric .value { font-size: 24px; font-weight: bold; color: #007acc; }
        .suite { background: white; margin-bottom: 15px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .suite-header { padding: 15px; background: #f8f9fa; border-bottom: 1px solid #e9ecef; }
        .suite-body { padding: 15px; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .status-badge { padding: 4px 8px; border-radius: 4px; color: white; font-size: 12px; font-weight: bold; }
        .status-passed { background: #28a745; }
        .status-failed { background: #dc3545; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Interactive AI Playground Test Results</h1>
        <p><strong>Environment:</strong> ${data.environment} | <strong>Generated:</strong> ${data.timestamp}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <div class="value">${data.summary.total}</div>
        </div>
        <div class="metric">
            <h3>Passed</h3>
            <div class="value passed">${data.summary.passed}</div>
        </div>
        <div class="metric">
            <h3>Failed</h3>
            <div class="value failed">${data.summary.failed}</div>
        </div>
        <div class="metric">
            <h3>Skipped</h3>
            <div class="value skipped">${data.summary.skipped}</div>
        </div>
        <div class="metric">
            <h3>Duration</h3>
            <div class="value">${Math.round(data.summary.duration / 1000)}s</div>
        </div>
        <div class="metric">
            <h3>Success Rate</h3>
            <div class="value">${Math.round((data.summary.passed / data.summary.total) * 100)}%</div>
        </div>
    </div>

    <h2>Test Suites</h2>
    ${data.suites.map(suite => `
        <div class="suite">
            <div class="suite-header">
                <h3>${suite.name} 
                    <span class="status-badge ${suite.failed > 0 ? 'status-failed' : 'status-passed'}">
                        ${suite.failed > 0 ? 'FAILED' : 'PASSED'}
                    </span>
                </h3>
                <p>Duration: ${Math.round(suite.duration / 1000)}s | 
                   Passed: <span class="passed">${suite.passed}</span> | 
                   Failed: <span class="failed">${suite.failed}</span> | 
                   Skipped: <span class="skipped">${suite.skipped}</span>
                </p>
            </div>
            ${suite.error ? `
                <div class="suite-body">
                    <h4>Error Output:</h4>
                    <pre>${suite.error}</pre>
                </div>
            ` : ''}
        </div>
    `).join('')}
</body>
</html>`;
  }

  generateJunitReport(data) {
    const totalTests = data.summary.total;
    const failures = data.summary.failed;
    const time = Math.round(data.duration / 1000);

    return `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="AI Playground Tests" tests="${totalTests}" failures="${failures}" time="${time}">
${data.suites.map(suite => `
  <testsuite name="${suite.name}" tests="${suite.passed + suite.failed + suite.skipped}" failures="${suite.failed}" time="${Math.round(suite.duration / 1000)}">
    ${suite.failed > 0 ? `<testcase name="${suite.name}" classname="TestSuite"><failure message="Test suite failed">${suite.error || 'Unknown error'}</failure></testcase>` : `<testcase name="${suite.name}" classname="TestSuite" time="${Math.round(suite.duration / 1000)}"/>`}
  </testsuite>
`).join('')}
</testsuites>`;
  }

  displaySummary() {
    const { summary } = this.results;
    const successRate = Math.round((summary.passed / summary.total) * 100);
    
    console.log('\n🏁 Test Execution Complete');
    console.log('==========================');
    console.log(`📊 Summary:`);
    console.log(`   Total Tests: ${summary.total}`);
    console.log(`   ✅ Passed: ${summary.passed}`);
    console.log(`   ❌ Failed: ${summary.failed}`);
    console.log(`   ⏭️  Skipped: ${summary.skipped}`);
    console.log(`   ⏱️  Duration: ${Math.round(summary.duration / 1000)}s`);
    console.log(`   📈 Success Rate: ${successRate}%`);
    
    if (summary.failed === 0) {
      console.log(`\n🎉 All tests passed! The Interactive AI Playground is ready for production.`);
    } else {
      console.log(`\n⚠️  ${summary.failed} test(s) failed. Please review the results before deployment.`);
    }
    
    console.log(`\n📄 Reports available in: ${this.config.reports.outputDir}/`);
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--environment' || arg === '-e') {
      options.environment = args[++i];
    } else if (arg === '--suite' || arg === '-s') {
      options.suite = args[++i];
    } else if (arg === '--skip') {
      options.skip = args[++i];
    } else if (arg === '--coverage' || arg === '-c') {
      options.coverage = true;
    } else if (arg === '--critical') {
      options.critical = true;
    } else if (arg === '--continue-on-error') {
      options.continueOnError = true;
    } else if (arg === '--verbose' || arg === '-v') {
      process.env.VERBOSE = 'true';
    }
  }
  
  const runner = new TestRunner();
  runner.run(options)
    .then(results => {
      process.exit(results.summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = TestRunner;