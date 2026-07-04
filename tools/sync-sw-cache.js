#!/usr/bin/env node
/*
 * sync-sw-cache.js — keep sw.js honest before a deploy.
 *
 * Two jobs, both aimed at the #1 deploy bug ("changes don't show on GitHub Pages"):
 *   1. Bump CACHE_NAME ('legendary-vN' -> 'legendary-v{N+1}') so every push forces
 *      browsers/iPads to re-cache instead of serving the old game.
 *   2. Rebuild FILES_TO_CACHE to exactly mirror the files actually shipped under the
 *      game root, so a newly-added expansion JS or card-art file is never left
 *      un-cached (offline/PWA) because someone forgot to hand-add it.
 *
 * Source of truth = the files on disk under the game root. The repo commits its assets,
 * so disk == what GitHub Pages serves (verified: git-tracked set equals the working tree).
 * sw.js excludes ITSELF from the cache (a service worker must never cache itself, or the
 * browser can't detect the next update) and skips dotfiles / OS junk.
 *
 * Usage:
 *   node tools/sync-sw-cache.js            # bump CACHE_NAME + rewrite FILES_TO_CACHE, report the diff
 *   node tools/sync-sw-cache.js --check    # report drift only; DO NOT write. Exit 1 if the file list is stale.
 *                                          # (--check ignores the version bump; it only asks "is the list in sync?")
 *
 * Plain node with no dependencies. On this machine bare `node` isn't on the Bash PATH —
 * invoke with the full path if needed: "C:\Program Files\nodejs\node.exe" tools/sync-sw-cache.js
 */

'use strict';
const fs = require('fs');
const path = require('path');

// --- Fixed layout constants (this repo) ---------------------------------------------------------
// Game root on disk, relative to this script (tools/ is at the project root, outside the game root).
const GAME_ROOT = path.join(__dirname, '..', 'Legendary-Solo-Play-main', 'Legendary-Solo-Play-main');
const SW_PATH = path.join(GAME_ROOT, 'sw.js');
// Deployed URL prefix: GitHub Pages serves the repo at /marvel-legendary/, the game lives in the
// nested folder. Every cached file URL is this base + its path (relative to the game root).
const URL_BASE = '/marvel-legendary/Legendary-Solo-Play-main/Legendary-Solo-Play-main/';
// Two navigational URLs that are NOT files on disk (repo landing + game dir -> serves index.html).
// Always kept, always first.
const NAV_URLS = [
  '/marvel-legendary/',
  URL_BASE,
];
// Basenames never cached: the service worker itself, plus OS/editor junk.
const EXCLUDE_BASENAMES = new Set(['sw.js', 'Thumbs.db', 'desktop.ini', '.DS_Store']);

// --- Helpers ------------------------------------------------------------------------------------

// Recursively collect every file path under `dir`, returned relative to `dir` with '/' separators.
function walk(dir, prefix = '') {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue; // dotfiles / dot-dirs
    const rel = prefix ? prefix + '/' + entry.name : entry.name;
    if (entry.isDirectory()) {
      out.push(...walk(path.join(dir, entry.name), rel));
    } else if (entry.isFile()) {
      if (EXCLUDE_BASENAMES.has(entry.name)) continue;
      out.push(rel);
    }
  }
  return out;
}

