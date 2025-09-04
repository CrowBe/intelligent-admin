import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { FileUploadServiceImpl } from '../services/fileUpload.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('FileUploadService', () => {
  let service: FileUploadServiceImpl;
  let testUploadPath: string;
  let testTempPath: string;
  let testProcessedPath: string;

  beforeEach(async () => {
    // Create a temporary test directory
    testUploadPath = path.join(__dirname, 'test-uploads');
    testTempPath = path.join(testUploadPath, 'temp');
    testProcessedPath = path.join(testUploadPath, 'processed');
    
    service = new FileUploadServiceImpl(testUploadPath);
    
    // Clean up any existing test files
    await cleanupTestDirectory();
  });

  afterEach(async () => {
    // Clean up test files after each test
    await cleanupTestDirectory();
  });

  const cleanupTestDirectory = async (): Promise<void> => {
    try {
      await fs.rm(testUploadPath, { recursive: true, force: true });
    } catch {
      // Ignore errors if directory doesn't exist
    }
  };

  const createTestFile = async (dirPath: string, filename: string, content: string = 'test content', ageHours = 0): Promise<string> => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.mkdir(dirPath, { recursive: true });
    const filePath = path.join(dirPath, filename);
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(filePath, content);
    
    // Set file modification time if age is specified
    if (ageHours > 0) {
      const ageMs = ageHours * 60 * 60 * 1000;
      const oldTime = new Date(Date.now() - ageMs);
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.utimes(filePath, oldTime, oldTime);
    }
    
    return filePath;
  };

  describe('ensureUploadDirectories', () => {
    it('should create upload directories if they do not exist', async () => {
      await service.ensureUploadDirectories();
      
      const tempExists = await fs.access(testTempPath).then(() => true, () => false);
      const processedExists = await fs.access(testProcessedPath).then(() => true, () => false);
      
      expect(tempExists).toBe(true);
      expect(processedExists).toBe(true);
    });

    it('should set proper permissions on directories', async () => {
      await service.ensureUploadDirectories();
      
      const tempStats = await fs.stat(testTempPath);
      const processedStats = await fs.stat(testProcessedPath);
      
      // Check that directories have restrictive permissions
      // On Windows, file permissions work differently, so we check that they exist and are directories
      expect(tempStats.isDirectory()).toBe(true);
      expect(processedStats.isDirectory()).toBe(true);
      
      // On Unix systems, check for 700 permissions
      if (process.platform !== 'win32') {
        expect(tempStats.mode & 0o777).toBe(0o700);
        expect(processedStats.mode & 0o777).toBe(0o700);
      }
    });

    it('should not fail if directories already exist', async () => {
      await service.ensureUploadDirectories();
      
      // Should not throw when called again
      await expect(service.ensureUploadDirectories()).resolves.not.toThrow();
    });
  });

  describe('validateFileType', () => {
    it('should accept allowed file extensions', () => {
      const allowedFiles = [
        'document.pdf',
        'image.jpg',
        'spreadsheet.xlsx',
        'presentation.pptx',
        'text.txt',
        'archive.zip'
      ];
      
      allowedFiles.forEach(filename => {
        expect(service.validateFileType(filename)).toBe(true);
      });
    });

    it('should reject disallowed file extensions', () => {
      const disallowedFiles = [
        'script.exe',
        'malware.bat',
        'virus.scr',
        'dangerous.msi',
        'unknown.xyz'
      ];
      
      disallowedFiles.forEach(filename => {
        expect(service.validateFileType(filename)).toBe(false);
      });
    });

    it('should handle case-insensitive extensions', () => {
      expect(service.validateFileType('document.PDF')).toBe(true);
      expect(service.validateFileType('image.JPG')).toBe(true);
      expect(service.validateFileType('script.EXE')).toBe(false);
    });

    it('should handle invalid inputs', () => {
      expect(service.validateFileType('')).toBe(false);
      expect(service.validateFileType(null as unknown as string)).toBe(false);
      expect(service.validateFileType(undefined as unknown as string)).toBe(false);
    });
  });

  describe('cleanupOldFiles', () => {
    it('should clean up files older than specified hours', async () => {
      await service.ensureUploadDirectories();
      
      // Create old and new files
      const oldFile = await createTestFile(testTempPath, 'old-file.txt', 'old content', 25); // 25 hours old
      const newFile = await createTestFile(testTempPath, 'new-file.txt', 'new content', 1); // 1 hour old
      
      const cleanedCount = await service.cleanupOldFiles(24); // Clean files older than 24 hours
      
      expect(cleanedCount).toBe(1);
      
      // Old file should be removed
      const oldFileExists = await fs.access(oldFile).then(() => true, () => false);
      expect(oldFileExists).toBe(false);
      
      // New file should still exist
      const newFileExists = await fs.access(newFile).then(() => true, () => false);
      expect(newFileExists).toBe(true);
    });

    it('should clean up files from both temp and processed directories', async () => {
      await service.ensureUploadDirectories();
      
      // Create old files in both directories
      await createTestFile(testTempPath, 'old-temp.txt', 'old temp', 25);
      await createTestFile(testProcessedPath, 'old-processed.txt', 'old processed', 25);
      
      const cleanedCount = await service.cleanupOldFiles(24);
      
      expect(cleanedCount).toBe(2);
    });

    it('should handle missing directories gracefully', async () => {
      // Don't create directories - they don't exist yet
      const cleanedCount = await service.cleanupOldFiles(24);
      
      expect(cleanedCount).toBe(0);
    });

    it('should continue cleanup even if individual files fail', async () => {
      await service.ensureUploadDirectories();
      
      // Create test files
      await createTestFile(testTempPath, 'file1.txt', 'content1', 25);
      await createTestFile(testTempPath, 'file2.txt', 'content2', 25);
      
      // Mock fs.unlink to fail for first file but succeed for second
      const originalUnlink = fs.unlink;
      let unlinkCallCount = 0;
      
      vi.spyOn(fs, 'unlink').mockImplementation(async (filePath: Parameters<typeof fs.unlink>[0]) => {
        unlinkCallCount++;
        if (unlinkCallCount === 1) {
          throw new Error('Simulated file deletion error');
        }
        return originalUnlink(filePath);
      });
      
      const cleanedCount = await service.cleanupOldFiles(24);
      
      // Should clean up the file that didn't fail
      expect(cleanedCount).toBe(1);
      
      vi.restoreAllMocks();
    });
  });

  describe('cleanupAllTemporaryFiles', () => {
    it('should clean up all files in temp directory', async () => {
      await service.ensureUploadDirectories();
      
      // Create multiple temp files of different ages
      await createTestFile(testTempPath, 'temp1.txt', 'temp1');
      await createTestFile(testTempPath, 'temp2.txt', 'temp2', 1);
      await createTestFile(testTempPath, 'temp3.txt', 'temp3', 25);
      
      const cleanedCount = await service.cleanupAllTemporaryFiles();
      
      expect(cleanedCount).toBe(3);
      
      // Temp directory should be empty
      const tempFiles = await fs.readdir(testTempPath);
      expect(tempFiles).toHaveLength(0);
    });

    it('should not affect processed files', async () => {
      await service.ensureUploadDirectories();
      
      // Create files in both directories
      await createTestFile(testTempPath, 'temp.txt', 'temp');
      await createTestFile(testProcessedPath, 'processed.txt', 'processed');
      
      const cleanedCount = await service.cleanupAllTemporaryFiles();
      
      expect(cleanedCount).toBe(1);
      
      // Processed file should still exist
      const processedFiles = await fs.readdir(testProcessedPath);
      expect(processedFiles).toHaveLength(1);
    });

    it('should handle empty temp directory', async () => {
      await service.ensureUploadDirectories();
      
      const cleanedCount = await service.cleanupAllTemporaryFiles();
      
      expect(cleanedCount).toBe(0);
    });
  });

  describe('getUploadStats', () => {
    it('should return accurate statistics', async () => {
      await service.ensureUploadDirectories();
      
      // Create test files with known sizes
      const content1 = 'a'.repeat(100); // 100 bytes
      const content2 = 'b'.repeat(200); // 200 bytes
      const content3 = 'c'.repeat(300); // 300 bytes
      
      await createTestFile(testTempPath, 'temp1.txt', content1, 5); // 5 hours old
      await createTestFile(testTempPath, 'temp2.txt', content2, 10); // 10 hours old
      await createTestFile(testProcessedPath, 'processed1.txt', content3, 2); // 2 hours old
      
      const stats = await service.getUploadStats();
      
      expect(stats.totalFiles).toBe(3);
      expect(stats.tempFiles).toBe(2);
      expect(stats.totalSizeBytes).toBe(600);
      expect(stats.oldestFileAge).toBeGreaterThan(9 * 60 * 60 * 1000); // Should be around 10 hours in ms
    });

    it('should handle empty directories', async () => {
      await service.ensureUploadDirectories();
      
      const stats = await service.getUploadStats();
      
      expect(stats.totalFiles).toBe(0);
      expect(stats.tempFiles).toBe(0);
      expect(stats.totalSizeBytes).toBe(0);
      expect(stats.oldestFileAge).toBe(0);
    });

    it('should handle missing directories', async () => {
      const stats = await service.getUploadStats();
      
      expect(stats.totalFiles).toBe(0);
      expect(stats.tempFiles).toBe(0);
      expect(stats.totalSizeBytes).toBe(0);
      expect(stats.oldestFileAge).toBe(0);
    });
  });

  describe('File size and extension utilities', () => {
    it('should validate file sizes correctly', () => {
      expect(service.validateFileSize(1024)).toBe(true); // 1KB
      expect(service.validateFileSize(5 * 1024 * 1024)).toBe(true); // 5MB
      expect(service.validateFileSize(10 * 1024 * 1024)).toBe(true); // 10MB (max)
      expect(service.validateFileSize(11 * 1024 * 1024)).toBe(false); // 11MB (over limit)
      expect(service.validateFileSize(0)).toBe(false); // 0 bytes
      expect(service.validateFileSize(-1)).toBe(false); // Negative size
    });

    it('should return correct max file size', () => {
      expect(service.getMaxFileSize()).toBe(10 * 1024 * 1024); // 10MB
    });

    it('should return allowed extensions', () => {
      const extensions = service.getAllowedExtensions();
      expect(extensions).toContain('.pdf');
      expect(extensions).toContain('.jpg');
      expect(extensions).toContain('.docx');
      expect(extensions).not.toContain('.exe');
    });
  });

  describe('Static utility methods', () => {
    it('should format file sizes correctly', () => {
      expect(FileUploadServiceImpl.formatFileSize(0)).toBe('0 Bytes');
      expect(FileUploadServiceImpl.formatFileSize(1024)).toBe('1 KB');
      expect(FileUploadServiceImpl.formatFileSize(1048576)).toBe('1 MB');
      expect(FileUploadServiceImpl.formatFileSize(1073741824)).toBe('1 GB');
      expect(FileUploadServiceImpl.formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format age correctly', () => {
      expect(FileUploadServiceImpl.formatAge(1000)).toBe('1s'); // 1 second
      expect(FileUploadServiceImpl.formatAge(60000)).toBe('1m 0s'); // 1 minute
      expect(FileUploadServiceImpl.formatAge(3600000)).toBe('1h 0m'); // 1 hour
      expect(FileUploadServiceImpl.formatAge(86400000)).toBe('1d 0h'); // 1 day
      expect(FileUploadServiceImpl.formatAge(90061000)).toBe('1d 1h'); // 1 day 1 hour 1 minute 1 second
    });
  });

  describe('Error handling', () => {
    it('should throw meaningful errors when directory creation fails', async () => {
      // Mock fs.mkdir to fail
      vi.spyOn(fs, 'mkdir').mockRejectedValue(new Error('Permission denied'));
      
      await expect(service.ensureUploadDirectories()).rejects.toThrow('Failed to initialize upload directories');
      
      vi.restoreAllMocks();
    });

    it('should throw meaningful errors when cleanup fails', async () => {
      // Mock fs.readdir to fail
      vi.spyOn(fs, 'readdir').mockRejectedValue(new Error('Access denied'));
      
      await expect(service.cleanupAllTemporaryFiles()).rejects.toThrow('Temporary cleanup failed');
      
      vi.restoreAllMocks();
    });

    it('should throw meaningful errors when stats generation fails', async () => {
      // Mock fs.readdir to fail
      vi.spyOn(fs, 'readdir').mockRejectedValue(new Error('Access denied'));
      
      await expect(service.getUploadStats()).rejects.toThrow('Failed to get upload stats');
      
      vi.restoreAllMocks();
    });
  });
});