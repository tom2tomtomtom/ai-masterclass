---
name: fix-common-issues
description: Automatically fix the most common pre-deployment issues
---

Fix these common issues that always come up before deployment:

## 1. Environment Variables
- Find all hardcoded URLs (localhost, API endpoints)
- Replace with process.env variables
- Create .env.example with all required variables
- Add descriptions for each variable

## 2. Error Handling
Look for unhandled errors and fix:
```javascript
// Find patterns like:
fetch(url).then(res => res.json()).then(data => ...)

// Replace with:
fetch(url)
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  })
  .then(data => ...)
  .catch(error => {
    console.error('Error:', error);
    // Show user-friendly error message
  });
```

## 3. Loading States
Find all data fetching without loading indicators:
- Add loading spinners
- Add skeleton screens
- Disable buttons during submission
- Show progress for long operations

## 4. Form Validation
Ensure all forms have:
- Required field validation
- Email format validation
- Password strength indicators
- Error messages below fields
- Success confirmation messages

## 5. Security Headers (for Express/Node apps)
Add if missing:
```javascript
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
```

## 6. Mobile Fixes
- Ensure viewport meta tag exists
- Add touch-friendly button sizes (min 44px)
- Fix horizontal scroll issues
- Ensure text is readable (min 16px)

Report what was fixed and what needs manual attention.
