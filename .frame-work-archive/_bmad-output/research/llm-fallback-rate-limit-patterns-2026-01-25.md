# LLM Provider Fallback Chains & Rate Limiting Best Practices

**Research Date:** 2026-01-25
**Focus:** Production-grade resilience patterns for multi-LLM provider architectures

---

## Executive Summary

Based on comprehensive research of 2025-2026 industry patterns, this document outlines specific implementation patterns for:

1. **Primary → Secondary → Tertiary fallback chains** with automatic failover
2. **Rate limit detection and handling** with intelligent retry strategies
3. **Quota exceeded recovery** with cost-aware fallback routing
4. **Circuit breaker patterns** for LLM API resilience

Key findings indicate that production LLM systems require **multi-layer defense** combining:
- Provider-level fallbacks (primary → secondary → tertiary)
- Model-level fallbacks within each provider
- Circuit breakers for degraded provider detection
- Exponential backoff with jitter for rate limit handling

---

## 1. Provider Fallback Chain Architecture

### 1.1 Multi-Tier Fallback Pattern

```
Request → Primary Provider (OpenAI GPT-4)
            ↓ (rate limit / outage / error)
          Fallback Provider 1 (Anthropic Claude)
            ↓ (rate limit / outage / error)
          Fallback Provider 2 (Google Gemini)
            ↓ (rate limit / outage / error)
          Fallback Provider 3 (Amazon Bedrock)
            ↓ (success)
          Response ✓
```

### 1.2 Configuration Schema

```typescript
interface ProviderConfig {
  providerId: string;
  providerName: 'openai' | 'anthropic' | 'google' | 'bedrock';
  priority: number; // 1 = primary, 2 = first fallback, etc.
  isEnabled: boolean;
  
  // Provider-specific configuration
  configuration: {
    baseUrl?: string;
    apiVersion?: string;
    deploymentName?: string;
    organization?: string;
  };
  
  // Rate limiting configuration
  rateLimits: {
    requestsPerMinute?: number;
    tokensPerMinute?: number;
    tokensPerDay?: number;
    maxConcurrentRequests?: number;
  };
  
  // Health monitoring
  healthCheckIntervalMs: number;
  circuitBreakerConfig: {
    failureThreshold: number;      // Open after N failures
    successThreshold: number;      // Close after N successes in half-open
    timeoutMs: number;             // How long to keep circuit open
  };
}

const providerChain: ProviderConfig[] = [
  {
    providerId: 'openai-primary',
    providerName: 'openai',
    priority: 1,
    isEnabled: true,
    configuration: {
      baseUrl: 'https://api.openai.com/v1',
      organization: 'org-123456'
    },
    rateLimits: {
      requestsPerMinute: 3500,
      tokensPerMinute: 90000
    },
    healthCheckIntervalMs: 30000,
    circuitBreakerConfig: {
      failureThreshold: 5,
      successThreshold: 3,
      timeoutMs: 60000
    }
  },
  {
    providerId: 'anthropic-fallback',
    providerName: 'anthropic',
    priority: 2,
    isEnabled: true,
    configuration: {
      baseUrl: 'https://api.anthropic.com',
      apiVersion: '2023-06-01'
    },
    rateLimits: {
      requestsPerMinute: 2000,
      tokensPerMinute: 100000
    },
    healthCheckIntervalMs: 30000,
    circuitBreakerConfig: {
      failureThreshold: 5,
      successThreshold: 3,
      timeoutMs: 120000
    }
  },
  {
    providerId: 'bedrock-tertiary',
    providerName: 'bedrock',
    priority: 3,
    isEnabled: true,
    configuration: {
      baseUrl: 'https://bedrock.us-east-1.amazonaws.com',
      region: 'us-east-1'
    },
    rateLimits: {
      requestsPerMinute: 5000
    },
    healthCheckIntervalMs: 60000,
    circuitBreakerConfig: {
      failureThreshold: 3,
      successThreshold: 5,
      timeoutMs: 180000
    }
  }
];
```

### 1.3 Fallback Execution Engine

