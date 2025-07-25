# Task Management System

This directory contains the unified task management system for Claude Productivity Suite.

## Overview

All commands in the suite now contribute to a single `tasks.md` file located at:
`.claude-suite/project/tasks.md`

## Task Management Commands

### /tasks-review
Review all current tasks organized by priority and source.

### /tasks-cleanup
Clean up completed tasks and reorganize the task file.

### /tasks-report
Generate detailed analytics and reports from task data.

## Task Format

Tasks follow this structure:
```markdown
- [ ] [PRIORITY] Task description
  - Source: /command-name
  - Added: YYYY-MM-DD HH:MM
  - Details: Additional context
  - Estimate: X hours (optional)
```

## Priority Levels

- 🚨 **CRITICAL**: Blocks deployment or causes data loss
- 🔴 **HIGH**: Important functionality or security issues
- 🟡 **MEDIUM**: Performance, refactoring, or enhancement
- 🟢 **LOW**: Nice-to-have improvements

## Integration

All commands automatically append to the unified tasks.md when they identify actionable items:
- Agent-OS: Development tasks
- Codebase-OS: Quality improvements
- Testing Suite: Test coverage and fixes

## Best Practices

1. Review tasks daily with `/tasks-review`
2. Clean up weekly with `/tasks-cleanup`
3. Generate reports for sprint planning with `/tasks-report`
4. Commit tasks.md to git for team visibility
