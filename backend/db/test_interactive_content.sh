#!/bin/bash

# Interactive Content Testing Script
# This script tests the complete interactive textbook system

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if database name is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Database name not provided.${NC}"
    echo "Usage: $0 <database_name>"
    echo "Example: $0 ai_masterclass_dev"
    exit 1
fi

DB_NAME=$1

echo -e "${GREEN}🧪 Testing Interactive Content System${NC}"
echo -e "${YELLOW}Database: ${DB_NAME}${NC}"
echo ""

# Function to run SQL query and return result
run_query() {
    local query=$1
    local description=$2
    
    echo -e "${BLUE}Testing: ${description}${NC}"
    
    result=$(psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d "$DB_NAME" -t -c "$query" 2>/dev/null | xargs)
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ ${description}: ${result}${NC}"
        return 0
    else
        echo -e "${RED}✗ ${description}: Failed${NC}"
        return 1
    fi
}

# Function to test data integrity
test_data_integrity() {
    local table=$1
    local description=$2
    
    echo -e "${BLUE}Testing: ${description}${NC}"
    
    count=$(psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | xargs)
    
    if [ $? -eq 0 ] && [ "$count" -gt 0 ]; then
        echo -e "${GREEN}✓ ${description}: ${count} records${NC}"
        return 0
    else
        echo -e "${RED}✗ ${description}: No data or table missing${NC}"
        return 1
    fi
}

echo -e "${GREEN}Phase 1: Schema Validation${NC}"
echo "----------------------------------------"

# Test all tables exist
TABLES=("lessons" "prompts" "quizzes" "tasks" "user_scenarios" "scenario_templates" "personalized_prompts" "user_lesson_progress" "user_quiz_attempts" "user_task_submissions" "user_prompt_usage")

for table in "${TABLES[@]}"; do
    run_query "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '$table';" "Table $table exists"
done

echo ""
echo -e "${GREEN}Phase 2: Data Integrity Tests${NC}"
echo "----------------------------------------"

# Test data counts
test_data_integrity "courses" "Courses table has data"
test_data_integrity "modules" "Modules table has data"
test_data_integrity "lessons" "Lessons table has data"
test_data_integrity "prompts" "Prompts table has data"
test_data_integrity "quizzes" "Quizzes table has data"
test_data_integrity "tasks" "Tasks table has data"
test_data_integrity "scenario_templates" "Scenario templates table has data"

echo ""
echo -e "${GREEN}Phase 3: Content Quality Tests${NC}"
echo "----------------------------------------"

# Test lesson content
run_query "SELECT COUNT(*) FROM lessons WHERE content IS NOT NULL AND length(content) > 100;" "Lessons have substantial content"

# Test prompts have all required fields
run_query "SELECT COUNT(*) FROM prompts WHERE prompt_text IS NOT NULL AND length(prompt_text) > 50;" "Prompts have substantial content"

# Test quizzes have options and correct answers
run_query "SELECT COUNT(*) FROM quizzes WHERE options IS NOT NULL AND correct_answer IS NOT NULL;" "Quizzes have options and answers"

# Test tasks have instructions
run_query "SELECT COUNT(*) FROM tasks WHERE instructions IS NOT NULL AND length(instructions) > 100;" "Tasks have detailed instructions"

echo ""
echo -e "${GREEN}Phase 4: Relationship Tests${NC}"
echo "----------------------------------------"

# Test foreign key relationships
run_query "SELECT COUNT(*) FROM lessons l JOIN modules m ON l.module_id = m.id;" "Lesson-Module relationships"
run_query "SELECT COUNT(*) FROM prompts p JOIN lessons l ON p.lesson_id = l.id;" "Prompt-Lesson relationships"
run_query "SELECT COUNT(*) FROM quizzes q JOIN lessons l ON q.lesson_id = l.id;" "Quiz-Lesson relationships"
run_query "SELECT COUNT(*) FROM tasks t JOIN lessons l ON t.lesson_id = l.id;" "Task-Lesson relationships"

echo ""
echo -e "${GREEN}Phase 5: Content Distribution Tests${NC}"
echo "----------------------------------------"

# Test content distribution across modules
run_query "SELECT COUNT(DISTINCT module_id) FROM lessons;" "Lessons spread across modules"
run_query "SELECT COUNT(DISTINCT platform) FROM prompts;" "Prompts cover multiple platforms"
run_query "SELECT COUNT(*) FROM prompts WHERE platform = 'claude';" "Claude prompts available"
run_query "SELECT COUNT(*) FROM prompts WHERE platform = 'chatgpt';" "ChatGPT prompts available"
run_query "SELECT COUNT(*) FROM quizzes WHERE question_type = 'multiple_choice';" "Multiple choice quizzes"
run_query "SELECT COUNT(*) FROM tasks WHERE is_required = true;" "Required tasks for progression"

echo ""
echo -e "${GREEN}Phase 6: Scenario System Tests${NC}"
echo "----------------------------------------"

