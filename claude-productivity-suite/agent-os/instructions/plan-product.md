---
name: plan-product
description: Plan a new product or feature with expert assistance
---

# Plan Product

Create a comprehensive plan for building a new product or feature with expert guidance.

## 🤖 Sub-Agent Support

Claude will automatically use relevant sub-agents:
- **project-planner** - Overall project planning
- **requirements-analyst** - Requirements gathering
- **system-architect** - System design
- **api-designer** - API architecture
- **database-schema-designer** - Database design
- **ui-ux-designer** - User experience planning
- **business-process-analyst** - Business logic mapping

To focus on specific aspects:
> "Use the system-architect sub agent to design the microservices"

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

## 7. Sub-Agent Insights

Expert agents will provide:
- **Architecture Patterns** - Best practices for your use case
- **Technology Recommendations** - Framework-specific guidance
- **Risk Analysis** - Domain-specific concerns
- **Timeline Optimization** - Realistic scheduling

## Generate Plan Document

Create a comprehensive plan document:
- Executive summary
- Technical specification
- Timeline with milestones
- Resource allocation
- Risk mitigation plan
- Expert recommendations

Save as `plans/{product-name}-plan.md`

The plan quality scales with available expertise!