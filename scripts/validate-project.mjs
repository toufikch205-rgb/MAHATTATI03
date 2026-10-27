import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ignored = new Set(['.git', 'node_modules', '.vercel']);
const errors = [];
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile()) files.push(full);
  }
}

function rel(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function existsLocal(fromFile, reference) {
  const clean = reference.split(/[?#]/, 1)[0];
  if (!clean || clean.startsWith('#') || /^(?:https?:|data:|blob:|mailto:|tel:|javascript:)/i.test(clean)) return true;
  if (clean.startsWith('//')) return true;
  const decoded = decodeURIComponent(clean);
  const target = path.resolve(path.dirname(fromFile), decoded.replace(/^\//, ''));
  return fs.existsSync(target);
}

walk(root);

const jsFiles = files.filter(file => file.endsWith('.js') || file.endsWith('.mjs'));
for (const file of jsFiles) {
  try {
    // Parse only; do not execute application code or call external services.
    new Function(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    errors.push(`JS syntax: ${rel(file)} — ${error.message}`);
  }
}

const htmlFiles = files.filter(file => /\.html?$/i.test(file));
for (const file of htmlFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const ids = [...source.matchAll(/\bid=["']([^"']+)["']/gi)].map(match => match[1]);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) errors.push(`Duplicate id: ${rel(file)} — #${id}`);
    seen.add(id);
  }
  for (const match of source.matchAll(/\b(?:src|href)=["']([^"']+)["']/gi)) {
    const ref = match[1];
    if (!existsLocal(file, ref)) errors.push(`Missing HTML reference: ${rel(file)} — ${ref}`);
  }
}

const cssFiles = files.filter(file => file.endsWith('.css'));
for (const file of cssFiles) {
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(/@import\s+(?:url\()?\s*["']([^"']+)["']\s*\)?\s*;/gi)) {
    const ref = match[1];
    if (!existsLocal(file, ref)) errors.push(`Missing CSS import: ${rel(file)} — ${ref}`);
  }
}

console.log(`Static validation: ${jsFiles.length} JS files, ${htmlFiles.length} HTML files, ${cssFiles.length} CSS files.`);
if (errors.length) {
  console.error(errors.map((error, index) => `${index + 1}. ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS: JavaScript syntax, duplicate HTML IDs, local HTML references, and CSS imports.');
}
