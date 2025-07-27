---
description: Automated Code Cleanup with Enhanced Validation
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Clean Codebase (Enhanced)

<ai_meta>
  <parsing_rules>
    - Process XML blocks for configuration
    - Execute cleanup tasks in priority order
    - Validate changes before committing
    - Create rollback points
  </parsing_rules>
  <cleanup_priorities>
    1. Security vulnerabilities
    2. Build-breaking issues
    3. Test failures
    4. Code style violations
    5. Performance issues
    6. Documentation gaps
  </cleanup_priorities>
</ai_meta>

## Overview

<purpose>
  - Automatically identify and fix code quality issues
  - Maintain consistent code standards
  - Remove technical debt incrementally
  - Ensure codebase health
</purpose>

<context>
  - Part of Claude Productivity Suite Codebase-OS
  - Enhanced with validation and rollback capabilities
  - Integrates with project standards
</context>

<prerequisites>
  - Git repository (for rollback capability)
  - Project standards defined
  - Build and test commands available
</prerequisites>

<process_flow>

<step number="1" name="create_checkpoint">

### Step 1: Create Safety Checkpoint

<step_metadata>
  <action>create git checkpoint</action>
  <purpose>enable rollback if needed</purpose>
</step_metadata>

<checkpoint_actions>
  <git_stash>
    - Stash any uncommitted changes
    - Create cleanup branch: cleanup/automated-[timestamp]
    - Note current commit hash
  </git_stash>
</checkpoint_actions>

<instructions>
  ACTION: Create safety checkpoint
  ENSURE: Can rollback all changes
  DOCUMENT: Starting state
</instructions>

</step>

<step number="2" name="scan_issues">

### Step 2: Scan for Issues

<step_metadata>
  <action>comprehensive code analysis</action>
  <tools>linters, security scanners, test runners</tools>
</step_metadata>

<scan_categories>
  <security>
    <tools>
      - npm audit / yarn audit
      - Security linters
      - Secret scanners
    </tools>
    <priority>critical</priority>
  </security>

  <code_quality>
    <tools>
      - ESLint / TSLint
      - Language-specific linters
      - Complexity analyzers
    </tools>
    <priority>high</priority>
  </code_quality>

  <performance>
    <checks>
      - Bundle size analysis
      - Unused dependencies
      - Duplicate code detection
    </checks>
    <priority>medium</priority>
  </performance>

  <documentation>
    <checks>
      - Missing JSDoc/TSDoc
      - Outdated README sections
      - Missing API documentation
    </checks>
    <priority>low</priority>
  </documentation>
</scan_categories>

<instructions>
  ACTION: Run all scanning tools
  COLLECT: Issues by category and priority
  REPORT: Summary of findings
</instructions>

</step>

<step number="3" name="fix_critical_issues">

### Step 3: Fix Critical Issues
