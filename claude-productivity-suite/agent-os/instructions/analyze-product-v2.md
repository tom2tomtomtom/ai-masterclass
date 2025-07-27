---
description: Analyze Current Product & Install Claude Suite Standards
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Analyze Current Product & Install Claude Suite Standards

<ai_meta>
  <parsing_rules>
    - Process XML blocks first for structured data
    - Execute instructions in sequential order
    - Use templates as exact patterns
    - Analyze existing code before generating documentation
  </parsing_rules>
  <file_conventions>
    - encoding: UTF-8
    - line_endings: LF
    - indent: 2 spaces
    - markdown_headers: no indentation
  </file_conventions>
</ai_meta>

## Overview

<purpose>
  - Install Claude Productivity Suite into an existing codebase
  - Analyze current product state and progress
  - Generate documentation that reflects actual implementation
  - Preserve existing architectural decisions
  - Set up three-layer context system
</purpose>

<context>
  - Part of Claude Productivity Suite framework
  - Used when retrofitting suite to established products
  - Enhanced with Agent-OS patterns for better structure
</context>

<prerequisites>
  - Existing product codebase
  - Write access to project root
  - Access to suite instructions and standards
</prerequisites>

<process_flow>

<step number="1" name="analyze_existing_codebase">

### Step 1: Analyze Existing Codebase

<step_metadata>
  <action>deep codebase analysis</action>
  <purpose>understand current state before documentation</purpose>
</step_metadata>

<analysis_areas>
  <project_structure>
    - Directory organization
    - File naming patterns
    - Module structure
    - Build configuration
  </project_structure>
  <technology_stack>
    - Frameworks in use
    - Dependencies (package.json, Gemfile, requirements.txt, etc.)
    - Database systems
    - Infrastructure configuration
  </technology_stack>
  <implementation_progress>
    - Completed features
    - Work in progress
    - Authentication/authorization state
    - API endpoints
    - Database schema
  </implementation_progress>
  <code_patterns>
    - Coding style in use
    - Naming conventions
    - File organization patterns
    - Testing approach
  </code_patterns>
</analysis_areas>

<instructions>
  ACTION: Thoroughly analyze the existing codebase
  DOCUMENT: Current technologies, features, and patterns
  IDENTIFY: Architectural decisions already made
  NOTE: Development progress and completed work
</instructions>

</step>

<step number="2" name="create_suite_structure">

### Step 2: Create Claude Suite Structure

<step_metadata>
  <creates>three-layer context system</creates>
  <implements>Agent-OS inspired architecture</implements>
</step_metadata>

<directory_structure>
  <create>
    - .claude-suite/
    - .claude-suite/project/
    - .claude-suite/project/specs/
    - .claude-suite/standards/ (symlink to global)
  </create>
</directory_structure>

<instructions>
  ACTION: Create suite directory structure
  SYMLINK: Standards to global ~/.claude-suite/standards
  ENSURE: Project-specific overrides possible
</instructions>

</step>

<step number="3" name="gather_product_context">

### Step 3: Gather Product Context

<step_metadata>
  <supplements>codebase analysis</supplements>
  <gathers>business context and future plans</gathers>
</step_metadata>

<context_questions>
  Based on my analysis of your codebase, I can see you're building [OBSERVED_PRODUCT_TYPE].

  To properly set up Claude Suite, I need to understand:

  1. **Product Vision**: What problem does this solve? Who are the target users?

  2. **Current State**: Are there features I should know about that aren't obvious from the code?

  3. **Roadmap**: What features are planned next? Any major refactoring planned?

  4. **Decisions**: Are there important technical or product decisions I should document?

  5. **Team Preferences**: Any coding standards or practices the team follows that I should capture?
</context_questions>

<instructions>
  ACTION: Ask user for product context
  COMBINE: Merge user input with codebase analysis
  PREPARE: Information for documentation generation
</instructions>

</step>

<step number="4" name="create_product_documentation">

### Step 4: Create Product Documentation

<step_metadata>
  <creates>product-level documentation</creates>
  <location>.claude-suite/project/</location>
</step_metadata>

