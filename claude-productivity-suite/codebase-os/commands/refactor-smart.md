---
name: refactor-smart
description: Intelligent refactoring based on codebase analysis
---

Perform intelligent refactoring based on code quality metrics and patterns.

## 1. Component Refactoring

### 1.1 Split Large Components
Identify and refactor components that:
- Have > 200 lines
- Manage > 5 state variables
- Have > 10 props
- Mix concerns (UI + logic)

Refactor into:
- Container/Presenter pattern
- Custom hooks for logic
- Smaller sub-components
- Shared utilities

### 1.2 Extract Custom Hooks
Find repeated patterns and extract:
- Data fetching logic → useAPI hooks
- Form handling → useForm hooks
- State management → useStore hooks
- Side effects → useEffect wrappers

## 2. API Layer Refactoring

### 2.1 Centralize API Calls
- Create API service layer
- Standardize error handling
- Add request/response interceptors
- Implement retry logic
- Add caching layer

### 2.2 Type Safety
- Generate TypeScript types from API
- Add runtime validation
- Create type guards
- Add API response types
- Implement error types

## 3. State Management

### 3.1 Optimize State Structure
- Normalize nested data
- Split global/local state
- Remove redundant state
- Add computed values
- Implement selectors

### 3.2 Performance Optimization
- Add memoization where needed
- Implement lazy loading
- Use React.lazy for routes
- Add suspense boundaries
- Optimize re-renders

## 4. Code Pattern Standardization

### 4.1 Error Handling
Create consistent error patterns:
```typescript
// Standard error boundary
// Consistent try-catch blocks
// Unified error messages
// Centralized error logging
```

### 4.2 Data Validation
Standardize validation:
- Form validation rules
- API response validation
- Type checking
- Schema validation
- Input sanitization

## 5. Test Improvement

### 5.1 Add Missing Tests
- Components without tests
- Uncovered code paths
- Edge cases
- Error scenarios
- Integration points

### 5.2 Improve Test Quality
- Remove duplicate tests
- Add meaningful assertions
- Mock external dependencies
- Test user interactions
- Add performance tests

Generate refactoring plan with priority levels.
