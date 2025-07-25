# 🗄️ Complete Database Setup Guide for AI Masterclass Platform

This guide provides step-by-step instructions for setting up the database schema required for the complete AI Masterclass platform seeding system.

## 📋 Overview

The database schema supports:
- **16 Comprehensive Courses** (Foundation + AI Masterclass + Enhanced Foundation)
- **49+ Specialized Modules** with detailed organization
- **130+ Detailed Lessons** with rich markdown content
- **Interactive Content** (prompts, quizzes, tasks) - optional
- **User Progress Tracking** - optional

## 🎯 Required vs Optional Tables

### **✅ REQUIRED TABLES (For Seeding to Work)**
These tables are **ESSENTIAL** for the seeding scripts to function:

```sql
-- Core structure tables
courses          -- Main course container
modules          -- Course sections/modules  
lessons          -- Individual lesson content

-- User management (basic)
users            -- User accounts
companies        -- Organizational structure (optional)
```

### **🔧 OPTIONAL TABLES (For Full Platform)**
These tables enhance functionality but aren't required for seeding:

```sql
-- Interactive content
prompts          -- Copy-paste templates
quizzes          -- Assessment questions  
tasks            -- Practical assignments

-- Progress tracking
user_progress           -- Course/module progress
user_lesson_progress    -- Lesson-level progress
user_quiz_progress      -- Quiz attempts
user_task_progress      -- Task submissions
```

## 🚀 Quick Setup Options

### **Option 1: Supabase Setup (Recommended)**

1. **Create Supabase Project**
   ```bash
   # Go to https://supabase.com
   # Create new project
   # Note your project URL and service key
   ```

2. **Run Complete Schema**
   ```sql
   -- In Supabase SQL Editor, run:
   -- Copy content from backend/COMPLETE-DATABASE-SCHEMA.sql
   ```

3. **Verify Setup**
   ```sql
   -- Check tables exist
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

### **Option 2: PostgreSQL Local Setup**

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql
   
   # Ubuntu
   sudo apt-get install postgresql postgresql-contrib
   sudo systemctl start postgresql
   ```

2. **Create Database**
   ```bash
   createdb ai_masterclass
   psql ai_masterclass
   ```

3. **Run Schema**
   ```sql
   \i backend/COMPLETE-DATABASE-SCHEMA.sql
   ```

### **Option 3: Docker Setup**

1. **Docker Compose**
   ```yaml
   # docker-compose.yml
   version: '3.8'
   services:
     postgres:
       image: postgres:15
       environment:
         POSTGRES_DB: ai_masterclass
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: password
       ports:
         - "5432:5432"
       volumes:
         - ./backend/COMPLETE-DATABASE-SCHEMA.sql:/docker-entrypoint-initdb.d/schema.sql
   ```

2. **Start Database**
   ```bash
   docker-compose up -d
   ```

## 🔧 Environment Configuration

### **Supabase Configuration**
```bash
# .env file
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

### **PostgreSQL Configuration**
```bash
# .env file
DATABASE_URL=postgresql://username:password@localhost:5432/ai_masterclass
```

## 📊 Schema Verification

### **Check Required Tables**
```sql
-- Verify core tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('courses', 'modules', 'lessons', 'users') 
        THEN '✅ REQUIRED' 
        ELSE '🔧 OPTIONAL' 
    END as importance
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'courses', 'modules', 'lessons', 'users', 'companies',
        'prompts', 'quizzes', 'tasks', 
        'user_progress', 'user_lesson_progress', 
        'user_quiz_progress', 'user_task_progress'
    )
ORDER BY importance DESC, table_name;
```

### **Check Foreign Key Relationships**
```sql
-- Verify relationships are correct
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('modules', 'lessons', 'prompts', 'quizzes', 'tasks')
ORDER BY tc.table_name;
```

## 🧪 Test Database Setup

### **Minimal Test Data**
```sql
-- Insert test course
INSERT INTO courses (title, description, level, order_index, status) 
VALUES ('Test Course', 'Test Description', 1, 1, 'published');

-- Insert test module
INSERT INTO modules (course_id, title, description, order_index, module_type) 
SELECT id, 'Test Module', 'Test Description', 1, 'theory' 
FROM courses WHERE title = 'Test Course';

-- Insert test lesson
INSERT INTO lessons (module_id, title, content, order_index, lesson_type) 
SELECT id, 'Test Lesson', 'Test content', 1, 'lesson' 
FROM modules WHERE title = 'Test Module';

-- Verify test data
SELECT 
    c.title as course,
    m.title as module,
    l.title as lesson
FROM courses c
JOIN modules m ON c.id = m.course_id
JOIN lessons l ON m.id = l.module_id
WHERE c.title = 'Test Course';
```

## 🚨 Common Issues & Solutions

### **Issue: UUID Extension Missing**
```sql
-- Solution: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### **Issue: Permission Denied**
```sql
-- Solution: Grant proper permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

### **Issue: Foreign Key Violations**
```sql
-- Solution: Check table creation order
-- Tables must be created in dependency order:
-- 1. companies, users
-- 2. courses  
-- 3. modules
-- 4. lessons
-- 5. prompts, quizzes, tasks
-- 6. progress tables
```

## ✅ Ready for Seeding

Once your database is set up with the required tables, you can run the seeding scripts:

```bash
# Complete platform seeding
npm run seed:complete-platform

# Or step by step
npm run seed:all-courses
npm run seed:all-modules  
npm run seed:all-lessons
```

## 📈 Post-Seeding Verification

### **Check Seeding Results**
```sql
-- Course count (should be 16)
SELECT COUNT(*) as total_courses FROM courses;

-- Module count (should be 49+)
SELECT COUNT(*) as total_modules FROM modules;

-- Lesson count (should be 130+)
SELECT COUNT(*) as total_lessons FROM lessons;

-- Course structure overview
SELECT 
    c.title,
    c.order_index,
    COUNT(m.id) as module_count,
    SUM(m.estimated_minutes) as total_minutes
FROM courses c
LEFT JOIN modules m ON c.id = m.course_id
GROUP BY c.id, c.title, c.order_index
ORDER BY c.order_index;
```

## 🎯 Success Criteria

Your database is ready when:
- ✅ All required tables exist with proper structure
- ✅ Foreign key relationships are correctly established
- ✅ Test data can be inserted and queried successfully
- ✅ Seeding scripts run without errors
- ✅ Expected number of courses, modules, and lessons are created

**Your AI Masterclass platform database is now ready for the complete seeding system!** 🎉
