const { chromium } = require('playwright');

async function testUserExperience() {
  console.log('🚀 Starting User Experience Test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test 1: Check if frontend loads
    console.log('📱 Test 1: Loading frontend...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const title = await page.title();
    console.log(`   ✅ Page title: ${title}`);
    
    // Test 2: Check for React app elements
    console.log('\n🔍 Test 2: Checking React app elements...');
    const bodyText = await page.textContent('body');
    
    if (bodyText.includes('AI Masterclass') || bodyText.includes('Course') || bodyText.includes('Login')) {
      console.log('   ✅ React app appears to be loaded');
    } else {
      console.log('   ❌ React app content not found');
      console.log('   📄 Page content preview:', bodyText.substring(0, 200) + '...');
    }
    
    // Test 3: Check for navigation elements
    console.log('\n🧭 Test 3: Checking navigation elements...');
    const nav = await page.$('nav');
    const links = await page.$$('a');
    const buttons = await page.$$('button');
    
    console.log(`   📊 Found ${links.length} links, ${buttons.length} buttons`);
    console.log(`   ${nav ? '✅' : '❌'} Navigation element ${nav ? 'found' : 'not found'}`);
    
    // Test 4: Check for authentication elements
    console.log('\n🔐 Test 4: Checking authentication elements...');
    const loginButton = await page.$('text=Login');
    const signupButton = await page.$('text=Sign');
    const authForm = await page.$('form');
    
    console.log(`   ${loginButton ? '✅' : '❌'} Login button ${loginButton ? 'found' : 'not found'}`);
    console.log(`   ${signupButton ? '✅' : '❌'} Signup element ${signupButton ? 'found' : 'not found'}`);
    console.log(`   ${authForm ? '✅' : '❌'} Auth form ${authForm ? 'found' : 'not found'}`);
    
    // Test 5: Check backend connectivity
    console.log('\n🔌 Test 5: Testing backend connectivity...');
    try {
      const response = await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });
      console.log(`   ✅ Backend responds with status: ${response.status()}`);
      
      const backendText = await page.textContent('body');
      console.log(`   📄 Backend response: ${backendText.substring(0, 100)}...`);
    } catch (error) {
      console.log(`   ❌ Backend connection failed: ${error.message}`);
    }
    
    // Test 6: Try API endpoints
    console.log('\n🔗 Test 6: Testing API endpoints...');
    await page.goto('http://localhost:3000');
    
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses');
        return {
          status: response.status,
          ok: response.ok,
          text: await response.text()
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    if (apiResponse.error) {
      console.log(`   ❌ API call failed: ${apiResponse.error}`);
    } else {
      console.log(`   ✅ API responds with status: ${apiResponse.status}`);
      console.log(`   📄 API response preview: ${apiResponse.text.substring(0, 100)}...`);
    }
    
    // Test 7: Check console errors
    console.log('\n🐛 Test 7: Checking for console errors...');
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForTimeout(3000);
    
    if (logs.length > 0) {
      console.log(`   ❌ Found ${logs.length} console errors:`);
      logs.forEach((log, i) => console.log(`      ${i + 1}. ${log}`));
    } else {
      console.log('   ✅ No console errors found');
    }
    
    // Test 8: Take screenshot for visual inspection
    console.log('\n📸 Test 8: Taking screenshot for visual inspection...');
    await page.screenshot({ path: '/Users/thomasdowuona-hyde/AI-Masterclass/test-screenshot.png', fullPage: true });
    console.log('   ✅ Screenshot saved as test-screenshot.png');
    
  } catch (error) {
    console.log(`\n❌ Test failed with error: ${error.message}`);
  } finally {
    await browser.close();
  }
  
  console.log('\n🏁 User Experience Test Complete!');
}

testUserExperience();