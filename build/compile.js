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

// Step 4: Generate HTML
console.log('📝 Generating static HTML...');
const template = readFileSync('index.html', 'utf-8');

// Inject compiled data into the script tag
const dataScript = generateDataScript(compiled);
const scriptStart = template.indexOf('<script>');
const scriptEnd = template.indexOf('</script>') + '</script>'.length;

if (scriptStart === -1 || scriptEnd === -1) {
  throw new Error('Could not find script tag in index.html');
}

const output = 
  template.slice(0, scriptStart) +
  `<script>\n${dataScript}\n` +
  template.slice(scriptStart + '<script>'.length + 1, scriptEnd);

// Write to dist
mkdirSync('dist', { recursive: true });
writeFileSync('dist/index.html', output);

// Step 5: Copy assets
console.log('📋 Copying assets...');
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
console.log(`   • Output: dist/index.html`);
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

function generateDataScript(variants) {
  return `/* Data compiled from JSON Resume schema - ${new Date().toISOString()} */
var P = ${JSON.stringify(variants, null, 2)};

/* Utilities */
var H = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' };
function esc(s) { return String(s).replace(/[&<>"]/g, function(c){ return H[c]; }); }
function nb(s) { return s.replace(/(\\d)\\s+(?=[A-Za-z%$€£])/g, '$1\\u00a0'); }
function slug(s) { return s.replace(/\\s+/g,'_').replace(/[^\\w]/g,''); }
function pdfName(p) { return 'Alex_Polymath_Resume_'+slug(p.role)+'_'+slug(p.industry)+'.pdf'; }
function pdfHref(p) { return 'resumes/'+pdfName(p); }
function track(ev, obj) { 
  try { 
    if (window.gtag) window.gtag('event', ev, obj);
    else console.log('[telemetry]', ev, obj); 
  } catch(e){} 
}

var cur = null;
function byId(id) { return P.find(p => p.id === id); }
function roles() { 
  const seen = {};
  return P.filter(p => !seen[p.role] && (seen[p.role] = true)).map(p => p.role);
}
function industries(role) { return P.filter(p => p.role === role).map(p => p.industry); }

function pickInit() {
  const sp = new URLSearchParams(location.search);
  const r = sp.get('role'), ind = sp.get('industry');
  
  // Deep linking
  if (r && ind) {
    const match = P.find(p => 
      p.role.toLowerCase() === r.toLowerCase() && 
      p.industry.toLowerCase() === ind.toLowerCase()
    );
    if (match) {
      track('deeplink', {pair: match.id});
      return match;
    }
  }
  
  // Weighted randomization
  const targeted = P.filter(p => p.tgt);
  if (targeted.length === 0) return P[0];
  
  const pick = targeted[Math.floor(Math.random() * targeted.length)];
  track('cold_visit', {pair: pick.id});
  return pick;
}`;
}
