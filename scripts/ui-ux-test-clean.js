const puppeteer = require('puppeteer');

// Configuration
const FRONTEND_URL = 'http://localhost:3001';
const BACKEND_URL = 'http://localhost:8000';

async function runUIUXTests() {
  console.log('🚀 Starting AI Masterclass UI/UX Tests...');
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log('=====================================\n');

  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Test 1: Homepage loads correctly with all key elements
    await testHomepageLoad(page);
    
    // Test 2: Course catalog displays all courses
    await testCourseCatalog(page);
    
    // Test 3: Navigation and routing work correctly
    await testNavigation(page);
    
    // Test 4: Course detail pages load and display content
    await testCourseDetailPages(page);
    
    // Test 5: Responsive design works on different screen sizes
    await testResponsiveDesign(page);
    
    // Test 6: Performance and loading times are acceptable
    await testPerformance(page);
    
    // Test 7: Accessibility features are present
    await testAccessibility(page);
    
    // Test 8: Backend API connectivity and data flow
    await testBackendConnectivity(page);
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  } finally {
    await browser.close();
  }
}

async function testHomepageLoad(page) {
  console.log('🏠 Testing Homepage Load...');
  
  try {
    // Navigate to the application
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
    
    // Check page title
    const title = await page.title();
    console.log(`Page title: "${title}"`);
    
    if (title.toLowerCase().includes('ai') || title.toLowerCase().includes('masterclass')) {
      console.log('✅ Page title looks correct');
    } else {
      console.log('⚠️ Page title might not be set correctly');
    }
    
    // Check main navigation elements
    const nav = await page.$('nav, .nav, .navigation, header nav');
    if (nav) {
      console.log('✅ Navigation element found');
    } else {
      console.log('⚠️ No navigation element found');
    }
    
    // Check for course listings or main content
    const mainContent = await page.$('main, .main-content, .courses, .course-list, .container');
    if (mainContent) {
      console.log('✅ Main content area found');
    } else {
      console.log('⚠️ No main content area found');
    }
    
    // Check for header/logo
    const header = await page.$('header, .header, h1, .logo');
    if (header) {
      console.log('✅ Header/logo element found');
    } else {
      console.log('⚠️ No header/logo element found');
    }
    
    console.log('✅ Homepage load test completed\n');
    
  } catch (error) {
    console.log(`❌ Homepage load test failed: ${error.message}\n`);
  }
}

async function testCourseCatalog(page) {
  console.log('📚 Testing Course Catalog...');
  
  try {
    // Look for course cards/items
    const courseSelectors = [
      '.course-card',
      '.course-item', 
      '.course',
      '[data-testid="course"]',
      '.module',
      '.course-module'
    ];
    
    let courseElements = null;
    let courseCount = 0;
    
    for (const selector of courseSelectors) {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        courseElements = elements;
        courseCount = elements.length;
        console.log(`Found ${courseCount} courses using selector: ${selector}`);
        break;
      }
    }
    
    if (courseElements && courseCount > 0) {
      console.log(`📊 Found ${courseCount} courses in the UI`);
      
      // Check if we have a reasonable number of courses (should be 15+)
      if (courseCount >= 15) {
        console.log('✅ Good number of courses found');
      } else {
        console.log(`⚠️ Only ${courseCount} courses found, expected 20+`);
      }
      
      // Check first few courses are visible
      for (let i = 0; i < Math.min(3, courseCount); i++) {
        const isVisible = await courseElements[i].isIntersectingViewport();
        if (isVisible) {
          console.log(`✅ Course ${i + 1} is visible`);
        }
      }
    } else {
      console.log('⚠️ No course elements found, checking for alternative layouts...');
      
      // Check for text-based course listings
      const courseTexts = [
        'AI Fundamentals',
        'Marketing Analytics',
        'Vibe Coding',
        'AI Ethics',
        'Automation'
      ];
      
      for (const text of courseTexts) {
        const element = await page.$(`text=${text}`);
        if (element) {
          console.log(`✅ Found course: ${text}`);
        }
      }
    }
    
    console.log('✅ Course catalog test completed\n');
    
  } catch (error) {
    console.log(`❌ Course catalog test failed: ${error.message}\n`);
  }
}

async function testNavigation(page) {
  console.log('🧭 Testing Navigation...');
  
  try {
    // Check for navigation links
    const navLinks = await page.$$('nav a, .nav-link, .menu-item a, header a');
    
    if (navLinks.length > 0) {
      console.log(`Found ${navLinks.length} navigation links`);
      
      // Test first few navigation links
      for (let i = 0; i < Math.min(2, navLinks.length); i++) {
        const link = navLinks[i];
        const linkText = await page.evaluate(el => el.textContent, link);
        
        if (linkText && linkText.trim()) {
          console.log(`Testing navigation to: ${linkText.trim()}`);
          
          try {
            await link.click();
            await page.waitForTimeout(2000);
            
            // Check that we navigated somewhere
            const currentUrl = page.url();
            console.log(`Navigated to: ${currentUrl}`);
            
            // Go back to home for next test
            await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
          } catch (error) {
            console.log(`⚠️ Navigation issue with ${linkText}: ${error.message}`);
          }
        }
      }
    } else {
      console.log('⚠️ No navigation links found');
    }
    
    console.log('✅ Navigation test completed\n');
    
  } catch (error) {
    console.log(`❌ Navigation test failed: ${error.message}\n`);
  }
}

