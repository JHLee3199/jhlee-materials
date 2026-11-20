import { randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const activities = fileURLToPath(new URL('../activities/', import.meta.url));
const pagePath = join(activities, 'index.html');
const startMarker = '<!-- hobby-albums:start -->';
const endMarker = '<!-- hobby-albums:end -->';
const extensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
const hobbies = JSON.parse(await readFile(join(activities, 'hobbies.json'), 'utf8'));

function escapeHtml(text) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return text.replace(/[&<>"']/g, char => entities[char]);
}

function albumRegion(page) {
  const start = page.indexOf(startMarker);
  const end = page.indexOf(endMarker);
  if (start < 0 || end < start + startMarker.length ||
      start !== page.lastIndexOf(startMarker) || end !== page.lastIndexOf(endMarker)) {
    throw new Error('Expected one hobby-albums:start marker followed by one hobby-albums:end marker.');
  }
  return [start + startMarker.length, end];
}

function contentUrl(value) {
  const url = new URL(value, 'https://example.org/activities/');
  if (!['https:', 'http:'].includes(url.protocol)) {
    throw new Error(`Unsupported hobby link: ${value}`);
  }
  return escapeHtml(value);
}

function entryHtml(entry, shareLinks) {
  const title = escapeHtml(entry.title);
  const heading = entry.url ? `<a href="${contentUrl(entry.url)}">${title}</a>` : `<strong>${title}</strong>`;
  const parts = [`        <li>${heading}`];
  if (entry.detail) parts.push(`          <span class="entry-detail">${escapeHtml(entry.detail)}</span>`);
  if (entry.note) parts.push(`          <p>${escapeHtml(entry.note)}</p>`);
  if (entry.rating != null) {
    if (!Number.isFinite(entry.rating) || entry.rating < 0 || entry.rating > 5) {
      throw new Error(`Expected a rating from 0 to 5 for "${entry.title}".`);
    }
    parts.push(`          <p class="entry-rating">Rating ${entry.rating}/5</p>`);
  }
  if (entry.recording) parts.push(`          <audio controls preload="none" src="${contentUrl(entry.recording)}" aria-label="${title} recording"></audio>`);
  if (entry.source) parts.push(`          <a href="${contentUrl(entry.source)}">Source code</a>`);
  if (shareLinks && (entry.url || entry.source)) {
    parts.push('          <button type="button" data-copy-project hidden>Copy project link</button>',
               '          <span class="project-share-status" role="status"></span>');
  }
  parts.push('        </li>');
  return parts.join('\n');
}

async function photoGallery(slug, name) {
  const directory = join(activities, 'photos', slug);
  await mkdir(directory, { recursive: true });
  const entries = await readdir(directory, { withFileTypes: true });
  const files = entries
    .filter(entry => entry.isFile() && extensions.has(extname(entry.name).toLowerCase()))
    .map(entry => entry.name)
    .sort();
  if (!files.length) return '';
  const lines = ['      <div class="album-photos">'];
  for (const file of files) {
    const url = escapeHtml(`photos/${slug}/${encodeURIComponent(file)}`);
    const title = file.slice(0, -extname(file).length).replace(/[-_]+/g, ' ').trim();
    const label = escapeHtml(title || `${name} photo`);
    lines.push(`        <a href="${url}" aria-label="View ${label} at full size"><img src="${url}" loading="lazy" decoding="async" alt="${label}"></a>`);
  }
  lines.push('      </div>');
  return lines.join('\n');
}

async function collectionHtml({slug, name, entries, photos, shareLinks}, grouped) {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`Invalid hobby folder name: ${slug}`);
  const parts = [];
  if (entries.length) {
    parts.push('      <ul class="hobby-entries">', ...entries.map(entry => entryHtml(entry, shareLinks)), '      </ul>');
  }
  const gallery = photos ? await photoGallery(slug, name) : '';
  if (gallery) parts.push(gallery);
  if (grouped && parts.length) {
    parts.unshift(`      <h3 class="hobby-subheading" id="album-${slug}">${escapeHtml(name)}</h3>`);
  }
  return parts.join('\n');
}

async function hobbyHtml(hobby) {
  const collections = hobby.collections || [hobby];
  const sections = await Promise.all(collections.map(item => collectionHtml(item, Boolean(hobby.collections))));
  const content = sections.filter(Boolean).join('\n');
  const heading = `<strong>${escapeHtml(hobby.name)}</strong><small>${escapeHtml(hobby.format)}</small>`;
  const lines = [`  <article class="hobby-album" id="album-${escapeHtml(hobby.slug)}">`];
  if (content) {
    lines.push('    <details>', `      <summary class="hobby-heading">${heading}</summary>`);
    lines.push(content, '    </details>');
  } else {
    lines.push(`    <div class="hobby-heading">${heading}</div>`);
  }
  lines.push('  </article>');
  return lines.join('\n');
}

albumRegion(await readFile(pagePath, 'utf8'));
const content = await Promise.all(hobbies.map(hobbyHtml));
const page = await readFile(pagePath, 'utf8');
const [start, end] = albumRegion(page);
const newline = page.includes('\r\n') ? '\r\n' : '\n';
const block = ['', '<div class="hobby-albums">', ...content, '</div>', ''].join('\n');
const updated = page.slice(0, start) + block.replaceAll('\n', newline) + page.slice(end);
if (updated !== page) {
  const temporary = join(activities, `.hobby-albums-${randomUUID()}.tmp`);
  try {
    await writeFile(temporary, updated, { flag: 'wx' });
    await rename(temporary, pagePath);
  } finally {
    await rm(temporary, { force: true });
  }
}
