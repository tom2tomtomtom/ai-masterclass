#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class ModuleCreator {
  constructor() {
    // All modules that need to be created (matching the seeding script mapping)
    this.modulesToCreate = [
      // Core Courses (already exist, skip these)
      // 'AI Fundamentals - Complete Course', // EXISTS
      // 'Vibe Coding Fundamentals - Complete Course', // EXISTS
      
      // New modules to create
      'Marketing Analytics & AI Strategy',
      'AI Ethics & Responsible AI',
      
      // AI Automation & Agents
      'AI Automation & Agents: Custom AI Agents',
      'AI Automation & Agents: N8N Workflows',
      'AI Automation & Agents: Zapier Integration',
      
      // Avatars & Virtual Humans
      'Avatars & Virtual Humans: HeyGen',
      'Avatars & Virtual Humans: Synthesia',
      'Avatars & Virtual Humans: Virtual Influencers',
      
      // Music & Sound Mastery
      'Music & Sound Mastery: Audio Branding',
      'Music & Sound Mastery: Content Creator Music',
      'Music & Sound Mastery: Sound Effects',
      'Music & Sound Mastery: Suno AI',
      
      // Video Generation
      'Video Generation Mastery: Google Veo',
      'Video Generation Mastery: OpenAI Sora',
      'Video Generation Mastery: Runway ML',
      
      // Voice & Audio
      'Voice & Audio Mastery: Adobe Speech',
      'Voice & Audio Mastery: Audiobook Production',
      'Voice & Audio Mastery: ElevenLabs'
    ];
  }

  async createAllModules() {
    console.log('🏗️  Creating missing modules in database...');
    console.log(`📦 Creating ${this.modulesToCreate.length} new modules\n`);

    try {
      // Test database connection
      const { data: testData, error: testError } = await supabase
        .from('modules')
        .select('count')
        .limit(1);

      if (testError) {
        throw new Error(`Database connection failed: ${testError.message}`);
      }

      console.log('✅ Database connection successful\n');

      let successCount = 0;
      let failureCount = 0;

      for (const moduleTitle of this.modulesToCreate) {
        try {
          console.log(`🔄 Creating: ${moduleTitle}`);
          
          // Check if module already exists
          const { data: existing, error: checkError } = await supabase
            .from('modules')
            .select('id, title')
            .eq('title', moduleTitle)
            .single();

          if (existing) {
            console.log(`   ⚠️  Already exists: ${moduleTitle}`);
            continue;
          }

          // Create the module
          const { data, error } = await supabase
            .from('modules')
            .insert([
              {
                course_id: null, // Will be set when we have courses
                title: moduleTitle,
                description: this.generateDescription(moduleTitle),
                order_index: this.getSortOrder(moduleTitle),
                module_type: 'lesson',
                estimated_minutes: 240, // 4 hours
                difficulty: 'intermediate'
              }
            ])
            .select()
            .single();

          if (error) {
            console.log(`   ❌ Failed: ${error.message}`);
            failureCount++;
          } else {
            console.log(`   ✅ Created: ${moduleTitle} (ID: ${data.id})`);
            successCount++;
          }

        } catch (error) {
          console.log(`   ❌ Error: ${error.message}`);
          failureCount++;
        }
      }

      console.log('\n📊 MODULE CREATION SUMMARY');
      console.log('==========================');
      console.log(`✅ Successfully created: ${successCount} modules`);
      console.log(`❌ Failed to create: ${failureCount} modules`);
      console.log(`📈 Success rate: ${Math.round((successCount / this.modulesToCreate.length) * 100)}%`);

      if (successCount > 0) {
        console.log('\n🎉 Module creation completed!');
        console.log('You can now run the seeding script to populate all courses.');
      }

    } catch (error) {
      console.error('❌ Fatal error:', error.message);
      process.exit(1);
    }
  }

  generateDescription(title) {
    const descriptions = {
      'Marketing Analytics & AI Strategy': 'Master data-driven marketing strategies using AI-powered analytics, customer segmentation, and predictive modeling to optimize campaigns and maximize ROI.',
      'AI Ethics & Responsible AI': 'Learn to implement ethical AI practices, bias detection, privacy protection, and governance frameworks for responsible AI deployment in business.',
      
      'AI Automation & Agents: Custom AI Agents': 'Build intelligent AI agents that can autonomously handle complex business processes, make decisions, and coordinate with other systems.',
      'AI Automation & Agents: N8N Workflows': 'Create powerful automation workflows using N8N to connect AI services, APIs, and business applications for seamless operations.',
      'AI Automation & Agents: Zapier Integration': 'Master Zapier automation with AI integration to streamline business processes and connect hundreds of applications effortlessly.',
      
      'Avatars & Virtual Humans: HeyGen': 'Create professional AI avatars and virtual presenters using HeyGen for marketing videos, training content, and customer engagement.',
      'Avatars & Virtual Humans: Synthesia': 'Develop realistic AI avatars with Synthesia for corporate communications, e-learning, and multilingual video content creation.',
      'Avatars & Virtual Humans: Virtual Influencers': 'Build and monetize virtual influencers for social media marketing, brand partnerships, and digital content creation.',
      
      'Music & Sound Mastery: Audio Branding': 'Create distinctive audio branding and sonic identities using AI music generation tools for marketing and brand recognition.',
      'Music & Sound Mastery: Content Creator Music': 'Generate royalty-free music and soundtracks for content creation, videos, podcasts, and digital media projects.',
      'Music & Sound Mastery: Sound Effects': 'Produce professional sound effects and audio elements using AI tools for multimedia projects and content enhancement.',
      'Music & Sound Mastery: Suno AI': 'Master Suno AI for creating original music compositions, songs, and audio content for commercial and creative applications.',
      
      'Video Generation Mastery: Google Veo': 'Create professional videos using Google Veo AI technology for marketing campaigns, training materials, and content production.',
      'Video Generation Mastery: OpenAI Sora': 'Generate high-quality videos with OpenAI Sora for storytelling, marketing, and creative content across various industries.',
      'Video Generation Mastery: Runway ML': 'Produce stunning AI-generated videos using Runway ML for creative projects, marketing content, and visual storytelling.',
      
      'Voice & Audio Mastery: Adobe Speech': 'Create professional voiceovers and speech synthesis using Adobe AI tools for multimedia projects and accessibility.',
      'Voice & Audio Mastery: Audiobook Production': 'Produce high-quality audiobooks using AI voice technology for publishing, education, and content monetization.',
      'Voice & Audio Mastery: ElevenLabs': 'Master ElevenLabs voice cloning and synthesis for creating realistic AI voices for various business applications.'
    };

    return descriptions[title] || 'Master cutting-edge AI technology for professional business applications and creative projects.';
  }

  getCategory(title) {
    if (title.includes('Marketing')) return 'marketing';
    if (title.includes('Ethics')) return 'ethics';
    if (title.includes('Automation') || title.includes('Agents')) return 'automation';
    if (title.includes('Avatars') || title.includes('Virtual')) return 'avatars';
    if (title.includes('Music') || title.includes('Sound')) return 'audio';
    if (title.includes('Video')) return 'video';
    if (title.includes('Voice') || title.includes('Audio')) return 'audio';
    return 'general';
  }

  getSortOrder(title) {
    const orderMap = {
      'Marketing Analytics & AI Strategy': 20,
      'AI Ethics & Responsible AI': 30,
      
      'AI Automation & Agents: Custom AI Agents': 40,
      'AI Automation & Agents: N8N Workflows': 41,
      'AI Automation & Agents: Zapier Integration': 42,
      
      'Avatars & Virtual Humans: HeyGen': 50,
      'Avatars & Virtual Humans: Synthesia': 51,
      'Avatars & Virtual Humans: Virtual Influencers': 52,
      
      'Music & Sound Mastery: Audio Branding': 60,
      'Music & Sound Mastery: Content Creator Music': 61,
      'Music & Sound Mastery: Sound Effects': 62,
      'Music & Sound Mastery: Suno AI': 63,
      
      'Video Generation Mastery: Google Veo': 70,
      'Video Generation Mastery: OpenAI Sora': 71,
      'Video Generation Mastery: Runway ML': 72,
      
      'Voice & Audio Mastery: Adobe Speech': 80,
      'Voice & Audio Mastery: Audiobook Production': 81,
      'Voice & Audio Mastery: ElevenLabs': 82
    };

    return orderMap[title] || 999;
  }
}

// Run the module creation
if (require.main === module) {
  const creator = new ModuleCreator();
  creator.createAllModules();
}

module.exports = ModuleCreator;
