---
name: monitor-quality
description: Monitor code quality trends and prevent degradation
---

Monitor code quality metrics and alert on degradation.

## 1. Trend Analysis

Compare current metrics with baseline:
- Complexity increase > 10%
- Test coverage decrease > 5%
- Bundle size increase > 15%
- New code smells detected
- Performance degradation

## 2. Commit Analysis

Analyze recent commits for:
- Large file changes (>200 lines)
- No test additions
- Complexity increases
- New dependencies
- Breaking changes

## 3. Dependency Watch

Monitor dependencies for:
- New vulnerabilities
- Major updates available
- Deprecated packages
- License changes
- Size increases

## 4. Architecture Guards

Check for violations:
- Cross-boundary imports
- Circular dependencies
- Pattern violations
- Naming convention breaks
- Structure deviations

## 5. Generate Alerts

Create alerts for:
- 🔴 Critical: Security vulnerabilities
- 🟡 Warning: Quality degradation
- 🔵 Info: Improvement opportunities

Save trends to `.codebase-os/analysis/trends.json`
