// Backend script to update lesson content using service role key
require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const richContent = {
  'Introduction to Google AI & Gemini': `# Introduction to Google AI & Gemini

## Overview of Google's AI Ecosystem
Google has built one of the most comprehensive AI ecosystems in the world, with Gemini as its flagship large language model. This lesson introduces you to the powerful tools and capabilities at your disposal.

## What is Gemini?
Gemini represents Google's most advanced AI model, designed to be:
- **Multimodal**: Understands text, code, audio, image, and video
- **Highly Capable**: Performs well on complex reasoning tasks  
- **Scalable**: Available in multiple sizes (Nano, Pro, Ultra)

## Key Google AI Tools
1. **Gemini Models**: Core AI reasoning and generation
2. **Google AI Studio**: Web-based prompt engineering interface
3. **Vertex AI**: Enterprise-grade AI platform
4. **Bard**: Consumer-facing AI assistant
5. **PaLM API**: Legacy but still powerful model access

## Core Capabilities
- **Code Generation**: Write, debug, and explain code in 20+ languages
- **Document Analysis**: Process PDFs, images, and complex documents
- **Creative Writing**: Generate marketing copy, emails, and creative content
- **Data Analysis**: Interpret charts, extract insights from data
- **Reasoning**: Solve complex multi-step problems

## Getting Started
To begin using Google AI effectively:
1. Set up your Google AI Studio account
2. Obtain API keys for programmatic access
3. Learn the fundamental prompt patterns
4. Practice with real-world scenarios

## Real-World Applications
- Content creation and marketing
- Code development and debugging
- Data analysis and visualization
- Research and information synthesis
- Creative projects and brainstorming

## Best Practices
- Start with clear, specific prompts
- Use examples to guide model behavior
- Iterate on prompts for better results
- Combine multiple tools for complex tasks
- Always verify important information

This comprehensive introduction sets the foundation for mastering Google's AI ecosystem.`,

  'Setting Up Google AI Studio': `# Setting Up Google AI Studio

## What is Google AI Studio?
Google AI Studio is Google's free, web-based developer tool for prototyping with Gemini models. It provides an intuitive interface for:
- Prompt engineering and testing
- Model comparison and evaluation
- API key generation and management
- Code generation for various programming languages

## Step-by-Step Setup Process

### 1. Access Google AI Studio
1. Navigate to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Accept the terms of service
4. Choose your country/region for compliance

### 2. Create Your First Project
1. Click "Create" to start a new prompt
2. Choose your model (Gemini 1.5 Pro recommended for beginners)
3. Set up your workspace preferences
4. Familiarize yourself with the interface layout

### 3. Generate API Keys
1. Click on "Get API key" in the top right
2. Choose "Create API key in new project" or use existing
3. Select the appropriate Google Cloud project
4. Copy and securely store your API key
5. Set up billing if needed for production use

### 4. Understanding the Interface
- **Prompt Box**: Where you write your instructions
- **Response Area**: Model output appears here
- **Settings Panel**: Adjust temperature, token limits
- **History**: Access previous conversations
- **Export Options**: Get code for various languages

## Configuration Options

### Model Selection
- **Gemini 1.5 Pro**: Best for complex reasoning
- **Gemini 1.5 Flash**: Faster responses, lower cost
- **Gemini 1.0 Pro**: Legacy but reliable

### Parameter Tuning
- **Temperature** (0-1): Controls creativity vs consistency
- **Top K** (1-40): Limits vocabulary choices
- **Top P** (0-1): Nucleus sampling parameter
- **Max Output Tokens**: Response length limit

### Safety Settings
- Configure content filtering levels
- Set up harmful content detection
- Adjust safety thresholds as needed

## Best Practices for Setup
1. **Secure Your Keys**: Never share API keys publicly
2. **Start Simple**: Begin with basic prompts
3. **Test Thoroughly**: Try different parameters
4. **Monitor Usage**: Track API calls and costs
5. **Stay Updated**: Google regularly updates features

## Common Setup Issues
- **API Key Not Working**: Check project permissions
- **Rate Limits**: Upgrade to paid tier if needed
- **Regional Restrictions**: Some features vary by location
- **Billing Setup**: Required for high-volume usage

## Next Steps
After setup, you're ready to:
- Experiment with different prompt styles
- Compare model responses
- Generate code for your applications
- Integrate with your existing workflows

This foundation ensures you can leverage Google AI Studio's full potential.`,

  'Gemini Model Variants and Capabilities': `# Gemini Model Variants and Capabilities

## The Gemini Model Family
Google's Gemini represents a family of AI models designed for different use cases, performance requirements, and deployment scenarios. Understanding each variant helps you choose the right tool for your specific needs.

## Gemini 1.5 Pro - The Flagship Model

### Key Capabilities
- **2 Million Token Context**: Processes extremely long documents
- **Multimodal Understanding**: Text, images, audio, video, code
- **Advanced Reasoning**: Complex problem-solving and analysis
- **High-Quality Output**: Professional-grade content generation

### Best Use Cases
- Complex document analysis
- Advanced coding projects
- Research and synthesis tasks
- Creative writing projects
- Multi-step reasoning problems

## Gemini 1.5 Flash - The Speed Champion

### Key Capabilities
- **Fast Response Times**: Under 2 seconds typically
- **Efficient Processing**: Lower computational overhead
- **Good Quality**: Suitable for most applications
- **Cost-Effective**: Significantly cheaper than Pro

### Best Use Cases
- Real-time applications
- High-volume processing
- Quick Q&A responses
- Content suggestions
- Simple coding assistance

## Gemini 1.0 Pro - The Reliable Veteran

### Key Capabilities
- **Proven Reliability**: Extensively tested and stable
- **Good Performance**: Solid across all tasks
- **Predictable Behavior**: Consistent outputs
- **Legacy Support**: Maintained for compatibility

## Decision Framework

### Choose Gemini 1.5 Pro When:
- Maximum quality is essential
- Working with long documents (>100k tokens)
- Complex reasoning required
- Multimodal capabilities needed

### Choose Gemini 1.5 Flash When:
- Speed is critical
- Building user-facing applications
- Processing high volumes
- Cost optimization is important

## Performance Optimization Tips
1. **Clear Prompts**: Specific instructions improve results
2. **Examples**: Show the model what you want
3. **Context**: Provide relevant background information
4. **Iteration**: Refine based on outputs

Understanding these distinctions ensures you select the optimal Gemini variant for each specific task.`
};

