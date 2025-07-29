const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://fsohtauqtcftdjcjfdpq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  logger.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY environment variable not set");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Performance-critical indexes to add
const indexes = [
  // Users table indexes
  {
    name: 'idx_users_email_unique',
    table: 'users',
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users (email);`
  },
  {
    name: 'idx_users_company_id',
    table: 'users',
    sql: `CREATE INDEX IF NOT EXISTS idx_users_company_id ON users (company_id);`
  },
  {
    name: 'idx_users_role',
    table: 'users',
    sql: `CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);`
  },
  {
    name: 'idx_users_active',
    table: 'users',
    sql: `CREATE INDEX IF NOT EXISTS idx_users_active ON users (is_active);`
  },
  
  // Courses table indexes
  {
    name: 'idx_courses_level',
    table: 'courses',
    sql: `CREATE INDEX IF NOT EXISTS idx_courses_level ON courses (level);`
  },
  {
    name: 'idx_courses_status',
    table: 'courses',
    sql: `CREATE INDEX IF NOT EXISTS idx_courses_status ON courses (status);`
  },
  {
    name: 'idx_courses_order_index',
    table: 'courses',
    sql: `CREATE INDEX IF NOT EXISTS idx_courses_order_index ON courses (order_index);`
  },
  {
    name: 'idx_courses_level_order',
    table: 'courses',
    sql: `CREATE INDEX IF NOT EXISTS idx_courses_level_order ON courses (level, order_index);`
  },
  
  // Modules table indexes
  {
    name: 'idx_modules_course_id',
    table: 'modules',
    sql: `CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules (course_id);`
  },
  {
    name: 'idx_modules_order_index',
    table: 'modules',
    sql: `CREATE INDEX IF NOT EXISTS idx_modules_order_index ON modules (order_index);`
  },
  {
    name: 'idx_modules_type',
    table: 'modules',
    sql: `CREATE INDEX IF NOT EXISTS idx_modules_type ON modules (module_type);`
  },
  {
    name: 'idx_modules_course_order',
    table: 'modules',
    sql: `CREATE INDEX IF NOT EXISTS idx_modules_course_order ON modules (course_id, order_index);`
  },
  
  // Lessons table indexes
  {
    name: 'idx_lessons_module_id',
    table: 'lessons',
    sql: `CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons (module_id);`
  },
  {
    name: 'idx_lessons_course_id',
    table: 'lessons',
    sql: `CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons (course_id) WHERE course_id IS NOT NULL;`
  },
  {
    name: 'idx_lessons_order_index',
    table: 'lessons',
    sql: `CREATE INDEX IF NOT EXISTS idx_lessons_order_index ON lessons (order_index);`
  },
  {
    name: 'idx_lessons_type',
    table: 'lessons',
    sql: `CREATE INDEX IF NOT EXISTS idx_lessons_type ON lessons (lesson_type);`
  },
  {
    name: 'idx_lessons_platform',
    table: 'lessons',
    sql: `CREATE INDEX IF NOT EXISTS idx_lessons_platform ON lessons (platform_focus);`
  },
  {
    name: 'idx_lessons_difficulty',
    table: 'lessons',
    sql: `CREATE INDEX IF NOT EXISTS idx_lessons_difficulty ON lessons (difficulty);`
  },
  {
    name: 'idx_lessons_module_order',
    table: 'lessons',
    sql: `CREATE INDEX IF NOT EXISTS idx_lessons_module_order ON lessons (module_id, order_index);`
  },
  
  // Prompts table indexes
  {
    name: 'idx_prompts_lesson_id',
    table: 'prompts',
    sql: `CREATE INDEX IF NOT EXISTS idx_prompts_lesson_id ON prompts (lesson_id);`
  },
  {
    name: 'idx_prompts_platform',
    table: 'prompts',
    sql: `CREATE INDEX IF NOT EXISTS idx_prompts_platform ON prompts (platform);`
  },
  {
    name: 'idx_prompts_category',
    table: 'prompts',
    sql: `CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts (category);`
  },
  {
    name: 'idx_prompts_order_index',
    table: 'prompts',
    sql: `CREATE INDEX IF NOT EXISTS idx_prompts_order_index ON prompts (order_index);`
  },
  {
    name: 'idx_prompts_lesson_order',
    table: 'prompts',
    sql: `CREATE INDEX IF NOT EXISTS idx_prompts_lesson_order ON prompts (lesson_id, order_index);`
  },
  
  // Quizzes table indexes
  {
    name: 'idx_quizzes_lesson_id',
    table: 'quizzes',
    sql: `CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON quizzes (lesson_id);`
  },
  {
    name: 'idx_quizzes_type',
    table: 'quizzes',
    sql: `CREATE INDEX IF NOT EXISTS idx_quizzes_type ON quizzes (question_type);`
  },
  {
    name: 'idx_quizzes_difficulty',
    table: 'quizzes',
    sql: `CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty ON quizzes (difficulty);`
  },
  {
    name: 'idx_quizzes_order_index',
    table: 'quizzes',
    sql: `CREATE INDEX IF NOT EXISTS idx_quizzes_order_index ON quizzes (order_index);`
  },
  {
    name: 'idx_quizzes_lesson_order',
    table: 'quizzes',
    sql: `CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_order ON quizzes (lesson_id, order_index);`
  },
  
  // Tasks table indexes
  {
    name: 'idx_tasks_lesson_id',
    table: 'tasks',
    sql: `CREATE INDEX IF NOT EXISTS idx_tasks_lesson_id ON tasks (lesson_id);`
  },
  {
    name: 'idx_tasks_platform',
    table: 'tasks',
    sql: `CREATE INDEX IF NOT EXISTS idx_tasks_platform ON tasks (platform);`
  },
  {
    name: 'idx_tasks_type',
    table: 'tasks',
    sql: `CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks (task_type);`
  },
  {
    name: 'idx_tasks_difficulty',
    table: 'tasks',
    sql: `CREATE INDEX IF NOT EXISTS idx_tasks_difficulty ON tasks (difficulty);`
  },
  {
    name: 'idx_tasks_required',
    table: 'tasks',
    sql: `CREATE INDEX IF NOT EXISTS idx_tasks_required ON tasks (is_required);`
  },
  {
    name: 'idx_tasks_lesson_order',
    table: 'tasks',
    sql: `CREATE INDEX IF NOT EXISTS idx_tasks_lesson_order ON tasks (lesson_id, order_index);`
  },
  
  // User Progress table indexes
  {
    name: 'idx_user_progress_user_id',
    table: 'user_progress',
    sql: `CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress (user_id);`
  },
  {
    name: 'idx_user_progress_exercise_id',
    table: 'user_progress',
    sql: `CREATE INDEX IF NOT EXISTS idx_user_progress_exercise_id ON user_progress (exercise_id);`
  },
  {
    name: 'idx_user_progress_status',
    table: 'user_progress',
    sql: `CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress (status);`
  },
  {
    name: 'idx_user_progress_user_status',
    table: 'user_progress',
    sql: `CREATE INDEX IF NOT EXISTS idx_user_progress_user_status ON user_progress (user_id, status);`
  },
  {
    name: 'idx_user_progress_updated_at',
    table: 'user_progress',
    sql: `CREATE INDEX IF NOT EXISTS idx_user_progress_updated_at ON user_progress (updated_at DESC);`
  },
  {
    name: 'idx_user_progress_completion',
    table: 'user_progress',
    sql: `CREATE INDEX IF NOT EXISTS idx_user_progress_completion ON user_progress (user_id, completion_percentage) WHERE completion_percentage > 0;`
  },
  
  // User Quiz Progress table indexes
  {
    name: 'idx_user_quiz_progress_user_id',
    table: 'user_quiz_progress',
    sql: `CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_user_id ON user_quiz_progress (user_id);`
  },
  {
    name: 'idx_user_quiz_progress_quiz_id',
    table: 'user_quiz_progress',
    sql: `CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_quiz_id ON user_quiz_progress (quiz_id);`
  },
  {
    name: 'idx_user_quiz_progress_correct',
    table: 'user_quiz_progress',
    sql: `CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_correct ON user_quiz_progress (is_correct);`
  },
  {
    name: 'idx_user_quiz_progress_submitted',
    table: 'user_quiz_progress',
    sql: `CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_submitted ON user_quiz_progress (submitted_at DESC);`
  },
  
  // User Task Progress table indexes
  {
    name: 'idx_user_task_progress_user_id',
    table: 'user_task_progress',
    sql: `CREATE INDEX IF NOT EXISTS idx_user_task_progress_user_id ON user_task_progress (user_id);`
  },
  {
    name: 'idx_user_task_progress_task_id',
    table: 'user_task_progress',
    sql: `CREATE INDEX IF NOT EXISTS idx_user_task_progress_task_id ON user_task_progress (task_id);`
  },
  {
    name: 'idx_user_task_progress_status',
    table: 'user_task_progress',
    sql: `CREATE INDEX IF NOT EXISTS idx_user_task_progress_status ON user_task_progress (status);`
  },
  {
    name: 'idx_user_task_progress_submitted',
    table: 'user_task_progress',
    sql: `CREATE INDEX IF NOT EXISTS idx_user_task_progress_submitted ON user_task_progress (submitted_at DESC);`
  },
  
  // Companies table indexes
  {
    name: 'idx_companies_name_unique',
    table: 'companies',
    sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_name_unique ON companies (name);`
  }
];

