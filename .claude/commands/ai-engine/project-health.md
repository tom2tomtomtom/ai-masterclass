---
name: project-health
description: Visual dashboard showing your project's health and progress
---

# Project Health Dashboard - See Everything at a Glance

Get a beautiful visual overview of your project's health, progress, and what needs attention.

## The Dashboard

```bash
/project-health
```

```markdown
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              🏥 PROJECT HEALTH DASHBOARD                      ┃
┃                                                              ┃
┃  Project: Customer Portal        Status: 🟢 Healthy          ┃
┃  Started: 3 days ago            Progress: 68%                ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

📊 OVERALL HEALTH SCORE: 85/100 ━━━━━━━━━━━━━━━━━━━━ ✨

🎯 FEATURE PROGRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ User Authentication    [████████████████████] 100% ✓
✅ Dashboard              [████████████████████] 100% ✓  
🔄 Invoice Management     [████████████░░░░░░░░] 60%  🚧
⏳ Payment Integration    [████░░░░░░░░░░░░░░░░] 20%  📅
⬜ Email Notifications    [░░░░░░░░░░░░░░░░░░░░] 0%   🔜
⬜ Analytics Dashboard    [░░░░░░░░░░░░░░░░░░░░] 0%   🔜

📈 CODE QUALITY METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 Test Coverage         [████████████████░░░░] 82%  ✅
📏 Code Complexity       [██████░░░░░░░░░░░░░░] 28%  ✅
🐛 Bug Density          [██░░░░░░░░░░░░░░░░░░] 8%   ✅
📚 Documentation        [██████████████░░░░░░] 71%  ⚠️
🔒 Security Score       [████████████████████] 95%  ✅

⚡ PERFORMANCE METRICS  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Page Load Speed      2.3s  ✅ (Target: <3s)
📦 Bundle Size          423KB ✅ (Target: <500KB)
🔄 API Response Time    89ms  ✅ (Target: <200ms)
💾 Memory Usage         124MB ✅ (Target: <256MB)

🚨 IMMEDIATE ATTENTION NEEDED (3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ CRITICAL: Security vulnerability in dependency
   → Run: /fix-this "security vulnerability"
   
⚠️  HIGH: Missing tests for payment module  
   → Run: /generate-tests "payment module"
   
⚠️  MEDIUM: API endpoint needs optimization
   → Run: /optimize "GET /api/invoices"

📅 UPCOMING MILESTONES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Today:        Complete invoice filtering
📍 Tomorrow:     Start payment integration  
📍 This Week:    Deploy v0.2.0 to staging
📍 Next Week:    User acceptance testing

💡 SUGGESTED NEXT ACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Based on your progress, I recommend:
→ /implement-feature "invoice filtering"
  This will complete the Invoice Management feature (2 hours)
```

## Health Indicators Explained

### 🟢 Green (Healthy)
- All systems functioning well
- No critical issues
- Good code quality
- On track with timeline

### 🟡 Yellow (Needs Attention)
- Minor issues present
- Some optimization needed
- Slightly behind schedule
- Non-critical warnings

### 🔴 Red (Critical)
- Major issues blocking progress
- Security vulnerabilities
- Failing tests
- Severely behind schedule

## Detailed Breakdowns

### Feature Progress View
```bash
/project-health --features

📋 FEATURE BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔐 User Authentication (100% Complete)
├─ ✅ Registration flow
├─ ✅ Login/Logout
├─ ✅ Password reset
├─ ✅ Session management
└─ ✅ Tests (15/15 passing)

📄 Invoice Management (60% Complete)  
├─ ✅ Invoice creation
├─ ✅ Invoice listing
├─ 🔄 Invoice filtering (in progress)
├─ ⬜ Invoice export
└─ ⚠️ Tests (8/15 passing)
```

### Quality Metrics Deep Dive
```bash
/project-health --quality

🔍 CODE QUALITY ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Complexity Breakdown:
├─ Simple functions (< 5):     67% ✅
├─ Moderate functions (5-10):  28% ✅
├─ Complex functions (> 10):    5% ⚠️
│  └─ processInvoice() - Consider refactoring
│  └─ calculateTax() - Consider splitting

🧪 Test Coverage by Module:
├─ Auth:        95% ✅
├─ Dashboard:   88% ✅
├─ Invoices:    72% ⚠️ (needs improvement)
├─ Payments:    45% ❌ (critical)
└─ Utils:       91% ✅
```

