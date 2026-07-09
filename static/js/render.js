/**
 * Targeted DOM Updates
 * Only updates changed elements, no full re-renders
 */

import { utils } from './state.js';
import { animateMetrics, animateCanvas } from './animations.js';

// Cache DOM references
const cache = {};

function getElements() {
  if (cache.elements) return cache.elements;
  
  cache.elements = {
    sheet: document.getElementById('sheet'),
    name: document.querySelector('.r-name'),
    contact: document.querySelector('.r-ctc'),
    summary: document.querySelector('.r-sum'),
    expContainer: document.querySelector('.r-exp-container'),
    eduContainer: document.querySelector('.r-edu-container'),
    skillsText: document.querySelector('.r-sk'),
    metricsContainer: document.getElementById('met'),
    downloadButton: document.getElementById('dlD'),
    downloadButtonMobile: document.getElementById('dlM'),
  };
  
  return cache.elements;
}

// Update name
export function updateName(name) {
  const el = getElements().name;
  if (el && el.textContent !== name) {
    el.classList.add('updating');
    setTimeout(() => {
      el.textContent = name;
      el.classList.remove('updating');
    }, 150);
  }
}

// Update contact info
export function updateContact(contact) {
  const el = getElements().contact;
  if (!el) return;
  
  const parts = [
    contact.loc,
    contact.em,
    contact.ph,
    contact.lk ? `in/${contact.lk}` : ''
  ].filter(Boolean);
  
  const html = parts
    .map(utils.esc)
    .join('<span class="bar">\u007c</span>');
  
  if (el.innerHTML !== html) {
    el.classList.add('updating');
    setTimeout(() => {
      el.innerHTML = html;
      el.classList.remove('updating');
    }, 150);
  }
}

// Update summary
export function updateSummary(summary) {
  const el = getElements().summary;
  if (el && el.textContent !== summary) {
    el.classList.add('updating');
    setTimeout(() => {
      el.textContent = utils.nb(utils.esc(summary));
      el.classList.remove('updating');
    }, 150);
  }
}

// Update experience (diff and patch)
export function updateExperience(experience) {
  const container = getElements().expContainer;
  if (!container) return;
  
  container.classList.add('updating');
  
  setTimeout(() => {
    const html = experience.map(job => `
      <div class="r-it">
        <div class="r-row">
          <span class="r-co">${utils.esc(job.co)}</span>
          <span class="r-dt">${utils.esc(job.dt)}</span>
        </div>
        <div class="r-role">${utils.esc(job.role)}</div>
        <ul class="r-ul">
          ${job.bl.map(b => `<li>${utils.nb(utils.esc(b))}</li>`).join('')}
        </ul>
      </div>
    `).join('');
    
    container.innerHTML = html;
    container.classList.remove('updating');
  }, 150);
}

// Update education
export function updateEducation(education) {
  const container = getElements().eduContainer;
  if (!container) return;
  
  container.classList.add('updating');
  
  setTimeout(() => {
    const html = education.map(edu => `
      <div class="r-it">
        <div class="r-row">
          <span class="r-co">${utils.esc(edu.sch)}</span>
          <span class="r-dt">${utils.esc(edu.dt)}</span>
        </div>
        <div class="r-row">
          <span class="r-role">${utils.esc(edu.deg)}</span>
          <span class="r-det">${utils.esc(edu.det)}</span>
        </div>
      </div>
    `).join('');
    
    container.innerHTML = html;
    container.classList.remove('updating');
  }, 150);
}

// Update skills
export function updateSkills(skills) {
  const el = getElements().skillsText;
  if (!el) return;
  
  const text = `<b>Skills: </b>${utils.esc(skills.join(', '))}`;
  
  if (el.innerHTML !== text) {
    el.classList.add('updating');
    setTimeout(() => {
      el.innerHTML = text;
      el.classList.remove('updating');
    }, 150);
  }
}

// Update metrics with odometer animation
export function updateMetrics(metrics) {
  const container = getElements().metricsContainer;
  if (!container) return;
  
  const html = Object.entries(metrics).map(([key, value]) => `
    <div class="metric">
      <div class="k">${utils.esc(key)}</div>
      <div class="v metric-value">
        <span class="metric-roll">${utils.esc(value)}</span>
      </div>
    </div>
  `).join('');
  
  container.innerHTML = html;
  
  // Trigger anime.js odometer animation
  animateMetrics();
}

// Update download button
export function updateDownloadButton(variant) {
  const href = utils.pdfHref(variant);
  const filename = href.split('/').pop();
  
  [getElements().downloadButton, getElements().downloadButtonMobile]
    .forEach(btn => {
      if (btn) {
        btn.href = href;
        btn.download = filename;
      }
    });
}

// Full render (initial load)
export function renderVariant(variant) {
  updateName(variant.d.name);
  updateContact(variant.d.ctc);
  updateSummary(variant.d.sum);
  updateExperience(variant.d.exp);
  updateEducation(variant.d.edu);
  updateSkills(variant.d.sk);
  updateMetrics(variant.m);
  updateDownloadButton(variant);
  
  // Trigger canvas animation
  animateCanvas();
}

// Targeted update (variant switch)
export function updateVariant(variant) {
  // Mark sheet as transitioning
  const sheet = getElements().sheet;
  if (sheet) {
    sheet.classList.add('canvas-transition');
    setTimeout(() => sheet.classList.remove('canvas-transition'), 600);
  }
  
  // Update all sections
  renderVariant(variant);
}