<files_to_create>
  <mission_md>
    <template>
      # Product Mission

      > Created: [CURRENT_DATE]
      > Status: Active Development

      ## Vision
      [PRODUCT_VISION_FROM_USER_INPUT]

      ## Problem Statement
      [PROBLEM_BEING_SOLVED]

      ## Target Users
      [TARGET_USER_DESCRIPTION]

      ## Success Metrics
      - [METRIC_1]
      - [METRIC_2]
      - [METRIC_3]
    </template>
  </mission_md>

  <roadmap_md>
    <template>
      # Product Roadmap

      > Created: [CURRENT_DATE]
      > Last Updated: [CURRENT_DATE]

      ## Phase 0: Already Completed ✅

      The following features have been implemented:

      - [x] [COMPLETED_FEATURE_1] - [DESCRIPTION]
      - [x] [COMPLETED_FEATURE_2] - [DESCRIPTION]
      - [x] [COMPLETED_FEATURE_3] - [DESCRIPTION]

      ## Phase 1: Current Development 🚧

      - [ ] [IN_PROGRESS_FEATURE] - [DESCRIPTION]
        - Status: [PERCENTAGE]% complete
        - Blocking: [ANY_BLOCKERS]

      ## Phase 2: Next Up 📋

      - [ ] [PLANNED_FEATURE_1] - [DESCRIPTION]
      - [ ] [PLANNED_FEATURE_2] - [DESCRIPTION]

      ## Phase 3: Future Vision 🔮

      - [ ] [FUTURE_FEATURE_1] - [DESCRIPTION]
      - [ ] [FUTURE_FEATURE_2] - [DESCRIPTION]
    </template>
  </roadmap_md>

  <tech_stack_md>
    <template>
      # Tech Stack

      > Created: [CURRENT_DATE]
      > Environment: [DEVELOPMENT/PRODUCTION]

      ## Frontend
      [DETECTED_FRONTEND_STACK]

      ## Backend
      [DETECTED_BACKEND_STACK]

      ## Database
      [DETECTED_DATABASE]

      ## Infrastructure
      [DETECTED_INFRASTRUCTURE]

      ## Key Dependencies
      [LIST_CRITICAL_DEPENDENCIES_WITH_VERSIONS]
    </template>
  </tech_stack_md>

  <decisions_md>
    <template>
      # Architectural Decisions

      > Created: [CURRENT_DATE]
      > Format: Decision Record

      ## [DATE]: Initial Architecture

      **ID:** DEC-001
      **Status:** Implemented
      **Category:** Technical

      ### Decision
      [KEY_ARCHITECTURAL_DECISION]

      ### Context
      [WHY_THIS_DECISION_WAS_MADE]

      ### Consequences
      **Positive:**
      - [BENEFIT_1]
      - [BENEFIT_2]

      **Trade-offs:**
      - [TRADEOFF_1]
      - [TRADEOFF_2]
    </template>
  </decisions_md>
</files_to_create>

<instructions>
  ACTION: Create all product documentation files
  FILL: With analyzed and gathered information
  ENSURE: Accuracy with existing implementation
</instructions>

</step>

<step number="5" name="setup_workflow_composition">

### Step 5: Setup Workflow Composition

<step_metadata>
  <creates>workflow composition system</creates>
  <enables>command chaining and automation</enables>
</step_metadata>

<workflow_templates>
  <daily_workflow>
    <file>.claude-suite/workflows/daily-dev.md</file>
    <template>
      # Daily Development Workflow

      <workflow_meta>
        <name>daily-dev</name>
        <description>Standard daily development workflow</description>
        <estimated_time>30 minutes</estimated_time>
      </workflow_meta>

      <workflow_steps>
        <step number="1">
          <command>@analyze-codebase</command>
          <condition>always</condition>
        </step>
        
        <step number="2">
          <command>@clean-codebase</command>
          <condition>if_issues_found</condition>
        </step>
        
        <step number="3">
          <command>@pre-deploy-check</command>
          <condition>if_changes_made</condition>
        </step>
      </workflow_steps>
    </template>
  </daily_workflow>
</workflow_templates>

<instructions>
  ACTION: Create workflow composition templates
  ENABLE: Command chaining capabilities
  DOCUMENT: Available workflows
</instructions>

</step>

<step number="6" name="configure_error_handling">

### Step 6: Configure Error Handling

<step_metadata>
  <configures>error handling patterns</configures>
  <improves>robustness and debugging</improves>
</step_metadata>

<error_configurations>
  <global_handlers>
    <file>.claude-suite/project/error-handlers.md</file>
    <template>
      # Error Handling Configuration

      <error_scenarios>
        <scenario name="missing_dependencies">
          <condition>Required packages not installed</condition>
          <action>
            1. List missing dependencies
            2. Offer to install automatically
            3. Provide manual installation commands
          </action>
        </scenario>

        <scenario name="test_failures">
          <condition>Tests fail during pre-deploy check</condition>
          <action>
            1. Identify failing tests
            2. Analyze failure reasons
            3. Suggest fixes or skip options
          </action>
        </scenario>

        <scenario name="build_errors">
          <condition>Build process fails</condition>
          <action>
            1. Parse error messages
            2. Identify common causes
            3. Provide targeted solutions
          </action>
        </scenario>
      </error_scenarios>
    </template>
  </global_handlers>
</error_configurations>

<instructions>
  ACTION: Set up error handling patterns
  CREATE: Error scenario documentation
  ENABLE: Graceful failure recovery
</instructions>

</step>

<step number="7" name="create_validation_checklists">

### Step 7: Create Validation Checklists

<step_metadata>
  <creates>validation and verification systems</creates>
  <ensures>quality gates at each step</ensures>
</step_metadata>

