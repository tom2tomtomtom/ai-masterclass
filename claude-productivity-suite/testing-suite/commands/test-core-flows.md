---
name: test-core-flows
description: Test core user flows with Playwright
---

Test only the most critical user paths that would cause customer complaints if broken:

## Setup
1. Start the development server
2. Open Playwright browser

## Critical Path Tests

### 1. User Can Access The App
- Navigate to homepage
- Verify page loads (no 500 errors)
- Check that main navigation works
- Verify footer links work

### 2. Authentication Flow (if applicable)
Create a test user account:
- Click "Sign Up"
- Fill in: test-${timestamp}@example.com
- Use password: TestPass123!
- Submit form
- Verify success message or redirect
- Try to log in with these credentials
- Verify dashboard/home appears

### 3. Primary Business Function
Test the ONE thing your app must do:

For E-commerce:
- Add item to cart
- Go to checkout
- Verify total is calculated

For SaaS:
- Create a new record/project/item
- Verify it appears in the list
- Open and edit it
- Verify changes are saved

For Content Sites:
- Use search functionality
- Click on a result
- Verify content displays

### 4. Data Persistence
- Create something
- Refresh the page
- Verify it's still there
- Log out and back in
- Verify data persists

### 5. Mobile Responsiveness
- Resize to mobile (375px)
- Check if navigation is usable
- Verify main content is readable
- Test primary action on mobile

## Generate Test File
Save working tests as `tests/core-flows.spec.ts`

Report any broken functionality that blocks deployment.
