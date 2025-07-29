const logger = require('../utils/logger');

/**
 * Quality Scoring Service
 * Provides automated evaluation and scoring of AI responses
 */
class QualityScoringService {
  constructor() {
    this.scoringCriteria = {
      relevance: { weight: 0.25, description: 'How well the response addresses the prompt' },
      accuracy: { weight: 0.25, description: 'Factual correctness and reliability' },
      completeness: { weight: 0.20, description: 'Thoroughness of the response' },
      clarity: { weight: 0.15, description: 'Readability and organization' },
      helpfulness: { weight: 0.15, description: 'Practical value and actionability' }
    };

    this.qualityThresholds = {
      excellent: 0.85,
      good: 0.70,
      fair: 0.55,
      poor: 0.0
    };
  }

  /**
   * Score a single AI response
   * @param {Object} response - AI response object
   * @param {string} originalPrompt - The original prompt
   * @param {Object} context - Additional context for scoring
   * @returns {Promise<Object>} Scoring results
   */
  async scoreResponse(response, originalPrompt, context = {}) {
    try {
      const content = response.content || '';
      const provider = response.provider || 'unknown';
      const model = response.model || 'unknown';

      logger.info(`Scoring response from ${provider} (${model})`);

      // Calculate individual scores
      const scores = {
        relevance: this.scoreRelevance(content, originalPrompt, context),
        accuracy: this.scoreAccuracy(content, originalPrompt, context),
        completeness: this.scoreCompleteness(content, originalPrompt, context),
        clarity: this.scoreClarity(content, context),
        helpfulness: this.scoreHelpfulness(content, originalPrompt, context)
      };

      // Calculate weighted overall score
      const overallScore = this.calculateOverallScore(scores);

      // Determine quality level
      const qualityLevel = this.determineQualityLevel(overallScore);

      // Generate detailed feedback
      const feedback = this.generateFeedback(scores, content, originalPrompt);

      // Calculate additional metrics
      const metrics = this.calculateAdditionalMetrics(response, content);

      const result = {
        response_info: {
          provider,
          model,
          response_time: response.response_time || 0,
          token_usage: response.usage || {}
        },
        scores: {
          individual: scores,
          overall: Math.round(overallScore * 100) / 100,
          quality_level: qualityLevel,
          breakdown: this.generateScoreBreakdown(scores)
        },
        metrics,
        feedback,
        timestamp: new Date().toISOString()
      };

      logger.info(`Response scored: ${qualityLevel} (${result.scores.overall})`);
      return result;

    } catch (error) {
      logger.error('Error scoring response:', error);
      throw new Error(`Quality scoring failed: ${error.message}`);
    }
  }

  /**
   * Score multiple responses and compare them
   * @param {Object[]} responses - Array of AI responses
   * @param {string} originalPrompt - The original prompt
   * @param {Object} context - Additional context for scoring
   * @returns {Promise<Object>} Comparative scoring results
   */
  async scoreMultipleResponses(responses, originalPrompt, context = {}) {
    try {
      logger.info(`Scoring ${responses.length} responses for comparison`);

      const scoringResults = [];
      const errors = [];

      // Score each response
      for (const response of responses) {
        try {
          const scoring = await this.scoreResponse(response, originalPrompt, context);
          scoringResults.push(scoring);
        } catch (error) {
          logger.error(`Error scoring response from ${response.provider}:`, error);
          errors.push({
            provider: response.provider,
            error: error.message
          });
        }
      }

      // Generate comparative analysis
      const comparison = this.generateComparativeAnalysis(scoringResults);

      // Determine best response
      const bestResponse = this.findBestResponse(scoringResults);

      const result = {
        individual_scores: scoringResults,
        comparison,
        best_response: bestResponse,
        summary: {
          total_responses: responses.length,
          successfully_scored: scoringResults.length,
          failed_scoring: errors.length,
          errors,
          average_score: this.calculateAverageScore(scoringResults),
          score_range: this.calculateScoreRange(scoringResults)
        },
        timestamp: new Date().toISOString()
      };

      logger.info(`Comparative scoring completed: ${result.summary.successfully_scored}/${result.summary.total_responses} scored`);
      return result;

    } catch (error) {
      logger.error('Error in multiple response scoring:', error);
      throw new Error(`Multiple response scoring failed: ${error.message}`);
    }
  }