async function updateLessonContent() {
  console.log('🚀 Updating lesson content with service role key...');
  
  try {
    // First, check current content
    const { data: lessons, error } = await supabase
      .from('lessons')
      .select('id, title, content')
      .limit(5);
      
    if (error) {
      console.error('❌ Error fetching lessons:', error);
      return;
    }
    
    console.log(`📚 Found ${lessons.length} lessons`);
    
    // Update lessons that match our content
    let updated = 0;
    for (const lesson of lessons) {
      const newContent = richContent[lesson.title];
      
      if (newContent) {
        console.log(`📝 Updating: ${lesson.title}`);
        console.log(`   Old content length: ${lesson.content ? lesson.content.length : 0}`);
        console.log(`   New content length: ${newContent.length}`);
        
        const { error: updateError } = await supabase
          .from('lessons')
          .update({ content: newContent })
          .eq('id', lesson.id);
          
        if (updateError) {
          console.error(`❌ Update failed for ${lesson.title}:`, updateError);
        } else {
          updated++;
          console.log(`✅ Updated ${lesson.title}`);
        }
      }
    }
    
    console.log(`\\n🎉 Updated ${updated} lessons!`);
    
    // Verify the updates
    console.log('\\n🔍 Verifying updates...');
    const { data: updatedLessons } = await supabase
      .from('lessons')
      .select('title, content')
      .limit(5);
      
    updatedLessons?.forEach(lesson => {
      const hasRichContent = richContent[lesson.title];
      if (hasRichContent) {
        console.log(`   📊 ${lesson.title}: ${lesson.content.length} chars (${lesson.content.startsWith('#') ? 'MARKDOWN' : 'PLAIN'})`);
      }
    });
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env file');
  console.log('Please add your service role key to the .env file');
} else {
  updateLessonContent();
}