// Encode a game-root-relative path into a cache URL. Use encodeURI (NOT per-segment
// encodeURIComponent) so the cache KEY matches the URL the game actually requests at runtime:
// the audio engine fetches via encodeURI (script.js), and <img src> literal spaces get browser-
// encoded the same way. encodeURI leaves ',' literal and preserves '/', so a filename like
// "Skrulls, Kree and Cosmic Rays.m4a" caches under the same key the game asks for (a per-segment
// encoder would store it as %2C and cause an offline cache MISS on those tracks).
// Apostrophes stay literal under encodeURI (correct for matching); backslash-escape them so they
// don't break the single-quoted JS string literal (none exist today; cheap insurance that keeps
// the character literal, unlike %27 which would re-introduce a mismatch).
function toCacheUrl(relPath) {
  const encoded = encodeURI(relPath).replace(/'/g, "\\'");
  return URL_BASE + encoded;
}

// Build the full desired FILES_TO_CACHE list: nav URLs first, then every file sorted for stable diffs.
function buildDesiredList() {
  const files = walk(GAME_ROOT).map(toCacheUrl);
  files.sort((a, b) => a.localeCompare(b));
  return [...NAV_URLS, ...files];
}

// Pull the current array's string entries out of the sw.js source text.
function parseCurrentList(src) {
  const m = src.match(/const FILES_TO_CACHE = \[([\s\S]*?)\];/);
  if (!m) throw new Error('Could not find FILES_TO_CACHE array in sw.js');
  const entries = [];
  const re = /'([^']*)'/g;
  let hit;
  while ((hit = re.exec(m[1])) !== null) entries.push(hit[1]);
  return entries;
}

function diff(current, desired) {
  const curSet = new Set(current);
  const desSet = new Set(desired);
  const added = desired.filter((x) => !curSet.has(x));   // real files not yet cached
  const removed = current.filter((x) => !desSet.has(x)); // cached paths that no longer exist on disk
  return { added, removed };
}

// --- Main ---------------------------------------------------------------------------------------

function main() {
  const checkOnly = process.argv.includes('--check');

  let src = fs.readFileSync(SW_PATH, 'utf8');

  const verMatch = src.match(/const CACHE_NAME = 'legendary-v(\d+)'/);
  if (!verMatch) {
    console.error("ERROR: could not find CACHE_NAME = 'legendary-vN' in sw.js");
    process.exit(2);
  }
  const oldVer = parseInt(verMatch[1], 10);
  const newVer = oldVer + 1;

  const current = parseCurrentList(src);
  const desired = buildDesiredList();
  const { added, removed } = diff(current, desired);
  const listChanged = added.length > 0 || removed.length > 0;

  // Report
  console.log('sync-sw-cache');
  console.log('  game root : ' + GAME_ROOT);
  console.log('  files on disk cached : ' + (desired.length - NAV_URLS.length) + ' (+' + NAV_URLS.length + ' nav URLs)');
  console.log('  current list entries : ' + current.length);
  console.log('');
  console.log('  ADDED (' + added.length + ' file' + (added.length === 1 ? '' : 's') + ' newly cached):');
  for (const a of added) console.log('    + ' + a);
  console.log('  REMOVED (' + removed.length + ' stale path' + (removed.length === 1 ? '' : 's') + ' dropped):');
  for (const r of removed) console.log('    - ' + r);
  console.log('');

  if (checkOnly) {
    if (listChanged) {
      console.log('DRIFT: FILES_TO_CACHE is out of sync with disk (' + added.length + ' to add, ' + removed.length + ' to remove). Run without --check to fix.');
      process.exit(1);
    }
    console.log('IN SYNC: FILES_TO_CACHE matches disk. (CACHE_NAME would bump ' + oldVer + ' -> ' + newVer + ' on a real run.)');
    process.exit(0);
  }

  // Write mode: bump version + rewrite array.
  src = src.replace(/(const CACHE_NAME = 'legendary-v)\d+(')/, `$1${newVer}$2`);

  const body = desired.map((e) => `  '${e}'`).join(',\n');
  const newArray = 'const FILES_TO_CACHE = [\n' + body + '\n];';
  src = src.replace(/const FILES_TO_CACHE = \[[\s\S]*?\];/, newArray);

  fs.writeFileSync(SW_PATH, src);
  console.log('WROTE sw.js: CACHE_NAME ' + oldVer + ' -> ' + newVer + ', ' + desired.length + ' cache entries (' + added.length + ' added, ' + removed.length + ' removed).');
}

main();
