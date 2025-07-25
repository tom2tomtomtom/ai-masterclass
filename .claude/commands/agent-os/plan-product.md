---
name: plan-product
description: Plan a new product or feature with structured approach and task generation
---

Create a comprehensive plan for building a new product or feature.

## 1. Requirements Analysis

### 1.1 Understand the Goal
- What problem does this solve?
- Who are the users?
- What's the expected outcome?
- What's the timeline?
- What's the budget/resources?

### 1.2 Define Success Criteria
- Key metrics to track
- User satisfaction goals
- Performance requirements
- Business objectives

## 2. Technical Architecture

### 2.1 Technology Stack
Recommend appropriate technologies:
- Frontend framework
- Backend language/framework
- Database type
- Authentication method
- Hosting platform
- Third-party services

### 2.2 System Architecture
Design the overall system:
- Component structure
- API design
- Database schema
- Security architecture
- Scalability plan

## 3. Feature Breakdown

### 3.1 Core Features
List must-have features:
- User authentication
- Main functionality
- Data management
- Admin capabilities

### 3.2 Nice-to-Have Features
Additional features for later:
- Advanced analytics
- Social features
- Integrations
- Mobile app

## 4. Development Roadmap

### 4.1 Phase 1: MVP (Week 1-2)
- Basic authentication
- Core feature
- Simple UI
- Database setup

### 4.2 Phase 2: Enhancement (Week 3-4)
- Improved UI/UX
- Additional features
- Performance optimization
- Testing

### 4.3 Phase 3: Polish (Week 5-6)
- Bug fixes
- Documentation
- Deployment setup
- Launch preparation

## 5. Risk Assessment

### 5.1 Technical Risks
- Complex integrations
- Performance challenges
- Security concerns
- Scalability issues

### 5.2 Mitigation Strategies
- Fallback plans
- Alternative approaches
- Testing strategies
- Monitoring plans

## 6. Resource Requirements

### 6.1 Team Needs
- Development hours
- Design resources
- Testing resources
- DevOps support

### 6.2 Infrastructure
- Hosting costs
- Database needs
- Third-party services
- Monitoring tools

## 7. Generate Plan Document

Create a comprehensive plan document:
- Executive summary
- Technical specification
- Timeline with milestones
- Resource allocation
- Risk mitigation plan

Save as `plans/{product-name}-plan.md`

## 8. Generate Development Tasks

Based on the plan, create actionable tasks in `.claude-suite/project/tasks.md`:

### Phase 1 Tasks (MVP)
```markdown
- [ ] [HIGH] Set up project repository and development environment
  - Source: /plan-product
  - Added: [timestamp]
  - Details: Initialize git, install dependencies, configure build tools
  - Estimate: 2 hours

- [ ] [HIGH] Implement basic authentication system
  - Source: /plan-product
  - Added: [timestamp]
  - Details: User registration, login, session management
  - Estimate: 8 hours

- [ ] [HIGH] Create database schema and migrations
  - Source: /plan-product
  - Added: [timestamp]
  - Details: User table, core data models
  - Estimate: 4 hours

- [ ] [HIGH] Build core [feature] functionality
  - Source: /plan-product
  - Added: [timestamp]
  - Details: [Specific requirements]
  - Estimate: 16 hours
```

### Phase 2 Tasks (Enhancement)
```markdown
- [ ] [MEDIUM] Implement advanced UI components
  - Source: /plan-product
  - Added: [timestamp]
  - Details: [List components]
  - Estimate: 8 hours

- [ ] [MEDIUM] Add performance monitoring
  - Source: /plan-product
  - Added: [timestamp]
  - Details: APM setup, metrics dashboard
  - Estimate: 4 hours
```

### Technical Debt Prevention
```markdown
- [ ] [MEDIUM] Set up CI/CD pipeline
  - Source: /plan-product
  - Added: [timestamp]
  - Details: Automated testing, deployment
  - Estimate: 6 hours

- [ ] [LOW] Create comprehensive documentation
  - Source: /plan-product
  - Added: [timestamp]
  - Details: API docs, setup guide, architecture
  - Estimate: 4 hours
```

### Task Generation Rules
- MVP features → HIGH priority
- Security/Auth → HIGH priority
- Enhancement features → MEDIUM priority
- Documentation → LOW priority
- Infrastructure → Based on timeline

Report task summary:
```
## Development Tasks Generated: X
- Phase 1 (MVP): X tasks, ~Y hours
- Phase 2 (Enhancement): X tasks, ~Y hours
- Phase 3 (Polish): X tasks, ~Y hours

Total Estimate: Z hours
Added to: .claude-suite/project/tasks.md
```
