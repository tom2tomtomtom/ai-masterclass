# AI Playground - Interactive AI Model Integration Service

## Overview

The AI Playground is a comprehensive backend service that enables interactive comparison and evaluation of multiple AI models from different providers. It provides unified API integrations for OpenAI, Anthropic, and Google AI models with advanced response comparison and quality scoring capabilities.

## Features

### 🤖 Multi-Provider AI Integration
- **OpenAI GPT Models**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic Claude Models**: Claude-3 Opus, Sonnet, and Haiku
- **Google Gemini Models**: Gemini Pro and Gemini Pro Vision

### 🔄 Response Comparison System
- Side-by-side response generation from multiple providers
- Performance metrics comparison (response time, token usage)
- Content analysis and structural comparison
- Automated insights generation

### 📊 Quality Scoring System
- Multi-criteria response evaluation:
  - **Relevance** (25% weight): How well the response addresses the prompt
  - **Accuracy** (25% weight): Factual correctness and reliability
  - **Completeness** (20% weight): Thoroughness of the response
  - **Clarity** (15% weight): Readability and organization
  - **Helpfulness** (15% weight): Practical value and actionability

### 🛡️ Enterprise-Grade Features
- Comprehensive error handling and logging
- Rate limiting to prevent API abuse
- Prometheus metrics integration
- Request validation and sanitization
- Graceful fallback handling

## API Endpoints

### Service Status
```http
GET /api/ai-playground/status
```
Returns the health status of all AI services and available providers.

### Provider Information
```http
GET /api/ai-playground/providers
```
Lists available AI providers and their supported models.

### Single Response Generation
```http
POST /api/ai-playground/generate
```
Generate a response from a single AI provider.

**Request Body:**
```json
{
  "prompt": "Explain quantum computing in simple terms",
  "provider": "openai",
  "parameters": {
    "model": "gpt-4",
    "temperature": 0.7,
    "maxTokens": 1000,
    "systemMessage": "You are a helpful AI assistant."
  }
}
```

### Multi-Provider Comparison
```http
POST /api/ai-playground/compare
```
Generate and compare responses from multiple AI providers.

**Request Body:**
```json
{
  "prompt": "What are the benefits of renewable energy?",
  "providers": ["openai", "anthropic", "google"],
  "parameters": {
    "temperature": 0.7,
    "maxTokens": 1000
  }
}
```

### Quality Scoring
```http
POST /api/ai-playground/score
```
Score the quality of AI responses using automated evaluation criteria.

### Full Analysis
```http
POST /api/ai-playground/full-analysis
```
Complete analysis pipeline: generation, comparison, and scoring in one request.

