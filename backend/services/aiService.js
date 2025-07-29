const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');
const metricsCollector = require('../utils/metrics');

/**
 * Unified AI Service for OpenAI, Anthropic, and Google AI models
 * Provides a consistent interface for all AI providers with error handling and metrics
 */
class AIService {
  constructor() {
    this.providers = {};
    this.isInitialized = false;
    this.supportedProviders = ['openai', 'anthropic', 'google'];
    
    // Initialize providers if API keys are available
    this.initializeProviders();
  }

  /**
   * Initialize AI providers based on available API keys
   */
  initializeProviders() {
    try {
      // Initialize OpenAI
      if (process.env.OPENAI_API_KEY) {
        this.providers.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        logger.info('OpenAI provider initialized');
      }

      // Initialize Anthropic
      if (process.env.ANTHROPIC_API_KEY) {
        this.providers.anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });
        logger.info('Anthropic provider initialized');
      }

      // Initialize Google AI
      if (process.env.GOOGLE_AI_API_KEY) {
        this.providers.google = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
        logger.info('Google AI provider initialized');
      }

      this.isInitialized = true;
      logger.info(`AI Service initialized with ${Object.keys(this.providers).length} providers`);
    } catch (error) {
      logger.error('Error initializing AI providers:', error);
      throw new Error('Failed to initialize AI service');
    }
  }

  /**
   * Get available providers
   * @returns {string[]} Array of available provider names
   */
  getAvailableProviders() {
    return Object.keys(this.providers);
  }

  /**
   * Check if a provider is available
   * @param {string} provider - Provider name
   * @returns {boolean}
   */
  isProviderAvailable(provider) {
    return this.providers.hasOwnProperty(provider);
  }

  /**
   * Generate response from OpenAI
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Formatted response
   */
  async generateOpenAIResponse(params) {
    const startTime = Date.now();
    
    try {
      if (!this.providers.openai) {
        throw new Error('OpenAI provider not available');
      }

      const {
        prompt,
        model = 'gpt-4',
        maxTokens = 1000,
        temperature = 0.7,
        systemMessage = 'You are a helpful AI assistant.'
      } = params;

      const response = await this.providers.openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature,
      });

      const result = {
        provider: 'openai',
        model,
        content: response.choices[0].message.content,
        usage: {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens
        },
        response_time: Date.now() - startTime,
        finish_reason: response.choices[0].finish_reason
      };

      // Record metrics
      metricsCollector.recordAIRequest('openai', model, Date.now() - startTime, 'success');
      
      logger.info(`OpenAI response generated: ${model}, tokens: ${result.usage.total_tokens}`);
      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      metricsCollector.recordAIRequest('openai', params.model || 'gpt-4', responseTime, 'error');
      
      logger.error('OpenAI API error:', error);
      throw this.formatError('openai', error);
    }
  }

  /**
   * Generate response from Anthropic Claude
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Formatted response
   */
  async generateAnthropicResponse(params) {
    const startTime = Date.now();
    
    try {
      if (!this.providers.anthropic) {
        throw new Error('Anthropic provider not available');
      }

      const {
        prompt,
        model = 'claude-3-sonnet-20240229',
        maxTokens = 1000,
        temperature = 0.7,
        systemMessage = 'You are a helpful AI assistant.'
      } = params;

      const response = await this.providers.anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemMessage,
        messages: [
          { role: 'user', content: prompt }
        ]
      });

      const result = {
        provider: 'anthropic',
        model,
        content: response.content[0].text,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
          total_tokens: response.usage.input_tokens + response.usage.output_tokens
        },
        response_time: Date.now() - startTime,
        stop_reason: response.stop_reason
      };

      // Record metrics
      metricsCollector.recordAIRequest('anthropic', model, Date.now() - startTime, 'success');
      
      logger.info(`Anthropic response generated: ${model}, tokens: ${result.usage.total_tokens}`);
      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      metricsCollector.recordAIRequest('anthropic', params.model || 'claude-3-sonnet-20240229', responseTime, 'error');
      
      logger.error('Anthropic API error:', error);
      throw this.formatError('anthropic', error);
    }
  }

  /**
   * Generate response from Google Gemini
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Formatted response
   */
  async generateGoogleResponse(params) {
    const startTime = Date.now();
    
    try {
      if (!this.providers.google) {
        throw new Error('Google AI provider not available');
      }

      const {
        prompt,
        model = 'gemini-pro',
        maxTokens = 1000,
        temperature = 0.7,
        systemMessage = 'You are a helpful AI assistant.'
      } = params;

      const generativeModel = this.providers.google.getGenerativeModel({ 
        model,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature
        }
      });

      const fullPrompt = `${systemMessage}\n\nUser: ${prompt}`;
      const result_response = await generativeModel.generateContent(fullPrompt);
      const response = await result_response.response;
      
      const result = {
        provider: 'google',
        model,
        content: response.text(),
        usage: {
          prompt_tokens: response.usageMetadata?.promptTokenCount || 0,
          completion_tokens: response.usageMetadata?.candidatesTokenCount || 0,
          total_tokens: response.usageMetadata?.totalTokenCount || 0
        },
        response_time: Date.now() - startTime,
        finish_reason: 'stop' // Google doesn't provide detailed finish reasons
      };

      // Record metrics
      metricsCollector.recordAIRequest('google', model, Date.now() - startTime, 'success');
      
      logger.info(`Google AI response generated: ${model}, tokens: ${result.usage.total_tokens}`);
      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      metricsCollector.recordAIRequest('google', params.model || 'gemini-pro', responseTime, 'error');
      
      logger.error('Google AI API error:', error);
      throw this.formatError('google', error);
    }
  }

  /**
   * Generate responses from multiple providers for comparison
   * @param {Object} params - Request parameters
   * @param {string[]} providers - Array of provider names to use
   * @returns {Promise<Object[]>} Array of formatted responses
   */
  async generateMultipleResponses(params, providers = null) {
    const providersToUse = providers || this.getAvailableProviders();
    const responses = [];
    const errors = [];

    logger.info(`Generating responses from ${providersToUse.length} providers: ${providersToUse.join(', ')}`);

    // Generate responses concurrently
    const promises = providersToUse.map(async (provider) => {
      try {
        let response;
        switch (provider) {
          case 'openai':
            response = await this.generateOpenAIResponse(params);
            break;
          case 'anthropic':
            response = await this.generateAnthropicResponse(params);
            break;
          case 'google':
            response = await this.generateGoogleResponse(params);
            break;
          default:
            throw new Error(`Unsupported provider: ${provider}`);
        }
        responses.push(response);
      } catch (error) {
        logger.error(`Error generating response from ${provider}:`, error);
        errors.push({
          provider,
          error: error.message,
          code: error.code || 'UNKNOWN_ERROR'
        });
      }
    });

    await Promise.allSettled(promises);

    return {
      responses,
      errors,
      total_providers: providersToUse.length,
      successful_responses: responses.length,
      failed_responses: errors.length
    };
  }

  /**
   * Generate a single response from the best available provider
   * @param {Object} params - Request parameters
   * @param {string} preferredProvider - Preferred provider (optional)
   * @returns {Promise<Object>} Formatted response
   */
  async generateResponse(params, preferredProvider = null) {
    const availableProviders = this.getAvailableProviders();
    
    if (availableProviders.length === 0) {
      throw new Error('No AI providers available');
    }

    // Use preferred provider if available, otherwise use first available
    const provider = (preferredProvider && this.isProviderAvailable(preferredProvider)) 
      ? preferredProvider 
      : availableProviders[0];

    logger.info(`Generating response using provider: ${provider}`);

    switch (provider) {
      case 'openai':
        return await this.generateOpenAIResponse(params);
      case 'anthropic':
        return await this.generateAnthropicResponse(params);
      case 'google':
        return await this.generateGoogleResponse(params);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Format error responses consistently across providers
   * @param {string} provider - Provider name
   * @param {Error} error - Original error
   * @returns {Error} Formatted error
   */
  formatError(provider, error) {
    const formattedError = new Error(`${provider.toUpperCase()} API Error: ${error.message}`);
    formattedError.provider = provider;
    formattedError.originalError = error;
    
    // Extract specific error codes/types
    if (error.status) formattedError.status = error.status;
    if (error.code) formattedError.code = error.code;
    if (error.type) formattedError.type = error.type;
    
    return formattedError;
  }

  /**
   * Get service health status
   * @returns {Object} Health status for all providers
   */
  getHealthStatus() {
    const status = {
      service: 'AI Service',
      initialized: this.isInitialized,
      providers: {},
      total_providers: Object.keys(this.providers).length,
      timestamp: new Date().toISOString()
    };

    // Check each provider's status
    Object.keys(this.providers).forEach(provider => {
      status.providers[provider] = {
        available: true,
        initialized: !!this.providers[provider]
      };
    });

    return status;
  }
}

// Export singleton instance
module.exports = new AIService();