```typescript
class ProviderFallbackEngine {
  constructor(
    private providers: ProviderConfig[],
    private circuitBreakerManager: CircuitBreakerManager,
    private metrics: MetricsCollector
  ) {}

  async executeWithFallback(request: LLMRequest): Promise<LLMResponse> {
    const attemptedProviders: string[] = [];
    let lastError: Error | null = null;

    for (const provider of this.providers) {
      // Check circuit breaker before attempting
      const circuitState = await this.circuitBreakerManager.getState(
        provider.providerId
      );

      if (circuitState === CircuitBreakerState.OPEN) {
        this.metrics.recordCircuitBreakerSkip(provider.providerId);
        continue;
      }

      try {
        // Execute request with timeout
        const response = await this.executeWithTimeout(
          provider,
          request,
          provider.providerName === 'openai' ? 30000 : 60000
        );

        // Record success
        await this.circuitBreakerManager.recordSuccess(provider.providerId);
        this.metrics.recordSuccess(provider.providerId, response);

        // Add metadata
        response.metadata = {
          provider: provider.providerName,
          providerId: provider.providerId,
          usedFallback: attemptedProviders.length > 0,
          attemptedProviders,
          latencyMs: response.metadata?.latencyMs
        };

        return response;

      } catch (error) {
        lastError = error as Error;
        attemptedProviders.push(provider.providerName);

        // Record failure
        await this.circuitBreakerManager.recordFailure(
          provider.providerId,
          lastError.message
        );

        this.metrics.recordFailure(
          provider.providerId,
          lastError,
          request
        );

        // Continue to next provider
        continue;
      }
    }

    // All providers failed
    throw new AllProvidersFailedError(
      `All ${this.providers.length} providers failed. ` +
      `Attempted: ${attemptedProviders.join(', ')}. ` +
      `Last error: ${lastError?.message}`
    );
  }

  private async executeWithTimeout(
    provider: ProviderConfig,
    request: LLMRequest,
    timeoutMs: number
  ): Promise<LLMResponse> {
    const startTime = Date.now();

    const result = await Promise.race([
      this.callProvider(provider, request),
      this.createTimeoutPromise(timeoutMs)
    ]);

    const latency = Date.now() - startTime;

    return {
      ...result,
      metadata: {
        ...result.metadata,
        latencyMs: latency
      }
    };
  }

  private createTimeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error(`Request timeout after ${ms}ms`)),
        ms
      );
    });
  }

  private async callProvider(
    provider: ProviderConfig,
    request: LLMRequest
  ): Promise<LLMResponse> {
    // Provider-specific implementation
    switch (provider.providerName) {
      case 'openai':
        return this.callOpenAI(provider, request);
      case 'anthropic':
        return this.callAnthropic(provider, request);
      case 'bedrock':
        return this.callBedrock(provider, request);
      default:
        throw new Error(`Unsupported provider: ${provider.providerName}`);
    }
  }
}
```

---

## 2. Rate Limit Detection & Handling

### 2.1 Rate Limit Error Detection

```typescript
interface RateLimitInfo {
  isRateLimit: boolean;
  retryAfterMs?: number;
  limitType: 'requests' | 'tokens' | 'budget' | 'unknown';
  remainingRequests?: number;
  resetAt?: Date;
}

function parseRateLimitResponse(error: Error, headers: Headers): RateLimitInfo {
  // OpenAI rate limit format
  if (headers.get('x-ratelimit-limit-requests')) {
    return {
      isRateLimit: true,
      retryAfterMs: parseRetryAfterHeader(headers.get('retry-after')),
      limitType: 'requests',
      remainingRequests: parseInt(headers.get('x-ratelimit-remaining-requests') || '0'),
      resetAt: parseResetDate(headers.get('x-ratelimit-reset-requests'))
    };
  }

  // Anthropic rate limit format
  if (headers.get('anthropic-ratelimit-limit-tokens')) {
    return {
      isRateLimit: true,
      retryAfterMs: parseRetryAfterHeader(headers.get('retry-after')),
      limitType: 'tokens',
      remainingRequests: parseInt(headers.get('anthropic-ratelimit-remaining-tokens') || '0'),
      resetAt: parseResetDate(headers.get('anthropic-ratelimit-reset-tokens'))
    };
  }

  // Generic 429 detection
  if (error.message.includes('429') || error.message.toLowerCase().includes('rate limit')) {
    return {
      isRateLimit: true,
      retryAfterMs: 1000, // Default 1 second
      limitType: 'unknown'
    };
  }

  return { isRateLimit: false, limitType: 'unknown' };
}

function parseRetryAfterHeader(value: string | null): number {
  if (!value) return 1000;

  // Try parsing as seconds
  const seconds = parseInt(value);
  if (!isNaN(seconds)) return seconds * 1000;

  // Try parsing as HTTP date
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return Math.max(0, date.getTime() - Date.now());
  }

  return 1000; // Default
}
```

