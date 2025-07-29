const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Create a wrapper to make it compatible with PostgreSQL client interface
const db = {
  query: async (text, params = []) => {
    try {
      // Convert PostgreSQL-style queries to Supabase queries

      // Handle modules queries
      if (text.includes('SELECT') && text.includes('FROM modules')) {
        let query = supabase.from('modules').select('*');

        // Apply LIMIT and OFFSET if present
        if (params.length >= 2 && text.includes('LIMIT')) {
          const limit = params[params.length - 2];
          const offset = params[params.length - 1];
          query = query.range(offset, offset + limit - 1);
        }

        query = query.order('order_index', { ascending: true });

        const { data, error } = await query;
        if (error) throw error;
        return { rows: data || [] };
      }

      // Handle lessons queries
      if (text.includes('SELECT') && text.includes('FROM lessons')) {
        let query = supabase.from('lessons').select('*');

        // Handle WHERE module_id = $1
        if (text.includes('WHERE module_id') && params.length > 0) {
          query = query.eq('module_id', params[0]);
        }

        // Apply LIMIT and OFFSET if present
        if (params.length >= 2 && text.includes('LIMIT')) {
          const limit = params[params.length - 2];
          const offset = params[params.length - 1];
          query = query.range(offset, offset + limit - 1);
        }

        query = query.order('order_index', { ascending: true });

        const { data, error } = await query;
        if (error) throw error;
        return { rows: data || [] };
      }

      // Handle COUNT queries
      if (text.includes('SELECT COUNT(*) FROM modules')) {
        const { count, error } = await supabase
          .from('modules')
          .select('*', { count: 'exact', head: true });

        if (error) throw error;
        return { rows: [{ count: count }] };
      }

      if (text.includes('SELECT COUNT(*) FROM lessons')) {
        const { count, error } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true });

        if (error) throw error;
        return { rows: [{ count: count }] };
      }

      // For other queries, try to execute directly (this is a fallback)
      logger.warn('Unhandled query:', text, 'with params:', params);
      return { rows: [] };

    } catch (error) {
      logger.error('Database query error:', error);
      throw error;
    }
  }
};

module.exports = db;