async function addDatabaseIndexes() {
  try {
    logger.info('🚀 Starting database index creation...');
    logger.info(`📊 Total indexes to create: ${indexes.length}`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (const index of indexes) {
      try {
        logger.info(`  📝 Creating index: ${index.name} on table ${index.table}`);
        
        // Execute the index creation SQL using Supabase RPC
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: index.sql
        });
        
        if (error) {
          if (error.message.includes('already exists')) {
            logger.info(`  ✅ Index ${index.name} already exists - skipping`);
            successCount++;
          } else {
            logger.info(`  ❌ Failed to create index ${index.name}: ${error.message}`);
            errors.push({ index: index.name, error: error.message });
            errorCount++;
          }
        } else {
          logger.info(`  ✅ Successfully created index: ${index.name}`);
          successCount++;
        }
      } catch (err) {
        logger.info(`  ❌ Error creating index ${index.name}: ${err.message}`);
        errors.push({ index: index.name, error: err.message });
        errorCount++;
      }
    }
    
    logger.info('\\n🎉 Database index creation completed!');
    logger.info(`📊 Final Statistics:`);
    logger.info(`   - Total indexes processed: ${indexes.length}`);
    logger.info(`   - Successfully created/verified: ${successCount}`);
    logger.info(`   - Errors: ${errorCount}`);
    
    if (errors.length > 0) {
      logger.info('\\n❌ Errors encountered:');
      errors.forEach(({ index, error }) => {
        logger.info(`   - ${index}: ${error}`);
      });
    }
    
    // Verify some key indexes
    logger.info('\\n🔍 Verifying key indexes...');
    await verifyIndexes();
    
    return {
      success: errorCount === 0,
      message: `Index creation completed with ${successCount} successes and ${errorCount} errors`,
      successCount,
      errorCount,
      errors
    };
    
  } catch (error) {
    logger.error('❌ Fatal error during index creation:', error);
    throw error;
  }
}