### Timeline View
```bash
/project-health --timeline

📅 PROJECT TIMELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Week 1 ████████████████████ Complete
Week 2 ████████████░░░░░░░ In Progress (Day 3/7)
Week 3 ░░░░░░░░░░░░░░░░░░░ Upcoming
Week 4 ░░░░░░░░░░░░░░░░░░░ Planned

Velocity: 12 features/week (trending ↗️)
Estimated completion: 11 days
Risk level: Low 🟢
```

## Real-Time Monitoring

### Live Updates
The dashboard updates as you work:
```markdown
🔔 Real-time update: Test coverage increased to 84% ↗️
🔔 New task completed: "Add user profile page" ✅
🔔 Build status: Passing ✅
```

### Trend Analysis
```bash
/project-health --trends

📈 7-DAY TRENDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Code Quality Score:
Day 1: ▁ 65%
Day 2: ▃ 72%
Day 3: ▅ 78%
Day 4: ▆ 81%
Day 5: ▇ 83%
Day 6: █ 85%
Today: █ 85% (stable)

Features Completed:
Mon: ██ 2
Tue: ████ 4
Wed: ███ 3
Thu: █████ 5
Fri: ████ 4
Sat: ██ 2
Sun: █ 1
```

## Smart Insights

### AI-Powered Recommendations
```markdown
🤖 INSIGHTS & RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Performance Tip:
   Your API calls could be 40% faster with caching
   → Run: /optimize-performance --add-caching

💡 Security Notice:
   Enable 2FA for better security score
   → Run: /add-feature "two-factor-auth"

💡 Quality Improvement:
   Adding 5 more tests would reach 90% coverage
   → Run: /generate-tests --missing-coverage

💡 Time Saver:
   Similar code in 3 files could be extracted
   → Run: /refactor-smart --extract-common
```

## Deployment Readiness

```bash
/project-health --deployment

🚀 DEPLOYMENT READINESS CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pre-Deployment Checklist:
✅ All tests passing (42/42)
✅ No console.log statements
✅ Environment variables set
✅ Build size optimized
⚠️ Documentation needs update
❌ Missing performance tests

Deployment Score: 83/100 

Ready to deploy? Almost! Fix these first:
1. Update API documentation
2. Add performance tests
3. Run /pre-deploy-check

Estimated time to ready: 45 minutes
```

## Team View (Multi-Developer)

```bash
/project-health --team

👥 TEAM ACTIVITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Active Now:
🟢 You - Working on: Invoice filtering
🟢 AI Assistant - Running: Code analysis

Recent Activity:
├─ 10 min ago: Fixed authentication bug
├─ 25 min ago: Added invoice creation
├─ 1 hour ago: Updated dashboard UI
└─ 2 hours ago: Improved test coverage

Code Ownership:
├─ Auth module: 100% (You)
├─ Dashboard: 100% (You)
├─ Invoices: 85% (You), 15% (AI)
└─ Tests: 60% (You), 40% (AI)
```

## Celebration Mode

When you hit milestones:
```markdown
🎉 MILESTONE ACHIEVED! 🎉
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ First Feature Complete! ✨

You've successfully completed your first feature!
Time taken: 2 hours 15 minutes
Code quality: A+
Tests: 100% coverage

🏆 Achievement Unlocked: "Feature Shipper"

Keep up the great work! Next milestone in 3 features.
```

## Export Options

### Generate Reports
```bash
/project-health --export pdf
📄 Generated: project-health-report-2024-01-15.pdf

/project-health --export markdown
📝 Generated: project-health-report.md

/project-health --share
🔗 Shareable link: https://health.app/report/abc123
```

## Customization

### Set Your Preferences
```bash
/project-health --configure

What matters most to you?
1. [x] Code Quality
2. [x] Test Coverage
3. [ ] Performance
4. [x] Security
5. [ ] Documentation

Update frequency?
- ( ) Real-time
- (•) Every hour
- ( ) Daily summary
```

## Mobile View

Access from anywhere:
```
/project-health --mobile

📱 MOBILE DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━

Health: 85% 🟢
Progress: 68%
Tasks: 12 remaining

▼ Critical Issues (1)
  Security fix needed

▼ Today's Focus
  Complete invoices

▼ Quick Actions
  [Test] [Deploy] [Help]
```

Start monitoring your project health:
```bash
/project-health
```

Knowledge is power - see everything, fix anything! 🏥✨
