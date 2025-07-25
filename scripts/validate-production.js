const https = require('https');
const fs = require('fs');

async function validateProduction() {
  console.log('🎯 Validating Production Deployment');
  console.log('===================================');
  
  const productionUrl = 'https://web-production-98afb.up.railway.app';
  console.log('Production URL:', productionUrl);
  console.log('Validation started:', new Date().toLocaleString());
  
  // Test 1: Basic connectivity
  console.log('\n📡 TEST 1: Basic Connectivity');
  console.log('─────────────────────────────');
  
  return new Promise((resolve) => {
    const req = https.get(productionUrl, (res) => {
      console.log('✅ Server responded with status:', res.statusCode);
      console.log('✅ Content-Type:', res.headers['content-type']);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Response received, length:', data.length);
        
        // Basic content checks
        console.log('\n📋 TEST 2: Content Analysis');
        console.log('────────────────────────────');
        
        if (data.includes('<title>')) {
          console.log('✅ HTML title found');
        } else {
          console.log('❌ No HTML title found');
        }
        
        if (data.includes('react') || data.includes('React')) {
          console.log('✅ React application detected');
        }
        
        if (data.includes('error') || data.includes('Error')) {
          console.log('⚠️  Error content detected in response');
        }
        
        if (data.includes('course') || data.includes('Course')) {
          console.log('✅ Course-related content detected');
        }
        
        // Save response for analysis
        fs.writeFileSync('/Users/thomasdowuona-hyde/AI-Masterclass/production-response.html', data);
        console.log('✅ Response saved to production-response.html');
        
        console.log('\n🎯 Validation Summary');
        console.log('══════════════════════');
        console.log('Status: Server is responding');
        console.log('Next step: Run full Playwright tests');
        
        resolve(true);
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Connection failed:', err.message);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Request timeout');
      resolve(false);
    });
  });
}

validateProduction().then((success) => {
  if (success) {
    console.log('\n🚀 Ready for comprehensive testing!');
  } else {
    console.log('\n❌ Production validation failed');
  }
});