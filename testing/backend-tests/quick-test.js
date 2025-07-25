// Quick test to verify the port fix worked
const { chromium } = require('playwright');

async function quickTest() {
  console.log('🔍 Quick Port Fix Verification');
  console.log('='.repeat(40));
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();
  
  try {
    let apiRequests = [];
    
    // Monitor API requests
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push(request.url());
        console.log('🌐 API Request:', request.url());
      }
    });
    
    console.log('Loading frontend...');
    await page.goto('http://localhost:3000', { timeout: 10000 });
    await page.waitForTimeout(5000);
    
    // Check which port API calls are going to
    const port8000Requests = apiRequests.filter(url => url.includes(':8000'));
    const port5001Requests = apiRequests.filter(url => url.includes(':5001'));
    
    console.log('\n📊 Results:');
    console.log(`   API calls to port 8000 (correct): ${port8000Requests.length} ${port8000Requests.length > 0 ? '✅' : '❌'}`);
    console.log(`   API calls to port 5001 (wrong): ${port5001Requests.length} ${port5001Requests.length === 0 ? '✅' : '❌'}`);
    
    if (port8000Requests.length > 0 && port5001Requests.length === 0) {
      console.log('\n🎉 SUCCESS: Port fix is working!');
      console.log('✅ Frontend is correctly calling backend on port 8000');
    } else {
      console.log('\n❌ ISSUE: Port fix may not be working');
      if (port5001Requests.length > 0) {
        console.log('🚨 Still making calls to port 5001');
      }
      if (port8000Requests.length === 0) {
        console.log('🚨 No calls to port 8000 detected');
      }
    }
    
    // Take a screenshot
    await page.screenshot({ 
      path: '/Users/thomasdowuona-hyde/AI-Masterclass/quick-test.png', 
      fullPage: true 
    });
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\n📸 Screenshot saved: quick-test.png');
  }
}

quickTest();