### 2.2 Exponential Backoff with Jitter

```typescript
interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterFactor: number; // 0-1 for random jitter
  retryOnStatusCodes: number[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitterFactor: 0.3,
  retryOnStatusCodes: [429, 500, 502, 503, 504]
};

class ExponentialBackoff {
  constructor(private config: RetryConfig = DEFAULT_RETRY_CONFIG) {}

  calculateDelay(attempt: number, rateLimitInfo?: RateLimitInfo): number {
    // If rate limit info provides retry-after, use that
    if (rateLimitInfo?.retryAfterMs) {
      return Math.min(
        rateLimitInfo.retryAfterMs * (1 + this.randomJitter()),
        this.config.maxDelayMs
      );
    }

    // Exponential backoff with jitter
    const exponentialDelay = Math.min(
      this.config.baseDelayMs * Math.pow(2, attempt),
      this.config.maxDelayMs
    );

    const jitteredDelay = exponentialDelay * (1 + this.randomJitter());

    return Math.floor(jitteredDelay);
  }

  private randomJitter(): number {
    return (Math.random() * 2 - 1) * this.config.jitterFactor;
  }

  shouldRetry(attempt: number, error: Error): boolean {
    if (attempt >= this.config.maxRetries) {
      return false;
    }

    // Check status code
    const statusCode = this.extractStatusCode(error);
    if (statusCode && !this.config.retryOnStatusCodes.includes(statusCode)) {
      return false;
    }

    // Don't retry on auth errors (401) or bad requests (400)
    if (statusCode === 401 || statusCode === 400) {
      return false;
    }

    return true;
  }

  private extractStatusCode(error: Error): number | null {
    const match = error.message.match(/(\d{3})/);
    return match ? parseInt(match[1]) : null;
  }
}

async function withRetry<T>(
  operation: () => Promise<T>,
  backoff: ExponentialBackoff,
  rateLimitHandler?: (info: RateLimitInfo) => number
): Promise<T> {
  let lastError: Error | null = null;
  let lastRateLimitInfo: RateLimitInfo | null = null;

  for (let attempt = 0; attempt <= backoff.config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Parse rate limit info from response
      const rateLimitInfo = parseRateLimitResponse(
        lastError,
        extractHeaders(lastError)
      );

      if (rateLimitInfo.isRateLimit) {
        lastRateLimitInfo = rateLimitInfo;

        // Check if we should retry
        if (!backoff.shouldRetry(attempt, lastError)) {
          throw new RateLimitExceededError(
            'Rate limit exceeded and max retries reached',
            rateLimitInfo
          );
        }

        // Calculate and apply delay
        const delay = rateLimitHandler
          ? rateLimitHandler(rateLimitInfo)
          : backoff.calculateDelay(attempt, rateLimitInfo);

        await this.sleep(delay);
        continue;
      }

      // For other errors, check retry config
      if (!backoff.shouldRetry(attempt, lastError)) {
        throw lastError;
      }

      const delay = backoff.calculateDelay(attempt);
      await this.sleep(delay);
    }
  }

  throw lastError;
}
```

### 2.3 Token Budget Management

