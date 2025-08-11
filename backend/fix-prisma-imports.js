import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const servicesDir = path.join(__dirname, 'src', 'services');

// List of services to update
const servicesToUpdate = [
  'notificationService.ts',
  'conversationIntelligence.ts',
  'workflowAdaptation.ts',
  'chat.ts',
  'emailUrgencyDetection.ts',
  'industryKnowledge.ts',
  'businessContext.ts',
  'onboardingService.ts',
  'scheduler.ts'
];

servicesToUpdate.forEach(file => {
  const filePath = path.join(servicesDir, file);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace PrismaClient import and instantiation with centralized db import
    content = content.replace(
      /import\s*{\s*PrismaClient\s*}\s*from\s*['"]@prisma\/client['"]\s*;?\s*\n+(?:.*\n)*?const\s+prisma\s*=\s*new\s+PrismaClient\(\)\s*;?/gm,
      "import { prisma } from '../db/index.js';"
    );
    
    // Also handle cases where they might be on separate lines
    content = content.replace(
      /import\s*{\s*PrismaClient\s*}\s*from\s*['"]@prisma\/client['"]\s*;?/g,
      "import { prisma } from '../db/index.js';"
    );
    
    content = content.replace(
      /const\s+prisma\s*=\s*new\s+PrismaClient\(\)\s*;?/g,
      ''
    );
    
    // Clean up extra newlines
    content = content.replace(/\n{3,}/g, '\n\n');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${file}`);
  }
});

console.log('Done updating service files!');