  /**
   * Score relevance of response to prompt (0-1)
   * @param {string} content - Response content
   * @param {string} prompt - Original prompt
   * @param {Object} context - Additional context
   * @returns {number} Relevance score
   */
  scoreRelevance(content, prompt, context) {
    if (!content || !prompt) return 0;

    let score = 0;

    // Extract key terms from prompt
    const promptTerms = this.extractKeyTerms(prompt);
    const contentLower = content.toLowerCase();

    // Check for direct term matches
    let matchedTerms = 0;
    promptTerms.forEach(term => {
      if (contentLower.includes(term.toLowerCase())) {
        matchedTerms++;
      }
    });

    // Base relevance from term matching
    if (promptTerms.length > 0) {
      score += (matchedTerms / promptTerms.length) * 0.6;
    }

    // Check for semantic relevance patterns
    const promptType = this.identifyPromptType(prompt);
    score += this.checkSemanticRelevance(content, promptType) * 0.4;

    return Math.min(1, score);
  }

  /**
   * Score accuracy of response (0-1)
   * @param {string} content - Response content
   * @param {string} prompt - Original prompt
   * @param {Object} context - Additional context
   * @returns {number} Accuracy score
   */
  scoreAccuracy(content, prompt, context) {
    if (!content) return 0;

    let score = 0.7; // Base score (neutral assumption)

    // Check for uncertainty indicators (positive for honesty)
    const uncertaintyIndicators = ['might', 'could', 'possibly', 'likely', 'probably', 'i think', 'it seems'];
    const hasUncertainty = uncertaintyIndicators.some(indicator => 
      content.toLowerCase().includes(indicator)
    );
    if (hasUncertainty) score += 0.1;

    // Check for citation or reference patterns
    if (content.includes('according to') || content.includes('research shows') || content.includes('studies indicate')) {
      score += 0.1;
    }

    // Penalize overconfident claims without evidence
    const overconfidentPhrases = ['definitely', 'certainly', 'absolutely', 'guaranteed', 'always works'];
    const hasOverconfidence = overconfidentPhrases.some(phrase => 
      content.toLowerCase().includes(phrase)
    );
    if (hasOverconfidence && !content.includes('source') && !content.includes('reference')) {
      score -= 0.2;
    }

    // Check for contradictions within the response
    if (this.hasInternalContradictions(content)) {
      score -= 0.3;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Score completeness of response (0-1)
   * @param {string} content - Response content
   * @param {string} prompt - Original prompt
   * @param {Object} context - Additional context
   * @returns {number} Completeness score
   */
  scoreCompleteness(content, prompt, context) {
    if (!content) return 0;

    let score = 0.3; // Base score

    // Length-based completeness
    if (content.length > 100) score += 0.1;
    if (content.length > 300) score += 0.1;
    if (content.length > 500) score += 0.1;

    // Structure-based completeness
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 2) score += 0.1;
    if (sentences.length > 5) score += 0.1;

    // Check for multi-part answers to complex prompts
    const promptParts = this.identifyPromptParts(prompt);
    if (promptParts.length > 1) {
      const addressedParts = promptParts.filter(part => 
        content.toLowerCase().includes(part.toLowerCase())
      ).length;
      score += (addressedParts / promptParts.length) * 0.2;
    }

    // Check for examples, explanations, or elaborations
    if (content.includes('example') || content.includes('for instance')) score += 0.05;
    if (content.includes('because') || content.includes('reason')) score += 0.05;
    if (content.includes('step') || content.includes('process')) score += 0.05;

    return Math.min(1, score);
  }

  /**
   * Score clarity of response (0-1)
   * @param {string} content - Response content
   * @param {Object} context - Additional context
   * @returns {number} Clarity score
   */
  scoreClarity(content, context) {
    if (!content) return 0;

    let score = 0.4; // Base score

    // Sentence length analysis
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 0) {
      const avgSentenceLength = content.length / sentences.length;
      if (avgSentenceLength < 150) score += 0.1; // Not too long
      if (avgSentenceLength < 100) score += 0.1; // Concise
    }

    // Paragraph structure
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    if (paragraphs.length > 1) score += 0.1;

    // Use of lists or structured format
    if (content.includes('1.') || content.includes('•') || content.includes('- ')) score += 0.1;

    // Transition words and logical flow
    const transitionWords = ['first', 'then', 'next', 'finally', 'however', 'therefore', 'additionally'];
    const hasTransitions = transitionWords.some(word => 
      content.toLowerCase().includes(word)
    );
    if (hasTransitions) score += 0.1;

    // Avoid excessive jargon (simple heuristic)
    const words = content.split(/\s+/);
    const longWords = words.filter(word => word.length > 12).length;
    const jargonRatio = longWords / words.length;
    if (jargonRatio < 0.05) score += 0.1; // Not too much jargon

    return Math.min(1, score);
  }

