# Claude Code Prompts: AI Masterclass Technical Repair

## Phase 1: Structure Analysis and Mapping

### Prompt 1.1: Initial Syntax Error Analysis
```
I need you to analyze the JavaScript syntax errors in the AI Masterclass seed file. Please:

1. Run syntax validation on `/users/thomasdowuona-hyde/AI-Masterclass/backend/seed-complete-courses.js`
2. Create a comprehensive error log with line numbers and error types
3. Identify the pattern of errors (are they all similar structural issues?)
4. Generate a summary report of:
   - Total number of syntax errors found
   - Most common error patterns
   - Estimated scope of fixes needed

Save the error analysis to `syntax-analysis-report.md` and provide a summary of what you found.
```

### Prompt 1.2: Lesson Boundary Mapping
```
Analyze the lesson object structure in the seed file to map content boundaries:

1. Search for all lesson object starts (lines containing `title:` in lesson context)
2. Find all template literal closures (lines ending with just a backtick)
3. Identify content that appears outside proper lesson object boundaries
4. Create a mapping file `lesson-boundaries.json` with:
   - Lesson start lines
   - Expected end lines
   - Orphaned content locations
   - Missing object closures

Provide a summary of how many lessons need structure repair and what types of issues you found.
```

### Prompt 1.3: Content Inventory and Validation
```
Create a complete inventory of the premium content to ensure nothing is lost during repairs:

1. Extract all educational content (lesson titles, descriptions, main content) from the seed file
2. Count total words and characters of actual learning content
3. Identify all code examples, templates, and special formatting
4. Create a content manifest `content-inventory.json` with:
   - Total word count
   - Number of lessons identified
   - Special content types (code blocks, templates, etc.)
   - Content that appears to be outside proper structure

This will be our baseline to ensure no content is lost during repairs.
```

## Phase 2: Systematic Structure Repair

### Prompt 2.1: Create Repair Utilities
```
Create utility scripts to help with systematic repairs:

1. Build `lesson-structure-fixer.js` that can:
   - Take a lesson object with malformed structure
   - Extract the content properly
   - Reconstruct it with proper JavaScript object structure
   - Validate the result

2. Create `content-boundary-detector.js` that can:
   - Identify where lesson content should start and end
   - Detect orphaned content between lessons
   - Suggest proper object boundaries

3. Build `progressive-validator.js` that can:
   - Test syntax after each fix
   - Roll back if syntax breaks
   - Track progress through the file

Test these utilities on a small section first to ensure they work correctly.
```

### Prompt 2.2: Fix First 10 Lesson Objects
```
Using your repair utilities, systematically fix the first 10 lesson objects in the seed file:

1. Start from the beginning of the lessonsData array
2. For each lesson object that has structural issues:
   - Extract the content properly
   - Ensure proper JavaScript object structure
   - Validate syntax after each fix
   - Preserve all educational content exactly

3. After fixing each lesson, run syntax validation
4. Create backups before each major change
5. Document what was fixed in each lesson

Provide a progress report showing which lessons were fixed and what types of repairs were needed.
```

### Prompt 2.3: Fix Lessons 11-30
```
Continue the systematic repair process for lessons 11-30:

1. Apply the same repair methodology you used for the first 10 lessons
2. Look for patterns in the types of fixes needed
3. Refine your repair utilities if you discover new error patterns
4. Maintain detailed logs of all changes made
5. Validate syntax after every 5 lessons to catch issues early

If you encounter new types of structural problems, document them and create solutions before proceeding.
```

### Prompt 2.4: Complete Remaining Lesson Repairs
```
Finish repairing all remaining lesson objects in the seed file:

1. Continue systematic repairs through the entire file
2. Pay special attention to complex lessons with embedded code examples
3. Ensure all template literals are properly closed within object boundaries
4. Validate that no content has been lost or corrupted
5. Run final syntax validation on the complete file

When complete, the file should:
- Pass `node -c seed-complete-courses.js` without errors
- Contain all original educational content
- Have proper JavaScript object structure throughout
```

## Phase 3: Content Integrity Verification

### Prompt 3.1: Content Preservation Verification
```
Verify that all educational content has been preserved during the repairs:

1. Compare the original content inventory (from Prompt 1.3) with the fixed file
2. Extract all educational content from the repaired file
3. Verify word counts match (allowing for minor formatting differences)
4. Check that all lesson titles, descriptions, and learning objectives are intact
5. Ensure all code examples and templates are preserved

Create a verification report showing:
- Original vs. fixed content statistics
- Any content that appears to be missing or altered
- Confirmation that all 206K+ words are still present
```

### Prompt 3.2: Database Seeding Test
```
Test that the repaired seed file can successfully populate the database:

1. Run the seed file: `node seed-complete-courses.js`
2. Verify it completes without errors
3. Check the database to confirm:
   - All courses were created
   - All modules were created
   - All lessons were inserted with complete content
   - Progress tracking tables are properly set up

4. Query the database to verify content integrity:
   - Count total lessons (should be 50+ for full premium content)
   - Sample check lesson content for completeness
   - Verify all metadata fields are populated

Document any issues found and the resolution steps.
```

