import { HTTP_REQUEST_TIMEOUT, OPENAI_TIMEOUT } from '../config/env.js';

/**
 * HTTP client configuration interface
 */
interface HttpClientOptions {
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
  retryDelay?: number;
}

/**
 * HTTP response interface
 */
interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

/**
 * HTTP error class
 */
export class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public response?: unknown
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/**
 * HTTP timeout error class
 */
export class HttpTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`HTTP request timeout after ${timeoutMs}ms`);
    this.name = 'HttpTimeoutError';
  }
}

/**
 * Base HTTP client with configurable timeouts
 */
export class HttpClient {
  private readonly defaultTimeout: number;
  private readonly defaultHeaders: Record<string, string>;

  constructor(defaultTimeout = HTTP_REQUEST_TIMEOUT, defaultHeaders: Record<string, string> = {}) {
    this.defaultTimeout = defaultTimeout;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
  }

  /**
   * Convert response headers to plain object
   */
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  private convertHeaders(headers: Headers): Record<string, string> {
    const responseHeaders: Record<string, string> = {};
    headers.forEach((value, key) => {
      // eslint-disable-next-line security/detect-object-injection
      responseHeaders[key] = value;
    });
    return responseHeaders;
  }

  /**
   * Parse response data based on content type
   */
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  private async parseResponseData<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type') ?? '';
    
    if (contentType.includes('application/json')) {
      return response.json() as Promise<T>;
    }
    return response.text() as Promise<T>;
  }

  /**
   * Execute single HTTP request attempt
   */
  private async executeSingleRequest<T>(
    url: string,
    options: RequestInit,
    clientOptions: HttpClientOptions,
    timeout: number
  ): Promise<HttpResponse<T>> {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => { 
      controller.abort(); 
    }, timeout);

    try {
      // eslint-disable-next-line n/no-unsupported-features/node-builtins
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.defaultHeaders,
          ...clientOptions.headers,
          ...options.headers
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new HttpError(
          response.status,
          response.statusText,
          `HTTP ${response.status}: ${response.statusText}`,
          errorText
        );
      }

      const data = await this.parseResponseData<T>(response);
      const headers = this.convertHeaders(response.headers);

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Check if error should trigger a retry
   */
  private shouldRetry(error: unknown): boolean {
    // Don't retry HTTP client errors (4xx)
    if (error instanceof HttpError && error.status >= 400 && error.status < 500) {
      return false;
    }
    return true;
  }

  /**
   * Handle error and determine if should retry
   */
  private handleRequestError(error: unknown, timeout: number, attempt: number, maxRetries: number): void {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new HttpTimeoutError(timeout);
    }
    
    if (!this.shouldRetry(error) || attempt === maxRetries) {
      throw error;
    }
  }

  /**
   * Execute HTTP request with timeout and retry logic
   */
  private async executeRequest<T>(
    url: string,
    options: RequestInit,
    clientOptions: HttpClientOptions
  ): Promise<HttpResponse<T>> {
    const timeout = clientOptions.timeout ?? this.defaultTimeout;
    const maxRetries = clientOptions.retries ?? 0;
    const retryDelay = clientOptions.retryDelay ?? 1000;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeSingleRequest<T>(url, options, clientOptions, timeout);
      } catch (error) {
        this.handleRequestError(error, timeout, attempt, maxRetries);

        // Wait before retry
        if (attempt < maxRetries) {
          await new Promise(resolve => { 
            setTimeout(resolve, retryDelay); 
          });
        }
      }
    }

    throw new Error('Unexpected error in HTTP request execution');
  }

  /**
   * GET request
   */
  async get<T = unknown>(url: string, options: HttpClientOptions = {}): Promise<HttpResponse<T>> {
    return this.executeRequest<T>(url, { method: 'GET' }, options);
  }

  /**
   * POST request
   */
  async post<T = unknown>(url: string, data?: unknown, options: HttpClientOptions = {}): Promise<HttpResponse<T>> {
    return this.executeRequest<T>(
      url,
      {
        method: 'POST',
        body: data !== null && data !== undefined ? JSON.stringify(data) : null
      },
      options
    );
  }

  /**
   * PUT request
   */
  async put<T = unknown>(url: string, data?: unknown, options: HttpClientOptions = {}): Promise<HttpResponse<T>> {
    return this.executeRequest<T>(
      url,
      {
        method: 'PUT',
        body: data !== null && data !== undefined ? JSON.stringify(data) : null
      },
      options
    );
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(url: string, data?: unknown, options: HttpClientOptions = {}): Promise<HttpResponse<T>> {
    return this.executeRequest<T>(
      url,
      {
        method: 'PATCH',
        body: data !== null && data !== undefined ? JSON.stringify(data) : null
      },
      options
    );
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(url: string, options: HttpClientOptions = {}): Promise<HttpResponse<T>> {
    return this.executeRequest<T>(url, { method: 'DELETE' }, options);
  }
}

/**
 * Default HTTP client instance
 */
export const httpClient = new HttpClient();

/**
 * OpenAI-specific HTTP client with longer timeout
 */
export const openaiClient = new HttpClient(OPENAI_TIMEOUT, {
  'User-Agent': 'Intelligent-Admin/1.0'
});

/**
 * Gmail API HTTP client
 */
export const gmailClient = new HttpClient(HTTP_REQUEST_TIMEOUT, {
  'User-Agent': 'Intelligent-Admin/1.0'
});

/**
 * Utility function to create HTTP client with custom configuration
 */
export const createHttpClient = (
  timeout: number,
  defaultHeaders: Record<string, string> = {}
): HttpClient => {
  return new HttpClient(timeout, defaultHeaders);
};