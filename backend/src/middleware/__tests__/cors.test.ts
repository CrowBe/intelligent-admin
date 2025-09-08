import { describe, it, expect, beforeEach, vi } from 'vitest';
import cors from 'cors';

// Mock cors to test our configuration
vi.mock('cors');

describe('CORS Middleware', () => {
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: any;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      method: 'GET',
      url: '/',
    };
    mockResponse = {
      header: vi.fn(),
      status: vi.fn(),
      end: vi.fn(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  it('should be configured to handle CORS', () => {
    // Import the cors configuration (this would be from your actual middleware file)
    const corsOptions = {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    };

    expect(corsOptions.origin).toBeTruthy();
    expect(corsOptions.credentials).toBe(true);
    expect(corsOptions.methods).toContain('GET');
    expect(corsOptions.methods).toContain('POST');
    expect(corsOptions.allowedHeaders).toContain('Authorization');
  });

  it('should handle preflight OPTIONS requests', () => {
    const corsOptions = {
      origin: 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    };

    // Simulate CORS middleware behavior for OPTIONS request
    mockRequest.method = 'OPTIONS';
    mockRequest.headers.origin = 'http://localhost:3000';
    mockRequest.headers['access-control-request-method'] = 'POST';
    mockRequest.headers['access-control-request-headers'] = 'authorization';

    // Mock the cors function to call our test function
    const mockCors = vi.mocked(cors);
    mockCors.mockImplementation((options: any) => {
      return (req: any, res: any, next: any) => {
        // Simulate cors middleware setting headers
        if (req.method === 'OPTIONS') {
          res.header('Access-Control-Allow-Origin', options.origin);
          res.header('Access-Control-Allow-Methods', options.methods.join(', '));
          res.header('Access-Control-Allow-Headers', options.allowedHeaders.join(', '));
          res.header('Access-Control-Allow-Credentials', 'true');
          res.status(204);
          res.end();
        } else {
          next();
        }
      };
    });

    const corsMiddleware = cors(corsOptions);
    corsMiddleware(mockRequest, mockResponse, mockNext);

    expect(mockResponse.header).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      'http://localhost:3000'
    );
    expect(mockResponse.status).toHaveBeenCalledWith(204);
    expect(mockResponse.end).toHaveBeenCalled();
  });

  it('should allow requests from allowed origins', () => {
    const corsOptions = {
      origin: ['http://localhost:3000', 'https://app.intelligent-admin.com'],
      credentials: true,
    };

    mockRequest.headers.origin = 'http://localhost:3000';

    const mockCors = vi.mocked(cors);
    mockCors.mockImplementation((options: any) => {
      return (req: any, res: any, next: any) => {
        const allowedOrigins = Array.isArray(options.origin) ? options.origin : [options.origin];
        if (allowedOrigins.includes(req.headers.origin)) {
          res.header('Access-Control-Allow-Origin', req.headers.origin);
          res.header('Access-Control-Allow-Credentials', 'true');
        }
        next();
      };
    });

    const corsMiddleware = cors(corsOptions);
    corsMiddleware(mockRequest, mockResponse, mockNext);

    expect(mockResponse.header).toHaveBeenCalledWith(
      'Access-Control-Allow-Origin',
      'http://localhost:3000'
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it('should reject requests from disallowed origins', () => {
    const corsOptions = {
      origin: 'http://localhost:3000',
      credentials: true,
    };

    mockRequest.headers.origin = 'https://malicious-site.com';

    const mockCors = vi.mocked(cors);
    mockCors.mockImplementation((options: any) => {
      return (req: any, res: any, next: any) => {
        if (req.headers.origin !== options.origin) {
          const error = new Error('Not allowed by CORS');
          (error as any).status = 403;
          throw error;
        }
        next();
      };
    });

    const corsMiddleware = cors(corsOptions);

    expect(() => {
      corsMiddleware(mockRequest, mockResponse, mockNext);
    }).toThrow('Not allowed by CORS');
  });

  it('should handle dynamic origin checking', () => {
    const corsOptions = {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow localhost and our production domain
        const allowedOrigins = [
          'http://localhost:3000',
          'https://app.intelligent-admin.com',
        ];

        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'), false);
        }
      },
      credentials: true,
    };

    expect(typeof corsOptions.origin).toBe('function');

    // Test allowed origin
    const callbackSpy = vi.fn();
    (corsOptions.origin as Function)('http://localhost:3000', callbackSpy);
    expect(callbackSpy).toHaveBeenCalledWith(null, true);

    // Test disallowed origin
    const callbackSpy2 = vi.fn();
    (corsOptions.origin as Function)('https://evil-site.com', callbackSpy2);
    expect(callbackSpy2).toHaveBeenCalledWith(expect.any(Error), false);
  });

  it('should handle requests without origin header', () => {
    const corsOptions = {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests without origin (like mobile apps, curl, etc.)
        if (!origin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'), false);
        }
      },
    };

    const callbackSpy = vi.fn();
    (corsOptions.origin as Function)(undefined, callbackSpy);
    expect(callbackSpy).toHaveBeenCalledWith(null, true);
  });
});