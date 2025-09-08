#!/usr/bin/env node

/**
 * CI/CD Pipeline Validation Script
 * 
 * This script validates the CI/CD setup and reports on the implementation
 * status of all required components for automated testing and coverage.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CIPipelineValidator {
  constructor() {
    this.rootDir = path.join(__dirname, '..');
    this.results = {
      workflows: {},
      configurations: {},
      scripts: {},
      thresholds: {},
      performance: {},
      security: {}
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',    // cyan
      success: '\x1b[32m', // green
      warning: '\x1b[33m', // yellow
      error: '\x1b[31m',   // red
      reset: '\x1b[0m'
    };
    
    const icon = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    console.log(`${colors[type]}${icon[type]} ${message}${colors.reset}`);
  }

  checkFileExists(filePath) {
    const fullPath = path.join(this.rootDir, filePath);
    return fs.existsSync(fullPath);
  }

  checkWorkflowFiles() {
    this.log('Validating GitHub Actions Workflows...', 'info');
    
    const workflows = [
      { name: 'Main CI/CD Pipeline', file: '.github/workflows/ci.yml' },
      { name: 'Coverage Reporting', file: '.github/workflows/coverage.yml' },
      { name: 'Performance Testing', file: '.github/workflows/performance.yml' },
      { name: 'Quality Gates', file: '.github/workflows/quality-gates.yml' }
    ];

    workflows.forEach(workflow => {
      const exists = this.checkFileExists(workflow.file);
      this.results.workflows[workflow.name] = exists;
      
      if (exists) {
        this.log(`${workflow.name}: ✅ Found`, 'success');
      } else {
        this.log(`${workflow.name}: ❌ Missing`, 'error');
      }
    });
  }

  checkViTestConfiguration() {
    this.log('Validating Vitest Configuration...', 'info');
    
    const configs = [
      { name: 'Root Vitest Config', file: 'vitest.config.ts' },
      { name: 'Backend Config', file: 'backend/vitest.config.ts' },
      { name: 'Frontend Config', file: 'frontend/vitest.config.ts' },
      { name: 'Shared Config', file: 'shared/vitest.config.ts' }
    ];

    configs.forEach(config => {
      const exists = this.checkFileExists(config.file);
      this.results.configurations[config.name] = exists;
      
      if (exists) {
        this.log(`${config.name}: ✅ Found`, 'success');
        
        // Check for coverage configuration
        try {
          const content = fs.readFileSync(path.join(this.rootDir, config.file), 'utf8');
          const hasCoverage = content.includes('coverage');
          const hasThresholds = content.includes('thresholds');
          const hasLcov = content.includes('lcov');
          
          if (hasCoverage) this.log(`  - Coverage reporting: ✅`, 'success');
          if (hasThresholds) this.log(`  - Coverage thresholds: ✅`, 'success');
          if (hasLcov) this.log(`  - LCOV format: ✅`, 'success');
          
        } catch (error) {
          this.log(`  - Error reading config: ${error.message}`, 'warning');
        }
      } else {
        this.log(`${config.name}: ❌ Missing`, 'error');
      }
    });
  }

  checkPackageScripts() {
    this.log('Validating Package Scripts...', 'info');
    
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.rootDir, 'package.json'), 'utf8')
      );
      
      const requiredScripts = [
        'test',
        'test:coverage',
        'test:backend',
        'test:frontend', 
        'test:shared',
        'lint',
        'type-check'
      ];
      
      requiredScripts.forEach(script => {
        const exists = packageJson.scripts && packageJson.scripts[script];
        this.results.scripts[script] = exists;
        
        if (exists) {
          this.log(`${script}: ✅ Found`, 'success');
        } else {
          this.log(`${script}: ❌ Missing`, 'error');
        }
      });
      
    } catch (error) {
      this.log(`Error reading package.json: ${error.message}`, 'error');
    }
  }

  checkCoverageThresholds() {
    this.log('Validating Coverage Thresholds...', 'info');
    
    const thresholdConfigs = [
      { name: 'Backend', file: 'backend/vitest.config.ts', target: { lines: 80, functions: 80, branches: 75, statements: 80 } },
      { name: 'Frontend', file: 'frontend/vitest.config.ts', target: { lines: 70, functions: 70, branches: 70, statements: 70 } },
      { name: 'Shared', file: 'shared/vitest.config.ts', target: { lines: 90, functions: 90, branches: 85, statements: 90 } }
    ];
    
    thresholdConfigs.forEach(config => {
      try {
        const content = fs.readFileSync(path.join(this.rootDir, config.file), 'utf8');
        
        const hasThresholds = content.includes('thresholds');
        if (hasThresholds) {
          this.log(`${config.name} thresholds: ✅ Configured`, 'success');
          this.results.thresholds[config.name] = true;
          
          // Check specific threshold values
          Object.entries(config.target).forEach(([metric, value]) => {
            if (content.includes(`${metric}: ${value}`)) {
              this.log(`  - ${metric}: ${value}% ✅`, 'success');
            }
          });
        } else {
          this.log(`${config.name} thresholds: ❌ Missing`, 'error');
          this.results.thresholds[config.name] = false;
        }
        
      } catch (error) {
        this.log(`${config.name}: Error reading config`, 'error');
        this.results.thresholds[config.name] = false;
      }
    });
  }

  checkSecurityConfiguration() {
    this.log('Validating Security Configuration...', 'info');
    
    const ciContent = this.checkFileExists('.github/workflows/ci.yml') 
      ? fs.readFileSync(path.join(this.rootDir, '.github/workflows/ci.yml'), 'utf8')
      : '';
    
    const securityFeatures = [
      { name: 'npm audit', check: 'npm audit' },
      { name: 'TruffleHog secret scanning', check: 'trufflesecurity/trufflehog' },
      { name: 'CodeQL analysis', check: 'github/codeql-action' },
      { name: 'Dependency scanning', check: 'depcheck' }
    ];
    
    securityFeatures.forEach(feature => {
      const exists = ciContent.includes(feature.check);
      this.results.security[feature.name] = exists;
      
      if (exists) {
        this.log(`${feature.name}: ✅ Configured`, 'success');
      } else {
        this.log(`${feature.name}: ❌ Missing`, 'warning');
      }
    });
  }

  generateReport() {
    this.log('\n=== CI/CD PIPELINE VALIDATION REPORT ===', 'info');
    
    const sections = [
      { name: 'Workflows', data: this.results.workflows },
      { name: 'Configurations', data: this.results.configurations },
      { name: 'Package Scripts', data: this.results.scripts },
      { name: 'Coverage Thresholds', data: this.results.thresholds },
      { name: 'Security Features', data: this.results.security }
    ];
    
    sections.forEach(section => {
      const total = Object.keys(section.data).length;
      const passed = Object.values(section.data).filter(Boolean).length;
      const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
      
      this.log(`\n${section.name}: ${passed}/${total} (${percentage}%)`, 
        percentage === 100 ? 'success' : percentage >= 80 ? 'warning' : 'error');
      
      Object.entries(section.data).forEach(([key, value]) => {
        this.log(`  ${key}: ${value ? '✅' : '❌'}`, value ? 'success' : 'error');
      });
    });
    
    // Overall status
    const allResults = Object.values(this.results).flatMap(section => Object.values(section));
    const totalPassed = allResults.filter(Boolean).length;
    const totalChecks = allResults.length;
    const overallPercentage = Math.round((totalPassed / totalChecks) * 100);
    
    this.log(`\n=== OVERALL STATUS: ${totalPassed}/${totalChecks} (${overallPercentage}%) ===`, 
      overallPercentage >= 90 ? 'success' : overallPercentage >= 70 ? 'warning' : 'error');
    
    return {
      passed: totalPassed,
      total: totalChecks,
      percentage: overallPercentage,
      status: overallPercentage >= 90 ? 'EXCELLENT' : overallPercentage >= 70 ? 'GOOD' : 'NEEDS_WORK'
    };
  }

  run() {
    this.log('🚀 Starting CI/CD Pipeline Validation...', 'info');
    
    this.checkWorkflowFiles();
    this.checkViTestConfiguration();
    this.checkPackageScripts();
    this.checkCoverageThresholds();
    this.checkSecurityConfiguration();
    
    const report = this.generateReport();
    
    if (report.status === 'EXCELLENT') {
      this.log('\n🎉 CI/CD Pipeline is excellently configured!', 'success');
    } else if (report.status === 'GOOD') {
      this.log('\n👍 CI/CD Pipeline is well configured with minor improvements needed.', 'warning');
    } else {
      this.log('\n⚠️  CI/CD Pipeline needs significant improvements.', 'error');
    }
    
    return report;
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  const validator = new CIPipelineValidator();
  const report = validator.run();
  process.exit(report.status === 'NEEDS_WORK' ? 1 : 0);
}

module.exports = CIPipelineValidator;