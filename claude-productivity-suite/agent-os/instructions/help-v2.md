---
name: help
description: Show all available commands and enhanced features
version: 2.0
---

# 🚀 Claude Productivity Suite Commands (Enhanced)

## 🎯 What's New in v2.0
- **Three-Layer Context System**: Standards → Project → Specs
- **XML-Structured Workflows**: Clear, parseable instructions
- **Workflow Composition**: Chain commands intelligently
- **Enhanced Error Handling**: Graceful failure recovery
- **Validation Checklists**: Quality gates at each step
- **Cross-Reference System**: @ prefix for easy navigation

## 🤖 Agent-OS Commands (Planning & Building)
- `/plan-product` - Plan a new product or feature
- `/create-spec` - Create detailed specifications (v2 enhanced)
- `/execute-tasks` - Execute development tasks
- `/analyze-product` - Analyze existing codebase (v2 enhanced)

## 🧹 Codebase-OS Commands (Code Quality)
- `/analyze-codebase` - Comprehensive code health check
- `/clean-codebase` - Automated code cleanup (v2 enhanced)
- `/refactor-smart` - Intelligent refactoring
- `/monitor-quality` - Monitor code quality trends

## 🧪 Testing Commands
- `/fix-and-test` - Complete error fixing and testing
- `/pre-deploy-check` - 5-minute deployment safety check (v2 enhanced)
- `/test-core-flows` - Test essential user journeys
- `/railway-deploy` - Railway-specific deployment

## 🔄 Enhanced Workflows
- `/daily-dev` - Daily development workflow (v2 enhanced)
- `/pre-deploy` - Pre-deployment checklist
- `/prod-release` - Production release workflow
- `/emergency-fix` - Emergency deployment process

## 📂 Three-Layer Context System

### 1. Standards Layer (~/.claude-suite/standards/)
- `tech-stack.md` - Default technology choices
- `code-style.md` - Coding standards
- `best-practices.md` - Development practices

### 2. Project Layer (.claude-suite/project/)
- `mission.md` - Product vision and goals
- `roadmap.md` - Development phases
- `tech-stack.md` - Project-specific stack
- `decisions.md` - Architectural decisions

### 3. Specs Layer (.claude-suite/specs/)
- Individual feature specifications
- Task breakdowns
- Technical requirements

## 🔗 Cross-Reference System
Use @ prefix to reference any file:
- `@.claude-suite/project/roadmap.md`
- `@.claude-suite/standards/code-style.md`
