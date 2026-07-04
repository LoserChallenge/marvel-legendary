#!/usr/bin/env node
/*
 * lint-card-data.js — the DB<->inventory content gate.
 *
 * The mechanical build checks (count matches, node --check, image path exists) verify STRUCTURE,
 * never field VALUES. A card entered with the wrong class, cost, attack, VP, or team passes all of
 * them (see docs/automation-readiness.md C6). This linter closes that gap: it reads the finalized
 * inventory (the authoritative reference per CLAUDE.md) and checks that cardDatabase.js matches it
 * field-by-field for the machine-comparable stats.
 *
 * Scope on purpose: STATS ONLY (cost / team / class / attack / recruit / fight / VP), not effect
 * TEXT. Effect correctness is covered by the specs + /expansion-audit; trying to diff prose here
 * would be noisy and unreliable. This is a stat linter.
 *
 * It is inventory-driven: every catalogued card must exist in the DB with matching stats. It matches
 * by NAME (not by position or count), so it survives the count-shape traps that break a naive
 * "count in DB == count in inventory" gate (docs/automation-readiness.md C2): 4 defs per hero,
 * transform cards, dual-class arrays, non-standard rarity splits. A row with no DB match, or a DB
 * card for a covered hero whose title isn't catalogued (e.g. a transform card), is REPORTED for a
 * human to eyeball rather than assumed wrong.
 *
 * Usage:
 *   node tools/lint-card-data.js <expansion-slug>   # e.g. secret-wars-vol1, revelations, heroes-of-asgard
 *   node tools/lint-card-data.js --all              # lint every docs/card-inventory/final/*.md
 * Exit 0 = clean, 1 = at least one stat mismatch or missing card, 2 = usage/load error.
 *
 * Bare `node` isn't on the Bash PATH here — use "C:\Program Files\nodejs\node.exe" tools/lint-card-data.js ...
 */

'use strict';
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'Legendary-Solo-Play-main', 'Legendary-Solo-Play-main', 'cardDatabase.js');
const INV_DIR = path.join(__dirname, '..', 'docs', 'card-inventory', 'final');

// --- Load cardDatabase.js -----------------------------------------------------------------------
// It's plain data but assigns to `window` at the end, so eval it with permissive browser-global
// stubs and hand back the arrays we care about.
function loadDB() {
  const src = fs.readFileSync(DB_PATH, 'utf8');
  const stub = new Proxy(function () {}, { get: () => stub, set: () => true, apply: () => stub, construct: () => stub });
  const load = new Function(
    'window', 'document', 'navigator', 'self', 'globalThis',
    src + '; return {heroes,villains,masterminds,henchmen,schemes,bystanders,sidekicks};'
  );
  return load(stub, stub, stub, stub, stub);
}

// --- Normalizers --------------------------------------------------------------------------------
const norm = (s) => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
// Match key: normalized + lowercased, so a card title casing variance ("Leap From Above" vs
// "Leap from Above") matches instead of reading as a MISSING card. Display always uses norm().
const k = (s) => norm(s).toLowerCase();

// Inventory class terminology -> DB class strings. The big one: inventory "Ranged" is DB "Range".
const CLASS_MAP = { Ranged: 'Range', Range: 'Range', Strength: 'Strength', Instinct: 'Instinct', Covert: 'Covert', Tech: 'Tech' };
function normClasses(cell) {
  const c = norm(cell);
  if (!c || c === '—' || c === '-') return [];
  return c.split('/').map((x) => {
    const t = norm(x);
    return CLASS_MAP[t] || t; // leave unknown as-is so it surfaces as a mismatch
  });
}

