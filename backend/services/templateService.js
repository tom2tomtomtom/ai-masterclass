const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

class TemplateService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }

  /**
   * Get all templates with filtering and pagination
   */
  async getTemplates(filters = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        industry_category,
        use_case_category,
        recommended_ai_model_id,
        is_public,
        created_by,
        search_term,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = filters;

      const offset = (page - 1) * limit;
      let query = this.supabase
        .from('prompt_templates')
        .select(`
          *,
          ai_models:recommended_ai_model_id (
            id,
            name,
            provider
          ),
          users:created_by (
            id,
            username,
            email
          )
        `);

      // Apply filters
      if (industry_category) {
        query = query.eq('industry_category', industry_category);
      }
      
      if (use_case_category) {
        query = query.eq('use_case_category', use_case_category);
      }
      
      if (recommended_ai_model_id) {
        query = query.eq('recommended_ai_model_id', recommended_ai_model_id);
      }
      
      if (typeof is_public === 'boolean') {
        query = query.eq('is_public', is_public);
      }
      
      if (created_by) {
        query = query.eq('created_by', created_by);
      }

      // Search functionality
      if (search_term) {
        query = query.or(`title.ilike.%${search_term}%,description.ilike.%${search_term}%,content.ilike.%${search_term}%`);
      }

      // Sorting
      query = query.order(sort_by, { ascending: sort_order === 'asc' });

      // Pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        logger.error('Error fetching templates:', error);
        throw error;
      }

      return {
        templates: data || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || data?.length || 0,
          pages: Math.ceil((count || data?.length || 0) / limit)
        }
      };
    } catch (error) {
      logger.error('Error in getTemplates:', error);
      throw error;
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(id) {
    try {
      const { data, error } = await this.supabase
        .from('prompt_templates')
        .select(`
          *,
          ai_models:recommended_ai_model_id (
            id,
            name,
            provider
          ),
          users:created_by (
            id,
            username,
            email
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        logger.error('Error fetching template by ID:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Error in getTemplateById:', error);
      throw error;
    }
  }

  /**
   * Create new template
   */
  async createTemplate(templateData, userId) {
    try {
      const template = {
        ...templateData,
        created_by: userId,
        usage_count: 0
      };

      const { data, error } = await this.supabase
        .from('prompt_templates')
        .insert([template])
        .select(`
          *,
          ai_models:recommended_ai_model_id (
            id,
            name,
            provider
          )
        `)
        .single();

      if (error) {
        logger.error('Error creating template:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Error in createTemplate:', error);
      throw error;
    }
  }

  /**
   * Update template
   */
  async updateTemplate(id, templateData, userId) {
    try {
      // First check if user owns template or has admin rights
      const { data: existingTemplate, error: fetchError } = await this.supabase
        .from('prompt_templates')
        .select('created_by')
        .eq('id', id)
        .single();

      if (fetchError) {
        logger.error('Error fetching template for update:', fetchError);
        throw fetchError;
      }

      if (existingTemplate.created_by !== userId) {
        throw new Error('Unauthorized: Cannot update template created by another user');
      }

      const { data, error } = await this.supabase
        .from('prompt_templates')
        .update(templateData)
        .eq('id', id)
        .select(`
          *,
          ai_models:recommended_ai_model_id (
            id,
            name,
            provider
          )
        `)
        .single();

      if (error) {
        logger.error('Error updating template:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Error in updateTemplate:', error);
      throw error;
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(id, userId) {
    try {
      // First check if user owns template
      const { data: existingTemplate, error: fetchError } = await this.supabase
        .from('prompt_templates')
        .select('created_by')
        .eq('id', id)
        .single();

      if (fetchError) {
        logger.error('Error fetching template for deletion:', fetchError);
        throw fetchError;
      }

      if (existingTemplate.created_by !== userId) {
        throw new Error('Unauthorized: Cannot delete template created by another user');
      }

      const { error } = await this.supabase
        .from('prompt_templates')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Error deleting template:', error);
        throw error;
      }

      return { success: true };
    } catch (error) {
      logger.error('Error in deleteTemplate:', error);
      throw error;
    }
  }

  /**
   * Increment usage count for a template
   */
  async incrementUsageCount(id) {
    try {
      const { data, error } = await this.supabase
        .rpc('increment_template_usage', { template_id: id });

      if (error) {
        logger.error('Error incrementing usage count:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Error in incrementUsageCount:', error);
      throw error;
    }
  }

  /**
   * Get template categories
   */
  async getCategories() {
    try {
      // Get unique categories from existing templates
      const { data: industryData, error: industryError } = await this.supabase
        .from('prompt_templates')
        .select('industry_category')
        .not('industry_category', 'is', null);

      const { data: useCaseData, error: useCaseError } = await this.supabase
        .from('prompt_templates')
        .select('use_case_category')
        .not('use_case_category', 'is', null);

      if (industryError || useCaseError) {
        logger.error('Error fetching categories:', industryError || useCaseError);
        throw industryError || useCaseError;
      }

      const industryCategories = [...new Set(industryData.map(item => item.industry_category))].filter(Boolean);
      const useCaseCategories = [...new Set(useCaseData.map(item => item.use_case_category))].filter(Boolean);

      return {
        industry_categories: industryCategories,
        use_case_categories: useCaseCategories,
        predefined: {
          industry_categories: [
            'marketing',
            'sales',
            'consulting',
            'development',
            'operations',
            'customer_service',
            'healthcare',
            'education',
            'finance',
            'legal',
            'technology',
            'analytics'
          ],
          use_case_categories: [
            'content_creation',
            'analysis',
            'strategy',
            'problem_solving',
            'communication',
            'email_response',
            'content_strategy',
            'documentation',
            'data_analysis',
            'patient_communication',
            'coding_assistance',
            'research',
            'planning',
            'optimization'
          ]
        }
      };
    } catch (error) {
      logger.error('Error in getCategories:', error);
      throw error;
    }
  }

  /**
   * Get popular templates
   */
  async getPopularTemplates(limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from('prompt_templates')
        .select(`
          *,
          ai_models:recommended_ai_model_id (
            id,
            name,
            provider
          )
        `)
        .eq('is_public', true)
        .order('usage_count', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error fetching popular templates:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getPopularTemplates:', error);
      throw error;
    }
  }

  /**
   * Search templates with advanced filtering
   */
  async searchTemplates(searchParams) {
    try {
      const {
        query: searchQuery,
        industry_categories = [],
        use_case_categories = [],
        ai_models = [],
        min_usage_count = 0,
        is_public = true,
        page = 1,
        limit = 20
      } = searchParams;

      const offset = (page - 1) * limit;
      let query = this.supabase
        .from('prompt_templates')
        .select(`
          *,
          ai_models:recommended_ai_model_id (
            id,
            name,
            provider
          ),
          users:created_by (
            id,
            username
          )
        `);

      // Text search
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      // Category filters
      if (industry_categories.length > 0) {
        query = query.in('industry_category', industry_categories);
      }

      if (use_case_categories.length > 0) {
        query = query.in('use_case_category', use_case_categories);
      }

      if (ai_models.length > 0) {
        query = query.in('recommended_ai_model_id', ai_models);
      }

      // Other filters
      if (typeof is_public === 'boolean') {
        query = query.eq('is_public', is_public);
      }

      if (min_usage_count > 0) {
        query = query.gte('usage_count', min_usage_count);
      }

      // Pagination and ordering
      query = query
        .order('usage_count', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        logger.error('Error searching templates:', error);
        throw error;
      }

      return {
        templates: data || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || data?.length || 0,
          pages: Math.ceil((count || data?.length || 0) / limit)
        }
      };
    } catch (error) {
      logger.error('Error in searchTemplates:', error);
      throw error;
    }
  }

  /**
   * Get template analytics/performance data
   */
  async getTemplateAnalytics(templateId) {
    try {
      // Get basic template data
      const template = await this.getTemplateById(templateId);

      // Get usage analytics from template_responses table if it exists
      const { data: responseData, error: responseError } = await this.supabase
        .from('template_responses')
        .select('id, quality_score, response_time, created_at, ai_model_used')
        .eq('template_id', templateId)
        .order('created_at', { ascending: false });

      // If table doesn't exist or no data, return basic analytics
      const responses = responseData || [];

      const analytics = {
        template_id: templateId,
        usage_count: template.usage_count || 0,
        total_responses: responses.length,
        average_quality_score: responses.length > 0 
          ? responses.reduce((sum, r) => sum + (r.quality_score || 0), 0) / responses.length 
          : 0,
        average_response_time: responses.length > 0 
          ? responses.reduce((sum, r) => sum + (r.response_time || 0), 0) / responses.length 
          : 0,
        popular_ai_models: this.getPopularModelsFromResponses(responses),
        usage_trend: this.getUsageTrend(responses),
        last_used: responses.length > 0 ? responses[0].created_at : null
      };

      return analytics;
    } catch (error) {
      logger.error('Error in getTemplateAnalytics:', error);
      throw error;
    }
  }

  /**
   * Helper: Get popular AI models from responses
   */
  getPopularModelsFromResponses(responses) {
    const modelCount = {};
    responses.forEach(response => {
      if (response.ai_model_used) {
        modelCount[response.ai_model_used] = (modelCount[response.ai_model_used] || 0) + 1;
      }
    });

    return Object.entries(modelCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([model, count]) => ({ model, count }));
  }

  /**
   * Helper: Get usage trend from responses
   */
  getUsageTrend(responses) {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recent = responses.filter(r => new Date(r.created_at) >= last30Days);
    const older = responses.filter(r => new Date(r.created_at) < last30Days);

    return {
      last_30_days: recent.length,
      previous_period: older.length,
      trend: recent.length > older.length ? 'increasing' : 
             recent.length < older.length ? 'decreasing' : 'stable'
    };
  }

  /**
   * Create user's custom template variation
   */
  async createTemplateVariation(originalTemplateId, variationData, userId) {
    try {
      // Get original template
      const originalTemplate = await this.getTemplateById(originalTemplateId);
      
      if (!originalTemplate) {
        throw new Error('Original template not found');
      }

      const variation = {
        title: variationData.title || `${originalTemplate.title} (Variation)`,
        description: variationData.description || originalTemplate.description,
        content: variationData.content || originalTemplate.content,
        industry_category: variationData.industry_category || originalTemplate.industry_category,
        use_case_category: variationData.use_case_category || originalTemplate.use_case_category,
        recommended_ai_model_id: variationData.recommended_ai_model_id || originalTemplate.recommended_ai_model_id,
        is_public: variationData.is_public || false,
        created_by: userId,
        parent_template_id: originalTemplateId,
        usage_count: 0
      };

      const { data, error } = await this.supabase
        .from('prompt_templates')
        .insert([variation])
        .select(`
          *,
          ai_models:recommended_ai_model_id (
            id,
            name,
            provider
          )
        `)
        .single();

      if (error) {
        logger.error('Error creating template variation:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Error in createTemplateVariation:', error);
      throw error;
    }
  }

  /**
   * Get user's template collections
   */
  async getUserCollections(userId) {
    try {
      const { data, error } = await this.supabase
        .from('template_collections')
        .select(`
          *,
          template_collection_items (
            template_id,
            prompt_templates (
              id,
              title,
              description,
              industry_category,
              use_case_category
            )
          )
        `)
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching user collections:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getUserCollections:', error);
      throw error;
    }
  }

  /**
   * Create new template collection
   */
  async createCollection(collectionData, userId) {
    try {
      const collection = {
        ...collectionData,
        created_by: userId
      };

      const { data, error } = await this.supabase
        .from('template_collections')
        .insert([collection])
        .select()
        .single();

      if (error) {
        logger.error('Error creating collection:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Error in createCollection:', error);
      throw error;
    }
  }

  /**
   * Add template to collection
   */
  async addTemplateToCollection(collectionId, templateId, userId) {
    try {
      // Verify user owns the collection
      const { data: collection, error: collectionError } = await this.supabase
        .from('template_collections')
        .select('created_by')
        .eq('id', collectionId)
        .single();

      if (collectionError || collection.created_by !== userId) {
        throw new Error('Unauthorized: Cannot modify collection');
      }

      const { data, error } = await this.supabase
        .from('template_collection_items')
        .insert([{ collection_id: collectionId, template_id: templateId }])
        .select()
        .single();

      if (error) {
        logger.error('Error adding template to collection:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Error in addTemplateToCollection:', error);
      throw error;
    }
  }
}

module.exports = new TemplateService();