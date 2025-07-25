---
name: tasks-cleanup
description: Clean up completed tasks and organize the tasks file
---

# Tasks Cleanup

Maintain the tasks.md file by removing completed tasks and reorganizing.

## Process

### 1. Identify Completed Tasks

Check for tasks that can be marked as complete:
- Build tasks: Check if code exists
- Test tasks: Run tests to verify
- Refactor tasks: Check if complexity improved
- Bug fix tasks: Verify fix is in place

### 2. Archive Completed Tasks

Move completed tasks to `.claude-suite/project/tasks-archive.md`:
```markdown
## Completed Tasks - [Date]

### From Development
- [x] Implement user authentication - Completed: 2024-01-15
- [x] Create API endpoints - Completed: 2024-01-15

### From Quality
- [x] Refactor UserService - Completed: 2024-01-16
  - Complexity reduced from 15 to 8
```

### 3. Remove Duplicate Tasks

Identify and merge duplicate or similar tasks:
- Same file mentioned multiple times
- Similar refactoring requests
- Overlapping test requirements

### 4. Update Task Priorities

Re-evaluate priorities based on:
- Age of task (old tasks might be more urgent)
- Dependencies (some tasks block others)
- Project phase (deployment tasks more urgent near release)

### 5. Reorganize by Category

Ensure tasks are in the correct sections:
- Move test tasks to Testing section
- Move refactoring to Quality section
- Move feature tasks to Development section

### 6. Update Metadata

- Recalculate task counts
- Update last modified timestamp
- Add notes about cleanup performed

## Cleanup Actions

### Safe Cleanup (Default)
- Archive obviously completed tasks
- Remove exact duplicates
- Update statistics

### Deep Cleanup (--deep flag)
- Verify each task programmatically
- Check if referenced files still exist
- Test if mentioned bugs still occur
- Remove tasks for deleted code

### Interactive Cleanup (--interactive flag)
- Ask about each task
- Allow manual completion marking
- Get context for ambiguous tasks

## Output Format

```markdown
# Task Cleanup Report

Cleanup performed: [timestamp]

## 📦 Archived Tasks (X)
- Implement user authentication (verified: code exists)
- Fix login bug (verified: tests pass)
- ...

## 🔄 Merged Duplicates (X)
- "Refactor auth module" merged with "Clean up auth code"
- ...

## ❌ Removed Obsolete (X)
- Task for deleted feature
- ...

## 📊 Cleanup Statistics
- Tasks before: X
- Tasks after: Y
- Tasks archived: Z
- Duplicates removed: A

## Updated tasks.md
[Shows the cleaned up tasks file]
```

## Example Usage

```bash
/tasks-cleanup
# Safe cleanup with archiving

/tasks-cleanup --deep
# Verify each task programmatically

/tasks-cleanup --interactive
# Ask about ambiguous tasks

/tasks-cleanup --dry-run
# Show what would be cleaned up without doing it
```
