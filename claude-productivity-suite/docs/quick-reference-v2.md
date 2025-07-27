# 🎯 Claude Productivity Suite v2.0 - Quick Reference

## Agent-Based Command System

### 🤖 Agent-OS Commands (Planning & Building)

```bash
/plan-product [name]        # Create strategic plan for feature/product
/create-spec [feature]      # Generate detailed technical specifications  
/execute-tasks              # Build code according to specifications
/analyze-product            # Analyze existing codebase structure
```

### 🧹 Codebase-OS Commands (Code Quality)

```bash
/analyze-codebase          # Deep code health analysis with metrics
/clean-codebase            # Automated cleanup and optimization
/refactor-smart            # AI-powered intelligent refactoring
/monitor-quality           # Track code quality trends over time
```

### 🧪 Testing Suite Commands

```bash
/fix-and-test              # Comprehensive testing workflow (45+ min)
/pre-deploy-check          # Quick deployment safety check (5 min)
/test-core-flows           # Test critical user journeys (15 min)
/railway-deploy            # Railway-specific deployment prep
/emergency-deploy-check    # Minimal checks for emergencies
/fix-common-issues         # Auto-fix common deployment issues
```

### 🔄 Workflow Commands

```bash
/daily-dev                 # Complete daily development workflow
/pre-deployment            # Pre-deployment checklist workflow
```

## Command Details

### Planning Commands

#### `/plan-product`
Creates comprehensive plan including:
- Requirements analysis
- Technical architecture
- Feature breakdown
- Development roadmap
- Risk assessment
- Resource requirements

#### `/create-spec`
Generates specifications with:
- User stories
- API endpoints
- Database schema
- UI/UX requirements
- Validation rules
- Test scenarios

#### `/execute-tasks`
Implements features with:
- Environment setup
- Code implementation
- Test creation
- Documentation
- Progress tracking

### Quality Commands

#### `/analyze-codebase`
Analyzes:
- Complexity metrics
- Code duplication
- Dependencies
- Performance issues
- Security vulnerabilities
- Technical debt

#### `/clean-codebase`
Cleans:
- Unused imports
- Dead code
- Console statements
- Code formatting
- File organization
- Dependencies

#### `/refactor-smart`
Refactors:
- Large components
- Complex functions
- Duplicate code
- Performance bottlenecks
- Type safety
- Test coverage

### Testing Commands

#### `/fix-and-test`
Complete workflow:
1. Static analysis
2. Unit testing
3. Integration testing
4. E2E testing
5. Performance testing
6. Security testing
7. Cross-browser testing
8. Deployment readiness

#### `/pre-deploy-check`
Quick checks:
- Build verification
- Security scan
- Console cleanup
- Basic smoke tests
- Environment config

## Daily Workflow Example

```bash
# Morning
/monitor-quality            # Check code health
/clean-codebase --safe     # Quick cleanup

# Development
/create-spec new-feature    # Define what to build
/execute-tasks              # Build it
/test-core-flows           # Test it

# Before commit
/pre-deploy-check          # Validate
git commit -m "feat: add new feature"

# End of day
/analyze-codebase --today  # Review changes
```

## Best Practices

1. **Always plan first**: Use `/plan-product` before building
2. **Maintain daily**: Run `/monitor-quality` every morning
3. **Test early**: Use `/test-core-flows` after each feature
4. **Clean regularly**: Weekly `/clean-codebase` prevents debt
5. **Deploy safely**: Never skip `/pre-deploy-check`

## Flags and Options

### Common Flags
- `--safe-only`: Only make safe changes
- `--dry-run`: Preview without executing
- `--verbose`: Detailed output
- `--today-only`: Focus on today's changes
- `--comprehensive`: Deep analysis

### Examples
```bash
/clean-codebase --safe-only
/analyze-codebase --today-only
/refactor-smart --dry-run
/monitor-quality --verbose
```