```typescript
interface BudgetConfig {
  monthlyBudgetUsd: number;
  dailyBudgetUsd?: number;
  warningThreshold: number; // 0-1 percentage of budget
  hardLimitThreshold: number;
}

interface UsageSnapshot {
  usedThisMonth: number;
  usedToday: number;
  estimatedMonthlyCost: number;
  dailyAverage: number;
}

class TokenBudgetManager {
  private usage: UsageSnapshot = {
    usedThisMonth: 0,
    usedToday: 0,
    estimatedMonthlyCost: 0,
    dailyAverage: 0
  };

  constructor(
    private budgetConfig: BudgetConfig,
    private usageTracker: UsageTracker,
    private clock: Clock = systemClock
  ) {}

  async checkBudgetBeforeRequest(request: LLMRequest): Promise<BudgetCheckResult> {
    await this.refreshUsage();

    const estimatedCost = this.estimateRequestCost(request);

    // Check daily budget
    if (this.budgetConfig.dailyBudgetUsd) {
      const projectedDaily = this.usage.usedToday + estimatedCost;
      if (projectedDaily > this.budgetConfig.dailyBudgetUsd) {
        return {
          allowed: false,
          reason: 'daily_budget_exceeded',
          currentUsage: this.usage.usedToday,
          projectedUsage: projectedDaily,
          budgetLimit: this.budgetConfig.dailyBudgetUsd
        };
      }
    }

    // Check monthly budget with safety margin
    const safetyMargin = this.budgetConfig.monthlyBudgetUsd *
      (1 - this.budgetConfig.hardLimitThreshold);

    const projectedMonthly = this.usage.usedThisMonth + estimatedCost;
    if (projectedMonthly > safetyMargin) {
      return {
        allowed: false,
        reason: 'monthly_budget_safety_limit',
        currentUsage: this.usage.usedThisMonth,
        projectedUsage: projectedMonthly,
        budgetLimit: this.budgetConfig.monthlyBudgetUsd
      };
    }

    // Check warning threshold
    const usagePercentage = this.usage.usedThisMonth / this.budgetConfig.monthlyBudgetUsd;
    if (usagePercentage > this.budgetConfig.warningThreshold) {
      return {
        allowed: true,
        warning: 'approaching_budget_limit',
        currentUsage: this.usage.usedThisMonth,
        budgetLimit: this.budgetConfig.monthlyBudgetUsd,
        usagePercentage
      };
    }

    return { allowed: true };
  }

  async recordUsage(cost: number): Promise<void> {
    this.usage.usedThisMonth += cost;
    this.usage.usedToday += cost;
    this.usage.estimatedMonthlyCost = this.usage.usedThisMonth;

    await this.usageTracker.recordUsage({
      amount: cost,
      timestamp: this.clock.now(),
      type: 'llm_cost'
    });
  }

  private async refreshUsage(): Promise<void> {
    const monthStart = startOfMonth(this.clock.now());
    const dayStart = startOfDay(this.clock.now());

    const [monthlyUsage, dailyUsage] = await Promise.all([
      this.usageTracker.getUsageSince(monthStart),
      this.usageTracker.getUsageSince(dayStart)
    ]);

    this.usage = {
      usedThisMonth: monthlyUsage,
      usedToday: dailyUsage,
      estimatedMonthlyCost: monthlyUsage,
      dailyAverage: dailyUsage / Math.max(1, getDaysInMonth())
    };
  }

  private estimateRequestCost(request: LLMRequest): number {
    const inputTokens = request.messages?.reduce(
      (sum, m) => sum + estimateTokens(m.content),
      0
    ) || 0;

    const outputTokens = request.maxTokens || 500;

    // Provider-specific pricing (example for OpenAI)
    const pricing = {
      inputPer1M: 2.50, // $2.50 per 1M input tokens
      outputPer1M: 10.00 // $10.00 per 1M output tokens
    };

    return (
      (inputTokens / 1000000) * pricing.inputPer1M +
      (outputTokens / 1000000) * pricing.outputPer1M
    );
  }
}
```

---

## 3. Circuit Breaker Pattern for LLM APIs

### 3.1 Circuit Breaker Implementation

