---
name: daily-dev
description: Complete daily development workflow
---

# Daily Development Workflow

Execute this workflow every morning for optimal productivity.

## 🌅 Morning Setup (5 minutes)

1. **Check code health**
   ```
   /monitor-quality
   ```
   
2. **Clean up if needed**
   ```
   /clean-codebase --safe-only
   ```

3. **Review yesterday's work**
   ```
   /analyze-product
   ```

## 💻 Development Time (Active coding)

1. **Plan new feature**
   ```
   /plan-product [feature-name]
   ```

2. **Create specifications**
   ```
   /create-spec [feature-name]
   ```

3. **Execute development**
   ```
   /execute-tasks
   ```

## 🧪 Testing Phase (Before commits)

1. **Quick validation**
   ```
   /pre-deploy-check
   ```

2. **Fix any issues**
   ```
   /fix-common-issues
   ```

## 🌆 End of Day (10 minutes)

1. **Analyze changes**
   ```
   /analyze-codebase --today-only
   ```

2. **Commit and push**
   ```
   git add .
   git commit -m "feat: today's work"
   git push
   ```

3. **Update project status**
   ```
   /monitor-quality --generate-report
   ```

💡 Pro tip: Customize this workflow based on your project needs!
