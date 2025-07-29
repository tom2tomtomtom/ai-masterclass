-- Template Library System Database Functions
-- These functions support the template management system

-- Function to increment template usage count atomically
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE prompt_templates 
    SET usage_count = usage_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = template_id;
    
    -- If no rows were updated, the template doesn't exist
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template with id % not found', template_id;
    END IF;
END;
$$;

-- Function to get template analytics with usage statistics
CREATE OR REPLACE FUNCTION get_template_analytics(template_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    template_record RECORD;
    analytics_result JSON;
BEGIN
    -- Get basic template information
    SELECT 
        id, title, usage_count, created_at, updated_at,
        industry_category, use_case_category
    INTO template_record
    FROM prompt_templates 
    WHERE id = template_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Template with id % not found', template_id;
    END IF;
    
    -- Build analytics JSON
    SELECT json_build_object(
        'template_id', template_record.id,
        'title', template_record.title,
        'usage_count', template_record.usage_count,
        'industry_category', template_record.industry_category,
        'use_case_category', template_record.use_case_category,
        'created_at', template_record.created_at,
        'last_updated', template_record.updated_at,
        'days_since_creation', EXTRACT(DAY FROM (CURRENT_TIMESTAMP - template_record.created_at))
    ) INTO analytics_result;
    
    RETURN analytics_result;
END;
$$;

-- Function to search templates with full-text search capabilities
CREATE OR REPLACE FUNCTION search_templates_fulltext(
    search_query TEXT,
    industry_filter TEXT[] DEFAULT NULL,
    use_case_filter TEXT[] DEFAULT NULL,
    limit_count INT DEFAULT 20,
    offset_count INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    content TEXT,
    industry_category TEXT,
    use_case_category TEXT,
    usage_count INT,
    created_at TIMESTAMP WITH TIME ZONE,
    rank REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.id,
        pt.title,
        pt.description,
        pt.content,
        pt.industry_category,
        pt.use_case_category,
        pt.usage_count,
        pt.created_at,
        ts_rank(
            to_tsvector('english', pt.title || ' ' || pt.description || ' ' || pt.content),
            plainto_tsquery('english', search_query)
        ) as rank
    FROM prompt_templates pt
    WHERE 
        (search_query IS NULL OR search_query = '' OR
         to_tsvector('english', pt.title || ' ' || pt.description || ' ' || pt.content) @@ plainto_tsquery('english', search_query))
        AND (industry_filter IS NULL OR pt.industry_category = ANY(industry_filter))
        AND (use_case_filter IS NULL OR pt.use_case_category = ANY(use_case_filter))
        AND pt.is_public = true
    ORDER BY 
        CASE WHEN search_query IS NOT NULL AND search_query != '' THEN rank END DESC,
        pt.usage_count DESC,
        pt.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- Function to get popular templates by category
CREATE OR REPLACE FUNCTION get_popular_templates_by_category(
    category_type TEXT, -- 'industry' or 'use_case'
    category_value TEXT,
    limit_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    usage_count INT,
    industry_category TEXT,
    use_case_category TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF category_type = 'industry' THEN
        RETURN QUERY
        SELECT 
            pt.id, pt.title, pt.description, pt.usage_count,
            pt.industry_category, pt.use_case_category, pt.created_at
        FROM prompt_templates pt
        WHERE pt.industry_category = category_value 
          AND pt.is_public = true
        ORDER BY pt.usage_count DESC, pt.created_at DESC
        LIMIT limit_count;
    ELSIF category_type = 'use_case' THEN
        RETURN QUERY
        SELECT 
            pt.id, pt.title, pt.description, pt.usage_count,
            pt.industry_category, pt.use_case_category, pt.created_at
        FROM prompt_templates pt
        WHERE pt.use_case_category = category_value 
          AND pt.is_public = true
        ORDER BY pt.usage_count DESC, pt.created_at DESC
        LIMIT limit_count;
    ELSE
        RAISE EXCEPTION 'Invalid category_type. Must be "industry" or "use_case"';
    END IF;
END;
$$;

-- Function to get template recommendations based on user usage patterns
CREATE OR REPLACE FUNCTION get_template_recommendations(
    user_id UUID,
    limit_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    industry_category TEXT,
    use_case_category TEXT,
    usage_count INT,
    recommendation_score REAL
)
LANGUAGE plpgsql
AS $$
DECLARE
    user_industries TEXT[];
    user_use_cases TEXT[];
BEGIN
    -- Get user's preferred categories based on their template usage/creation history
    SELECT array_agg(DISTINCT industry_category), array_agg(DISTINCT use_case_category)
    INTO user_industries, user_use_cases
    FROM prompt_templates
    WHERE created_by = user_id;
    
    -- If user has no history, return most popular templates
    IF user_industries IS NULL THEN
        RETURN QUERY
        SELECT 
            pt.id, pt.title, pt.description, pt.industry_category, pt.use_case_category,
            pt.usage_count, 
            (pt.usage_count::REAL / GREATEST((SELECT MAX(usage_count) FROM prompt_templates), 1)) as recommendation_score
        FROM prompt_templates pt
        WHERE pt.is_public = true AND pt.created_by != user_id
        ORDER BY pt.usage_count DESC
        LIMIT limit_count;
    ELSE
        -- Return templates from user's preferred categories
        RETURN QUERY
        SELECT 
            pt.id, pt.title, pt.description, pt.industry_category, pt.use_case_category,
            pt.usage_count,
            (
                (CASE WHEN pt.industry_category = ANY(user_industries) THEN 0.4 ELSE 0.0 END) +
                (CASE WHEN pt.use_case_category = ANY(user_use_cases) THEN 0.4 ELSE 0.0 END) +
                (pt.usage_count::REAL / GREATEST((SELECT MAX(usage_count) FROM prompt_templates), 1) * 0.2)
            ) as recommendation_score
        FROM prompt_templates pt
        WHERE pt.is_public = true AND pt.created_by != user_id
        ORDER BY recommendation_score DESC, pt.usage_count DESC
        LIMIT limit_count;
    END IF;
END;
$$;

-- Function to create template usage tracking record
CREATE OR REPLACE FUNCTION track_template_usage(
    template_id UUID,
    user_id UUID,
    ai_model_used TEXT DEFAULT NULL,
    quality_score REAL DEFAULT NULL,
    response_time INT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    usage_id UUID;
BEGIN
    -- Insert usage record (assumes template_responses table exists)
    INSERT INTO template_responses (
        template_id, user_id, ai_model_used, quality_score, response_time, created_at
    ) VALUES (
        template_id, user_id, ai_model_used, quality_score, response_time, CURRENT_TIMESTAMP
    ) RETURNING id INTO usage_id;
    
    -- Increment template usage count
    PERFORM increment_template_usage(template_id);
    
    RETURN usage_id;
EXCEPTION
    WHEN undefined_table THEN
        -- If template_responses table doesn't exist, just increment usage count
        PERFORM increment_template_usage(template_id);
        RETURN NULL;
END;
$$;

-- Function to get template performance metrics
CREATE OR REPLACE FUNCTION get_template_performance_metrics(
    template_id UUID,
    days_back INT DEFAULT 30
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    metrics_result JSON;
    usage_count_period INT;
    avg_quality REAL;
    avg_response_time REAL;
BEGIN
    -- Get metrics from template_responses table if it exists
    BEGIN
        SELECT 
            COUNT(*),
            AVG(quality_score),
            AVG(response_time)
        INTO usage_count_period, avg_quality, avg_response_time
        FROM template_responses
        WHERE template_id = template_id 
          AND created_at >= CURRENT_TIMESTAMP - INTERVAL '%s days' FORMAT days_back;
    EXCEPTION
        WHEN undefined_table THEN
            -- If table doesn't exist, use basic template data
            SELECT usage_count, NULL, NULL
            INTO usage_count_period, avg_quality, avg_response_time
            FROM prompt_templates
            WHERE id = template_id;
    END;
    
    -- Build metrics JSON
    SELECT json_build_object(
        'template_id', template_id,
        'period_days', days_back,
        'usage_count_period', COALESCE(usage_count_period, 0),
        'average_quality_score', avg_quality,
        'average_response_time_ms', avg_response_time,
        'calculated_at', CURRENT_TIMESTAMP
    ) INTO metrics_result;
    
    RETURN metrics_result;
END;
$$;

-- Function to get category statistics
CREATE OR REPLACE FUNCTION get_category_statistics()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    stats_result JSON;
BEGIN
    SELECT json_build_object(
        'industry_categories', (
            SELECT json_object_agg(industry_category, template_count)
            FROM (
                SELECT 
                    industry_category, 
                    COUNT(*) as template_count
                FROM prompt_templates 
                WHERE is_public = true
                GROUP BY industry_category
                ORDER BY template_count DESC
            ) ic
        ),
        'use_case_categories', (
            SELECT json_object_agg(use_case_category, template_count)
            FROM (
                SELECT 
                    use_case_category, 
                    COUNT(*) as template_count
                FROM prompt_templates 
                WHERE is_public = true
                GROUP BY use_case_category
                ORDER BY template_count DESC
            ) uc
        ),
        'total_templates', (SELECT COUNT(*) FROM prompt_templates WHERE is_public = true),
        'total_usage', (SELECT SUM(usage_count) FROM prompt_templates WHERE is_public = true),
        'calculated_at', CURRENT_TIMESTAMP
    ) INTO stats_result;
    
    RETURN stats_result;
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prompt_templates_fulltext 
ON prompt_templates USING gin(to_tsvector('english', title || ' ' || description || ' ' || content));

CREATE INDEX IF NOT EXISTS idx_prompt_templates_category 
ON prompt_templates(industry_category, use_case_category) 
WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_prompt_templates_usage 
ON prompt_templates(usage_count DESC) 
WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_prompt_templates_created_by 
ON prompt_templates(created_by);

-- Create partial indexes for commonly filtered queries
CREATE INDEX IF NOT EXISTS idx_prompt_templates_public_popular 
ON prompt_templates(usage_count DESC, created_at DESC) 
WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_prompt_templates_industry_popular 
ON prompt_templates(industry_category, usage_count DESC) 
WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_prompt_templates_use_case_popular 
ON prompt_templates(use_case_category, usage_count DESC) 
WHERE is_public = true;

-- Comment on functions for documentation
COMMENT ON FUNCTION increment_template_usage(UUID) IS 'Atomically increments the usage count for a template';
COMMENT ON FUNCTION get_template_analytics(UUID) IS 'Returns comprehensive analytics for a specific template';
COMMENT ON FUNCTION search_templates_fulltext(TEXT, TEXT[], TEXT[], INT, INT) IS 'Full-text search across templates with category filtering';
COMMENT ON FUNCTION get_popular_templates_by_category(TEXT, TEXT, INT) IS 'Returns popular templates within a specific category';
COMMENT ON FUNCTION get_template_recommendations(UUID, INT) IS 'Provides personalized template recommendations based on user patterns';
COMMENT ON FUNCTION track_template_usage(UUID, UUID, TEXT, REAL, INT) IS 'Records template usage with optional performance metrics';
COMMENT ON FUNCTION get_template_performance_metrics(UUID, INT) IS 'Returns performance metrics for a template over a specified period';
COMMENT ON FUNCTION get_category_statistics() IS 'Returns statistics about template distribution across categories';