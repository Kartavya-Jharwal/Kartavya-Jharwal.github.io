/**
 * Simple tests for build validation
 * No TypeScript, just assertions
 */

import { readFileSync } from 'fs';

console.log('🧪 Running build tests...\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    passed++;
  } else {
    console.log(`✗ ${message}`);
    failed++;
  }
}

// Load data
const resume = JSON.parse(readFileSync('data/resume.json', 'utf-8'));
const variants = JSON.parse(readFileSync('data/variants.json', 'utf-8'));

// Test 1: JSON Resume basics
assert(resume.basics?.name, 'Resume has basics.name');
assert(resume.basics?.email?.includes('@'), 'Resume has valid email');
assert(Array.isArray(resume.work), 'Resume has work array');

// Test 2: Variants structure
assert(Array.isArray(variants.variants), 'Variants is an array');
assert(variants.variants.length > 0, 'At least one variant exists');

// Test 3: All variants have required fields
variants.variants.forEach(v => {
  assert(v.id, `Variant ${v.id || '?'} has ID`);
  assert(v.role, `Variant ${v.id} has role`);
  assert(v.industry, `Variant ${v.id} has industry`);
  assert(v.pdfFilename, `Variant ${v.id} has pdfFilename`);
});

// Test 4: Unique variant IDs
const ids = variants.variants.map(v => v.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === ids.length, 'All variant IDs are unique');

// Test 5: At least one targeted variant
const hasTargeted = variants.variants.some(v => v.targeted);
assert(hasTargeted, 'At least one variant is targeted');

// Test 6: Exactly one fallback variant
const fallbacks = variants.variants.filter(v => v.fallback);
assert(fallbacks.length === 1, 'Exactly one fallback variant');
assert(fallbacks[0]?.id === 'all', 'Fallback variant is "all"');

// Test 7: Valid variant references
const validIds = new Set(ids);
let allRefsValid = true;

resume.work?.forEach(job => {
  job.highlights?.forEach(h => {
    h.variants?.forEach(vid => {
      if (!validIds.has(vid)) {
        console.log(`  ⚠️  Unknown variant "${vid}" in highlights`);
        allRefsValid = false;
      }
    });
  });
});

assert(allRefsValid, 'All variant references are valid');

// Summary
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}
