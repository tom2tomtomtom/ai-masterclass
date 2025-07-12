const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://fsohtauqtcftdjcjfdpq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzb2h0YXVxdGNmdGRqY2pmZHBxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIyNjc4MCwiZXhwIjoyMDY3ODAyNzgwfQ.vLRzjcMIrpn8m3nEDI7pE7bSZg20Msdw60CHcsV1otI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedExistingSchema() {
  try {
    console.log('🌱 Seeding Course Data to Existing Schema...');
    console.log('================================================');
    
    // Check current schema
    console.log('🔍 Checking current schema...');
    const { data: existingCourses, error: schemaError } = await supabase
      .from('courses')
      .select('*')
      .limit(1);
    
    if (schemaError) {
      console.log('❌ Schema error:', schemaError.message);
      return { success: false, error: schemaError.message };
    }
    
    console.log('✅ Current schema detected');
    console.log('📊 Sample course:', existingCourses[0] || 'No existing courses');
    
    // Clear existing courses
    console.log('🧹 Clearing existing courses...');
    const { error: clearError } = await supabase
      .from('courses')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (clearError) {
      console.log('⚠️ Clear error (may be normal):', clearError.message);
    } else {
      console.log('✅ Existing courses cleared');
    }
    
    // Course data adapted to existing schema
    const coursesData = [
      {
        title: 'AI Fundamentals',
        description: 'Master the basics of AI and prompt engineering. Learn to communicate effectively with AI systems and understand their capabilities.',
        level: 1,
        duration_minutes: 720, // 12 hours * 60 minutes
        prerequisites: ['Basic computer literacy'],
        learning_objectives: ['Understand AI basics', 'Write effective prompts', 'Use AI tools productively']
      },
      {
        title: 'Claude Mastery',
        description: 'Complete guide to using Claude AI effectively. From basic conversations to advanced reasoning tasks.',
        level: 1,
        duration_minutes: 480, // 8 hours * 60 minutes
        prerequisites: ['AI Fundamentals'],
        learning_objectives: ['Master Claude interface', 'Advanced prompt techniques', 'Project-based learning']
      },
      {
        title: 'ChatGPT Professional',
        description: 'Professional-level ChatGPT usage and strategies. Learn to integrate ChatGPT into your workflow.',
        level: 2,
        duration_minutes: 600, // 10 hours * 60 minutes
        prerequisites: ['AI Fundamentals', 'Claude Mastery'],
        learning_objectives: ['Professional ChatGPT usage', 'Workflow integration', 'Advanced techniques']
      },
      {
        title: 'AI in Business',
        description: 'Apply AI solutions to real business problems. Learn to identify opportunities and implement AI solutions.',
        level: 2,
        duration_minutes: 900, // 15 hours * 60 minutes
        prerequisites: ['Claude Mastery', 'ChatGPT Professional'],
        learning_objectives: ['Business AI applications', 'ROI measurement', 'Implementation strategies']
      },
      {
        title: 'Advanced AI Techniques',
        description: 'Master advanced AI concepts and applications. Chain of thought, few-shot learning, and complex reasoning.',
        level: 3,
        duration_minutes: 1080, // 18 hours * 60 minutes
        prerequisites: ['AI in Business'],
        learning_objectives: ['Advanced prompting', 'Complex reasoning', 'AI system design']
      },
      {
        title: 'AI Automation Workflows',
        description: 'Build automated workflows with AI tools. Use Zapier, n8n, and other automation platforms with AI.',
        level: 3,
        duration_minutes: 1200, // 20 hours * 60 minutes
        prerequisites: ['Advanced AI Techniques'],
        learning_objectives: ['Workflow automation', 'AI integration', 'Process optimization']
      }
    ];
    
    console.log('📚 Inserting courses...');
    const { data: insertedCourses, error: coursesError } = await supabase
      .from('courses')
      .insert(coursesData)
      .select();
    
    if (coursesError) {
      console.error('❌ Error inserting courses:', coursesError);
      return { success: false, error: coursesError.message };
    }
    
    console.log('✅ Inserted', insertedCourses.length, 'courses');
    console.log('📋 Course titles:', insertedCourses.map(c => c.title));
    
    // Test the API endpoint
    console.log('🔌 Testing API endpoint...');
    
    try {
      const response = await fetch('https://web-production-98afb.up.railway.app/api/courses');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API test successful:', data.success);
        console.log('📚 API returned', data.data?.length || 0, 'courses');
      } else {
        console.log('⚠️ API test failed:', response.status, response.statusText);
      }
    } catch (fetchError) {
      console.log('⚠️ API test error:', fetchError.message);
    }
    
    console.log('🎉 COURSE SEEDING COMPLETE!');
    console.log('============================');
    console.log('✅ Database populated with', insertedCourses.length, 'courses');
    console.log('✅ Courses adapted to existing schema');
    console.log('✅ Ready for user testing!');
    
    return {
      success: true,
      message: 'Course seeding completed successfully',
      data: {
        courses: insertedCourses.length,
        courseList: insertedCourses.map(c => ({ id: c.id, title: c.title, level: c.level }))
      }
    };
    
  } catch (error) {
    console.error('❌ Course seeding error:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { seedExistingSchema };

// Run if called directly
if (require.main === module) {
  seedExistingSchema()
    .then((result) => {
      console.log('🎉 Seeding completed!');
      console.log('Result:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}