// Classify an Attack/Recruit inventory cell. Icon PRESENCE is notation-fragile: inventories are
// inconsistent on whether a zero-ish cell ("0", "0*", "0+") means "no icon" or "icon showing 0"
// (verified: Revelations "0" = no icon, but core-set/Dark City "0" = icon-showing-0). So only a
// POSITIVE value is a reliable "has an icon" signal; a bare "—" is a reliable "no icon"; anything
// that reduces to 0 is AMBIGUOUS and must not hard-fail the gate on icon presence alone.
//   kind: 'positive' (val>0, icon certain) | 'zero' (0-ish, icon ambiguous) | 'none' ("—", no icon)
function classifyCell(cell) {
  const c = norm(cell);
  if (!c || c === '—' || c === '-') return { kind: 'none', val: 0 };
  const n = parseInt(c.replace(/[^\d-]/g, ''), 10) || 0;
  return n === 0 ? { kind: 'zero', val: 0 } : { kind: 'positive', val: n };
}

// Compare one icon-bearing field (attack/recruit). The engine applies card.attack / card.recruit
// DIRECTLY and never reads attackIcon / recruitIcon for value application (those flags are display-
// only) — so the VALUE is what matters for correctness, and icon-presence is cosmetic. Thus:
//   - inventory positive N   -> DB value must equal N        (Supernova case: inv 4 vs db 0 = bug)
//   - inventory "—" / 0-ish  -> DB value must equal 0        (a nonzero DB value = card grants
//                                points the card shouldn't, regardless of the icon flag)
// The icon boolean itself is not gated (a value-correct card with a stray icon flag is a display
// nit the engine ignores). This keeps the check on the field the engine actually uses.
function checkIconField(who, field, cell, dbVal, dbIcon) {
  const { kind, val } = classifyCell(cell);
  const expected = kind === 'positive' ? val : 0;
  if (Number(dbVal) !== expected)
    report('MISMATCH', `${who}: ${field} inv=${kind === 'none' ? '—(0)' : expected} db=${dbVal}`);
}

// Fight Value cell ("6", "10*", "7+", "11+") -> base number the DB stores in `attack`. * and + are
// rules markers (Bribe/condition, scaling), not part of the base value.
function parseNum(cell) {
  const c = norm(cell);
  if (!c || c === '—' || c === '-') return null;
  const n = parseInt(c.replace(/[^\d-]/g, ''), 10);
  return Number.isNaN(n) ? null : n;
}

// --- Inventory table parsing --------------------------------------------------------------------
// Find the FIRST markdown table whose header row contains all `requiredCols` (case-insensitive),
// return its rows as objects keyed by lowercased header name. Locating by column signature (not by
// a "### Heroes" heading) avoids grabbing the effect-text sections that reuse the same headings.
function parseTable(lines, requiredCols) {
  const need = requiredCols.map((c) => c.toLowerCase());
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/^\s*\|/.test(line)) continue;
    const headers = line.split('|').map((h) => h.trim()).filter((h, idx, arr) => idx > 0 && idx < arr.length - 1 || h !== '');
    const hdrClean = line.split('|').slice(1, -1).map((h) => norm(h).toLowerCase());
    if (!need.every((n) => hdrClean.includes(n))) continue;
    // Next line must be the |---|---| separator.
    if (!/^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) continue;
    const rows = [];
    for (let j = i + 2; j < lines.length; j++) {
      if (!/^\s*\|/.test(lines[j])) break;
      const cells = lines[j].split('|').slice(1, -1).map((c) => norm(c));
      if (cells.length < hdrClean.length) continue;
      const row = {};
      hdrClean.forEach((h, idx) => { row[h] = cells[idx]; });
      rows.push(row);
    }
    return rows;
  }
  return [];
}

// Parse ALL tables matching a column signature (villains/henchmen are split into multiple tables,
// one per group), concatenating their rows.
function parseAllTables(lines, requiredCols) {
  const need = requiredCols.map((c) => c.toLowerCase());
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*\|/.test(lines[i])) continue;
    const hdrClean = lines[i].split('|').slice(1, -1).map((h) => norm(h).toLowerCase());
    if (!need.every((n) => hdrClean.includes(n))) continue;
    if (!/^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) continue;
    for (let j = i + 2; j < lines.length; j++) {
      if (!/^\s*\|/.test(lines[j])) { i = j; break; }
      const cells = lines[j].split('|').slice(1, -1).map((c) => norm(c));
      if (cells.length < hdrClean.length) continue;
      const row = {};
      hdrClean.forEach((h, idx) => { row[h] = cells[idx]; });
      out.push(row);
    }
  }
  return out;
}

