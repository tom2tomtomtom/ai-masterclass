const logger = require('../utils/logger');
const aiService = require('./aiService');

/**
 * Response Comparison Service
 * Handles side-by-side comparison of AI responses from different providers
 */
class ResponseComparisonService {
  constructor() {
    this.comparisonMetrics = [
      'response_time',
      'token_usage',
      'content_length',
      'readability_score',
      'relevance_score'
    ];
  }

  /**
   * Generate side-by-side responses for comparison
   * @param {Object} request - The comparison request
   * @returns {Promise<Object>} Comparison results
   */
  async generateComparison(request) {
    const startTime = Date.now();
    
    try {
      const {
        prompt,
        providers = aiService.getAvailableProviders(),
        parameters = {}
      } = request;

      logger.info(`Starting comparison with ${providers.length} providers: ${providers.join(', ')}`);

      // Generate responses from multiple providers
      const multipleResponses = await aiService.generateMultipleResponses(
        { prompt, ...parameters },
        providers
      );

      // Analyze and score responses
      const analysis = await this.analyzeResponses(multipleResponses.responses, prompt);

      // Calculate comparison metrics
      const comparison = this.calculateComparisonMetrics(multipleResponses.responses);

      const result = {
        request: {
          prompt: prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''),
          providers_requested: providers,
          parameters
        },
        responses: multipleResponses.responses,
        analysis,
        comparison,
        summary: {
          total_providers: multipleResponses.total_providers,
          successful_responses: multipleResponses.successful_responses,
          failed_responses: multipleResponses.failed_responses,
          errors: multipleResponses.errors,
          total_processing_time: Date.now() - startTime
        },
        timestamp: new Date().toISOString()
      };

      logger.info(`Comparison completed: ${result.summary.successful_responses}/${result.summary.total_providers} successful`);
      return result;

    } catch (error) {
      logger.error('Error in response comparison:', error);
      throw new Error(`Comparison failed: ${error.message}`);
    }
  }

  /**
   * Analyze responses for quality and characteristics
   * @param {Object[]} responses - Array of AI responses
   * @param {string} originalPrompt - The original prompt
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeResponses(responses, originalPrompt) {
    const analysis = {
      response_analysis: [],
      rankings: {},
      insights: []
    };

    try {
      // Analyze each response
      for (const response of responses) {
        const responseAnalysis = await this.analyzeIndividualResponse(response, originalPrompt);
        analysis.response_analysis.push(responseAnalysis);
      }

      // Generate rankings
      analysis.rankings = this.generateRankings(analysis.response_analysis);

      // Generate insights
      analysis.insights = this.generateInsights(analysis.response_analysis, responses);

      return analysis;

    } catch (error) {
      logger.error('Error analyzing responses:', error);
      return {
        response_analysis: [],
        rankings: {},
        insights: ['Analysis failed due to error'],
        error: error.message
      };
    }
  }

  /**
   * Analyze individual response characteristics
   * @param {Object} response - AI response object
   * @param {string} originalPrompt - The original prompt
   * @returns {Promise<Object>} Individual analysis
   */
  async analyzeIndividualResponse(response, originalPrompt) {
    try {
      const content = response.content || '';
      
      return {
        provider: response.provider,
        model: response.model,
        metrics: {
          response_time: response.response_time,
          token_count: response.usage?.total_tokens || 0,
          character_count: content.length,
          word_count: content.split(/\s+/).filter(word => word.length > 0).length,
          sentence_count: content.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
          paragraph_count: content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
        },
        content_analysis: {
          starts_with_greeting: /^(hello|hi|hey|greetings)/i.test(content.trim()),
          includes_examples: content.toLowerCase().includes('example') || content.toLowerCase().includes('for instance'),
          includes_lists: content.includes('1.') || content.includes('•') || content.includes('-'),
          includes_code: content.includes('```') || content.includes('`'),
          tone: this.analyzeTone(content),
          readability: this.calculateReadabilityScore(content)
        },
        quality_scores: {
          relevance: this.calculateRelevanceScore(content, originalPrompt),
          completeness: this.calculateCompletenessScore(content, originalPrompt),
          clarity: this.calculateClarityScore(content),
          helpfulness: this.calculateHelpfulnessScore(content)
        }
      };

    } catch (error) {
      logger.error(`Error analyzing response from ${response.provider}:`, error);
      return {
        provider: response.provider,
        model: response.model,
        error: error.message,
        quality_scores: { relevance: 0, completeness: 0, clarity: 0, helpfulness: 0 }
      };
    }
  }

  /**
   * Calculate comparison metrics between responses
   * @param {Object[]} responses - Array of AI responses
   * @returns {Object} Comparison metrics
   */
  calculateComparisonMetrics(responses) {
    if (responses.length === 0) {
      return { error: 'No responses to compare' };
    }

    const metrics = {
      response_times: {},
      token_usage: {},
      content_lengths: {},
      fastest_response: null,
      most_tokens: null,
      longest_content: null,
      shortest_content: null,
      average_response_time: 0,
      total_tokens_used: 0
    };

    let totalResponseTime = 0;
    let totalTokens = 0;
    let fastestTime = Infinity;
    let maxTokens = 0;
    let maxContentLength = 0;
    let minContentLength = Infinity;

    responses.forEach(response => {
      const responseTime = response.response_time || 0;
      const tokens = response.usage?.total_tokens || 0;
      const contentLength = (response.content || '').length;

      // Record individual metrics
      metrics.response_times[response.provider] = responseTime;
      metrics.token_usage[response.provider] = tokens;
      metrics.content_lengths[response.provider] = contentLength;

      // Update totals and extremes
      totalResponseTime += responseTime;
      totalTokens += tokens;

      if (responseTime < fastestTime) {
        fastestTime = responseTime;
        metrics.fastest_response = response.provider;
      }

      if (tokens > maxTokens) {
        maxTokens = tokens;
        metrics.most_tokens = response.provider;
      }

      if (contentLength > maxContentLength) {
        maxContentLength = contentLength;
        metrics.longest_content = response.provider;
      }

      if (contentLength < minContentLength) {
        minContentLength = contentLength;
        metrics.shortest_content = response.provider;
      }
    });

    metrics.average_response_time = Math.round(totalResponseTime / responses.length);
    metrics.total_tokens_used = totalTokens;

    return metrics;
  }

  /**
   * Generate rankings based on different criteria
   * @param {Object[]} responseAnalyses - Array of response analyses
   * @returns {Object} Rankings object
   */
  generateRankings(responseAnalyses) {
    const rankings = {
      by_speed: [],
      by_quality: [],
      by_relevance: [],
      by_completeness: [],
      overall: []
    };

    try {
      // Sort by response time (fastest first)
      rankings.by_speed = [...responseAnalyses]
        .sort((a, b) => (a.metrics?.response_time || Infinity) - (b.metrics?.response_time || Infinity))
        .map(analysis => ({
          provider: analysis.provider,
          model: analysis.model,
          value: analysis.metrics?.response_time || 0
        }));

      // Sort by relevance score (highest first)
      rankings.by_relevance = [...responseAnalyses]
        .sort((a, b) => (b.quality_scores?.relevance || 0) - (a.quality_scores?.relevance || 0))
        .map(analysis => ({
          provider: analysis.provider,
          model: analysis.model,
          value: analysis.quality_scores?.relevance || 0
        }));

      // Sort by completeness score (highest first)
      rankings.by_completeness = [...responseAnalyses]
        .sort((a, b) => (b.quality_scores?.completeness || 0) - (a.quality_scores?.completeness || 0))
        .map(analysis => ({
          provider: analysis.provider,
          model: analysis.model,
          value: analysis.quality_scores?.completeness || 0
        }));

      // Calculate overall score (weighted average of quality metrics)
      rankings.overall = [...responseAnalyses]
        .map(analysis => {
          const scores = analysis.quality_scores || {};
          const overallScore = (
            (scores.relevance || 0) * 0.3 +
            (scores.completeness || 0) * 0.25 +
            (scores.clarity || 0) * 0.25 +
            (scores.helpfulness || 0) * 0.2
          );
          return {
            provider: analysis.provider,
            model: analysis.model,
            value: Math.round(overallScore * 100) / 100
          };
        })
        .sort((a, b) => b.value - a.value);

      rankings.by_quality = rankings.overall;

    } catch (error) {
      logger.error('Error generating rankings:', error);
    }

    return rankings;
  }

  /**
   * Generate insights from the comparison
   * @param {Object[]} responseAnalyses - Array of response analyses
   * @param {Object[]} responses - Original responses
   * @returns {string[]} Array of insight strings
   */
  generateInsights(responseAnalyses, responses) {
    const insights = [];

    try {
      if (responseAnalyses.length === 0) {
        return ['No responses available for analysis'];
      }

      // Response time insights
      const responseTimes = responseAnalyses.map(a => a.metrics?.response_time || 0);
      const fastestTime = Math.min(...responseTimes);
      const slowestTime = Math.max(...responseTimes);
      const fastestProvider = responseAnalyses.find(a => a.metrics?.response_time === fastestTime)?.provider;
      const slowestProvider = responseAnalyses.find(a => a.metrics?.response_time === slowestTime)?.provider;

      if (fastestProvider && slowestProvider && fastestTime < slowestTime) {
        insights.push(`${fastestProvider} was the fastest (${fastestTime}ms) while ${slowestProvider} was the slowest (${slowestTime}ms)`);
      }

      // Token usage insights
      const tokenCounts = responseAnalyses.map(a => a.metrics?.token_count || 0);
      const maxTokens = Math.max(...tokenCounts);
      const minTokens = Math.min(...tokenCounts);
      const mostTokensProvider = responseAnalyses.find(a => a.metrics?.token_count === maxTokens)?.provider;
      const leastTokensProvider = responseAnalyses.find(a => a.metrics?.token_count === minTokens)?.provider;

      if (mostTokensProvider && leastTokensProvider && maxTokens > minTokens) {
        insights.push(`${mostTokensProvider} used the most tokens (${maxTokens}) while ${leastTokensProvider} used the least (${minTokens})`);
      }

      // Quality insights
      const relevanceScores = responseAnalyses.map(a => a.quality_scores?.relevance || 0);
      const maxRelevance = Math.max(...relevanceScores);
      const mostRelevantProvider = responseAnalyses.find(a => a.quality_scores?.relevance === maxRelevance)?.provider;

      if (mostRelevantProvider && maxRelevance > 0) {
        insights.push(`${mostRelevantProvider} provided the most relevant response (${Math.round(maxRelevance * 100)}% relevance)`);
      }

      // Content style insights
      const withExamples = responseAnalyses.filter(a => a.content_analysis?.includes_examples).length;
      const withLists = responseAnalyses.filter(a => a.content_analysis?.includes_lists).length;
      const withCode = responseAnalyses.filter(a => a.content_analysis?.includes_code).length;

      if (withExamples > 0) {
        insights.push(`${withExamples} out of ${responseAnalyses.length} responses included examples`);
      }

      if (withLists > 0) {
        insights.push(`${withLists} out of ${responseAnalyses.length} responses used structured lists`);
      }

      if (withCode > 0) {
        insights.push(`${withCode} out of ${responseAnalyses.length} responses included code snippets`);
      }

    } catch (error) {
      logger.error('Error generating insights:', error);
      insights.push('Error generating insights from comparison data');
    }

    return insights.length > 0 ? insights : ['No significant insights found'];
  }

  /**
   * Simple tone analysis
   * @param {string} content - Response content
   * @returns {string} Detected tone
   */
  analyzeTone(content) {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('sorry') || lowerContent.includes('unfortunately')) {
      return 'apologetic';
    } else if (lowerContent.includes('!') && lowerContent.includes('great')) {
      return 'enthusiastic';
    } else if (lowerContent.includes('however') || lowerContent.includes('but')) {
      return 'balanced';
    } else if (lowerContent.includes('please') || lowerContent.includes('kindly')) {
      return 'polite';
    } else {
      return 'neutral';
    }
  }

  /**
   * Calculate simple readability score (0-1)
   * @param {string} content - Response content
   * @returns {number} Readability score
   */
  calculateReadabilityScore(content) {
    if (!content || content.length === 0) return 0;

    const words = content.split(/\s+/).filter(word => word.length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgCharsPerWord = content.replace(/\s/g, '').length / words.length;

    // Simple readability formula (lower is better, normalized to 0-1)
    const complexity = (avgWordsPerSentence * 0.1) + (avgCharsPerWord * 0.05);
    return Math.max(0, Math.min(1, 1 - (complexity / 10)));
  }

  /**
   * Calculate relevance score based on keyword matching (0-1)
   * @param {string} content - Response content
   * @param {string} prompt - Original prompt
   * @returns {number} Relevance score
   */
  calculateRelevanceScore(content, prompt) {
    if (!content || !prompt) return 0;

    const promptWords = prompt.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const contentLower = content.toLowerCase();
    
    let matches = 0;
    promptWords.forEach(word => {
      if (contentLower.includes(word)) {
        matches++;
      }
    });

    return promptWords.length > 0 ? matches / promptWords.length : 0;
  }

  /**
   * Calculate completeness score (0-1)
   * @param {string} content - Response content
   * @param {string} prompt - Original prompt
   * @returns {number} Completeness score
   */
  calculateCompletenessScore(content, prompt) {
    if (!content) return 0;

    // Basic heuristics for completeness
    let score = 0.5; // Base score

    // Longer responses tend to be more complete
    if (content.length > 200) score += 0.1;
    if (content.length > 500) score += 0.1;

    // Structured content is often more complete
    if (content.includes('1.') || content.includes('•')) score += 0.1;
    if (content.includes('example') || content.includes('for instance')) score += 0.1;
    if (content.split('.').length > 3) score += 0.1; // Multiple sentences

    // Check if it addresses the prompt comprehensively
    if (prompt.includes('how') && (content.includes('step') || content.includes('method'))) score += 0.1;

    return Math.min(1, score);
  }

  /**
   * Calculate clarity score (0-1)
   * @param {string} content - Response content
   * @returns {number} Clarity score
   */
  calculateClarityScore(content) {
    if (!content) return 0;

    let score = 0.5; // Base score

    // Well-structured content is clearer
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    if (paragraphs.length > 1) score += 0.1;

    // Lists and examples improve clarity
    if (content.includes('1.') || content.includes('•') || content.includes('-')) score += 0.1;
    if (content.includes('example') || content.includes('for instance')) score += 0.1;

    // Avoid overly complex sentences
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = content.length / sentences.length;
    if (avgSentenceLength < 100) score += 0.1; // Not too long
    if (avgSentenceLength < 50) score += 0.1; // Concise

    return Math.min(1, score);
  }

  /**
   * Calculate helpfulness score (0-1)
   * @param {string} content - Response content
   * @returns {number} Helpfulness score
   */
  calculateHelpfulnessScore(content) {
    if (!content) return 0;

    let score = 0.3; // Base score

    // Actionable content is more helpful
    if (content.includes('step') || content.includes('try') || content.includes('consider')) score += 0.1;
    if (content.includes('example') || content.includes('for instance')) score += 0.1;
    if (content.includes('tip') || content.includes('suggestion')) score += 0.1;

    // Comprehensive answers are more helpful
    if (content.length > 300) score += 0.1;
    if (content.includes('also') || content.includes('additionally')) score += 0.1;

    // Warnings or caveats show thoughtfulness
    if (content.includes('however') || content.includes('note that') || content.includes('keep in mind')) score += 0.1;

    return Math.min(1, score);
  }

  /**
   * Get service health status
   * @returns {Object} Health status
   */
  getHealthStatus() {
    return {
      service: 'Response Comparison Service',
      status: 'operational',
      available_metrics: this.comparisonMetrics,
      ai_service_status: aiService.getHealthStatus(),
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
module.exports = new ResponseComparisonService();