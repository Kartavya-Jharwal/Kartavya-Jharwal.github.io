#!/usr/bin/env bun
/** Lightweight integrity tests for the compiled browser payload. */

import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const variants = JSON.parse(readFileSync(resolve(ROOT, 'data/variants.json'), 'utf8')).variants;
const payload = readFileSync(resolve(ROOT, 'public/data.js'), 'utf8');
const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
const match = payload.match(/^\/\*[\s\S]*?\*\/\n\/\*[\s\S]*?\*\/\nwindow\.PROFILES = ([\s\S]+);\n$/);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(match, 'public/data.js does not match the generated payload format');
const profiles = JSON.parse(match[1]);

assert(profiles.length === variants.length, 'compiled profile count must match variant count');
assert(new Set(profiles.map(profile => profile.id)).size === profiles.length, 'compiled profile ids must be unique');
assert(profiles.some(profile => profile.targeted), 'at least one profile must be targeted');

const localReferences = [...html.matchAll(/(?:href|src)="([^"]+)"/g)]
  .map(match => match[1])
  .filter(reference => reference && !/^(?:https?:|#|mailto:|tel:)/.test(reference));
for (const reference of localReferences) {
  const path = reference.replace(/^\.\//, '').split(/[?#]/)[0];
  assert(existsSync(resolve(ROOT, path)), `index.html references missing local asset: ${reference}`);
}

for (const profile of profiles) {
  assert(profile.name && profile.role && profile.industry, `${profile.id}: identity fields are required`);
  assert(profile.summary, `${profile.id}: summary is required`);
  assert(profile.contact?.email, `${profile.id}: email is required`);
  assert(Array.isArray(profile.experience) && profile.experience.length > 0, `${profile.id}: experience is required`);
  assert(profile.experience.every(entry => entry.highlights?.length), `${profile.id}: each experience entry needs highlights`);
  assert(Array.isArray(profile.education) && profile.education.length > 0, `${profile.id}: education is required`);
  assert(profile.additional && Array.isArray(profile.additional.skills), `${profile.id}: skills must compile to an array`);
  assert(typeof profile.pdfAvailable === 'boolean', `${profile.id}: PDF availability must be explicit`);
  assert(!JSON.stringify(profile).includes('"score"'), `${profile.id}: compiler-only ranking fields leaked into output`);
}

const rebuilt = Bun.spawnSync(['bun', 'run', 'compile'], { cwd: ROOT });
assert(rebuilt.exitCode === 0, `deterministic rebuild failed: ${rebuilt.stderr.toString()}`);
const secondPayload = readFileSync(resolve(ROOT, 'public/data.js'), 'utf8');
assert(secondPayload === payload, 'compiler output must be deterministic for unchanged sources');

console.log(`✓ ${profiles.length} compiled profiles passed integrity and deterministic-build tests`);