  /**
   * Score helpfulness of response (0-1)
   * @param {string} content - Response content
   * @param {string} prompt - Original prompt
   * @param {Object} context - Additional context
   * @returns {number} Helpfulness score
   */
  scoreHelpfulness(content, prompt, context) {
    if (!content) return 0;

    let score = 0.3; // Base score

    // Actionable advice
    const actionWords = ['try', 'consider', 'recommend', 'suggest', 'can', 'should', 'could'];
    const hasActionableAdvice = actionWords.some(word => 
      content.toLowerCase().includes(word)
    );
    if (hasActionableAdvice) score += 0.15;

    // Specific examples or steps
    if (content.includes('example') || content.includes('for instance')) score += 0.1;
    if (content.includes('step') || content.match(/\d+\./)) score += 0.1;

    // Addresses potential issues or considerations
    if (content.includes('however') || content.includes('note that') || content.includes('be aware')) score += 0.1;

    // Provides alternatives or options
    if (content.includes('alternatively') || content.includes('another option') || content.includes('you could also')) score += 0.1;

    // Context-specific helpfulness
    if (prompt.toLowerCase().includes('how')) {
      // For "how-to" questions, check for procedural content
      if (content.includes('first') || content.includes('begin') || content.includes('start')) score += 0.05;
    }

    if (prompt.toLowerCase().includes('why')) {
      // For "why" questions, check for explanatory content
      if (content.includes('because') || content.includes('reason') || content.includes('due to')) score += 0.05;
    }

    return Math.min(1, score);
  }