```typescript
enum CircuitBreakerState {
  CLOSED = 'closed',      // Normal operation
  OPEN = 'open',          // Provider failing, skip it
  HALF_OPEN = 'half_open' // Testing if provider recovered
}

interface CircuitBreakerConfig {
  failureThreshold: number;    // Open after N failures
  successThreshold: number;    // Close after N successes in half-open
  timeoutMs: number;           // How long to keep circuit open
  volumeThreshold?: number;    // Minimum requests before evaluating
  errorRateThreshold?: number; // Error rate % to open circuit
}

interface CircuitBreakerStateInfo {
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  lastFailureAt?: Date;
  lastSuccessAt?: Date;
  nextAttemptAt?: Date;
  failureRate?: number;
}

class ProviderCircuitBreaker {
  private state: CircuitBreakerStateInfo;
  private config: CircuitBreakerConfig;
  private halfOpenAttempts: number = 0;

  constructor(
    private providerId: string,
    config: Partial<CircuitBreakerConfig> = {}
  ) {
    this.config = {
      failureThreshold: config.failureThreshold ?? 5,
      successThreshold: config.successThreshold ?? 3,
      timeoutMs: config.timeoutMs ?? 60000,
      volumeThreshold: config.volumeThreshold ?? 10,
      errorRateThreshold: config.errorRateThreshold ?? 0.5
    };

    this.state = {
      state: CircuitBreakerState.CLOSED,
      failureCount: 0,
      successCount: 0
    };
  }

  async canExecute(): Promise<{ allowed: boolean; reason?: string }> {
    // Check if circuit should transition to half-open
    if (this.state.state === CircuitBreakerState.OPEN) {
      const now = Date.now();
      if (this.state.nextAttemptAt && now >= this.state.nextAttemptAt.getTime()) {
        await this.transitionToHalfOpen();
        return {
          allowed: true,
          reason: 'Circuit breaker transitioning to half-open for testing'
        };
      }

      return {
        allowed: false,
        reason: `Circuit breaker open until ${this.state.nextAttemptAt?.toISOString()}`
      };
    }

    return { allowed: true };
  }

  async recordSuccess(): Promise<void> {
    this.state.successCount++;
    this.state.lastSuccessAt = new Date();

    if (this.state.state === CircuitBreakerState.HALF_OPEN) {
      this.halfOpenAttempts++;

      if (this.halfOpenAttempts >= this.config.successThreshold) {
        await this.transitionToClosed();
      }
    }
  }

  async recordFailure(error: Error): Promise<void> {
    this.state.failureCount++;
    this.state.lastFailureAt = new Date();
    this.state.lastError = error.message;

    if (this.state.state === CircuitBreakerState.CLOSED) {
      // Check if we should open the circuit
      if (this.shouldOpenCircuit()) {
        await this.transitionToOpen();
      }
    } else if (this.state.state === CircuitBreakerState.HALF_OPEN) {
      // Any failure in half-open reopens the circuit
      await this.transitionToOpen();
    }
  }

  getState(): CircuitBreakerStateInfo {
    // Calculate current failure rate
    const total = this.state.failureCount + this.state.successCount;
    if (total > 0) {
      this.state.failureRate = this.state.failureCount / total;
    }

    return { ...this.state };
  }

  private shouldOpenCircuit(): boolean {
    // Open if failure count exceeds threshold
    if (this.state.failureCount >= this.config.failureThreshold) {
      return true;
    }

    // Open if error rate exceeds threshold (with minimum volume)
    const total = this.state.failureCount + this.state.successCount;
    if (total >= (this.config.volumeThreshold || 10)) {
      const errorRate = this.state.failureCount / total;
      if (errorRate >= (this.config.errorRateThreshold || 0.5)) {
        return true;
      }
    }

    return false;
  }

  private async transitionToOpen(): Promise<void> {
    this.state.state = CircuitBreakerState.OPEN;
    this.state.nextAttemptAt = new Date(Date.now() + this.config.timeoutMs);
    this.state.halfOpenAttempts = 0;

    console.warn(`[CircuitBreaker] OPEN for ${this.providerId}`, {
      failureCount: this.state.failureCount,
      nextAttemptAt: this.state.nextAttemptAt
    });
  }

  private async transitionToHalfOpen(): Promise<void> {
    this.state.state = CircuitBreakerState.HALF_OPEN;
    this.state.halfOpenAttempts = 0;
    this.state.successCount = 0;
    this.state.failureCount = 0;

    console.info(`[CircuitBreaker] HALF_OPEN for ${this.providerId}`);
  }

  private async transitionToClosed(): Promise<void> {
    this.state.state = CircuitBreakerState.CLOSED;
    this.state.failureCount = 0;
    this.state.successCount = 0;
    this.state.nextAttemptAt = undefined;
    this.state.halfOpenAttempts = 0;

    console.info(`[CircuitBreaker] CLOSED for ${this.providerId}`);
  }
}
```

### 3.2 Circuit Breaker Manager

