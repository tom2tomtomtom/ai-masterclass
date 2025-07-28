# Claude Productivity Suite - Complete Commands Reference

## Overview
The Claude Productivity Suite provides 34 powerful commands organized into specialized OS systems. Each command is designed to automate complex development tasks and boost productivity.

## Command Categories

### 🤖 Agent-OS (Planning & Building)
Strategic planning and intelligent development assistance.

| Command | Description | Use Case |
|---------|-------------|----------|
| `/plan-product` | AI-powered feature planning | Start new features with comprehensive planning |
| `/create-spec` | Generate detailed specifications | Create technical specs from requirements |
| `/execute-tasks` | Execute development tasks | Implement features based on specs |
| `/analyze-product` | Deep codebase analysis | Understand project structure and patterns |
| `/living-context` | Maintain project context | Keep AI aware of project state |

### 🧹 Codebase-OS (Code Quality)
Automated code quality management and refactoring.

| Command | Description | Use Case |
|---------|-------------|----------|
| `/analyze-codebase` | Health check analysis | Get code quality metrics and issues |
| `/clean-codebase` | Automated cleanup | Fix linting, formatting, imports |
| `/refactor-smart` | Intelligent refactoring | Improve code structure safely |
| `/monitor-quality` | Track quality trends | Monitor code health over time |

### 🧪 Testing Suite
Comprehensive testing and deployment validation.

| Command | Description | Use Case |
|---------|-------------|----------|
| `/fix-and-test` | Fix issues and test | Automated error fixing with tests |
| `/pre-deploy-check` | Pre-deployment validation | Ensure deployment readiness |
| `/test-core-flows` | User journey testing | Test critical user paths |
| `/railway-deploy` | Railway deployment | Deploy to Railway platform |
| `/emergency-deploy-check` | Emergency validation | Quick checks for hotfixes |
| `/fix-common-issues` | Fix known problems | Resolve common errors automatically |

### 🌍 Environment-OS (NEW!)
Environment setup and configuration management.

| Command | Description | Use Case |
|---------|-------------|----------|
| `/setup-environment` | Auto-setup dev environment | Initialize new project environments |
| `/sync-prod-config` | Sync production configs | Match local to production settings |
| `/debug-environment` | Debug env issues | Fix environment-related problems |

### 🗄️ Migration-OS (NEW!)
Safe database migration management.

| Command | Description | Use Case |
|---------|-------------|----------|
| `/generate-migration` | Create migrations | Generate database migration files |
| `/test-migration` | Test migrations safely | Validate migrations before applying |
| `/rollback-safe` | Instant rollback | Safely rollback failed migrations |

### 🐛 Debug-OS (NEW!)
Advanced debugging capabilities.

| Command | Description | Use Case |
|---------|-------------|----------|
| `/reproduce-error` | Reproduce bugs locally | Recreate production errors |
| `/debug-production` | Safe production debug | Debug live systems safely |
| `/debug-timeline` | Time-travel debugging | Step through code history |

### ⚡ Performance-OS (NEW!)
Performance optimization and profiling.

| Command | Description | Use Case |
|---------|-------------|----------|
| `/profile-performance` | Full performance analysis | Identify bottlenecks |
| `/optimize-critical-path` | Auto-optimize paths | Speed up slow code automatically |
| `/implement-caching` | Smart caching setup | Add intelligent caching layers |

### 🔄 Workflows
Pre-built development workflows.

| Command | Description | Use Case |
|---------|-------------|----------|
| `/daily-development` | Daily dev workflow | Start your development day |
| `/pre-deployment` | Pre-deploy workflow | Complete deployment checklist |

### 📚 Help Commands
Documentation and assistance.

| Command | Description | Use Case |
|---------|-------------|----------|
| `/help` | Show all commands | View complete command list |
| `/help-v2` | v2.0 specific help | Get v2.0 system information |

## Quick Start Guide

### Installation
```bash
# Clone the repository
git clone https://github.com/tom2tomtomtom/ai-masterclass.git
cd ai-masterclass/claude-productivity-suite

# Run the installer
./install-v2.sh
```

### Basic Usage
1. Open any project: `cd your-project`
2. Start Claude Code: `claude`
3. Use any command: `/command-name`

### Example Workflows

#### Starting a New Feature
```
/plan-product "user authentication"
/create-spec
/execute-tasks
```

#### Fixing Code Quality
```
/analyze-codebase
/clean-codebase
/refactor-smart
```

#### Performance Optimization
```
/profile-performance
/optimize-critical-path
/implement-caching
```

#### Safe Deployment
```
/pre-deploy-check
/test-core-flows
/railway-deploy
```

