---
description: Create Detailed Specifications with Enhanced Structure
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Create Spec (Enhanced)

<ai_meta>
  <parsing_rules>
    - Process XML blocks first for structured data
    - Execute instructions in sequential order
    - Use templates as exact patterns
    - Request missing data rather than assuming
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
  - Create detailed spec plans for specific features
  - Generate structured documentation for implementation
  - Ensure alignment with product roadmap and mission
  - Track decisions and maintain audit trail
</purpose>

<context>
  - Part of Claude Productivity Suite framework
  - Enhanced with Agent-OS patterns
  - Creates spec-specific documentation
  - Integrates with three-layer context system
</context>

<prerequisites>
  - Product documentation exists in .claude-suite/project/
  - Access to:
    - @.claude-suite/project/mission.md
    - @.claude-suite/project/roadmap.md
    - @.claude-suite/project/tech-stack.md
  - User has spec idea or roadmap reference
</prerequisites>

<process_flow>

<step number="1" name="spec_initiation">

### Step 1: Spec Initiation

<step_metadata>
  <trigger_options>
    - option_a: user_asks_whats_next
    - option_b: user_provides_specific_spec
  </trigger_options>
</step_metadata>

<option_a_flow>
  <trigger_phrases>