```typescript
class CircuitBreakerManager {
  private breakers: Map<string, ProviderCircuitBreaker> = new Map();
  private config: CircuitBreakerConfig;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  getBreaker(providerId: string): ProviderCircuitBreaker {
    if (!this.breakers.has(providerId)) {
      this.breakers.set(
        providerId,
        new ProviderCircuitBreaker(providerId, this.config)
      );
    }
    return this.breakers.get(providerId)!;
  }

  async getState(providerId: string): Promise<CircuitBreakerState> {
    return this.getBreaker(providerId).getState().state;
  }

  async recordSuccess(providerId: string): Promise<void> {
    await this.getBreaker(providerId).recordSuccess();
  }

  async recordFailure(providerId: string, error: Error): Promise<void> {
    await this.getBreaker(providerId).recordFailure(error);
  }

  async canExecute(providerId: string): Promise<{ allowed: boolean; reason?: string }> {
    return this.getBreaker(providerId).canExecute();
  }

  getAllStates(): Map<string, CircuitBreakerStateInfo> {
    const states = new Map<string, CircuitBreakerStateInfo>();
    for (const [providerId, breaker] of this.breakers) {
      states.set(providerId, breaker.getState());
    }
    return states;
  }

  // Health check that periodically tests open circuits
  async runHealthCheck(): Promise<void> {
    for (const [providerId, breaker] of this.breakers) {
      const state = breaker.getState();

      if (state.state === CircuitBreakerState.OPEN) {
        // Attempt to close if timeout has passed
        const canExecute = await breaker.canExecute();
        if (canExecute.allowed) {
          // Try a health check request
          try {
            await this.healthCheckProvider(providerId);
            await this.recordSuccess(providerId);
          } catch (error) {
            await this.recordFailure(providerId, error as Error);
          }
        }
      }
    }
  }

  private async healthCheckProvider(providerId: string): Promise<void> {
    // Lightweight health check (e.g., simple completion with 1 token)
    const healthRequest: LLMRequest = {
      messages: [{ role: 'user', content: 'Hi' }],
      maxTokens: 1,
      temperature: 0
    };

    const provider = this.getBreaker(providerId);
    // Implementation would call actual provider
  }
}
```

---

## 4. Complete Integration: Smart Router with Fallbacks

### 4.1 Smart LLM Router

