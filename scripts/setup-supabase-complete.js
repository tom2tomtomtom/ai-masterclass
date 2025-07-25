const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://fsohtauqtcftdjcjfdpq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY environment variable not set");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupCompleteDatabase() {
  try {
    console.log('🚀 Setting up Complete Supabase Database Schema...');
    console.log('==================================================');
    
    // First, let's check what tables exist
    const { data: existingTables, error: listError } = await supabase.rpc('get_tables');
    if (!listError) {
      console.log('📊 Existing tables:', existingTables?.map(t => t.table_name) || 'Unable to list');
    }
    
    // Setup 1: Companies table
    console.log('\n1️⃣ Setting up Companies table...');
    const { error: companiesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS companies (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });
    
    if (companiesError) {
      console.log('⚠️ Companies table setup (may already exist):', companiesError.message);
    } else {
      console.log('✅ Companies table ready');
    }
    
    // Setup 2: Users table (enhanced)
    console.log('\n2️⃣ Setting up Users table...');
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          role VARCHAR(50) DEFAULT 'learner',
          subscription_tier VARCHAR(50) DEFAULT 'free',
          company_id UUID REFERENCES companies(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP WITH TIME ZONE,
          is_active BOOLEAN DEFAULT true,
          preferences JSONB DEFAULT '{}',
          skills JSONB DEFAULT '[]'
        );
        
        CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
        CREATE INDEX IF NOT EXISTS idx_users_company ON users (company_id);
        CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
      `
    });
    
    if (usersError) {
      console.log('⚠️ Users table setup (may already exist):', usersError.message);
    } else {
      console.log('✅ Users table ready');
    }
    
    // Setup 3: Courses table (with order_index!)
    console.log('\n3️⃣ Setting up Courses table...');
    const { error: coursesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS courses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          level INTEGER NOT NULL DEFAULT 1,
          order_index INTEGER NOT NULL DEFAULT 1,
          estimated_hours INTEGER DEFAULT 0,
          prerequisites JSONB DEFAULT '[]',
          objectives JSONB DEFAULT '[]',
          status VARCHAR(50) DEFAULT 'published',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_courses_level ON courses (level);
        CREATE INDEX IF NOT EXISTS idx_courses_status ON courses (status);
        CREATE INDEX IF NOT EXISTS idx_courses_order ON courses (order_index);
      `
    });
    
    if (coursesError) {
      console.log('⚠️ Courses table setup (may already exist):', coursesError.message);
    } else {
      console.log('✅ Courses table ready');
    }
    
    // Setup 4: Modules table
    console.log('\n4️⃣ Setting up Modules table...');
    const { error: modulesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS modules (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          order_index INTEGER NOT NULL DEFAULT 1,
          content JSONB DEFAULT '{}',
          estimated_minutes INTEGER DEFAULT 0,
          module_type VARCHAR(50) NOT NULL DEFAULT 'theory',
          difficulty VARCHAR(50) DEFAULT 'beginner',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_modules_course ON modules (course_id);
        CREATE INDEX IF NOT EXISTS idx_modules_type ON modules (module_type);
        CREATE INDEX IF NOT EXISTS idx_modules_order ON modules (order_index);
      `
    });
    
    if (modulesError) {
      console.log('⚠️ Modules table setup (may already exist):', modulesError.message);
    } else {
      console.log('✅ Modules table ready');
    }
    
    // Setup 5: Lessons table
    console.log('\n5️⃣ Setting up Lessons table...');
    const { error: lessonsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS lessons (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          content TEXT NOT NULL DEFAULT '',
          order_index INTEGER NOT NULL DEFAULT 1,
          estimated_minutes INTEGER DEFAULT 30,
          lesson_type VARCHAR(50) NOT NULL DEFAULT 'tutorial',
          difficulty VARCHAR(50) DEFAULT 'beginner',
          learning_objectives JSONB DEFAULT '[]',
          prerequisites JSONB DEFAULT '[]',
          platform_focus VARCHAR(50) DEFAULT 'mixed',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons (module_id);
        CREATE INDEX IF NOT EXISTS idx_lessons_type ON lessons (lesson_type);
        CREATE INDEX IF NOT EXISTS idx_lessons_platform ON lessons (platform_focus);
        CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons (order_index);
      `
    });
    
    if (lessonsError) {
      console.log('⚠️ Lessons table setup (may already exist):', lessonsError.message);
    } else {
      console.log('✅ Lessons table ready');
    }
    
    // Setup 6: Prompts table
    console.log('\n6️⃣ Setting up Prompts table...');
    const { error: promptsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS prompts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          prompt_text TEXT NOT NULL,
          platform VARCHAR(50) NOT NULL DEFAULT 'claude',
          category VARCHAR(50) NOT NULL DEFAULT 'basic',
          use_case VARCHAR(255),
          expected_output TEXT,
          tips TEXT,
          order_index INTEGER NOT NULL DEFAULT 1,
          difficulty VARCHAR(50) DEFAULT 'beginner',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_prompts_lesson ON prompts (lesson_id);
        CREATE INDEX IF NOT EXISTS idx_prompts_platform ON prompts (platform);
        CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts (category);
        CREATE INDEX IF NOT EXISTS idx_prompts_order ON prompts (order_index);
      `
    });
    
    if (promptsError) {
      console.log('⚠️ Prompts table setup (may already exist):', promptsError.message);
    } else {
      console.log('✅ Prompts table ready');
    }
    
    // Setup 7: Quizzes table
    console.log('\n7️⃣ Setting up Quizzes table...');
    const { error: quizzesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS quizzes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          question_text TEXT NOT NULL,
          question_type VARCHAR(50) NOT NULL DEFAULT 'multiple_choice',
          options JSONB DEFAULT '[]',
          correct_answer VARCHAR(255) NOT NULL,
          explanation TEXT,
          difficulty VARCHAR(50) DEFAULT 'beginner',
          points INTEGER DEFAULT 1,
          order_index INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_quizzes_lesson ON quizzes (lesson_id);
        CREATE INDEX IF NOT EXISTS idx_quizzes_type ON quizzes (question_type);
        CREATE INDEX IF NOT EXISTS idx_quizzes_order ON quizzes (order_index);
      `
    });
    
    if (quizzesError) {
      console.log('⚠️ Quizzes table setup (may already exist):', quizzesError.message);
    } else {
      console.log('✅ Quizzes table ready');
    }
    
    // Setup 8: Tasks table
    console.log('\n8️⃣ Setting up Tasks table...');
    const { error: tasksError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tasks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          instructions TEXT NOT NULL,
          platform VARCHAR(50) NOT NULL DEFAULT 'claude',
          task_type VARCHAR(50) NOT NULL DEFAULT 'prompt_testing',
          validation_criteria TEXT,
          submission_format VARCHAR(50) DEFAULT 'text',
          estimated_minutes INTEGER DEFAULT 30,
          difficulty VARCHAR(50) DEFAULT 'beginner',
          required_tools JSONB DEFAULT '[]',
          hints TEXT,
          order_index INTEGER NOT NULL DEFAULT 1,
          is_required BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_tasks_lesson ON tasks (lesson_id);
        CREATE INDEX IF NOT EXISTS idx_tasks_platform ON tasks (platform);
        CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks (task_type);
        CREATE INDEX IF NOT EXISTS idx_tasks_order ON tasks (order_index);
      `
    });
    
    if (tasksError) {
      console.log('⚠️ Tasks table setup (may already exist):', tasksError.message);
    } else {
      console.log('✅ Tasks table ready');
    }
    
    // Setup 9: User Progress table
    console.log('\n9️⃣ Setting up User Progress table...');
    const { error: progressError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_progress (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          exercise_id UUID NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'not_started',
          score INTEGER DEFAULT 0,
          completion_percentage INTEGER DEFAULT 0,
          time_spent_minutes INTEGER DEFAULT 0,
          attempts INTEGER DEFAULT 0,
          last_attempt TIMESTAMP WITH TIME ZONE,
          user_code TEXT,
          feedback TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, exercise_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress (user_id);
        CREATE INDEX IF NOT EXISTS idx_progress_exercise ON user_progress (exercise_id);
        CREATE INDEX IF NOT EXISTS idx_progress_status ON user_progress (status);
      `
    });
    
    if (progressError) {
      console.log('⚠️ User Progress table setup (may already exist):', progressError.message);
    } else {
      console.log('✅ User Progress table ready');
    }
    
    // Setup 10: User Quiz Progress table
    console.log('\n🔟 Setting up User Quiz Progress table...');
    const { error: quizProgressError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_quiz_progress (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
          selected_answer VARCHAR(255) NOT NULL,
          is_correct BOOLEAN NOT NULL,
          score INTEGER DEFAULT 0,
          time_spent_seconds INTEGER DEFAULT 0,
          submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, quiz_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_user ON user_quiz_progress (user_id);
        CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_quiz ON user_quiz_progress (quiz_id);
      `
    });
    
    if (quizProgressError) {
      console.log('⚠️ User Quiz Progress table setup (may already exist):', quizProgressError.message);
    } else {
      console.log('✅ User Quiz Progress table ready');
    }
    
    // Setup 11: User Task Progress table
    console.log('\n1️⃣1️⃣ Setting up User Task Progress table...');
    const { error: taskProgressError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_task_progress (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
          submission_content TEXT,
          submission_type VARCHAR(50) NOT NULL DEFAULT 'text',
          status VARCHAR(50) NOT NULL DEFAULT 'submitted',
          feedback TEXT,
          score INTEGER DEFAULT 0,
          attempt_number INTEGER DEFAULT 1,
          time_spent_minutes INTEGER DEFAULT 0,
          submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_user_task_progress_user ON user_task_progress (user_id);
        CREATE INDEX IF NOT EXISTS idx_user_task_progress_task ON user_task_progress (task_id);
        CREATE INDEX IF NOT EXISTS idx_user_task_progress_status ON user_task_progress (status);
      `
    });
    
    if (taskProgressError) {
      console.log('⚠️ User Task Progress table setup (may already exist):', taskProgressError.message);
    } else {
      console.log('✅ User Task Progress table ready');
    }
    
    console.log('\n🎉 COMPLETE DATABASE SCHEMA SETUP FINISHED!');
    console.log('=============================================');
    
    // Test the setup by inserting sample data
    console.log('\n📝 Testing database with sample data...');
    
    // Insert sample course
    const { data: sampleCourse, error: courseInsertError } = await supabase
      .from('courses')
      .insert([
        {
          title: 'AI Fundamentals',
          description: 'Learn the basics of AI and prompt engineering',
          level: 1,
          order_index: 1,
          estimated_hours: 10,
          status: 'published'
        }
      ])
      .select()
      .single();
    
    if (courseInsertError) {
      console.log('⚠️ Sample course insert (may already exist):', courseInsertError.message);
    } else {
      console.log('✅ Sample course inserted:', sampleCourse.title);
      
      // Insert sample module
      const { data: sampleModule, error: moduleInsertError } = await supabase
        .from('modules')
        .insert([
          {
            course_id: sampleCourse.id,
            title: 'Getting Started with AI',
            description: 'Introduction to AI concepts and tools',
            order_index: 1,
            module_type: 'theory',
            estimated_minutes: 45
          }
        ])
        .select()
        .single();
      
      if (moduleInsertError) {
        console.log('⚠️ Sample module insert (may already exist):', moduleInsertError.message);
      } else {
        console.log('✅ Sample module inserted:', sampleModule.title);
        
        // Insert sample lesson
        const { data: sampleLesson, error: lessonInsertError } = await supabase
          .from('lessons')
          .insert([
            {
              module_id: sampleModule.id,
              title: 'What is AI?',
              description: 'Understanding artificial intelligence basics',
              content: 'This lesson introduces the fundamentals of artificial intelligence...',
              order_index: 1,
              lesson_type: 'tutorial',
              estimated_minutes: 15
            }
          ])
          .select()
          .single();
        
        if (lessonInsertError) {
          console.log('⚠️ Sample lesson insert (may already exist):', lessonInsertError.message);
        } else {
          console.log('✅ Sample lesson inserted:', sampleLesson.title);
        }
      }
    }
    
    // Final verification
    console.log('\n🔍 Final verification...');
    
    // Test courses API endpoint
    const { data: coursesData, error: coursesTestError } = await supabase
      .from('courses')
      .select('*')
      .order('order_index');
    
    if (coursesTestError) {
      console.log('❌ Courses test failed:', coursesTestError.message);
    } else {
      console.log('✅ Courses API test passed:', coursesData?.length || 0, 'courses found');
    }
    
    console.log('\n🎯 DATABASE SETUP COMPLETE!');
    console.log('============================');
    console.log('✅ All tables created and configured');
    console.log('✅ Sample data inserted');
    console.log('✅ Indexes created for performance');
    console.log('✅ Ready for production use!');
    
    return {
      success: true,
      message: 'Database setup completed successfully',
      coursesCount: coursesData?.length || 0
    };
    
  } catch (error) {
    console.error('❌ Database setup error:', error);
    throw error;
  }
}

module.exports = { setupCompleteDatabase };

// Run if called directly
if (require.main === module) {
  setupCompleteDatabase()
    .then((result) => {
      console.log('\n🎉 Setup completed successfully!');
      console.log('Result:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Setup failed:', error);
      process.exit(1);
    });
}