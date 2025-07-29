/**
 * End-to-End Tests for Interactive AI Playground
 * 
 * Comprehensive E2E testing using Playwright to test complete user workflows
 * Tests the full stack from React frontend to backend API to database
 */

const { test, expect, chromium } = require('@playwright/test');
const { createClient } = require('@supabase/supabase-js');

const E2E_CONFIG = {
  baseURL: process.env.FRONTEND_URL || 'http://localhost:3000',
  apiURL: process.env.BACKEND_URL || 'http://localhost:5000',
  timeout: 30000,
  testUser: {
    email: 'e2e-test@example.com',
    password: 'E2ETestPass123!'
  },
  screenshots: {
    path: './test-results/screenshots/',
    onFailure: true
  }
};

// Test scenarios for comprehensive E2E coverage
const TEST_SCENARIOS = {
  templateSelection: {
    industry: 'marketing',
    useCase: 'content_creation',
    searchTerm: 'email marketing'
  },
  aiGeneration: {
    providers: ['openai', 'anthropic'],
    prompt: 'Create a compelling product launch email for an eco-friendly water bottle',
    parameters: {
      temperature: 0.7,
      maxTokens: 300
    }
  }
};

describe('AI Playground E2E Tests', () => {
  let browser;
  let context;
  let page;
  let supabaseClient;
  let testUserId;

  beforeAll(async () => {
    // Launch browser
    browser = await chromium.launch({
      headless: process.env.CI === 'true',
      slowMo: process.env.DEBUG ? 100 : 0
    });

    // Create browser context
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      permissions: ['clipboard-read', 'clipboard-write']
    });

    page = await context.newPage();

    // Initialize Supabase client
    supabaseClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Set up test user
    try {
      const { data: authData, error } = await supabaseClient.auth.signUp({
        email: E2E_CONFIG.testUser.email,
        password: E2E_CONFIG.testUser.password
      });

      if (authData?.user) {
        testUserId = authData.user.id;
      }
    } catch (error) {
      console.warn('Test user may already exist:', error.message);
    }

    // Navigate to application
    await page.goto(E2E_CONFIG.baseURL);
  }, E2E_CONFIG.timeout);

  afterAll(async () => {
    // Cleanup test user
    if (testUserId && supabaseClient) {
      try {
        await supabaseClient.auth.admin.deleteUser(testUserId);
      } catch (error) {
        console.warn('Failed to cleanup test user:', error.message);
      }
    }

    // Close browser
    if (browser) {
      await browser.close();
    }
  });

  describe('User Authentication Flow', () => {
    test('should display login form on initial visit', async () => {
      // Check if login form is visible
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should handle user login successfully', async () => {
      // Fill in login credentials
      await page.fill('input[type="email"]', E2E_CONFIG.testUser.email);
      await page.fill('input[type="password"]', E2E_CONFIG.testUser.password);

      // Submit login form
      await page.click('button[type="submit"]');

      // Wait for navigation to dashboard
      await page.waitForSelector('[data-testid="ai-playground-dashboard"]', { timeout: 10000 });

      // Verify user is logged in
      await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
      await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();
    });

    test('should display navigation menu after login', async () => {
      // Check main navigation items
      await expect(page.locator('[data-testid="nav-ai-playground"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-template-library"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-progress-tracker"]')).toBeVisible();
      await expect(page.locator('[data-testid="nav-community"]')).toBeVisible();
    });
  });

  describe('Template Library Integration', () => {
    test('should navigate to template library', async () => {
      await page.click('[data-testid="nav-template-library"]');
      await page.waitForSelector('[data-testid="template-library"]');

      // Verify template library components are loaded
      await expect(page.locator('[data-testid="template-categories"]')).toBeVisible();
      await expect(page.locator('[data-testid="template-search"]')).toBeVisible();
      await expect(page.locator('[data-testid="template-grid"]')).toBeVisible();
    });

    test('should display template categories', async () => {
      // Check if categories are loaded
      await expect(page.locator('[data-testid="industry-filter"]')).toBeVisible();
      await expect(page.locator('[data-testid="use-case-filter"]')).toBeVisible();

      // Verify specific categories exist
      await expect(page.locator('text=Marketing')).toBeVisible();
      await expect(page.locator('text=Sales')).toBeVisible();
      await expect(page.locator('text=Content Creation')).toBeVisible();
    });

    test('should filter templates by category', async () => {
      // Select industry filter
      await page.click('[data-testid="industry-filter"]');
      await page.click(`text=${TEST_SCENARIOS.templateSelection.industry}`);

      // Wait for filtered results
      await page.waitForTimeout(1000);

      // Verify templates are filtered
      const templateCards = await page.locator('[data-testid="template-card"]').count();
      expect(templateCards).toBeGreaterThan(0);

      // Check that displayed templates match the filter
      const firstTemplate = page.locator('[data-testid="template-card"]').first();
      await expect(firstTemplate.locator('[data-testid="template-industry"]')).toContainText(
        TEST_SCENARIOS.templateSelection.industry
      );
    });

    test('should search templates by text query', async () => {
      // Clear existing filters
      await page.click('[data-testid="clear-filters"]');

      // Enter search term
      await page.fill('[data-testid="template-search-input"]', TEST_SCENARIOS.templateSelection.searchTerm);
      await page.click('[data-testid="search-button"]');

      // Wait for search results
      await page.waitForSelector('[data-testid="search-results"]');

      // Verify search results contain the search term
      const searchResults = page.locator('[data-testid="template-card"]');
      const firstResult = searchResults.first();
      
      await expect(firstResult).toBeVisible();
      
      // Check that title or description contains search term
      const titleText = await firstResult.locator('[data-testid="template-title"]').textContent();
      const descText = await firstResult.locator('[data-testid="template-description"]').textContent();
      
      expect(
        titleText.toLowerCase().includes('email') || 
        titleText.toLowerCase().includes('marketing') ||
        descText.toLowerCase().includes('email') || 
        descText.toLowerCase().includes('marketing')
      ).toBeTruthy();
    });

    test('should select and preview template', async () => {
      // Click on first template card
      await page.click('[data-testid="template-card"]');

      // Wait for template preview modal
      await page.waitForSelector('[data-testid="template-preview-modal"]');

      // Verify preview modal content
      await expect(page.locator('[data-testid="template-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="template-description"]')).toBeVisible();
      await expect(page.locator('[data-testid="template-content"]')).toBeVisible();
      await expect(page.locator('[data-testid="template-variables"]')).toBeVisible();
      await expect(page.locator('[data-testid="use-template-button"]')).toBeVisible();
    });
  });

  describe('AI Playground Workflow', () => {
    test('should navigate to AI playground with selected template', async () => {
      // From template preview, click "Use Template"
      await page.click('[data-testid="use-template-button"]');

      // Should navigate to AI playground
      await page.waitForSelector('[data-testid="ai-playground"]');

      // Verify template is loaded in playground
      await expect(page.locator('[data-testid="selected-template"]')).toBeVisible();
      await expect(page.locator('[data-testid="template-variables-form"]')).toBeVisible();
    });

    test('should fill template variables', async () => {
      // Fill in template variables
      const variableInputs = await page.locator('[data-testid^="variable-input-"]').count();
      
      for (let i = 0; i < variableInputs; i++) {
        const input = page.locator('[data-testid^="variable-input-"]').nth(i);
        const placeholder = await input.getAttribute('placeholder');
        
        // Fill with appropriate test data based on placeholder
        if (placeholder.includes('product')) {
          await input.fill('EcoFlow Water Bottle');
        } else if (placeholder.includes('audience')) {
          await input.fill('environmentally conscious consumers');
        } else if (placeholder.includes('benefit')) {
          await input.fill('100% recyclable, BPA-free, keeps drinks cold for 24 hours');
        } else {
          await input.fill('test value');
        }
      }

      // Verify variables are filled
      await expect(page.locator('[data-testid="variables-complete"]')).toBeVisible();
    });

    test('should select AI providers for comparison', async () => {
      // Check provider selection area
      await expect(page.locator('[data-testid="provider-selection"]')).toBeVisible();

      // Select multiple providers for comparison
      for (const provider of TEST_SCENARIOS.aiGeneration.providers) {
        await page.check(`[data-testid="provider-${provider}"]`);
      }

      // Verify providers are selected
      for (const provider of TEST_SCENARIOS.aiGeneration.providers) {
        await expect(page.locator(`[data-testid="provider-${provider}"]`)).toBeChecked();
      }
    });

    test('should configure AI parameters', async () => {
      // Open advanced parameters panel
      await page.click('[data-testid="advanced-parameters-toggle"]');
      await page.waitForSelector('[data-testid="parameters-panel"]');

      // Set temperature
      const temperatureSlider = page.locator('[data-testid="temperature-slider"]');
      await temperatureSlider.fill(TEST_SCENARIOS.aiGeneration.parameters.temperature.toString());

      // Set max tokens
      const maxTokensInput = page.locator('[data-testid="max-tokens-input"]');
      await maxTokensInput.fill(TEST_SCENARIOS.aiGeneration.parameters.maxTokens.toString());

      // Verify parameters are set
      await expect(temperatureSlider).toHaveValue(
        TEST_SCENARIOS.aiGeneration.parameters.temperature.toString()
      );
      await expect(maxTokensInput).toHaveValue(
        TEST_SCENARIOS.aiGeneration.parameters.maxTokens.toString()
      );
    });

    test('should generate AI responses', async () => {
      // Click generate button
      await page.click('[data-testid="generate-responses-button"]');

      // Wait for loading state
      await expect(page.locator('[data-testid="generation-loading"]')).toBeVisible();

      // Wait for responses to be generated (allow up to 30 seconds)
      await page.waitForSelector('[data-testid="response-results"]', { timeout: 30000 });

      // Verify responses are displayed
      for (const provider of TEST_SCENARIOS.aiGeneration.providers) {
        await expect(page.locator(`[data-testid="response-${provider}"]`)).toBeVisible();
        await expect(page.locator(`[data-testid="response-content-${provider}"]`)).toBeVisible();
        await expect(page.locator(`[data-testid="response-metadata-${provider}"]`)).toBeVisible();
      }
    });

    test('should display response comparison', async () => {
      // Check comparison panel is visible
      await expect(page.locator('[data-testid="response-comparison"]')).toBeVisible();

      // Verify comparison metrics
      await expect(page.locator('[data-testid="response-time-comparison"]')).toBeVisible();
      await expect(page.locator('[data-testid="token-usage-comparison"]')).toBeVisible();
      await expect(page.locator('[data-testid="quality-score-comparison"]')).toBeVisible();

      // Check side-by-side comparison view
      await page.click('[data-testid="side-by-side-view"]');
      await expect(page.locator('[data-testid="comparison-view"]')).toBeVisible();
    });

    test('should rate and evaluate responses', async () => {
      // Rate first response
      const firstRating = page.locator(`[data-testid="rating-${TEST_SCENARIOS.aiGeneration.providers[0]}"]`);
      await firstRating.locator('[data-testid="star-4"]').click();

      // Add evaluation comments
      const evaluationText = page.locator(`[data-testid="evaluation-${TEST_SCENARIOS.aiGeneration.providers[0]}"]`);
      await evaluationText.fill('Good response with clear structure and compelling content.');

      // Submit evaluation
      await page.click(`[data-testid="submit-evaluation-${TEST_SCENARIOS.aiGeneration.providers[0]}"]`);

      // Verify evaluation was saved
      await expect(page.locator('[data-testid="evaluation-saved"]')).toBeVisible();
    });
  });

  describe('Progress Tracking', () => {
    test('should navigate to progress tracker', async () => {
      await page.click('[data-testid="nav-progress-tracker"]');
      await page.waitForSelector('[data-testid="progress-tracker"]');

      // Verify progress tracking components
      await expect(page.locator('[data-testid="progress-overview"]')).toBeVisible();
      await expect(page.locator('[data-testid="achievement-badges"]')).toBeVisible();
      await expect(page.locator('[data-testid="activity-timeline"]')).toBeVisible();
    });

    test('should display user progress metrics', async () => {
      // Check progress metrics are displayed
      await expect(page.locator('[data-testid="templates-used-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="ai-interactions-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="average-quality-score"]')).toBeVisible();

      // Verify metrics show some activity from previous tests
      const templatesUsed = await page.locator('[data-testid="templates-used-count"]').textContent();
      expect(parseInt(templatesUsed)).toBeGreaterThan(0);
    });

    test('should show achievement progress', async () => {
      // Check achievement badges
      const achievements = page.locator('[data-testid="achievement-badge"]');
      expect(await achievements.count()).toBeGreaterThan(0);

      // Verify achievement details
      const firstAchievement = achievements.first();
      await expect(firstAchievement.locator('[data-testid="achievement-title"]')).toBeVisible();
      await expect(firstAchievement.locator('[data-testid="achievement-progress"]')).toBeVisible();
    });
  });

  describe('Community Features', () => {
    test('should navigate to community sharing', async () => {
      await page.click('[data-testid="nav-community"]');
      await page.waitForSelector('[data-testid="community-sharing"]');

      // Verify community components
      await expect(page.locator('[data-testid="shared-templates"]')).toBeVisible();
      await expect(page.locator('[data-testid="community-leaderboard"]')).toBeVisible();
    });

    test('should display shared templates from community', async () => {
      // Check shared templates grid
      const sharedTemplates = page.locator('[data-testid="shared-template-card"]');
      
      if (await sharedTemplates.count() > 0) {
        const firstShared = sharedTemplates.first();
        await expect(firstShared.locator('[data-testid="template-title"]')).toBeVisible();
        await expect(firstShared.locator('[data-testid="shared-by"]')).toBeVisible();
        await expect(firstShared.locator('[data-testid="usage-stats"]')).toBeVisible();
      }
    });
  });

  describe('Responsive Design', () => {
    test('should work on mobile viewport', async () => {
      // Change to mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Navigate to AI playground
      await page.click('[data-testid="nav-ai-playground"]');
      await page.waitForSelector('[data-testid="ai-playground"]');

      // Check mobile navigation
      await expect(page.locator('[data-testid="mobile-nav-toggle"]')).toBeVisible();

      // Verify responsive components
      await expect(page.locator('[data-testid="mobile-template-selector"]')).toBeVisible();
      await expect(page.locator('[data-testid="mobile-provider-tabs"]')).toBeVisible();
    });

    test('should work on tablet viewport', async () => {
      // Change to tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      // Navigate to template library
      await page.click('[data-testid="nav-template-library"]');
      await page.waitForSelector('[data-testid="template-library"]');

      // Verify tablet layout
      await expect(page.locator('[data-testid="template-grid"]')).toBeVisible();
      const templateCards = await page.locator('[data-testid="template-card"]').count();
      expect(templateCards).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async () => {
      // Simulate network failure
      await context.setOffline(true);

      // Try to make a request
      await page.click('[data-testid="nav-template-library"]');

      // Should show offline message
      await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();

      // Restore network
      await context.setOffline(false);

      // Should recover automatically
      await page.waitForSelector('[data-testid="template-library"]', { timeout: 10000 });
    });

    test('should handle API errors gracefully', async () => {
      // Navigate to AI playground
      await page.click('[data-testid="nav-ai-playground"]');
      await page.waitForSelector('[data-testid="ai-playground"]');

      // Try to generate with invalid configuration
      await page.fill('[data-testid="custom-prompt"]', '');
      await page.click('[data-testid="generate-responses-button"]');

      // Should show validation error
      await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    });

    test('should handle authentication expiry', async () => {
      // Mock token expiry by clearing localStorage
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      // Try to access protected page
      await page.goto(`${E2E_CONFIG.baseURL}/ai-playground`);

      // Should redirect to login
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
    });
  });

  describe('Performance and Loading', () => {
    test('should load pages within acceptable time', async () => {
      const startTime = Date.now();
      
      await page.goto(`${E2E_CONFIG.baseURL}/template-library`);
      await page.waitForSelector('[data-testid="template-library"]');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('should show loading states during async operations', async () => {
      // Navigate to AI playground
      await page.goto(`${E2E_CONFIG.baseURL}/ai-playground`);
      await page.waitForSelector('[data-testid="ai-playground"]');

      // Fill required fields quickly
      await page.fill('[data-testid="custom-prompt"]', 'Quick test prompt');
      await page.check('[data-testid="provider-openai"]');

      // Click generate and immediately check for loading state
      await page.click('[data-testid="generate-responses-button"]');
      await expect(page.locator('[data-testid="generation-loading"]')).toBeVisible();
    });
  });

  describe('Data Persistence', () => {
    test('should persist user preferences across sessions', async () => {
      // Set some preferences
      await page.goto(`${E2E_CONFIG.baseURL}/settings`);
      await page.waitForSelector('[data-testid="user-settings"]');

      await page.check('[data-testid="dark-mode-toggle"]');
      await page.selectOption('[data-testid="default-provider"]', 'anthropic');

      // Save preferences
      await page.click('[data-testid="save-preferences"]');

      // Reload page
      await page.reload();
      await page.waitForSelector('[data-testid="user-settings"]');

      // Verify preferences are maintained
      await expect(page.locator('[data-testid="dark-mode-toggle"]')).toBeChecked();
      await expect(page.locator('[data-testid="default-provider"]')).toHaveValue('anthropic');
    });
  });
});