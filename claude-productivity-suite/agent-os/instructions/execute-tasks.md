---
name: execute-tasks
description: Execute development tasks based on specifications
---

Implement features based on the specifications created.

## 1. Setup Development Environment

### 1.1 Project Initialization
- Create project structure
- Install dependencies
- Configure build tools
- Set up linting/formatting
- Initialize git repository

### 1.2 Development Configuration
- Environment variables
- Database connections
- API configurations
- Development server setup

## 2. Implementation Order

### 2.1 Backend First
1. Database setup and migrations
2. Models/Schemas
3. API routes
4. Business logic
5. Authentication/Authorization
6. Error handling
7. Validation middleware

### 2.2 Frontend Development
1. Project structure
2. Routing setup
3. Layout components
4. Feature components
5. State management
6. API integration
7. Error boundaries

## 3. Code Implementation

### 3.1 Follow Best Practices
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple)
- Proper error handling
- Comprehensive logging
- Security first approach

### 3.2 Code Organization
```
src/
├── components/
│   ├── common/
│   ├── features/
│   └── layouts/
├── services/
│   ├── api/
│   ├── auth/
│   └── utils/
├── hooks/
├── types/
└── tests/
```

## 4. Testing While Building

### 4.1 Write Tests First (TDD)
- Write failing test
- Implement minimal code
- Make test pass
- Refactor if needed

### 4.2 Test Coverage
- Unit tests for utilities
- Integration tests for APIs
- Component tests for UI
- E2E tests for flows

## 5. Documentation

### 5.1 Code Documentation
- JSDoc comments for functions
- README for each module
- API documentation
- Setup instructions

### 5.2 User Documentation
- Feature descriptions
- How-to guides
- API examples
- Troubleshooting guide

## 6. Progress Tracking

### 6.1 Task Completion
- [ ] Database setup
- [ ] Authentication system
- [ ] Core feature implementation
- [ ] UI components
- [ ] API integration
- [ ] Testing
- [ ] Documentation

### 6.2 Git Commits
- Commit after each feature
- Clear commit messages
- Reference issue numbers
- Keep commits atomic

## 7. Quality Checks

### 7.1 Code Review Checklist
- Follows specifications
- Passes all tests
- No security vulnerabilities
- Performance optimized
- Properly documented
- Follows code style

### 7.2 Pre-Merge Checks
- All tests passing
- No console.logs
- No commented code
- Dependencies updated
- Documentation complete

## Generate Implementation

Create working code:
- Backend API implementation
- Frontend components
- Database migrations
- Test suites
- Documentation

Commit with meaningful messages.
