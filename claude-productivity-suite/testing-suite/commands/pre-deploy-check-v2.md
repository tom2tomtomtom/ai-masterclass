---
description: Comprehensive Pre-Deployment Validation
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Pre-Deploy Check (Enhanced)

<ai_meta>
  <parsing_rules>
    - Execute all validation gates in sequence
    - Fail fast on critical issues
    - Provide detailed remediation steps
    - Generate deployment confidence score
  </parsing_rules>
  <validation_gates>
    1. Code Quality Gate
    2. Test Coverage Gate
    3. Security Gate
    4. Performance Gate
    5. Documentation Gate
  </validation_gates>
</ai_meta>

## Overview

<purpose>
  - Validate code readiness for deployment
  - Ensure all quality gates are passed
  - Prevent common deployment issues
  - Generate deployment report
</purpose>

<context>
  - Part of Claude Productivity Suite Testing-Suite
  - Enhanced with structured validation gates
  - Integrates with project checklists
  - Provides confidence scoring
</context>

<prerequisites>
  - All tests must be runnable
  - Build process configured
  - Linting tools available
  - Project checklists defined
</prerequisites>

<process_flow>

<step number="1" name="initialize_validation">

### Step 1: Initialize Validation

<step_metadata>
  <action>prepare validation environment</action>
  <creates>validation report structure</creates>
</step_metadata>

<initialization>
  <report_structure>
    {
      "timestamp": "ISO-8601",
      "gates": {},
      "confidence_score": 0,
      "ready_to_deploy": false,