  /**
   * Calculate weighted overall score
   * @param {Object} scores - Individual scores object
   * @returns {number} Overall weighted score
   */
  calculateOverallScore(scores) {
    let weightedSum = 0;
    let totalWeight = 0;

    Object.keys(this.scoringCriteria).forEach(criterion => {
      if (scores[criterion] !== undefined) {
        const weight = this.scoringCriteria[criterion].weight;
        weightedSum += scores[criterion] * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Determine quality level based on score
   * @param {number} score - Overall score (0-1)
   * @returns {string} Quality level
   */
  determineQualityLevel(score) {
    if (score >= this.qualityThresholds.excellent) return 'excellent';
    if (score >= this.qualityThresholds.good) return 'good';
    if (score >= this.qualityThresholds.fair) return 'fair';
    return 'poor';
  }

  /**
   * Generate detailed feedback based on scores
   * @param {Object} scores - Individual scores
   * @param {string} content - Response content
   * @param {string} prompt - Original prompt
   * @returns {Object} Feedback object
   */
  generateFeedback(scores, content, prompt) {
    const feedback = {
      strengths: [],
      areas_for_improvement: [],
      specific_suggestions: []
    };

    // Analyze strengths
    Object.keys(scores).forEach(criterion => {
      const score = scores[criterion];
      if (score >= 0.8) {
        feedback.strengths.push(`Strong ${criterion}: ${this.scoringCriteria[criterion].description}`);
      }
    });

    // Analyze areas for improvement
    Object.keys(scores).forEach(criterion => {
      const score = scores[criterion];
      if (score < 0.6) {
        feedback.areas_for_improvement.push(`${criterion}: ${this.scoringCriteria[criterion].description}`);
      }
    });

    // Generate specific suggestions
    if (scores.relevance < 0.6) {
      feedback.specific_suggestions.push('Focus more directly on addressing the main question or topic');
    }
    if (scores.completeness < 0.6) {
      feedback.specific_suggestions.push('Provide more comprehensive coverage of the topic');
    }
    if (scores.clarity < 0.6) {
      feedback.specific_suggestions.push('Improve organization and use clearer language');
    }
    if (scores.helpfulness < 0.6) {
      feedback.specific_suggestions.push('Include more actionable advice or practical examples');
    }

    return feedback;
  }

  /**
   * Calculate additional metrics for the response
   * @param {Object} response - AI response object
   * @param {string} content - Response content
   * @returns {Object} Additional metrics
   */
  calculateAdditionalMetrics(response, content) {
    return {
      response_length: {
        characters: content.length,
        words: content.split(/\s+/).filter(w => w.length > 0).length,
        sentences: content.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
        paragraphs: content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
      },
      structure: {
        has_lists: /\d+\.|\•|\-\s/.test(content),
        has_code: /```|`/.test(content),
        has_examples: /example|for instance/i.test(content),
        has_questions: /\?/.test(content)
      },
      tone_indicators: {
        polite: /please|thank you|kindly/i.test(content),
        confident: /definitely|certainly|absolutely/i.test(content),
        uncertain: /might|could|possibly|probably/i.test(content),
        helpful: /try|consider|suggest|recommend/i.test(content)
      },
      efficiency: {
        tokens_per_word: response.usage ? (response.usage.total_tokens || 0) / (content.split(/\s+/).length || 1) : 0,
        response_time_per_token: response.usage && response.response_time ? 
          response.response_time / (response.usage.total_tokens || 1) : 0
      }
    };
  }

  /**
   * Generate score breakdown for detailed analysis
   * @param {Object} scores - Individual scores
   * @returns {Object} Score breakdown
   */
  generateScoreBreakdown(scores) {
    const breakdown = {};
    
    Object.keys(this.scoringCriteria).forEach(criterion => {
      const score = scores[criterion] || 0;
      const weight = this.scoringCriteria[criterion].weight;
      breakdown[criterion] = {
        score: Math.round(score * 100) / 100,
        weighted_contribution: Math.round(score * weight * 100) / 100,
        weight: weight,
        percentage: Math.round(score * 100) + '%'
      };
    });

    return breakdown;
  }

  /**
   * Generate comparative analysis of multiple scored responses
   * @param {Object[]} scoringResults - Array of scoring results
   * @returns {Object} Comparative analysis
   */
  generateComparativeAnalysis(scoringResults) {
    if (scoringResults.length === 0) {
      return { error: 'No scoring results to analyze' };
    }

    const analysis = {
      score_comparison: {},
      performance_metrics: {},
      rankings: {},
      insights: []
    };

    // Compare scores across criteria
    Object.keys(this.scoringCriteria).forEach(criterion => {
      const scores = scoringResults.map(result => ({
        provider: result.response_info.provider,
        score: result.scores.individual[criterion] || 0
      })).sort((a, b) => b.score - a.score);

      analysis.score_comparison[criterion] = scores;
    });

    // Overall rankings
    analysis.rankings.overall = scoringResults
      .map(result => ({
        provider: result.response_info.provider,
        model: result.response_info.model,
        overall_score: result.scores.overall,
        quality_level: result.scores.quality_level
      }))
      .sort((a, b) => b.overall_score - a.overall_score);

    // Performance metrics comparison
    analysis.performance_metrics = {
      response_times: scoringResults.map(result => ({
        provider: result.response_info.provider,
        response_time: result.response_info.response_time
      })).sort((a, b) => a.response_time - b.response_time),
      token_efficiency: scoringResults.map(result => ({
        provider: result.response_info.provider,
        tokens_used: result.response_info.token_usage.total_tokens || 0,
        score_per_token: result.response_info.token_usage.total_tokens ? 
          result.scores.overall / result.response_info.token_usage.total_tokens : 0
      })).sort((a, b) => b.score_per_token - a.score_per_token)
    };

    // Generate insights
    analysis.insights = this.generateComparativeInsights(scoringResults);

    return analysis;
  }

  /**
   * Find the best response based on overall score
   * @param {Object[]} scoringResults - Array of scoring results
   * @returns {Object|null} Best response info
   */
  findBestResponse(scoringResults) {
    if (scoringResults.length === 0) return null;

    const bestResult = scoringResults.reduce((best, current) => 
      current.scores.overall > best.scores.overall ? current : best
    );

    return {
      provider: bestResult.response_info.provider,
      model: bestResult.response_info.model,
      overall_score: bestResult.scores.overall,
      quality_level: bestResult.scores.quality_level,
      strengths: bestResult.feedback.strengths,
      why_best: this.explainWhyBest(bestResult, scoringResults)
    };
  }

  /**
   * Calculate average score across all responses
   * @param {Object[]} scoringResults - Array of scoring results
   * @returns {number} Average score
   */
  calculateAverageScore(scoringResults) {
    if (scoringResults.length === 0) return 0;
    
    const sum = scoringResults.reduce((total, result) => total + result.scores.overall, 0);
    return Math.round((sum / scoringResults.length) * 100) / 100;
  }

  /**
   * Calculate score range across all responses
   * @param {Object[]} scoringResults - Array of scoring results
   * @returns {Object} Score range info
   */
  calculateScoreRange(scoringResults) {
    if (scoringResults.length === 0) return { min: 0, max: 0, spread: 0 };

    const scores = scoringResults.map(result => result.scores.overall);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    
    return {
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      spread: Math.round((max - min) * 100) / 100
    };
  }

  // Utility methods for content analysis

  extractKeyTerms(prompt) {
    // Simple keyword extraction (could be enhanced with NLP)
    return prompt.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['what', 'how', 'why', 'when', 'where', 'who', 'which', 'that', 'this', 'with', 'from', 'they', 'have', 'been', 'would', 'could', 'should'].includes(word));
  }

  identifyPromptType(prompt) {
    const lower = prompt.toLowerCase();
    if (lower.startsWith('how')) return 'how-to';
    if (lower.startsWith('what')) return 'definition';
    if (lower.startsWith('why')) return 'explanation';
    if (lower.startsWith('when')) return 'temporal';
    if (lower.startsWith('where')) return 'location';
    if (lower.includes('compare') || lower.includes('difference')) return 'comparison';
    if (lower.includes('list') || lower.includes('examples')) return 'enumeration';
    return 'general';
  }

  checkSemanticRelevance(content, promptType) {
    const lower = content.toLowerCase();
    switch (promptType) {
      case 'how-to':
        return (lower.includes('step') || lower.includes('first') || lower.includes('then')) ? 0.8 : 0.4;
      case 'definition':
        return (lower.includes('is') || lower.includes('means') || lower.includes('refers to')) ? 0.8 : 0.4;
      case 'explanation':
        return (lower.includes('because') || lower.includes('reason') || lower.includes('due to')) ? 0.8 : 0.4;
      case 'comparison':
        return (lower.includes('unlike') || lower.includes('similar') || lower.includes('different')) ? 0.8 : 0.4;
      case 'enumeration':
        return (lower.includes('1.') || lower.includes('first') || lower.includes('examples')) ? 0.8 : 0.4;
      default:
        return 0.6;
    }
  }

  identifyPromptParts(prompt) {
    // Simple identification of multiple questions or parts
    const parts = [];
    if (prompt.includes('?')) {
      parts.push(...prompt.split('?').filter(part => part.trim().length > 0));
    }
    if (prompt.includes(' and ')) {
      parts.push(...prompt.split(' and ').filter(part => part.trim().length > 0));
    }
    return parts.length > 1 ? parts : [prompt];
  }

  hasInternalContradictions(content) {
    // Simple contradiction detection (could be enhanced)
    const sentences = content.split(/[.!?]+/).map(s => s.trim().toLowerCase());
    
    for (let i = 0; i < sentences.length - 1; i++) {
      const current = sentences[i];
      for (let j = i + 1; j < sentences.length; j++) {
        const other = sentences[j];
        
        // Check for explicit contradictions
        if ((current.includes('always') && other.includes('never')) ||
            (current.includes('never') && other.includes('always')) ||
            (current.includes('all') && other.includes('none')) ||
            (current.includes('true') && other.includes('false'))) {
          return true;
        }
      }
    }
    
    return false;
  }

  generateComparativeInsights(scoringResults) {
    const insights = [];
    
    if (scoringResults.length < 2) {
      return ['Not enough responses for comparative analysis'];
    }

    // Score spread analysis
    const scores = scoringResults.map(r => r.scores.overall);
    const spread = Math.max(...scores) - Math.min(...scores);
    
    if (spread > 0.3) {
      insights.push('Significant variation in response quality across providers');
    } else if (spread < 0.1) {
      insights.push('All responses achieved similar overall quality scores');
    }

    // Best performer analysis
    const bestScore = Math.max(...scores);
    const bestProviders = scoringResults.filter(r => r.scores.overall === bestScore);
    
    if (bestProviders.length === 1) {
      insights.push(`${bestProviders[0].response_info.provider} achieved the highest overall score`);
    } else {
      insights.push(`Multiple providers tied for best overall score: ${bestProviders.map(p => p.response_info.provider).join(', ')}`);
    }

    // Criteria-specific insights
    Object.keys(this.scoringCriteria).forEach(criterion => {
      const criterionScores = scoringResults.map(r => ({
        provider: r.response_info.provider,
        score: r.scores.individual[criterion]
      }));
      
      const bestInCriterion = criterionScores.reduce((best, current) => 
        current.score > best.score ? current : best
      );
      
      if (bestInCriterion.score > 0.8) {
        insights.push(`${bestInCriterion.provider} excelled in ${criterion} (${Math.round(bestInCriterion.score * 100)}%)`);
      }
    });

    return insights;
  }

  explainWhyBest(bestResult, allResults) {
    const reasons = [];
    
    // Overall score comparison
    const otherScores = allResults.filter(r => r !== bestResult).map(r => r.scores.overall);
    const averageOthers = otherScores.reduce((sum, score) => sum + score, 0) / otherScores.length;
    
    if (bestResult.scores.overall > averageOthers + 0.1) {
      reasons.push(`Significantly higher overall score (${bestResult.scores.overall} vs avg ${Math.round(averageOthers * 100)/100})`);
    }

    // Criteria where this response excelled
    Object.keys(bestResult.scores.individual).forEach(criterion => {
      const score = bestResult.scores.individual[criterion];
      if (score > 0.8) {
        reasons.push(`Strong performance in ${criterion} (${Math.round(score * 100)}%)`);
      }
    });

    return reasons.length > 0 ? reasons : ['Best overall score among all responses'];
  }

  /**
   * Get service health status
   * @returns {Object} Health status
   */
  getHealthStatus() {
    return {
      service: 'Quality Scoring Service',
      status: 'operational',
      scoring_criteria: Object.keys(this.scoringCriteria),
      quality_thresholds: this.qualityThresholds,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
module.exports = new QualityScoringService();