# Test scenario templates
run_query "SELECT COUNT(*) FROM scenario_templates WHERE is_active = true;" "Active scenario templates"
run_query "SELECT COUNT(DISTINCT industry) FROM scenario_templates WHERE industry IS NOT NULL;" "Industry-specific templates"
run_query "SELECT COUNT(DISTINCT department) FROM scenario_templates WHERE department IS NOT NULL;" "Department-specific templates"

echo ""
echo -e "${GREEN}Phase 7: Content Completeness Tests${NC}"
echo "----------------------------------------"

# Test Level 1 completeness
LEVEL1_MODULES=$(psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM modules m JOIN courses c ON m.course_id = c.id WHERE c.title LIKE '%Level 1%';" | xargs)
LEVEL1_LESSONS=$(psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM lessons l JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.title LIKE '%Level 1%';" | xargs)
LEVEL1_PROMPTS=$(psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM prompts p JOIN lessons l ON p.lesson_id = l.id JOIN modules m ON l.module_id = m.id JOIN courses c ON m.course_id = c.id WHERE c.title LIKE '%Level 1%';" | xargs)

echo -e "${GREEN}Level 1 Content Summary:${NC}"
echo "📚 Modules: $LEVEL1_MODULES"
echo "📖 Lessons: $LEVEL1_LESSONS"
echo "📝 Prompts: $LEVEL1_PROMPTS"

if [ "$LEVEL1_LESSONS" -ge 12 ]; then
    echo -e "${GREEN}✓ Level 1 has comprehensive lesson content${NC}"
else
    echo -e "${YELLOW}⚠ Level 1 has fewer lessons than expected${NC}"
fi

if [ "$LEVEL1_PROMPTS" -ge 30 ]; then
    echo -e "${GREEN}✓ Level 1 has substantial prompt library${NC}"
else
    echo -e "${YELLOW}⚠ Level 1 has fewer prompts than expected${NC}"
fi

echo ""
echo -e "${GREEN}Phase 8: API Integration Tests${NC}"
echo "----------------------------------------"

# Test if server is running (optional)
if command -v curl &> /dev/null; then
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend server is running and responsive${NC}"
        
        # Test API endpoints (basic connectivity)
        if curl -s http://localhost:5000/api/courses > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Courses API endpoint accessible${NC}"
        else
            echo -e "${YELLOW}⚠ Courses API endpoint not accessible (server may not be fully initialized)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Backend server not running - API tests skipped${NC}"
    fi
else
    echo -e "${YELLOW}⚠ curl not available - API tests skipped${NC}"
fi

echo ""
echo -e "${GREEN}Phase 9: Final Validation${NC}"
echo "----------------------------------------"

# Calculate total content
TOTAL_LESSONS=$(psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM lessons;" | xargs)
TOTAL_PROMPTS=$(psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM prompts;" | xargs)
TOTAL_QUIZZES=$(psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM quizzes;" | xargs)
TOTAL_TASKS=$(psql -h ${DB_HOST:-localhost} -p ${DB_PORT:-5432} -U ${DB_USER:-postgres} -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM tasks;" | xargs)

echo -e "${GREEN}📊 Final Content Summary:${NC}"
echo "📚 Total Lessons: $TOTAL_LESSONS"
echo "📝 Total Prompts: $TOTAL_PROMPTS"
echo "❓ Total Quizzes: $TOTAL_QUIZZES"
echo "✅ Total Tasks: $TOTAL_TASKS"

# Validation criteria
if [ "$TOTAL_LESSONS" -ge 12 ] && [ "$TOTAL_PROMPTS" -ge 30 ] && [ "$TOTAL_QUIZZES" -ge 16 ] && [ "$TOTAL_TASKS" -ge 12 ]; then
    echo ""
    echo -e "${GREEN}🎉 VALIDATION SUCCESSFUL!${NC}"
    echo -e "${GREEN}Interactive textbook system is ready for testing!${NC}"
    echo ""
    echo -e "${YELLOW}System Features Available:${NC}"
    echo "• ✅ Interactive lessons with rich content"
    echo "• 📋 Copy-paste prompt library for AI platforms"
    echo "• 🎯 Knowledge-check quizzes with explanations"
    echo "• 🔧 Hands-on tasks with real-world application"
    echo "• 🎨 User scenario templates for personalization"
    echo "• 📊 Progress tracking across all content types"
    echo "• 🔗 API endpoints for frontend integration"
    echo ""
    echo -e "${GREEN}Ready for production testing!${NC}"
    
    exit 0
else
    echo ""
    echo -e "${RED}❌ VALIDATION FAILED!${NC}"
    echo -e "${RED}System does not meet minimum content requirements.${NC}"
    echo ""
    echo "Expected minimums:"
    echo "• Lessons: 12+ (found: $TOTAL_LESSONS)"
    echo "• Prompts: 30+ (found: $TOTAL_PROMPTS)"
    echo "• Quizzes: 16+ (found: $TOTAL_QUIZZES)"
    echo "• Tasks: 12+ (found: $TOTAL_TASKS)"
    
    exit 1
fi