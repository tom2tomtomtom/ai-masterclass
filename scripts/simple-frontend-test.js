// Simple Frontend Diagnostic Test
const { chromium } = require('playwright');

async function testFrontend() {
  console.log('🔍 FRONTEND DIAGNOSTIC TEST');
  console.log('============================\n');

  let browser;
  let page;

  try {
    // Launch browser
    console.log('🚀 Launching browser...');
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000 // Slow down for visibility
    });
    
    page = await browser.newPage();
    
    // Set up console logging
    page.on('console', msg => {
      console.log(`🖥️  BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`);
    });
    
    // Set up error logging
    page.on('pageerror', error => {
      console.log(`❌ BROWSER ERROR: ${error.message}`);
    });
    
    // Set up network monitoring
    page.on('request', request => {
      console.log(`📡 REQUEST: ${request.method()} ${request.url()}`);
    });
    
    page.on('response', response => {
      const status = response.status();
      const url = response.url();
      if (status >= 400) {
        console.log(`❌ FAILED RESPONSE: ${status} ${url}`);
      } else {
        console.log(`✅ SUCCESS RESPONSE: ${status} ${url}`);
      }
    });

    // Navigate to frontend
    console.log('🌐 Navigating to http://localhost:3001...');
    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Wait a moment for everything to load
    await page.waitForTimeout(3000);

    // Check page title
    const title = await page.title();
    console.log(`📄 Page Title: "${title}"`);

    // Check if React app loaded
    const reactRoot = await page.$('#root');
    if (reactRoot) {
      console.log('✅ React root element found');
    } else {
      console.log('❌ React root element NOT found');
    }

    // Check for any visible content
    const bodyText = await page.textContent('body');
    console.log(`📝 Page Content Length: ${bodyText.length} characters`);
    
    if (bodyText.length > 100) {
      console.log('✅ Page has substantial content');
      console.log(`📖 First 200 characters: "${bodyText.substring(0, 200)}..."`);
    } else {
      console.log('⚠️ Page has minimal content');
      console.log(`📖 Full content: "${bodyText}"`);
    }

    // Check for common React error messages
    const errorMessages = [
      'Something went wrong',
      'Error',
      'Failed to fetch',
      'Cannot read',
      'undefined'
    ];

    for (const errorMsg of errorMessages) {
      const hasError = bodyText.toLowerCase().includes(errorMsg.toLowerCase());
      if (hasError) {
        console.log(`⚠️ Potential error found: "${errorMsg}"`);
      }
    }

    // Check for course-related content
    const courseKeywords = [
      'course',
      'lesson',
      'module',
      'AI',
      'masterclass'
    ];

    let foundKeywords = 0;
    for (const keyword of courseKeywords) {
      const hasKeyword = bodyText.toLowerCase().includes(keyword.toLowerCase());
      if (hasKeyword) {
        foundKeywords++;
        console.log(`✅ Found keyword: "${keyword}"`);
      }
    }

    console.log(`📊 Found ${foundKeywords}/${courseKeywords.length} expected keywords`);

    // Take a screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ 
      path: 'frontend-screenshot.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved as frontend-screenshot.png');

    // Check network requests
    console.log('\n🔌 Checking API connectivity...');
    
    // Try to make an API request
    try {
      const response = await page.evaluate(async () => {
        const res = await fetch('http://localhost:8000/api/health');
        return {
          status: res.status,
          ok: res.ok,
          text: await res.text()
        };
      });
      
      console.log(`✅ API Health Check: ${response.status} - ${response.ok ? 'OK' : 'FAILED'}`);
      console.log(`📄 API Response: ${response.text}`);
    } catch (error) {
      console.log(`❌ API Health Check Failed: ${error.message}`);
    }

    // Final assessment
    console.log('\n📋 DIAGNOSTIC SUMMARY');
    console.log('=====================');
    
    if (foundKeywords >= 3 && bodyText.length > 100) {
      console.log('✅ Frontend appears to be working correctly');
    } else if (bodyText.length > 50) {
      console.log('⚠️ Frontend is loading but may have issues');
    } else {
      console.log('❌ Frontend appears to have significant issues');
    }

    // Keep browser open for manual inspection
    console.log('\n🔍 Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Install playwright if needed and run test
async function main() {
  try {
    await testFrontend();
  } catch (error) {
    if (error.message.includes('chromium')) {
      console.log('📦 Installing Playwright browsers...');
      const { exec } = require('child_process');
      exec('npx playwright install chromium', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Failed to install Playwright:', error);
          return;
        }
        console.log('✅ Playwright installed, please run the test again');
      });
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

main();