### Prompt 3.3: Advanced Content Verification
```
Perform detailed verification of premium content elements:

1. Verify specific high-value content sections are present:
   - Microsoft 365 AI Suite modules
   - Agent Stack Fundamentals
   - Platform Setup Guides
   - Business Templates references
   - Tool Comparison Matrix content

2. Check that all learning objectives and metadata are properly structured
3. Verify code examples display correctly
4. Test that lesson progression logic works with the complete content set

Create a detailed content audit report confirming the platform contains all expected premium elements.
```

## Phase 4: System Integration Testing

### Prompt 4.1: Frontend Integration Testing
```
Test that the frontend properly displays all the repaired premium content:

1. Start the development server: `npm run dev`
2. Test the complete user journey:
   - User registration/login
   - Course navigation and access
   - Lesson content display and formatting
   - Progress tracking functionality

3. Verify specific elements:
   - All 6 courses appear in the interface
   - Lesson content renders correctly with proper formatting
   - Code examples display properly
   - Learning objectives and metadata show correctly

4. Test with different user types and permissions
5. Verify responsive design works with full content

Document any frontend issues and their resolutions.
```

### Prompt 4.2: Performance and Scalability Testing
```
Test platform performance with the complete premium content load:

1. Measure page load times with full lesson content
2. Test database query performance with 50+ lessons
3. Verify search functionality works efficiently
4. Test concurrent user access (simulate multiple users)

5. Performance benchmarks to meet:
   - Course listing page: <2 seconds
   - Individual lesson loading: <3 seconds
   - Search results: <1 second
   - Progress updates: <500ms

If performance issues are found, implement optimizations:
- Database indexing
- Content pagination
- Lazy loading for large lessons
- Query optimization

Provide performance report with before/after metrics.
```

### Prompt 4.3: Resource Integration Testing
```
Verify that all premium resources (templates, guides, etc.) are properly accessible:

1. Test resource serving endpoints for all 220+ premium resources
2. Verify file downloads work correctly
3. Test resource categorization and search
4. Confirm resource access permissions work properly

5. Test specific resource categories:
   - Business Templates (22 templates)
   - Platform Setup Guides (5 guides)
   - Prompt Libraries (250+ prompts)
   - Automation Scripts (20+ scripts)

6. Verify resource integration with lesson content:
   - Links from lessons to resources work
   - Resource previews display correctly
   - Download tracking functions properly

Create a resource integration report confirming all premium resources are accessible and functional.
```

## Phase 5: Final Validation and Production Readiness

### Prompt 5.1: End-to-End System Validation
```
Perform comprehensive end-to-end testing of the complete platform:

1. Complete user journey testing:
   - New user registration
   - Course enrollment and access
   - Lesson progression through multiple courses
   - Resource downloads and usage
   - Progress tracking and completion

2. Administrative functions:
   - User management
   - Content updates
   - Progress reporting
   - System monitoring

3. Edge case testing:
   - Interrupted lesson sessions
   - Multiple device access
   - Concurrent user scenarios
   - Error recovery scenarios

Document all test results and confirm the platform is ready for production deployment.
```

### Prompt 5.2: Production Deployment Preparation
```
Prepare the platform for production deployment:

1. Create production environment configuration:
   - Environment variables for production
   - Database migration scripts
   - Security configurations
   - Performance optimizations

2. Create deployment documentation:
   - Step-by-step deployment guide
   - Configuration requirements
   - Monitoring and maintenance procedures
   - Troubleshooting guide

3. Verify all premium content is properly categorized for pricing tiers
4. Confirm user access controls work correctly
5. Test payment integration points (if applicable)

Provide a production readiness checklist and deployment guide.
```

### Prompt 5.3: Final Quality Assurance
```
Conduct final quality assurance of the complete platform:

1. Content quality review:
   - All 206K+ words of content are accessible
   - No formatting or display issues
   - All learning objectives are clear and achievable
   - Code examples work correctly

2. User experience validation:
   - Navigation is intuitive
   - Content progression is logical
   - Resource access is seamless
   - Platform performs within acceptable limits

3. Business value confirmation:
   - All premium features are functional
   - Content justifies premium pricing ($2,997+)
   - Platform provides complete agency transformation capability
   - Competitive advantages are clearly demonstrated

Create a final quality assurance report confirming the platform meets all requirements for premium market launch.
```

## Emergency Recovery Prompts

### If Something Goes Wrong: Content Recovery
```
If content appears to be lost or corrupted during repairs:

1. Immediately stop the repair process
2. Restore from the most recent backup
3. Analyze what went wrong in the repair process
4. Adjust the repair methodology to prevent the issue
5. Resume repairs with more conservative approach

Always prioritize content preservation over speed of repair.
```

### If Something Goes Wrong: Syntax Issues Persist
```
If syntax errors persist after repairs:

1. Isolate the problematic sections
2. Extract the content from those sections manually
3. Rebuild the lesson objects from scratch using proper structure
4. Test each rebuilt section individually
5. Integrate back into the main file only after validation

Focus on getting clean, working code rather than preserving the exact original structure.
```

## Progress Tracking

After each prompt completion, provide:
- ✅ Tasks completed successfully
- ⚠️ Issues encountered and resolutions
- 📊 Progress metrics (lessons fixed, content verified, etc.)
- 🔄 Next steps and dependencies

This systematic approach ensures the complete premium platform is properly deployed with all 206K+ words of content accessible and fully functional.