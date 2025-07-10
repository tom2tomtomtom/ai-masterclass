#!/bin/bash

# Interactive Content Setup Script
# This script sets up the new interactive textbook features for the AI Masterclass

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if database name is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Database name not provided.${NC}"
    echo "Usage: $0 <database_name>"
    echo "Example: $0 ai_masterclass_dev"
    exit 1
fi

DB_NAME=$1

echo -e "${GREEN}🚀 Setting up Interactive Content for AI Masterclass${NC}"
echo -e "${YELLOW}Database: ${DB_NAME}${NC}"
echo ""

# Function to run SQL file
run_sql_file() {
    local file=$1
    local description=$2
    
    echo -e "${YELLOW}📋 ${description}...${NC}"
    
    if [ -f "$file" ]; then
        if psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d "$DB_NAME" -f "$file" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ ${description} completed${NC}"
        else
            echo -e "${RED}✗ ${description} failed${NC}"
            echo "Check the SQL file: $file"
            exit 1
        fi
    else
        echo -e "${RED}✗ File not found: $file${NC}"
        exit 1
    fi
}

# Function to run Node.js seeder
run_seeder() {
    local file=$1
    local description=$2
    
    echo -e "${YELLOW}📦 ${description}...${NC}"
    
    if [ -f "$file" ]; then
        if node "$file" "$DB_NAME" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ ${description} completed${NC}"
        else
            echo -e "${RED}✗ ${description} failed${NC}"
            echo "Check the seeder file: $file"
            exit 1
        fi
    else
        echo -e "${RED}✗ File not found: $file${NC}"
        exit 1
    fi
}

echo -e "${GREEN}Phase 1: Database Schema Setup${NC}"
echo "----------------------------------------"

# Apply new schemas
run_sql_file "interactive_content_schema.sql" "Creating interactive content tables"
run_sql_file "user_scenarios_schema.sql" "Creating user scenarios and personalization tables"

echo ""
echo -e "${GREEN}Phase 2: Seed Content${NC}"
echo "----------------------------------------"

# Seed scenario templates first (no dependencies)
run_seeder "seedScenarioTemplates.js" "Seeding scenario templates"

# Seed lessons (depends on modules)
run_seeder "seedLessons.js" "Seeding initial lesson content"
run_seeder "seedLessonsRemaining.js" "Seeding remaining lesson content"

# Seed prompts (depends on lessons)
run_seeder "seedPrompts.js" "Seeding initial copy-paste prompts"
run_seeder "seedPromptsRemaining.js" "Seeding remaining copy-paste prompts"

# Seed quizzes (depends on lessons)
run_seeder "seedQuizzes.js" "Seeding initial interactive quizzes"
run_seeder "seedQuizzesRemaining.js" "Seeding remaining interactive quizzes"

# Seed tasks (depends on lessons)
run_seeder "seedTasks.js" "Seeding initial practical tasks"
run_seeder "seedTasksRemaining.js" "Seeding remaining practical tasks"

echo ""
echo -e "${GREEN}Phase 3: Verification${NC}"
echo "----------------------------------------"

echo -e "${YELLOW}📊 Verifying content counts...${NC}"

# Count records in each table
LESSON_COUNT=$(psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM lessons;" | xargs)
PROMPT_COUNT=$(psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM prompts;" | xargs)
QUIZ_COUNT=$(psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM quizzes;" | xargs)
TASK_COUNT=$(psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM tasks;" | xargs)
TEMPLATE_COUNT=$(psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM scenario_templates;" | xargs)

echo "📚 Lessons: $LESSON_COUNT"
echo "📝 Prompts: $PROMPT_COUNT"
echo "❓ Quizzes: $QUIZ_COUNT"
echo "✅ Tasks: $TASK_COUNT"
echo "📋 Scenario Templates: $TEMPLATE_COUNT"

echo ""
echo -e "${GREEN}🎉 Interactive Content Setup Complete!${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Test the new lesson structure in your frontend"
echo "2. Implement user scenario collection UI"
echo "3. Add personalized content generation features"
echo "4. Create progress tracking for the new content types"
echo ""
echo -e "${GREEN}New Features Available:${NC}"
echo "• 📖 Rich lesson content with embedded examples"
echo "• 📋 Copy-paste prompt templates for all AI platforms"
echo "• 🎯 Interactive quizzes with explanations"
echo "• ✋ Hands-on tasks with real-world application"
echo "• 🎨 User scenario templates for personalization"
echo "• 📊 Progress tracking for all content types"
echo ""
echo -e "${YELLOW}Database Tables Created:${NC}"
echo "• lessons - Rich text lessons with learning objectives"
echo "• prompts - Copy-paste templates organized by platform"
echo "• quizzes - Interactive questions with explanations"
echo "• tasks - Practical exercises with validation criteria"
echo "• user_scenarios - Real work situations for personalization"
echo "• scenario_templates - Common workplace scenarios"
echo "• personalized_* tables - AI-generated custom content"
echo "• user_*_progress tables - Detailed progress tracking"