```typescript
interface RoutingDecision {
  provider: ProviderConfig;
  model: string;
  estimatedLatency: number;
  estimatedCost: number;
  confidence: number;
  fallbackChain: ProviderConfig[];
}

class SmartLLMRouter {
  constructor(
    private providers: ProviderConfig[],
    private circuitBreakerManager: CircuitBreakerManager,
    private budgetManager: TokenBudgetManager,
    private metrics: MetricsCollector,
    private healthMonitor: HealthMonitor
  ) {}

  async selectProvider(request: LLMRequest): Promise<RoutingDecision> {
    const availableProviders = await this.filterAvailableProviders();
    
    if (availableProviders.length === 0) {
      throw new NoAvailableProvidersError();
    }

    // Score each provider
    const scoredProviders = await Promise.all(
      availableProviders.map(async (provider) => {
        const score = await this.scoreProvider(provider, request);
        return { provider, score };
      })
    );

    // Sort by score (higher is better)
    scoredProviders.sort((a, b) => b.score.total - a.score.total);

    const primary = scoredProviders[0];
    const fallbackChain = scoredProviders
      .slice(1)
      .map((sp) => sp.provider);

    return {
      provider: primary.provider,
      model: this.selectModel(primary.provider, request),
      estimatedLatency: primary.score.latency,
      estimatedCost: primary.score.cost,
      confidence: primary.score.confidence,
      fallbackChain
    };
  }

  private async filterAvailableProviders(): Promise<ProviderConfig[]> {
    const available: ProviderConfig[] = [];

    for (const provider of this.providers) {
      if (!provider.isEnabled) continue;

      // Check circuit breaker
      const circuitState = await this.circuitBreakerManager.getState(
        provider.providerId
      );
      if (circuitState === CircuitBreakerState.OPEN) continue;

      // Check budget
      const budgetCheck = await this.budgetManager.checkBudgetBeforeRequest({
        messages: [], // Would be actual request
        maxTokens: 100
      });
      if (!budgetCheck.allowed) continue;

      // Check health
      const health = await this.healthMonitor.getProviderHealth(
        provider.providerId
      );
      if (!health.isHealthy) continue;

      available.push(provider);
    }

    return available;
  }

  private async scoreProvider(
    provider: ProviderConfig,
    request: LLMRequest
  ): Promise<{
    total: number;
    latency: number;
    cost: number;
    quality: number;
    confidence: number;
  }> {
    const health = await this.healthMonitor.getProviderHealth(provider.providerId);
    const latency = await this.healthMonitor.getAverageLatency(
      provider.providerId,
      '5m'
    );
    const cost = this.estimateCost(provider, request);

    // Normalize scores (0-1)
    const latencyScore = this.normalizeLatencyScore(latency);
    const costScore = this.normalizeCostScore(cost);
    const qualityScore = this.getModelQualityScore(provider);
    const healthScore = health.successRate;

    // Weighted scoring
    const total =
      latencyScore * 0.3 +
      costScore * 0.2 +
      qualityScore * 0.3 +
      healthScore * 0.2;

    return {
      total,
      latency: latencyScore,
      cost: costScore,
      quality: qualityScore,
      confidence: health.requestVolume > 100 ? 0.9 : 0.7
    };
  }

  private selectModel(provider: ProviderConfig, request: LLMRequest): string {
    // Model selection based on request complexity
    const estimatedTokens = this.estimateTokens(request.messages);

    if (estimatedTokens < 1000 && request.maxTokens < 500) {
      // Simple request - use faster/cheaper model
      return provider.configuration.fastModel || 'claude-haiku';
    }

    if (estimatedTokens > 50000 || request.maxTokens > 4000) {
      // Long context - use model with large context window
      return provider.configuration.longContextModel || 'claude-sonnet';
    }

    // Default model
    return provider.configuration.defaultModel || 'claude-sonnet';
  }

  private estimateTokens(messages: Message[]): number {
    return messages.reduce(
      (sum, msg) => sum + Math.ceil(msg.content.length / 4),
      0
    );
  }

  private estimateCost(provider: ProviderConfig, request: LLMRequest): number {
    const tokens = this.estimateTokens(request.messages) + (request.maxTokens || 500);
    // Provider-specific pricing lookup
    return tokens * this.getProviderPricing(provider.providerName).per1M / 1000000;
  }

  private normalizeLatencyScore(latencyMs: number): number {
    // Lower latency is better
    if (latencyMs < 500) return 1.0;
    if (latencyMs < 1000) return 0.8;
    if (latencyMs < 2000) return 0.6;
    if (latencyMs < 5000) return 0.4;
    return 0.2;
  }

  private normalizeCostScore(costUsd: number): number {
    // Lower cost is better
    if (costUsd < 0.001) return 1.0;
    if (costUsd < 0.005) return 0.8;
    if (costUsd < 0.01) return 0.6;
    if (costUsd < 0.05) return 0.4;
    return 0.2;
  }

  private getModelQualityScore(provider: ProviderConfig): number {
    // Based on model tier
    const model = provider.configuration.defaultModel || '';
    if (model.includes('opus') || model.includes('gpt-4')) return 1.0;
    if (model.includes('sonnet') || model.includes('gpt-3.5')) return 0.8;
    if (model.includes('haiku') || model.includes('gemini-pro')) return 0.6;
    return 0.5;
  }

  private getProviderPricing(providerName: string): { per1M: number } {
    const pricing: Record<string, { per1M: number }> = {
      openai: { per1M: 10 },      // GPT-4 pricing example
      anthropic: { per1M: 15 },   // Claude pricing example
      google: { per1M: 5 },       // Gemini pricing example
      bedrock: { per1M: 8 }       // Bedrock pricing example
    };
    return pricing[providerName] || { per1M: 10 };
  }
}
```

### 4.2 Unified LLM Client with Full Resilience

```typescript
class ResilientLLMClient {
  constructor(
    private router: SmartLLMRouter,
    private fallbackEngine: ProviderFallbackEngine,
    private metrics: MetricsCollector
  ) {}

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();
    let decision: RoutingDecision | null = null;

    try {
      // Select optimal provider
      decision = await this.router.selectProvider(request);
      this.metrics.recordRoutingDecision(decision);

      // Execute with fallback chain
      const response = await this.fallbackEngine.executeWithFallback(request);

      // Record success metrics
      this.metrics.recordCompletion({
        provider: decision.provider.providerName,
        latency: Date.now() - startTime,
        success: true,
        fallbackUsed: response.metadata?.usedFallback || false
      });

      return response;

    } catch (error) {
      // Record failure metrics
      this.metrics.recordCompletion({
        provider: decision?.provider?.providerName,
        latency: Date.now() - startTime,
        success: false,
        error: (error as Error).message
      });

      // Transform error with context
      if (error instanceof AllProvidersFailedError) {
        throw new LLMServiceUnavailableError(
          'All LLM providers failed',
          { providersAttempted: error.providers }
        );
      }

      throw error;
    }
  }
}
```

