/**
 * Build Script - Compiles variants and generates static site
 * Pure JavaScript, no TypeScript, no Puppeteer
 */

import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔧 Building Polymath Resume Dossier...\n');

// Step 1: Validate
console.log('📋 Validating data...');
try {
  await import('./validate.js');
} catch (e) {
  console.error('❌ Validation failed');
  process.exit(1);
}

// Step 2: Load data
console.log('📦 Loading data files...');
const resume = JSON.parse(readFileSync('data/resume.json', 'utf-8'));
const variantsConfig = JSON.parse(readFileSync('data/variants.json', 'utf-8'));

// Step 3: Compile variants
console.log('⚙️  Compiling variants...');
const compiled = variantsConfig.variants.map(variant => {
  // Filter highlights for this variant
  const experience = resume.work
    .map(job => ({
      co: job.name,
      role: job.position,
      dt: formatDateRange(job.startDate, job.endDate),
      bl: job.highlights
        ?.filter(h => h.variants?.includes(variant.id))
        .map(h => h.text) || []
    }))
    .filter(job => job.bl.length > 0);

  // Filter skills
  const skills = resume.skills
    ?.filter(s => s.variants?.includes(variant.id))
    .flatMap(s => s.keywords) || [];

  // Format education
  const education = resume.education?.map(edu => ({
    sch: edu.institution,
    deg: `${edu.studyType}, ${edu.area}`,
    dt: formatDateRange(edu.startDate, edu.endDate),
    det: edu.summary || ''
  })) || [];

  const linkedin = resume.basics.profiles?.find(p => p.network === 'LinkedIn')?.username || '';
  const github = resume.basics.profiles?.find(p => p.network === 'GitHub')?.username || '';

  return {
    id: variant.id,
    role: variant.role,
    industry: variant.industry,
    tgt: variant.targeted,
    fb: variant.fallback,
    m: variant.metrics,
    d: {
      name: resume.basics.name,
      ctc: {
        loc: variant.location,
        em: resume.basics.email,
        ph: resume.basics.phone,
        lk: linkedin,
        gh: github
      },
      sum: variant.description,
      exp: experience,
      edu: education,
      sk: skills
    }
  };
});

console.log(`✓ Compiled ${compiled.length} variants\n`);

// Step 4: Generate data.js
console.log('📝 Generating static/js/data.js...');
mkdirSync('static/js', { recursive: true });
const dataScript = `/**
 * Compiled Variant Data
 * Generated: ${new Date().toISOString()}
 * Source: data/resume.json + data/variants.json
 */

export const VARIANTS = ${JSON.stringify(compiled, null, 2)};
`;
writeFileSync('static/js/data.js', dataScript);

// Step 5: Copy to dist
console.log('📋 Copying files to dist/...');
mkdirSync('dist', { recursive: true });

// Copy index.html
writeFileSync('dist/index.html', readFileSync('index.html'));

// Copy static folder
cpSync('static', 'dist/static', { recursive: true });

// Copy public assets
if (existsSync('public')) {
  cpSync('public', 'dist/public', { recursive: true });
  // Also copy resumes to root for clean URLs
  if (existsSync('public/resumes')) {
    cpSync('public/resumes', 'dist/resumes', { recursive: true });
  }
}

console.log('✅ Build complete!\n');
console.log(`📊 Summary:`);
console.log(`   • Variants: ${compiled.length}`);
console.log(`   • Data file: static/js/data.js`);
console.log(`   • Output: dist/`);
console.log(`   • Serve: bun run serve\n`);

// Helper functions
function formatDateRange(start, end) {
  const format = (dateStr) => {
    if (!dateStr) return 'Present';
    const d = new Date(dateStr);
    const month = d.toLocaleString('default', { month: 'short' });
    return `${month} ${d.getFullYear()}`;
  };
  return `${format(start)}\u2013${end ? format(end) : 'Present'}`;
}
