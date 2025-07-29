const { createClient } = require('@supabase/supabase-js');

// Load environment variables first
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  console.error('   SUPABASE_URL:', supabaseUrl || 'Not set');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedAiPlaygroundData() {
  console.log('🌱 Starting AI Playground data seeding...');

  try {
    // 1. Seed AI Models
    console.log('📡 Seeding AI models...');
    const aiModels = [
      {
        name: 'GPT-4',
        provider: 'OpenAI',
        api_endpoint: 'https://api.openai.com/v1/chat/completions',
        is_active: true
      },
      {
        name: 'Claude',
        provider: 'Anthropic',
        api_endpoint: 'https://api.anthropic.com/v1/messages',
        is_active: true
      },
      {
        name: 'Gemini',
        provider: 'Google',
        api_endpoint: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
        is_active: true
      }
    ];

    const { data: aiModelsData, error: aiModelsError } = await supabase
      .from('ai_models')
      .upsert(aiModels, { onConflict: 'name' })
      .select();

    if (aiModelsError) {
      console.error('❌ Error seeding AI models:', JSON.stringify(aiModelsError, null, 2));
      return;
    }

    console.log(`✅ Seeded ${aiModelsData.length} AI models`);

    // 2. Seed Sample Prompt Templates
    console.log('📝 Seeding sample prompt templates...');
    
    // Get AI model IDs for referencing
    const gptModel = aiModelsData.find(m => m.name === 'GPT-4');
    const claudeModel = aiModelsData.find(m => m.name === 'Claude');
    const geminiModel = aiModelsData.find(m => m.name === 'Gemini');

    const promptTemplates = [
      {
        title: 'Professional Email Response',
        description: 'Generate professional email responses for customer service and business communication',
        content: `You are a professional customer service representative. Your task is to write a polite, helpful, and professional email response.

Context: {{context}}
Customer inquiry: {{customer_message}}

Please respond with:
1. A warm greeting
2. Acknowledgment of their concern
3. Clear resolution or next steps
4. Professional closing

Tone: Professional, empathetic, solution-focused`,
        industry_category: 'customer_service',
        use_case_category: 'email_response',
        recommended_ai_model_id: gptModel?.id,
        is_public: true,
        usage_count: 0
      },
      {
        title: 'Content Marketing Strategy',
        description: 'Create comprehensive content marketing strategies for various industries',
        content: `You are a content marketing strategist with expertise in digital marketing and audience engagement.

Industry: {{industry}}
Target audience: {{target_audience}}
Business goals: {{business_goals}}
Content budget: {{budget}}

Create a detailed content marketing strategy including:
1. Content pillars and themes
2. Content calendar outline (3 months)
3. Platform-specific recommendations
4. KPIs and success metrics
5. Content format recommendations

Focus on ROI-driven recommendations with specific actionable steps.`,
        industry_category: 'marketing',
        use_case_category: 'content_strategy',
        recommended_ai_model_id: claudeModel?.id,
        is_public: true,
        usage_count: 0
      },
      {
        title: 'Technical Documentation Writer',
        description: 'Create clear, comprehensive technical documentation for software and systems',
        content: `You are a technical writer specializing in creating clear, user-friendly documentation.

System/Feature: {{feature_name}}
Audience: {{audience_level}} (beginner/intermediate/advanced)
Technology stack: {{tech_stack}}

Create documentation that includes:
1. Overview and purpose
2. Prerequisites and setup requirements
3. Step-by-step implementation guide
4. Code examples with explanations
5. Troubleshooting common issues
6. Best practices and recommendations

Use clear headers, bullet points, and code blocks for readability.`,
        industry_category: 'technology',
        use_case_category: 'documentation',
        recommended_ai_model_id: claudeModel?.id,
        is_public: true,
        usage_count: 0
      },
      {
        title: 'Data Analysis Interpreter',
        description: 'Analyze data patterns and create actionable business insights',
        content: `You are a data analyst who excels at interpreting data and providing business insights.

Dataset context: {{dataset_description}}
Business question: {{business_question}}
Key metrics: {{key_metrics}}

Analyze the data and provide:
1. Key findings and patterns
2. Statistical significance of trends
3. Business implications
4. Actionable recommendations
5. Potential risks or limitations
6. Suggested next steps for deeper analysis

Present findings in executive summary format with supporting details.`,
        industry_category: 'analytics',
        use_case_category: 'data_analysis',
        recommended_ai_model_id: geminiModel?.id,
        is_public: true,
        usage_count: 0
      },
      {
        title: 'Healthcare Patient Communication',
        description: 'Draft clear, empathetic communication for healthcare providers',
        content: `You are a healthcare communication specialist focused on patient-centered communication.

Patient situation: {{patient_situation}}
Medical context: {{medical_context}}
Communication type: {{communication_type}} (appointment reminder, test results, treatment plan, etc.)

Create patient communication that:
1. Uses clear, non-medical language
2. Shows empathy and understanding
3. Provides necessary information
4. Includes next steps or actions
5. Maintains professional boundaries
6. Follows healthcare communication best practices

Tone: Caring, professional, informative, respectful`,
        industry_category: 'healthcare',
        use_case_category: 'patient_communication',
        recommended_ai_model_id: gptModel?.id,
        is_public: true,
        usage_count: 0
      }
    ];

    const { data: templatesData, error: templatesError } = await supabase
      .from('prompt_templates')
      .insert(promptTemplates)
      .select();

    if (templatesError) {
      console.error('❌ Error seeding prompt templates:', templatesError);
      return;
    }

    console.log(`✅ Seeded ${templatesData.length} prompt templates`);

    // 3. Seed Achievement Types (for reference)
    console.log('🏆 Achievement types that will be tracked:');
    const achievementTypes = [
      'first_comparison - Completed first AI model comparison',
      'template_master - Created 5 custom templates',
      'community_contributor - Made 10 community posts',
      'mentor_graduate - Completed mentorship program',
      'power_user - Used platform for 30+ days',
      'ai_explorer - Tried all 3 AI models',
      'lesson_champion - Completed 10 lessons with practice gates'
    ];

    achievementTypes.forEach(achievement => {
      console.log(`   • ${achievement}`);
    });

    console.log('\n🎉 AI Playground data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${aiModelsData.length} AI models seeded`);
    console.log(`   • ${templatesData.length} prompt templates seeded`);
    console.log(`   • ${achievementTypes.length} achievement types defined`);

  } catch (error) {
    console.error('❌ Fatal error during seeding:', error);
    process.exit(1);
  }
}

// Run seeding if called directly
if (require.main === module) {
  require('dotenv').config();
  seedAiPlaygroundData()
    .then(() => {
      console.log('✅ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = { seedAiPlaygroundData };