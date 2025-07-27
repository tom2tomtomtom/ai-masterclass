# Development Best Practices

This file defines the best practices for all Claude Productivity Suite projects.

## Core Principles

### 1. Test-Driven Development (TDD)
- Write tests before implementation
- Red → Green → Refactor cycle
- Aim for 80%+ code coverage
- Test behavior, not implementation

### 2. Progressive Enhancement
- Start with core functionality
- Layer on enhancements
- Ensure graceful degradation
- Mobile-first approach

### 3. Documentation-Driven Development
- Document before coding
- Keep docs in sync with code
- Use JSDoc/TSDoc for functions
- Maintain README files

## Development Workflow

### 1. Planning Phase
```
1. Create spec document
2. Define acceptance criteria
3. Break down into tasks
4. Estimate complexity
```

### 2. Implementation Phase
```
1. Create feature branch
2. Write failing tests
3. Implement minimum code
4. Refactor for quality
5. Update documentation
```

### 3. Review Phase
```
1. Self-review checklist
2. Run all tests
3. Check code coverage
4. Submit PR with description
```

## Code Review Guidelines

### What to Look For
- **Correctness**: Does it solve the problem?
- **Performance**: Are there bottlenecks?
- **Security**: Any vulnerabilities?
- **Maintainability**: Is it easy to understand?
- **Tests**: Adequate coverage?

### Review Checklist
- [ ] All tests pass
- [ ] Code follows style guide
- [ ] No console.logs or debug code
- [ ] Error handling is comprehensive
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance impact considered

## Database Best Practices

### Schema Design
- Normalize to 3NF minimum
- Use appropriate indexes
- Consider query patterns
- Plan for scale

### Migrations
```sql
-- Always include up and down migrations
-- Up
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

-- Down
ALTER TABLE users DROP COLUMN email_verified;
```

### Query Optimization
- Use EXPLAIN ANALYZE
- Avoid N+1 queries
- Batch operations when possible
- Cache expensive queries

## API Design

### RESTful Principles
```
GET    /api/users          # List
GET    /api/users/:id      # Read
POST   /api/users          # Create
PUT    /api/users/:id      # Update
DELETE /api/users/:id      # Delete
```

### Response Format
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User with ID 123 not found",
    "details": {}
  }
}
```

## State Management

### Local State
- Use for component-specific state
- Prefer hooks over classes
- Keep state minimal

### Global State
- Use for cross-component data
- Consider Context API first
- Use state management library for complex apps

### Server State
- Use React Query / SWR
- Implement proper caching
- Handle loading/error states

## Performance Optimization

### React Specific
```tsx
// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(props);
}, [props]);

// Prevent unnecessary re-renders
const MemoizedComponent = React.memo(Component);

// Lazy load components
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### General Optimizations
- Implement pagination
- Use virtual scrolling for long lists
- Optimize images (WebP, lazy loading)
- Minify and compress assets
- Use CDN for static assets

## Security Practices

### Authentication
- Use secure session management
- Implement proper token rotation
- Never store passwords in plain text
- Use HTTPS everywhere

### Authorization
- Principle of least privilege
- Validate permissions server-side
- Log security events
- Regular security audits

### Data Validation
```typescript
// Always validate input
const schema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(150)
});

const validated = schema.parse(userInput);
```

## Monitoring & Logging

### Application Logs
```typescript
// Use structured logging
logger.info('User action', {
  action: 'login',
  userId: user.id,
  timestamp: new Date().toISOString()
});
```

### Error Tracking
- Use error boundary in React
- Send errors to monitoring service
- Include context and stack traces
- Set up alerts for critical errors

## Deployment Practices

### Environment Management
```bash
# Use environment-specific configs
.env.development
.env.staging
.env.production
```

### CI/CD Pipeline
```yaml
# Example GitHub Actions
- Run linting
- Run tests
- Build application
- Run E2E tests
- Deploy to staging
- Run smoke tests
- Deploy to production
```

### Feature Flags
```typescript
// Use feature flags for gradual rollouts
if (featureFlags.newFeature.enabled) {
  return <NewFeature />;
}
return <OldFeature />;
```

## Debugging Guidelines

### Development Tools
- Use browser DevTools effectively
- Set up React DevTools
- Use debugger statements sparingly
- Implement proper error boundaries

### Debugging Strategy
1. Reproduce the issue
2. Isolate the problem
3. Form a hypothesis
4. Test the hypothesis
5. Implement the fix
6. Verify the fix
7. Add tests to prevent regression

## Communication

### Code Comments
```typescript
// WHY, not WHAT
// ❌ Bad: Increment counter by 1
counter++;

// ✅ Good: Increment retry counter to prevent infinite loops
retryCounter++;
```

### PR Descriptions
```markdown
## What
Brief description of changes

## Why
Context and reasoning

## How
Technical approach

## Testing
How to verify changes

## Screenshots
(if applicable)
```

## Continuous Improvement

1. Regular retrospectives
2. Update best practices based on learnings
3. Share knowledge with team
4. Automate repetitive tasks
5. Measure and optimize

## Override Instructions

Individual projects can extend these practices by creating:
`.claude-suite/project/best-practices.md`
