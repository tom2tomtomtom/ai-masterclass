const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://fsohtauqtcftdjcjfdpq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY environment variable not set");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('Setting up Supabase database...');
    
    // Create users table
    const { data: usersData, error: usersError } = await supabase.rpc('create_users_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (usersError) {
      console.error('Error creating users table:', usersError);
    } else {
      console.log('✅ Users table created successfully');
    }

    // Create courses table
    const { data: coursesData, error: coursesError } = await supabase.rpc('create_courses_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS courses (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          level INTEGER DEFAULT 1,
          duration_minutes INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (coursesError) {
      console.error('Error creating courses table:', coursesError);
    } else {
      console.log('✅ Courses table created successfully');
    }

    // Create lessons table
    const { data: lessonsData, error: lessonsError } = await supabase.rpc('create_lessons_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS lessons (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          content TEXT,
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (lessonsError) {
      console.error('Error creating lessons table:', lessonsError);
    } else {
      console.log('✅ Lessons table created successfully');
    }

    // Create user_progress table
    const { data: progressData, error: progressError } = await supabase.rpc('create_user_progress_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_progress (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
          lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
          completed_at TIMESTAMP WITH TIME ZONE,
          progress_percentage INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (progressError) {
      console.error('Error creating user_progress table:', progressError);
    } else {
      console.log('✅ User progress table created successfully');
    }

    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('Database setup error:', error);
    throw error;
  }
}

module.exports = { setupDatabase };

// Run if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('Database setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
}