// Locate a card type's stat table and return {rows, status}. Scoping by section heading (not columns
// alone) is required because villain and henchmen tables share the same column signature.
//
// GATE SAFETY: a section heading can drift ("### Masterminds (double-sided…)", "### Bystanders /
// Sidekicks") and an exact-match slicer would silently skip the whole type while reporting "OK" —
// the dangerous failure for a gate. So: match a heading by PREFIX (suffix-tolerant), consider EVERY
// matching section, and return the first that actually yields a stat table. Status is:
//   'found'           — a table was parsed (rows returned)
//   'heading-no-table'— a matching heading exists but NO parseable table under it (LOUD failure:
//                        format drift is hiding cards from the linter)
//   'no-heading'      — no matching heading at all (the expansion likely has none of this type)
function locateRows(lines, name, requiredCols, multi) {
  const target = name.toLowerCase();
  const slices = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^#{2,3}\s+(.+?)\s*$/);
    if (!m) continue;
    if (!norm(m[1]).toLowerCase().startsWith(target)) continue;
    let end = lines.length;
    for (let j = i + 1; j < lines.length; j++) { if (/^#{1,3}\s/.test(lines[j])) { end = j; break; } }
    slices.push(lines.slice(i, end));
  }
  if (!slices.length) return { rows: [], status: 'no-heading' };
  for (const s of slices) {
    const rows = multi ? parseAllTables(s, requiredCols) : parseTable(s, requiredCols);
    if (rows.length) return { rows, status: 'found' };
  }
  return { rows: [], status: 'heading-no-table' };
}

// Per-run coverage so silent-skip is impossible: every card type reports checked / none / UNCHECKED.
let coverage = [];
function recordStatus(type, status, count) {
  coverage.push({ type, status, count });
  if (status === 'heading-no-table')
    issues.push(`[UNCHECKED] ${type}: a section heading matched but no parseable stat table was found under it — a heading or column-format change is likely hiding cards from the linter. Fix the inventory format (or the linter) before trusting this run.`);
}

// Team comparison key: "—"/"None"/"" all mean teamless; collapse hyphens+spaces so "Spider-Friends"
// (inventory) and "Spider Friends" (DB) match, while genuinely different teams still differ.
function teamKey(s) {
  const t = norm(s);
  if (!t || t === '—' || t === '-' || t.toLowerCase() === 'none') return '';
  return t.replace(/[\s-]+/g, ' ').toLowerCase();
}

// --- DB indexing --------------------------------------------------------------------------------
function heroCardTitle(heroName, card) {
  const full = norm(card.name);
  const prefix = norm(heroName) + ' - ';
  return full.startsWith(prefix) ? full.slice(prefix.length) : full;
}

// --- Checkers -----------------------------------------------------------------------------------
const issues = [];
const infos = [];
// MISMATCH / MISSING / UNCHECKED fail the gate; info / REVIEW are advisory (non-failing).
function report(kind, msg) { (kind === 'info' || kind === 'REVIEW' ? infos : issues).push(`[${kind}] ${msg}`); }

function checkHeroes(inv, db) {
  const { rows, status } = locateRows(inv, 'Heroes', ['Hero', 'Card Title', 'Cost', 'Team', 'Class', 'Attack', 'Recruit'], false);
  recordStatus('Heroes', status, rows.length);
  if (!rows.length) return;
  // Index DB hero cards by "heroName :: title".
  const dbIndex = new Map();
  const coveredHeroTitles = new Map(); // heroName -> Set of titles present in DB
  for (const h of db.heroes) {
    for (const c of (h.cards || [])) {
      const title = heroCardTitle(h.name, c);
      dbIndex.set(k(h.name) + ' :: ' + k(title), c);
      if (!coveredHeroTitles.has(k(h.name))) coveredHeroTitles.set(k(h.name), new Set());
      coveredHeroTitles.get(k(h.name)).add(k(title));
    }
  }
  const invTitles = new Map(); // heroName -> Set (to detect DB extras like transform cards)
  for (const r of rows) {
    const hero = norm(r['hero']);
    const title = norm(r['card title']);
    if (!invTitles.has(k(hero))) invTitles.set(k(hero), new Set());
    invTitles.get(k(hero)).add(k(title));
    const card = dbIndex.get(k(hero) + ' :: ' + k(title));
    if (!card) { report('MISSING', `Hero card not found in DB: "${hero} - ${title}"`); continue; }
    // cost
    const invCost = parseNum(r['cost']);
    if (invCost !== null && Number(card.cost) !== invCost)
      report('MISMATCH', `${hero} - ${title}: cost inv=${invCost} db=${card.cost}`);
    // team (normalized: — / None / hyphen-vs-space collapse)
    if (teamKey(r['team']) && teamKey(card.team) !== teamKey(r['team']))
      report('MISMATCH', `${hero} - ${title}: team inv="${norm(r['team'])}" db="${norm(card.team)}"`);
    // classes (order-insensitive)
    const invCls = normClasses(r['class']).slice().sort();
    const dbCls = (card.classes || []).map(norm).slice().sort();
    if (JSON.stringify(invCls) !== JSON.stringify(dbCls))
      report('MISMATCH', `${hero} - ${title}: class inv=[${normClasses(r['class'])}] db=[${card.classes}]`);
    // attack + recruit (value reliable; icon-presence only when unambiguous — see checkIconField)
    checkIconField(`${hero} - ${title}`, 'attack', r['attack'], card.attack, Boolean(card.attackIcon));
    checkIconField(`${hero} - ${title}`, 'recruit', r['recruit'], card.recruit, Boolean(card.recruitIcon));
  }
  // DB cards for a covered hero whose title isn't catalogued (transform/extra) -> info, not error.
  for (const [hero, titles] of invTitles) {
    const dbTitles = coveredHeroTitles.get(hero);
    if (!dbTitles) continue;
    for (const t of dbTitles) if (!titles.has(t)) report('info', `DB has extra card for covered hero "${hero}": "${t}" (transform/variant? not in inventory)`);
  }
}

// Villains & henchmen share the same table shape and DB shape (group -> cards[] with attack/VP).
function checkVillainLike(inv, dbGroups, requiredCols, label, sectionName) {
  const { rows, status } = locateRows(inv, sectionName, requiredCols, true);
  recordStatus(label === 'Henchman' ? 'Henchmen' : label + 's', status, rows.length);
  if (!rows.length) return;
  const dbIndex = new Map(); // match name -> card
  // Villains nest cards under group.cards[]; henchmen are flat (each entry IS the card). Handle both.
  for (const g of dbGroups) for (const c of (Array.isArray(g.cards) ? g.cards : [g])) dbIndex.set(k(c.name), c);
  for (const r of rows) {
    const cardName = norm(r['card name']);
    const group = norm(r['group']);
    if (!cardName && !group) continue;
    // Location cards (e.g. Revelations "(Location)") are catalogued in the villain table but are a
    // distinct card type stored outside the villains array — not stat-linted here.
    if (/\(location\)/i.test(cardName)) { report('info', `${label} row is a Location card (distinct type, not stat-linted): "${cardName}"`); continue; }
    // Match by Card Name first (villains + multi-card henchmen like Mandarin's Rings), then fall back
    // to Group (standard single-card henchmen named by their group in the DB, e.g. "Doombot Legion").
    const card = dbIndex.get(k(cardName)) || dbIndex.get(k(group));
    if (!card) { report('MISSING', `${label} not found in DB: "${cardName || group}" (group ${group})`); continue; }
    const fv = parseNum(r['fight value']);
    if (fv !== null && Number(card.attack) !== fv)
      report('MISMATCH', `${label} ${name}: fight/attack inv=${fv} db=${card.attack}`);
    const vp = parseNum(r['vp']);
    if (vp !== null && Number(card.victoryPoints) !== vp)
      report('MISMATCH', `${label} ${name}: VP inv=${vp} db=${card.victoryPoints}`);
  }
}

function checkMasterminds(inv, db) {
  const { rows, status } = locateRows(inv, 'Masterminds', ['Name', 'Fight Value', 'VP'], false);
  recordStatus('Masterminds', status, rows.length);
  if (!rows.length) return;
  const dbIndex = new Map();
  for (const m of db.masterminds) dbIndex.set(k(m.name), m);
  for (const r of rows) {
    const name = norm(r['name']);
    if (!name) continue;
    const m = dbIndex.get(k(name));
    if (!m) { report('MISSING', `Mastermind not found in DB: "${name}"`); continue; }
    const fv = parseNum(r['fight value']);
    if (fv !== null && Number(m.attack) !== fv)
      report('MISMATCH', `Mastermind ${name}: fight/attack inv=${fv} db=${m.attack}`);
    const vp = parseNum(r['vp']);
    if (vp !== null && Number(m.victoryPoints) !== vp)
      report('MISMATCH', `Mastermind ${name}: VP inv=${vp} db=${m.victoryPoints}`);
  }
}

function checkBystanders(inv, db) {
  const { rows, status } = locateRows(inv, 'Bystanders', ['Card Name', 'VP'], false);
  recordStatus('Bystanders', status, rows.length);
  if (!rows.length) return;
  const dbIndex = new Map();
  for (const b of db.bystanders) dbIndex.set(k(b.name), b);
  for (const r of rows) {
    const name = norm(r['card name']);
    if (!name || !dbIndex.has(k(name))) continue; // bystanders table also matches sidekicks-ish; only check known ones
    const b = dbIndex.get(k(name));
    const vp = parseNum(r['vp']);
    if (vp !== null && b.victoryPoints !== undefined && Number(b.victoryPoints) !== vp)
      report('MISMATCH', `Bystander ${name}: VP inv=${vp} db=${b.victoryPoints}`);
  }
}

// --- Runner -------------------------------------------------------------------------------------
function lintOne(slug) {
  const mdPath = path.join(INV_DIR, slug + '.md');
  if (!fs.existsSync(mdPath)) { console.error(`No inventory file: ${mdPath}`); return 2; }
  const inv = fs.readFileSync(mdPath, 'utf8').split(/\r?\n/);
  const db = loadDB();

  issues.length = 0; infos.length = 0; coverage = [];
  checkHeroes(inv, db);
  checkVillainLike(inv, db.villains, ['Group', 'Card Name', 'Fight Value', 'VP'], 'Villain', 'Villains');
  checkVillainLike(inv, db.henchmen, ['Group', 'Card Name', 'Fight Value', 'VP'], 'Henchman', 'Henchmen');
  checkMasterminds(inv, db);
  checkBystanders(inv, db);

  console.log(`\n=== ${slug} ===`);
  // Coverage line first — always visible so "STATS OK" can never mean "checked nothing".
  const covStr = coverage.map((c) =>
    c.status === 'found' ? `${c.type} ✓${c.count}` : c.status === 'no-heading' ? `${c.type} —none` : `${c.type} ⚠UNCHECKED`
  ).join('  ');
  console.log('  coverage: ' + covStr);
  if (!issues.length) console.log('  STATS OK — no mismatches, missing cards, or unchecked types.');
  for (const it of issues) console.log('  ' + it);
  if (infos.length) { console.log('  --- info (review, not failures) ---'); for (const it of infos) console.log('  ' + it); }
  return issues.length ? 1 : 0;
}

function main() {
  const arg = process.argv[2];
  if (!arg) { console.error('Usage: node tools/lint-card-data.js <expansion-slug> | --all'); process.exit(2); }
  let slugs;
  if (arg === '--all') {
    slugs = fs.readdirSync(INV_DIR).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
  } else {
    slugs = [arg];
  }
  let worst = 0;
  for (const s of slugs) { const code = lintOne(s); if (code > worst) worst = code; }
  console.log('');
  process.exit(worst);
}

main();
