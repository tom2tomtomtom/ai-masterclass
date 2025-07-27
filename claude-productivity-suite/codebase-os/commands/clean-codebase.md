---
name: clean-codebase
description: Automated code cleanup with sub-agent assistance
---

# Clean Codebase

Perform safe, automated cleanup operations on the codebase with expert guidance.

## 🤖 Sub-Agent Support

Claude will automatically use relevant sub-agents:
- **code-refactoring-specialist** - Intelligent refactoring patterns
- **performance-optimizer** - Performance improvements
- **dependency-manager** - Dependency cleanup
- **typescript-expert** - TypeScript-specific cleanup
- **frontend-developer** - React/frontend patterns

To prioritize specific expertise:
> "Use the code-refactoring-specialist sub agent to apply SOLID principles"

## 1. Import Organization

### 1.1 Clean Imports
- Remove unused imports
- Sort imports alphabetically
- Group imports by type:
  1. External packages
  2. Internal modules
  3. Local files
  4. Style imports
- Convert require to import
- Fix circular dependencies

### 1.2 Path Optimization
- Convert relative to absolute paths
- Use path aliases consistently
- Remove redundant path segments
- Fix broken imports

## 2. Code Formatting

### 2.1 Consistent Formatting
- Apply Prettier/ESLint fixes
- Standardize indentation
- Fix line endings (LF)
- Remove trailing spaces
- Ensure final newlines

### 2.2 Naming Conventions
- Fix variable casing:
  - camelCase for variables
  - PascalCase for components
  - UPPER_CASE for constants
- Rename unclear variables
- Fix typos in names

## 3. Dead Code Removal

### 3.1 Unused Code
- Remove unused functions
- Delete commented code blocks
- Remove unused variables
- Clean up dead imports
- Delete empty files

### 3.2 Obsolete Patterns
- Remove console.logs
- Delete debugging code
- Clean up TODO comments > 30 days
- Remove deprecated API usage

## 4. Dependency Cleanup

### 4.1 Package Management
```bash
# Remove unused dependencies
npm prune

# Update package-lock.json
npm install

# Audit and fix vulnerabilities
npm audit fix
```

### 4.2 Version Alignment
- Align similar package versions
- Remove duplicate dependencies
- Update deprecated packages
- Clean package.json

## 5. File Organization

### 5.1 Structure Cleanup
- Move misplaced files
- Create missing index files
- Organize by feature
- Remove empty folders
- Standardize file extensions

### 5.2 Asset Optimization
- Compress images
- Remove unused assets
- Organize media files
- Clean up fonts
- Optimize SVGs

## 6. Safe Refactoring

### 6.1 Extract Common Code
- Create shared utilities
- Extract common components
- Centralize constants
- Create type definitions
- Build helper functions

### 6.2 Simplify Complex Code
- Break down long functions
- Extract complex conditions
- Simplify nested callbacks
- Convert to async/await
- Add early returns

## 7. Quality Assurance

- Create safety checkpoint before changes
- Run tests after each cleanup phase
- Validate functionality preserved
- Check performance impact
- Document significant changes

## Report Changes

Create `cleanup-report-{date}.md` with:
- Files modified
- Lines removed
- Size reduction
- Issues fixed
- Sub-agents consulted

## Enhanced with Sub-Agents

Expert sub-agents provide:
- **Pattern Recognition** - Identify better patterns
- **Safe Refactoring** - Preserve functionality
- **Best Practices** - Framework-specific cleanup
- **Performance Focus** - Optimize while cleaning

The cleanup quality improves with available expertise!