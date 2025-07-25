// Use Supabase CLI + Playwright to debug authentication issue
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');

async function debugWithCliAndPlaywright() {
  console.log('🔍 COMPREHENSIVE DEBUG WITH SUPABASE CLI + PLAYWRIGHT');
  console.log('====================================================');
  
  let browser, page;
  
  try {
    // Step 1: Get current project configuration via CLI
    console.log('1️⃣ Getting Supabase project configuration...');
    
    const getConfig = () => new Promise((resolve, reject) => {
      const cmd = spawn('supabase', ['projects', 'list', '--output', 'json']);
      let output = '';
      let error = '';
      
      cmd.stdout.on('data', (data) => output += data.toString());
      cmd.stderr.on('data', (data) => error += data.toString());
      
      cmd.on('close', (code) => {
        if (code === 0) {
          try {
            const projects = JSON.parse(output);
            const aiMasterclass = projects.find(p => p.name === 'AI-MASTERCLASS' || p.ref === 'fsohtauqtcftdjcjfdpq');
            resolve(aiMasterclass);
          } catch (e) {
            resolve({ error: 'Failed to parse JSON', output, error });
          }
        } else {
          resolve({ error: `Command failed with code ${code}`, output, error });
        }
      });
    });
    
    const projectInfo = await getConfig();
    console.log('Project info:', JSON.stringify(projectInfo, null, 2));
    
    // Step 2: Test with direct CLI auth commands
    console.log('\n2️⃣ Testing authentication via CLI...');
    
    const testCliAuth = () => new Promise((resolve) => {
      const cmd = spawn('supabase', ['auth', 'users', 'list', '--project-ref', 'fsohtauqtcftdjcjfdpq']);
      let output = '';
      let error = '';
      
      cmd.stdout.on('data', (data) => output += data.toString());
      cmd.stderr.on('data', (data) => error += data.toString());
      
      cmd.on('close', (code) => {
        resolve({ code, output, error });
      });
    });
    
    const cliAuth = await testCliAuth();
    console.log('CLI Auth test:', cliAuth);
    
    // Step 3: Launch Playwright to capture network details
    console.log('\n3️⃣ Launching Playwright to capture network requests...');
    
    browser = await chromium.launch({ 
      headless: false,
      devtools: true 
    });
    
    const context = await browser.newContext();
    page = await context.newPage();
    
    // Capture all network requests
    const networkRequests = [];
    page.on('request', request => {
      if (request.url().includes('supabase') || request.url().includes('auth')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData()
        });
      }
    });
    
    // Capture all network responses  
    const networkResponses = [];
    page.on('response', response => {
      if (response.url().includes('supabase') || response.url().includes('auth')) {
        networkResponses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers(),
          statusText: response.statusText()
        });
      }
    });
    
    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });
    
    // Navigate to auth page
    console.log('   Navigating to auth page...');
    await page.goto('http://localhost:3000/auth');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Try authentication
    console.log('   Filling auth form...');
    try {
      await page.fill('input[type="email"]', 'test@gmail.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
    } catch (e) {
      console.log('   Form interaction error:', e.message);
    }
    
    // Step 4: Analyze captured data
    console.log('\n4️⃣ ANALYSIS RESULTS:');
    console.log('===================');
    
    console.log('\n📡 NETWORK REQUESTS:');
    networkRequests.forEach((req, i) => {
      console.log(`   Request ${i + 1}:`);
      console.log(`     URL: ${req.url}`);
      console.log(`     Method: ${req.method}`);
      console.log(`     Headers: ${JSON.stringify(req.headers, null, 6)}`);
      if (req.postData) {
        console.log(`     Body: ${req.postData.substring(0, 200)}...`);
      }
    });
    
    console.log('\n📨 NETWORK RESPONSES:');
    networkResponses.forEach((res, i) => {
      console.log(`   Response ${i + 1}:`);
      console.log(`     URL: ${res.url}`);
      console.log(`     Status: ${res.status} ${res.statusText}`);
      console.log(`     Headers: ${JSON.stringify(res.headers, null, 6)}`);
    });
    
    console.log('\n💬 CONSOLE MESSAGES:');
    consoleMessages.forEach((msg, i) => {
      if (msg.text.includes('Invalid API key') || 
          msg.text.includes('error') || 
          msg.text.includes('Error') ||
          msg.text.includes('Supabase')) {
        console.log(`   ${msg.timestamp} [${msg.type}]: ${msg.text}`);
      }
    });
    
    // Step 5: Test with different environments
    console.log('\n5️⃣ TESTING DIFFERENT ENVIRONMENTS:');
    console.log('=================================');
    
    // Test with 127.0.0.1 instead of localhost
    console.log('   Testing with 127.0.0.1:3000...');
    try {
      await page.goto('http://127.0.0.1:3000/auth');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await page.fill('input[type="email"]', 'test@gmail.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      const errors127 = await page.locator('[class*="error"], [role="alert"]').allTextContents();
      console.log('   127.0.0.1 errors:', errors127);
    } catch (e) {
      console.log('   127.0.0.1 test failed:', e.message);
    }
    
    // Step 6: Extract actual environment from page
    console.log('\n6️⃣ EXTRACTING RUNTIME CONFIG FROM PAGE:');
    console.log('======================================');
    
    const runtimeConfig = await page.evaluate(() => {
      return {
        processEnv: typeof process !== 'undefined' ? {
          NODE_ENV: process.env?.NODE_ENV,
          REACT_APP_SUPABASE_URL: process.env?.REACT_APP_SUPABASE_URL,
          REACT_APP_SUPABASE_ANON_KEY: process.env?.REACT_APP_SUPABASE_ANON_KEY?.substring(0, 30) + '...'
        } : 'process not available',
        windowLocation: window.location.href,
        supabaseClient: window.supabase ? 'Available' : 'Not available',
        errorDetails: window.lastAuthError || 'No error captured'
      };
    });
    
    console.log('Runtime config:', JSON.stringify(runtimeConfig, null, 2));
    
    // Step 7: Create diagnostic report
    console.log('\n7️⃣ CREATING DIAGNOSTIC REPORT:');
    console.log('==============================');
    
    const diagnosticReport = {
      timestamp: new Date().toISOString(),
      projectInfo,
      cliAuthTest: cliAuth,
      networkRequests,
      networkResponses, 
      consoleMessages: consoleMessages.filter(msg => 
        msg.text.includes('Invalid API key') || 
        msg.text.includes('error') || 
        msg.text.includes('Supabase')
      ),
      runtimeConfig,
      recommendations: []
    };
    
    // Add recommendations based on findings
    if (networkResponses.some(r => r.status === 401)) {
      diagnosticReport.recommendations.push('401 Unauthorized detected - API key issue confirmed');
    }
    
    if (consoleMessages.some(m => m.text.includes('Invalid API key'))) {
      diagnosticReport.recommendations.push('Invalid API key error found in console - check Supabase project settings');
    }
    
    if (!networkRequests.length) {
      diagnosticReport.recommendations.push('No Supabase requests captured - frontend may not be making requests');
    }
    
    // Save diagnostic report
    fs.writeFileSync('./diagnostic-report.json', JSON.stringify(diagnosticReport, null, 2));
    console.log('   ✅ Diagnostic report saved to: diagnostic-report.json');
    
    console.log('\n🎯 NEXT STEPS BASED ON FINDINGS:');
    console.log('================================');
    diagnosticReport.recommendations.forEach(rec => console.log(`   - ${rec}`));
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

debugWithCliAndPlaywright();