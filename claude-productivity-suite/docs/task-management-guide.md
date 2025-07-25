# 📋 Unified Task Management System

The Claude Productivity Suite now includes a unified task management system that consolidates all actionable items from every command into a single `tasks.md` file.

## Overview

All commands in the suite now generate tasks when they identify actionable items:
- **Agent-OS**: Development tasks from planning and specs
- **Codebase-OS**: Quality improvements and refactoring needs  
- **Testing Suite**: Test coverage gaps and deployment blockers

## Task Location

All tasks are stored in: `.claude-suite/project/tasks.md`

## Task Format

```markdown
- [ ] [PRIORITY] Task description
  - Source: /command-name
  - Added: YYYY-MM-DD HH:MM
  - Details: Additional context
  - Estimate: X hours (optional)
  - File: path/to/file.ts (if applicable)
```

## Priority Levels

- 🚨 **CRITICAL**: Blocks deployment, security vulnerabilities, data loss risks
- 🔴 **HIGH**: Important functionality, broken features, major bugs
- 🟡 **MEDIUM**: Performance issues, refactoring, enhancements
- 🟢 **LOW**: Nice-to-have improvements, documentation, style issues

## Task Management Commands

### `/tasks-review`
View all current tasks organized by priority and source.
```bash
/tasks-review                    # Show all tasks
/tasks-review --source codebase  # Show only code quality tasks
/tasks-review --priority high    # Show only high priority tasks
```

### `/tasks-cleanup`
Clean up completed tasks and reorganize the task file.
```bash
/tasks-cleanup                   # Safe cleanup with archiving
/tasks-cleanup --deep           # Verify each task programmatically
/tasks-cleanup --interactive    # Ask about ambiguous tasks
```

### `/tasks-report`
Generate analytics and reports from task data.
```bash
/tasks-report                    # Standard markdown report
/tasks-report --type sprint     # Sprint planning report
/tasks-report --json            # Export as JSON
/tasks-report --html            # Interactive dashboard
```

## Commands That Generate Tasks

### Agent-OS
- `/plan-product` - Creates development tasks for each phase
- `/create-spec` - Generates implementation tasks
- `/analyze-product` - Identifies missing features or improvements

### Codebase-OS  
- `/analyze-codebase` - Creates tasks for code quality issues
- `/clean-codebase` - Logs tasks for manual cleanup needs
- `/refactor-smart` - Identifies refactoring opportunities

### Testing Suite
- `/pre-deploy-check` - Critical tasks that block deployment
- `/test-core-flows` - Missing test coverage tasks
- `/fix-and-test` - Comprehensive issue list

## Workflow Integration

### Daily Workflow
```bash
# Morning
/tasks-review                    # See what needs doing today

# During Development
/analyze-codebase               # Generates quality tasks
/pre-deploy-check              # Generates deployment blockers

# End of Day
/tasks-cleanup --dry-run       # See what can be marked complete
```

### Weekly Maintenance
```bash
# Monday
/tasks-report --type sprint    # Plan the week

# Friday
/tasks-cleanup                 # Archive completed work
/tasks-report                  # Weekly summary
```

## Best Practices

1. **Review Daily**: Start each day with `/tasks-review`
2. **Clean Weekly**: Run `/tasks-cleanup` at week's end
3. **Track Progress**: Use `/tasks-report` for sprint planning
4. **Commit tasks.md**: Share task list with your team
5. **Set Estimates**: Add time estimates for better planning

## Example Task File

```markdown
# Project Tasks

> Unified task tracking for all Claude Productivity Suite systems
> Last Updated: 2024-01-15 14:30

## 🚨 Critical Tasks

- [ ] [CRITICAL] Fix SQL injection vulnerability in auth module
  - Source: /analyze-codebase
  - Added: 2024-01-15 10:00
  - File: src/auth/login.ts:45
  - Details: Unsanitized user input in query
  - Estimate: 2 hours

## 🔴 High Priority Tasks

### Development (Agent-OS)
- [ ] [HIGH] Implement password reset flow
  - Source: /plan-product
  - Added: 2024-01-14 15:00
  - Details: Email-based reset with tokens
  - Estimate: 6 hours

### Code Quality (Codebase-OS)
- [ ] [HIGH] Refactor UserService class (complexity: 18)
  - Source: /analyze-codebase
  - Added: 2024-01-15 10:00
  - File: src/services/UserService.ts
  - Details: Split into smaller methods
  - Estimate: 4 hours

## 📊 Task Statistics
- **Total Tasks**: 2
- **Critical**: 1 | **High**: 1 | **Medium**: 0 | **Low**: 0
```

## Integration with External Tools

The task format is designed to be easily parsed for integration:

### GitHub Issues
```bash
/tasks-report --format github
```

### Jira
```bash
/tasks-report --format jira-csv
```

### Custom Scripts
The JSON export can be processed by custom scripts:
```bash
/tasks-report --json | jq '.tasks[] | select(.priority=="CRITICAL")'
```

## Troubleshooting

### Tasks Not Appearing
- Ensure `.claude-suite/project/` directory exists
- Check command output for task generation confirmation
- Verify file permissions on tasks.md

### Duplicate Tasks
- Run `/tasks-cleanup` to merge duplicates
- Use `--deep` flag for thorough deduplication

### Task File Too Large
- Archive old tasks with `/tasks-cleanup`
- Completed tasks move to `tasks-archive.md`
- Consider breaking into sprints

## Future Enhancements

Planned features:
- Task dependencies
- Team assignment
- Due dates and reminders
- Burndown charts
- AI-powered task prioritization

The unified task system transforms analysis into action, making the Claude Productivity Suite a complete development workflow solution!
