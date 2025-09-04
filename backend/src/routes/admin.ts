import { Router, type Response } from 'express';
import { z } from 'zod';
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.js';
import { fileUploadService } from '../services/fileUpload.js';
import { logInfo, logError } from '../utils/logger.js';

export const adminRouter = Router();

// Middleware to check admin privileges (basic implementation)
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: () => void): void => {
  // For now, this is a simple check - in production you'd check user roles
  const user = req.user;
  if (user?.id === undefined) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  
  // TODO: Add proper admin role checking when user roles are implemented
  // For now, allow any authenticated user to access admin functions in development
  next();
};

/**
 * Get file upload statistics
 * GET /api/v1/admin/files/stats
 */
adminRouter.get('/files/stats', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  void (async (): Promise<void> => {
  try {
    await fileUploadService.ensureUploadDirectories();
    const stats = await fileUploadService.getUploadStats();
    
    res.json({
      success: true,
      data: {
        ...stats,
        formattedSize: (await import('../services/fileUpload.js')).FileUploadServiceImpl.formatFileSize(stats.totalSizeBytes),
        formattedOldestAge: (await import('../services/fileUpload.js')).FileUploadServiceImpl.formatAge(stats.oldestFileAge),
        maxFileSize: fileUploadService.getMaxFileSize(),
        allowedExtensions: fileUploadService.getAllowedExtensions(),
        formattedMaxFileSize: (await import('../services/fileUpload.js')).FileUploadServiceImpl.formatFileSize(fileUploadService.getMaxFileSize())
      }
    });
  } catch (error) {
    logError('Failed to get file stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve file statistics',
      details: error instanceof Error ? error.message : String(error)
    });
  }
  })();
});

/**
 * Clean up old files
 * POST /api/v1/admin/files/cleanup
 */
adminRouter.post('/files/cleanup', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  void (async (): Promise<void> => {
  try {
    const schema = z.object({
      maxAgeHours: z.number().min(1).max(168).optional(), // 1 hour to 1 week
      cleanupType: z.enum(['old', 'temp', 'all']).optional().default('old')
    });

    const { maxAgeHours = 24, cleanupType } = schema.parse(req.body);
    
    logInfo(`Admin cleanup requested by user ${req.user?.id}:`, { maxAgeHours, cleanupType });
    
    let cleanedCount = 0;
    let operation = '';
    
    switch (cleanupType) {
      case 'old': {
        cleanedCount = await fileUploadService.cleanupOldFiles(maxAgeHours);
        operation = `files older than ${maxAgeHours} hours`;
        break;
      }
      case 'temp': {
        cleanedCount = await fileUploadService.cleanupAllTemporaryFiles();
        operation = 'all temporary files';
        break;
      }
      case 'all': {
        const oldCount = await fileUploadService.cleanupOldFiles(0); // Clean all files
        const tempCount = await fileUploadService.cleanupAllTemporaryFiles();
        cleanedCount = oldCount + tempCount;
        operation = 'all files (forced cleanup)';
        break;
      }
    }
    
    logInfo(`Admin cleanup completed: removed ${cleanedCount} files (${operation})`);
    
    res.json({
      success: true,
      data: {
        cleanedCount,
        operation,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Invalid cleanup request',
        details: error.errors
      });
      return;
    }
    
    logError('Admin cleanup failed:', error);
    res.status(500).json({
      success: false,
      error: 'Cleanup operation failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
  })();
});

/**
 * Force cleanup of all files (emergency endpoint)
 * DELETE /api/v1/admin/files/emergency-cleanup
 */
adminRouter.delete('/files/emergency-cleanup', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  void (async (): Promise<void> => {
  try {
    logInfo(`Emergency file cleanup initiated by user ${req.user?.id ?? 'unknown'}`);
    
    // Clean up all files regardless of age
    const [oldFilesCount, tempFilesCount] = await Promise.all([
      fileUploadService.cleanupOldFiles(0), // maxAge 0 = clean all files
      fileUploadService.cleanupAllTemporaryFiles()
    ]);
    
    const totalCleaned = oldFilesCount + tempFilesCount;
    
    logInfo(`Emergency cleanup completed: removed ${totalCleaned} files (${oldFilesCount} old, ${tempFilesCount} temp)`);
    
    res.json({
      success: true,
      data: {
        totalCleaned,
        oldFilesCount,
        tempFilesCount,
        operation: 'emergency cleanup',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logError('Emergency cleanup failed:', error);
    res.status(500).json({
      success: false,
      error: 'Emergency cleanup failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
  })();
});

/**
 * Get system health including file system status
 * GET /api/v1/admin/system/health
 */
adminRouter.get('/system/health', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  void (async (): Promise<void> => {
  try {
    const [uploadStats] = await Promise.all([
      fileUploadService.getUploadStats().catch(error => ({
        error: error instanceof Error ? error.message : String(error),
        totalFiles: 0,
        totalSizeBytes: 0,
        oldestFileAge: 0,
        tempFiles: 0
      }))
    ]);

    const fileSystemStatus = 'error' in uploadStats ? 'unhealthy' : 'healthy';
    
    res.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        fileSystem: {
          status: fileSystemStatus,
          stats: uploadStats,
          ...(fileSystemStatus === 'healthy' && {
            formattedSize: (await import('../services/fileUpload.js')).FileUploadServiceImpl.formatFileSize(uploadStats.totalSizeBytes),
            formattedOldestAge: uploadStats.oldestFileAge > 0 
              ? (await import('../services/fileUpload.js')).FileUploadServiceImpl.formatAge(uploadStats.oldestFileAge)
              : 'N/A'
          })
        }
      }
    });
  } catch (error) {
    logError('System health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : String(error)
    });
  }
  })();
});