## Command Details

### Planning Commands

#### `/plan-product`
Creates comprehensive feature plans including:
- Feature breakdown
- Technical requirements
- Implementation steps
- Risk assessment
- Timeline estimation

#### `/create-spec`
Generates detailed specifications:
- API design
- Database schema
- Component architecture
- Integration points
- Testing strategy

### Quality Commands

#### `/analyze-codebase`
Provides deep analysis:
- Code complexity metrics
- Duplication detection
- Dependency analysis
- Security vulnerabilities
- Performance hotspots

#### `/clean-codebase`
Automated cleanup for:
- ESLint/Prettier formatting
- Import organization
- Dead code removal
- Consistent naming
- File structure optimization

### Testing Commands

#### `/fix-and-test`
Intelligent error resolution:
- Analyzes error messages
- Proposes fixes
- Implements solutions
- Runs relevant tests
- Validates fixes

#### `/pre-deploy-check`
Comprehensive validation:
- Build verification
- Test suite execution
- Environment checks
- Security scanning
- Performance benchmarks

### Environment Commands

#### `/setup-environment`
Complete environment setup:
- Install dependencies
- Configure databases
- Set up env variables
- Initialize services
- Create development data

#### `/sync-prod-config`
Production synchronization:
- Fetch production settings
- Update local configs
- Validate compatibility
- Apply security filters
- Document differences

### Migration Commands

#### `/generate-migration`
Smart migration creation:
- Analyze schema changes
- Generate SQL/ORM code
- Add rollback logic
- Include data transforms
- Create documentation

#### `/test-migration`
Safe migration testing:
- Backup current state
- Apply migration
- Run validation tests
- Check data integrity
- Generate report

### Debug Commands

#### `/reproduce-error`
Error reproduction:
- Parse error logs
- Set up test environment
- Recreate conditions
- Capture debug info
- Suggest fixes

#### `/debug-timeline`
Historical debugging:
- Git history analysis
- Code evolution tracking
- Bug introduction detection
- Performance regression finding
- Change impact assessment

### Performance Commands

#### `/profile-performance`
Performance analysis:
- CPU profiling
- Memory usage tracking
- Database query analysis
- Network request monitoring
- Rendering performance

#### `/optimize-critical-path`
Automatic optimization:
- Identify slow paths
- Apply optimizations
- Add caching
- Parallelize operations
- Measure improvements

## Best Practices

### Command Combinations
Some commands work best together:

1. **Feature Development Flow**
   ```
   /plan-product → /create-spec → /execute-tasks → /fix-and-test
   ```

2. **Quality Improvement Flow**
   ```
   /analyze-codebase → /clean-codebase → /refactor-smart → /monitor-quality
   ```

3. **Deployment Flow**
   ```
   /pre-deploy-check → /test-migration → /test-core-flows → /railway-deploy
   ```

4. **Performance Flow**
   ```
   /profile-performance → /optimize-critical-path → /implement-caching
   ```

### Tips for Maximum Productivity

1. **Start with Planning**: Always use `/plan-product` for new features
2. **Regular Quality Checks**: Run `/analyze-codebase` weekly
3. **Test Early**: Use `/fix-and-test` after each implementation
4. **Profile Before Optimizing**: Always `/profile-performance` first
5. **Safe Migrations**: Never skip `/test-migration`

## Integration with Development Workflow

### Git Hooks
Add to `.git/hooks/pre-commit`:
```bash
claude /analyze-codebase --quick
claude /fix-common-issues
```

### CI/CD Pipeline
Add to your CI configuration:
```yaml
- name: Quality Check
  run: claude /pre-deploy-check
  
- name: Performance Test
  run: claude /profile-performance --threshold
```

### Daily Routine
1. Morning: `/daily-development`
2. Before lunch: `/analyze-codebase`
3. After changes: `/fix-and-test`
4. End of day: `/monitor-quality`

## Troubleshooting

### Common Issues

1. **Command not found**: Run `./install-v2.sh` again
2. **Permission denied**: Use `chmod +x install-v2.sh`
3. **Claude not found**: Install with `npm install -g @anthropic-ai/claude-code`

### Getting Help

- Use `/help` for command list
- Check individual command files in `~/.claude/commands/`
- Visit: https://github.com/tom2tomtomtom/ai-masterclass

## Version History

- **v2.1.0**: Added Environment-OS, Migration-OS, Debug-OS, Performance-OS
- **v2.0.0**: Complete rewrite with Agent-OS architecture
- **v1.0.0**: Initial release with basic commands

---

Last Updated: July 28, 2025
Total Commands: 34
Active OS Systems: 8
