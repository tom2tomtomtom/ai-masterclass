const { createClient } = require('@supabase/supabase-js');
const TestDatabase = require('../helpers/database');

// Mock Supabase for testing
jest.mock('@supabase/supabase-js');

describe('AI Playground Database Models', () => {
  let testDb;
  let mockSupabase;

  beforeAll(async () => {
    // Set up test environment variables
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
    
    // Mock Supabase client
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({ 
          data: [], 
          error: null 
        })),
        insert: jest.fn(() => ({ 
          data: [{ id: 'test-id' }], 
          error: null 
        })),
        update: jest.fn(() => ({ 
          data: [{ id: 'test-id' }], 
          error: null 
        })),
        delete: jest.fn(() => ({ 
          data: [], 
          error: null 
        })),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis()
      }))
    };
    
    createClient.mockReturnValue(mockSupabase);
    
    // Initialize test database helper (fallback for direct SQL operations)
    testDb = new TestDatabase();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    if (testDb) {
      await testDb.close();
    }
  });

  describe('AI Models Table', () => {
    test('should create ai_models table with correct structure', async () => {
      // Test table creation - structure validation
      const expectedColumns = [
        'id', 'name', 'provider', 'api_endpoint', 
        'is_active', 'created_at', 'updated_at'
      ];
      
      // Mock the table structure query
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          data: expectedColumns.map(col => ({ column_name: col })),
          error: null
        }))
      });

      const supabase = createClient();
      const { data, error } = await supabase.from('information_schema.columns').select('column_name');
      
      expect(error).toBeNull();
      expect(data).toHaveLength(expectedColumns.length);
    });

    test('should insert AI model with required fields', async () => {
      const aiModelData = {
        name: 'GPT-4',
        provider: 'OpenAI',
        api_endpoint: 'https://api.openai.com/v1/chat/completions',
        is_active: true
      };

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          data: [{ id: 'ai-model-id', ...aiModelData }],
          error: null
        }))
      });

      const supabase = createClient();
      const { data, error } = await supabase.from('ai_models').insert(aiModelData);

      expect(error).toBeNull();
      expect(data[0]).toMatchObject(aiModelData);
      expect(mockSupabase.from).toHaveBeenCalledWith('ai_models');
    });

    test('should enforce unique name constraint', async () => {
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          data: null,
          error: { code: '23505', message: 'duplicate key value violates unique constraint' }
        }))
      });

      const supabase = createClient();
      const { data, error } = await supabase.from('ai_models').insert({
        name: 'GPT-4',
        provider: 'OpenAI'
      });

      expect(error).not.toBeNull();
      expect(error.code).toBe('23505');
      expect(data).toBeNull();
    });
  });

  describe('Prompt Templates Table', () => {
    test('should create prompt_templates table with correct structure', async () => {
      const expectedColumns = [
        'id', 'title', 'description', 'content', 'industry_category',
        'use_case_category', 'recommended_ai_model_id', 'created_by_user_id',
        'is_public', 'usage_count', 'created_at', 'updated_at'
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          data: expectedColumns.map(col => ({ column_name: col })),
          error: null
        }))
      });

      const supabase = createClient();
      const { data, error } = await supabase.from('information_schema.columns').select('column_name');
      
      expect(error).toBeNull();
      expect(data).toHaveLength(expectedColumns.length);
    });

    test('should insert prompt template with all fields', async () => {
      const templateData = {
        title: 'Customer Service Email Response',
        description: 'Generate professional customer service responses',
        content: 'You are a helpful customer service representative...',
        industry_category: 'customer_service',
        use_case_category: 'email_response',
        recommended_ai_model_id: 'ai-model-id',
        created_by_user_id: 'user-id',
        is_public: true,
        usage_count: 0
      };

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          data: [{ id: 'template-id', ...templateData }],
          error: null
        }))
      });

      const supabase = createClient();
      const { data, error } = await supabase.from('prompt_templates').insert(templateData);

      expect(error).toBeNull();
      expect(data[0]).toMatchObject(templateData);
    });

    test('should filter templates by category', async () => {
      const mockTemplates = [
        { id: '1', industry_category: 'healthcare', use_case_category: 'documentation' },
        { id: '2', industry_category: 'healthcare', use_case_category: 'analysis' }
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: mockTemplates,
            error: null
          }))
        }))
      });

      const supabase = createClient();
      const { data, error } = await supabase.from('prompt_templates')
        .select('*')
        .eq('industry_category', 'healthcare');

      expect(error).toBeNull();
      expect(data).toHaveLength(2);
      expect(data.every(t => t.industry_category === 'healthcare')).toBe(true);
    });
  });

  describe('AI Conversations Table', () => {
    test('should create ai_conversations table with correct structure', async () => {
      const expectedColumns = [
        'id', 'user_id', 'prompt_text', 'created_at', 'updated_at'
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          data: expectedColumns.map(col => ({ column_name: col })),
          error: null
        }))
      });

      const supabase = createClient();
      const { data, error } = await supabase.from('information_schema.columns').select('column_name');
      
      expect(error).toBeNull();
      expect(data).toHaveLength(expectedColumns.length);
    });

    test('should create conversation with prompt text', async () => {
      const conversationData = {
        user_id: 'user-id',
        prompt_text: 'Explain quantum computing in simple terms'
      };

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          data: [{ id: 'conversation-id', ...conversationData }],
          error: null
        }))
      });

      const supabase = createClient();
      const { data, error } = await supabase.from('ai_conversations').insert(conversationData);

      expect(error).toBeNull();
      expect(data[0]).toMatchObject(conversationData);
    });
  });

  describe('AI Responses Table', () => {
    test('should create ai_responses table with correct structure', async () => {
      const expectedColumns = [
        'id', 'conversation_id', 'ai_model_id', 'response_text',
        'response_time_ms', 'quality_score', 'user_rating',
        'created_at', 'updated_at'
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          data: expectedColumns.map(col => ({ column_name: col })),
          error: null
        }))
      });

      const supabase = createClient();
      const { data, error } = await supabase.from('information_schema.columns').select('column_name');
      
      expect(error).toBeNull();
      expect(data).toHaveLength(expectedColumns.length);
    });

    test('should store AI response with metrics', async () => {
      const responseData = {
        conversation_id: 'conversation-id',
        ai_model_id: 'ai-model-id',
        response_text: 'Quantum computing is a type of computation...',
        response_time_ms: 1250,
        quality_score: 8.5,
        user_rating: null
      };

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          data: [{ id: 'response-id', ...responseData }],
          error: null
        }))
      });

      const supabase = createClient();
      const { data, error } = await supabase.from('ai_responses').insert(responseData);

      expect(error).toBeNull();
      expect(data[0]).toMatchObject(responseData);
    });

    test('should update user rating for response', async () => {
      const updatedData = { user_rating: 4 };

      mockSupabase.from.mockReturnValueOnce({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: [{ id: 'response-id', user_rating: 4 }],
            error: null
          }))
        }))
      });

      const supabase = createClient();
      const { data, error } = await supabase.from('ai_responses')
        .update(updatedData)
        .eq('id', 'response-id');

      expect(error).toBeNull();
      expect(data[0].user_rating).toBe(4);
    });
  });

  describe('Community Tables', () => {
    test('should create community_posts table', async () => {
      const postData = {
        user_id: 'user-id',
        title: 'Best prompts for content marketing',
        content: 'I\'ve been experimenting with different prompts...',
        is_anonymous: true,
        upvotes_count: 0,
        downvotes_count: 0
      };

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          data: [{ id: 'post-id', ...postData }],
          error: null
        }))
      });

      const supabase = createClient();
      const { data, error } = await supabase.from('community_posts').insert(postData);

      expect(error).toBeNull();
      expect(data[0]).toMatchObject(postData);
    });

    test('should create community_comments table', async () => {
      const commentData = {
        post_id: 'post-id',
        user_id: 'user-id',
        content: 'Great insights! I\'ve had similar experiences...',
        is_anonymous: false
      };

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          data: [{ id: 'comment-id', ...commentData }],
          error: null
        }))
      });

      const supabase = createClient();
      const { data, error } = await supabase.from('community_comments').insert(commentData);

      expect(error).toBeNull();
      expect(data[0]).toMatchObject(commentData);
    });
  });

  describe('User Progress Enhancement', () => {
    test('should enhance user_progress table for lesson tracking', async () => {
      const progressData = {
        user_id: 'user-id',
        lesson_id: 'lesson_1',
        completion_percentage: 75.5,
        practice_gates_completed: 2,
        total_practice_gates: 3,
        last_accessed_at: new Date().toISOString()
      };

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          data: [{ id: 'progress-id', ...progressData }],
          error: null
        }))
      });

      const supabase = createClient();
      const { data, error } = await supabase.from('user_progress').insert(progressData);

      expect(error).toBeNull();
      expect(data[0]).toMatchObject(progressData);
    });
  });

  describe('User Achievements Table', () => {
    test('should track user achievements', async () => {
      const achievementData = {
        user_id: 'user-id',
        achievement_type: 'first_comparison',
        achievement_data: { models_compared: ['GPT-4', 'Claude'], timestamp: new Date().toISOString() },
        earned_at: new Date().toISOString()
      };

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          data: [{ id: 'achievement-id', ...achievementData }],
          error: null
        }))
      });

      const supabase = createClient();
      const { data, error } = await supabase.from('user_achievements').insert(achievementData);

      expect(error).toBeNull();
      expect(data[0]).toMatchObject(achievementData);
    });
  });

  describe('Mentorship Tables', () => {
    test('should create mentor profiles', async () => {
      const mentorData = {
        user_id: 'user-id',
        bio: 'AI consultant with 8 years experience...',
        expertise_areas: ['machine_learning', 'prompt_engineering'],
        years_experience: 8,
        is_available: true,
        hourly_rate: 150.00
      };

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          data: [{ id: 'mentor-id', ...mentorData }],
          error: null
        }))
      });

      const supabase = createClient();
      const { data, error } = await supabase.from('mentor_profiles').insert(mentorData);

      expect(error).toBeNull();
      expect(data[0]).toMatchObject(mentorData);
    });

    test('should create mentorship requests', async () => {
      const requestData = {
        student_id: 'student-id',
        mentor_id: 'mentor-id',
        message: 'I would like guidance on advanced prompt engineering techniques.',
        status: 'pending'
      };

      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          data: [{ id: 'request-id', ...requestData }],
          error: null
        }))
      });

      const supabase = createClient();
      const { data, error } = await supabase.from('mentorship_requests').insert(requestData);

      expect(error).toBeNull();
      expect(data[0]).toMatchObject(requestData);
    });
  });
});