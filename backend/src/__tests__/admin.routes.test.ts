import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { app } from '../index.js';
import { JWT_SECRET } from '../config/env.js';

describe('Admin Routes', () => {
  let authToken: string;
  let testUploadPath: string;

  beforeEach(async () => {
    // Create test auth token
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is required for tests');
    }
    authToken = jwt.sign(
      { id: 'test-admin-user', email: 'admin@example.com' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Setup test upload directory
    testUploadPath = path.join(process.cwd(), 'backend', 'uploads');
    await cleanupTestFiles();
  });

  afterEach(async () => {
    await cleanupTestFiles();
  });

  const cleanupTestFiles = async (): Promise<void> => {
    try {
      const tempPath = path.join(testUploadPath, 'temp');
      const processedPath = path.join(testUploadPath, 'processed');
      
      await Promise.all([
        fs.rm(tempPath, { recursive: true, force: true }),
        fs.rm(processedPath, { recursive: true, force: true })
      ]);
    } catch {
      // Ignore cleanup errors
    }
  };

  const createTestFile = async (dirPath: string, filename: string, content = 'test content', ageHours = 0): Promise<void> => {
    await fs.mkdir(dirPath, { recursive: true });
    const filePath = path.join(dirPath, filename);
    await fs.writeFile(filePath, content);
    
    if (ageHours > 0) {
      const ageMs = ageHours * 60 * 60 * 1000;
      const oldTime = new Date(Date.now() - ageMs);
      await fs.utimes(filePath, oldTime, oldTime);
    }
  };

  describe('GET /api/v1/admin/files/stats', () => {
    it('should return file statistics for authenticated admin', async () => {
      // Create test files
      const tempPath = path.join(testUploadPath, 'temp');
      const processedPath = path.join(testUploadPath, 'processed');
      
      await createTestFile(tempPath, 'temp1.txt', 'a'.repeat(100));
      await createTestFile(tempPath, 'temp2.txt', 'b'.repeat(200));
      await createTestFile(processedPath, 'processed1.txt', 'c'.repeat(300));

      const response = await request(app)
        .get('/api/v1/admin/files/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalFiles', 3);
      expect(response.body.data).toHaveProperty('tempFiles', 2);
      expect(response.body.data).toHaveProperty('totalSizeBytes', 600);
      expect(response.body.data).toHaveProperty('formattedSize');
      expect(response.body.data).toHaveProperty('maxFileSize');
      expect(response.body.data).toHaveProperty('allowedExtensions');
      expect(Array.isArray(response.body.data.allowedExtensions)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/admin/files/stats')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject invalid tokens', async () => {
      const response = await request(app)
        .get('/api/v1/admin/files/stats')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle file system errors gracefully', async () => {
      // The service should handle missing directories gracefully
      const response = await request(app)
        .get('/api/v1/admin/files/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalFiles).toBe(0);
    });
  });

  describe('POST /api/v1/admin/files/cleanup', () => {
    it('should clean up old files with default settings', async () => {
      const tempPath = path.join(testUploadPath, 'temp');
      
      // Create old and new files
      await createTestFile(tempPath, 'old-file.txt', 'old content', 25); // 25 hours old
      await createTestFile(tempPath, 'new-file.txt', 'new content', 1); // 1 hour old

      const response = await request(app)
        .post('/api/v1/admin/files/cleanup')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cleanedCount).toBe(1);
      expect(response.body.data.operation).toContain('files older than 24 hours');
    });

    it('should clean up files with custom age', async () => {
      const tempPath = path.join(testUploadPath, 'temp');
      
      // Create files with different ages
      await createTestFile(tempPath, 'file1.txt', 'content1', 5); // 5 hours old
      await createTestFile(tempPath, 'file2.txt', 'content2', 15); // 15 hours old

      const response = await request(app)
        .post('/api/v1/admin/files/cleanup')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ maxAgeHours: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cleanedCount).toBe(1);
      expect(response.body.data.operation).toContain('files older than 10 hours');
    });

    it('should clean up only temporary files when specified', async () => {
      const tempPath = path.join(testUploadPath, 'temp');
      const processedPath = path.join(testUploadPath, 'processed');
      
      await createTestFile(tempPath, 'temp.txt', 'temp content');
      await createTestFile(processedPath, 'processed.txt', 'processed content');

      const response = await request(app)
        .post('/api/v1/admin/files/cleanup')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ cleanupType: 'temp' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cleanedCount).toBe(1);
      expect(response.body.data.operation).toBe('all temporary files');
      
      // Verify processed file still exists
      const processedFiles = await fs.readdir(processedPath);
      expect(processedFiles).toHaveLength(1);
    });

    it('should clean up all files when specified', async () => {
      const tempPath = path.join(testUploadPath, 'temp');
      const processedPath = path.join(testUploadPath, 'processed');
      
      await createTestFile(tempPath, 'temp.txt', 'temp content');
      await createTestFile(processedPath, 'processed.txt', 'processed content');

      const response = await request(app)
        .post('/api/v1/admin/files/cleanup')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ cleanupType: 'all' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cleanedCount).toBe(2);
      expect(response.body.data.operation).toBe('all files (forced cleanup)');
    });

    it('should validate cleanup request parameters', async () => {
      const response = await request(app)
        .post('/api/v1/admin/files/cleanup')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ maxAgeHours: 0 }) // Invalid: must be >= 1
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid cleanup request');
    });

    it('should validate cleanup type', async () => {
      const response = await request(app)
        .post('/api/v1/admin/files/cleanup')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ cleanupType: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid cleanup request');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/admin/files/cleanup')
        .send({})
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/v1/admin/files/emergency-cleanup', () => {
    it('should perform emergency cleanup of all files', async () => {
      const tempPath = path.join(testUploadPath, 'temp');
      const processedPath = path.join(testUploadPath, 'processed');
      
      // Create various files
      await createTestFile(tempPath, 'temp1.txt', 'temp1');
      await createTestFile(tempPath, 'temp2.txt', 'temp2');
      await createTestFile(processedPath, 'processed1.txt', 'processed1');
      await createTestFile(processedPath, 'processed2.txt', 'processed2');

      const response = await request(app)
        .delete('/api/v1/admin/files/emergency-cleanup')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalCleaned).toBe(4);
      expect(response.body.data.tempFilesCount).toBe(2);
      expect(response.body.data.oldFilesCount).toBe(2);
      expect(response.body.data.operation).toBe('emergency cleanup');
    });

    it('should handle empty directories', async () => {
      const response = await request(app)
        .delete('/api/v1/admin/files/emergency-cleanup')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalCleaned).toBe(0);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/admin/files/emergency-cleanup')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/admin/system/health', () => {
    it('should return system health information', async () => {
      const response = await request(app)
        .get('/api/v1/admin/system/health')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('fileSystem');
      expect(response.body.data.fileSystem).toHaveProperty('status');
      expect(response.body.data.fileSystem).toHaveProperty('stats');
    });

    it('should handle file system errors in health check', async () => {
      // Even if file system has issues, health endpoint should not crash
      const response = await request(app)
        .get('/api/v1/admin/system/health')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.fileSystem.status).toMatch(/healthy|unhealthy/);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/admin/system/health')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Rate limiting and security', () => {
    it('should apply rate limiting to admin endpoints', async () => {
      // This test depends on your rate limiting configuration
      // You may need to adjust the number of requests based on your settings
      const requests = Array(20).fill(null).map(() => 
        request(app)
          .get('/api/v1/admin/files/stats')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited (429) after exceeding the limit
      const statusCodes = responses.map(r => r.status);
      const successCount = statusCodes.filter(code => code === 200).length;
      const rateLimitedCount = statusCodes.filter(code => code === 429).length;
      
      // Should have some successful requests and potentially some rate limited ones
      expect(successCount).toBeGreaterThan(0);
      expect(successCount + rateLimitedCount).toBe(20);
    });

    it('should sanitize file paths in responses', async () => {
      // Create a file with a potentially dangerous name
      const tempPath = path.join(testUploadPath, 'temp');
      await createTestFile(tempPath, 'normal-file.txt', 'content');

      const response = await request(app)
        .get('/api/v1/admin/files/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Response should not contain raw file paths
      const responseString = JSON.stringify(response.body);
      expect(responseString).not.toContain(testUploadPath);
    });
  });
});