async function verifyIndexes() {
  const keyTables = ['users', 'courses', 'lessons', 'user_progress'];
  
  for (const table of keyTables) {
    try {
      logger.info(`  🔍 Verifying table ${table} exists...`);
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.code === '42P01') {
          logger.info(`  ⚠️ Table ${table} does not exist - indexes cannot be created`);
        } else {
          logger.info(`  ❌ Error accessing table ${table}: ${error.message}`);
        }
      } else {
        logger.info(`  ✅ Table ${table} exists and is accessible`);
      }
    } catch (err) {
      logger.info(`  ❌ Error verifying table ${table}: ${err.message}`);
    }
  }
}

// Performance monitoring queries
async function performanceAnalysis() {
  logger.info('\\n📈 Running performance analysis...');
  
  const queries = [
    {
      name: 'Course count by level',
      query: supabase.from('courses').select('level', { count: 'exact' }).eq('status', 'published')
    },
    {
      name: 'Lessons count',
      query: supabase.from('lessons').select('*', { count: 'exact', head: true })
    },
    {
      name: 'User progress stats',
      query: supabase.from('user_progress').select('status', { count: 'exact', head: true })
    }
  ];
  
  for (const { name, query } of queries) {
    try {
      const startTime = Date.now();
      const result = await query;
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      logger.info(`  📊 ${name}: ${duration}ms (${result.count || 0} records)`);
    } catch (err) {
      logger.info(`  ❌ ${name} failed: ${err.message}`);
    }
  }
}

// Run if called directly
if (require.main === module) {
  addDatabaseIndexes()
    .then(async (result) => {
      logger.info('\\n🎯 Index Creation Result:', result);
      
      // Run performance analysis
      await performanceAnalysis();
      
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      logger.error('\\n💥 Index creation failed:', error);
      process.exit(1);
    });
}

module.exports = { addDatabaseIndexes, verifyIndexes, performanceAnalysis };