### Usage Metrics
```http
GET /api/ai-playground/metrics
```
Retrieve AI playground usage statistics and service health.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install openai @anthropic-ai/sdk @google/generative-ai
```

### 2. Environment Configuration
Add the following environment variables to your `.env` file:

```env
# AI Provider API Keys
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
```

### 3. API Key Setup

#### OpenAI
1. Visit [OpenAI API Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add billing information (required for API access)

#### Anthropic
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Generate an API key
3. Fund your account with credits

#### Google AI
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Enable the Generative AI API in Google Cloud Console

### 4. Start the Server
```bash
npm run dev
```

The AI Playground will be available at `/api/ai-playground/*` endpoints.

## Service Architecture

### Core Services

#### 1. AIService (`services/aiService.js`)
- **Purpose**: Unified interface for all AI providers
- **Features**: 
  - Provider initialization and health checking
  - Standardized response formatting
  - Error handling and retry logic
  - Metrics collection integration

#### 2. ResponseComparisonService (`services/responseComparisonService.js`)
- **Purpose**: Side-by-side response analysis and comparison
- **Features**:
  - Multi-provider response generation
  - Performance metrics calculation
  - Content analysis and insights
  - Ranking and recommendation generation

#### 3. QualityScoringService (`services/qualityScoringService.js`)
- **Purpose**: Automated response quality evaluation
- **Features**:
  - Multi-criteria scoring system
  - Weighted quality assessment
  - Comparative analysis
  - Detailed feedback generation

### Rate Limiting Strategy

The AI Playground implements tiered rate limiting to manage API costs:

- **General AI Requests**: 20 requests per 15 minutes
- **Comparison Requests**: 10 requests per 30 minutes  
- **Full Analysis**: 5 requests per hour

Development mode has increased limits for testing.

### Error Handling

Comprehensive error handling includes:
- API key validation
- Rate limit management
- Provider-specific error codes
- Graceful degradation
- Detailed error logging

## Response Formats

### Standard AI Response
```json
{
  "provider": "openai",
  "model": "gpt-4",
  "content": "Response content here...",
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 128,
    "total_tokens": 143
  },
  "response_time": 2340,
  "finish_reason": "stop"
}
```

### Comparison Results
```json
{
  "responses": [...],
  "analysis": {
    "response_analysis": [...],
    "rankings": {
      "by_speed": [...],
      "by_quality": [...],
      "overall": [...]
    },
    "insights": [...]
  },
  "comparison": {
    "fastest_response": "anthropic",
    "most_tokens": "openai",
    "average_response_time": 1850
  }
}
```

### Quality Scores
```json
{
  "scores": {
    "individual": {
      "relevance": 0.85,
      "accuracy": 0.78,
      "completeness": 0.82,
      "clarity": 0.90,
      "helpfulness": 0.87
    },
    "overall": 0.84,
    "quality_level": "good"
  },
  "feedback": {
    "strengths": [...],
    "areas_for_improvement": [...],
    "specific_suggestions": [...]
  }
}
```

## Monitoring and Metrics

### Prometheus Metrics
- `ai_request_duration_seconds`: AI API request duration
- `ai_requests_total`: Total AI requests by provider and status
- `ai_tokens_used_total`: Token consumption tracking
- `ai_response_quality_score`: Quality score distribution

### Health Monitoring
- Provider availability checking
- API key validation
- Service health endpoints
- Comprehensive logging

## Security Considerations

### API Key Management
- Environment variable storage
- No hardcoded credentials
- Key validation on startup
- Secure error messages (no key exposure)

### Request Validation
- Input sanitization
- Prompt length limits
- Parameter validation
- Rate limiting per IP

### Data Privacy
- No persistent storage of prompts
- Temporary response caching only
- Audit logging for compliance

## Best Practices

### Usage Optimization
1. **Batch Similar Requests**: Use comparison endpoints for multiple evaluations
2. **Cache Responses**: Implement client-side caching for repeated prompts
3. **Monitor Usage**: Track token consumption and costs
4. **Quality Thresholds**: Set minimum quality scores for production use

### Error Handling
1. **Retry Logic**: Implement exponential backoff for transient failures
2. **Fallback Providers**: Use multiple providers for redundancy
3. **Graceful Degradation**: Handle partial provider failures
4. **User Feedback**: Provide meaningful error messages

### Performance
1. **Concurrent Requests**: Comparison requests run in parallel
2. **Streaming**: Consider streaming for long responses
3. **Timeout Management**: Set appropriate timeouts per provider
4. **Resource Limits**: Monitor memory usage with large responses

## Development and Testing

### Running Tests
```bash
npm test
```

### Mock Responses
The service includes comprehensive mocking for testing without API calls.

### Development Mode
- Increased rate limits
- Detailed error logging
- API key validation warnings

## Cost Management

### Token Usage Tracking
- Real-time token consumption monitoring
- Per-provider cost tracking
- Usage alerts and limits

### Optimization Strategies
- Prompt engineering for efficiency
- Model selection based on use case
- Response caching where appropriate
- Rate limiting to prevent abuse

## Troubleshooting

### Common Issues

1. **Provider Not Available**
   - Check API key configuration
   - Verify account billing status
   - Test with simple requests first

2. **Rate Limiting**
   - Monitor usage patterns
   - Implement client-side queuing
   - Consider upgrading API plans

3. **Quality Scoring Issues**
   - Review scoring criteria weights
   - Validate input prompt quality
   - Check for edge cases in content

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` for detailed request/response logging.

## Contributing

When extending the AI Playground:

1. Follow existing error handling patterns
2. Add comprehensive tests for new features
3. Update metrics collection for new endpoints
4. Document API changes in this README
5. Consider rate limiting for new expensive operations

## API Versioning

Current version: `1.0.0`

The API follows semantic versioning with backward compatibility guarantees for minor version updates.