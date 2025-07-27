# Default Tech Stack

This file defines the default technology stack for Claude Productivity Suite projects.

## Core Technologies

### Frontend
- **Framework**: React 18+ / Next.js 14+
- **Styling**: Tailwind CSS
- **State Management**: Zustand / Context API
- **TypeScript**: Strongly recommended

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express / Fastify
- **Database**: PostgreSQL / SQLite (development)
- **ORM**: Prisma / Drizzle

### Infrastructure
- **Deployment**: Railway / Vercel / Netlify
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry
- **Analytics**: Plausible / PostHog

### Development Tools
- **Package Manager**: npm / pnpm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Jest / Vitest
- **E2E Testing**: Playwright

### AI Integration
- **LLM Provider**: OpenAI / Anthropic
- **Vector DB**: Pinecone / Weaviate
- **Embeddings**: OpenAI Ada-002

## Override Instructions

Individual projects can override these defaults by creating:
`.claude-suite/project/tech-stack.md`

## Version Management

- Always specify exact versions in package.json
- Use lockfiles (package-lock.json, pnpm-lock.yaml)
- Update dependencies monthly
