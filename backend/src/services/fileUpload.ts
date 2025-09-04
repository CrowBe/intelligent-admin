// Removed unused ts-node import
import { promises as fs, constants, type Stats } from 'fs';
import path from 'path';
import { logInfo, logError, logWarn } from '../utils/logger.js';

export interface UploadStats {
  totalFiles: number;
  totalSizeBytes: number;
  oldestFileAge: number;
  tempFiles: number;
}

export interface FileUploadService {
  // Cleanup operations
  cleanupOldFiles(maxAgeHours?: number): Promise<number>;
  cleanupAllTemporaryFiles(): Promise<number>;
  
  // File management
  getUploadStats(): Promise<UploadStats>;
  validateFileType(filename: string): boolean;
  ensureUploadDirectories(): Promise<void>;
}

export class FileUploadServiceImpl implements FileUploadService {
  private readonly uploadBasePath: string;
  private readonly tempPath: string;
  private readonly processedPath: string;
  
  // Security configuration
  private readonly allowedExtensions = new Set([
    '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp',
    '.xls', '.xlsx', '.csv', '.ods',
    '.ppt', '.pptx', '.odp',
    '.zip', '.rar', '.7z'
  ]);
  
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly defaultMaxAgeHours = 24;

  constructor(uploadBasePath?: string) {
    this.uploadBasePath = uploadBasePath ?? path.join(process.cwd(), 'backend', 'uploads');
    this.tempPath = path.join(this.uploadBasePath, 'temp');
    this.processedPath = path.join(this.uploadBasePath, 'processed');
  }

  /**
   * Ensure upload directories exist with proper permissions
   */
  async ensureUploadDirectories(): Promise<void> {
    try {
      const directories = [this.uploadBasePath, this.tempPath, this.processedPath];
      
      for (const dir of directories) {
        try {
          await fs.access(dir, constants.F_OK);
        } catch {
          // Directory doesn't exist, create it
          await fs.mkdir(dir, { recursive: true, mode: 0o700 });
          logInfo(`Created upload directory: ${dir}`);
        }
        
        // Ensure proper permissions (700 = owner read/write/execute only)
        await fs.chmod(dir, 0o700);
      }
      
      logInfo('Upload directories initialized successfully');
    } catch (error) {
      logError('Failed to ensure upload directories:', error);
      throw new Error(`Failed to initialize upload directories: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validate file type against allowed extensions
   */
  validateFileType(filename: string): boolean {
    if (filename === '' || typeof filename !== 'string') {
      return false;
    }
    
    const ext = path.extname(filename.toLowerCase());
    return this.allowedExtensions.has(ext);
  }

  /**
   * Clean up files older than specified hours
   */
  async cleanupOldFiles(maxAgeHours: number = this.defaultMaxAgeHours): Promise<number> {
    logInfo(`Starting cleanup of files older than ${maxAgeHours} hours`);
    
    let totalCleaned = 0;
    const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    const directories = [this.tempPath, this.processedPath];

    for (const directory of directories) {
      try {
        const cleaned = await this.cleanupDirectoryByAge(directory, cutoffTime);
        totalCleaned += cleaned;
      } catch (error) {
        logError(`Failed to cleanup directory ${directory}:`, error);
        // Continue with other directories even if one fails
      }
    }

    logInfo(`Cleanup completed. Removed ${totalCleaned} old files`);
    return totalCleaned;
  }

  /**
   * Clean up all files in temporary directory
   */
  async cleanupAllTemporaryFiles(): Promise<number> {
    logInfo('Starting cleanup of all temporary files');
    
    try {
      const tempFiles = await this.getDirectoryFiles(this.tempPath);
      let cleanedCount = 0;

      for (const file of tempFiles) {
        try {
          await fs.unlink(file.path);
          cleanedCount++;
          logInfo(`Removed temporary file: ${file.name}`);
        } catch (error) {
          logError(`Failed to remove temporary file ${file.path}:`, error);
          // Continue with other files
        }
      }

      logInfo(`Temporary cleanup completed. Removed ${cleanedCount} files`);
      return cleanedCount;
    } catch (error) {
      logError('Failed to cleanup temporary files:', error);
      throw new Error(`Temporary cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get comprehensive upload statistics
   */
  async getUploadStats(): Promise<UploadStats> {
    try {
      const [tempFiles, processedFiles] = await Promise.all([
        this.getDirectoryFiles(this.tempPath),
        this.getDirectoryFiles(this.processedPath)
      ]);

      const allFiles = [...tempFiles, ...processedFiles];
      
      const totalSizeBytes = allFiles.reduce((sum, file) => sum + file.size, 0);
      const oldestFileAge = allFiles.length > 0 
        ? Math.max(...allFiles.map(file => Date.now() - file.mtime.getTime()))
        : 0;

      const stats: UploadStats = {
        totalFiles: allFiles.length,
        totalSizeBytes,
        oldestFileAge,
        tempFiles: tempFiles.length
      };

      logInfo('Upload stats generated successfully', { stats });
      return stats;
    } catch (error) {
      logError('Failed to generate upload stats:', error);
      throw new Error(`Failed to get upload stats: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Clean up files in a directory older than cutoff time
   */
  private async cleanupDirectoryByAge(directory: string, cutoffTime: number): Promise<number> {
    try {
      const files = await this.getDirectoryFiles(directory);
      let cleanedCount = 0;

      for (const file of files) {
        if (file.mtime.getTime() < cutoffTime) {
          try {
            await fs.unlink(file.path);
            cleanedCount++;
            logInfo(`Removed old file: ${file.name} (age: ${Math.round((Date.now() - file.mtime.getTime()) / (1000 * 60 * 60))}h)`);
          } catch (error) {
            logError(`Failed to remove old file ${file.path}:`, error);
            // Continue with other files
          }
        }
      }

      return cleanedCount;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // Directory doesn't exist, nothing to clean
        logWarn(`Directory ${directory} doesn't exist, skipping cleanup`);
        return 0;
      }
      throw error;
    }
  }

  /**
   * Get file information from directory
   */
  private async getDirectoryFiles(directory: string): Promise<Array<{ name: string; path: string; size: number; mtime: Date; stats: Stats }>> {
    try {
      const files = await fs.readdir(directory);
      const fileStats = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(directory, file);
          const stats = await fs.stat(filePath);
          
          // Only include regular files, not directories
          if (stats.isFile()) {
            return {
              name: file,
              path: filePath,
              size: stats.size,
              mtime: stats.mtime,
              stats
            };
          }
          return null;
        })
      );

      return fileStats.filter((file): file is NonNullable<typeof file> => file !== null);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // Directory doesn't exist
        return [];
      }
      throw error;
    }
  }

  /**
   * Get file size in a human-readable format
   */
  static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) {return '0 Bytes';}
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    
    return `${Math.round(size * 100) / 100} ${sizes[i]}`;
  }

  /**
   * Get human-readable age format
   */
  static formatAge(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {return `${days}d ${hours % 24}h`;}
    if (hours > 0) {return `${hours}h ${minutes % 60}m`;}
    if (minutes > 0) {return `${minutes}m ${seconds % 60}s`;}
    return `${seconds}s`;
  }

  /**
   * Validate file size
   */
  validateFileSize(sizeBytes: number): boolean {
    return sizeBytes > 0 && sizeBytes <= this.maxFileSize;
  }

  /**
   * Get maximum allowed file size
   */
  getMaxFileSize(): number {
    return this.maxFileSize;
  }

  /**
   * Get allowed file extensions
   */
  getAllowedExtensions(): string[] {
    return Array.from(this.allowedExtensions);
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadServiceImpl();