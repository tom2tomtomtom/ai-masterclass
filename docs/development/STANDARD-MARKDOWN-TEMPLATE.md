# STANDARD MARKDOWN TEMPLATE FOR AI MASTERCLASS

**This template ensures consistent parsing, reliable seeding, and perfect UI rendering**

---

## TEMPLATE STRUCTURE

```markdown
# Course Title

## Course Description
[2-3 paragraphs describing the course, learning objectives, and business value]
[Must be 500-1000 characters for proper course overview]
[No emojis or special Unicode characters]

## Lesson 1: Lesson Title Here
[Substantial lesson content with 2000-5000 characters]
[Include practical examples, step-by-step instructions, case studies]
[Focus on business applications and real-world value]
[Use standard markdown formatting only]

## Lesson 2: Next Lesson Title
[Continue with substantial content for each lesson]
[Maintain consistent structure and depth]

## Lesson 3: Another Lesson Title
[Each lesson should provide complete learning value]
[Include actionable takeaways and practical applications]
```

---

## FORMATTING RULES

### ✅ ALLOWED FORMATTING
- Standard headers: # ## ### 
- Bold text: **text**
- Italic text: *text*
- Code blocks: ```language
- Inline code: `code`
- Lists: - item or 1. item
- Links: [text](url)
- Line breaks and paragraphs

### ❌ FORBIDDEN ELEMENTS
- Emojis: 🚀 ✅ ❌ (breaks JSON encoding)
- Special Unicode: • → ← ↑ ↓
- Complex tables with special characters
- HTML tags or entities
- Non-standard markdown extensions
- Excessive special characters

### 📏 CONTENT REQUIREMENTS
- Course Description: 500-1000 characters
- Each Lesson: 2000-5000 characters minimum
- 8-15 lessons per course for comprehensive coverage
- Business-focused content with practical applications
- Clear learning objectives and outcomes

---

## LESSON CONTENT STRUCTURE

Each lesson should follow this internal structure:

```markdown
## Lesson X: Descriptive Title

### Learning Objectives
What students will achieve after completing this lesson.

### Business Context
Real-world problem this lesson solves with specific examples.

### Core Content
Step-by-step instruction with practical examples.
Include case studies, best practices, and implementation details.

### Practical Application
Hands-on exercises or real-world scenarios.
Specific actions students can take immediately.

### Key Takeaways
Summary of main points and actionable insights.
Business impact and ROI considerations.
```

---

## PARSING STRATEGY

The standardized format enables simple, reliable parsing:

```javascript
// Simple regex-based parsing that works consistently
const lessons = content.split(/^## Lesson \d+:/gm)
  .filter(lesson => lesson.trim().length > 0)
  .map(lesson => {
    const lines = lesson.trim().split('\n');
    const title = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();
    
    return {
      title: title,
      content: content,
      wordCount: content.length
    };
  });
```

---

## QUALITY VALIDATION

Before seeding, each file must pass:

1. **Structure Validation**
   - Has course title (single #)
   - Has course description (## Course Description)
   - Has 8+ lessons (## Lesson X: format)

2. **Content Validation**
   - Course description: 500+ characters
   - Each lesson: 2000+ characters
   - No forbidden Unicode characters
   - Proper markdown formatting

3. **Business Value Validation**
   - Practical, actionable content
   - Real-world examples and case studies
   - Clear learning outcomes
   - Professional business focus

---

## IMPLEMENTATION PLAN

### Phase 1: Update Existing Files (Priority Order)
1. ai-foundations-comprehensive.md
2. marketing-analytics-ai-strategy.md  
3. ai-ethics-responsible-ai.md
4. video-generation-mastery-runway-ml.md
5. voice-audio-mastery-elevenlabs.md

### Phase 2: Create Universal Parser
- Single parser handles all standardized files
- Robust error handling and validation
- Content quality verification
- JSON-safe output generation

### Phase 3: Database Integration
- Clean lesson insertion without encoding issues
- Proper content length and formatting
- Reliable UI rendering
- Complete end-to-end testing

### Phase 4: Quality Assurance
- Verify all courses have substantial content
- Test complete user journey
- Validate business value delivery
- Ensure scalable content management

---

## SUCCESS METRICS

**Technical Success:**
- 100% successful parsing of all markdown files
- Zero JSON encoding errors during seeding
- Perfect UI rendering of all content
- Consistent lesson structure across platform

**Content Success:**
- 8-15 comprehensive lessons per course
- 2000+ characters per lesson minimum
- High-quality, business-focused content
- Clear learning progression and outcomes

**Business Success:**
- Professional-grade course content
- Actionable, practical learning materials
- Competitive advantage through content quality
- Scalable content creation and management

This standardized approach will eliminate all seeding issues and ensure consistent, high-quality content delivery across the entire AI Masterclass platform.
