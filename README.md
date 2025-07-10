# 🚀 AI-Masterclass

**A comprehensive AI-powered learning platform for business professionals to master AI tools and development.**

[![Deploy to Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

## 🎯 Overview

AI-Masterclass is a full-stack learning management system designed specifically for business professionals who want to learn AI tools, prompt engineering, and AI-assisted development. The platform features interactive content, progress tracking, and hands-on exercises.

### ✨ Key Features

- **🎓 Structured Learning Paths** - Progressive courses from beginner to advanced
- **💬 Interactive Content** - Hands-on exercises, quizzes, and real-world scenarios  
- **📊 Progress Tracking** - Detailed analytics and completion tracking
- **🔐 User Authentication** - Secure login and user management
- **📱 Responsive Design** - Works seamlessly on desktop and mobile
- **⚡ High Performance** - Optimized with caching and performance monitoring

## 🏗️ Architecture

### Frontend
- **React 19** - Modern UI with hooks and context
- **React Router** - Client-side routing
- **Responsive Design** - Mobile-first approach

### Backend  
- **Node.js + Express** - RESTful API server
- **PostgreSQL** - Robust relational database
- **Redis** - Session management and caching
- **JWT Authentication** - Secure token-based auth

### DevOps & Monitoring
- **Docker** - Containerized deployment
- **Prometheus + Grafana** - Monitoring and metrics
- **Comprehensive Testing** - Unit, integration, and E2E tests
- **CI/CD Ready** - GitHub Actions workflow

## 🚀 Quick Deploy to Railway

**The fastest way to get your AI-Masterclass live:**

1. **Click the Railway button above** or go to [railway.app](https://railway.app)
2. **Connect this GitHub repository**
3. **Add PostgreSQL and Redis services**
4. **Set environment variables** (see [Railway Guide](RAILWAY_DEPLOYMENT_GUIDE.md))
5. **Deploy!** ✨

**Total time: ~15 minutes**

## 📖 Deployment Guides

- **🚂 [Railway Deployment](RAILWAY_DEPLOYMENT_GUIDE.md)** - Complete beginner-friendly guide
- **🐳 [Docker Deployment](DEPLOYMENT.md)** - Full production deployment
- **☸️ [Kubernetes](k8s/)** - Scalable cloud deployment

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Redis 7+

### Quick Start
```bash
# Clone the repository
git clone https://github.com/tom2tomtomtom/ai-masterclass.git
cd ai-masterclass

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Set up environment variables
cp .env.production .env
# Edit .env with your local database settings

# Start the database
# (Install PostgreSQL and Redis locally)

# Run database migrations
cd backend && npm run db:init

# Start the application
npm run dev  # Starts both frontend and backend
```

### Development URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/health

## 🧪 Testing

```bash
# Run all tests
npm test

# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend && npm test

# E2E tests
cd frontend && npm run test:e2e
```

## 📊 Course Content

### Level 1: AI Foundations
- Introduction to AI tools
- Basic prompt engineering
- ChatGPT and Claude fundamentals

### Level 2: Business Applications  
- AI for productivity
- Content creation workflows
- Data analysis with AI

### Level 3: Development Integration
- AI-powered coding
- API integrations
- Building AI applications

## 🔧 Configuration

### Environment Variables

**Required:**
```bash
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
DB_PASSWORD=your-db-password
```

**Database:**
```bash
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=ai_masterclass
DB_USER=ai_user
```

**Optional Features:**
```bash
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your-openai-key
CLAUDE_API_KEY=your-claude-key
```

See [.env.railway](.env.railway) for complete configuration template.

## 📈 Monitoring

The application includes built-in monitoring:

- **Health Checks**: `/health` and `/health/database`
- **Metrics**: Prometheus metrics at `/metrics`
- **Logging**: Structured logging with Winston
- **Performance**: Request timing and error tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **📖 Documentation**: Check the guides in this repository
- **🐛 Issues**: [GitHub Issues](https://github.com/tom2tomtomtom/ai-masterclass/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/tom2tomtomtom/ai-masterclass/discussions)

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced AI integrations
- [ ] Team collaboration features
- [ ] Certification system
- [ ] Multi-language support

---

**Built with ❤️ for the AI learning community**

⭐ **Star this repo if it helps you learn AI!**
