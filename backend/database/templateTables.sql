-- Template Library System Additional Tables
-- These tables support advanced template functionality

-- Table for tracking template responses and performance
CREATE TABLE IF NOT EXISTS template_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES prompt_templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ai_model_used TEXT,
    quality_score REAL CHECK (quality_score >= 0 AND quality_score <= 1),
    response_time INTEGER, -- in milliseconds
    response_length INTEGER,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for common queries
    INDEX idx_template_responses_template_id (template_id),
    INDEX idx_template_responses_user_id (user_id),
    INDEX idx_template_responses_created_at (created_at),
    INDEX idx_template_responses_quality_score (quality_score),
    INDEX idx_template_responses_ai_model (ai_model_used)
);

-- Table for user template collections
CREATE TABLE IF NOT EXISTS template_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    tags TEXT[], -- Array of tags for categorization
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT template_collections_name_length CHECK (length(name) >= 2),
    
    -- Indexes
    INDEX idx_template_collections_created_by (created_by),
    INDEX idx_template_collections_public (is_public),
    INDEX idx_template_collections_featured (is_featured),
    INDEX idx_template_collections_created_at (created_at)
);

-- Junction table for collection items
CREATE TABLE IF NOT EXISTS template_collection_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    collection_id UUID NOT NULL REFERENCES template_collections(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES prompt_templates(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    added_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Prevent duplicate templates in same collection
    UNIQUE(collection_id, template_id),
    
    -- Indexes
    INDEX idx_template_collection_items_collection_id (collection_id),
    INDEX idx_template_collection_items_template_id (template_id),
    INDEX idx_template_collection_items_order (collection_id, order_index)
);

-- Table for template favorites/bookmarks
CREATE TABLE IF NOT EXISTS template_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES prompt_templates(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate favorites
    UNIQUE(user_id, template_id),
    
    -- Indexes
    INDEX idx_template_favorites_user_id (user_id),
    INDEX idx_template_favorites_template_id (template_id),
    INDEX idx_template_favorites_created_at (created_at)
);

-- Table for template ratings and reviews
CREATE TABLE IF NOT EXISTS template_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES prompt_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- One review per user per template
    UNIQUE(template_id, user_id),
    
    -- Indexes
    INDEX idx_template_reviews_template_id (template_id),
    INDEX idx_template_reviews_user_id (user_id),
    INDEX idx_template_reviews_rating (rating),
    INDEX idx_template_reviews_created_at (created_at)
);

-- Table for template tags
CREATE TABLE IF NOT EXISTS template_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280', -- Hex color code
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT template_tags_name_format CHECK (name ~ '^[a-z0-9_-]+$'),
    CONSTRAINT template_tags_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    
    -- Indexes
    INDEX idx_template_tags_name (name),
    INDEX idx_template_tags_usage_count (usage_count DESC)
);

-- Junction table for template-tag relationships
CREATE TABLE IF NOT EXISTS template_tag_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES prompt_templates(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES template_tags(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate tag assignments
    UNIQUE(template_id, tag_id),
    
    -- Indexes
    INDEX idx_template_tag_assignments_template_id (template_id),
    INDEX idx_template_tag_assignments_tag_id (tag_id)
);

-- Table for template usage analytics (aggregated data)
CREATE TABLE IF NOT EXISTS template_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES prompt_templates(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    avg_quality_score REAL,
    avg_response_time INTEGER,
    total_tokens INTEGER DEFAULT 0,
    success_rate REAL DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- One record per template per day
    UNIQUE(template_id, date),
    
    -- Indexes
    INDEX idx_template_analytics_template_id (template_id),
    INDEX idx_template_analytics_date (date),
    INDEX idx_template_analytics_usage_count (usage_count DESC),
    INDEX idx_template_analytics_quality_score (avg_quality_score DESC)
);

-- Table for sharing templates with specific users or groups
CREATE TABLE IF NOT EXISTS template_shares (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES prompt_templates(id) ON DELETE CASCADE,
    shared_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shared_with UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for public shares
    permission_level VARCHAR(20) DEFAULT 'view' CHECK (permission_level IN ('view', 'edit', 'admin')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_template_shares_template_id (template_id),
    INDEX idx_template_shares_shared_by (shared_by),
    INDEX idx_template_shares_shared_with (shared_with),
    INDEX idx_template_shares_expires_at (expires_at)
);

-- Create triggers for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_template_collections_updated_at 
    BEFORE UPDATE ON template_collections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_reviews_updated_at 
    BEFORE UPDATE ON template_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create triggers for maintaining counts
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE template_tags 
        SET usage_count = usage_count + 1 
        WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE template_tags 
        SET usage_count = usage_count - 1 
        WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tag_usage_count_trigger
    AFTER INSERT OR DELETE ON template_tag_assignments
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- Views for common queries
CREATE OR REPLACE VIEW template_stats AS
SELECT 
    pt.id,
    pt.title,
    pt.industry_category,
    pt.use_case_category,
    pt.usage_count,
    pt.created_at,
    COUNT(DISTINCT tr.id) as review_count,
    AVG(tr.rating) as avg_rating,
    COUNT(DISTINCT tf.id) as favorite_count,
    COUNT(DISTINCT tci.id) as collection_count
FROM prompt_templates pt
LEFT JOIN template_reviews tr ON pt.id = tr.template_id AND tr.is_public = true
LEFT JOIN template_favorites tf ON pt.id = tf.template_id
LEFT JOIN template_collection_items tci ON pt.id = tci.template_id
WHERE pt.is_public = true
GROUP BY pt.id, pt.title, pt.industry_category, pt.use_case_category, pt.usage_count, pt.created_at;

-- View for user template activity
CREATE OR REPLACE VIEW user_template_activity AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(DISTINCT pt.id) as templates_created,
    COUNT(DISTINCT tr.id) as responses_generated,
    COUNT(DISTINCT tf.id) as templates_favorited,
    COUNT(DISTINCT tc.id) as collections_created,
    AVG(tr.quality_score) as avg_quality_score,
    MAX(tr.created_at) as last_activity
FROM users u
LEFT JOIN prompt_templates pt ON u.id = pt.created_by
LEFT JOIN template_responses tr ON u.id = tr.user_id
LEFT JOIN template_favorites tf ON u.id = tf.user_id
LEFT JOIN template_collections tc ON u.id = tc.created_by
GROUP BY u.id, u.username;

-- Comments for documentation
COMMENT ON TABLE template_responses IS 'Tracks template usage with performance metrics';
COMMENT ON TABLE template_collections IS 'User-created collections of templates';
COMMENT ON TABLE template_collection_items IS 'Items within template collections';
COMMENT ON TABLE template_favorites IS 'User favorites/bookmarks for templates';
COMMENT ON TABLE template_reviews IS 'User ratings and reviews for templates';
COMMENT ON TABLE template_tags IS 'Tags for categorizing templates';
COMMENT ON TABLE template_tag_assignments IS 'Assignment of tags to templates';
COMMENT ON TABLE template_analytics IS 'Daily aggregated analytics for templates';
COMMENT ON TABLE template_shares IS 'Template sharing permissions';
COMMENT ON VIEW template_stats IS 'Comprehensive statistics for templates';
COMMENT ON VIEW user_template_activity IS 'User activity summary in the template system';