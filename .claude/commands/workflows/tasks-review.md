---
name: tasks-review
description: Review all current tasks across the project
---

# Tasks Review

Display and analyze all tasks from the unified tasks.md file.

## Process

### 1. Load Tasks File
Read `.claude-suite/project/tasks.md` if it exists.

### 2. Display Tasks by Priority

#### 🚨 Critical Tasks
Show all tasks marked as CRITICAL or blocking deployment.

#### 🔴 High Priority
Tasks that should be addressed in the current sprint.

#### 🟡 Medium Priority
Important tasks that can wait for next sprint.

#### 🟢 Low Priority
Nice-to-have improvements and optimizations.

### 3. Display Tasks by Source

#### Agent-OS Tasks (Planning & Development)
- Feature implementations
- Spec completions
- Architecture decisions

#### Codebase-OS Tasks (Quality & Maintenance)
- Refactoring needs
- Code cleanup
- Performance optimizations

#### Testing Suite Tasks (Validation & Deployment)
- Missing tests
- Failed test fixes
- Deployment blockers

### 4. Task Statistics

Generate summary:
- Total tasks by priority
- Tasks by age (how long they've been open)
- Tasks by source command
- Overdue tasks (if dates provided)

### 5. Actionable Insights

Provide recommendations:
- Which tasks to tackle first
- Tasks that might be outdated
- Dependencies between tasks
- Quick wins vs long-term improvements

## Output Format

```markdown
# Task Review Summary

Generated: [timestamp]

## 🚨 Critical Tasks (X)
1. [Task description] - Added: [date] by [command]
2. ...

## 🔴 High Priority (X)
...

## 🟡 Medium Priority (X)
...

## 🟢 Low Priority (X)
...

## 📊 Statistics
- Total Tasks: X
- Average Age: X days
- Oldest Task: [description] (X days old)

## 🎯 Recommended Actions
1. Start with: [specific task]
2. Quick wins: [list of easy tasks]
3. Consider removing: [potentially outdated tasks]
```

## Example Usage

```bash
/tasks-review
# Shows all tasks organized by priority

/tasks-review --source codebase-os
# Shows only code quality tasks

/tasks-review --age 30
# Shows tasks older than 30 days
```
