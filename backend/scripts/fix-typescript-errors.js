#!/usr/bin/env node

/**
 * Script to help fix common TypeScript errors in route files
 * Run: node scripts/fix-typescript-errors.js
 */

const fs = require('fs');
const path = require('path');

// Common replacements to fix TypeScript errors
const replacements = [
  // Fix import statements
  {
    pattern: /import { Request, Response(, NextFunction)? } from 'express';/g,
    replacement: "import { Request, Response, NextFunction } from '../types/express.js';"
  },
  // Fix route handler types in auth routes
  {
    pattern: /router\.(get|post|put|delete|patch)\((.*?), verifyKindeToken, asyncHandler\(async \((req|request), (res|response)\) => {/g,
    replacement: "router.$1($2, verifyKindeToken as any, asyncHandler(async (req: Request, res: Response) => {"
  },
  // Fix asyncHandler without auth
  {
    pattern: /asyncHandler\(async \((req|request), (res|response)\) => {/g,
    replacement: "asyncHandler(async (req: Request, res: Response) => {"
  },
  // Fix unused parameters
  {
    pattern: /\(req: Request, res: Response, next: NextFunction\)/g,
    replacement: "(req: Request, res: Response, _next: NextFunction)"
  },
  // Add return statements for routes that don't have them
  {
    pattern: /res\.status\((\d+)\)\.json\((.*?)\);(\s*})(?!\s*return)/g,
    replacement: "res.status($1).json($2);\n    return;$3"
  }
];

// Process a single file
function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  replacements.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Fixed: ${filePath}`);
  } else {
    console.log(`- No changes: ${filePath}`);
  }
}

// Process all route files
function processRoutes() {
  const routesDir = path.join(__dirname, '..', 'src', 'routes');
  const files = fs.readdirSync(routesDir)
    .filter(file => file.endsWith('.ts'))
    .map(file => path.join(routesDir, file));
  
  console.log(`Found ${files.length} route files to process\n`);
  
  files.forEach(processFile);
  
  console.log('\n✅ Done! Now run "npm run build" to check for remaining errors.');
}

// Run the script
if (require.main === module) {
  processRoutes();
}