<validation_templates>
  <pre_deploy_checklist>
    <file>.claude-suite/project/checklists/pre-deploy.md</file>
    <template>
      # Pre-Deployment Checklist

      <validation_gates>
        <gate name="code_quality">
          <checks>
            - [ ] No ESLint errors
            - [ ] No TypeScript errors
            - [ ] Code coverage > 80%
            - [ ] No console.log statements
            - [ ] No commented code blocks
          </checks>
        </gate>

        <gate name="tests">
          <checks>
            - [ ] All unit tests pass
            - [ ] All integration tests pass
            - [ ] E2E tests pass (if applicable)
            - [ ] No skipped tests
          </checks>
        </gate>

        <gate name="security">
          <checks>
            - [ ] No exposed secrets
            - [ ] Dependencies up to date
            - [ ] No high-severity vulnerabilities
            - [ ] CORS properly configured
          </checks>
        </gate>

        <gate name="performance">
          <checks>
            - [ ] Bundle size within limits
            - [ ] No memory leaks detected
            - [ ] API response times acceptable
            - [ ] Images optimized
          </checks>
        </gate>
      </validation_gates>
    </template>
  </pre_deploy_checklist>
</validation_templates>

<instructions>
  ACTION: Create validation checklists
  IMPLEMENT: Quality gates
  ENSURE: Consistent standards
</instructions>

</step>

<step number="8" name="final_setup">

### Step 8: Final Setup and Verification

<step_metadata>
  <verifies>installation completeness</verifies>
  <provides>next steps for user</provides>
</step_metadata>

<setup_tasks>
  <claude_config>
    <action>Create or update CLAUDE.md</action>
    <content>
      - Reference to suite standards
      - Project-specific overrides
      - Available commands
    </content>
  </claude_config>

  <git_hooks>
    <action>Install recommended git hooks</action>
    <hooks>
      - pre-commit: lint and format
      - pre-push: run tests
      - commit-msg: validate format
    </hooks>
  </git_hooks>
</setup_tasks>

<verification_checklist>
  - [ ] .claude-suite/ directory structure created
  - [ ] Product documentation reflects actual codebase
  - [ ] Standards linked and accessible
  - [ ] Workflows configured
  - [ ] Error handlers in place
  - [ ] Validation checklists ready
</verification_checklist>

<summary_template>
  ## ✅ Claude Productivity Suite Successfully Installed

  I've analyzed your [PRODUCT_TYPE] codebase and set up the enhanced Claude Suite with:

  ### Three-Layer Context System
  - **Standards**: Global development standards
  - **Project**: Your product-specific documentation
  - **Specs**: Individual feature specifications

  ### What I Found
  - **Tech Stack**: [SUMMARY_OF_DETECTED_STACK]
  - **Completed Features**: [COUNT] features already implemented
  - **Code Patterns**: [DETECTED_PATTERNS]
  - **Current Phase**: [IDENTIFIED_DEVELOPMENT_STAGE]

  ### What Was Created
  - ✓ Enhanced documentation in `.claude-suite/`
  - ✓ Workflow composition system
  - ✓ Error handling patterns
  - ✓ Validation checklists
  - ✓ Cross-reference system

  ### Available Commands
  ```
  /analyze-codebase   - Deep code analysis
  /clean-codebase     - Automated cleanup
  /plan-product       - Feature planning
  /create-spec        - Detailed specifications
  /execute-tasks      - Task execution
  /daily-dev          - Daily workflow
  /pre-deploy-check   - Deployment validation
  ```

  ### Next Steps
  1. Review generated documentation in `.claude-suite/project/`
  2. Customize standards if needed
  3. Try the `/daily-dev` workflow
  4. Create your first spec with `/create-spec`

  Your codebase is now enhanced with Claude Productivity Suite! 🚀
</summary_template>

<instructions>
  ACTION: Complete final setup tasks
  VERIFY: All components installed correctly
  PROVIDE: Clear usage instructions
</instructions>

</step>

</process_flow>

## Error Handling

<error_scenarios>
  <scenario name="no_clear_structure">
    <condition>Cannot determine project type or structure</condition>
    <action>Ask user for clarification about project</action>
    <recovery>Use generic templates and let user customize</recovery>
  </scenario>
  
  <scenario name="conflicting_patterns">
    <condition>Multiple coding styles detected</condition>
    <action>Ask user which pattern to document as standard</action>
    <recovery>Document all patterns and mark for later decision</recovery>
  </scenario>
  
  <scenario name="missing_dependencies">
    <condition>Cannot determine full tech stack</condition>
    <action>List detected technologies and ask for missing pieces</action>
    <recovery>Create partial documentation and mark TODOs</recovery>
  </scenario>
</error_scenarios>

## Cross-Reference System

<reference_format>
  - Use @ prefix for all file references
  - Full paths from project root
  - Automatic link generation in compatible editors
</reference_format>

<example_references>
  - @.claude-suite/project/tech-stack.md
  - @.claude-suite/standards/code-style.md
  - @.claude-suite/workflows/daily-dev.md
</example_references>

## Execution Summary

<final_checklist>
  <verify>
    - [ ] Codebase analyzed thoroughly
    - [ ] User context gathered
    - [ ] Three-layer structure created
    - [ ] Documentation reflects reality
    - [ ] Workflows configured
    - [ ] Error handling in place
    - [ ] Validation systems ready
    - [ ] Team can adopt enhanced workflow
  </verify>
</final_checklist>
