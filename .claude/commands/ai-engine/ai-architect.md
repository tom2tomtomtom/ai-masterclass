---
name: ai-architect
description: AI-powered decision engine that makes all technical choices for you
---

# AI Architect - Your Technical Decision Maker

Tell me what you want to build, and I'll make all the technical decisions for you.

## How It Works

Simply describe your project in plain English:
```
/ai-architect "I need a customer portal where users can view invoices"
```

## What I Decide For You

### 1. Technology Stack Selection
Based on your requirements, I'll choose:
- **Frontend Framework** (React, Next.js, Vue, etc.)
- **Backend Technology** (Node.js, Python, etc.)
- **Database** (PostgreSQL, MongoDB, Supabase, etc.)
- **Authentication** (NextAuth, Supabase Auth, Auth0, etc.)
- **Hosting Platform** (Vercel, Railway, AWS, etc.)

### 2. Architecture Patterns
I'll determine:
- **Application Architecture** (Monolith, Microservices, Serverless)
- **API Design** (REST, GraphQL, tRPC)
- **State Management** (Context, Redux, Zustand)
- **File Structure** (Feature-based, Layer-based)

### 3. Security Framework
Automatically implements:
- **Authentication Method** (JWT, Sessions, OAuth)
- **Authorization Pattern** (RBAC, ABAC)
- **Data Protection** (Encryption, HTTPS, CORS)
- **Compliance Needs** (GDPR, HIPAA, SOC2)

### 4. Performance Strategy
I'll set up:
- **Caching Strategy** (Redis, CDN, Browser)
- **Database Optimization** (Indexes, Query optimization)
- **Asset Optimization** (Image compression, Code splitting)
- **Scaling Approach** (Horizontal, Vertical, Auto-scaling)

## Decision Process

### Step 1: Analyze Requirements
I'll extract from your description:
- Business goals
- User types
- Scale expectations
- Budget constraints
- Timeline
- Team expertise level

### Step 2: Generate Recommendations
```markdown
## 🏗️ Architecture Decision for Your Customer Portal

### Technology Stack (Optimized for rapid development)
- **Frontend**: Next.js 14 with App Router
  - ✅ Built-in auth support
  - ✅ Server components for performance
  - ✅ Great developer experience
  
- **Backend**: Supabase
  - ✅ Instant database + auth
  - ✅ Real-time subscriptions
  - ✅ Row-level security
  
- **Hosting**: Vercel
  - ✅ Zero-config deployment
  - ✅ Automatic scaling
  - ✅ Built for Next.js

### Why These Choices?
- **Speed**: Go from idea to deployed app in days
- **Cost**: Free tier covers most startups
- **Security**: Enterprise-grade out of the box
- **Scalability**: Handles growth automatically
```

### Step 3: Generate Complete Setup
I'll create:
1. Project structure
2. Configuration files
3. Environment variables template
4. Security policies
5. Deployment configuration

## Example Architectures

### SaaS Application
```
Input: "Multi-tenant SaaS for project management"

Output:
- Frontend: Next.js + Tailwind + shadcn/ui
- Backend: Node.js + Prisma
- Database: PostgreSQL with row-level security
- Auth: NextAuth with magic links
- Payments: Stripe
- Hosting: Vercel + Railway
- Monitoring: Sentry + PostHog
```

### E-commerce Platform
```
Input: "Online store with inventory management"

Output:
- Frontend: Next.js + Commerce framework
- Backend: Medusa.js
- Database: PostgreSQL
- Payments: Stripe + PayPal
- CDN: Cloudflare
- Search: Algolia
- Hosting: Vercel
```

### Internal Tool
```
Input: "Employee dashboard for HR"

Output:
- Frontend: React + Ant Design
- Backend: Express.js
- Database: PostgreSQL
- Auth: Active Directory integration
- Hosting: Internal servers
- Security: VPN-only access
```

## Architectural Patterns Library

### For Startups (0-1000 users)
- Monolithic architecture
- Serverless functions
- Managed services
- Focus: Speed to market

### For Scale (1000-100k users)
- Service-oriented architecture
- Caching layers
- Load balancing
- Focus: Performance

### For Enterprise (100k+ users)
- Microservices
- Event-driven architecture
- Multi-region deployment
- Focus: Reliability

## Output Format

After analysis, I provide:

```markdown
# Architecture Decision Document

## Project: [Your Project Name]
Generated: [Date]

## 1. Executive Summary
- What we're building
- Key technical decisions
- Estimated timeline
- Risk factors

## 2. Technology Decisions

### Frontend Stack
- Framework: [Choice] because [Reason]
- UI Library: [Choice] because [Reason]
- State Management: [Choice] because [Reason]

### Backend Stack
- Runtime: [Choice] because [Reason]
- Framework: [Choice] because [Reason]
- Database: [Choice] because [Reason]

### Infrastructure
- Hosting: [Choice] because [Reason]
- CDN: [Choice] because [Reason]
- Monitoring: [Choice] because [Reason]

## 3. Architecture Diagram
[ASCII or description of architecture]

## 4. Implementation Plan
1. Week 1: [What to build]
2. Week 2: [What to build]
3. Week 3: [What to build]

## 5. Alternative Considered
- Option B: [What/Why not]
- Option C: [What/Why not]

## 6. Risk Mitigation
- Risk: [Description] → Mitigation: [Strategy]
```

## Integration with Other Commands

After I make decisions, these commands implement them:
- `/implement-architecture` - Sets up the entire project
- `/generate-configs` - Creates all configuration files
- `/setup-security` - Implements security framework
- `/create-ci-cd` - Sets up deployment pipeline

## Learning From Decisions

I track the success of my decisions:
- Build time vs estimate
- Performance metrics
- Developer satisfaction
- Bug frequency

This helps me make better decisions over time!

## Common Patterns

### "I need authentication"
→ Supabase Auth (fastest)
→ NextAuth (most flexible)
→ Auth0 (enterprise)

### "I need real-time features"
→ Supabase Realtime
→ Socket.io
→ WebSockets

### "I need to handle files"
→ Supabase Storage
→ AWS S3
→ Cloudinary

### "I need search"
→ PostgreSQL full-text
→ Algolia
→ Elasticsearch

Ready to make your technical decisions? Just tell me what you're building!