async function testCourseDetailPages(page) {
  console.log('📖 Testing Course Detail Pages...');
  
  try {
    // Look for clickable course elements
    const courseLinks = await page.$$('a[href*="course"], a[href*="module"], .course-card a, .course-item a');
    
    if (courseLinks.length > 0) {
      console.log(`Found ${courseLinks.length} course links`);
      
      // Test first course detail page
      const courseLink = courseLinks[0];
      
      try {
        await courseLink.click();
        await page.waitForTimeout(3000);
        
        // Check for course content elements
        const contentSelectors = [
          '.lesson-content',
          '.course-content', 
          '.module-content',
          'main',
          '.content'
        ];
        
        let hasContent = false;
        for (const selector of contentSelectors) {
          const element = await page.$(selector);
          if (element) {
            hasContent = true;
            console.log(`✅ Found course content using: ${selector}`);
            break;
          }
        }
        
        if (!hasContent) {
          console.log('⚠️ No course content found on detail page');
        }
        
        // Go back for next test
        await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });
        
      } catch (error) {
        console.log(`⚠️ Error testing course detail: ${error.message}`);
      }
    } else {
      console.log('⚠️ No course links found for detail page testing');
    }
    
    console.log('✅ Course detail test completed\n');
    
  } catch (error) {
    console.log(`❌ Course detail test failed: ${error.message}\n`);
  }
}

async function testResponsiveDesign(page) {
  console.log('📱 Testing Responsive Design...');

  try {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1366, height: 768, name: 'Desktop Standard' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      console.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`);

      await page.setViewport({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);

      // Check that main content is still visible
      const mainContent = await page.$('main, .main-content, .container');
      if (mainContent) {
        console.log(`✅ ${viewport.name} layout looks good`);
      } else {
        console.log(`⚠️ ${viewport.name} layout issues detected`);
      }
    }

    console.log('✅ Responsive design test completed\n');

  } catch (error) {
    console.log(`❌ Responsive design test failed: ${error.message}\n`);
  }
}

async function testPerformance(page) {
  console.log('⚡ Testing Performance...');

  try {
    const startTime = Date.now();

    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });

    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);

    // Check that page loads within reasonable time (10 seconds)
    if (loadTime < 10000) {
      console.log('✅ Page load time is acceptable');
    } else {
      console.log('⚠️ Page load time is slow');
    }

    // Check for JavaScript errors
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    await page.waitForTimeout(2000);

    if (errors.length === 0) {
      console.log('✅ No JavaScript errors detected');
    } else {
      console.log('⚠️ JavaScript errors found:', errors);
    }

    console.log('✅ Performance test completed\n');

  } catch (error) {
    console.log(`❌ Performance test failed: ${error.message}\n`);
  }
}

async function testAccessibility(page) {
  console.log('♿ Testing Accessibility...');

  try {
    // Check for semantic HTML elements
    const semanticElements = ['main', 'nav', 'header', 'footer', 'section', 'article'];

    for (const element of semanticElements) {
      const elements = await page.$$(element);
      if (elements.length > 0) {
        console.log(`✅ Found ${elements.length} ${element} element(s)`);
      }
    }

    // Check for alt text on images
    const images = await page.$$('img');

    if (images.length > 0) {
      console.log(`Found ${images.length} images`);

      for (let i = 0; i < Math.min(3, images.length); i++) {
        const img = images[i];
        const alt = await page.evaluate(el => el.getAttribute('alt'), img);

        if (alt) {
          console.log(`✅ Image ${i + 1} has alt text: "${alt}"`);
        } else {
          console.log(`⚠️ Image ${i + 1} missing alt text`);
        }
      }
    }

    // Check for proper heading hierarchy
    const headings = await page.$$('h1, h2, h3, h4, h5, h6');

    if (headings.length > 0) {
      console.log(`✅ Found ${headings.length} headings for proper structure`);
    }

    console.log('✅ Accessibility test completed\n');

  } catch (error) {
    console.log(`❌ Accessibility test failed: ${error.message}\n`);
  }
}

async function testBackendConnectivity(page) {
  console.log('🔌 Testing Backend Connectivity...');

  try {
    // Monitor network requests
    const apiRequests = [];

    page.on('request', request => {
      if (request.url().includes(BACKEND_URL) || request.url().includes('api')) {
        apiRequests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });

    // Reload page to capture API calls
    await page.reload({ waitUntil: 'networkidle2' });

    console.log(`Captured ${apiRequests.length} API requests:`);
    apiRequests.forEach(req => {
      console.log(`  ${req.method} ${req.url}`);
    });

    // Check if we have API communication
    if (apiRequests.length > 0) {
      console.log('✅ Backend API communication detected');
    } else {
      console.log('⚠️ No backend API requests detected');
    }

    console.log('✅ Backend connectivity test completed\n');

  } catch (error) {
    console.log(`❌ Backend connectivity test failed: ${error.message}\n`);
  }
}

// Run the tests
runUIUXTests().then(() => {
  console.log('🎉 All UI/UX tests completed!');
}).catch(error => {
  console.error('❌ Test suite failed:', error);
});
