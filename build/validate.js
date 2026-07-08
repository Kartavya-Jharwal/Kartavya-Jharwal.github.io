/**
 * Schema Validation for JSON Resume Data
 * Based on https://jsonresume.org/schema/
 */

import { readFileSync } from 'fs';

// Load data
const resume = JSON.parse(readFileSync('data/resume.json', 'utf-8'));
const variants = JSON.parse(readFileSync('data/variants.json', 'utf-8'));

const errors = [];
const warnings = [];

// Validate basics
if (!resume.basics?.name) errors.push('Missing basics.name');
if (!resume.basics?.email) errors.push('Missing basics.email');
if (!resume.basics?.email?.includes('@')) errors.push('Invalid email format');

// Validate work experience
if (!resume.work || resume.work.length === 0) {
  errors.push('No work experience found');
} else {
  resume.work.forEach((job, i) => {
    if (!job.name) errors.push(`work[${i}]: Missing company name`);
    if (!job.position) errors.push(`work[${i}]: Missing position`);
    if (!job.startDate) errors.push(`work[${i}]: Missing startDate`);
    
    if (job.highlights) {
      job.highlights.forEach((h, j) => {
        if (!h.text) errors.push(`work[${i}].highlights[${j}]: Missing text`);
        if (!h.variants || h.variants.length === 0) {
          errors.push(`work[${i}].highlights[${j}]: Must tag with variants`);
        }
        
        // Check for MBB-style metrics
        if (!/\d+%|\$\d+|\d+x|\d+\s*(million|billion|k|bps)/i.test(h.text)) {
          warnings.push(`work[${i}].highlights[${j}]: Lacks quantitative metrics`);
        }
      });
    }
  });
}

// Validate variants
const variantIds = new Set(variants.variants.map(v => v.id));
const referencedVariants = new Set();

resume.work.forEach(job => {
  job.highlights?.forEach(h => {
    h.variants?.forEach(vid => {
      referencedVariants.add(vid);
      if (!variantIds.has(vid)) {
        errors.push(`Unknown variant "${vid}" referenced in highlights`);
      }
    });
  });
});

resume.skills?.forEach(skill => {
  skill.variants?.forEach(vid => {
    if (!variantIds.has(vid)) {
      errors.push(`Unknown variant "${vid}" referenced in skills`);
    }
  });
});

// Check variant keyword compliance
variants.variants.forEach(variant => {
  const content = [];
  content.push(variant.description);
  
  resume.work.forEach(job => {
    job.highlights
      ?.filter(h => h.variants?.includes(variant.id))
      .forEach(h => content.push(h.text));
  });
  
  const text = content.join(' ').toLowerCase();
  const missing = variant.requiredKeywords?.filter(kw => 
    !text.includes(kw.toLowerCase())
  );
  
  if (missing?.length > 0) {
    warnings.push(`Variant "${variant.id}" missing keywords: ${missing.join(', ')}`);
  }
});

// Check weight distribution
const totalWeight = variants.variants.reduce((sum, v) => sum + v.weight, 0);
if (Math.abs(totalWeight - 100) > 0.1 && totalWeight > 0) {
  warnings.push(`Variant weights sum to ${totalWeight}%, expected 100%`);
}

// Report
console.log('\n=== RESUME VALIDATION ===\n');

if (errors.length > 0) {
  console.log('❌ ERRORS:');
  errors.forEach(e => console.log(`  • ${e}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  warnings.forEach(w => console.log(`  • ${w}`));
  console.log('');
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All validations passed!\n');
} else if (errors.length === 0) {
  console.log(`✅ Schema valid (${warnings.length} warnings)\n`);
} else {
  console.log(`❌ Validation failed (${errors.length} errors, ${warnings.length} warnings)\n`);
  process.exit(1);
}
