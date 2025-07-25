---
name: tasks-report
description: Generate detailed task analytics and reports
---

# Tasks Report

Generate comprehensive reports and analytics from the tasks.md file.

## Report Types

### 1. Executive Summary
High-level overview for project stakeholders:
- Total tasks and completion rate
- Critical issues count
- Estimated effort remaining
- Health score based on task age/priority

### 2. Technical Debt Report
Focus on code quality and maintenance:
- Refactoring tasks breakdown
- Technical debt by module
- Complexity reduction opportunities
- Performance optimization tasks

### 3. Sprint Planning Report
For development planning:
- Tasks by estimated effort
- Dependencies between tasks
- Suggested sprint allocation
- Quick wins vs long-term projects

### 4. Progress Tracking Report
Historical analysis:
- Tasks completed over time
- Velocity trends
- Task age distribution
- Bottleneck identification

## Analytics Generated

### Task Distribution
```
Priority Distribution:
🚨 Critical: ████████░░ 40% (4 tasks)
🔴 High:     ██████░░░░ 30% (3 tasks)
🟡 Medium:   ████░░░░░░ 20% (2 tasks)
🟢 Low:      ██░░░░░░░░ 10% (1 task)

Source Distribution:
🤖 Agent-OS:    ██████░░░░ 50% (5 tasks)
🧹 Codebase-OS: ████░░░░░░ 30% (3 tasks)
🧪 Testing:     ██░░░░░░░░ 20% (2 tasks)
```

### Task Age Analysis
```
Task Age:
< 1 day:   ████████░░ 40%
1-7 days:  ████░░░░░░ 20%
1-2 weeks: ████░░░░░░ 20%
> 2 weeks: ████░░░░░░ 20% ⚠️
```

### Effort Estimation
Based on task complexity and type:
- Simple fixes: 1-2 hours
- Refactoring: 2-4 hours
- New features: 4-8 hours
- Major changes: 8+ hours

## Report Formats

### 1. Markdown Report (Default)
```markdown
# Task Analysis Report
Generated: 2024-01-15 14:30

## Executive Summary
- Total Tasks: 10
- Critical Issues: 2
- Estimated Effort: 24 hours
- Health Score: 7.5/10

## Detailed Analysis
[Full breakdown by category]
```

### 2. JSON Export (--json flag)
```json
{
  "generated": "2024-01-15T14:30:00Z",
  "summary": {
    "total": 10,
    "byPriority": {...},
    "bySource": {...}
  },
  "tasks": [...]
}
```

### 3. CSV Export (--csv flag)
For spreadsheet analysis:
```csv
Priority,Source,Description,Added,Age(days),EstimatedHours
CRITICAL,analyze-codebase,"Fix security vulnerability",2024-01-10,5,2
HIGH,test-core-flows,"Add login tests",2024-01-12,3,4
```

## Insights and Recommendations

### Automated Insights
- **Aging Tasks**: Alert when tasks > 14 days old
- **Priority Imbalance**: Too many critical tasks
- **Source Imbalance**: One system generating most tasks
- **Quick Wins**: Identify tasks < 1 hour effort

### Actionable Recommendations
1. **Immediate Actions**: Critical tasks to address
2. **Sprint Planning**: Suggested task groupings
3. **Technical Debt**: When to schedule refactoring
4. **Process Improvements**: Patterns in task generation

## Visualization Options

### Terminal Charts
```
Task Completion Trend (Last 7 Days):
Mon: ████████████ 12 completed
Tue: ████████ 8 completed
Wed: ██████████ 10 completed
Thu: ████████████████ 16 completed
Fri: ██████ 6 completed
Sat: ████ 4 completed
Sun: ██ 2 completed
```

### HTML Report (--html flag)
Generates interactive dashboard with:
- Charts using Chart.js
- Filterable task table
- Trend visualizations
- Export options

## Example Usage

```bash
/tasks-report
# Generate standard markdown report

/tasks-report --type sprint-planning
# Focus on next sprint tasks

/tasks-report --json --output tasks-analysis.json
# Export for external tools

/tasks-report --last 30
# Analyze last 30 days of task data

/tasks-report --html --open
# Generate and open HTML dashboard
```

## Integration Examples

### GitHub Issues
```bash
/tasks-report --format github
# Generates issue-ready format

# Output:
## Security: Fix SQL injection in auth
Labels: bug, security, critical
Milestone: v1.2.0
Assignee: @security-team

Description: SQL injection vulnerability found...
```

### Jira Export
```bash
/tasks-report --format jira-csv
# Creates Jira-compatible CSV import
```

### Slack Summary
```bash
/tasks-report --format slack
# Generates formatted message for Slack
```