---

## 5. Best Practices Summary

### 5.1 Fallback Chain Configuration

| Provider | Priority | When to Use | Fallback To |
|----------|----------|-------------|-------------|
| **Primary** | 1 | Normal operation | Provider with identical model |
| **Secondary** | 2 | Primary rate-limited | Provider with similar model |
| **Tertiary** | 3 | Both above degraded | Different model family |

### 5.2 Circuit Breaker Thresholds

```typescript
const CIRCUIT_BREAKER_CONFIGS = {
  // Stable providers (OpenAI, Anthropic direct API)
  stable: {
    failureThreshold: 5,
    successThreshold: 3,
    timeoutMs: 60000,
    volumeThreshold: 10,
    errorRateThreshold: 0.5
  },
  
  // Less stable / experimental providers
  experimental: {
    failureThreshold: 3,
    successThreshold: 5,
    timeoutMs: 120000,
    volumeThreshold: 5,
    errorRateThreshold: 0.3
  },
  
  // High-traffic / batch providers
  batch: {
    failureThreshold: 10,
    successThreshold: 2,
    timeoutMs: 300000,
    volumeThreshold: 50,
    errorRateThreshold: 0.7
  }
};
```

### 5.3 Retry Configuration

```typescript
const RETRY_CONFIGS = {
  // Aggressive retry for rate limits
  rateLimit: {
    maxRetries: 5,
    baseDelayMs: 500,
    maxDelayMs: 30000,
    jitterFactor: 0.3
  },
  
  // Conservative retry for server errors
  serverError: {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 60000,
    jitterFactor: 0.2
  },
  
  // Minimal retry for client errors
  clientError: {
    maxRetries: 1,
    baseDelayMs: 100,
    maxDelayMs: 1000,
    jitterFactor: 0.1
  }
};
```

### 5.4 Key Metrics to Monitor

```typescript
const MONITORING_METRICS = {
  // Request metrics
  totalRequests: 'counter',
  successfulRequests: 'counter',
  failedRequests: 'counter',
  
  // Latency metrics
  p50Latency: 'histogram',
  p95Latency: 'histogram',
  p99Latency: 'histogram',
  
  // Fallback metrics
  fallbackTriggered: 'counter',
  fallbackProvider: 'dimension',
  fallbackReason: 'dimension',
  
  // Circuit breaker metrics
  circuitBreakerState: 'gauge',
  circuitBreakerOpens: 'counter',
  circuitBreakerCloses: 'counter',
  
  // Cost metrics
  totalCost: 'counter',
  costPerRequest: 'histogram',
  
  // Rate limit metrics
  rateLimitHits: 'counter',
  rateLimitRetryAfter: 'histogram'
};
```

---

## 6. Implementation Checklist

- [ ] **Provider Configuration**: Define provider chain with priorities
- [ ] **Fallback Engine**: Implement sequential fallback execution
- [ ] **Circuit Breakers**: Add per-provider circuit breaker with configurable thresholds
- [ ] **Rate Limit Detection**: Parse rate limit headers from all providers
- [ ] **Retry Logic**: Implement exponential backoff with jitter
- [ ] **Budget Management**: Add token/monthly budget tracking
- [ ] **Health Monitoring**: Implement provider health checks
- [ ] **Smart Routing**: Add request-based provider selection
- [ ] **Observability**: Add metrics for all components
- [ ] **Testing**: Test failover scenarios including:
  - Primary provider rate limit
  - Primary provider outage
  - All providers unavailable
  - Partial degradation
  - Budget exhaustion

---

## References

1. AWS Samples: Amazon Bedrock as LLM Fallback - https://github.com/aws-samples/sample-amazon-bedrock-as-llm-fallback
2. Portkey: LLM Routing Techniques - https://portkey.ai/blog/llm-routing-techniques-for-high-volume-applications
3. Tombaş: Provider-Level Resilience - https://medium.com/@tombastaner/beyond-model-fallbacks-building-provider-level-resilience-for-ai-systems-e1d00f3b016d
4. AWS: Multi-LLM Routing Strategies - https://aws.amazon.com/blogs/machine-learning/multi-llm-routing-strategies-for-generative-ai-applications-on-aws/
5. OpenAI Rate Limit Handling - https://developers.openai.com/cookbook/examples/how_to_handle_rate_limits
